/**
 * Date and Time Utilities
 *
 * This file contains centralized date and time utility functions
 * that were previously duplicated across multiple components.
 * Centralizing these utilities ensures consistency and maintainability.
 */

import { TIME_CONFIG } from "../constants/appConfig";

/**
 * Converts a date to UTC timestamp adjusted for IST timezone
 * @param date - The date to convert (defaults to current date)
 * @returns UTC timestamp adjusted for IST (GMT+5:30)
 */
export function convertToIST(date: Date = new Date()): number {
  return date.getTime() + date.getTimezoneOffset() * 60 * 1000;
}

/**
 * Gets the current date in IST timezone as an ISO string (YYYY-MM-DD)
 * @returns Current date string in IST timezone
 */
export function getCurrentISTDate(): string {
  const now = new Date();
  const istTime = now.getTime() + TIME_CONFIG.IST_OFFSET_MS;
  return new Date(istTime).toISOString().split("T")[0];
}

/**
 * Gets the current time in IST timezone as HH:MM format
 * @returns Current time string in IST timezone (HH:MM)
 */
export function getCurrentISTTime(): string {
  const now = new Date();
  const istTime = now.getTime() + TIME_CONFIG.IST_OFFSET_MS;
  const istDate = new Date(istTime);
  const hours = String(istDate.getHours()).padStart(2, "0");
  const minutes = String(istDate.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Formats a month-year string for consistent display
 * @param yearMonth - String in format "YYYY-MM"
 * @returns Formatted string like "January 2024"
 */
export function formatMonthYear(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
}

/**
 * Checks if a given month-year string is the current month
 * @param yearMonth - String in format "YYYY-MM"
 * @returns True if the given month is the current month
 */
export function isCurrentMonth(yearMonth: string): boolean {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return yearMonth === currentMonth;
}

/**
 * Gets the start and end dates for a given month-year
 * @param yearMonth - String in format "YYYY-MM"
 * @returns Object with startDate and endDate as ISO strings
 */
export function getMonthDateRange(yearMonth: string): { startDate: string; endDate: string } {
  const [year, month] = yearMonth.split("-").map(Number);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of the month

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0]
  };
}

/**
 * Calculates the number of days left in the current month
 * @returns Number of days remaining in the current month
 */
export function getDaysLeftInMonth(): number {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const currentDay = now.getDate();
  return Math.max(0, lastDay.getDate() - currentDay + 1);
}