"use server";

import { createClient } from "@/lib/supabase/server";
import { getMonthlyProfit, getIncomeBreakdownBySource } from "./financial";

export async function getAnnualReport(year: number) {
  const supabase = await createClient();
  
  const monthlyData = [];
  for (let month = 1; month <= 12; month++) {
    const profitData = await getMonthlyProfit(year, month).catch(() => ({
      totalIncome: 0,
      totalExpenses: 0,
      profit: 0,
    }));
    
    const incomeBreakdown = await getIncomeBreakdownBySource(year, month).catch(() => []);
    
    monthlyData.push({
      month,
      ...profitData,
      incomeBreakdown,
    });
  }

  const totalIncome = monthlyData.reduce((sum, m) => sum + m.totalIncome, 0);
  const totalExpenses = monthlyData.reduce((sum, m) => sum + m.totalExpenses, 0);
  const totalProfit = totalIncome - totalExpenses;

  return {
    year,
    monthlyData,
    totals: {
      totalIncome,
      totalExpenses,
      totalProfit,
    },
  };
}

export async function getAllIncomeRecords(year?: number, month?: number) {
  const supabase = await createClient();
  let query = supabase
    .from("income_records")
    .select("*, income_sources(name, fee_percentage), users!income_records_created_by_fkey(full_name)")
    .eq("approval_status", "approved")
    .order("transaction_date", { ascending: false });

  if (year && month) {
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month).padStart(2, "0")}-31`;
    query = query.gte("transaction_date", startDate).lte("transaction_date", endDate);
  } else if (year) {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    query = query.gte("transaction_date", startDate).lte("transaction_date", endDate);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getAllExpenseRecords(year?: number, month?: number) {
  const supabase = await createClient();
  let query = supabase
    .from("expense_records")
    .select("*, users!expense_records_created_by_fkey(full_name)")
    .eq("approval_status", "approved")
    .order("transaction_date", { ascending: false });

  if (year && month) {
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month).padStart(2, "0")}-31`;
    query = query.gte("transaction_date", startDate).lte("transaction_date", endDate);
  } else if (year) {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    query = query.gte("transaction_date", startDate).lte("transaction_date", endDate);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

