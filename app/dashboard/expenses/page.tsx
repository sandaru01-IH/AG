import { Suspense } from "react";
import { getCurrentUser } from "@/lib/actions/users";
import { createClient } from "@/lib/supabase/server";
import { ExpenseRecordsTable } from "@/components/expenses/expense-records-table";
import { CreateExpenseDialog } from "@/components/expenses/create-expense-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TableSkeleton } from "@/components/dashboard/table-skeleton";

import { redirect } from "next/navigation";

export default async function ExpensesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Permanent workers cannot access expenses page
  if (user.role === "permanent_partner") {
    redirect("/dashboard");
  }

  const isAdmin = user.role === "co_founder" || user.role === "permanent_partner";
  
  const supabase = await createClient();
  let expenseRecords: any[] = [];
  let expenseError: any = null;

  try {
    const result = await supabase
      .from("expense_records")
      .select("*, users!expense_records_created_by_fkey(full_name)")
      .order("transaction_date", { ascending: false });
    
    expenseRecords = result.data || [];
    expenseError = result.error;
    
    if (expenseError) {
      console.error("Error fetching expense records:", expenseError);
    }
  } catch (error: any) {
    console.error("Exception fetching expense records:", error);
    expenseError = error;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Expense Records</h2>
          <p className="text-muted-foreground">
            Manage and track all company expenses
          </p>
        </div>
        {isAdmin && (
          <CreateExpenseDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </CreateExpenseDialog>
        )}
      </div>

      {expenseError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive font-semibold">Error Loading Data</p>
          <p className="text-sm text-destructive/80">{expenseError.message || "Failed to load expense records"}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Make sure you've run the RLS policies fix in Supabase SQL Editor.
          </p>
        </div>
      )}

      <Suspense fallback={<TableSkeleton />}>
        <ExpenseRecordsTable records={expenseRecords || []} isAdmin={isAdmin} />
      </Suspense>
    </div>
  );
}

