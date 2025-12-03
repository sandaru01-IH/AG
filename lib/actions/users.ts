"use server";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Cache the user lookup for the request
export const getCurrentUser = cache(async () => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    const { data: userData, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error || !userData) {
      return null;
    }

    return userData;
  } catch (error: any) {
    return null;
  }
});

export async function isCoFounder() {
  const user = await getCurrentUser();
  return user?.role === "co_founder";
}

export async function getAllUsers() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user || user.role !== "co_founder") {
    return [];
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getUsersByRole(role: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("role", role)
    .eq("is_active", true);

  if (error) throw error;
  return data || [];
}

// New function to get user-specific financial stats
export async function getUserFinancialStats(userId: string, year: number, month: number) {
  const supabase = await createClient();
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

  const [paymentsResult, expensesResult, incomeResult] = await Promise.all([
    // Get payments received by user
    supabase
      .from("worker_payments")
      .select("amount, payment_date, projects(name)")
      .eq("worker_id", userId)
      .eq("approval_status", "approved")
      .gte("payment_date", startDate)
      .lte("payment_date", endDate),
    // Get expenses created by user
    supabase
      .from("expense_records")
      .select("amount, category, transaction_date")
      .eq("created_by", userId)
      .eq("approval_status", "approved")
      .gte("transaction_date", startDate)
      .lte("transaction_date", endDate),
    // Get income created by user (for co-founders)
    supabase
      .from("income_records")
      .select("amount, net_amount, transaction_date, income_sources(name)")
      .eq("created_by", userId)
      .eq("approval_status", "approved")
      .gte("transaction_date", startDate)
      .lte("transaction_date", endDate),
  ]);

  const payments = paymentsResult.data || [];
  const expenses = expensesResult.data || [];
  const income = incomeResult.data || [];

  const totalPayments = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalIncome = income.reduce((sum, i) => {
    const amount = i.net_amount !== null ? Number(i.net_amount) : Number(i.amount);
    return sum + amount;
  }, 0);

  return {
    payments,
    expenses,
    income,
    totalPayments,
    totalExpenses,
    totalIncome,
  };
}

// Get user's yearly income stats
export async function getUserYearlyIncome(userId: string, year: number) {
  const supabase = await createClient();
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const { data, error } = await supabase
    .from("income_records")
    .select("amount, net_amount, transaction_date, income_sources(name)")
    .eq("created_by", userId)
    .eq("approval_status", "approved")
    .gte("transaction_date", startDate)
    .lte("transaction_date", endDate)
    .order("transaction_date", { ascending: false });

  if (error) throw error;

  const totalIncome = (data || []).reduce((sum, i) => {
    const amount = i.net_amount !== null ? Number(i.net_amount) : Number(i.amount);
    return sum + amount;
  }, 0);

  return {
    income: data || [],
    totalIncome,
  };
}

// Function to update user profile
export async function updateUserProfile(data: {
  full_name?: string;
  profile_photo_url?: string;
}) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("You must be logged in to update your profile");
  }

  // Build update object with only provided fields
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (data.full_name !== undefined) {
    updateData.full_name = data.full_name;
  }

  if (data.profile_photo_url !== undefined) {
    updateData.profile_photo_url = data.profile_photo_url;
  }

  const { data: updated, error } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Update user profile error:", error);
    throw new Error(error.message || "Failed to update profile. Please ensure you have permission to update your profile.");
  }

  if (!updated) {
    throw new Error("Profile update failed. No rows were updated.");
  }

  revalidatePath("/dashboard/profile");
  return updated;
}
