import { getCurrentUser } from "@/lib/actions/users";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DebugPage() {
  const supabase = await createClient();
  
  // Get auth user
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  
  // Get user from users table
  const dbUser = await getCurrentUser();
  
  // Test queries
  let assetsTest: any = null;
  let incomeTest: any = null;
  let usersTest: any = null;
  
  if (authUser) {
    try {
      const { data, error } = await supabase.from("assets").select("id").limit(1);
      assetsTest = { success: !error, error: error?.message, count: data?.length || 0 };
    } catch (e: any) {
      assetsTest = { success: false, error: e.message };
    }
    
    try {
      const { data, error } = await supabase.from("income_records").select("id").limit(1);
      incomeTest = { success: !error, error: error?.message, count: data?.length || 0 };
    } catch (e: any) {
      incomeTest = { success: false, error: e.message };
    }
    
    try {
      const { data, error } = await supabase.from("users").select("id").eq("id", authUser.id).single();
      usersTest = { success: !error, error: error?.message, found: !!data };
    } catch (e: any) {
      usersTest = { success: false, error: e.message };
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold">System Diagnostics</h2>
        <p className="text-muted-foreground">Debug information for troubleshooting</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium">Auth User ID:</p>
              <p className="text-xs font-mono text-muted-foreground">
                {authUser?.id || "Not authenticated"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Auth Email:</p>
              <p className="text-xs text-muted-foreground">{authUser?.email || "N/A"}</p>
            </div>
            {authError && (
              <div className="text-destructive text-sm">
                Error: {authError.message}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database User Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {dbUser ? (
              <>
                <div>
                  <p className="text-sm font-medium">Full Name:</p>
                  <p className="text-xs text-muted-foreground">{dbUser.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Username:</p>
                  <p className="text-xs text-muted-foreground">{dbUser.username}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Role:</p>
                  <p className="text-xs text-muted-foreground">{dbUser.role}</p>
                </div>
              </>
            ) : (
              <div className="text-destructive">
                <p className="font-semibold">User not found in database!</p>
                <p className="text-sm mt-2">
                  Your auth user exists but the record in the users table is missing or inaccessible.
                </p>
                <p className="text-xs mt-2 text-muted-foreground">
                  Check RLS policies on the users table.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assets Table Access</CardTitle>
          </CardHeader>
          <CardContent>
            {assetsTest ? (
              <div>
                <p className={`text-sm font-semibold ${assetsTest.success ? "text-green-600" : "text-destructive"}`}>
                  {assetsTest.success ? "✓ Accessible" : "✗ Blocked"}
                </p>
                {assetsTest.error && (
                  <p className="text-xs text-destructive mt-2">{assetsTest.error}</p>
                )}
                {assetsTest.success && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Found {assetsTest.count} record(s)
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not authenticated</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Income Records Table Access</CardTitle>
          </CardHeader>
          <CardContent>
            {incomeTest ? (
              <div>
                <p className={`text-sm font-semibold ${incomeTest.success ? "text-green-600" : "text-destructive"}`}>
                  {incomeTest.success ? "✓ Accessible" : "✗ Blocked"}
                </p>
                {incomeTest.error && (
                  <p className="text-xs text-destructive mt-2">{incomeTest.error}</p>
                )}
                {incomeTest.success && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Found {incomeTest.count} record(s)
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not authenticated</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users Table Access</CardTitle>
          </CardHeader>
          <CardContent>
            {usersTest ? (
              <div>
                <p className={`text-sm font-semibold ${usersTest.success ? "text-green-600" : "text-destructive"}`}>
                  {usersTest.success ? "✓ Accessible" : "✗ Blocked"}
                </p>
                {usersTest.error && (
                  <p className="text-xs text-destructive mt-2">{usersTest.error}</p>
                )}
                {usersTest.success && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {usersTest.found ? "Your user record found" : "User record not found"}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not authenticated</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">If you see errors above:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>Run <code className="bg-muted px-1 rounded">supabase/COMPLETE-FIX.sql</code> in Supabase SQL Editor</li>
            <li>Verify your user exists in the users table with correct role</li>
            <li>Check browser console (F12) for detailed error messages</li>
            <li>Try logging out and logging back in</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

