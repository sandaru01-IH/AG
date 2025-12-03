"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cancelProject } from "@/lib/actions/projects";
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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const cancelSchema = z.object({
  confirmation: z.string().min(1, "Project name is required"),
});

type CancelFormData = z.infer<typeof cancelSchema>;

interface CancelProjectDialogProps {
  children: React.ReactNode;
  projectId: string;
  projectName: string;
}

export function CancelProjectDialog({ children, projectId, projectName }: CancelProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CancelFormData>({
    resolver: zodResolver(cancelSchema),
  });

  const onSubmit = async (data: CancelFormData) => {
    setLoading(true);
    try {
      await cancelProject(projectId, projectName, data.confirmation);
      toast({
        title: "Success",
        description: "Project cancelled successfully",
      });
      reset();
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel project",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Cancel Project
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. The project will be marked as cancelled.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Are you sure you want to cancel this project? This action is permanent and cannot be reversed.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="confirmation">
                Type the project name <strong>&quot;{projectName}&quot;</strong> to confirm:
              </Label>
              <Input
                id="confirmation"
                placeholder={`Type "${projectName}" to confirm`}
                {...register("confirmation")}
                disabled={loading}
              />
              {errors.confirmation && (
                <p className="text-sm text-destructive">{errors.confirmation.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading ? "Cancelling..." : "Cancel Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

