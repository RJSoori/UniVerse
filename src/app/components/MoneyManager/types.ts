// Wallet Types
export interface Wallet {
  id: string;
  name: string;
  balance: number;
  createdDate: string;
  type: "cash" | "debit" | "credit" | "savings" | "digital";
  includeInTotal: boolean;
}

// Transaction Types
export type TransactionType = "income" | "expense";

export type ExpenseCategory =
  | "Food"
  | "Dining Out"
  | "Transportation"
  | "Rent / Accommodation"
  | "Education"
  | "Shopping"
  | "Entertainment"
  | "Health"
  | "Clothing"
  | "Bills"
  | "Other";

export type IncomeCategory =
  | "Allowance"
  | "Salary"
  | "Freelance"
  | "Scholarship"
  | "Business"
  | "Dividends"
  | "Investments"
  | "Tips"
  | "Other";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: ExpenseCategory | IncomeCategory;
  walletId: string;
  description?: string;
  date: string;
  time?: string;
  isRecurring?: boolean;
  recurringId?: string;
}

export interface RecurringExpense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  walletId: string;
  frequency: "monthly";
  startDate: string;
  endDate: string;
  lastProcessedDate?: string;
}

export interface CategoryBudget {
  id: string;
  category: ExpenseCategory;
  limit: number;
  month: string; // YYYY-MM
}

// Budget Types
export type AllocationMode = "recommended" | "classic" | "custom";

export interface BudgetAllocation {
  needs: number;
  wants: number;
  savings: number;
}

export interface Budget {
  monthlyIncome: number;
  monthlyBudget: number;
  allocationMode: AllocationMode;
  allocation: BudgetAllocation;
  month: string; // YYYY-MM format
  totalSpent: number;
  lastUpdated: string;
}

// Settings Types
export interface MoneyManagerSettings {
  firstTimeSetupCompleted: boolean;
  currency: string;
  theme?: string;
}

// Report Types
export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
}

export interface SpendingTrend {
  date: string;
  income: number;
  expense: number;
  savings: number;
}

export interface WalletBreakdown {
  walletId: string;
  walletName: string;
  balance: number;
  percentage: number;
}

export interface FinancialReport {
  period: "weekly" | "monthly" | "custom";
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsPercentage: number;
  byCategory: CategorySpending[];
  trends: SpendingTrend[];
  walletBreakdown: WalletBreakdown[];
  needsVsWantsVsSavings: BudgetAllocation;
}

// Insight Types
export interface FinancialInsight {
  id: string;
  type: "warning" | "achievement" | "insight" | "alert";
  title: string;
  message: string;
  severity: "low" | "medium" | "high";
  actionable: boolean;
  createdAt: string;
}

// Daily Allowance Data
export interface DailyAllowance {
  dailyBudget: number;
  remainingBudget: number;
  daysLeft: number;
  todaySpending: number;
  isWarning: boolean;
}
