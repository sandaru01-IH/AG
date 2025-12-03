"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser, isCoFounder } from "./users";

export async function createWorkerAccount(data: {
  email?: string;
  full_name: string;
  username: string;
  password: string;
  role: "permanent_partner" | "temporary_worker";
}) {
  const isAdmin = await isCoFounder();
  if (!isAdmin) throw new Error("Only co-founders can create worker accounts");

  const supabase = await createClient();
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  // For temporary workers, email is not required
  if (data.role === "temporary_worker") {
    // Generate a placeholder email that won't be used for authentication
    data.email = `temp-${data.username}@alphagrid-temp.local`;
  }

  // Email is required for permanent partners
  if (data.role === "permanent_partner" && !data.email) {
    throw new Error("Email is required for permanent partners");
  }

  // Create auth user using service role key
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!serviceRoleKey || !supabaseUrl) {
    throw new Error("Service role key or Supabase URL not configured. Please set SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in environment variables.");
  }

  // Import supabase-js for admin operations
  const { createClient: createAdminClient } = await import("@supabase/supabase-js");
  const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Check if email or username already exists using admin client (only check if email is provided)
  if (data.email && data.role === "permanent_partner") {
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("email, username")
      .or(`email.eq.${data.email},username.eq.${data.username}`)
      .limit(1)
      .single();
    
    if (existingUser) {
      if (existingUser.email === data.email) {
        throw new Error("A user with this email address has already been registered");
      }
      if (existingUser.username === data.username) {
        throw new Error("A user with this username already exists");
      }
    }
  } else {
    // For temporary workers, only check username
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("username")
      .eq("username", data.username)
      .limit(1)
      .single();
    
    if (existingUser) {
      throw new Error("A user with this username already exists");
    }
  }

  // For temporary workers, use a dummy email that won't be used for login
  const emailForAuth = data.role === "temporary_worker" 
    ? `temp-${data.username}-${Date.now()}@alphagrid-temp.local`
    : data.email!;

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: emailForAuth,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      full_name: data.full_name,
      username: data.username,
      role: data.role,
    },
  });

  if (authError) {
    // Handle duplicate email error more gracefully
    if (authError.message?.includes("already registered") || authError.message?.includes("already exists")) {
      throw new Error("A user with this email address has already been registered");
    }
    throw authError;
  }
  
  if (!authData.user) throw new Error("Failed to create user");

  // Create user record in users table using admin client to bypass RLS
  // For temporary workers, store NULL email (database allows it after schema update)
  // For permanent partners, use the provided email
  const userEmail = data.role === "temporary_worker" 
    ? null 
    : (data.email || null);

  const { error: userError } = await supabaseAdmin
    .from("users")
    .insert({
      id: authData.user.id,
      email: userEmail, // NULL for temporary workers, email for permanent partners
      full_name: data.full_name,
      username: data.username,
      role: data.role,
      is_active: false, // Inactive until approved
    });

  if (userError) {
    // If user already exists (unique violation), that's okay - continue
    if (userError.code !== "23505") { // 23505 is unique violation
      // Clean up auth user if users table insert failed
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw userError;
    }
  }

  // Create user record with pending approval using admin client to bypass RLS
  const { data: workerApproval, error: approvalError } = await supabaseAdmin
    .from("worker_management_approvals")
    .insert({
      action: "create",
      user_id: authData.user.id,
      user_data: {
        email: userEmail,
        full_name: data.full_name,
        username: data.username,
        role: data.role,
      },
      created_by: currentUser.id,
      approval_status: "pending",
    })
    .select()
    .single();

  if (approvalError) {
    // Clean up if approval creation fails
    await supabaseAdmin.from("users").delete().eq("id", authData.user.id);
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    throw approvalError;
  }

  await supabase.from("activity_logs").insert({
    user_id: currentUser.id,
    action: "create_worker_account",
    entity_type: "worker_management_approval",
    entity_id: workerApproval.id,
    details: { username: data.username, role: data.role },
  });

  revalidatePath("/dashboard/workers");
  return { approval: workerApproval, tempPassword: data.password };
}

export async function approveWorkerManagement(approvalId: string) {
  const user = await getCurrentUser();

  if (!user) throw new Error("Unauthorized");
  if (user.role !== "co_founder") throw new Error("Only co-founders can approve");

  // Use admin client to bypass RLS for all operations
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

  // Fetch approval using admin client to bypass RLS
  const { data: approval, error: fetchError } = await supabaseAdmin
    .from("worker_management_approvals")
    .select("*")
    .eq("id", approvalId)
    .single();

  if (fetchError) throw fetchError;

  if (approval.approval_status === "approved") {
    throw new Error("Already approved");
  }

  if (approval.created_by === user.id) {
    throw new Error("Cannot approve your own action");
  }

  if (approval.action === "create" && approval.user_data) {
    // Activate the user (they were created as inactive)
    const { error: userError } = await supabaseAdmin
      .from("users")
      .update({
        is_active: true,
        email: approval.user_data.email,
        full_name: approval.user_data.full_name,
        username: approval.user_data.username,
        role: approval.user_data.role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", approval.user_id);

    if (userError) throw userError;
  } else if (approval.action === "update" && approval.user_data) {
    // Update user data
    const { error: userError } = await supabaseAdmin
      .from("users")
      .update({
        full_name: approval.user_data.full_name,
        email: approval.user_data.email,
        username: approval.user_data.username,
        role: approval.user_data.role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", approval.user_id);

    if (userError) throw userError;
  } else if (approval.action === "delete") {
    // Delete the user (cascade will handle related records)
    const { error: deleteError } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", approval.user_id);

    if (deleteError) throw deleteError;

    // Also delete from auth.users
    await supabaseAdmin.auth.admin.deleteUser(approval.user_id);
  }

  // Update approval status using admin client to bypass RLS
  const { data: updated, error } = await supabaseAdmin
    .from("worker_management_approvals")
    .update({
      approval_status: "approved",
      approved_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", approvalId)
    .select()
    .single();

  if (error) throw error;

  await supabaseAdmin.from("activity_logs").insert({
    user_id: user.id,
    action: "approve_worker_management",
    entity_type: "worker_management_approval",
    entity_id: approvalId,
  });

  revalidatePath("/dashboard/workers");
  revalidatePath("/dashboard");
  return updated;
}

export async function getWorkerPayments(workerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("worker_payments")
    .select("*, projects(name)")
    .eq("worker_id", workerId)
    .order("payment_date", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getWorkerBalance(workerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("worker_payments")
    .select("amount, approval_status")
    .eq("worker_id", workerId)
    .eq("approval_status", "approved");

  if (error) throw error;

  const balance = data.reduce((sum, payment) => sum + Number(payment.amount), 0);
  return balance;
}

export async function getPendingWorkerApprovals() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user || user.role !== "co_founder") {
    return [];
  }

  const { data, error } = await supabase
    .from("worker_management_approvals")
    .select("*, users!worker_management_approvals_created_by_fkey(full_name)")
    .eq("approval_status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pending worker approvals:", error);
    return [];
  }

  return data || [];
}

export async function deleteWorker(workerId: string) {
  const isAdmin = await isCoFounder();
  if (!isAdmin) throw new Error("Only co-founders can delete workers");

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

  // Prevent deleting co-founders
  const { data: worker, error: fetchError } = await supabaseAdmin
    .from("users")
    .select("role, full_name")
    .eq("id", workerId)
    .single();

  if (fetchError) throw fetchError;
  if (worker.role === "co_founder") {
    throw new Error("Cannot delete co-founder accounts");
  }

  // Prevent deleting yourself
  if (workerId === currentUser.id) {
    throw new Error("Cannot delete your own account");
  }

  // Delete the user (cascade will handle related records)
  const { error: deleteError } = await supabaseAdmin
    .from("users")
    .delete()
    .eq("id", workerId);

  if (deleteError) throw deleteError;

  // Also delete from auth.users
  await supabaseAdmin.auth.admin.deleteUser(workerId);

  // Log the activity
  await supabaseAdmin.from("activity_logs").insert({
    user_id: currentUser.id,
    action: "delete_worker",
    entity_type: "user",
    entity_id: workerId,
    details: `Deleted worker: ${worker.full_name}`,
  });

  revalidatePath("/dashboard/workers");
  revalidatePath("/dashboard");
  return { success: true, message: `Worker ${worker.full_name} deleted successfully` };
}

export async function updateWorker(workerId: string, data: {
  full_name?: string;
  email?: string;
  username?: string;
  role?: "permanent_partner" | "temporary_worker";
}) {
  const isAdmin = await isCoFounder();
  if (!isAdmin) throw new Error("Only co-founders can update workers");

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

  // Prevent updating co-founders
  const { data: worker, error: fetchError } = await supabaseAdmin
    .from("users")
    .select("role, full_name, username, email")
    .eq("id", workerId)
    .single();

  if (fetchError) throw fetchError;
  if (worker.role === "co_founder") {
    throw new Error("Cannot modify co-founder accounts");
  }

  // Prepare updated data - only update fields that are provided
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (data.full_name !== undefined) updateData.full_name = data.full_name;
  if (data.email !== undefined) updateData.email = data.email || null;
  if (data.username !== undefined) updateData.username = data.username;
  if (data.role !== undefined) updateData.role = data.role;

  // Update the user directly
  const { data: updated, error: updateError } = await supabaseAdmin
    .from("users")
    .update(updateData)
    .eq("id", workerId)
    .select()
    .single();

  if (updateError) throw updateError;

  // Log the activity
  await supabaseAdmin.from("activity_logs").insert({
    user_id: currentUser.id,
    action: "update_worker",
    entity_type: "user",
    entity_id: workerId,
    details: `Updated worker: ${updated.full_name}`,
  });

  revalidatePath("/dashboard/workers");
  revalidatePath("/dashboard");
  return updated;
}

export async function approveWorkerPayment(paymentId: string) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) throw new Error("Unauthorized");
  if (user.role !== "co_founder") throw new Error("Only co-founders can approve");

  const { data: payment, error: fetchError } = await supabase
    .from("worker_payments")
    .select("*")
    .eq("id", paymentId)
    .single();

  if (fetchError) throw fetchError;

  if (payment.approval_status === "approved") {
    throw new Error("Payment already approved");
  }

  if (payment.created_by === user.id) {
    throw new Error("Cannot approve your own payment");
  }

  const { data: updated, error } = await supabase
    .from("worker_payments")
    .update({
      approval_status: "approved",
      approved_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentId)
    .select()
    .single();

  if (error) throw error;

  await supabase.from("activity_logs").insert({
    user_id: user.id,
    action: "approve_worker_payment",
    entity_type: "worker_payment",
    entity_id: paymentId,
  });

  revalidatePath("/dashboard");
  return updated;
}

