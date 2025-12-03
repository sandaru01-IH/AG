"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { assignWorkerToProject } from "@/lib/actions/projects";
import { createWorkerAccount } from "@/lib/actions/workers";
import { getAllUsers } from "@/lib/actions/users";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Users } from "lucide-react";

const assignSchema = z.object({
  worker_name: z.string().min(1, "Worker name is required"),
  share_percentage: z.number().min(0).max(100),
});

type AssignFormData = z.infer<typeof assignSchema>;

interface AssignWorkerDialogProps {
  projectId: string;
  children: React.ReactNode;
  existingWorkers?: any[];
}

export function AssignWorkerDialog({ projectId, children, existingWorkers = [] }: AssignWorkerDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [workerName, setWorkerName] = useState("");
  const [workers, setWorkers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<AssignFormData>({
    resolver: zodResolver(assignSchema),
    defaultValues: {
      share_percentage: 30,
    },
  });

  // Load workers when dialog opens
  const loadWorkers = async () => {
    try {
      const allWorkers = await getAllUsers();
      // Filter out workers already assigned
      const availableWorkers = allWorkers.filter(
        (w: any) => !existingWorkers.some((ew: any) => ew.worker_id === w.id)
      );
      setWorkers(availableWorkers);
    } catch (error) {
      console.error("Error loading workers:", error);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      loadWorkers();
    } else {
      reset();
      setSearchTerm("");
      setWorkerName("");
      setShowAddWorker(false);
    }
  };

  const handleWorkerSearch = (value: string) => {
    setSearchTerm(value);
    setWorkerName(value);
    
    // Check if worker exists
    const found = workers.find((w: any) => 
      w.full_name.toLowerCase().includes(value.toLowerCase()) ||
      w.username.toLowerCase().includes(value.toLowerCase())
    );
    
    if (!found && value.length > 2) {
      setShowAddWorker(true);
    } else {
      setShowAddWorker(false);
    }
  };

  const handleAddNewWorker = async () => {
    if (!workerName.trim()) return;
    
    setLoading(true);
    try {
      // Generate temporary credentials
      const username = workerName.toLowerCase().replace(/\s+/g, ".");
      const tempPassword = `Temp${Math.random().toString(36).substr(2, 9)}`;
      // No email needed for temporary workers

      await createWorkerAccount({
        full_name: workerName,
        username,
        password: tempPassword,
        role: "temporary_worker",
      });

      toast({
        title: "Success",
        description: `Worker "${workerName}" added. Temporary password: ${tempPassword}`,
      });

      // Reload workers and assign
      await loadWorkers();
      const newWorkers = await getAllUsers();
      const newWorker = newWorkers.find((w: any) => w.full_name === workerName);
      
      if (newWorker) {
        await assignWorkerToProject(projectId, newWorker.id, watch("share_percentage"));
        toast({
          title: "Success",
          description: "Worker assigned to project",
        });
        setOpen(false);
        router.refresh();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add worker",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: AssignFormData) => {
    setLoading(true);
    try {
      // If worker name was entered but not selected, check if we need to add
      if (workerName && !data.worker_name.includes("|")) {
        // Worker name entered but not from dropdown - treat as new worker
        await handleAddNewWorker();
        return;
      }

      // Extract worker ID from selected value (format: "id|name")
      const workerId = data.worker_name.split("|")[0];
      
      await assignWorkerToProject(projectId, workerId, data.share_percentage);
      toast({
        title: "Success",
        description: "Worker assigned to project",
      });
      reset();
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to assign worker",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkers = workers.filter((w: any) =>
    w.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Assign Worker to Project</DialogTitle>
              <DialogDescription>
                Assign a worker to this project. If the worker doesn't exist, you can add them.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="worker_name">Worker Name</Label>
                <Input
                  id="worker_name"
                  placeholder="Search or type worker name..."
                  value={workerName}
                  onChange={(e) => {
                    handleWorkerSearch(e.target.value);
                    setValue("worker_name", e.target.value);
                  }}
                />
                {showAddWorker && workerName.length > 2 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">
                      Worker "{workerName}" not found. Would you like to add them?
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleAddNewWorker}
                      disabled={loading}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add as Temporary Worker
                    </Button>
                  </div>
                )}
                {filteredWorkers.length > 0 && searchTerm && (
                  <div className="border rounded-lg max-h-40 overflow-y-auto">
                    {filteredWorkers.map((worker: any) => (
                      <button
                        key={worker.id}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-accent"
                        onClick={() => {
                          setWorkerName(worker.full_name);
                          setValue("worker_name", `${worker.id}|${worker.full_name}`);
                          setSearchTerm("");
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{worker.full_name}</span>
                          <span className="text-xs text-muted-foreground">({worker.username})</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {errors.worker_name && (
                  <p className="text-sm text-destructive">{errors.worker_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="share_percentage">Share Percentage</Label>
                <Input
                  id="share_percentage"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  {...register("share_percentage", { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">
                  Percentage of project value this worker will receive (default: 30%)
                </p>
                {errors.share_percentage && (
                  <p className="text-sm text-destructive">{errors.share_percentage.message}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Assigning..." : "Assign Worker"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

