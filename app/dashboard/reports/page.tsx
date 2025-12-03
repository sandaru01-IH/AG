import { getCurrentUser } from "@/lib/actions/users";
import { getMonthlyProfit } from "@/lib/actions/financial";
import { getSalaryHistory } from "@/lib/actions/salary";
import { ReportsSection } from "@/components/reports/reports-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { redirect } from "next/navigation";

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Permanent workers cannot access reports page
  if (user.role === "permanent_partner") {
    redirect("/dashboard");
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const profitData = await getMonthlyProfit(currentYear, currentMonth).catch(() => ({
    totalIncome: 0,
    totalExpenses: 0,
    profit: 0,
  }));

  const salaries = await getSalaryHistory(user.role === "co_founder" ? undefined : user.id).catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <p className="text-muted-foreground">
          Generate and download financial reports
        </p>
      </div>

      <ReportsSection profitData={profitData} salaries={salaries} user={user} />
    </div>
  );
}

