import { Suspense } from "react";
import { getCurrentUser } from "@/lib/actions/users";
import { getAllAssets } from "@/lib/actions/assets";
import { AssetsTable } from "@/components/assets/assets-table";
import { CreateAssetDialog } from "@/components/assets/create-asset-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TableSkeleton } from "@/components/dashboard/table-skeleton";

import { redirect } from "next/navigation";

export default async function AssetsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Permanent workers cannot access assets page
  if (user.role === "permanent_partner") {
    redirect("/dashboard");
  }

  const isAdmin = user.role === "co_founder" || user.role === "permanent_partner";
  let assets: any[] = [];
  let errorMessage: string | null = null;

  try {
    assets = await getAllAssets();
  } catch (error: any) {
    console.error("Error fetching assets:", error);
    errorMessage = error.message || "Failed to load assets. Please check RLS policies.";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Assets</h2>
          <p className="text-muted-foreground">
            Manage company assets and equipment
          </p>
        </div>
        {isAdmin && (
          <CreateAssetDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Asset
            </Button>
          </CreateAssetDialog>
        )}
      </div>

      {errorMessage && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive font-semibold">Error</p>
          <p className="text-sm text-destructive/80">{errorMessage}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Make sure you've run the RLS policies fix in Supabase SQL Editor.
          </p>
        </div>
      )}

      <Suspense fallback={<TableSkeleton />}>
        <AssetsTable assets={assets || []} isAdmin={isAdmin} />
      </Suspense>
    </div>
  );
}

