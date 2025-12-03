
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
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { completeProject } from "@/lib/actions/projects";
import { AssignWorkerDialog } from "./assign-worker-dialog";
import { CancelProjectDialog } from "./cancel-project-dialog";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserPlus, X } from "lucide-react";

interface ProjectsTableProps {
  projects: any[];
  isAdmin: boolean;
}

export function ProjectsTable({ projects, isAdmin }: ProjectsTableProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleComplete = async (projectId: string) => {
    setLoading(projectId);
    try {
      await completeProject(projectId);
      toast({
        title: "Success",
        description: "Project completed. Worker payments created.",
      });
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to complete project",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>No projects found</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
        <CardDescription>All company projects</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Workers</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>{formatCurrency(Number(project.total_value))}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div>{project.project_workers?.length || 0} worker(s)</div>
                    {project.project_workers && project.project_workers.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {project.project_workers.map((pw: any) => pw.users?.full_name || "Unknown").join(", ")}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      project.status === "completed"
                        ? "success"
                        : project.status === "cancelled"
                        ? "destructive"
                        : project.status === "active"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {isAdmin && project.status === "active" && (
                      <>
                        <AssignWorkerDialog 
                          projectId={project.id}
                          existingWorkers={project.project_workers || []}
                        >
                          <Button size="sm" variant="outline">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Assign
                          </Button>
                        </AssignWorkerDialog>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleComplete(project.id)}
                          disabled={loading === project.id}
                        >
                          {loading === project.id ? "Processing..." : "Complete"}
                        </Button>
                        <CancelProjectDialog projectId={project.id} projectName={project.name}>
                          <Button size="sm" variant="destructive">
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                        </CancelProjectDialog>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

