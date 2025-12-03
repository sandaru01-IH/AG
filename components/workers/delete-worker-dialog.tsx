"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { deleteWorker } from "@/lib/actions/workers";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Trash2 } from "lucide-react";

const deleteSchema = z.object({
  confirm_name: z.string().min(1, "Worker name is required for confirmation"),
});

interface DeleteWorkerDialogProps {
  children: React.ReactNode;
  worker: any;
}

export function DeleteWorkerDialog({ children, worker }: DeleteWorkerDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof deleteSchema>>({
    resolver: zodResolver(deleteSchema),
  });

  const onSubmit = async (data: z.infer<typeof deleteSchema>) => {
    if (data.confirm_name !== worker.full_name) {
      toast({
        title: "Error",
        description: "Worker name does not match. Please type the exact worker name to confirm.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await deleteWorker(worker.id);
      toast({
        title: "Success",
        description: `Worker deleted successfully.`,
      });
      reset();
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete worker",
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
            <DialogTitle>Delete Worker: {worker.full_name}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this worker? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Warning!</AlertTitle>
              <AlertDescription>
                Deleting a worker will remove all their associated data including project assignments and payment records.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="confirm_name">
                To confirm, type "<strong>{worker.full_name}</strong>" in the box below.
              </Label>
              <Input
                id="confirm_name"
                {...register("confirm_name")}
                placeholder="Enter worker name to confirm"
              />
              {errors.confirm_name && (
                <p className="text-sm text-destructive">{errors.confirm_name.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading ? "Deleting..." : "Delete Worker"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

