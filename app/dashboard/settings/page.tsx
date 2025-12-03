import { getCurrentUser } from "@/lib/actions/users";
import { getAllIncomeSources } from "@/lib/actions/income-sources";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IncomeSourcesManager } from "@/components/settings/income-sources-manager";
import { SalaryCalculator } from "@/components/settings/salary-calculator";

import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-destructive font-semibold">Authentication Error</p>
        <p className="text-muted-foreground">Unable to load user data.</p>
        <div className="text-sm text-muted-foreground space-y-2 max-w-md text-center">
          <p>Possible issues:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>User not found in users table</li>
            <li>RLS policies blocking access</li>
            <li>Session expired - try logging out and back in</li>
          </ul>
          <p className="mt-4">Check browser console (F12) for detailed error messages.</p>
        </div>
      </div>
    );
  }

  // Permanent workers cannot access settings page
  if (user.role === "permanent_partner") {
    redirect("/dashboard");
  }

  const isCoFounder = user.role === "co_founder";
  let incomeSources: any[] = [];
  
  try {
    incomeSources = await getAllIncomeSources();
  } catch (error) {
    console.error("Error fetching income sources:", error);
    // Continue with empty array
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage company settings and configurations
        </p>
      </div>

      {isCoFounder && (
        <>
          <IncomeSourcesManager incomeSources={incomeSources || []} />
          <SalaryCalculator />
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">{user.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Username</p>
              <p className="font-medium">{user.username}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-medium capitalize">
                {user.role?.replace("_", " ")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

