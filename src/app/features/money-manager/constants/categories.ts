/**
 * Transaction Category Mappings and Icons
 *
 * This file contains all transaction-related category definitions and their
 * visual representations (emojis). This prevents duplication across components.
 */

import type { ExpenseCategory, IncomeCategory } from "../types";

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