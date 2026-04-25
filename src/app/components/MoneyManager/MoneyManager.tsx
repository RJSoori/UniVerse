import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useMoneyManager } from "../../hooks/useMoneyManager";
import { formatCurrency } from "../../utils/currencyUtils";
import { SetupWizard } from "./SetupWizard";
import { WalletManager } from "./WalletManager";
import { AddTransactionForm } from "./AddTransactionForm";
import { TransactionList } from "./TransactionList";
import { BudgetTracker } from "./BudgetTracker";
import { InsightsEngine } from "./InsightsEngine";
import { ReportsDashboard } from "./ReportsDashboard";
import { QuickAddTransaction } from "./QuickAddTransaction";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  AlertCircle,
  Plus,
} from "lucide-react";

export function MoneyManager() {
  const {
    settings,
    wallets,
    getBalance,
    getTotalIncome,
    getTotalExpenses,
    getCurrentMonthBudget,
    isLoading,
    error,
    reload,
  } = useMoneyManager();
  const [activeTab, setActiveTab] = useState("overview");
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    setShowWizard(!settings.firstTimeSetupCompleted);
  }, [settings.firstTimeSetupCompleted]);

  if (isLoading) {
    return (
      <div className="app-page">
        <Card>
          <CardContent className="flex min-h-[40vh] flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Loading Money Manager data</p>
              <p className="text-xs text-muted-foreground">
                Syncing with the backend...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const errorBanner = error ? (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-destructive">
            Money Manager sync issue
          </p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
        <Button variant="outline" size="sm" onClick={reload}>
          Retry
        </Button>
      </CardContent>
    </Card>
  ) : null;

  const currentBudget = getCurrentMonthBudget();

  // Show wizard for first-time setup or when user explicitly edits budget.
  // Keep this gate local to avoid re-opening due to stale settings snapshots.
  if (showWizard) {
    return (
      <div className="app-page space-y-6">
        {errorBanner}
        <SetupWizard
          initialData={currentBudget || undefined}
          onComplete={() => setShowWizard(false)}
        />
      </div>
    );
  }

  const balance = getBalance();
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();

  const summaryCards = [
    {
      title: "Current Balance",
      value: formatCurrency(balance),
      valueClass: balance >= 0 ? "text-emerald-600" : "text-destructive",
      icon: <Wallet className="size-4 text-muted-foreground" />,
    },
    {
      title: "Total Income",
      value: formatCurrency(totalIncome),
      valueClass: "text-emerald-600",
      icon: <TrendingUp className="size-4 text-emerald-500" />,
    },
    {
      title: "Total Expenses",
      value: formatCurrency(totalExpenses),
      valueClass: "text-destructive",
      icon: <TrendingDown className="size-4 text-destructive" />,
    },
  ];

  return (
    <div className="app-page">
      {errorBanner}
      {/* Header */}
      <div className="app-page-header">
        <div className="space-y-1">
          <h2 className="app-page-title">Money Manager</h2>
          <p className="app-page-subtitle">
            Manage your budget, wallets, and track spending
          </p>
        </div>
        <div className="app-page-actions">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowWizard(true)}
          >
            Edit Budget
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowQuickAdd(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> Quick Add
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.valueClass}`}>
                {card.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Add Floating Action Button */}
      <QuickAddTransaction open={showQuickAdd} onOpenChange={setShowQuickAdd} />
      <button
        className="fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-primary/30"
        onClick={() => setShowQuickAdd(true)}
        aria-label="Quick add transaction"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            <Wallet className="h-4 w-4 mr-1" /> Overview
          </TabsTrigger>
          <TabsTrigger value="wallets" className="text-xs sm:text-sm">
            <Wallet className="h-4 w-4 mr-1" /> Wallets
          </TabsTrigger>
          <TabsTrigger value="budget" className="text-xs sm:text-sm">
            <AlertCircle className="h-4 w-4 mr-1" /> Budget
          </TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs sm:text-sm">
            <BarChart3 className="h-4 w-4 mr-1" /> Transactions
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-xs sm:text-sm">
            <PieChart className="h-4 w-4 mr-1" /> Reports
          </TabsTrigger>
          <TabsTrigger value="search" className="text-xs sm:text-sm">
            🔍 Search
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <BudgetTracker />
              <TransactionList maxItems={8} />
            </div>
            <div>
              <InsightsEngine />
            </div>
          </div>
        </TabsContent>

        {/* Wallets Tab */}
        <TabsContent value="wallets" className="mt-6">
          <WalletManager />
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="mt-6">
          <BudgetTracker />
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TransactionList />
            </div>
            <div>
              {wallets.length === 0 ? (
                <Card className="border-amber-200 bg-amber-50">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-3">
                      <p className="text-sm font-semibold text-amber-900">
                        Create a wallet first
                      </p>
                      <p className="text-xs text-amber-800">
                        Go to the Wallets tab to create your first wallet before
                        adding transactions.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab("wallets")}
                        className="mt-2"
                      >
                        Go to Wallets
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <AddTransactionForm compact />
              )}
            </div>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="mt-6">
          <ReportsDashboard />
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TransactionList searchable />
            <InsightsEngine />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
