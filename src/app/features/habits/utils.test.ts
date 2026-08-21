import { describe, expect, it } from "vitest";
import { isDateEditable } from "./utils";

describe("isDateEditable", () => {
  const reference = new Date(2026, 7, 21); // 2026-08-21 (Fri)

  it("allows the present day", () => {
    expect(isDateEditable(new Date(2026, 7, 21), reference)).toBe(true);
  });

  it("allows a day within the past week", () => {
    expect(isDateEditable(new Date(2026, 7, 18), reference)).toBe(true);
  });

  it("allows exactly 7 days in the past", () => {
    expect(isDateEditable(new Date(2026, 7, 14), reference)).toBe(true);
  });

  it("rejects a day more than 7 days in the past", () => {
    expect(isDateEditable(new Date(2026, 7, 13), reference)).toBe(false);
  });

  it("rejects any future day", () => {
    expect(isDateEditable(new Date(2026, 7, 22), reference)).toBe(false);
  });
});
