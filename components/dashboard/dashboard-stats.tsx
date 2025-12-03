import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, TrendingUp, Clock, Briefcase, Package } from "lucide-react";

interface DashboardStatsProps {
  profit: number;
  totalIncome: number;
  totalExpenses: number;
  pendingCount: number;
  activeProjects: number;
  activeAssets: number;
}

export function DashboardStats({
  profit,
  totalIncome,
  totalExpenses,
  pendingCount,
  activeProjects,
  activeAssets,
}: DashboardStatsProps) {
  const stats = [
    {
      title: "Monthly Profit",
      value: formatCurrency(profit),
      description: "This month's profit",
      icon: TrendingUp,
      trend: profit >= 0 ? "positive" : "negative",
    },
    {
      title: "Total Income",
      value: formatCurrency(totalIncome),
      description: "Approved income this month",
      icon: DollarSign,
    },
    {
      title: "Total Expenses",
      value: formatCurrency(totalExpenses),
      description: "Approved expenses this month",
      icon: DollarSign,
    },
    {
      title: "Pending Approvals",
      value: pendingCount.toString(),
      description: "Awaiting approval",
      icon: Clock,
    },
    {
      title: "Active Projects",
      value: activeProjects.toString(),
      description: "Currently active",
      icon: Briefcase,
    },
    {
      title: "Active Assets",
      value: activeAssets.toString(),
      description: "Company assets",
      icon: Package,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.trend === "positive" ? "text-green-600" : stat.trend === "negative" ? "text-red-600" : ""}`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

