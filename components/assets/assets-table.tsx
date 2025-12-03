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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AssetsTableProps {
  assets: any[];
  isAdmin: boolean;
}

export function AssetsTable({ assets, isAdmin }: AssetsTableProps) {
  if (assets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assets</CardTitle>
          <CardDescription>No assets found</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Assets</CardTitle>
        <CardDescription>All registered assets</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Purchase Value</TableHead>
              <TableHead>Current Value</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Approval</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell className="font-medium">{asset.name}</TableCell>
                <TableCell>{formatCurrency(Number(asset.purchase_value))}</TableCell>
                <TableCell>{formatCurrency(Number(asset.current_value || asset.purchase_value))}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {asset.condition}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="default" className="capitalize">
                    {asset.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      asset.approval_status === "approved"
                        ? "success"
                        : asset.approval_status === "pending"
                        ? "warning"
                        : "destructive"
                    }
                  >
                    {asset.approval_status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

