"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";

interface ProfitVisualizationProps {
  profitData: {
    totalIncome: number;
    totalExpenses: number;
    profit: number;
  };
  incomeBreakdown: Array<{
    name: string;
    gross: number;
    fees: number;
    net: number;
    feePercentage: number;
  }>;
  month: number;
  year: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function ProfitVisualization({ profitData, incomeBreakdown, month, year }: ProfitVisualizationProps) {
  const monthNames = ["January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"];

  // Prepare pie chart data for income sources
  const pieData = incomeBreakdown.map((item) => ({
    name: item.name,
    value: item.net,
    gross: item.gross,
    fees: item.fees,
    feePercentage: item.feePercentage,
  }));

  // Prepare bar chart data showing gross vs net
  const barData = incomeBreakdown.map((item) => ({
    name: item.name.length > 10 ? item.name.substring(0, 10) + "..." : item.name,
    gross: item.gross,
    net: item.net,
    fees: item.fees,
  }));

  // Overall profit breakdown
  const profitBreakdown = [
    { name: "Income", value: profitData.totalIncome, color: "#00C49F" },
    { name: "Expenses", value: profitData.totalExpenses, color: "#FF8042" },
    { name: "Profit", value: profitData.profit, color: profitData.profit >= 0 ? "#0088FE" : "#FF0000" },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Income Sources Breakdown */}
      <Card key="income-sources-card">
        <CardHeader>
          <CardTitle>Income by Source</CardTitle>
          <CardDescription>
            Breakdown of income sources for {monthNames[month - 1]} {year}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pieData.length > 0 ? (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {incomeBreakdown.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(item.net)}</p>
                      {item.feePercentage > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {item.feePercentage}% fee ({formatCurrency(item.fees)})
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No income data available for this month
            </p>
          )}
        </CardContent>
      </Card>

      {/* Gross vs Net Comparison */}
      <Card key="gross-net-card">
        <CardHeader>
          <CardTitle>Gross vs Net Income</CardTitle>
          <CardDescription>
            Comparison showing fees deducted by source
          </CardDescription>
        </CardHeader>
        <CardContent>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="gross" fill="#8884d8" name="Gross Income" />
                <Bar dataKey="net" fill="#00C49F" name="Net Income" />
                <Bar dataKey="fees" fill="#FF8042" name="Fees" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No income data available
            </p>
          )}
        </CardContent>
      </Card>

      {/* Overall Profit Summary */}
      <Card key="profit-summary-card" className="md:col-span-2">
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
          <CardDescription>
            Total income, expenses, and profit for {monthNames[month - 1]} {year}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {profitBreakdown.map((item) => (
              <div key={item.name} className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">{item.name}</p>
                <p 
                  className="text-2xl font-bold"
                  style={{ color: item.color }}
                >
                  {formatCurrency(item.value)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

