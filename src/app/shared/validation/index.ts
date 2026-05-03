import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../../features/money-manager/constants/categories";
import type {
  Budget,
  BudgetAllocation,
  CategoryBudget,
  ExpenseCategory,
  IncomeCategory,
  MoneyManagerSettings,
  RecurringExpense,
  Transaction,
  TransactionType,
  Wallet,
} from "../../features/money-manager/types";
import type {
  GpaSettings,
  PlannerGrade,
  PlannerSubject,
  Semester,
  Subject,
} from "../../features/gpa-calculator/types";

export type FieldErrors = Record<string, string>;

export type ValidationResult<T> =
  | { ok: true; value: T; warnings?: string[] }
  | { ok: false; errors: FieldErrors };

export interface StorageSanitizerResult<T> {
  value: T;
  valid: boolean;
}

export type StorageSanitizer<T> = (
  value: unknown,
  initialValue: T,
) => StorageSanitizerResult<T>;

export interface DraftTransaction {
  type: string;
  amount: string | number;
  category: string;
  walletId: string;
  description?: string;
  date: string;
  time?: string;
}

export interface NormalizedTransaction {
  type: TransactionType;
  amount: number;
  category: ExpenseCategory | IncomeCategory;
  walletId: string;
  description?: string;
  date: string;
  time: string;
}

export interface WalletPayload {
  name: string;
  balance: string | number;
  type: Wallet["type"];
  includeInTotal: boolean;
}

export interface BudgetPayload {
  monthlyIncome: string | number;
  monthlyBudget: string | number;
  allocationMode: Budget["allocationMode"];
  allocation: BudgetAllocation;
}

export interface RecurringExpensePayload {
  title: string;
  amount: string | number;
  category: string;
  walletId: string;
  frequency: "monthly";
  startDate: string;
  endDate: string;
}

export interface PlannerInputsDraft {
  targetCgpa: string | number;
  nextCredits: string | number;
}

export const VALIDATION_EPSILON = 1e-6;
export const MAX_TRANSACTION_AMOUNT = 5_000_000;
export const MAX_WALLET_BALANCE = 10_000_000;
export const MAX_BUDGET_AMOUNT = 10_000_000;
export const MAX_SUBJECT_CREDITS = 6;
export const MAX_SEMESTER_CREDITS = 30;
export const MAX_SUBJECT_NAME_LENGTH = 100;
export const MAX_WALLET_NAME_LENGTH = 50;
export const MAX_CATEGORY_NAME_LENGTH = 30;
export const MONEY_DECIMALS = 2;
export const GPA_DECIMALS = 3;

const LEGACY_ALLOWED_GRADES = [
  "A+",
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D+",
  "D",
  "E",
  "F",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toFiniteNumber(value: unknown): number | null {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN;
  return Number.isFinite(numericValue) ? numericValue : null;
}

function arraysEqualShallow<T>(first: T[], second: T[]): boolean {
  return (
    first.length === second.length &&
    first.every((item, index) => item === second[index])
  );
}

export function roundMoney(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function roundGpa(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const multiplier = 10 ** GPA_DECIMALS;
  return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
}

export function safeCompare(
  left: number,
  right: number,
  epsilon: number = VALIDATION_EPSILON,
): number {
  const diff = left - right;
  if (Math.abs(diff) <= epsilon) return 0;
  return diff > 0 ? 1 : -1;
}

export function isHalfStep(value: number): boolean {
  return Number.isFinite(value) && Math.abs(value * 2 - Math.round(value * 2)) <= VALIDATION_EPSILON;
}

export function getAllowedGrades(gpaScale: number): PlannerGrade[] {
  if (safeCompare(gpaScale, 4.2) === 0) {
    return [...LEGACY_ALLOWED_GRADES] as PlannerGrade[];
  }

  return LEGACY_ALLOWED_GRADES.filter((grade) => grade !== "A+") as PlannerGrade[];
}

export function normalizeGrade(grade: string, gpaScale: number): PlannerGrade | "" {
  const normalized = grade.trim().toUpperCase();
  if (normalized === "A+" && safeCompare(gpaScale, 4.0) === 0) {
    return "A";
  }

  if (LEGACY_ALLOWED_GRADES.includes(normalized as (typeof LEGACY_ALLOWED_GRADES)[number])) {
    return normalized as PlannerGrade;
  }

  return "";
}

export function validateWalletName(name: string): string {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return "Wallet name cannot be empty.";
  }
  if (trimmedName.length > MAX_WALLET_NAME_LENGTH) {
    return `Wallet name must be ${MAX_WALLET_NAME_LENGTH} characters or less.`;
  }
  return "";
}

export function validateWalletBalanceAmount(amount: string | number): string {
  const numericValue = toFiniteNumber(amount);
  if (numericValue === null) {
    return "Wallet balance must be a valid number.";
  }
  if (numericValue < 0) {
    return "Wallet balance cannot be negative.";
  }
  if (numericValue > MAX_WALLET_BALANCE) {
    return `Wallet balance cannot exceed ${MAX_WALLET_BALANCE.toLocaleString()}.`;
  }
  return "";
}

export function validateTransactionAmount(amount: string | number): string {
  const numericValue = toFiniteNumber(amount);
  if (numericValue === null) {
    return "Amount must be a valid number.";
  }
  if (numericValue <= 0) {
    return "Enter an amount greater than 0.";
  }
  if (numericValue > MAX_TRANSACTION_AMOUNT) {
    return `Enter an amount at most ${MAX_TRANSACTION_AMOUNT.toLocaleString()}.`;
  }
  return "";
}

export function validateBudgetAmount(amount: string | number): string {
  const numericValue = toFiniteNumber(amount);
  if (numericValue === null) {
    return "Budget must be a valid number.";
  }
  if (numericValue < 0) {
    return "Budget cannot be negative.";
  }
  if (numericValue > MAX_BUDGET_AMOUNT) {
    return `Budget cannot exceed ${MAX_BUDGET_AMOUNT.toLocaleString()}.`;
  }
  return "";
}

export function validateTransactionDate(
  date: string,
  options: { allowFuture?: boolean } = {},
): string {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return "Date must be in YYYY-MM-DD format.";
  }

  const dateObj = new Date(`${date}T00:00:00`);
  if (Number.isNaN(dateObj.getTime())) {
    return "Date is invalid.";
  }

  if (!options.allowFuture) {
    const today = new Date();
    const todayKey = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    ).getTime();
    if (dateObj.getTime() > todayKey) {
      return "Future transactions are not supported yet.";
    }
  }

  return "";
}

export function validateTransactionTime(time: string): string {
  const timeRegex = /^\d{2}:\d{2}$/;
  if (!timeRegex.test(time)) {
    return "Time must be in HH:MM format.";
  }

  const [hours, minutes] = time.split(":").map(Number);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return "Time is invalid.";
  }
  return "";
}

export function validateCategory(category: string): string {
  const trimmedCategory = category.trim();
  if (!trimmedCategory) {
    return "Category cannot be empty.";
  }
  if (trimmedCategory.length > MAX_CATEGORY_NAME_LENGTH) {
    return `Category must be ${MAX_CATEGORY_NAME_LENGTH} characters or less.`;
  }
  return "";
}

export function validateCategoryMembership(
  category: string,
  type: string,
): string {
  const trimmedCategory = category.trim();
  if (!trimmedCategory) {
    return "Choose a category.";
  }

  if (type === "expense") {
    return EXPENSE_CATEGORIES.includes(trimmedCategory as ExpenseCategory)
      ? ""
      : "Choose a valid expense category.";
  }
  if (type === "income") {
    return INCOME_CATEGORIES.includes(trimmedCategory as IncomeCategory)
      ? ""
      : "Choose a valid income category.";
  }

  return "Choose income or expense.";
}

export function validateTransaction(
  amount: string | number,
  category: string,
  walletId: string,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const amountError = validateTransactionAmount(amount);
  if (amountError) errors.amount = amountError;
  const categoryError = validateCategory(category);
  if (categoryError) errors.category = categoryError;
  if (!walletId) errors.walletId = "Please select a wallet.";
  return errors;
}

export function validateGpaValue(
  gpa: string | number,
  maxGpa: number = 4.0,
): string {
  const numericValue = toFiniteNumber(gpa);
  if (numericValue === null) {
    return "GPA must be a valid number.";
  }
  if (numericValue < 0) {
    return "GPA cannot be negative.";
  }
  if (safeCompare(numericValue, maxGpa) === 1) {
    return `GPA exceeds the maximum (${maxGpa.toFixed(1)}).`;
  }
  return "";
}

export function validateCredits(credits: string | number): string {
  return validateSubjectCredits(credits);
}

export function validateGrade(
  grade: string,
  gpaScale: number = 4.0,
): string {
  const normalized = normalizeGrade(grade, gpaScale);
  if (!normalized) {
    return `Invalid grade. Allowed grades: ${getAllowedGrades(gpaScale).join(", ")}.`;
  }
  return "";
}

export function validateSubjectName(name: string): string {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return "Subject name is required.";
  }
  if (trimmedName.length > MAX_SUBJECT_NAME_LENGTH) {
    return `Subject name must be ${MAX_SUBJECT_NAME_LENGTH} characters or less.`;
  }
  return "";
}

export function validateSubject(
  name: string,
  credits: string | number,
  grade: string,
  gpaScale: number = 4.0,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const nameError = validateSubjectName(name);
  if (nameError) errors.name = nameError;
  const creditsError = validateSubjectCredits(credits);
  if (creditsError) errors.credits = creditsError;
  const gradeError = validateGrade(grade, gpaScale);
  if (gradeError) errors.grade = gradeError;
  return errors;
}

export function validateTargetCgpa(
  targetCgpa: string | number,
  maxGpa: number = 4.0,
): string {
  const numericValue = toFiniteNumber(targetCgpa);
  if (numericValue === null) {
    return "Target CGPA must be a valid number.";
  }
  if (numericValue < 0) {
    return "Target CGPA cannot be negative.";
  }
  if (safeCompare(numericValue, maxGpa) === 1) {
    return `Target CGPA cannot exceed ${maxGpa.toFixed(1)}.`;
  }
  return "";
}

export function validateCreditLimit(
  subjectCredits: number[],
  semesterCredits: number,
): string {
  const totalCredits = roundGpa(
    subjectCredits.reduce((sum, value) => sum + value, 0),
  );
  if (safeCompare(totalCredits, semesterCredits) === 1) {
    const overflow = roundGpa(totalCredits - semesterCredits);
    return `Adding this subject exceeds the semester limit by ${overflow.toFixed(1)} credits.`;
  }
  return "";
}

export function validateSubjectCredits(
  credits: string | number,
  maxCreditsPerSubject: number = MAX_SUBJECT_CREDITS,
): string {
  const numericValue = toFiniteNumber(credits);
  if (numericValue === null) {
    return "Credits must be a valid number.";
  }
  if (numericValue < 0.5) {
    return "Credits must be at least 0.5.";
  }
  if (numericValue > maxCreditsPerSubject) {
    return `Credits must be at most ${maxCreditsPerSubject}.`;
  }
  if (!isHalfStep(numericValue)) {
    return "Credits must be in 0.5 steps.";
  }
  return "";
}

export function validateSemesterCredits(credits: string | number): string {
  const numericValue = toFiniteNumber(credits);
  if (numericValue === null) {
    return "Next semester credits must be a valid number.";
  }
  if (numericValue < 0.5) {
    return "Next semester credits must be at least 0.5.";
  }
  if (numericValue > MAX_SEMESTER_CREDITS) {
    return `Next semester credits must be ${MAX_SEMESTER_CREDITS} or less.`;
  }
  if (!isHalfStep(numericValue)) {
    return "Next semester credits must be in 0.5 steps.";
  }
  return "";
}

export function validateSubjectUniqueness(
  subjects: string[],
  newSubjectName: string,
): string {
  const trimmedName = newSubjectName.trim().toLowerCase();
  if (subjects.some((subject) => subject.trim().toLowerCase() === trimmedName)) {
    return "Subject name already exists.";
  }
  return "";
}

export function validatePlannerGrade(
  grade: string,
  gpaScale: number = 4.0,
): string {
  return validateGrade(grade, gpaScale);
}

export function validateWalletBalance(
  walletBalance: number,
  expenseAmount: number,
  allowNegative: boolean = false,
): string {
  if (allowNegative) return "";
  if (safeCompare(roundMoney(expenseAmount), roundMoney(walletBalance)) === 1) {
    return "This expense would make the wallet balance negative.";
  }
  return "";
}

export function validateCategoryBudget(
  expenseAmount: number,
  categoryBudget?: number,
  categorySpent: number = 0,
): string {
  if (categoryBudget === undefined) return "";
  const remaining = roundMoney(categoryBudget - categorySpent);
  if (safeCompare(expenseAmount, remaining) === 1) {
    return "This expense exceeds the category budget.";
  }
  return "";
}

export function validateDataIntegrity(
  data: unknown,
  schema?: Record<string, string>,
): string {
  if (!isRecord(data)) {
    return "Data must be an object.";
  }

  if (schema) {
    for (const [key, expectedType] of Object.entries(schema)) {
      if (!(key in data)) {
        return `Missing required field: ${key}`;
      }
      if (typeof data[key] !== expectedType) {
        return `Field ${key} should be ${expectedType}.`;
      }
    }
  }

  return "";
}

export function validateRequiredInputs(
  inputs: Record<string, unknown>,
  requiredFields: string[],
): string {
  for (const field of requiredFields) {
    const value = inputs[field];
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      value === false
    ) {
      return `Required field missing: ${field}`;
    }
  }
  return "";
}

export function validateIncomeBudgetRatio(income: number, budget: number): string {
  if (safeCompare(budget, income) === 1) {
    return "Monthly budget cannot exceed monthly income.";
  }
  return "";
}

export function validateBudgetAllocation(allocation: BudgetAllocation): string {
  const values = [allocation.needs, allocation.wants, allocation.savings];
  if (values.some((value) => !Number.isFinite(value) || value < 0 || value > 100)) {
    return "Allocation percentages must be between 0 and 100.";
  }
  const total = values.reduce((sum, value) => sum + value, 0);
  if (safeCompare(total, 100) !== 0) {
    return "Allocation percentages must total exactly 100.";
  }
  return "";
}

export function validatePlannerSubject(
  draft: { name: string; credits: string | number; grade?: string; isGpa?: boolean },
  existingNames: string[],
  remainingCredits: number = Infinity,
  gpaScale: number = 4.0,
): ValidationResult<{
  name: string;
  credits: number;
  grade?: PlannerGrade;
  isGpa?: boolean;
}> {
  const name = draft.name.trim();
  const credits = toFiniteNumber(draft.credits);

  if (!name) {
    return { ok: false, errors: { name: "Subject name is required." } };
  }

  const duplicateError = validateSubjectUniqueness(existingNames, name);
  if (duplicateError) {
    return { ok: false, errors: { name: duplicateError } };
  }

  const creditError = validateSubjectCredits(draft.credits);
  if (creditError) {
    return { ok: false, errors: { credits: creditError } };
  }

  if (credits !== null && Number.isFinite(remainingCredits) && safeCompare(credits, remainingCredits) === 1) {
    const overflow = roundGpa(credits - remainingCredits);
    return {
      ok: false,
      errors: {
        credits: `Adding this subject exceeds the semester limit by ${overflow.toFixed(1)} credits.`,
      },
    };
  }

  if (draft.grade) {
    const gradeError = validateGrade(draft.grade, gpaScale);
    if (gradeError) {
      return { ok: false, errors: { grade: gradeError } };
    }
  }

  return {
    ok: true,
    value: {
      name,
      credits: roundGpa(credits ?? 0),
      grade: draft.grade ? normalizeGrade(draft.grade, gpaScale) : undefined,
      isGpa: draft.isGpa,
    },
  };
}

export function validateSubjectForSemester(
  draft: { name: string; credits: string | number; grade: string; isGpa?: boolean },
  existingNames: string[],
  gpaScale: number,
): ValidationResult<{
  name: string;
  credits: number;
  grade: PlannerGrade;
  isGpa: boolean;
}> {
  const plannerResult = validatePlannerSubject(
    draft,
    existingNames,
    Infinity,
    gpaScale,
  );
  if (!plannerResult.ok) return plannerResult;

  const normalizedGrade = plannerResult.value.grade;
  if (!normalizedGrade) {
    return { ok: false, errors: { grade: "Choose a grade." } };
  }

  return {
    ok: true,
    value: {
      name: plannerResult.value.name,
      credits: plannerResult.value.credits,
      grade: normalizedGrade,
      isGpa: draft.isGpa !== false,
    },
  };
}

export function validatePlannerInputs(
  draft: PlannerInputsDraft,
  gpaScale: number,
): ValidationResult<{ targetCgpa: number; nextCredits: number }> {
  const errors: FieldErrors = {};
  const targetError = validateTargetCgpa(draft.targetCgpa, gpaScale);
  if (targetError) errors.targetCgpa = targetError;
  const creditsError = validateSemesterCredits(draft.nextCredits);
  if (creditsError) errors.nextCredits = creditsError;

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      targetCgpa: roundGpa(Number(draft.targetCgpa)),
      nextCredits: roundGpa(Number(draft.nextCredits)),
    },
  };
}

export function validateRecommendationFeasibility(
  requiredSgpa: number,
  gpaScale: number,
): ValidationResult<{ requiredSgpa: number }> {
  const normalizedRequiredSgpa = Math.max(0, roundGpa(requiredSgpa));
  if (safeCompare(normalizedRequiredSgpa, gpaScale) === 1) {
    return {
      ok: false,
      errors: {
        targetCgpa: "Target is not achievable with given credits.",
      },
    };
  }

  return {
    ok: true,
    value: { requiredSgpa: normalizedRequiredSgpa },
  };
}

export function validateTransactionPayload(
  tx: DraftTransaction,
  ctx: {
    walletBalance: number;
    isFutureDate: boolean;
    monthlyBudgetLeft?: number;
    categoryBudgetLeft?: number;
    walletExists: boolean;
  },
): ValidationResult<NormalizedTransaction> {
  const errors: FieldErrors = {};
  const warnings: string[] = [];
  const amount = roundMoney(Number(tx.amount));

  if (tx.type !== "income" && tx.type !== "expense") {
    errors.type = "Choose income or expense.";
  }

  const amountError = validateTransactionAmount(tx.amount);
  if (amountError) errors.amount = amountError;

  const categoryError =
    validateCategory(tx.category) || validateCategoryMembership(tx.category, tx.type);
  if (categoryError) errors.category = categoryError;

  if (!ctx.walletExists || !tx.walletId) {
    errors.walletId = "Please select a valid wallet.";
  }

  const dateError = validateTransactionDate(tx.date);
  if (dateError) {
    errors.date = dateError;
  } else if (ctx.isFutureDate) {
    errors.date = "Future transactions are not supported yet.";
  }

  const time = tx.time?.trim() || "00:00";
  const timeError = validateTransactionTime(time);
  if (timeError) errors.time = timeError;

  if (tx.type === "expense" && safeCompare(amount, ctx.walletBalance) === 1) {
    errors.amount = "This expense would make the wallet balance negative.";
  }

  if (
    tx.type === "expense" &&
    ctx.categoryBudgetLeft !== undefined &&
    safeCompare(amount, ctx.categoryBudgetLeft) === 1
  ) {
    warnings.push("This expense exceeds the category budget.");
  }

  if (
    tx.type === "expense" &&
    ctx.monthlyBudgetLeft !== undefined &&
    safeCompare(amount, ctx.monthlyBudgetLeft) === 1
  ) {
    warnings.push("This expense exceeds the monthly budget.");
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      type: tx.type,
      amount,
      category:
        tx.type === "expense"
          ? (tx.category as ExpenseCategory)
          : (tx.category as IncomeCategory),
      walletId: tx.walletId,
      description: tx.description?.trim() || undefined,
      date: tx.date,
      time,
    },
    warnings,
  };
}

export function validateWalletPayload(
  wallet: WalletPayload,
  existingNames: string[],
): ValidationResult<{
  name: string;
  balance: number;
  type: Wallet["type"];
  includeInTotal: boolean;
}> {
  const errors: FieldErrors = {};
  const name = wallet.name.trim();
  const balance = roundMoney(Number(wallet.balance));

  const nameError = validateWalletName(name);
  if (nameError) errors.name = nameError;

  const duplicateName = existingNames.some(
    (existingName) => existingName.trim().toLowerCase() === name.toLowerCase(),
  );
  if (duplicateName) {
    errors.name = "Wallet name already exists.";
  }

  const balanceError = validateWalletBalanceAmount(wallet.balance);
  if (balanceError) errors.balance = balanceError;

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      name,
      balance,
      type: wallet.type,
      includeInTotal: wallet.includeInTotal,
    },
  };
}

export function validateBudgetPayload(
  budget: BudgetPayload,
): ValidationResult<{
  monthlyIncome: number;
  monthlyBudget: number;
  allocationMode: Budget["allocationMode"];
  allocation: BudgetAllocation;
}> {
  const errors: FieldErrors = {};
  const monthlyIncome = roundMoney(Number(budget.monthlyIncome));
  const monthlyBudget = roundMoney(Number(budget.monthlyBudget));

  const incomeError = validateBudgetAmount(budget.monthlyIncome);
  if (incomeError) errors.monthlyIncome = incomeError.replace("Budget", "Income");

  const budgetError = validateBudgetAmount(budget.monthlyBudget);
  if (budgetError) errors.monthlyBudget = budgetError;

  const ratioError = validateIncomeBudgetRatio(monthlyIncome, monthlyBudget);
  if (ratioError) errors.monthlyBudget = ratioError;

  const allocationError = validateBudgetAllocation(budget.allocation);
  if (allocationError) errors.allocation = allocationError;

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      monthlyIncome,
      monthlyBudget,
      allocationMode: budget.allocationMode,
      allocation: budget.allocation,
    },
  };
}

export function validateCategoryBudgetPayload(
  limit: string | number,
  monthlyBudget?: number,
): ValidationResult<{ limit: number }> {
  const errors: FieldErrors = {};
  const numericLimit = roundMoney(Number(limit));
  const limitError = validateBudgetAmount(limit);
  if (limitError) errors.limit = limitError;

  if (
    monthlyBudget !== undefined &&
    !errors.limit &&
    safeCompare(numericLimit, monthlyBudget) === 1
  ) {
    errors.limit = "Category budget cannot exceed the monthly budget.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: { limit: numericLimit } };
}

export function validateRecurringExpensePayload(
  draft: RecurringExpensePayload,
  existingWalletIds: string[],
): ValidationResult<{
  title: string;
  amount: number;
  category: ExpenseCategory;
  walletId: string;
  frequency: "monthly";
  startDate: string;
  endDate: string;
}> {
  const errors: FieldErrors = {};
  const title = draft.title.trim();
  const amount = roundMoney(Number(draft.amount));

  if (!title) {
    errors.title = "Title is required.";
  }

  const amountError = validateTransactionAmount(draft.amount);
  if (amountError) errors.amount = amountError;

  const categoryError = validateCategoryMembership(draft.category, "expense");
  if (categoryError) errors.category = categoryError;

  if (!existingWalletIds.includes(draft.walletId)) {
    errors.walletId = "Please select a valid wallet.";
  }

  const startDateError = validateTransactionDate(draft.startDate, { allowFuture: true });
  if (startDateError) errors.startDate = startDateError;
  const endDateError = validateTransactionDate(draft.endDate, { allowFuture: true });
  if (endDateError) errors.endDate = endDateError;

  if (!errors.startDate && !errors.endDate) {
    const start = new Date(`${draft.startDate}T00:00:00`).getTime();
    const end = new Date(`${draft.endDate}T00:00:00`).getTime();
    if (start > end) {
      errors.endDate = "End date must be on or after the start date.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      title,
      amount,
      category: draft.category as ExpenseCategory,
      walletId: draft.walletId,
      frequency: "monthly",
      startDate: draft.startDate,
      endDate: draft.endDate,
    },
  };
}

function sanitizeSubject(
  value: unknown,
  gpaScale: number,
): Subject | null {
  if (!isRecord(value)) return null;

  const id = asTrimmedString(value.id);
  const name = asTrimmedString(value.name);
  const credits = toFiniteNumber(value.credits);
  const rawGrade = asTrimmedString(value.grade);
  const isGpa = value.isGpa !== false;

  if (!id || !name || credits === null) return null;
  const creditsError = validateSubjectCredits(credits);
  const grade = normalizeGrade(rawGrade, gpaScale);
  if (creditsError || !grade) return null;

  return {
    id,
    name,
    credits: roundGpa(credits),
    grade,
    isGpa,
  };
}

function sanitizePlannerSubject(
  value: unknown,
  gpaScale: number,
): PlannerSubject | null {
  if (!isRecord(value)) return null;

  const id = asTrimmedString(value.id);
  const name = asTrimmedString(value.name);
  const credits = toFiniteNumber(value.credits);
  const grade = normalizeGrade(asTrimmedString(value.grade), gpaScale);
  const category = asTrimmedString(value.category) || "General";
  const lockedGradeRaw = asTrimmedString(value.lockedGrade);
  const lockedGrade = lockedGradeRaw
    ? normalizeGrade(lockedGradeRaw, gpaScale)
    : undefined;

  if (!id || !name || credits === null || !grade) return null;
  if (validateSubjectCredits(credits)) return null;

  return {
    id,
    name,
    credits: roundGpa(credits),
    grade,
    category,
    lockedGrade: lockedGrade || undefined,
  };
}

function sanitizeSemesterArray(
  value: unknown,
  initialValue: Semester[],
): StorageSanitizerResult<Semester[]> {
  if (!Array.isArray(value)) {
    return { value: initialValue, valid: false };
  }

  const sanitizedSemesters: Semester[] = [];
  let valid = true;
  for (const item of value) {
    if (!isRecord(item)) {
      valid = true;
      continue;
    }

    const id = asTrimmedString(item.id);
    const year = asTrimmedString(item.year);
    const semester = asTrimmedString(item.semester);
    const subjectsValue = Array.isArray(item.subjects) ? item.subjects : [];
    const gpaScale = 4.2;
    const seenNames = new Set<string>();
    const subjects = subjectsValue
      .map((subject) => sanitizeSubject(subject, gpaScale))
      .filter((subject): subject is Subject => {
        if (!subject) return false;
        const key = subject.name.trim().toLowerCase();
        if (seenNames.has(key)) return false;
        seenNames.add(key);
        return true;
      });

    if (!id || !year || !semester) {
      valid = true;
      continue;
    }

    sanitizedSemesters.push({ id, year, semester, subjects });
  }

  return { value: sanitizedSemesters, valid };
}

function sanitizeGpaSettingsValue(
  value: unknown,
  initialValue: GpaSettings,
): StorageSanitizerResult<GpaSettings> {
  if (!isRecord(value)) {
    return { value: initialValue, valid: false };
  }

  const rawScale = value.gpaScale === 4.2 ? 4.2 : 4.0;
  const gradingMode = rawScale === 4.2 ? "extended" : "standard";
  const degreeClasses = isRecord(value.degreeClasses)
    ? {
        firstClass: toFiniteNumber(value.degreeClasses.firstClass) ?? initialValue.degreeClasses.firstClass,
        secondUpper: toFiniteNumber(value.degreeClasses.secondUpper) ?? initialValue.degreeClasses.secondUpper,
        secondLower: toFiniteNumber(value.degreeClasses.secondLower) ?? initialValue.degreeClasses.secondLower,
        general: toFiniteNumber(value.degreeClasses.general) ?? initialValue.degreeClasses.general,
      }
    : initialValue.degreeClasses;

  return {
    value: {
      gradingMode,
      gpaScale: rawScale,
      degreeClasses,
    },
    valid: true,
  };
}

function sanitizePlannerSubjectArray(
  value: unknown,
  initialValue: PlannerSubject[],
): StorageSanitizerResult<PlannerSubject[]> {
  if (!Array.isArray(value)) {
    return { value: initialValue, valid: false };
  }

  const seenNames = new Set<string>();
  const sanitized = value
    .map((item) => sanitizePlannerSubject(item, 4.2))
    .filter((item): item is PlannerSubject => {
      if (!item) return false;
      const key = item.name.trim().toLowerCase();
      if (seenNames.has(key)) return false;
      seenNames.add(key);
      return true;
    });

  return { value: sanitized, valid: true };
}

function sanitizeWalletArray(
  value: unknown,
  initialValue: Wallet[],
): StorageSanitizerResult<Wallet[]> {
  if (!Array.isArray(value)) {
    return { value: initialValue, valid: false };
  }

  const seenNames = new Set<string>();
  const sanitized: Wallet[] = [];

  for (const item of value) {
    if (!isRecord(item)) continue;
    const id = asTrimmedString(item.id);
    const name = asTrimmedString(item.name);
    const balance = toFiniteNumber(item.balance);
    const createdDate = asTrimmedString(item.createdDate);
    const type = item.type;
    const includeInTotal = item.includeInTotal !== false;

    if (!id || !name || balance === null || !createdDate) continue;
    if (validateWalletName(name) || validateWalletBalanceAmount(balance)) continue;
    if (!["cash", "debit", "credit", "savings", "digital"].includes(String(type))) continue;

    const nameKey = name.toLowerCase();
    if (seenNames.has(nameKey)) continue;
    seenNames.add(nameKey);

    sanitized.push({
      id,
      name,
      balance: roundMoney(balance),
      createdDate,
      type: type as Wallet["type"],
      includeInTotal,
    });
  }

  return { value: sanitized, valid: true };
}

function sanitizeTransactionArray(
  value: unknown,
  initialValue: Transaction[],
): StorageSanitizerResult<Transaction[]> {
  if (!Array.isArray(value)) {
    return { value: initialValue, valid: false };
  }

  const sanitized: Transaction[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    const id = asTrimmedString(item.id);
    const type = asTrimmedString(item.type);
    const amount = toFiniteNumber(item.amount);
    const category = asTrimmedString(item.category);
    const walletId = asTrimmedString(item.walletId);
    const date = asTrimmedString(item.date);
    const time = asTrimmedString(item.time) || "00:00";
    if (!id || amount === null || !walletId || !date) continue;
    if (type !== "income" && type !== "expense") continue;
    if (validateTransactionAmount(amount)) continue;
    if (validateCategoryMembership(category, type)) continue;
    if (validateTransactionDate(date, { allowFuture: true })) continue;
    if (validateTransactionTime(time)) continue;

    sanitized.push({
      id,
      type,
      amount: roundMoney(amount),
      category:
        type === "expense"
          ? (category as ExpenseCategory)
          : (category as IncomeCategory),
      walletId,
      description: asTrimmedString(item.description) || undefined,
      date,
      time,
      isRecurring: item.isRecurring === true,
      recurringId: asTrimmedString(item.recurringId) || undefined,
    });
  }

  return { value: sanitized, valid: true };
}

function sanitizeBudgetArray(
  value: unknown,
  initialValue: Budget[],
): StorageSanitizerResult<Budget[]> {
  if (!Array.isArray(value)) {
    return { value: initialValue, valid: false };
  }

  const sanitized: Budget[] = [];
  for (const item of value) {
    if (!isRecord(item) || !isRecord(item.allocation)) continue;
    const month = asTrimmedString(item.month);
    const lastUpdated = asTrimmedString(item.lastUpdated);
    const monthlyIncome = toFiniteNumber(item.monthlyIncome);
    const monthlyBudget = toFiniteNumber(item.monthlyBudget);
    const totalSpent = toFiniteNumber(item.totalSpent);

    if (!month || !lastUpdated || monthlyIncome === null || monthlyBudget === null || totalSpent === null) continue;
    const allocation: BudgetAllocation = {
      needs: toFiniteNumber(item.allocation.needs) ?? 0,
      wants: toFiniteNumber(item.allocation.wants) ?? 0,
      savings: toFiniteNumber(item.allocation.savings) ?? 0,
    };
    if (validateBudgetAmount(monthlyIncome) || validateBudgetAmount(monthlyBudget)) continue;
    if (validateIncomeBudgetRatio(monthlyIncome, monthlyBudget)) continue;
    if (validateBudgetAllocation(allocation)) continue;

    sanitized.push({
      monthlyIncome: roundMoney(monthlyIncome),
      monthlyBudget: roundMoney(monthlyBudget),
      allocationMode:
        item.allocationMode === "classic" ||
        item.allocationMode === "custom" ||
        item.allocationMode === "recommended"
          ? item.allocationMode
          : "recommended",
      allocation,
      month,
      totalSpent: roundMoney(totalSpent),
      lastUpdated,
    });
  }

  return { value: sanitized, valid: true };
}

function sanitizeRecurringExpenseArray(
  value: unknown,
  initialValue: RecurringExpense[],
): StorageSanitizerResult<RecurringExpense[]> {
  if (!Array.isArray(value)) {
    return { value: initialValue, valid: false };
  }

  const sanitized: RecurringExpense[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    const validation = validateRecurringExpensePayload(
      {
        title: asTrimmedString(item.title),
        amount: toFiniteNumber(item.amount) ?? "",
        category: asTrimmedString(item.category),
        walletId: asTrimmedString(item.walletId),
        frequency: "monthly",
        startDate: asTrimmedString(item.startDate),
        endDate: asTrimmedString(item.endDate),
      },
      [asTrimmedString(item.walletId)],
    );

    if (!validation.ok) continue;

    sanitized.push({
      id: asTrimmedString(item.id),
      ...validation.value,
      lastProcessedDate: asTrimmedString(item.lastProcessedDate) || undefined,
    });
  }

  return { value: sanitized.filter((item) => item.id), valid: true };
}

function sanitizeCategoryBudgetArray(
  value: unknown,
  initialValue: CategoryBudget[],
): StorageSanitizerResult<CategoryBudget[]> {
  if (!Array.isArray(value)) {
    return { value: initialValue, valid: false };
  }

  const sanitized: CategoryBudget[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    const id = asTrimmedString(item.id);
    const category = asTrimmedString(item.category);
    const limit = toFiniteNumber(item.limit);
    const month = asTrimmedString(item.month);
    if (!id || !month || limit === null) continue;
    if (!EXPENSE_CATEGORIES.includes(category as ExpenseCategory)) continue;
    if (validateBudgetAmount(limit)) continue;
    sanitized.push({
      id,
      category: category as ExpenseCategory,
      limit: roundMoney(limit),
      month,
    });
  }

  return { value: sanitized, valid: true };
}

function sanitizeMoneySettingsValue(
  value: unknown,
  initialValue: MoneyManagerSettings,
): StorageSanitizerResult<MoneyManagerSettings> {
  if (!isRecord(value)) {
    return { value: initialValue, valid: false };
  }

  return {
    value: {
      firstTimeSetupCompleted: value.firstTimeSetupCompleted === true,
      currency: asTrimmedString(value.currency) || initialValue.currency,
      theme: asTrimmedString(value.theme) || undefined,
    },
    valid: true,
  };
}

export function getStorageSanitizer<T>(key: string): StorageSanitizer<T> | undefined {
  const sanitizers: Record<string, StorageSanitizer<unknown>> = {
    "gpa-semesters": sanitizeSemesterArray as StorageSanitizer<unknown>,
    "gpa-settings": sanitizeGpaSettingsValue as StorageSanitizer<unknown>,
    "gpa-simulation": sanitizePlannerSubjectArray as StorageSanitizer<unknown>,
    "money-wallets": sanitizeWalletArray as StorageSanitizer<unknown>,
    "money-transactions": sanitizeTransactionArray as StorageSanitizer<unknown>,
    "money-budgets": sanitizeBudgetArray as StorageSanitizer<unknown>,
    "money-recurring-expenses":
      sanitizeRecurringExpenseArray as StorageSanitizer<unknown>,
    "money-category-budgets":
      sanitizeCategoryBudgetArray as StorageSanitizer<unknown>,
    "money-settings": sanitizeMoneySettingsValue as StorageSanitizer<unknown>,
  };

  return sanitizers[key] as StorageSanitizer<T> | undefined;
}

export function sanitizeStorageValue<T>(
  key: string,
  value: unknown,
  initialValue: T,
  sanitizer?: StorageSanitizer<T>,
): StorageSanitizerResult<T> {
  const appliedSanitizer = sanitizer ?? getStorageSanitizer<T>(key);
  if (!appliedSanitizer) {
    return { value: value as T, valid: true };
  }
  return appliedSanitizer(value, initialValue);
}

export function hasValidationErrors(errors: FieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}

export function combineWarnings(...warningGroups: Array<string[] | undefined>): string[] {
  return Array.from(new Set(warningGroups.flat().filter(Boolean) as string[]));
}

export function sanitizeAllowedGradesForDisplay(gpaScale: number): PlannerGrade[] {
  return getAllowedGrades(gpaScale);
}

export function didSanitizedArrayChange<T>(before: T[], after: T[]): boolean {
  return !arraysEqualShallow(before, after);
}
