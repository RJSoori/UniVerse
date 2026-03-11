import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { useMoneyManager } from "../../hooks/useMoneyManager";
import { ArrowRight, TrendingDown, Wallet } from "lucide-react";
import { Progress } from "../ui/progress";

interface MoneyWidgetProps {
  onNavigate?: (section: string) => void;
  compact?: boolean;
}

export function MoneyWidget({ onNavigate, compact }: MoneyWidgetProps) {
  const { getBalance, getCurrentMonthBudget, generateReport } =
    useMoneyManager();

  const balance = getBalance();
  const budget = getCurrentMonthBudget();
  const report = generateReport("monthly");

  const budgetUsed = budget
    ? (budget.totalSpent / budget.monthlyBudget) * 100
    : 0;

  // Top expense category
  const topCategory = report.byCategory[0];

  return (
    <Card className={compact ? "hover:shadow-md transition-all" : ""}>
      <CardHeader className={compact ? "pb-2" : ""}>
        <div className="flex items-center justify-between">
          <CardTitle className={compact ? "text-sm" : ""}>
            💰 Money Manager
          </CardTitle>
          {!compact && <Wallet className="h-5 w-5 text-primary" />}
        </div>
        {!compact && (
          <CardDescription>Track your finances at a glance</CardDescription>
        )}
      </CardHeader>
      <CardContent className={`space-y-4 ${compact ? "space-y-2" : ""}`}>
        {/* Balance */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Current Balance
          </p>
          <p
            className={`font-bold mt-1 ${balance >= 0 ? "text-emerald-600" : "text-destructive"} ${
              compact ? "text-lg" : "text-2xl"
            }`}
          >
            LKR {balance.toLocaleString()}
          </p>
        </div>

        {/* Budget Status */}
        {budget && (
          <div className="space-y-1 pt-2 border-t">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Budget Remaining
              </p>
              <span
                className={`text-xs font-bold ${
                  budget.totalSpent > budget.monthlyBudget
                    ? "text-destructive"
                    : "text-emerald-600"
                }`}
              >
                {budgetUsed.toFixed(0)}%
              </span>
            </div>
            <Progress
              value={Math.min(budgetUsed, 100)}
              className={`h-2 ${
                budgetUsed > 80 ? "bg-destructive/20" : "bg-muted"
              }`}
            />
            <p className="text-xs text-muted-foreground mt-1">
              LKR{" "}
              {Math.abs(
                budget.monthlyBudget - budget.totalSpent,
              ).toLocaleString()}
              {budget.totalSpent > budget.monthlyBudget ? " over" : " left"}
            </p>
          </div>
        )}

        {/* Top Expense Category */}
        {topCategory && (
          <div className="bg-accent/50 rounded-lg p-2 border">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Top Spending
            </p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-medium flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-destructive" />
                {topCategory.category}
              </span>
              <span className="text-sm font-bold">
                {topCategory.percentage.toFixed(0)}%
              </span>
            </div>
          </div>
        )}

        {/* Savings Rate */}
        <div className="bg-emerald-50 rounded-lg p-2 border border-emerald-200">
          <p className="text-xs text-emerald-700 uppercase tracking-wider font-semibold">
            Savings Rate
          </p>
          <p className="text-lg font-bold text-emerald-600 mt-1">
            {report.savingsPercentage.toFixed(1)}%
          </p>
        </div>

        {/* Action Button */}
        {onNavigate && (
          <Button
            variant="outline"
            size={compact ? "sm" : "default"}
            className={`w-full ${compact ? "text-xs h-8" : ""}`}
            onClick={() => onNavigate("money")}
          >
            {compact ? "View Details" : "Open Money Manager"}
            <ArrowRight className={`ml-2 ${compact ? "h-3 w-3" : "h-4 w-4"}`} />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
