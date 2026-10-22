import { describe, expect, it } from "vitest";
import { getTodayIsoDate, isOverdue, isTodayOrFuture } from "./dateValidation";

describe("date validation", () => {
  it("allows today", () => {
    expect(isTodayOrFuture(getTodayIsoDate())).toBe(true);
  });

  it("allows a future date", () => {
    expect(isTodayOrFuture("2099-12-31")).toBe(true);
  });

  it("rejects a past date", () => {
    expect(isTodayOrFuture("2000-01-01")).toBe(false);
  });

  it("rejects an empty date", () => {
    expect(isTodayOrFuture("")).toBe(false);
  });
});

describe("isOverdue", () => {
  it("flags a past date as overdue", () => {
    expect(isOverdue("2000-01-01")).toBe(true);
  });

  it("does not flag today as overdue", () => {
    expect(isOverdue(getTodayIsoDate())).toBe(false);
  });

  it("does not flag a future date as overdue", () => {
    expect(isOverdue("2099-12-31")).toBe(false);
  });

  it("does not flag an empty date as overdue", () => {
    expect(isOverdue("")).toBe(false);
  });
});