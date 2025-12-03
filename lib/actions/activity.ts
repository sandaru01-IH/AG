"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isCoFounder } from "./users";
import { revalidatePath } from "next/cache";

export async function clearActivityLogs() {
  const isAdmin = await isCoFounder();
  if (!isAdmin) throw new Error("Only co-founders can clear activity logs");

  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  // Use admin client to bypass RLS
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!serviceRoleKey || !supabaseUrl) {
    throw new Error("Service role key or Supabase URL not configured");
  }

  const { createClient: createAdminClient } = await import("@supabase/supabase-js");
  const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Delete all activity logs
  const { error } = await supabaseAdmin
    .from("activity_logs")
    .delete()
    .gte("created_at", "1970-01-01"); // Delete all (using a condition that's always true)

  if (error) throw error;

  // Log the clearing action
  await supabaseAdmin.from("activity_logs").insert({
    user_id: currentUser.id,
    action: "clear_activity_logs",
    entity_type: "activity_logs",
    details: "All activity logs cleared",
  });

  revalidatePath("/dashboard");
  return { success: true, message: "Activity logs cleared successfully" };
}

