"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./users";

export async function createProject(data: {
  name: string;
  description?: string;
  total_value: number;
  start_date?: string;
  end_date?: string;
}) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) throw new Error("Unauthorized");

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      ...data,
      created_by: user.id,
      status: "active",
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from("activity_logs").insert({
    user_id: user.id,
    action: "create_project",
    entity_type: "project",
    entity_id: project.id,
    details: { name: data.name, value: data.total_value },
  });

  revalidatePath("/dashboard/projects");
  return project;
}

export async function assignWorkerToProject(projectId: string, workerId: string, sharePercentage: number = 30) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("project_workers")
    .insert({
      project_id: projectId,
      worker_id: workerId,
      worker_share_percentage: sharePercentage,
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/dashboard/projects");
  return data;
}

export async function completeProject(projectId: string) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) throw new Error("Unauthorized");

  // Get project and workers
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*, project_workers(*, users(*))")
    .eq("id", projectId)
    .single();

  if (projectError) throw projectError;

  // Calculate and create worker payments
  const workers = project.project_workers || [];
  const payments = [];

  for (const pw of workers) {
    const amount = (Number(project.total_value) * Number(pw.worker_share_percentage)) / 100;
    
    const { data: payment, error: paymentError } = await supabase
      .from("worker_payments")
      .insert({
        worker_id: pw.worker_id,
        project_id: projectId,
        amount: amount,
        payment_date: new Date().toISOString().split("T")[0],
        description: `Payment for project: ${project.name}`,
        created_by: user.id,
        approval_status: "pending",
      })
      .select()
      .single();

    if (paymentError) throw paymentError;
    payments.push(payment);
  }

  // Mark project as completed
  const { data: updated, error: updateError } = await supabase
    .from("projects")
    .update({ status: "completed", updated_at: new Date().toISOString() })
    .eq("id", projectId)
    .select()
    .single();

  if (updateError) throw updateError;

  revalidatePath("/dashboard/projects");
  return { project: updated, payments };
}

export async function getAllProjects() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*, project_workers(*, users(*))")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error fetching projects:", error);
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }
  
  return data || [];
}

export async function getProjectById(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*, project_workers(*, users(*))")
    .eq("id", projectId)
    .single();

  if (error) throw error;
  return data;
}

export async function cancelProject(projectId: string, projectName: string, confirmationText: string) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) throw new Error("Unauthorized");
  if (user.role !== "co_founder") throw new Error("Only co-founders can cancel projects");

  // Verify confirmation text matches project name
  if (confirmationText !== projectName) {
    throw new Error("Confirmation text does not match project name. Please type the project name exactly to confirm cancellation.");
  }

  // Get project to verify it exists and is not already cancelled
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (projectError) throw projectError;

  if (project.status === "cancelled") {
    throw new Error("Project is already cancelled");
  }

  if (project.status === "completed") {
    throw new Error("Cannot cancel a completed project");
  }

  // Mark project as cancelled
  const { data: updated, error: updateError } = await supabase
    .from("projects")
    .update({ 
      status: "cancelled", 
      updated_at: new Date().toISOString() 
    })
    .eq("id", projectId)
    .select()
    .single();

  if (updateError) throw updateError;

  // Log activity
  await supabase.from("activity_logs").insert({
    user_id: user.id,
    action: "cancel_project",
    entity_type: "project",
    entity_id: projectId,
    details: { name: project.name, cancelled_by: user.full_name },
  });

  revalidatePath("/dashboard/projects");
  return updated;
}

