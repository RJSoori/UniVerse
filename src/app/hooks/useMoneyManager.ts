import { useState, useEffect, useCallback, useRef } from "react";
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
  RecurringExpense,
  CategoryBudget,
} from "../components/MoneyManager/types";
import { getCurrentISTDate, getCurrentISTTime } from "../utils/dateUtils";
import { escapeCsvValue, formatCsv } from "../utils/csvUtils";
import {
  roundMoney,
  type ValidationResult,
  validateBudgetPayload,
  validateCategoryBudgetPayload,
  validateRecurringExpensePayload,
  validateTransactionPayload,
  validateWalletPayload,
} from "../utils/validation";
import { loadMoneyManagerState, saveMoneyManagerState } from "../utils/moneyManagerApi";

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

function getMonthKey(date: string | Date): string {
  if (typeof date === "string") {
    return date.slice(0, 7);
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getDateForMonth(year: number, monthIndex: number, day: number): string {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const normalizedDay = Math.min(day, daysInMonth);
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(normalizedDay).padStart(2, "0")}`;
}

function datePartsFromYmd(value: string): { year: number; month: number; day: number } {
  const [year, month, day] = value.split("-").map(Number);
  return { year, month, day };
}

function formatLocalDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// Note: escapeCsvValue now imported from csvUtils.ts for DRY principle
// Keeping this function for backward compatibility but use csvUtils version

export function useMoneyManager() {
  const [wallets, setWallets] = useUniStorage<Wallet[]>("money-wallets", []);
  const [transactions, setTransactions] = useUniStorage<Transaction[]>(
    "money-transactions",
    []
  );
  const [budgets, setBudgets] = useUniStorage<Budget[]>("money-budgets", []);
  const [recurringExpenses, setRecurringExpenses] = useUniStorage<RecurringExpense[]>(
    "money-recurring-expenses",
    []
  );
  const [categoryBudgets, setCategoryBudgets] = useUniStorage<CategoryBudget[]>(
    "money-category-budgets",
    []
  );
  const [settings, setSettings] = useUniStorage<MoneyManagerSettings>(
    "money-settings",
    {
      firstTimeSetupCompleted: false,
      currency: "LKR",
    }
  );
  const hasHydratedFromBackend = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const hasLocalData =
      wallets.length > 0 ||
      transactions.length > 0 ||
      budgets.length > 0 ||
      recurringExpenses.length > 0 ||
      categoryBudgets.length > 0 ||
      settings.firstTimeSetupCompleted ||
      settings.currency !== "LKR" ||
      Boolean(settings.theme);

    const hasRemoteData = (state: Awaited<ReturnType<typeof loadMoneyManagerState>>) =>
      state.wallets.length > 0 ||
      state.transactions.length > 0 ||
      state.budgets.length > 0 ||
      state.recurringExpenses.length > 0 ||
      state.categoryBudgets.length > 0 ||
      state.settings.firstTimeSetupCompleted ||
      state.settings.currency !== "LKR" ||
      Boolean(state.settings.theme);

    async function hydrateFromBackend() {
      try {
        const remoteState = await loadMoneyManagerState();
        if (cancelled) {
          return;
        }

        if (hasRemoteData(remoteState)) {
          setWallets(remoteState.wallets);
          setTransactions(remoteState.transactions);
          setBudgets(remoteState.budgets);
          setRecurringExpenses(remoteState.recurringExpenses);
          setCategoryBudgets(remoteState.categoryBudgets);
          setSettings(remoteState.settings);
        } else if (hasLocalData) {
          void saveMoneyManagerState({
            wallets,
            transactions,
            budgets,
            recurringExpenses,
            categoryBudgets,
            settings,
          });
        }
      } catch (error) {
        console.error("Failed to load Money Manager data from backend:", error);
      } finally {
        if (!cancelled) {
          hasHydratedFromBackend.current = true;
        }
      }
    }

    void hydrateFromBackend();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hasHydratedFromBackend.current) {
      return;
    }

    void saveMoneyManagerState({
      wallets,
      transactions,
      budgets,
      recurringExpenses,
      categoryBudgets,
      settings,
    }).catch((error) => {
      console.error("Failed to sync Money Manager data to backend:", error);
    });
  }, [wallets, transactions, budgets, recurringExpenses, categoryBudgets, settings]);

  const applyWalletBalance = useCallback(
    (walletId: string, newBalance: number) => {
      setWallets((currentWallets) =>
        currentWallets.map((wallet) =>
          wallet.id === walletId
            ? { ...wallet, balance: roundMoney(newBalance) }
            : wallet,
        ),
      );
    },
    [setWallets],
  );

  const getMonthlyBudgetRemaining = useCallback(
    (date: string) => {
      const monthKey = getMonthKey(date);
      const budget = budgets.find((item) => item.month === monthKey);
      if (!budget) return undefined;
      return roundMoney(budget.monthlyBudget - budget.totalSpent);
    },
    [budgets],
  );

  const getCategoryBudgetRemainingForDate = useCallback(
    (category: string, date: string) => {
      const monthKey = getMonthKey(date);
      const categoryBudget = categoryBudgets.find(
        (item) => item.category === category && item.month === monthKey,
      );
      if (!categoryBudget) return undefined;
      const spent = transactions
        .filter(
          (transaction) =>
            transaction.type === "expense" &&
            transaction.category === category &&
            getMonthKey(transaction.date) === monthKey,
        )
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      return roundMoney(categoryBudget.limit - spent);
    },
    [categoryBudgets, transactions],
  );

  // Wallet Management
  const createWallet = useCallback(
    (
      name: string,
      initialBalance: number,
      type: Wallet["type"],
      includeInTotal: boolean = true,
    ): ValidationResult<Wallet> => {
      const validation = validateWalletPayload(
        { name, balance: initialBalance, type, includeInTotal },
        wallets.map((wallet) => wallet.name),
      );
      if (!validation.ok) {
        return validation;
      }

      const newWallet: Wallet = {
        id: Date.now().toString(),
        name: validation.value.name,
        balance: validation.value.balance,
        createdDate: getCurrentISTDate(),
        type,
        includeInTotal,
      };
      setWallets([...wallets, newWallet]);

      // Create adjustment transaction if initial balance > 0
      if (validation.value.balance > 0) {
        const tx: Transaction = {
          id: Date.now().toString(),
          type: "income",
          amount: validation.value.balance,
          category: "Allowance" as IncomeCategory,
          walletId: newWallet.id,
          description: `Initial balance for ${validation.value.name}`,
          date: getCurrentISTDate(),
          time: getCurrentISTTime(),
        };
        setTransactions([tx, ...transactions]);
        dispatchStorageUpdate();
      }

      dispatchStorageUpdate();
      return { ok: true, value: newWallet };
    },
    [wallets, transactions, setWallets, setTransactions]
  );

  const updateWallet = useCallback(
    (walletId: string, updates: Partial<Wallet>) => {
      const wallet = wallets.find((w) => w.id === walletId);
      if (!wallet) return;
      const updatedWallets = wallets.map((w) =>
        w.id === walletId ? { ...w, ...updates } : w
      );
      setWallets(updatedWallets);
      dispatchStorageUpdate();
    },
    [wallets, setWallets]
  );

  const updateWalletBalance = useCallback(
    (walletId: string, newBalance: number, createAdjustment = true): ValidationResult<Wallet> => {
      const wallet = wallets.find((w) => w.id === walletId);
      if (!wallet) {
        return { ok: false, errors: { walletId: "Wallet not found." } };
      }

      const validation = validateWalletPayload(
        {
          name: wallet.name,
          balance: newBalance,
          type: wallet.type,
          includeInTotal: wallet.includeInTotal,
        },
        wallets
          .filter((item) => item.id !== walletId)
          .map((item) => item.name),
      );
      if (!validation.ok) {
        return validation;
      }

      const difference = roundMoney(validation.value.balance - wallet.balance);
      const updatedWallets = wallets.map((w) =>
        w.id === walletId ? { ...w, balance: validation.value.balance } : w
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
          date: getCurrentISTDate(),
          time: getCurrentISTTime(),
        };
        setTransactions([tx, ...transactions]);
      }
      dispatchStorageUpdate();
      return {
        ok: true,
        value: updatedWallets.find((item) => item.id === walletId)!,
      };
    },
    [wallets, transactions, setWallets, setTransactions]
  );

  const deleteWallet = useCallback(
    (walletId: string): ValidationResult<{ id: string }> => {
      const hasLinkedTransactions = transactions.some((transaction) => transaction.walletId === walletId);
      const hasLinkedRecurringExpenses = recurringExpenses.some((expense) => expense.walletId === walletId);
      if (hasLinkedTransactions || hasLinkedRecurringExpenses) {
        return {
          ok: false,
          errors: {
            general:
              "This wallet still has transactions or recurring expenses linked to it.",
          },
        };
      }
      setWallets(wallets.filter((w) => w.id !== walletId));
      dispatchStorageUpdate();
      return { ok: true, value: { id: walletId } };
    },
    [recurringExpenses, setWallets, transactions, wallets]
  );

  const getIncludedWalletBalance = useCallback(() => {
    return wallets
      .filter((wallet) => wallet.includeInTotal)
      .reduce((sum, wallet) => sum + wallet.balance, 0);
  }, [wallets]);

  const getCurrentMonthKey = useCallback(() => {
    return getCurrentISTDate().slice(0, 7);
  }, []);

  const isExpenseActiveForMonth = useCallback(
    (expense: RecurringExpense, monthKey: string) => {
      const [year, month] = monthKey.split("-").map(Number);
      const monthStart = new Date(year, month - 1, 1);
      const startDateParts = datePartsFromYmd(expense.startDate);
      const endDateParts = datePartsFromYmd(expense.endDate);
      const startMonth = new Date(
        startDateParts.year,
        startDateParts.month - 1,
        1
      );
      const endMonth = new Date(
        endDateParts.year,
        endDateParts.month - 1,
        1
      );
      return monthStart >= startMonth && monthStart <= endMonth;
    },
    []
  );

  const processRecurringExpenses = useCallback(
    (expenses: RecurringExpense[] = recurringExpenses) => {
      const todayParts = datePartsFromYmd(getCurrentISTDate());
      const endOfToday = new Date(todayParts.year, todayParts.month - 1, todayParts.day);
      const generatedTransactions: Transaction[] = [];
      const walletBalanceMap = new Map(wallets.map((w) => [w.id, w.balance]));
      let updatedExpenses = expenses;

      expenses.forEach((expense) => {
        if (expense.frequency !== "monthly") return;

        const startDateParts = datePartsFromYmd(expense.startDate);
        const endDateParts = datePartsFromYmd(expense.endDate);
        const expenseStart = new Date(
          startDateParts.year,
          startDateParts.month - 1,
          startDateParts.day,
        );
        const expenseEnd = new Date(
          endDateParts.year,
          endDateParts.month - 1,
          endDateParts.day,
        );
        const lastProcessed = expense.lastProcessedDate
          ? new Date(expense.lastProcessedDate)
          : null;
        const processUntil = expenseEnd < endOfToday ? expenseEnd : endOfToday;
        if (processUntil < expenseStart) return;

        let current = new Date(expenseStart.getFullYear(), expenseStart.getMonth(), 1);
        const lastMonth = new Date(processUntil.getFullYear(), processUntil.getMonth(), 1);
        const processedMonths: string[] = [];

        while (current <= lastMonth) {
          const monthKey = getMonthKey(current);
          const hasTransaction = transactions.some(
            (tx) => tx.recurringId === expense.id && tx.date.startsWith(monthKey)
          );

          if (!hasTransaction && isExpenseActiveForMonth(expense, monthKey)) {
            const scheduleDay = parseInt(expense.startDate.split("-")[2], 10) || 1;
            const targetDate = getDateForMonth(
              current.getFullYear(),
              current.getMonth(),
              scheduleDay,
            );
            const currentWalletBalance = walletBalanceMap.get(expense.walletId) ?? 0;
            const transactionValidation = validateTransactionPayload(
              {
                type: "expense",
                amount: expense.amount,
                category: expense.category,
                walletId: expense.walletId,
                description: `Recurring: ${expense.title}`,
                date: targetDate,
                time: getCurrentISTTime(),
              },
              {
                walletBalance: currentWalletBalance,
                isFutureDate: false,
                walletExists: wallets.some((wallet) => wallet.id === expense.walletId),
                monthlyBudgetLeft: getMonthlyBudgetRemaining(targetDate),
                categoryBudgetLeft: getCategoryBudgetRemainingForDate(
                  expense.category,
                  targetDate,
                ),
              },
            );
            if (!transactionValidation.ok) {
              continue;
            }

            const newTx: Transaction = {
              id: Date.now().toString() + Math.random().toString(36).slice(2),
              ...transactionValidation.value,
              isRecurring: true,
              recurringId: expense.id,
            };
            generatedTransactions.push(newTx);
            walletBalanceMap.set(
              expense.walletId,
              roundMoney(currentWalletBalance - transactionValidation.value.amount),
            );
            processedMonths.push(monthKey);
          }

          current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
        }

        if (processedMonths.length > 0) {
          const latestProcessed = processedMonths[processedMonths.length - 1];
          const [year, month] = latestProcessed.split("-").map(Number);
          const newLastProcessedDate = `${year}-${String(month).padStart(2, "0")}-01`;
          updatedExpenses = updatedExpenses.map((entry) =>
            entry.id === expense.id
              ? { ...entry, lastProcessedDate: newLastProcessedDate }
              : entry,
          );
        }
      });

      if (generatedTransactions.length > 0) {
        setTransactions((prev) => [...generatedTransactions, ...prev]);
        setWallets(
          wallets.map((wallet) =>
            walletBalanceMap.has(wallet.id)
              ? { ...wallet, balance: walletBalanceMap.get(wallet.id) ?? wallet.balance }
              : wallet,
          ),
        );
        setRecurringExpenses(updatedExpenses);
        dispatchStorageUpdate();
      }
    },
    [recurringExpenses, transactions, wallets, setTransactions, setWallets, setRecurringExpenses, getMonthKey, isExpenseActiveForMonth]
  );

  useEffect(() => {
    processRecurringExpenses();
  }, [processRecurringExpenses]);

  const getRecurringExpensesForCurrentMonth = useCallback(() => {
    const monthKey = getCurrentMonthKey();
    return recurringExpenses.filter((expense) =>
      isExpenseActiveForMonth(expense, monthKey),
    );
  }, [recurringExpenses, getCurrentMonthKey, isExpenseActiveForMonth]);

  const getFixedCommitmentsTotal = useCallback(() => {
    return getRecurringExpensesForCurrentMonth().reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );
  }, [getRecurringExpensesForCurrentMonth]);

  const getCategoryBudgetsForCurrentMonth = useCallback(() => {
    const monthKey = getCurrentMonthKey();
    return categoryBudgets.filter((budget) => budget.month === monthKey);
  }, [categoryBudgets, getCurrentMonthKey]);

  const getCategoryBudgetUsage = useCallback(
    (category: ExpenseCategory) => {
      const monthKey = getCurrentMonthKey();
      const used = transactions
        .filter(
          (t) =>
            t.type === "expense" &&
            t.category === category &&
            t.date.startsWith(monthKey),
        )
        .reduce((sum, t) => sum + t.amount, 0);
      return used;
    },
    [transactions, getCurrentMonthKey],
  );

  const getCategoryBudgetRemaining = useCallback(
    (category: ExpenseCategory) => {
      const budget = getCategoryBudgetsForCurrentMonth().find(
        (item) => item.category === category,
      );
      if (!budget) return 0;
      const used = getCategoryBudgetUsage(category);
      return Math.max(0, budget.limit - used);
    },
    [getCategoryBudgetsForCurrentMonth, getCategoryBudgetUsage],
  );

  const getCurrentMonthBudget = useCallback(() => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return budgets.find((b) => b.month === monthKey);
  }, [budgets]);

  const getAvailableAfterFixed = useCallback(() => {
    const budget = getCurrentMonthBudget();
    if (!budget) return 0;
    return Math.max(0, budget.monthlyBudget - getFixedCommitmentsTotal());
  }, [getCurrentMonthBudget, getFixedCommitmentsTotal]);

  const getRemainingFlexibleBudget = useCallback(() => {
    const availableAfterFixed = getAvailableAfterFixed();
    const totalCategoryLimits = getCategoryBudgetsForCurrentMonth().reduce(
      (sum, item) => sum + item.limit,
      0,
    );
    return Math.max(0, availableAfterFixed - totalCategoryLimits);
  }, [getAvailableAfterFixed, getCategoryBudgetsForCurrentMonth]);

  const getFoodBudgetGuidance = useCallback(() => {
    const foodBudget = getCategoryBudgetsForCurrentMonth().find(
      (item) => item.category === "Food",
    );
    if (!foodBudget) return null;
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const averageDailyLimit = Math.max(0, foodBudget.limit / daysInMonth);
    return `To stay within Rs. ${foodBudget.limit.toLocaleString()}, limit daily food spending to Rs. ${averageDailyLimit.toFixed(0)}.`;
  }, [getCategoryBudgetsForCurrentMonth]);

  const createRecurringExpense = useCallback(
    (
      details: Omit<RecurringExpense, "id" | "lastProcessedDate">,
    ): ValidationResult<RecurringExpense> => {
      const validation = validateRecurringExpensePayload(details, wallets.map((wallet) => wallet.id));
      if (!validation.ok) {
        return validation;
      }

      const newExpense: RecurringExpense = {
        ...validation.value,
        id: Date.now().toString(),
        lastProcessedDate: undefined,
      };
      const updated = [...recurringExpenses, newExpense];
      setRecurringExpenses(updated);
      processRecurringExpenses(updated);
      return { ok: true, value: newExpense };
    },
    [processRecurringExpenses, recurringExpenses, setRecurringExpenses, wallets]
  );

  const updateRecurringExpense = useCallback(
    (id: string, updates: Partial<RecurringExpense>): ValidationResult<RecurringExpense> => {
      const existingExpense = recurringExpenses.find((expense) => expense.id === id);
      if (!existingExpense) {
        return { ok: false, errors: { general: "Recurring expense not found." } };
      }

      const candidate = { ...existingExpense, ...updates };
      const validation = validateRecurringExpensePayload(
        {
          title: candidate.title,
          amount: candidate.amount,
          category: candidate.category,
          walletId: candidate.walletId,
          frequency: candidate.frequency,
          startDate: candidate.startDate,
          endDate: candidate.endDate,
        },
        wallets.map((wallet) => wallet.id),
      );
      if (!validation.ok) {
        return validation;
      }

      const updated = recurringExpenses.map((expense) =>
        expense.id === id ? { ...expense, ...validation.value } : expense,
      );
      setRecurringExpenses(updated);
      processRecurringExpenses(updated);
      return {
        ok: true,
        value: updated.find((expense) => expense.id === id)!,
      };
    },
    [processRecurringExpenses, recurringExpenses, setRecurringExpenses, wallets]
  );

  const deleteRecurringExpense = useCallback(
    (id: string) => {
      setRecurringExpenses(recurringExpenses.filter((expense) => expense.id !== id));
      dispatchStorageUpdate();
    },
    [recurringExpenses, setRecurringExpenses]
  );

  const createOrUpdateCategoryBudget = useCallback(
    (category: ExpenseCategory, limit: number): ValidationResult<CategoryBudget> => {
      const monthKey = getCurrentMonthKey();
      const monthBudget = budgets.find((budget) => budget.month === monthKey);
      const validation = validateCategoryBudgetPayload(
        limit,
        monthBudget?.monthlyBudget,
      );
      if (!validation.ok) {
        return validation;
      }
      const existing = categoryBudgets.find(
        (budget) => budget.category === category && budget.month === monthKey,
      );

      if (existing) {
        const updated = categoryBudgets.map((budget) =>
          budget.id === existing.id
            ? { ...budget, limit: validation.value.limit }
            : budget,
        );
        setCategoryBudgets(updated);
        return {
          ok: true,
          value: updated.find((budget) => budget.id === existing.id)!,
        };
      }

      const newBudget: CategoryBudget = {
        id: Date.now().toString(),
        category,
        limit: validation.value.limit,
        month: monthKey,
      };
      setCategoryBudgets([...categoryBudgets, newBudget]);
      return { ok: true, value: newBudget };
    },
    [budgets, categoryBudgets, getCurrentMonthKey, setCategoryBudgets]
  );

  const deleteCategoryBudget = useCallback(
    (id: string) => {
      setCategoryBudgets(categoryBudgets.filter((budget) => budget.id !== id));
      dispatchStorageUpdate();
    },
    [categoryBudgets, setCategoryBudgets]
  );

  const addTransaction = useCallback(
    (tx: Omit<Transaction, "id">): ValidationResult<Transaction> => {
      const wallet = wallets.find((item) => item.id === tx.walletId);
      const validation = validateTransactionPayload(tx, {
        walletBalance: wallet?.balance ?? 0,
        isFutureDate: false,
        walletExists: Boolean(wallet),
        monthlyBudgetLeft: getMonthlyBudgetRemaining(tx.date),
        categoryBudgetLeft: getCategoryBudgetRemainingForDate(tx.category, tx.date),
      });
      if (!validation.ok) {
        return validation;
      }

      const newTx: Transaction = {
        ...validation.value,
        id: Date.now().toString(),
      };
      setTransactions([newTx, ...transactions]);

      // Update wallet balance (no adjustment transaction)
      if (wallet) {
        const newBalance =
          newTx.type === "income"
            ? wallet.balance + newTx.amount
            : wallet.balance - newTx.amount;
        applyWalletBalance(tx.walletId, newBalance);
      }

      // adjust current month budget
      if (newTx.type === "expense") {
        const now = new Date(newTx.date);
        const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        setBudgets((prev) =>
          prev.map((b) =>
            b.month === monthKey
              ? { ...b, totalSpent: roundMoney(b.totalSpent + newTx.amount) }
              : b
          )
        );
      }

      dispatchStorageUpdate();
      return { ok: true, value: newTx, warnings: validation.warnings };
    },
    [
      applyWalletBalance,
      getCategoryBudgetRemainingForDate,
      getMonthlyBudgetRemaining,
      transactions,
      wallets,
      setTransactions,
      setBudgets,
    ]
  );

  const updateTransaction = useCallback(
    (id: string, updates: Partial<Transaction>): ValidationResult<Transaction> => {
      const oldTx = transactions.find((t) => t.id === id);
      if (!oldTx) {
        return { ok: false, errors: { general: "Transaction not found." } };
      }

      // compute new transaction object
      const newTx: Transaction = { ...oldTx, ...updates } as Transaction;
      const walletBalances = new Map(wallets.map((wallet) => [wallet.id, wallet.balance]));
      const revertAmount =
        oldTx.type === "income"
          ? (walletBalances.get(oldTx.walletId) ?? 0) - oldTx.amount
          : (walletBalances.get(oldTx.walletId) ?? 0) + oldTx.amount;
      walletBalances.set(oldTx.walletId, roundMoney(revertAmount));

      const validation = validateTransactionPayload(newTx, {
        walletBalance: walletBalances.get(newTx.walletId) ?? 0,
        isFutureDate: false,
        walletExists: wallets.some((wallet) => wallet.id === newTx.walletId),
        monthlyBudgetLeft: getMonthlyBudgetRemaining(newTx.date),
        categoryBudgetLeft: getCategoryBudgetRemainingForDate(newTx.category, newTx.date),
      });
      if (!validation.ok) {
        return validation;
      }
      const normalizedTx: Transaction = { ...oldTx, ...validation.value, id };

      // adjust wallet balances if something changed
      if (
        oldTx.walletId !== normalizedTx.walletId ||
        oldTx.type !== normalizedTx.type ||
        oldTx.amount !== normalizedTx.amount
      ) {
        // helper to compute signed amount (income positive, expense negative)
        const signed = (tx: Transaction) => (tx.type === "income" ? tx.amount : -tx.amount);

        // revert old transaction from its wallet
        const oldWallet = wallets.find((w) => w.id === oldTx.walletId);
        if (oldWallet) {
          const newBalance = oldWallet.balance - signed(oldTx);
          applyWalletBalance(oldTx.walletId, newBalance);
        }

        // apply new transaction to its (possibly new) wallet
        const targetWallet = wallets.find((w) => w.id === normalizedTx.walletId);
        if (targetWallet) {
          const newBalance = targetWallet.balance + signed(normalizedTx);
          applyWalletBalance(normalizedTx.walletId, newBalance);
        }
      }

      // adjust budget if amount or type changed
      const isExpenseOld = oldTx.type === "expense";
      const isExpenseNew = normalizedTx.type === "expense";
      const amountOld = oldTx.amount;
      const amountNew = normalizedTx.amount;
      const dateOld = oldTx.date;
      const dateNew = normalizedTx.date;

      setTransactions(
        transactions.map((t) => (t.id === id ? normalizedTx : t))
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
            if (delta !== 0) return { ...b, totalSpent: roundMoney(b.totalSpent + delta) };
            return b;
          })
        );
      }

      dispatchStorageUpdate();
      return { ok: true, value: normalizedTx, warnings: validation.warnings };
    },
    [
      applyWalletBalance,
      getCategoryBudgetRemainingForDate,
      getMonthlyBudgetRemaining,
      transactions,
      wallets,
      setTransactions,
      setBudgets,
    ]
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
        const monthKey = tx.date.slice(0, 7);
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
  const createOrUpdateBudget = useCallback(
    (
      budgetData: Omit<Budget, "month" | "lastUpdated" | "totalSpent">,
    ): ValidationResult<Budget> => {
      const validation = validateBudgetPayload(budgetData);
      if (!validation.ok) {
        return validation;
      }

      const monthKey = getCurrentISTDate().slice(0, 7);

      // recalc spent from existing transactions for accuracy
      const spent = transactions
        .filter((t) => t.type === "expense" && t.date.startsWith(monthKey))
        .reduce((sum, t) => sum + t.amount, 0);

      const existing = budgets.find((b) => b.month === monthKey);
      const newBudget: Budget = {
        ...validation.value,
        month: monthKey,
        lastUpdated: new Date().toISOString(),
        totalSpent: roundMoney(spent),
      };

      const updatedBudgets = existing
        ? budgets.map((b) => (b.month === monthKey ? newBudget : b))
        : [...budgets, newBudget];

      setBudgets(updatedBudgets);
      dispatchStorageUpdate();
      return { ok: true, value: newBudget };
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

      const todayDate = getCurrentISTDate();
      const [year, month, day] = todayDate.split("-").map(Number);
      const daysInMonth = new Date(year, month, 0).getDate();
      const daysPassed = day;
    const daysLeft = daysInMonth - daysPassed;
    const dailyBudget = budget.monthlyBudget / daysInMonth;
    const remainingBudget = budget.monthlyBudget - budget.totalSpent;
    // avoid division by zero when month ends
    const dailyAllowance = daysLeft > 0 ? Math.max(0, remainingBudget / daysLeft) : 0;

    // Today's spending
      const today = getCurrentISTDate();
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

      const startStr = formatLocalDate(start);
      const endStr = formatLocalDate(end);

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
        const dateStr = formatLocalDate(currentDate);
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

  const generateMoneyManagerCsv = useCallback(
    (studentName: string = "Student Name", degree: string = "Degree") => {
      const dateGenerated = new Date().toISOString();
      const totalIncome = getTotalIncome();
      const totalExpense = getTotalExpenses();
      const balance = getBalance();
      const walletRows = wallets.map((wallet) => [
        wallet.name,
        wallet.balance,
        wallet.includeInTotal ? "Yes" : "No",
      ]);
      const transactionRows = transactions.map((tx) => {
        const walletName = wallets.find((w) => w.id === tx.walletId)?.name ?? "Unknown";
        return [
          tx.date,
          tx.description || "",
          tx.category,
          tx.amount,
          walletName,
          tx.type,
          tx.isRecurring ? "Yes" : "No",
          tx.recurringId || "",
        ];
      });
      const recurringRows = recurringExpenses.map((expense) => {
        const walletName = wallets.find((w) => w.id === expense.walletId)?.name ?? "Unknown";
        const durationMonths =
          new Date(expense.endDate).getMonth() - new Date(expense.startDate).getMonth() +
          1 +
          12 *
          (new Date(expense.endDate).getFullYear() - new Date(expense.startDate).getFullYear());
        const total = expense.amount * Math.max(0, durationMonths);
        return [
          expense.title,
          expense.amount,
          expense.category,
          walletName,
          `${durationMonths} months`,
          total,
        ];
      });
      const categoryRows = getCategoryBudgetsForCurrentMonth().map((budget) => [
        budget.category,
        budget.limit,
        getCategoryBudgetUsage(budget.category),
        getCategoryBudgetRemaining(budget.category),
      ]);

      const rows: string[][] = [
        ["Student Name", studentName],
        ["Degree", degree],
        ["Report Title", "Money Manager Report"],
        ["Date Generated", dateGenerated],
        [],
        ["Summary"],
        ["Total Income", totalIncome],
        ["Total Expenses", totalExpense],
        ["Balance", balance],
        ["Included Wallet Balance", getIncludedWalletBalance()],
        [],
        ["Wallets"],
        ["Name", "Balance", "Included in Total"],
        ...walletRows,
        [],
        ["Transactions"],
        ["Date", "Title", "Category", "Amount", "Wallet", "Type", "Recurring", "Recurring Id"],
        ...transactionRows,
        [],
        ["Recurring Expenses"],
        ["Title", "Monthly Amount", "Category", "Wallet", "Duration", "Total"],
        ...recurringRows,
        [],
        ["Category Budgets"],
        ["Category", "Limit", "Used", "Remaining"],
        ...categoryRows,
      ];

      return rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
    },
    [getBalance, getCategoryBudgetRemaining, getCategoryBudgetUsage, getCategoryBudgetsForCurrentMonth, getIncludedWalletBalance, getTotalExpenses, getTotalIncome, recurringExpenses, settings, transactions, wallets],
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
    if (budget) {
      const wantsBudgetAmount = (budget.monthlyBudget * budget.allocation.wants) / 100;
      if (report.needsVsWantsVsSavings.wants > wantsBudgetAmount) {
        const exceededBy = report.needsVsWantsVsSavings.wants - wantsBudgetAmount;
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

    const currentMonthExpenses = transactions.filter(
      (transaction) =>
        transaction.type === "expense" &&
        getMonthKey(transaction.date) === getCurrentMonthKey(),
    );
    const largestExpense = currentMonthExpenses.reduce<Transaction | null>(
      (largest, transaction) =>
        !largest || transaction.amount > largest.amount ? transaction : largest,
      null,
    );
    if (
      budget &&
      largestExpense &&
      largestExpense.amount >= budget.monthlyBudget * 0.4
    ) {
      insights.push({
        id: "abnormal-single-expense",
        type: "warning",
        title: "Large Expense Detected",
        message: `${largestExpense.category} includes a single expense of ${settings.currency} ${largestExpense.amount.toLocaleString()}, which is unusually high for this month.`,
        severity: "medium",
        actionable: true,
        createdAt: new Date().toISOString(),
      });
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
  }, [getCurrentMonthBudget, generateReport, getCurrentMonthKey, getDailyAllowance, settings, transactions]);

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
    recurringExpenses,
    categoryBudgets,
    settings,

    // Wallet operations
    createWallet,
    updateWallet,
    updateWalletBalance,
    deleteWallet,

    // Transaction operations
    addTransaction,
    updateTransaction,
    deleteTransaction,

    // Budget operations
    getCurrentMonthBudget,
    createOrUpdateBudget,
    createOrUpdateCategoryBudget,
    deleteCategoryBudget,

    // Recurring expense operations
    createRecurringExpense,
    updateRecurringExpense,
    deleteRecurringExpense,
    getRecurringExpensesForCurrentMonth,
    getFixedCommitmentsTotal,

    // Calculations
    getTotalIncome,
    getTotalExpenses,
    getBalance,
    getDailyAllowance,
    getIncludedWalletBalance,
    getCategoryBudgetsForCurrentMonth,
    getCategoryBudgetUsage,
    getCategoryBudgetRemaining,
    getAvailableAfterFixed,
    getRemainingFlexibleBudget,
    getFoodBudgetGuidance,

    // Reporting
    generateReport,
    generateMoneyManagerCsv,

    // Insights
    generateInsights,

    // Settings
    completeFirstTimeSetup,

    // Reset
    resetAll,
  };
}
