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
import { formatDateShort } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EditWorkerDialog } from "./edit-worker-dialog";
import { DeleteWorkerDialog } from "./delete-worker-dialog";
import { Pencil, Trash2 } from "lucide-react";

interface WorkersTableProps {
  workers: any[];
  isCoFounder: boolean;
}

export function WorkersTable({ workers, isCoFounder }: WorkersTableProps) {
  if (workers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workers</CardTitle>
          <CardDescription>No workers found</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workers</CardTitle>
        <CardDescription>All company workers</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              {isCoFounder && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {workers.map((worker) => (
              <TableRow key={worker.id}>
                <TableCell className="font-medium">{worker.full_name}</TableCell>
                <TableCell>{worker.username}</TableCell>
                <TableCell>{worker.email || "—"}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {worker.role?.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={worker.is_active ? "success" : "destructive"}>
                    {worker.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>{formatDateShort(worker.created_at)}</TableCell>
                {isCoFounder && worker.role !== "co_founder" && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <EditWorkerDialog worker={worker}>
                        <Button size="sm" variant="outline">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </EditWorkerDialog>
                      <DeleteWorkerDialog worker={worker}>
                        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DeleteWorkerDialog>
                    </div>
                  </TableCell>
                )}
                {isCoFounder && worker.role === "co_founder" && (
                  <TableCell>
                    <span className="text-xs text-muted-foreground">Protected</span>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

