import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../shared/ui/card";
import { Badge } from "../../shared/ui/badge";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { useMoneyManager } from "./hooks/useMoneyManager";
import { AlertCircle, Zap, Plus, Trash2 } from "lucide-react";
import { Progress } from "../../shared/ui/progress";
import { EXPENSE_CATEGORIES, CATEGORY_ICONS } from "./constants/categories";
import type { ExpenseCategory } from "./types";

export function BudgetTracker() {
  const {
    getCurrentMonthBudget,
    getDailyAllowance,
    getFixedCommitmentsTotal,
    getAvailableAfterFixed,
    getCategoryBudgetsForCurrentMonth,
    getCategoryBudgetUsage,
    getCategoryBudgetRemaining,
    getFoodBudgetGuidance,
    createOrUpdateCategoryBudget,
    deleteCategoryBudget,
  } = useMoneyManager();

  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState<ExpenseCategory>(EXPENSE_CATEGORIES[0]);
  const [newLimit, setNewLimit] = useState("");
  const [categoryError, setCategoryError] = useState("");

  const getProgressBarClassName = (
    budgetExceeded: boolean,
    warning: boolean,
  ) => {
    if (budgetExceeded) return "bg-destructive/20";
    if (warning) return "bg-amber-200";
    return "bg-muted";
  };

  const budget = getCurrentMonthBudget();
  const dailyAllowance = getDailyAllowance();
  const fixedCommitmentsTotal = getFixedCommitmentsTotal();
  const availableAfterFixed = getAvailableAfterFixed();
  const categoryBudgets = getCategoryBudgetsForCurrentMonth();
  const foodGuidance = getFoodBudgetGuidance();

  const categoriesWithoutBudget = EXPENSE_CATEGORIES.filter(
    (cat) => !categoryBudgets.some((cb) => cb.category === cat),
  );

  const handleAddCategoryBudget = () => {
    setCategoryError("");
    const result = createOrUpdateCategoryBudget(newCategory, Number(newLimit));
    if (!result.ok) {
      setCategoryError(Object.values(result.errors)[0] || "Invalid limit.");
      return;
    }
    setNewLimit("");
    if (categoriesWithoutBudget.length <= 1) {
      setAddingCategory(false);
    } else {
      setNewCategory(categoriesWithoutBudget.find((c) => c !== newCategory) ?? EXPENSE_CATEGORIES[0]);
    }
  };

  if (!budget) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            Complete budget setup to view budget tracking.
          </p>
        </CardContent>
      </Card>
    );
  }

  const budgetUsed = (budget.totalSpent / budget.monthlyBudget) * 100;
  const budgetRemaining = budget.monthlyBudget - budget.totalSpent;
  const isBudgetExceeded = budget.totalSpent > budget.monthlyBudget;
  const isWarning = budgetUsed >= 80;

  const allocationBreakdown = [
    {
      label: "Needs",
      amount: budget.allocation.needs * (budget.monthlyBudget / 100),
      percentage: budget.allocation.needs,
      color: "bg-blue-500",
    },
    {
      label: "Wants",
      amount: budget.allocation.wants * (budget.monthlyBudget / 100),
      percentage: budget.allocation.wants,
      color: "bg-purple-500",
    },
    {
      label: "Savings",
      amount: budget.allocation.savings * (budget.monthlyBudget / 100),
      percentage: budget.allocation.savings,
      color: "bg-emerald-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Monthly Budget</CardTitle>
            {isBudgetExceeded && (
              <Badge variant="destructive" className="animate-pulse">
                <AlertCircle className="h-3 w-3 mr-1" /> Exceeded
              </Badge>
            )}
            {isWarning && !isBudgetExceeded && (
              <Badge
                variant="outline"
                className="border-amber-500 text-amber-600"
              >
                <Zap className="h-3 w-3 mr-1" /> Warning
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Budget Status */}
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Budget Status
                </p>
                <p className="text-3xl font-bold mt-1">
                  LKR {Math.abs(budgetRemaining).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isBudgetExceeded ? "Over budget" : "Budget remaining"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Spent
                </p>
                <p className="text-2xl font-bold mt-1">
                  LKR {budget.totalSpent.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  of LKR {budget.monthlyBudget.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress
                value={Math.min(budgetUsed, 100)}
                className={`h-3 ${getProgressBarClassName(isBudgetExceeded, isWarning)}`}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{budgetUsed.toFixed(0)}% used</span>
                <span>
                  {Math.max(0, 100 - budgetUsed).toFixed(0)}% remaining
                </span>
              </div>
            </div>
          </div>

          {/* Fixed Commitments Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Fixed Commitments
              </p>
              <p className="text-xl font-bold mt-1">
                LKR {fixedCommitmentsTotal.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                After fixed costs
              </p>
              <p className="text-xl font-bold mt-1">
                LKR {availableAfterFixed.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Daily Allowance */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Daily Allowance
                </p>
                <p className="text-2xl font-bold mt-1">
                  LKR {dailyAllowance.dailyBudget.toFixed(0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Today's Spending
                </p>
                <p
                  className={`text-2xl font-bold mt-1 ${
                    dailyAllowance.isWarning ? "text-destructive" : ""
                  }`}
                >
                  LKR {dailyAllowance.todaySpending.toLocaleString()}
                </p>
                {dailyAllowance.isWarning && (
                  <p className="text-xs text-destructive mt-1">
                    ⚠️ Over daily limit
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Allocation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Budget Allocation</CardTitle>
          <CardDescription>
            {budget.allocationMode === "recommended"
              ? "Chosen by you"
              : budget.allocationMode === "classic"
                ? "Classic 50/30/20 rule"
                : "Custom allocation"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {allocationBreakdown.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">
                    LKR {item.amount.toLocaleString()}
                  </p>
                </div>
                <span className="text-sm font-bold">{item.percentage}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${item.color} transition-all`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Category Budgets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Category Budgets</CardTitle>
              <CardDescription>
                Monthly limits for your spending categories
              </CardDescription>
            </div>
            {categoriesWithoutBudget.length > 0 && !addingCategory && (
              <Button variant="outline" size="sm" onClick={() => setAddingCategory(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {categoryBudgets.length === 0 && !addingCategory ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-3">
                No category budgets set for this month.
              </p>
              <Button variant="outline" size="sm" onClick={() => setAddingCategory(true)}>
                <Plus className="h-4 w-4 mr-1" /> Set Category Limits
              </Button>
            </div>
          ) : (
            categoryBudgets.map((catBudget) => {
              const used = getCategoryBudgetUsage(catBudget.category);
              const remaining = getCategoryBudgetRemaining(catBudget.category);
              const percent =
                catBudget.limit > 0
                  ? Math.min(100, (used / catBudget.limit) * 100)
                  : 0;
              return (
                <div key={catBudget.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{CATEGORY_ICONS[catBudget.category] ?? "📌"}</span>
                      <div>
                        <p className="text-sm font-medium">{catBudget.category}</p>
                        <p className="text-xs text-muted-foreground">
                          Limit LKR {catBudget.limit.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right text-sm">
                        <p>{percent.toFixed(0)}% used</p>
                        <p className="text-xs text-muted-foreground">
                          Remaining LKR {remaining.toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCategoryBudget(catBudget.id)}
                        className="text-destructive hover:text-destructive h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}

          {addingCategory && (
            <div className="space-y-3 pt-3 border-t">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium">Category</p>
                  <select
                    className="w-full p-2 border rounded-md bg-background text-sm"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ExpenseCategory)}
                  >
                    {categoriesWithoutBudget.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium">Limit (LKR)</p>
                  <Input
                    type="number"
                    placeholder="e.g., 5000"
                    value={newLimit}
                    onChange={(e) => { setNewLimit(e.target.value); setCategoryError(""); }}
                    className={categoryError ? "border-red-500" : ""}
                  />
                </div>
              </div>
              {categoryError && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {categoryError}
                </p>
              )}
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddCategoryBudget} disabled={!newLimit}>
                  Add Limit
                </Button>
                {categoriesWithoutBudget.length === 0 && (
                  <Button size="sm" variant="outline" onClick={() => { setAddingCategory(false); setNewLimit(""); }}>
                    Done
                  </Button>
                )}
              </div>
            </div>
          )}

          {foodGuidance && (
            <div className="rounded-lg border border-primary/10 bg-primary/5 p-3 text-sm text-primary-700">
              {foodGuidance}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Days Left Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Days Left This Month
              </p>
              <p className="text-3xl font-bold mt-1">
                {dailyAllowance.daysLeft}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider text-right">
                Average Daily
              </p>
              <p className="text-2xl font-bold mt-1 text-right">
                LKR{" "}
                {(
                  dailyAllowance.remainingBudget /
                  Math.max(1, dailyAllowance.daysLeft)
                ).toFixed(0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
