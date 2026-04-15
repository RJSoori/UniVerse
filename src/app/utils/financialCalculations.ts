/**
 * Financial Calculation Utilities
 *
 * This file contains reusable financial calculation functions used throughout
 * the Money Manager. These functions are extracted from the main hook to
 * improve testability and reusability.
 */

/**
 * Rounds a number to specified decimal places to avoid floating-point precision issues
 * @param value - Number to round
 * @param decimals - Number of decimal places (default 2 for currency)
 * @returns Rounded number
 */
export function roundToDecimals(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Calculates daily budget for a given monthly budget
 * @param monthlyBudget - Total monthly budget
 * @param daysInMonth - Number of days in the month (defaults to days in current month)
 * @returns Daily budget amount
 */
export function calculateDailyBudget(
  monthlyBudget: number,
  daysInMonth: number = 30
): number {
  if (daysInMonth <= 0 || monthlyBudget < 0) return 0;
  return roundToDecimals(monthlyBudget / daysInMonth, 2);
}

/**
 * Calculates days remaining in the current month
 * @param currentDate - Current date (defaults to today)
 * @returns Number of days remaining (including today)
 */
export function calculateDaysRemaining(currentDate: Date = new Date()): number {
  const lastDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  const daysRemaining = lastDay.getDate() - currentDate.getDate() + 1;
  return Math.max(0, daysRemaining);
}

/**
 * Calculates remaining budget based on spending
 * @param monthlyBudget - Total monthly budget
 * @param totalSpent - Amount already spent this month
 * @returns Remaining budget (can be negative if overspent)
 */
export function calculateRemainingBudget(
  monthlyBudget: number,
  totalSpent: number
): number {
  return roundToDecimals(monthlyBudget - totalSpent, 2);
}

/**
 * Calculates spent percentage of budget
 * @param totalSpent - Amount spent
 * @param monthlyBudget - Total monthly budget
 * @returns Percentage spent (0-100+)
 */
export function calculateSpentPercentage(
  totalSpent: number,
  monthlyBudget: number
): number {
  if (monthlyBudget <= 0) return 0;
  return roundToDecimals((totalSpent / monthlyBudget) * 100, 1);
}

/**
 * Determines if budget has been exceeded
 * @param totalSpent - Amount spent
 * @param monthlyBudget - Total monthly budget
 * @returns True if overspent
 */
export function isBudgetExceeded(totalSpent: number, monthlyBudget: number): boolean {
  return totalSpent > monthlyBudget;
}

/**
 * Determines if budget warning threshold reached (80%)
 * @param totalSpent - Amount spent
 * @param monthlyBudget - Total monthly budget
 * @returns True if at or above 80%
 */
export function isBudgetWarning(totalSpent: number, monthlyBudget: number): boolean {
  const percentage = calculateSpentPercentage(totalSpent, monthlyBudget);
  return percentage >= 80;
}

/**
 * Calculates savings rate percentage
 * @param income - Total income
 * @param savings - Total savings
 * @returns Savings rate as percentage (0-100)
 */
export function calculateSavingsRate(income: number, savings: number): number {
  if (income <= 0) return 0;
  return roundToDecimals(Math.min(100, (savings / income) * 100), 1);
}

/**
 * Calculates daily spending average
 * @param totalSpent - Amount spent so far
 * @param daysPassed - Days elapsed in month
 * @returns Average spending per day
 */
export function calculateDailyAverage(totalSpent: number, daysPassed: number): number {
  if (daysPassed <= 0) return 0;
  return roundToDecimals(totalSpent / daysPassed, 2);
}

/**
 * Projects total spending for the month based on current pace
 * @param currentSpent - Amount spent so far
 * @param daysPassed - Days elapsed
 * @param daysInMonth - Total days in month
 * @returns Projected total spending
 */
export function projectMonthlySpending(
  currentSpent: number,
  daysPassed: number,
  daysInMonth: number
): number {
  if (daysPassed <= 0) return 0;
  const dailyAverage = calculateDailyAverage(currentSpent, daysPassed);
  return roundToDecimals(dailyAverage * daysInMonth, 2);
}