import { describe, expect, it } from "vitest";
import { escapeCsvValue } from "./csv";
import { formatCurrency, formatCurrencyLabel } from "./currency";
import { getCurrentISTDate, getCurrentISTTime } from "./dates";

describe("escapeCsvValue", () => {
  it("returns empty string for null/undefined", () => {
    expect(escapeCsvValue(null)).toBe("");
    expect(escapeCsvValue(undefined)).toBe("");
  });

  it("passes through plain values", () => {
    expect(escapeCsvValue("hello")).toBe("hello");
    expect(escapeCsvValue(42)).toBe("42");
  });

  it("wraps values with commas in quotes", () => {
    expect(escapeCsvValue("a,b")).toBe('"a,b"');
  });

  it("escapes internal double quotes", () => {
    expect(escapeCsvValue('say "hello"')).toBe('"say ""hello"""');
  });

  it("wraps values with newlines in quotes", () => {
    expect(escapeCsvValue("line1\nline2")).toBe('"line1\nline2"');
  });
});

describe("formatCurrency", () => {
  it("formats with LKR prefix", () => {
    const result = formatCurrency(1000);
    expect(result).toContain("LKR");
    expect(result).toContain("1,000");
  });

  it("handles zero", () => {
    expect(formatCurrency(0)).toContain("0");
  });

  it("supports custom currency", () => {
    expect(formatCurrency(100, "USD")).toContain("USD");
  });
});

describe("formatCurrencyLabel", () => {
  it("returns label with currency", () => {
    expect(formatCurrencyLabel()).toBe("Amount (LKR)");
    expect(formatCurrencyLabel("USD")).toBe("Amount (USD)");
  });
});

describe("getCurrentISTDate", () => {
  it("returns date in YYYY-MM-DD format", () => {
    const date = getCurrentISTDate();
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("getCurrentISTTime", () => {
  it("returns time in HH:MM format", () => {
    const time = getCurrentISTTime();
    expect(time).toMatch(/^\d{2}:\d{2}$/);
  });
});
