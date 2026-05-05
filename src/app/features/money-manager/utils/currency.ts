/**
 * Currency Utility Functions
 * 
 * Centralized formatting and handling of currency values
 */

import { MONEY_CONFIG } from "../constants/config";

/**
 * Format amount as currency string
 * @param amount - Numeric value to format
 * @param currency - Currency code (default: LKR)
 * @returns Formatted currency string (e.g., "LKR 1,000")
 */
export function formatCurrency(amount: number, currency: string = MONEY_CONFIG.CURRENCY): string {
  return `${currency} ${amount.toLocaleString()}`;
}

export function formatCurrencyLabel(currency: string = MONEY_CONFIG.CURRENCY): string {
  return `Amount (${currency})`;
}
