import React from "react";
import { getCurrentUser, getUserFinancialStats, getUserYearlyIncome } from "@/lib/actions/users";
import { getWorkerBalance, getWorkerPayments } from "@/lib/actions/workers";
import { getSalaryHistory } from "@/lib/actions/salary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { WorkerPaymentsTable } from "@/components/workers/worker-payments-table";
import { UserProfileEditor } from "@/components/profile/user-profile-editor";
import Image from "next/image";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [balance, payments, userStats, salaries, yearlyIncome] = await Promise.all([
    user.role !== "co_founder" ? getWorkerBalance(user.id).catch(() => 0) : Promise.resolve(0),
    user.role !== "co_founder" ? getWorkerPayments(user.id).catch(() => []) : Promise.resolve([]),
    getUserFinancialStats(user.id, currentYear, currentMonth).catch(() => ({
      payments: [],
      expenses: [],
      income: [],
      totalPayments: 0,
      totalExpenses: 0,
      totalIncome: 0,
    })),
    user.role === "co_founder" ? getSalaryHistory(user.id).catch(() => []) : Promise.resolve([]),
    user.role === "co_founder" ? getUserYearlyIncome(user.id, currentYear).catch(() => ({ income: [], totalIncome: 0 })) : Promise.resolve({ income: [], totalIncome: 0 }),
  ]);

  // Calculate total salaries received
  const totalSalaries = salaries.reduce((sum: number, s: any) => {
    if (s.status === "paid") {
      return sum + Number(s.amount);
    }
    return sum;
  }, 0);

  // Calculate pending salaries
  const pendingSalaries = salaries.reduce((sum: number, s: any) => {
    if (s.status === "pending") {
      return sum + Number(s.amount);
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
        <p className="text-muted-foreground">
          View and manage your personal information and financial stats
        </p>
      </div>

      {/* Profile Editor */}
      <UserProfileEditor user={user} />

      {/* Financial Stats - Personal Feed */}
      <div className="grid gap-6 md:grid-cols-3">
        {user.role === "co_founder" ? (
          <>
            <Card key="salaries-paid-card">
              <CardHeader>
                <CardTitle>Total Salaries Received</CardTitle>
                <CardDescription>All paid salaries</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(totalSalaries)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {salaries.filter((s: any) => s.status === "paid").length} salary record(s)
                </p>
              </CardContent>
            </Card>
            <Card key="salaries-pending-card">
              <CardHeader>
                <CardTitle>Pending Salaries</CardTitle>
                <CardDescription>Salaries awaiting payment</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-600">
                  {formatCurrency(pendingSalaries)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {salaries.filter((s: any) => s.status === "pending").length} pending
                </p>
              </CardContent>
            </Card>
            <Card key="yearly-income-card">
              <CardHeader>
                <CardTitle>Net Income {currentYear}</CardTitle>
                <CardDescription>Total income for the year</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(yearlyIncome.totalIncome)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {yearlyIncome.income.length} record(s)
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card key="balance-card">
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
            <Card key="payments-card">
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
            <Card key="worker-expenses-card">
              <CardHeader>
                <CardTitle>Expenses This Month</CardTitle>
                <CardDescription>Expenses you created</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">
                  {formatCurrency(userStats.totalExpenses)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {userStats.expenses.length} record(s)
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Salary History for Co-founders */}
      {user.role === "co_founder" && salaries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Salary History</CardTitle>
            <CardDescription>Your monthly salary records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {salaries.slice(0, 12).map((salary: any) => (
                <div key={salary.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      {new Date(salary.month).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Status: <span className={salary.status === "paid" ? "text-green-600" : "text-yellow-600"}>{salary.status}</span>
                      {salary.paid_date && ` • Paid: ${formatDateShort(salary.paid_date)}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{formatCurrency(salary.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {salary.profit_share_percentage}% of {formatCurrency(salary.total_profit)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Income Records for Co-founders */}
      {user.role === "co_founder" && (
        <Card>
          <CardHeader>
            <CardTitle>Income Records {currentYear}</CardTitle>
            <CardDescription>All income records you created this year</CardDescription>
          </CardHeader>
          <CardContent>
            {yearlyIncome.income.length > 0 ? (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {yearlyIncome.income.map((record: any) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{record.income_sources?.name || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateShort(record.transaction_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(record.net_amount || record.amount)}</p>
                      {record.net_amount && record.net_amount !== record.amount && (
                        <p className="text-xs text-muted-foreground">
                          Gross: {formatCurrency(record.amount)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No income records this year</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment History for Workers */}
      {user.role !== "co_founder" && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>All your project payments</CardDescription>
          </CardHeader>
          <CardContent>
            <WorkerPaymentsTable payments={payments} />
          </CardContent>
        </Card>
      )}

      {/* Expenses This Month */}
      {userStats.expenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Expenses This Month</CardTitle>
            <CardDescription>Expenses you created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userStats.expenses.map((expense: any) => (
                <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{expense.category}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateShort(expense.transaction_date)}
                    </p>
                  </div>
                  <p className="font-semibold text-red-600">{formatCurrency(expense.amount)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

