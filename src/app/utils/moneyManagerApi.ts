import type {
  Budget,
  CategoryBudget,
  MoneyManagerSettings,
  RecurringExpense,
  Transaction,
  Wallet,
} from "../components/MoneyManager/types";

interface BackendWallet {
  id?: string;
  name: string;
  balance: number;
  createdDate: string;
  type: "CASH" | "DEBIT" | "CREDIT" | "SAVINGS" | "DIGITAL";
  includeInTotal: boolean;
}

interface BackendTransaction {
  id?: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  category: string;
  walletId: string;
  description?: string;
  date: string;
  time?: string;
  recurring?: boolean;
  recurringId?: string;
  isRecurring?: boolean;
}

interface BackendRecurringExpense {
  id?: string;
  title: string;
  amount: number;
  category: string;
  walletId: string;
  frequency: "monthly";
  startDate: string;
  endDate: string;
  lastProcessedDate?: string;
}

interface BackendCategoryBudget {
  id?: string;
  category: string;
  limitAmount: number;
  month: string;
}

interface BackendBudgetPlan {
  id?: string;
  monthlyIncome: number;
  monthlyBudget: number;
  allocationMode: "RECOMMENDED" | "CLASSIC" | "CUSTOM";
  needs: number;
  wants: number;
  savings: number;
  month: string;
  totalSpent: number;
  lastUpdated: string;
}

interface MoneyManagerRemoteState {
  wallets: Wallet[];
  transactions: Transaction[];
  recurringExpenses: RecurringExpense[];
  categoryBudgets: CategoryBudget[];
  budgets: Budget[];
  settings: MoneyManagerSettings;
}

const DEFAULT_BACKEND_URL = "http://localhost:8080";
const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/$/, "");

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Request to ${path} failed with ${response.status}: ${body}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

function toBackendWallet(wallet: Wallet): BackendWallet {
  return {
    ...wallet,
    type: wallet.type.toUpperCase() as BackendWallet["type"],
  };
}

function fromBackendWallet(wallet: BackendWallet): Wallet {
  return {
    ...wallet,
    id: wallet.id || crypto.randomUUID(),
    type: wallet.type.toLowerCase() as Wallet["type"],
  };
}

function toBackendTransaction(transaction: Transaction): BackendTransaction {
  return {
    ...transaction,
    type: transaction.type.toUpperCase() as BackendTransaction["type"],
    isRecurring: transaction.isRecurring ?? false,
  };
}

function fromBackendTransaction(transaction: BackendTransaction): Transaction {
  return {
    ...transaction,
    id: transaction.id || crypto.randomUUID(),
    type: transaction.type.toLowerCase() as Transaction["type"],
    isRecurring: transaction.isRecurring ?? transaction.recurring ?? false,
  };
}

function toBackendRecurringExpense(recurringExpense: RecurringExpense): BackendRecurringExpense {
  return { ...recurringExpense };
}

function fromBackendRecurringExpense(recurringExpense: BackendRecurringExpense): RecurringExpense {
  return {
    ...recurringExpense,
    id: recurringExpense.id || crypto.randomUUID(),
  };
}

function toBackendCategoryBudget(categoryBudget: CategoryBudget): BackendCategoryBudget {
  return {
    id: categoryBudget.id,
    category: categoryBudget.category,
    limitAmount: categoryBudget.limit,
    month: categoryBudget.month,
  };
}

function fromBackendCategoryBudget(categoryBudget: BackendCategoryBudget): CategoryBudget {
  return {
    id: categoryBudget.id || crypto.randomUUID(),
    category: categoryBudget.category as CategoryBudget["category"],
    limit: categoryBudget.limitAmount,
    month: categoryBudget.month,
  };
}

function toBackendBudget(budget: Budget): BackendBudgetPlan {
  return {
    ...budget,
    allocationMode: budget.allocationMode.toUpperCase() as BackendBudgetPlan["allocationMode"],
    needs: budget.allocation.needs,
    wants: budget.allocation.wants,
    savings: budget.allocation.savings,
  };
}

function fromBackendBudget(budget: BackendBudgetPlan): Budget {
  return {
    monthlyIncome: budget.monthlyIncome,
    monthlyBudget: budget.monthlyBudget,
    allocationMode: budget.allocationMode.toLowerCase() as Budget["allocationMode"],
    allocation: {
      needs: budget.needs,
      wants: budget.wants,
      savings: budget.savings,
    },
    month: budget.month,
    totalSpent: budget.totalSpent,
    lastUpdated: budget.lastUpdated,
  };
}

function normalizeSettings(settings: MoneyManagerSettings): MoneyManagerSettings {
  return {
    firstTimeSetupCompleted: settings.firstTimeSetupCompleted,
    currency: settings.currency,
    theme: settings.theme,
  };
}

export async function loadMoneyManagerState(): Promise<MoneyManagerRemoteState> {
  const [wallets, transactions, recurringExpenses, categoryBudgets, budgets, settings] =
    await Promise.all([
      requestJson<BackendWallet[]>("/api/money-manager/wallets"),
      requestJson<BackendTransaction[]>("/api/money-manager/transactions"),
      requestJson<BackendRecurringExpense[]>("/api/money-manager/recurring-expenses"),
      requestJson<BackendCategoryBudget[]>("/api/money-manager/category-budgets"),
      requestJson<BackendBudgetPlan[]>("/api/money-manager/budgets/current"),
      requestJson<MoneyManagerSettings>("/api/money-manager/settings"),
    ]);

  return {
    wallets: (wallets ?? []).map(fromBackendWallet),
    transactions: (transactions ?? []).map(fromBackendTransaction),
    recurringExpenses: (recurringExpenses ?? []).map(fromBackendRecurringExpense),
    categoryBudgets: (categoryBudgets ?? []).map(fromBackendCategoryBudget),
    budgets: (budgets ?? []).map(fromBackendBudget),
    settings: normalizeSettings(
      settings ?? {
        firstTimeSetupCompleted: false,
        currency: "LKR",
      },
    ),
  };
}

export async function saveMoneyManagerState(state: MoneyManagerRemoteState): Promise<void> {
  await Promise.all([
    requestJson<Wallet[]>("/api/money-manager/wallets/bulk", {
      method: "PUT",
      body: JSON.stringify(state.wallets.map(toBackendWallet)),
    }),
    requestJson<Transaction[]>("/api/money-manager/transactions/bulk", {
      method: "PUT",
      body: JSON.stringify(state.transactions.map(toBackendTransaction)),
    }),
    requestJson<RecurringExpense[]>("/api/money-manager/recurring-expenses/bulk", {
      method: "PUT",
      body: JSON.stringify(state.recurringExpenses.map(toBackendRecurringExpense)),
    }),
    requestJson<CategoryBudget[]>("/api/money-manager/category-budgets/bulk", {
      method: "PUT",
      body: JSON.stringify(state.categoryBudgets.map(toBackendCategoryBudget)),
    }),
    requestJson<Budget[]>("/api/money-manager/budgets/bulk", {
      method: "PUT",
      body: JSON.stringify(state.budgets.map(toBackendBudget)),
    }),
    requestJson<MoneyManagerSettings>("/api/money-manager/settings", {
      method: "PUT",
      body: JSON.stringify(normalizeSettings(state.settings)),
    }),
  ]);
}
