/**
 * Transaction Category Mappings and Icons
 *
 * This file contains all transaction-related category definitions and their
 * visual representations (emojis). This prevents duplication across components.
 */

import type { ExpenseCategory, IncomeCategory } from "../components/MoneyManager/types";

/**
 * Emoji icons for each transaction category
 * Used for visual identification in transaction lists and forms
 */
export const CATEGORY_ICONS: Record<string, string> = {
  // Expense categories
  Food: "🍽️",
  "Dining Out": "🍕",
  Transportation: "🚗",
  "Rent / Accommodation": "🏠",
  Education: "📚",
  Shopping: "🛍️",
  Entertainment: "🎬",
  Health: "⚕️",
  Clothing: "👕",
  Bills: "💵",
  Other: "📌",
  
  // Income categories
  Allowance: "💰",
  Salary: "💼",
  Freelance: "💻",
  Scholarship: "🎓",
  Business: "📊",
  Dividends: "📈",
  Investments: "🏦",
  Tips: "🎁",
};

/**
 * All expense categories used in the Money Manager
 * These represent places where money is spent
 */
export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Food",
  "Dining Out",
  "Transportation",
  "Rent / Accommodation",
  "Education",
  "Shopping",
  "Entertainment",
  "Health",
  "Clothing",
  "Bills",
  "Other",
];

/**
 * All income categories used in the Money Manager
 * These represent sources of money coming in
 */
export const INCOME_CATEGORIES: IncomeCategory[] = [
  "Allowance",
  "Salary",
  "Freelance",
  "Scholarship",
  "Business",
  "Dividends",
  "Investments",
  "Tips",
  "Other",
];

/**
 * Categorization of expenses by type (needs vs wants)
 * Used for budget analysis and insights
 * Needs: Essential expenses (food, rent, transport, etc.)
 * Wants: Discretionary spending (entertainment, dining out, shopping)
 */
export const EXPENSE_TYPE_MAPPING: Record<ExpenseCategory, "needs" | "wants"> = {
  Food: "needs",
  "Dining Out": "wants",
  Transportation: "needs",
  "Rent / Accommodation": "needs",
  Education: "needs",
  Shopping: "wants",
  Entertainment: "wants",
  Health: "needs",
  Clothing: "needs",
  Bills: "needs",
  Other: "wants",
};

/**
 * Get the category icon for display
 * @param category - Category name
 * @returns Emoji icon or default icon if not found
 */
export function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category] || "💳";
}

/**
 * Determine if an expense is a "need" or "want"
 * Used for budget categorization and analysis
 * @param category - Expense category
 * @returns "needs" or "wants"
 */
export function getExpenseType(category: ExpenseCategory): "needs" | "wants" {
  return EXPENSE_TYPE_MAPPING[category] || "wants";
}