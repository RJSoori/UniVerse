import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "../ui/dialog";
import { useMoneyManager } from "../../hooks/useMoneyManager";
import { SetupWizard } from "./SetupWizard";
import { WalletManager } from "./WalletManager";
import { AddTransactionForm } from "./AddTransactionForm";
import { TransactionList } from "./TransactionList";
import { BudgetTracker } from "./BudgetTracker";
import { InsightsEngine } from "./InsightsEngine";
import { SearchTransactions } from "./SearchTransactions";
import { ReportsDashboard } from "./ReportsDashboard";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  AlertCircle,
} from "lucide-react";

export function MoneyManager() {
  const {
    settings,
    getBalance,
    getTotalIncome,
    getTotalExpenses,
    getCurrentMonthBudget,
    resetAll,
  } = useMoneyManager();
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showWizard, setShowWizard] = useState(
    !settings.firstTimeSetupCompleted,
  );

  const currentBudget = getCurrentMonthBudget();

  // show wizard for first-time or when editing
  if (showWizard || !settings.firstTimeSetupCompleted) {
    return (
      <SetupWizard
        initialData={currentBudget || undefined}
        onComplete={() => setShowWizard(false)}
      />
    );
  }

  const balance = getBalance();
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();

  return (
    <div className="app-page">
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
            onClick={() => setShowAddTransaction(!showAddTransaction)}
            className="gap-2"
          >
            <TrendingDown className="h-4 w-4" /> Add Transaction
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Current Balance
            </CardTitle>
            <Wallet className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${balance >= 0 ? "text-emerald-600" : "text-destructive"}`}
            >
              LKR {balance.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              LKR {totalIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <TrendingDown className="size-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              LKR {totalExpenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Transaction Form */}
      {showAddTransaction && (
        <div>
          <AddTransactionForm onClose={() => setShowAddTransaction(false)} />
        </div>
      )}

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
              <AddTransactionForm compact />
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
            <SearchTransactions />
            <InsightsEngine />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
