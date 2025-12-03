"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateExpenseReceipt } from "@/lib/pdf-generator";
import { FileText, Download } from "lucide-react";
import { exportToCSV, formatDataForExport } from "@/lib/utils/export";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ExpenseRecordsTableProps {
  records: any[];
  isAdmin: boolean;
}

export function ExpenseRecordsTable({ records, isAdmin }: ExpenseRecordsTableProps) {
  const [generating, setGenerating] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateReceipt = async (record: any) => {
    setGenerating(record.id);
    try {
      await generateExpenseReceipt(record);
      toast({
        title: "Success",
        description: "Receipt generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate receipt",
        variant: "destructive",
      });
    } finally {
      setGenerating(null);
    }
  };

  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Records</CardTitle>
          <CardDescription>No expense records found</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleExport = () => {
    try {
      const exportData = formatDataForExport(records, "expense");
      exportToCSV(exportData, `expense-records-${new Date().toISOString().split("T")[0]}`);
      toast({
        title: "Success",
        description: "Expense records exported successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export data",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Expense Records</CardTitle>
            <CardDescription>All expense transactions</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{formatDateShort(record.transaction_date)}</TableCell>
                <TableCell>{record.category}</TableCell>
                <TableCell>{record.vendor_name || "—"}</TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(Number(record.amount))}
                </TableCell>
                <TableCell>{record.users?.full_name || "Unknown"}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      record.approval_status === "approved"
                        ? "success"
                        : record.approval_status === "pending"
                        ? "warning"
                        : "destructive"
                    }
                  >
                    {record.approval_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerateReceipt(record)}
                    disabled={generating === record.id}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {generating === record.id ? "Generating..." : "Receipt"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

