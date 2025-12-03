import { Suspense } from "react";
import { getCurrentUser } from "@/lib/actions/users";
import { getAllUsers } from "@/lib/actions/users";
import { getPendingWorkerApprovals } from "@/lib/actions/workers";
import { WorkersTable } from "@/components/workers/workers-table";
import { PendingWorkerApprovals } from "@/components/workers/pending-worker-approvals";
import { CreateWorkerDialog } from "@/components/workers/create-worker-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TableSkeleton } from "@/components/dashboard/table-skeleton";

import { redirect } from "next/navigation";

export default async function WorkersPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Only co-founders can access workers page
  if (user.role !== "co_founder") {
    redirect("/dashboard");
  }

  const isCoFounder = user.role === "co_founder";
  const [workers, pendingApprovals] = await Promise.all([
    getAllUsers(),
    getPendingWorkerApprovals().catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Workers</h2>
          <p className="text-muted-foreground">
            Manage worker accounts and permissions
          </p>
        </div>
        {isCoFounder && (
          <CreateWorkerDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Worker
            </Button>
          </CreateWorkerDialog>
        )}
      </div>

      {/* Pending Worker Approvals */}
      {pendingApprovals.length > 0 && (
        <Suspense fallback={<div className="h-32 bg-muted animate-pulse rounded-lg" />}>
          <PendingWorkerApprovals approvals={pendingApprovals} currentUserId={user.id} />
        </Suspense>
      )}

      <Suspense fallback={<TableSkeleton />}>
        <WorkersTable workers={workers} isCoFounder={isCoFounder} />
      </Suspense>
    </div>
  );
}

