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
import { formatCurrency } from "../../utils/currencyUtils";

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

  // Helper functions for styling
  const getCompactCardClassName = () =>
    compact ? "hover:shadow-md transition-all" : "";
  const getCompactHeaderClassName = () => (compact ? "pb-2" : "");
  const getCompactTitleClassName = () => (compact ? "text-sm" : "");
  const getCompactContentClassName = () =>
    `space-y-4 ${compact ? "space-y-2" : ""}`;
  const getBalanceColorClassName = (bal: number) =>
    bal >= 0 ? "text-emerald-600" : "text-destructive";
  const getBalanceSizeClassName = () => (compact ? "text-lg" : "text-2xl");
  const getButtonSizeClass = () => (compact ? "sm" : "default");
  const getButtonClassName = () => `w-full ${compact ? "text-xs h-8" : ""}`;
  const getButtonText = () => (compact ? "View Details" : "Open Money Manager");
  const getIconSizeClassName = () => `ml-2 ${compact ? "h-3 w-3" : "h-4 w-4"}`;

  return (
    <Card className={getCompactCardClassName()}>
      <CardHeader className={getCompactHeaderClassName()}>
        <div className="flex items-center justify-between">
          <CardTitle className={getCompactTitleClassName()}>
            💰 Money Manager
          </CardTitle>
          {!compact && <Wallet className="h-5 w-5 text-primary" />}
        </div>
        {!compact && (
          <CardDescription>Track your finances at a glance</CardDescription>
        )}
      </CardHeader>
      <CardContent className={getCompactContentClassName()}>
        {/* Balance */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Current Balance
          </p>
          <p
            className={`font-bold mt-1 ${getBalanceColorClassName(balance)} ${getBalanceSizeClassName()}`}
          >
            {formatCurrency(balance)}
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
              {formatCurrency(
                Math.abs(budget.monthlyBudget - budget.totalSpent),
              )}
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
            size={getButtonSizeClass() as "sm" | "default"}
            className={getButtonClassName()}
            onClick={() => onNavigate("money")}
          >
            {getButtonText()}
            <ArrowRight className={getIconSizeClassName()} />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
