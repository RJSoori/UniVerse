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