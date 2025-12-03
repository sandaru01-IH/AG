"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { approveIncomeRecord, approveExpenseRecord } from "@/lib/actions/financial";
import { approveWorkerManagement } from "@/lib/actions/workers";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserPlus } from "lucide-react";

interface PendingApprovalsProps {
  pendingData: {
    income: any[];
    expenses: any[];
    workers: any[];
  };
  currentUserId?: string;
}

export function PendingApprovals({ pendingData, currentUserId }: PendingApprovalsProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleApprove = async (type: "income" | "expense" | "worker", id: string) => {
    setLoading(id);
    try {
      if (type === "income") {
        await approveIncomeRecord(id);
      } else if (type === "expense") {
        await approveExpenseRecord(id);
      } else if (type === "worker") {
        await approveWorkerManagement(id);
      }
      toast({
        title: "Success",
        description: type === "worker" ? "Worker account approved and activated" : "Record approved successfully",
      });
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const allPending = [
    ...pendingData.income.map((item) => ({ ...item, type: "income" as const, id: item.id, action: "create" })),
    ...pendingData.expenses.map((item) => ({ ...item, type: "expense" as const, id: item.id, action: "create" })),
    ...pendingData.workers.map((item) => ({ ...item, type: "worker" as const, id: item.id, action: item.action || "create" })),
  ].sort((a, b) => {
    // Sort by created_at, most recent first
    const dateA = new Date(a.created_at || 0).getTime();
    const dateB = new Date(b.created_at || 0).getTime();
    return dateB - dateA;
  });

  if (allPending.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>No pending approvals</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Approval Notification Center</CardTitle>
        <CardDescription>
          All records and accounts awaiting your approval ({allPending.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {allPending.map((item) => {
            const isOwnRequest = currentUserId && item.created_by === currentUserId;
            const itemKey = `${item.type}-${item.id}`;

            return (
              <div key={itemKey} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.type === "worker" && <UserPlus className="h-4 w-4 text-muted-foreground" />}
                    <p className="font-medium">
                      {item.type === "income" 
                        ? `Income: ${item.income_sources?.name || "Unknown"}`
                        : item.type === "expense"
                        ? `Expense: ${item.category}`
                        : `Worker Account: ${item.user_data?.full_name || "Unknown"}`
                      }
                    </p>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                  
                  {item.type === "worker" ? (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{item.user_data?.full_name || "N/A"}</p>
                        <Badge variant="warning" className="text-xs">
                          {item.action === "create" ? "New Account" : item.action === "update" ? "Update" : "Delete"}
                        </Badge>
                      </div>
                      {item.action === "create" && (
                        <>
                          <p className="text-sm">
                            <span className="font-medium">Username:</span> {item.user_data?.username || "N/A"}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Role:</span> {item.user_data?.role?.replace("_", " ") || "N/A"}
                          </p>
                          {item.user_data?.email && (
                            <p className="text-sm">
                              <span className="font-medium">Email:</span> {item.user_data.email}
                            </p>
                          )}
                        </>
                      )}
                      {item.action === "update" && (
                        <p className="text-xs text-muted-foreground">
                          Updating worker information
                        </p>
                      )}
                      {item.action === "delete" && (
                        <p className="text-xs text-destructive font-medium">
                          This will permanently delete the worker account
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Requested by: {item.users?.full_name || "Unknown"} • {formatDateShort(item.created_at)}
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatCurrency(Number(item.amount))} • {formatDateShort(item.transaction_date)}
                      </p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                      )}
                    </>
                  )}
                  
                  {isOwnRequest && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      Waiting for another co-founder to approve
                    </p>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0">
                  {isOwnRequest ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled
                      title="You cannot approve your own request"
                    >
                      Your Request
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleApprove(item.type, item.id)}
                      disabled={loading === itemKey}
                    >
                      {loading === itemKey ? "Approving..." : "Approve"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

