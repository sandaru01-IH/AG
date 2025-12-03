"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./users";

export async function createIncomeSource(data: {
  name: string;
  description?: string;
  allocation_formula?: string;
  fee_percentage?: number;
}) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) throw new Error("Unauthorized");

  const { data: source, error } = await supabase
    .from("income_sources")
    .insert(data)
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/dashboard/income-sources");
  return source;
}

export async function getAllIncomeSources() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("income_sources")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching income sources:", error);
    throw error;
  }
  return data || [];
}

export async function updateIncomeSource(id: string, data: {
  name?: string;
  description?: string;
  allocation_formula?: string;
  fee_percentage?: number;
  is_active?: boolean;
}) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) throw new Error("Unauthorized");

  const { data: updated, error } = await supabase
    .from("income_sources")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/dashboard/income-sources");
  return updated;
}

