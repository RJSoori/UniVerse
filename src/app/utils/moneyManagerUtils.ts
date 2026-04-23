import { Wallet } from "../components/MoneyManager/types";

/**
 * Category emoji mapping for consistent display across Money Manager
 */
export const CATEGORY_EMOJI_MAP: Record<string, string> = {
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
  Allowance: "💰",
  Salary: "💼",
  Freelance: "💻",
  Scholarship: "🎓",
  Business: "📊",
  Dividends: "📈",
  Investments: "🏦",
  Tips: "🎁",
  Other: "📌",
};

/**
 * Get emoji for a transaction category
 * @param category - The category name
 * @returns The emoji character or default wallet emoji
 */
export const getCategoryEmoji = (category: string): string => {
  return CATEGORY_EMOJI_MAP[category] || "💳";
};

/**
 * Get wallet name by ID
 * @param walletId - The wallet ID to look up
 * @param wallets - Array of wallet objects
 * @returns The wallet name or "Unknown Wallet" if not found
 */
export const getWalletName = (walletId: string, wallets: Wallet[]): string => {
  return wallets.find((w: Wallet) => w.id === walletId)?.name || "Unknown Wallet";
};

/**
 * Get complete wallet display information
 * @param walletId - The wallet ID
 * @param wallets - Array of wallets
 * @param currency - Optional currency code for formatting
 * @returns Object with wallet name and type
 */
export const getWalletDisplayInfo = (
  walletId: string,
  wallets: Wallet[],
  currency?: string
): { name: string; type: string } => {
  const wallet = wallets.find((w: Wallet) => w.id === walletId);
  return {
    name: wallet?.name || "Unknown Wallet",
    type: wallet?.type || "unknown",
  };
};

/**
 * Validate transaction amount
 * @param amount - Amount string to validate
 * @returns Error message or null if valid
 */
export const validateAmount = (amount: string): string | null => {
  if (!amount || amount.trim() === "") {
    return "Amount is required";
  }
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) {
    return "Amount must be a valid number";
  }
  if (numAmount <= 0) {
    return "Amount must be greater than 0";
  }
  return null;
};

/**
 * Validate transaction date
 * @param date - Date string in YYYY-MM-DD format
 * @returns Error message or null if valid
 */
export const validateDate = (date: string): string | null => {
  if (!date) {
    return "Date is required";
  }
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return "Invalid date format";
  }
  return null;
};

/**
 * Validate time string
 * @param time - Time string in HH:MM format
 * @returns Error message or null if valid
 */
export const validateTime = (time: string): string | null => {
  if (!time) return null; // Time is optional
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    return "Time must be in HH:MM format";
  }
  return null;
};

/**
 * Validate category selection
 * @param category - Category string
 * @param validCategories - Array of valid category strings
 * @returns Error message or null if valid
 */
export const validateCategory = (
  category: string,
  validCategories: string[]
): string | null => {
  if (!category || category.trim() === "") {
    return "Category is required";
  }
  if (!validCategories.includes(category)) {
    return `${category} is not a valid category`;
  }
  return null;
};

/**
 * Validate wallet selection
 * @param walletId - Wallet ID to validate
 * @param wallets - Array of available wallets
 * @returns Error message or null if valid
 */
export const validateWallet = (
  walletId: string,
  wallets: Wallet[]
): string | null => {
  if (!walletId || walletId.trim() === "") {
    return "Wallet is required";
  }
  if (!wallets.find((w: Wallet) => w.id === walletId)) {
    return "Selected wallet does not exist";
  }
  return null;
};

/**
 * Check if a transaction description is valid
 * @param description - Description text
 * @param maxLength - Maximum allowed length
 * @returns Error message or null if valid
 */
export const validateDescription = (
  description: string,
  maxLength: number = 200
): string | null => {
  if (description && description.length > maxLength) {
    return `Description must be less than ${maxLength} characters`;
  }
  return null;
};

/**
 * Format currency amount for display
 * @param amount - Numeric amount
 * @param currency - Currency code (e.g., "LKR", "USD")
 * @returns Formatted string like "LKR 1,234.50"
 */
export const formatCurrencyDisplay = (
  amount: number,
  currency: string = "LKR"
): string => {
  return `${currency} ${Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

