import { Suspense } from "react";
import { getCurrentUser } from "@/lib/actions/users";
import { getAllProjects } from "@/lib/actions/projects";
import { ProjectsTable } from "@/components/projects/projects-table";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TableSkeleton } from "@/components/dashboard/table-skeleton";

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isAdmin = user.role === "co_founder";
  const isPermanentWorker = user.role === "permanent_partner";
  const projects = await getAllProjects();

  // For permanent workers, filter to only their assigned projects
  const displayProjects = isPermanentWorker
    ? projects.filter((p: any) => 
        p.project_workers?.some((pw: any) => pw.worker_id === user.id)
      )
    : projects;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">
            Manage projects and track worker assignments
          </p>
        </div>
        {isAdmin && (
          <CreateProjectDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </CreateProjectDialog>
        )}
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <ProjectsTable projects={displayProjects} isAdmin={isAdmin} />
      </Suspense>
    </div>
  );
}

