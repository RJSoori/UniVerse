import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Badge } from "../../shared/ui/badge";
import { AlertCircle, ArrowRight, Check } from "lucide-react";
import { useMoneyManager } from "./hooks/useMoneyManager";
import { AllocationMode } from "./types";
import { validateBudgetPayload } from "../../shared/validation";

interface SetupWizardProps {
  onComplete: () => void;
  // when provided, wizard will prefill values for editing
  initialData?: {
    monthlyIncome: number;
    monthlyBudget: number;
    allocationMode: AllocationMode;
    allocation: {
      needs: number;
      wants: number;
      savings: number;
    };
  };
}

export function SetupWizard({ onComplete, initialData }: SetupWizardProps) {
  const { createOrUpdateBudget, completeFirstTimeSetup } = useMoneyManager();
  const [step, setStep] = useState(1);

  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [allocationMode, setAllocationMode] =
    useState<AllocationMode>("recommended");
  const [customAllocation, setCustomAllocation] = useState({
    needs: 65,
    wants: 25,
    savings: 10,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // populate when editing existing budget
  useEffect(() => {
    if (initialData) {
      setMonthlyIncome(initialData.monthlyIncome.toString());
      setMonthlyBudget(initialData.monthlyBudget.toString());
      setAllocationMode(initialData.allocationMode);
      setCustomAllocation(initialData.allocation);
    }
  }, [initialData]);

  const handleNext = () => {
    setErrors({});
    if (step === 1 && monthlyIncome) {
      // when moving from income step, don't override budget if already set (editing case)
      if (!monthlyBudget) {
        setMonthlyBudget(monthlyIncome);
      }
      setStep(2);
    } else if (step === 2 && monthlyBudget) {
      setStep(3);
    } else if (step === 3) {
      handleComplete();
    }
  };

  const handleComplete = () => {
    let allocation = customAllocation;
    if (allocationMode === "recommended") {
      allocation = { needs: 65, wants: 25, savings: 10 };
    } else if (allocationMode === "classic") {
      allocation = { needs: 50, wants: 30, savings: 20 };
    }

    const result = createOrUpdateBudget({
      monthlyIncome: parseFloat(monthlyIncome),
      monthlyBudget: parseFloat(monthlyBudget),
      allocationMode,
      allocation,
    });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    completeFirstTimeSetup();
    onComplete();
  };

  const updateCustomAllocation = (key: string, value: number) => {
    const updated = { ...customAllocation, [key]: value };
    setCustomAllocation(updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-3">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 mx-1 rounded-full transition-colors ${
                  s === step
                    ? "bg-primary"
                    : s < step
                      ? "bg-emerald-500"
                      : "bg-muted"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-right">
            Step {step} of 3
          </p>
        </div>

        {/* Step 1: Monthly Income */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  1
                </span>
                What is your expected monthly income?
              </CardTitle>
              <CardDescription>
                This helps us understand your financial capacity and provide
                better insights.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="income">Monthly Income (LKR)</Label>
                <Input
                  id="income"
                  type="number"
                  placeholder="e.g., 50000"
                  value={monthlyIncome}
                  onChange={(e) => {
                    setMonthlyIncome(e.target.value);
                    if (errors.monthlyIncome) {
                      setErrors((prev) => ({ ...prev, monthlyIncome: "" }));
                    }
                  }}
                  className="text-lg"
                />
                {errors.monthlyIncome && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.monthlyIncome}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  💡 <span className="font-semibold">Tip:</span> Include all
                  income sources like allowance, part-time salary, freelance
                  work, etc.
                </p>
              </div>

              <Button
                onClick={handleNext}
                disabled={!monthlyIncome}
                className="w-full"
                size="lg"
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Monthly Budget */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  2
                </span>
                What is your maximum monthly spending budget?
              </CardTitle>
              <CardDescription>
                This is the maximum amount you want to spend. We'll help you
                stay within this limit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="budget">Monthly Budget (LKR)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="e.g., 40000"
                  value={monthlyBudget}
                  onChange={(e) => {
                    setMonthlyBudget(e.target.value);
                    if (errors.monthlyBudget) {
                      setErrors((prev) => ({ ...prev, monthlyBudget: "" }));
                    }
                  }}
                  className="text-lg"
                />
                {errors.monthlyBudget && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.monthlyBudget}
                  </p>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                <p className="text-sm text-amber-900 font-semibold">
                  Budget Summary
                </p>
                <div className="flex justify-between text-sm text-amber-800">
                  <span>Monthly Income:</span>
                  <span className="font-semibold">
                    LKR {parseInt(monthlyIncome || "0").toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-amber-800">
                  <span>Monthly Budget:</span>
                  <span className="font-semibold">
                    LKR {parseInt(monthlyBudget || "0").toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-amber-800">
                  <span>Potential Savings:</span>
                  <span className="font-semibold text-emerald-600">
                    LKR{" "}
                    {Math.max(
                      0,
                      parseInt(monthlyIncome || "0") -
                        parseInt(monthlyBudget || "0"),
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!monthlyBudget}
                  className="flex-1"
                  size="lg"
                >
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Allocation */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  3
                </span>
                How do you want to allocate your budget?
              </CardTitle>
              <CardDescription>
                Distribute your spending between Needs, Wants, and Savings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recommended Option */}
              <div
                onClick={() => setAllocationMode("recommended")}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  allocationMode === "recommended"
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <Badge className="bg-emerald-500">
                        Recommended for Sri Lanka
                      </Badge>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Optimized for student budgets and local living costs
                    </p>
                  </div>
                  {allocationMode === "recommended" && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Needs (essentials)</span>
                    <span className="font-bold">65%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Wants (discretionary)</span>
                    <span className="font-bold">25%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Savings</span>
                    <span className="font-bold">10%</span>
                  </div>
                </div>
              </div>

              {/* Classic Option */}
              <div
                onClick={() => setAllocationMode("classic")}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  allocationMode === "classic"
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">Classic Budget Rule</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      The traditional 50/30/20 budget allocation
                    </p>
                  </div>
                  {allocationMode === "classic" && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Needs (essentials)</span>
                    <span className="font-bold">50%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Wants (discretionary)</span>
                    <span className="font-bold">30%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Savings</span>
                    <span className="font-bold">20%</span>
                  </div>
                </div>
              </div>

              {/* Custom Option */}
              <div
                onClick={() => setAllocationMode("custom")}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  allocationMode === "custom"
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">Custom Allocation</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create your own budget distribution
                    </p>
                  </div>
                  {allocationMode === "custom" && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
                {allocationMode === "custom" && (
                  <div className="space-y-3 mt-4 pt-4 border-t">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm">Needs</Label>
                        <span className="text-sm font-bold">
                          {customAllocation.needs}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={customAllocation.needs}
                        onChange={(e) =>
                          updateCustomAllocation(
                            "needs",
                            parseInt(e.target.value),
                          )
                        }
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm">Wants</Label>
                        <span className="text-sm font-bold">
                          {customAllocation.wants}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={customAllocation.wants}
                        onChange={(e) =>
                          updateCustomAllocation(
                            "wants",
                            parseInt(e.target.value),
                          )
                        }
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm">Savings</Label>
                        <span className="text-sm font-bold">
                          {customAllocation.savings}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={customAllocation.savings}
                        onChange={(e) =>
                          updateCustomAllocation(
                            "savings",
                            parseInt(e.target.value),
                          )
                        }
                        className="w-full"
                      />
                    </div>
                    <div
                      className={`text-sm font-semibold mt-3 ${
                        customAllocation.needs +
                          customAllocation.wants +
                          customAllocation.savings ===
                        100
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      Total:{" "}
                      {customAllocation.needs +
                        customAllocation.wants +
                        customAllocation.savings}
                      %
                    </div>
                    {errors.allocation && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.allocation}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  className="flex-1"
                  size="lg"
                  disabled={
                    allocationMode === "custom" &&
                    customAllocation.needs +
                      customAllocation.wants +
                      customAllocation.savings !==
                      100
                  }
                >
                  Complete Setup <Check className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
