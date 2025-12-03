import { Suspense } from "react";
import { getCurrentUser } from "@/lib/actions/users";
import { getAllIncomeSources } from "@/lib/actions/income-sources";
import { createClient } from "@/lib/supabase/server";
import { IncomeRecordsTable } from "@/components/income/income-records-table";
import { CreateIncomeDialog } from "@/components/income/create-income-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TableSkeleton } from "@/components/dashboard/table-skeleton";

import { redirect } from "next/navigation";

export default async function IncomePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Permanent workers cannot access income page
  if (user.role === "permanent_partner") {
    redirect("/dashboard");
  }

  const isAdmin = user.role === "co_founder" || user.role === "permanent_partner";
  
  // Fetch data in parallel for better performance
  const [incomeSources, incomeResult] = await Promise.all([
    getAllIncomeSources().catch(() => []),
    (async () => {
      const supabase = await createClient();
      return await supabase
        .from("income_records")
        .select("*, income_sources(name), users!income_records_created_by_fkey(full_name)")
        .order("transaction_date", { ascending: false });
    })(),
  ]);

  const incomeRecords = incomeResult.data || [];
  const incomeError = incomeResult.error;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Income Records</h2>
          <p className="text-muted-foreground">
            Manage and track all income sources
          </p>
        </div>
        {isAdmin && (
          <CreateIncomeDialog incomeSources={incomeSources}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Income
            </Button>
          </CreateIncomeDialog>
        )}
      </div>

      {incomeError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive font-semibold">Error Loading Data</p>
          <p className="text-sm text-destructive/80">{incomeError.message || "Failed to load income records"}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Make sure you've run the RLS policies fix in Supabase SQL Editor.
          </p>
        </div>
      )}

      <Suspense fallback={<TableSkeleton />}>
        <IncomeRecordsTable records={incomeRecords || []} isAdmin={isAdmin} />
      </Suspense>
    </div>
  );
}

