import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { useMoneyManager } from "../../hooks/useMoneyManager";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Calendar } from "lucide-react";
import { formatCurrency } from "../../utils/currencyUtils";

type ReportPeriod = "weekly" | "monthly" | "custom";

export function ReportsDashboard() {
  const { generateReport, generateMoneyManagerCsv } = useMoneyManager();
  const [period, setPeriod] = useState<ReportPeriod>("monthly");
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const report = generateReport(period, startDate, endDate);

  // Helper function to get balance color based on value
  const getBalanceColorClassName = (balance: number) => {
    return balance >= 0 ? "text-emerald-600" : "text-destructive";
  };

  const handleExportCsv = () => {
    const csv = generateMoneyManagerCsv("Student Name", "Degree");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `money-manager-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const COLORS = [
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#ef4444",
    "#06b6d4",
    "#f97316",
  ];

  // Prepare data for charts
  const categoryData = useMemo(
    () =>
      report.byCategory.slice(0, 8).map((item: any) => ({
        name: item.category,
        value: item.amount,
        percentage: item.percentage,
      })),
    [report.byCategory],
  );

  const needsVsWantsData = useMemo(
    () => [
      { name: "Needs", value: Math.round(report.needsVsWantsVsSavings.needs) },
      { name: "Wants", value: Math.round(report.needsVsWantsVsSavings.wants) },
      {
        name: "Savings",
        value: Math.round(report.needsVsWantsVsSavings.savings),
      },
    ],
    [report.needsVsWantsVsSavings],
  );

  const trendData = useMemo(
    () =>
      report.trends.slice(-30).map((trend: any) => ({
        date: trend.date.slice(5),
        income: trend.income,
        expense: trend.expense,
      })),
    [report.trends],
  );

  const walletData = useMemo(
    () =>
      report.walletBreakdown.map((item: any) => ({
        name: item.walletName,
        value: Math.round(item.balance),
      })),
    [report.walletBreakdown],
  );

  return (
    <div className="space-y-6">
      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Report Period</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <div className="flex flex-wrap gap-2">
              {(["weekly", "monthly"] as const).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? "default" : "outline"}
                  size="sm"
                  className="capitalize"
                  onClick={() => setPeriod(p)}
                >
                  {p}
                </Button>
              ))}
            </div>
            <Button size="sm" onClick={handleExportCsv}>
              Export CSV
            </Button>
          </div>
          {period !== "custom" && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {new Date(report.startDate).toLocaleDateString()} to{" "}
                  {new Date(report.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Total Income
            </p>
            <p className="text-2xl font-bold mt-2 text-emerald-600">
              {formatCurrency(report.totalIncome)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Total Expenses
            </p>
            <p className="text-2xl font-bold mt-2 text-destructive">
              {formatCurrency(report.totalExpense)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Balance
            </p>
            <p
              className={`text-2xl font-bold mt-2 ${getBalanceColorClassName(report.balance)}`}
            >
              {formatCurrency(report.balance)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Savings Rate
            </p>
            <p className="text-2xl font-bold mt-2 text-blue-600">
              {report.savingsPercentage.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense by Category */}
        {categoryData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Expenses by Category</CardTitle>
              <CardDescription className="text-xs">
                Top spending categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `LKR ${value?.toLocaleString()}`}
                  />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Needs vs Wants vs Savings */}
        {needsVsWantsData.some((item) => item.value > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Needs vs Wants vs Savings
              </CardTitle>
              <CardDescription className="text-xs">
                Budget allocation breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={needsVsWantsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#3b82f6" />
                    <Cell fill="#8b5cf6" />
                    <Cell fill="#10b981" />
                  </Pie>
                  <Tooltip
                    formatter={(value) => `LKR ${value?.toLocaleString()}`}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={60}
                    wrapperStyle={{ whiteSpace: "normal", overflow: "visible" }}
                    formatter={(value, entry: any) =>
                      `${value}: LKR ${entry.payload.value.toLocaleString()}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Income vs Expense Trend */}
        {trendData.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">
                Income vs Expense Trend
              </CardTitle>
              <CardDescription className="text-xs">
                Daily financial activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#10b981" />
                  <Line type="monotone" dataKey="expense" stroke="#ef4444" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Wallet Distribution */}
        {walletData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Wallet Distribution</CardTitle>
              <CardDescription className="text-xs">
                Balance across wallets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={walletData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {walletData.map((_: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `LKR ${value?.toLocaleString()}`}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={80}
                    wrapperStyle={{ whiteSpace: "normal", overflow: "visible" }}
                    formatter={(value, entry: any) =>
                      `${value}: LKR ${entry.payload.value.toLocaleString()}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Category Details */}
      {report.byCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.byCategory.map((item: any) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.category}</span>
                    <span className="text-sm">
                      LKR {item.amount.toLocaleString()} (
                      {item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
