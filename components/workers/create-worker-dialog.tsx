"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createWorkerAccount } from "@/lib/actions/workers";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const workerSchema = z.object({
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  full_name: z.string().min(1, "Full name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["permanent_partner", "temporary_worker"]),
}).refine((data) => {
  // Email is required only for permanent partners
  if (data.role === "permanent_partner" && (!data.email || data.email === "")) {
    return false;
  }
  return true;
}, {
  message: "Email is required for permanent partners",
  path: ["email"],
});

type WorkerFormData = z.infer<typeof workerSchema>;

interface CreateWorkerDialogProps {
  children: React.ReactNode;
}

export function CreateWorkerDialog({ children }: CreateWorkerDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<WorkerFormData>({
    resolver: zodResolver(workerSchema),
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: WorkerFormData) => {
    setLoading(true);
    try {
      // For temporary workers, don't send email
      const workerData = {
        ...data,
        email: data.role === "temporary_worker" ? undefined : data.email,
      };
      const result = await createWorkerAccount(workerData);
      setTempPassword(result.tempPassword);
      toast({
        title: "Success",
        description: data.role === "temporary_worker" 
          ? "Temporary worker added. Awaiting approval from other co-founder."
          : "Worker account created. Awaiting approval from other co-founder.",
      });
      reset();
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create worker account",
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
        {tempPassword ? (
          <>
            <DialogHeader>
              <DialogTitle>Worker Account Created</DialogTitle>
              <DialogDescription>
                Account created successfully. Share these credentials with the worker.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-medium mb-2">Temporary Credentials:</p>
                <p className="text-sm">
                  <span className="font-medium">Username:</span> {watch("username") || "N/A"}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Password:</span> {tempPassword}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Note: The account requires approval from another co-founder before it becomes active.
                Share these credentials with the worker securely.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => {
                setOpen(false);
                setTempPassword(null);
              }}>
                Close
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Create Worker Account</DialogTitle>
              <DialogDescription>
                Create a new permanent partner account. Requires approval from another co-founder.
                <br />
                <span className="text-xs text-muted-foreground mt-1 block">
                  Note: Temporary workers don't need accounts. They can be assigned to projects directly.
                </span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedRole === "permanent_partner" && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register("email")} />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
              )}
              {selectedRole === "temporary_worker" && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Temporary workers don't require an email address. They can be assigned to projects directly.
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" {...register("full_name")} />
                {errors.full_name && (
                  <p className="text-sm text-destructive">{errors.full_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" {...register("username")} />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Temporary Password</Label>
                <Input id="password" type="password" {...register("password")} />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select onValueChange={(value) => {
                  setValue("role", value as any);
                  // Clear email when switching to temporary worker
                  if (value === "temporary_worker") {
                    setValue("email", "");
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="permanent_partner">Permanent Partner</SelectItem>
                    <SelectItem value="temporary_worker">
                      Temporary Worker
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-destructive">{errors.role.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {selectedRole === "temporary_worker" 
                    ? "Temporary workers don't need email addresses. They can be assigned to projects directly."
                    : "Permanent partners require an email address for account access."
                  }
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Account"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

