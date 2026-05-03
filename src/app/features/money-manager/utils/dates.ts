/**
 * Date and Time Utilities
 *
 * This file contains centralized date and time utility functions
 * that were previously duplicated across multiple components.
 * Centralizing these utilities ensures consistency and maintainability.
 */

const COLOMBO_TIMEZONE = "Asia/Colombo";

function formatDatePartsInColombo(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: COLOMBO_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";

  return { year, month, day };
}

function formatTimePartsInColombo(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: COLOMBO_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";

  return { hour, minute };
}

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
  const { year, month, day } = formatDatePartsInColombo(now);
  return `${year}-${month}-${day}`;
}

/**
 * Gets the current time in IST timezone as HH:MM format
 * @returns Current time string in IST timezone (HH:MM)
 */
export function getCurrentISTTime(): string {
  const now = new Date();
  const { hour, minute } = formatTimePartsInColombo(now);
  return `${hour}:${minute}`;
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
  const currentMonth = getCurrentISTDate().slice(0, 7);
  return yearMonth === currentMonth;
}

/**
 * Gets the start and end dates for a given month-year
 * @param yearMonth - String in format "YYYY-MM"
 * @returns Object with startDate and endDate as ISO strings
 */
export function getMonthDateRange(yearMonth: string): { startDate: string; endDate: string } {
  const [year, month] = yearMonth.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  const monthPadded = String(month).padStart(2, "0");

  return {
    startDate: `${year}-${monthPadded}-01`,
    endDate: `${year}-${monthPadded}-${String(lastDay).padStart(2, "0")}`
  };
}

/**
 * Calculates the number of days left in the current month
 * @returns Number of days remaining in the current month
 */
export function getDaysLeftInMonth(): number {
  const [year, month, day] = getCurrentISTDate().split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  return Math.max(0, daysInMonth - day + 1);
}