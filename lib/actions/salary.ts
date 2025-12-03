"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser, getUsersByRole } from "./users";
import { getMonthlyProfit } from "./financial";

export async function calculateMonthlySalaries(year: number, month: number) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user || user.role !== "co_founder") {
    throw new Error("Only co-founders can calculate salaries");
  }

  const profitData = await getMonthlyProfit(year, month);
  const profit = profitData.profit;

  if (profit <= 0) {
    throw new Error("No profit to distribute");
  }

  // Get all co-founders
  const coFounders = await getUsersByRole("co_founder");
  const salaryPerFounder = profit * 0.16; // Each gets 16% (0.16) of profit

  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;

  const salaries = [];

  for (const founder of coFounders) {
    // Check if salary already calculated
    const { data: existing } = await supabase
      .from("monthly_salary_history")
      .select("*")
      .eq("user_id", founder.id)
      .eq("month", monthStart)
      .single();

    if (existing) {
      salaries.push(existing);
      continue;
    }

    const { data: salary, error } = await supabase
      .from("monthly_salary_history")
      .insert({
        user_id: founder.id,
        month: monthStart,
        amount: salaryPerFounder,
        profit_share_percentage: 16.00,
        total_profit: profit,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;
    salaries.push(salary);
  }

  revalidatePath("/dashboard/salaries");
  return salaries;
}

export async function markSalaryAsPaid(salaryId: string) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user || user.role !== "co_founder") {
    throw new Error("Only co-founders can mark salaries as paid");
  }

  const { data: updated, error } = await supabase
    .from("monthly_salary_history")
    .update({
      status: "paid",
      paid_date: new Date().toISOString().split("T")[0],
    })
    .eq("id", salaryId)
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/dashboard/salaries");
  return updated;
}

export async function getSalaryHistory(userId?: string) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) throw new Error("Unauthorized");

  let query = supabase
    .from("monthly_salary_history")
    .select("*, users(full_name)")
    .order("month", { ascending: false });

  if (userId) {
    query = query.eq("user_id", userId);
  } else if (user.role !== "co_founder") {
    query = query.eq("user_id", user.id);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

