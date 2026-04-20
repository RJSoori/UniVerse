import { useState, useCallback } from "react";
import { Transaction, Wallet } from "../components/MoneyManager/types";
import { ExpenseCategory, IncomeCategory } from "../components/MoneyManager/types";
import { getCurrentISTDate, getCurrentISTTime } from "./dateUtils";
import {
  validateTransactionAmount,
  validateCategory,
  validateTransactionDate,
  validateTransactionTime,
} from "./validation";

export interface TransactionFormState {
  type: "income" | "expense";
  amount: string;
  category: ExpenseCategory | IncomeCategory | "";
  walletId: string;
  description: string;
  date: string;
  time: string;
}

export interface TransactionFormErrors {
  amount?: string;
  category?: string;
  walletId?: string;
  date?: string;
  time?: string;
}

interface UseTransactionFormProps {
  initialTransaction?: Transaction;
  wallets: Wallet[];
}

export function useTransactionForm({
  initialTransaction,
  wallets,
}: UseTransactionFormProps) {
  const [formData, setFormData] = useState<TransactionFormState>({
    type: initialTransaction?.type ?? "expense",
    amount: initialTransaction?.amount?.toString() ?? "",
    category: (initialTransaction?.category as ExpenseCategory | IncomeCategory) ?? "",
    walletId: initialTransaction?.walletId ?? (wallets[0]?.id || ""),
    description: initialTransaction?.description ?? "",
    date: initialTransaction?.date ?? getCurrentISTDate(),
    time: initialTransaction?.time ?? getCurrentISTTime(),
  });

  const [errors, setErrors] = useState<TransactionFormErrors>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: TransactionFormErrors = {};

    const amountError = validateTransactionAmount(formData.amount);
    if (amountError) newErrors.amount = amountError;

    const categoryError = validateCategory(formData.category.toString());
    if (categoryError) newErrors.category = categoryError;

    if (!formData.walletId) {
      newErrors.walletId = "Wallet is required";
    }

    const dateError = validateTransactionDate(formData.date);
    if (dateError) newErrors.date = dateError;

    if (formData.time) {
      const timeError = validateTransactionTime(formData.time);
      if (timeError) newErrors.time = timeError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const updateField = useCallback(
    <K extends keyof TransactionFormState>(field: K, value: TransactionFormState[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error for this field when user starts typing
      if (errors[field as keyof TransactionFormErrors]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as keyof TransactionFormErrors];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const resetForm = useCallback(() => {
    setFormData({
      type: "expense",
      amount: "",
      category: "",
      walletId: wallets[0]?.id || "",
      description: "",
      date: getCurrentISTDate(),
      time: getCurrentISTTime(),
    });
    setErrors({});
  }, [wallets]);

  return {
    formData,
    errors,
    updateField,
    validateForm,
    resetForm,
    setFormData,
  };
}
