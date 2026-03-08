import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { useMoneyManager } from "../../hooks/useMoneyManager";
import { AlertCircle, TrendingDown, Zap } from "lucide-react";
import { Progress } from "../ui/progress";

export function BudgetTracker() {
  const { getCurrentMonthBudget, getDailyAllowance } = useMoneyManager();
  const budget = getCurrentMonthBudget();
  const dailyAllowance = getDailyAllowance();

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
                className={`h-3 ${
                  isBudgetExceeded
                    ? "bg-destructive/20"
                    : isWarning
                      ? "bg-amber-200"
                      : "bg-muted"
                }`}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{budgetUsed.toFixed(0)}% used</span>
                <span>
                  {Math.max(0, 100 - budgetUsed).toFixed(0)}% remaining
                </span>
              </div>
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
