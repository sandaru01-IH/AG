import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/actions/users";
import { getMonthlyProfit, getPendingApprovals, getIncomeBreakdownBySource } from "@/lib/actions/financial";
import { getAllProjects } from "@/lib/actions/projects";
import { getAllAssets } from "@/lib/actions/assets";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { PendingApprovals } from "@/components/dashboard/pending-approvals";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { ProfitVisualization } from "@/components/dashboard/profit-visualization";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const isPermanentWorker = user.role === "permanent_partner";
  const isCoFounder = user.role === "co_founder";

  // For permanent workers, only show their own data
  if (isPermanentWorker) {
    const { getUserFinancialStats } = await import("@/lib/actions/users");
    const { getWorkerBalance, getWorkerPayments } = await import("@/lib/actions/workers");
    const { getAllProjects } = await import("@/lib/actions/projects");

    const [userStats, balance, payments, allProjects] = await Promise.all([
      getUserFinancialStats(user.id, currentYear, currentMonth).catch(() => ({
        payments: [],
        expenses: [],
        income: [],
        totalPayments: 0,
        totalExpenses: 0,
        totalIncome: 0,
      })),
      getWorkerBalance(user.id).catch(() => 0),
      getWorkerPayments(user.id).catch(() => []),
      getAllProjects().catch(() => []),
    ]);

    // Filter to only projects this worker is assigned to
    const myProjects = allProjects.filter((p: any) => 
      p.project_workers?.some((pw: any) => pw.worker_id === user.id)
    );

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user.full_name}</h2>
          <p className="text-muted-foreground">
            Here's an overview of your work and payments
          </p>
        </div>

        {/* Worker-specific stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Account Balance</CardTitle>
              <CardDescription>Total approved payments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(balance)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Payments This Month</CardTitle>
              <CardDescription>Approved payments received</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(userStats.totalPayments)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {userStats.payments.length} payment(s)
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>My Projects</CardTitle>
              <CardDescription>Projects you're assigned to</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {myProjects.length}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {myProjects.filter((p: any) => p.status === "active").length} active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Your recent payment history</CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length > 0 ? (
              <div className="space-y-2">
                {payments.slice(0, 5).map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{payment.projects?.name || "N/A"}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateShort(payment.payment_date)}
                      </p>
                    </div>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No payments yet</p>
            )}
          </CardContent>
        </Card>

        {/* My Projects */}
        <Card>
          <CardHeader>
            <CardTitle>My Projects</CardTitle>
            <CardDescription>Projects you're working on</CardDescription>
          </CardHeader>
          <CardContent>
            {myProjects.length > 0 ? (
              <div className="space-y-2">
                {myProjects.map((project: any) => {
                  const myAssignment = project.project_workers?.find((pw: any) => pw.worker_id === user.id);
                  return (
                    <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Status: {project.status} • Share: {myAssignment?.worker_share_percentage || 0}%
                        </p>
                      </div>
                      <p className="font-semibold">
                        {formatCurrency(project.total_value)}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No projects assigned yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Co-founder view (full access)
  const [profitData, pendingData, projects, assets, incomeBreakdown] = await Promise.all([
    getMonthlyProfit(currentYear, currentMonth).catch((err) => {
      console.error("Error fetching profit data:", err);
      return { totalIncome: 0, totalExpenses: 0, profit: 0 };
    }),
    getPendingApprovals().catch((err) => {
      console.error("Error fetching pending approvals:", err);
      return { income: [], expenses: [], workers: [] };
    }),
    getAllProjects().catch((err) => {
      console.error("Error fetching projects:", err);
      return [];
    }),
    getAllAssets().catch((err) => {
      console.error("Error fetching assets:", err);
      return [];
    }),
    getIncomeBreakdownBySource(currentYear, currentMonth).catch((err) => {
      console.error("Error fetching income breakdown:", err);
      return [];
    }),
  ]);

  const activeProjects = projects.filter((p: any) => p.status === "active").length;
  const activeAssets = assets.filter((a: any) => a.status === "active" && a.approval_status === "approved").length;
  const pendingCount = pendingData.income.length + pendingData.expenses.length + (pendingData.workers?.length || 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user.full_name}</h2>
        <p className="text-muted-foreground">
          Here's an overview of your company's financial status
        </p>
      </div>

      <DashboardStats
        profit={profitData.profit}
        totalIncome={profitData.totalIncome}
        totalExpenses={profitData.totalExpenses}
        pendingCount={pendingCount}
        activeProjects={activeProjects}
        activeAssets={activeAssets}
      />

      <ProfitVisualization 
        profitData={profitData} 
        incomeBreakdown={incomeBreakdown}
        month={currentMonth}
        year={currentYear}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Suspense fallback={<Card><CardHeader><div className="h-4 w-32 bg-muted animate-pulse rounded" /></CardHeader></Card>}>
          <PendingApprovals pendingData={pendingData} currentUserId={user.id} />
        </Suspense>
        <Suspense fallback={<Card><CardHeader><div className="h-4 w-32 bg-muted animate-pulse rounded" /></CardHeader></Card>}>
          <RecentActivity />
        </Suspense>
      </div>
    </div>
  );
}

