
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateShort } from "@/lib/utils";

interface WorkerPaymentsTableProps {
  payments: any[];
}

export function WorkerPaymentsTable({ payments }: WorkerPaymentsTableProps) {
  if (payments.length === 0) {
    return <p className="text-sm text-muted-foreground">No payments found</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>{formatDateShort(payment.payment_date)}</TableCell>
            <TableCell>{payment.projects?.name || "N/A"}</TableCell>
            <TableCell className="font-medium">
              {formatCurrency(Number(payment.amount))}
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  payment.approval_status === "approved"
                    ? "success"
                    : payment.approval_status === "pending"
                    ? "warning"
                    : "destructive"
                }
              >
                {payment.approval_status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

