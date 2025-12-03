"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateMonthlySalaries } from "@/lib/actions/salary";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function SalaryCalculator() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleCalculate = async () => {
    setLoading(true);
    try {
      await calculateMonthlySalaries(year, month);
      toast({
        title: "Success",
        description: "Salaries calculated successfully",
      });
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to calculate salaries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Salary Calculator</CardTitle>
        <CardDescription>
          Calculate monthly salaries for co-founders (16% of profit each)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Input
              id="month"
              type="number"
              min="1"
              max="12"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </div>
        </div>
        <Button onClick={handleCalculate} disabled={loading}>
          {loading ? "Calculating..." : "Calculate Salaries"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Salaries are calculated based on approved income and expenses for the selected month.
          Each co-founder receives 16% (0.16) of the total profit.
        </p>
      </CardContent>
    </Card>
  );
}

