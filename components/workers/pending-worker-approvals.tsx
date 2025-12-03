"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateShort } from "@/lib/utils";
import { approveWorkerManagement } from "@/lib/actions/workers";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface PendingWorkerApprovalsProps {
  approvals: any[];
  currentUserId?: string;
}

export function PendingWorkerApprovals({ approvals, currentUserId }: PendingWorkerApprovalsProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleApprove = async (approvalId: string) => {
    setLoading(approvalId);
    try {
      await approveWorkerManagement(approvalId);
      toast({
        title: "Success",
        description: "Worker management request approved",
      });
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve worker",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  if (approvals.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Worker Approvals</CardTitle>
        <CardDescription>
          Worker accounts awaiting your approval to become active
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {approvals.map((approval) => {
            const userData = approval.user_data || {};
            const isOwnRequest = approval.created_by === currentUserId;

            return (
              <div key={approval.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{userData.full_name || "N/A"}</p>
                    <Badge variant="warning" className="text-xs">
                      {approval.action === "create" ? "New Account" : approval.action === "update" ? "Update" : "Delete"}
                    </Badge>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                  {approval.action === "create" && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Username:</span> {userData.username || "N/A"}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Role:</span> {userData.role?.replace("_", " ") || "N/A"}
                      </p>
                      {userData.email && (
                        <p className="text-sm">
                          <span className="font-medium">Email:</span> {userData.email}
                        </p>
                      )}
                    </div>
                  )}
                  {approval.action === "update" && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Updating worker information
                      </p>
                    </div>
                  )}
                  {approval.action === "delete" && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-destructive font-medium">
                        This will permanently delete the worker account
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Requested by: {approval.users?.full_name || "Unknown"} • {formatDateShort(approval.created_at)}
                  </p>
                  {isOwnRequest && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      Waiting for another co-founder to approve
                    </p>
                  )}
                </div>
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
                    onClick={() => handleApprove(approval.id)}
                    disabled={loading === approval.id}
                  >
                    {loading === approval.id ? "Approving..." : "Approve"}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

