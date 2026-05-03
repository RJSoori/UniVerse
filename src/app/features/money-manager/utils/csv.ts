/**
 * Money Manager CSV Export Utilities
 * 
 * Handles conversion of money manager data to CSV format for reporting
 * and analysis. Includes escaping for special characters.
 */

/**
 * Escape CSV value to handle commas, quotes, and newlines
 * Wraps value in quotes and escapes internal quotes
 * @param val - Value to escape
 * @returns Escaped CSV value
 */
export function escapeCsvValue(val: any): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Format CSV row array as comma-separated string
 * @param row - Array of values to format
 * @returns Escaped and join CSV row
 */
export function formatCsvRow(row: any[]): string {
  return row.map(escapeCsvValue).join(",");
}

/**
 * Format multiple CSV rows as complete CSV string
 * @param rows - Array of row arrays
 * @returns Complete CSV content for file export
 */
export function formatCsv(rows: string[][]): string {
  return rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
}
