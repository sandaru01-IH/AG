"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";
import { CreateIncomeSourceDialog } from "./create-income-source-dialog";
import { EditIncomeSourceDialog } from "./edit-income-source-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface IncomeSourcesManagerProps {
  incomeSources: any[];
}

export function IncomeSourcesManager({ incomeSources }: IncomeSourcesManagerProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Income Sources</CardTitle>
            <CardDescription>Manage dynamic income sources</CardDescription>
          </div>
          <CreateIncomeSourceDialog>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Source
            </Button>
          </CreateIncomeSourceDialog>
        </div>
      </CardHeader>
      <CardContent>
        {!incomeSources || incomeSources.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No income sources found.</p>
            <p className="text-sm text-muted-foreground">
              Click "Add Source" to create your first income source (e.g., Freelance, Projects, Side-hustles).
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Fee %</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomeSources.map((source) => (
                <TableRow key={source.id}>
                  <TableCell className="font-medium">{source.name}</TableCell>
                  <TableCell>{source.description || "—"}</TableCell>
                  <TableCell>{source.fee_percentage ? `${source.fee_percentage}%` : "0%"}</TableCell>
                  <TableCell>
                    {source.is_active ? "Active" : "Inactive"}
                  </TableCell>
                  <TableCell>
                    <EditIncomeSourceDialog incomeSource={source}>
                      <Button size="sm" variant="outline">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </EditIncomeSourceDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

