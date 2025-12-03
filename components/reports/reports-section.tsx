"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, Calendar } from "lucide-react";
import { generateMonthlyReportPDF, generateAnnualReportPDF } from "@/lib/pdf-generator";
import { getAnnualReport, getAllIncomeRecords, getAllExpenseRecords } from "@/lib/actions/reports";
import { exportToCSV, formatDataForExport } from "@/lib/utils/export";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportsSectionProps {
  profitData: {
    totalIncome: number;
    totalExpenses: number;
    profit: number;
  };
  salaries: any[];
  user: any;
}

export function ReportsSection({ profitData, salaries, user }: ReportsSectionProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const { toast } = useToast();

  const handleGenerateMonthlyReport = async () => {
    setLoading("monthly");
    try {
      await generateMonthlyReportPDF({
        profitData,
        salaries,
        user,
        month: reportMonth,
        year: reportYear,
      });
      toast({
        title: "Success",
        description: "Monthly report generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateAnnualReport = async () => {
    setLoading("annual");
    try {
      const annualData = await getAnnualReport(reportYear);
      await generateAnnualReportPDF(annualData);
      toast({
        title: "Success",
        description: "Annual report generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate annual report",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleExportIncome = async () => {
    setLoading("income-export");
    try {
      const records = await getAllIncomeRecords(reportYear, reportMonth);
      const exportData = formatDataForExport(records, "income");
      exportToCSV(exportData, `income-records-${reportYear}-${reportMonth}`);
      toast({
        title: "Success",
        description: "Income records exported successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export income records",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleExportExpenses = async () => {
    setLoading("expense-export");
    try {
      const records = await getAllExpenseRecords(reportYear, reportMonth);
      const exportData = formatDataForExport(records, "expense");
      exportToCSV(exportData, `expense-records-${reportYear}-${reportMonth}`);
      toast({
        title: "Success",
        description: "Expense records exported successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export expense records",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      {/* Report Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Report Period</CardTitle>
          <CardDescription>Select the period for your reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={reportYear.toString()} onValueChange={(v) => setReportYear(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Month (for monthly reports)</Label>
              <Select value={reportMonth.toString()} onValueChange={(v) => setReportMonth(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                    const date = new Date(2000, month - 1);
                    return (
                      <SelectItem key={month} value={month.toString()}>
                        {date.toLocaleDateString("en-US", { month: "long" })}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Reports */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Financial Report</CardTitle>
            <CardDescription>
              Generate a comprehensive monthly financial report (PDF)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-2xl font-bold">${profitData.totalIncome.toFixed(2)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold">${profitData.totalExpenses.toFixed(2)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Net Profit</p>
              <p className={`text-2xl font-bold ${profitData.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${profitData.profit.toFixed(2)}
              </p>
            </div>
            <Button 
              onClick={handleGenerateMonthlyReport} 
              className="w-full"
              disabled={loading === "monthly"}
            >
              <Download className="mr-2 h-4 w-4" />
              {loading === "monthly" ? "Generating..." : "Download Monthly PDF"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Annual Financial Report</CardTitle>
            <CardDescription>
              Generate comprehensive annual report for {reportYear} (PDF)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleGenerateAnnualReport} 
              className="w-full"
              variant="outline"
              disabled={loading === "annual"}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {loading === "annual" ? "Generating..." : "Download Annual PDF"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Data Exports */}
      {user.role === "co_founder" && (
        <Card>
          <CardHeader>
            <CardTitle>Data Exports</CardTitle>
            <CardDescription>
              Export financial data as CSV/Excel files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Button 
                onClick={handleExportIncome} 
                variant="outline"
                disabled={loading === "income-export"}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                {loading === "income-export" ? "Exporting..." : "Export Income Records (CSV)"}
              </Button>
              <Button 
                onClick={handleExportExpenses} 
                variant="outline"
                disabled={loading === "expense-export"}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                {loading === "expense-export" ? "Exporting..." : "Export Expense Records (CSV)"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

