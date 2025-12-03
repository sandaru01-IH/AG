"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateIncomeSource } from "@/lib/actions/income-sources";
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
import { Pencil } from "lucide-react";

const incomeSourceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  fee_percentage: z.number().min(0).max(100).optional(),
});

type IncomeSourceFormData = z.infer<typeof incomeSourceSchema>;

interface EditIncomeSourceDialogProps {
  children: React.ReactNode;
  incomeSource: {
    id: string;
    name: string;
    description?: string;
    fee_percentage?: number;
  };
}

export function EditIncomeSourceDialog({ children, incomeSource }: EditIncomeSourceDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IncomeSourceFormData>({
    resolver: zodResolver(incomeSourceSchema),
    defaultValues: {
      name: incomeSource.name,
      description: incomeSource.description || "",
      fee_percentage: incomeSource.fee_percentage || 0,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: incomeSource.name,
        description: incomeSource.description || "",
        fee_percentage: incomeSource.fee_percentage || 0,
      });
    }
  }, [open, incomeSource, reset]);

  const onSubmit = async (data: IncomeSourceFormData) => {
    setLoading(true);
    try {
      await updateIncomeSource(incomeSource.id, {
        name: data.name,
        description: data.description,
        fee_percentage: data.fee_percentage,
      });
      toast({
        title: "Success",
        description: "Income source updated successfully",
      });
      reset();
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update income source",
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
            <DialogTitle>Edit Income Source</DialogTitle>
            <DialogDescription>
              Update the income source information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g., Fiverr, Upwork, Direct Client"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Describe this income source"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fee_percentage">Fee Percentage (%)</Label>
              <Input
                id="fee_percentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                {...register("fee_percentage", { valueAsNumber: true })}
                placeholder="e.g., 20 for 20% fee"
              />
              <p className="text-xs text-muted-foreground">
                Percentage of fee charged by this platform (e.g., Fiverr charges 20%)
              </p>
              {errors.fee_percentage && (
                <p className="text-sm text-destructive">{errors.fee_percentage.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Source"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

