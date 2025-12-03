"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createExpenseRecord } from "@/lib/actions/financial";
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

const expenseSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
  transaction_date: z.string().min(1, "Date is required"),
  vendor_name: z.string().optional(),
  invoice_number: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface CreateExpenseDialogProps {
  children: React.ReactNode;
}

export function CreateExpenseDialog({ children }: CreateExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      transaction_date: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (data: ExpenseFormData) => {
    setLoading(true);
    try {
      await createExpenseRecord({
        category: data.category,
        amount: Number(data.amount),
        description: data.description,
        transaction_date: data.transaction_date,
        vendor_name: data.vendor_name,
        invoice_number: data.invoice_number,
      });
      toast({
        title: "Success",
        description: "Expense record created. Awaiting approval.",
      });
      reset();
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create expense record",
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
            <DialogTitle>Add Expense Record</DialogTitle>
            <DialogDescription>
              Create a new expense record. It will require approval from another co-founder.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                {...register("category")}
                placeholder="e.g., Office Supplies, Utilities"
              />
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction_date">Transaction Date</Label>
              <Input
                id="transaction_date"
                type="date"
                {...register("transaction_date")}
              />
              {errors.transaction_date && (
                <p className="text-sm text-destructive">
                  {errors.transaction_date.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor_name">Vendor Name (Optional)</Label>
              <Input
                id="vendor_name"
                {...register("vendor_name")}
                placeholder="e.g., Amazon, Office Depot"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice_number">Invoice Number (Optional)</Label>
              <Input
                id="invoice_number"
                {...register("invoice_number")}
                placeholder="Vendor invoice/receipt number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                {...register("description")}
                rows={3}
                placeholder="Additional details about this expense"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

