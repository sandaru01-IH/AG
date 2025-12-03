"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./users";

export async function createAsset(data: {
  name: string;
  description?: string;
  purchase_date?: string;
  purchase_value: number;
  current_value?: number;
  condition: string;
  status: string;
}) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) throw new Error("Unauthorized");

  const { data: asset, error } = await supabase
    .from("assets")
    .insert({
      ...data,
      created_by: user.id,
      approval_status: "pending",
      current_value: data.current_value || data.purchase_value,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from("activity_logs").insert({
    user_id: user.id,
    action: "create_asset",
    entity_type: "asset",
    entity_id: asset.id,
    details: { name: data.name, value: data.purchase_value },
  });

  revalidatePath("/dashboard/assets");
  return asset;
}

export async function approveAsset(assetId: string) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) throw new Error("Unauthorized");
  if (user.role !== "co_founder") throw new Error("Only co-founders can approve");

  const { data: asset, error: fetchError } = await supabase
    .from("assets")
    .select("*")
    .eq("id", assetId)
    .single();

  if (fetchError) throw fetchError;

  if (asset.approval_status === "approved") {
    throw new Error("Asset already approved");
  }

  if (asset.created_by === user.id) {
    throw new Error("Cannot approve your own asset");
  }

  const { data: updated, error } = await supabase
    .from("assets")
    .update({
      approval_status: "approved",
      approved_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", assetId)
    .select()
    .single();

  if (error) throw error;

  await supabase.from("activity_logs").insert({
    user_id: user.id,
    action: "approve_asset",
    entity_type: "asset",
    entity_id: assetId,
  });

  revalidatePath("/dashboard/assets");
  return updated;
}

export async function getAllAssets() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error fetching assets:", error);
    throw new Error(`Failed to fetch assets: ${error.message}`);
  }
  
  return data || [];
}

export async function updateAsset(assetId: string, data: Partial<{
  name: string;
  description: string;
  current_value: number;
  condition: string;
  status: string;
}>) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) throw new Error("Unauthorized");

  const { data: updated, error } = await supabase
    .from("assets")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", assetId)
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/dashboard/assets");
  return updated;
}

