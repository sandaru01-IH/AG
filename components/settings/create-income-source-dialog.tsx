"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createIncomeSource } from "@/lib/actions/income-sources";
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
import { Textarea } from "@/components/ui/textarea";

const sourceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  allocation_formula: z.string().optional(),
  fee_percentage: z.number().min(0).max(100).optional(),
});

type SourceFormData = z.infer<typeof sourceSchema>;

interface CreateIncomeSourceDialogProps {
  children: React.ReactNode;
}

export function CreateIncomeSourceDialog({ children }: CreateIncomeSourceDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SourceFormData>({
    resolver: zodResolver(sourceSchema),
  });

  const onSubmit = async (data: SourceFormData) => {
    setLoading(true);
    try {
      await createIncomeSource(data);
      toast({
        title: "Success",
        description: "Income source created successfully",
      });
      reset();
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create income source",
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
            <DialogTitle>Create Income Source</DialogTitle>
            <DialogDescription>
              Add a new income source type (e.g., Freelance, Projects, Side-hustles)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register("description")} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fee_percentage">Fee Percentage (Optional)</Label>
              <Input
                id="fee_percentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                {...register("fee_percentage", { valueAsNumber: true })}
                placeholder="e.g., 20 for 20% (Fiverr takes 20%)"
              />
              <p className="text-xs text-muted-foreground">
                Platform/service fee percentage. This will be deducted from income amounts.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="allocation_formula">Allocation Formula (Optional)</Label>
              <Input
                id="allocation_formula"
                {...register("allocation_formula")}
                placeholder="e.g., JSON formula for custom calculations"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

