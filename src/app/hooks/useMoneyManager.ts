import { useState, useEffect, useCallback } from "react";
import { useUniStorage } from "./useUniStorage";
import {
  Wallet,
  Transaction,
  Budget,
  MoneyManagerSettings,
  FinancialReport,
  FinancialInsight,
  DailyAllowance,
  ExpenseCategory,
  IncomeCategory,
  BudgetAllocation,
} from "../components/MoneyManager/types";

// Helper function to get category type for expense classification
// anything not explicitly listed as a 'need' is treated as a 'want' for reporting
function getCategoryType(category: string): "needs" | "wants" | "savings" | "income" {
  const needs: ExpenseCategory[] = [
    "Food",
    "Transportation",
    "Rent / Accommodation",
    "Education",
    "Health",
    "Bills",
  ];
  const wants: ExpenseCategory[] = [
    "Dining Out",
    "Entertainment",
    "Shopping",
    "Clothing",
  ];

  if (needs.includes(category as ExpenseCategory)) return "needs";
  if (wants.includes(category as ExpenseCategory)) return "wants";
  // default for any other expense category (including 'Other')
  return "wants";
}

export function useMoneyManager() {
  const [wallets, setWallets] = useUniStorage<Wallet[]>("money-wallets", []);
  const [transactions, setTransactions] = useUniStorage<Transaction[]>(
    "money-transactions",
    []
  );
  const [budgets, setBudgets] = useUniStorage<Budget[]>("money-budgets", []);
  const [settings, setSettings] = useUniStorage<MoneyManagerSettings>(
    "money-settings",
    {
      firstTimeSetupCompleted: false,
      currency: "LKR",
    }
  );

  // Wallet Management
  const createWallet = useCallback(
    (name: string, initialBalance: number, type: Wallet["type"]) => {
      const newWallet: Wallet = {
        id: Date.now().toString(),
        name,
        balance: initialBalance,
        createdDate: new Date().toISOString().split("T")[0],
        type,
      };
      setWallets([...wallets, newWallet]);

      // Create adjustment transaction if initial balance > 0
      if (initialBalance > 0) {
        const tx: Transaction = {
          id: Date.now().toString(),
          type: "income",
          amount: initialBalance,
          category: "Allowance" as IncomeCategory,
          walletId: newWallet.id,
          description: `Initial balance for ${name}`,
          date: new Date().toISOString().split("T")[0],
        };
        setTransactions([tx, ...transactions]);
        dispatchStorageUpdate();
      }

      dispatchStorageUpdate();
      return newWallet;
    },
    [wallets, transactions, setWallets, setTransactions]
  );

  const updateWalletBalance = useCallback(
    (walletId: string, newBalance: number, createAdjustment = true) => {
      const wallet = wallets.find((w) => w.id === walletId);
      if (!wallet) return;

      const difference = newBalance - wallet.balance;
      const updatedWallets = wallets.map((w) =>
        w.id === walletId ? { ...w, balance: newBalance } : w
      );
      setWallets(updatedWallets);

      if (createAdjustment && difference !== 0) {
        // only generate adjustment when explicitly requested (e.g. manual edit)
        const tx: Transaction = {
          id: Date.now().toString(),
          type: difference > 0 ? "income" : "expense",
          amount: Math.abs(difference),
          category:
            difference > 0
              ? ("Allowance" as IncomeCategory)
              : ("Other" as ExpenseCategory),
          walletId,
          description: "Manual wallet adjustment",
          date: new Date().toISOString().split("T")[0],
        };
        setTransactions([tx, ...transactions]);
      }
      dispatchStorageUpdate();
    },
    [wallets, transactions, setWallets, setTransactions]
  );

  const deleteWallet = useCallback(
    (walletId: string) => {
      setWallets(wallets.filter((w) => w.id !== walletId));
      // also remove any transactions associated with this wallet
      setTransactions((prev) => prev.filter((t) => t.walletId !== walletId));
      dispatchStorageUpdate();
    },
    [wallets, setWallets, setTransactions]
  );

  // Transaction Management
  const addTransaction = useCallback(
    (tx: Omit<Transaction, "id">) => {
      const newTx: Transaction = {
        ...tx,
        id: Date.now().toString(),
      };
      setTransactions([newTx, ...transactions]);

      // Update wallet balance (no adjustment transaction)
      const wallet = wallets.find((w) => w.id === tx.walletId);
      if (wallet) {
        const newBalance =
          tx.type === "income" ? wallet.balance + tx.amount : wallet.balance - tx.amount;
        updateWalletBalance(tx.walletId, newBalance, false);
      }

      // adjust current month budget
      if (tx.type === "expense") {
        const now = new Date(tx.date);
        const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        setBudgets((prev) =>
          prev.map((b) =>
            b.month === monthKey ? { ...b, totalSpent: b.totalSpent + tx.amount } : b
          )
        );
      }

      dispatchStorageUpdate();
      return newTx;
    },
    [transactions, wallets, setTransactions, updateWalletBalance, setBudgets]
  );

  const updateTransaction = useCallback(
    (id: string, updates: Partial<Transaction>) => {
      const oldTx = transactions.find((t) => t.id === id);
      if (!oldTx) return;

      // compute new transaction object
      const newTx: Transaction = { ...oldTx, ...updates } as Transaction;

      // adjust wallet balances if something changed
      if (oldTx.walletId !== newTx.walletId || oldTx.type !== newTx.type || oldTx.amount !== newTx.amount) {
        // helper to compute signed amount (income positive, expense negative)
        const signed = (tx: Transaction) => (tx.type === "income" ? tx.amount : -tx.amount);

        // revert old transaction from its wallet
        const oldWallet = wallets.find((w) => w.id === oldTx.walletId);
        if (oldWallet) {
          const newBalance = oldWallet.balance - signed(oldTx);
          updateWalletBalance(oldTx.walletId, newBalance, false);
        }

        // apply new transaction to its (possibly new) wallet
        const targetWallet = wallets.find((w) => w.id === newTx.walletId);
        if (targetWallet) {
          const newBalance = targetWallet.balance + signed(newTx);
          updateWalletBalance(newTx.walletId, newBalance, false);
        }
      }

      // adjust budget if amount or type changed
      const isExpenseOld = oldTx.type === "expense";
      const isExpenseNew = newTx.type === "expense";
      const amountOld = oldTx.amount;
      const amountNew = newTx.amount;
      const dateOld = oldTx.date;
      const dateNew = newTx.date;

      setTransactions(
        transactions.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );

      // adjust budget for month
      if (isExpenseOld || isExpenseNew) {
        const oldMonth = new Date(dateOld);
        const newMonth = new Date(dateNew);
        const oldKey = `${oldMonth.getFullYear()}-${String(oldMonth.getMonth() + 1).padStart(2, "0")}`;
        const newKey = `${newMonth.getFullYear()}-${String(newMonth.getMonth() + 1).padStart(2, "0")}`;
        setBudgets((prev) =>
          prev.map((b) => {
            let delta = 0;
            if (b.month === oldKey && isExpenseOld) delta -= amountOld;
            if (b.month === newKey && isExpenseNew) delta += amountNew;
            if (delta !== 0) return { ...b, totalSpent: b.totalSpent + delta };
            return b;
          })
        );
      }

      dispatchStorageUpdate();
    },
    [transactions, wallets, updateWalletBalance, setTransactions, setBudgets]
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      const tx = transactions.find((t) => t.id === id);
      if (!tx) return;

      setTransactions(transactions.filter((t) => t.id !== id));

      // Reverse wallet balance
      const wallet = wallets.find((w) => w.id === tx.walletId);
      if (wallet) {
        const newBalance =
          tx.type === "income" ? wallet.balance - tx.amount : wallet.balance + tx.amount;
        updateWalletBalance(tx.walletId, newBalance, false);
      }

      // adjust budget
      if (tx.type === "expense") {
        const monthKey = `${new Date(tx.date).getFullYear()}-${String(
          new Date(tx.date).getMonth() + 1
        ).padStart(2, "0")}`;
        setBudgets((prev) =>
          prev.map((b) =>
            b.month === monthKey ? { ...b, totalSpent: b.totalSpent - tx.amount } : b
          )
        );
      }

      dispatchStorageUpdate();
    },
    [transactions, wallets, setTransactions, updateWalletBalance, setBudgets]
  );

  // Budget Management
  const getCurrentMonthBudget = useCallback(() => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return budgets.find((b) => b.month === monthKey);
  }, [budgets]);

  const createOrUpdateBudget = useCallback(
    (budgetData: Omit<Budget, "month" | "lastUpdated" | "totalSpent">) => {
      const now = new Date();
      const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      // recalc spent from existing transactions for accuracy
      const spent = transactions
        .filter((t) => t.type === "expense" && t.date.startsWith(monthKey))
        .reduce((sum, t) => sum + t.amount, 0);

      const existing = budgets.find((b) => b.month === monthKey);
      const newBudget: Budget = {
        ...budgetData,
        month: monthKey,
        lastUpdated: new Date().toISOString(),
        totalSpent: spent,
      };

      const updatedBudgets = existing
        ? budgets.map((b) => (b.month === monthKey ? newBudget : b))
        : [...budgets, newBudget];

      setBudgets(updatedBudgets);
      dispatchStorageUpdate();
      return newBudget;
    },
    [budgets, setBudgets, transactions]
  );

  // Calculations
  const getTotalIncome = useCallback((): number => {
    return transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getTotalExpenses = useCallback((): number => {
    return transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getBalance = useCallback((): number => {
    return getTotalIncome() - getTotalExpenses();
  }, [getTotalIncome, getTotalExpenses]);

  const getDailyAllowance = useCallback((): DailyAllowance => {
    const budget = getCurrentMonthBudget();
    if (!budget) {
      return {
        dailyBudget: 0,
        remainingBudget: 0,
        daysLeft: 0,
        todaySpending: 0,
        isWarning: false,
      };
    }

    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysPassed = now.getDate();
    const daysLeft = daysInMonth - daysPassed;
    const dailyBudget = budget.monthlyBudget / daysInMonth;
    const remainingBudget = budget.monthlyBudget - budget.totalSpent;
    // avoid division by zero when month ends
    const dailyAllowance = daysLeft > 0 ? Math.max(0, remainingBudget / daysLeft) : 0;

    // Today's spending
    const today = new Date().toISOString().split("T")[0];
    const todaySpending = transactions
      .filter((t) => t.type === "expense" && t.date === today)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      dailyBudget,
      remainingBudget,
      daysLeft,
      todaySpending,
      isWarning: todaySpending > dailyAllowance,
    };
  }, [getCurrentMonthBudget, transactions]);

  // Reporting
  const generateReport = useCallback(
    (period: "weekly" | "monthly" | "custom", startDate?: string, endDate?: string): FinancialReport => {
      let start = startDate ? new Date(startDate) : new Date();
      let end = endDate ? new Date(endDate) : new Date();

      if (period === "weekly") {
        start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      } else if (period === "monthly") {
        start = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      }

      const startStr = start.toISOString().split("T")[0];
      const endStr = end.toISOString().split("T")[0];

      const periodTransactions = transactions.filter(
        (t) => t.date >= startStr && t.date <= endStr
      );

      const totalIncome = periodTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpense = periodTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      const balance = totalIncome - totalExpense;
      const savingsPercentage = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

      // Category breakdown
      const categoryMap = new Map<string, number>();
      periodTransactions
        .filter((t) => t.type === "expense")
        .forEach((t) => {
          categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
        });

      const byCategory: Array<{
        category: string;
        amount: number;
        percentage: number;
      }> = Array.from(categoryMap.entries())
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

      // Needs vs Wants vs Savings
      const needsAmount = periodTransactions
        .filter(
          (t) =>
            t.type === "expense" && getCategoryType(t.category) === "needs"
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const wantsAmount = periodTransactions
        .filter(
          (t) =>
            t.type === "expense" && getCategoryType(t.category) === "wants"
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const savingsAmount = balance > 0 ? balance : 0;

      // Wallet breakdown
      const totalWalletBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
      const walletBreakdown = wallets.map((w) => ({
        walletId: w.id,
        walletName: w.name,
        balance: w.balance,
        percentage: totalWalletBalance > 0 ? (w.balance / totalWalletBalance) * 100 : 0,
      }));

      // Generate trends (daily)
      const trends = [];
      const currentDate = new Date(start);
      while (currentDate <= end) {
        const dateStr = currentDate.toISOString().split("T")[0];
        const dayIncome = periodTransactions
          .filter((t) => t.type === "income" && t.date === dateStr)
          .reduce((sum, t) => sum + t.amount, 0);
        const dayExpense = periodTransactions
          .filter((t) => t.type === "expense" && t.date === dateStr)
          .reduce((sum, t) => sum + t.amount, 0);

        trends.push({
          date: dateStr,
          income: dayIncome,
          expense: dayExpense,
          savings: dayIncome - dayExpense,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return {
        period,
        startDate: startStr,
        endDate: endStr,
        totalIncome,
        totalExpense,
        balance,
        savingsPercentage,
        byCategory,
        trends,
        walletBreakdown,
        needsVsWantsVsSavings: {
          needs: needsAmount,
          wants: wantsAmount,
          savings: savingsAmount,
        },
      };
    },
    [transactions, wallets]
  );

  // Insights Engine
  const generateInsights = useCallback((): FinancialInsight[] => {
    const insights: FinancialInsight[] = [];
    const budget = getCurrentMonthBudget();
    const report = generateReport("monthly");
    const dailyAllowance = getDailyAllowance();

    // Alert: Budget exceeded
    if (budget && budget.totalSpent > budget.monthlyBudget) {
      insights.push({
        id: "budget-exceeded",
        type: "alert",
        title: "Budget Exceeded",
        message: `You've exceeded your monthly budget by ${settings.currency} ${(budget.totalSpent - budget.monthlyBudget).toLocaleString()}`,
        severity: "high",
        actionable: true,
        createdAt: new Date().toISOString(),
      });
    }

    // Alert: 80% budget used
    if (
      budget &&
      budget.totalSpent >= budget.monthlyBudget * 0.8 &&
      budget.totalSpent < budget.monthlyBudget
    ) {
      insights.push({
        id: "budget-80percent",
        type: "warning",
        title: "Budget Warning",
        message: `You've used 80% of your monthly budget. Remaining: ${settings.currency} ${(budget.monthlyBudget - budget.totalSpent).toLocaleString()}`,
        severity: "high",
        actionable: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Alert: Daily spending exceeded
    if (dailyAllowance.isWarning) {
      insights.push({
        id: "daily-spending-exceeded",
        type: "alert",
        title: "Daily Allowance Exceeded",
        message: `You've spent ${settings.currency} ${dailyAllowance.todaySpending.toLocaleString()} today, exceeding your ${settings.currency} ${dailyAllowance.dailyBudget.toFixed(0)} daily allowance.`,
        severity: "medium",
        actionable: true,
        createdAt: new Date().toISOString(),
      });
    }

    // Alert: High wants spending
    if (budget && report.needsVsWantsVsSavings.wants > budget.allocation.wants) {
      const exceededBy =
        report.needsVsWantsVsSavings.wants - budget.allocation.wants;
      insights.push({
        id: "wants-exceeded",
        type: "warning",
        title: "Wants Spending High",
        message: `Your wants spending (${settings.currency} ${report.needsVsWantsVsSavings.wants.toLocaleString()}) exceeds your allocation by ${settings.currency} ${exceededBy.toLocaleString()}`,
        severity: "medium",
        actionable: true,
        createdAt: new Date().toISOString(),
      });
    }

    // Insight: Top spending category
    if (report.byCategory.length > 0) {
      const topCategory = report.byCategory[0];
      if (topCategory.percentage > 20) {
        insights.push({
          id: "high-category-spending",
          type: "insight",
          title: `High ${topCategory.category} Spending`,
          message: `${topCategory.category} accounts for ${topCategory.percentage.toFixed(0)}% of your spending this month.`,
          severity: "low",
          actionable: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Achievement: Good savings
    if (report.savingsPercentage >= 10) {
      insights.push({
        id: "good-savings",
        type: "achievement",
        title: "Great Savings!",
        message: `You've saved ${report.savingsPercentage.toFixed(0)}% of your income this month. Keep it up!`,
        severity: "low",
        actionable: false,
        createdAt: new Date().toISOString(),
      });
    }

    return insights;
  }, [getCurrentMonthBudget, generateReport, getDailyAllowance, settings]);

  // Search
  const searchTransactions = useCallback(
    (query: string): Transaction[] => {
      const lowerQuery = query.toLowerCase();
      return transactions.filter(
        (t) =>
          t.description?.toLowerCase().includes(lowerQuery) ||
          t.category.toLowerCase().includes(lowerQuery) ||
          t.amount.toString().includes(query)
      );
    },
    [transactions]
  );

  // Settings
  const completeFirstTimeSetup = useCallback(() => {
    setSettings({
      ...settings,
      firstTimeSetupCompleted: true,
    });
    dispatchStorageUpdate();
  }, [settings, setSettings]);

  // Reset all data in money manager
  const resetAll = useCallback(() => {
    setTransactions([]);
    setWallets([]);
    setBudgets([]);
    setSettings({
      firstTimeSetupCompleted: false,
      currency: settings.currency,
    });
    window.localStorage.removeItem("money-transactions");
    window.localStorage.removeItem("money-wallets");
    window.localStorage.removeItem("money-budgets");
    window.localStorage.removeItem("money-settings");
    dispatchStorageUpdate();
  }, [setTransactions, setWallets, setBudgets, setSettings, settings.currency]);

  // Helper to dispatch storage update event
  function dispatchStorageUpdate() {
    window.dispatchEvent(new CustomEvent("local-storage-update"));
  }

  return {
    // State
    wallets,
    transactions,
    budgets,
    settings,

    // Wallet operations
    createWallet,
    updateWalletBalance,
    deleteWallet,

    // Transaction operations
    addTransaction,
    updateTransaction,
    deleteTransaction,

    // Budget operations
    getCurrentMonthBudget,
    createOrUpdateBudget,

    // Calculations
    getTotalIncome,
    getTotalExpenses,
    getBalance,
    getDailyAllowance,

    // Reporting
    generateReport,

    // Insights
    generateInsights,

    // Search
    searchTransactions,

    // Settings
    completeFirstTimeSetup,

    // Reset
    resetAll,
  };
}
