import { describe, expect, it } from "vitest";
import {
  roundMoney,
  roundGpa,
  safeCompare,
  isHalfStep,
  normalizeGrade,
  validateTransactionAmount,
  validateWalletName,
  validateWalletBalanceAmount,
  validateTransactionDate,
  validateTransactionTime,
  validateCategoryMembership,
  validateGpaValue,
  validateSubjectName,
  validateSubjectCredits,
  validateGrade,
  validateTargetCgpa,
  validateBudgetAmount,
  validateCategoryBudget,
  validateWalletBalance,
  MAX_TRANSACTION_AMOUNT,
  MAX_WALLET_BALANCE,
  MAX_SUBJECT_CREDITS,
} from "./index";

describe("roundMoney", () => {
  it("rounds to 2 decimal places", () => {
    expect(roundMoney(1.235)).toBe(1.24);
    expect(roundMoney(1.234)).toBe(1.23);
  });

  it("handles zero", () => {
    expect(roundMoney(0)).toBe(0);
  });

  it("returns 0 for non-finite values", () => {
    expect(roundMoney(Infinity)).toBe(0);
    expect(roundMoney(-Infinity)).toBe(0);
    expect(roundMoney(NaN)).toBe(0);
  });

  it("handles negative values", () => {
    expect(roundMoney(-1.5)).toBe(-1.5);
    expect(roundMoney(-1.11)).toBe(-1.11);
  });
});

describe("roundGpa", () => {
  it("rounds to 3 decimal places", () => {
    expect(roundGpa(3.71234)).toBe(3.712);
    expect(roundGpa(3.7125)).toBe(3.713);
  });

  it("returns 0 for non-finite values", () => {
    expect(roundGpa(NaN)).toBe(0);
  });
});

describe("safeCompare", () => {
  it("returns 0 for nearly equal values", () => {
    expect(safeCompare(1.0, 1.0 + 1e-7)).toBe(0);
  });

  it("returns 1 when left is greater", () => {
    expect(safeCompare(2.0, 1.0)).toBe(1);
  });

  it("returns -1 when left is less", () => {
    expect(safeCompare(1.0, 2.0)).toBe(-1);
  });
});

describe("isHalfStep", () => {
  it("returns true for integer values", () => {
    expect(isHalfStep(1)).toBe(true);
    expect(isHalfStep(3)).toBe(true);
  });

  it("returns true for 0.5 steps", () => {
    expect(isHalfStep(0.5)).toBe(true);
    expect(isHalfStep(2.5)).toBe(true);
  });

  it("returns false for non-half-step values", () => {
    expect(isHalfStep(1.3)).toBe(false);
    expect(isHalfStep(2.7)).toBe(false);
  });
});

describe("normalizeGrade", () => {
  it("normalizes uppercase grades", () => {
    expect(normalizeGrade("A+", 4.0)).toBe("A+");
    expect(normalizeGrade("B-", 4.0)).toBe("B-");
  });

  it("normalizes lowercase grades", () => {
    expect(normalizeGrade("a+", 4.0)).toBe("A+");
    expect(normalizeGrade("b", 4.0)).toBe("B");
  });

  it("trims whitespace", () => {
    expect(normalizeGrade("  A  ", 4.0)).toBe("A");
  });

  it("returns empty string for invalid grades", () => {
    expect(normalizeGrade("Z", 4.0)).toBe("");
    expect(normalizeGrade("", 4.0)).toBe("");
  });
});

describe("Money Manager validation", () => {
  describe("validateTransactionAmount", () => {
    it("accepts valid positive amounts", () => {
      expect(validateTransactionAmount(100)).toBe("");
      expect(validateTransactionAmount("50.50")).toBe("");
    });

    it("rejects zero and negative amounts", () => {
      expect(validateTransactionAmount(0)).not.toBe("");
      expect(validateTransactionAmount(-10)).not.toBe("");
    });

    it("rejects non-numeric values", () => {
      expect(validateTransactionAmount("abc")).not.toBe("");
      expect(validateTransactionAmount("")).not.toBe("");
    });

    it("rejects amounts exceeding max", () => {
      expect(validateTransactionAmount(MAX_TRANSACTION_AMOUNT + 1)).not.toBe("");
    });
  });

  describe("validateWalletName", () => {
    it("accepts valid names", () => {
      expect(validateWalletName("My Wallet")).toBe("");
    });

    it("rejects empty names", () => {
      expect(validateWalletName("")).not.toBe("");
      expect(validateWalletName("   ")).not.toBe("");
    });

    it("rejects names over 50 characters", () => {
      expect(validateWalletName("a".repeat(51))).not.toBe("");
    });
  });

  describe("validateWalletBalanceAmount", () => {
    it("accepts valid balances", () => {
      expect(validateWalletBalanceAmount(0)).toBe("");
      expect(validateWalletBalanceAmount(1000)).toBe("");
    });

    it("rejects negative balances", () => {
      expect(validateWalletBalanceAmount(-1)).not.toBe("");
    });

    it("rejects exceeding max", () => {
      expect(validateWalletBalanceAmount(MAX_WALLET_BALANCE + 1)).not.toBe("");
    });
  });

  describe("validateBudgetAmount", () => {
    it("accepts valid budgets", () => {
      expect(validateBudgetAmount(0)).toBe("");
      expect(validateBudgetAmount(40000)).toBe("");
    });

    it("rejects negative budgets", () => {
      expect(validateBudgetAmount(-1)).not.toBe("");
    });
  });

  describe("validateTransactionDate", () => {
    it("accepts valid date format", () => {
      expect(validateTransactionDate("2025-01-15")).toBe("");
    });

    it("rejects invalid format", () => {
      expect(validateTransactionDate("15-01-2025")).not.toBe("");
      expect(validateTransactionDate("not-a-date")).not.toBe("");
    });

    it("rejects future dates by default", () => {
      const futureYear = new Date().getFullYear() + 2;
      expect(validateTransactionDate(`${futureYear}-01-01`)).not.toBe("");
    });

    it("allows future dates when option is set", () => {
      const futureYear = new Date().getFullYear() + 2;
      expect(validateTransactionDate(`${futureYear}-01-01`, { allowFuture: true })).toBe("");
    });
  });

  describe("validateTransactionTime", () => {
    it("accepts valid time format", () => {
      expect(validateTransactionTime("09:30")).toBe("");
      expect(validateTransactionTime("23:59")).toBe("");
    });

    it("rejects invalid format", () => {
      expect(validateTransactionTime("9:30")).not.toBe("");
      expect(validateTransactionTime("25:00")).not.toBe("");
    });
  });

  describe("validateCategoryMembership", () => {
    it("accepts valid expense categories", () => {
      expect(validateCategoryMembership("Food", "expense")).toBe("");
      expect(validateCategoryMembership("Bills", "expense")).toBe("");
    });

    it("accepts valid income categories", () => {
      expect(validateCategoryMembership("Salary", "income")).toBe("");
      expect(validateCategoryMembership("Allowance", "income")).toBe("");
    });

    it("rejects invalid categories", () => {
      expect(validateCategoryMembership("Salary", "expense")).not.toBe("");
      expect(validateCategoryMembership("Food", "income")).not.toBe("");
    });

    it("rejects empty categories", () => {
      expect(validateCategoryMembership("", "expense")).not.toBe("");
    });
  });

  describe("validateWalletBalance", () => {
    it("accepts when balance covers expense", () => {
      expect(validateWalletBalance(1000, 500)).toBe("");
    });

    it("rejects when expense exceeds balance", () => {
      expect(validateWalletBalance(500, 1000)).not.toBe("");
    });

    it("allows negative when flag is set", () => {
      expect(validateWalletBalance(500, 1000, true)).toBe("");
    });
  });
});

describe("GPA Calculator validation", () => {
  describe("validateGpaValue", () => {
    it("accepts valid GPAs", () => {
      expect(validateGpaValue(3.5)).toBe("");
      expect(validateGpaValue(4.0)).toBe("");
    });

    it("rejects negative GPA", () => {
      expect(validateGpaValue(-1)).not.toBe("");
    });

    it("rejects GPA exceeding max", () => {
      expect(validateGpaValue(4.5, 4.0)).not.toBe("");
    });

    it("accepts 4.2 scale GPA", () => {
      expect(validateGpaValue(4.2, 4.2)).toBe("");
    });
  });

  describe("validateSubjectName", () => {
    it("accepts valid names", () => {
      expect(validateSubjectName("Data Structures")).toBe("");
    });

    it("rejects empty names", () => {
      expect(validateSubjectName("")).not.toBe("");
    });

    it("rejects names over 100 characters", () => {
      expect(validateSubjectName("a".repeat(101))).not.toBe("");
    });
  });

  describe("validateSubjectCredits", () => {
    it("accepts valid credits", () => {
      expect(validateSubjectCredits(3)).toBe("");
      expect(validateSubjectCredits(0.5)).toBe("");
    });

    it("rejects zero and negative", () => {
      expect(validateSubjectCredits(0)).not.toBe("");
      expect(validateSubjectCredits(-1)).not.toBe("");
    });

    it("rejects exceeding max", () => {
      expect(validateSubjectCredits(MAX_SUBJECT_CREDITS + 1)).not.toBe("");
    });

    it("rejects non-half-step values", () => {
      expect(validateSubjectCredits(1.3)).not.toBe("");
    });
  });

  describe("validateGrade", () => {
    it("accepts valid grades", () => {
      expect(validateGrade("A+")).toBe("");
      expect(validateGrade("B-")).toBe("");
      expect(validateGrade("F")).toBe("");
    });

    it("rejects invalid grades", () => {
      expect(validateGrade("Z")).not.toBe("");
      expect(validateGrade("")).not.toBe("");
    });
  });

  describe("validateTargetCgpa", () => {
    it("accepts valid target", () => {
      expect(validateTargetCgpa(3.5)).toBe("");
    });

    it("rejects exceeding max", () => {
      expect(validateTargetCgpa(4.5, 4.0)).not.toBe("");
    });
  });
});
