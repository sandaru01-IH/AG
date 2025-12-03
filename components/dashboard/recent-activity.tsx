import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { formatDateShort } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/actions/users";
import { ClearActivityButton } from "./clear-activity-button";

export async function RecentActivity() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  const isCoFounder = user?.role === "co_founder";

  const { data: activities, error } = await supabase
    .from("activity_logs")
    .select("*, users(full_name)")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching activity logs:", error);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </div>
          {isCoFounder && <ClearActivityButton />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities && activities.length > 0 ? (
            activities.map((activity: any) => (
              <div key={activity.id} className="flex items-start gap-3 p-2 border-b last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {activity.users?.full_name || "System"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.action.replace(/_/g, " ")}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDateShort(activity.created_at)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

