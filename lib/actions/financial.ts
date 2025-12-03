"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./users";

export async function createIncomeRecord(data: {
  income_source_id: string;
  amount: number;
  description?: string;
  transaction_date: string;
}) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("You must be logged in to create income records");
  }

  const { data: record, error } = await supabase
    .from("income_records")
    .insert({
      income_source_id: data.income_source_id,
      amount: data.amount,
      description: data.description,
      transaction_date: data.transaction_date,
      created_by: user.id,
      approval_status: "pending",
    })
    .select()
    .single();

  if (error) throw error;

  // Log activity
  await supabase.from("activity_logs").insert({
    user_id: user.id,
    action: "create_income_record",
    details: `Created income record: ${data.amount}`,
  });

  revalidatePath("/dashboard/income");
  return record;
}

export async function createExpenseRecord(data: {
  category: string;
  amount: number;
  description?: string;
  transaction_date: string;
  vendor_name?: string;
  invoice_number?: string;
  receipt_file_url?: string;
}) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("You must be logged in to create expense records");
  }

  // Generate receipt number
  const receiptNumber = `EXP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  const { data: record, error } = await supabase
    .from("expense_records")
    .insert({
      category: data.category,
      amount: data.amount,
      description: data.description,
      transaction_date: data.transaction_date,
      vendor_name: data.vendor_name,
      invoice_number: data.invoice_number,
      receipt_file_url: data.receipt_file_url,
      receipt_number: receiptNumber,
      created_by: user.id,
      approval_status: "pending",
    })
    .select()
    .single();

  if (error) throw error;

  // Log activity
  await supabase.from("activity_logs").insert({
    user_id: user.id,
    action: "create_expense_record",
    details: `Created expense record: ${data.amount}`,
  });

  revalidatePath("/dashboard/expenses");
  return record;
}

export async function approveIncomeRecord(recordId: string) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user || user.role !== "co_founder") {
    throw new Error("Only co-founders can approve records");
  }

  // Check if already approved by another co-founder
  const { data: record, error: fetchError } = await supabase
    .from("income_records")
    .select("approval_status, approved_by, created_by")
    .eq("id", recordId)
    .single();

  if (fetchError) throw fetchError;

  if (record.approval_status === "approved") {
    throw new Error("This record is already approved");
  }

  // Prevent self-approval - creator cannot approve their own record
  if (record.created_by === user.id) {
    throw new Error("You cannot approve your own record. Another co-founder must approve it.");
  }

  // If pending and no approver yet, approve it
  // In a dual-approval system, you might want to check if another co-founder already approved
  const { data: updated, error } = await supabase
    .from("income_records")
    .update({
      approval_status: "approved",
      approved_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", recordId)
    .select()
    .single();

  if (error) throw error;

  // Log activity
  await supabase.from("activity_logs").insert({
    user_id: user.id,
    action: "approve_income_record",
    details: `Approved income record: ${recordId}`,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/income");
  return updated;
}

export async function approveExpenseRecord(recordId: string) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user || user.role !== "co_founder") {
    throw new Error("Only co-founders can approve records");
  }

  const { data: record, error: fetchError } = await supabase
    .from("expense_records")
    .select("approval_status, approved_by, created_by")
    .eq("id", recordId)
    .single();

  if (fetchError) throw fetchError;

  if (record.approval_status === "approved") {
    throw new Error("This record is already approved");
  }

  // Prevent self-approval - creator cannot approve their own record
  if (record.created_by === user.id) {
    throw new Error("You cannot approve your own record. Another co-founder must approve it.");
  }

  const { data: updated, error } = await supabase
    .from("expense_records")
    .update({
      approval_status: "approved",
      approved_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", recordId)
    .select()
    .single();

  if (error) throw error;

  // Log activity
  await supabase.from("activity_logs").insert({
    user_id: user.id,
    action: "approve_expense_record",
    details: `Approved expense record: ${recordId}`,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/expenses");
  return updated;
}

export async function getPendingApprovals() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user || (user.role !== "co_founder" && user.role !== "permanent_partner")) {
    return { income: [], expenses: [], workers: [] };
  }

  const { getPendingWorkerApprovals } = await import("./workers");

  const [incomeResult, expenseResult, workerApprovals] = await Promise.all([
    supabase
      .from("income_records")
      .select("*, income_sources(name), created_by")
      .eq("approval_status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("expense_records")
      .select("*, created_by")
      .eq("approval_status", "pending")
      .order("created_at", { ascending: false }),
    user.role === "co_founder" 
      ? getPendingWorkerApprovals().catch(() => []).then(approvals => 
          // Only show "create" action approvals, filter out "update" and "delete"
          approvals.filter((a: any) => a.action === "create")
        )
      : Promise.resolve([]),
  ]);

  return {
    income: incomeResult.data || [],
    expenses: expenseResult.data || [],
    workers: workerApprovals || [],
  };
}

export async function getMonthlyProfit(year: number, month: number) {
  const supabase = await createClient();
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

  // Fetch income and expenses in parallel for better performance
  // Use net_amount if available (after fees), otherwise use amount
  const [incomeResult, expensesResult] = await Promise.all([
    supabase
      .from("income_records")
      .select("amount, net_amount, income_sources(name, fee_percentage)")
      .eq("approval_status", "approved")
      .gte("transaction_date", startDate)
      .lte("transaction_date", endDate),
    supabase
      .from("expense_records")
      .select("amount")
      .eq("approval_status", "approved")
      .gte("transaction_date", startDate)
      .lte("transaction_date", endDate),
  ]);

  if (incomeResult.error) throw incomeResult.error;
  if (expensesResult.error) throw expensesResult.error;

  // Use net_amount if available (after fees), otherwise use amount
  const totalIncome = (incomeResult.data || []).reduce((sum, r) => {
    const amount = r.net_amount !== null ? Number(r.net_amount) : Number(r.amount);
    return sum + amount;
  }, 0);
  const totalExpenses = (expensesResult.data || []).reduce((sum, r) => sum + Number(r.amount), 0);

  return {
    totalIncome,
    totalExpenses,
    profit: totalIncome - totalExpenses,
  };
}

// New function to get income breakdown by source
export async function getIncomeBreakdownBySource(year: number, month: number) {
  const supabase = await createClient();
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

  const { data, error } = await supabase
    .from("income_records")
    .select("amount, net_amount, income_sources(name, fee_percentage)")
    .eq("approval_status", "approved")
    .gte("transaction_date", startDate)
    .lte("transaction_date", endDate);

  if (error) throw error;

  // Group by income source
  const breakdown: Record<string, { name: string; gross: number; fees: number; net: number; feePercentage: number }> = {};

  (data || []).forEach((record: any) => {
    const sourceName = record.income_sources?.name || "Unknown";
    const gross = Number(record.amount);
    const net = record.net_amount !== null ? Number(record.net_amount) : gross;
    const feePercentage = record.income_sources?.fee_percentage || 0;
    const fees = gross - net;

    if (!breakdown[sourceName]) {
      breakdown[sourceName] = {
        name: sourceName,
        gross: 0,
        fees: 0,
        net: 0,
        feePercentage,
      };
    }

    breakdown[sourceName].gross += gross;
    breakdown[sourceName].fees += fees;
    breakdown[sourceName].net += net;
  });

  return Object.values(breakdown);
}
