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
import { exportToCSV, formatDataForExport } from "@/lib/utils/export";
import { generateIncomeReceipt } from "@/lib/pdf-generator";
import { Download, FileText } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface IncomeRecordsTableProps {
  records: any[];
  isAdmin: boolean;
}

export function IncomeRecordsTable({ records, isAdmin }: IncomeRecordsTableProps) {
  const { toast } = useToast();
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerateReceipt = async (record: any) => {
    setGenerating(record.id);
    try {
      await generateIncomeReceipt(record);
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

  const handleExport = () => {
    try {
      const exportData = formatDataForExport(records, "income");
      exportToCSV(exportData, `income-records-${new Date().toISOString().split("T")[0]}`);
      toast({
        title: "Success",
        description: "Income records exported successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export data",
        variant: "destructive",
      });
    }
  };

  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Income Records</CardTitle>
          <CardDescription>No income records found</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Income Records</CardTitle>
            <CardDescription>All income transactions</CardDescription>
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
              <TableHead>Source</TableHead>
              <TableHead>Gross Amount</TableHead>
              <TableHead>Net Amount</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{formatDateShort(record.transaction_date)}</TableCell>
                <TableCell>{record.income_sources?.name || "Unknown"}</TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(Number(record.amount))}
                </TableCell>
                <TableCell className="font-medium text-green-600">
                  {formatCurrency(Number(record.net_amount || record.amount))}
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

