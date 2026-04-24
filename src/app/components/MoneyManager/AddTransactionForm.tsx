import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useMoneyManager } from "../../hooks/useMoneyManager";
import {
  ExpenseCategory,
  IncomeCategory,
  Transaction,
  type Wallet,
} from "./types";
import { X, AlertCircle } from "lucide-react";
import { getCurrentISTDate, getCurrentISTTime } from "../../utils/dateUtils";
import {
  CATEGORY_ICONS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "../../constants/transactionCategories";
import {
  formatCurrencyLabel,
  formatCurrency,
  getCurrency,
} from "../../utils/currencyUtils";
import {
  validateTransactionAmount,
  validateCategory,
  validateTransactionDate,
  validateTransactionTime,
} from "../../utils/validation";

interface AddTransactionFormProps {
  onClose?: () => void;
  compact?: boolean;
  initialTransaction?: Transaction;
  onSave?: () => void;
}

export function AddTransactionForm({
  onClose,
  compact,
  initialTransaction,
  onSave,
}: AddTransactionFormProps) {
  const { wallets, addTransaction, updateTransaction } = useMoneyManager();
  const [type, setType] = useState<"income" | "expense">(
    initialTransaction?.type ?? "expense",
  );
  const [amount, setAmount] = useState(
    initialTransaction?.amount?.toString() ?? "",
  );
  const [category, setCategory] = useState<string>(
    initialTransaction?.category ?? EXPENSE_CATEGORIES[0],
  );
  const [walletId, setWalletId] = useState(
    initialTransaction?.walletId ?? wallets[0]?.id ?? "",
  );
  const [description, setDescription] = useState(
    initialTransaction?.description ?? "",
  );
  const [date, setDate] = useState(
    initialTransaction?.date ?? getCurrentISTDate(),
  );
  const [time, setTime] = useState(
    initialTransaction?.time ?? getCurrentISTTime(),
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);

  // Validation state
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (!initialTransaction) return;
    setType(initialTransaction.type);
    setAmount(initialTransaction.amount.toString());
    setCategory(initialTransaction.category);
    setWalletId(initialTransaction.walletId);
    setDescription(initialTransaction.description ?? "");
    setDate(initialTransaction.date);
    setTime(initialTransaction.time ?? getCurrentISTTime());
  }, [initialTransaction]);

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = () => {
    // Clear previous validation errors
    setValidationErrors({});
    setWarnings([]);

    // Validate amount
    const amountError = validateTransactionAmount(amount);
    if (amountError) {
      setValidationErrors((prev) => ({ ...prev, amount: amountError }));
      return;
    }

    // Validate category
    const categoryError = validateCategory(category);
    if (categoryError) {
      setValidationErrors((prev) => ({ ...prev, category: categoryError }));
      return;
    }

    // Validate wallet selection
    if (!walletId) {
      setValidationErrors((prev) => ({
        ...prev,
        walletId: "Please select a wallet",
      }));
      return;
    }

    // Validate date
    const dateError = validateTransactionDate(date);
    if (dateError) {
      setValidationErrors((prev) => ({ ...prev, date: dateError }));
      return;
    }

    // Validate time
    const timeError = validateTransactionTime(time);
    if (timeError) {
      setValidationErrors((prev) => ({ ...prev, time: timeError }));
      return;
    }

    const payload = {
      type,
      amount: parseFloat(amount),
      category: category as any,
      walletId,
      description: description || undefined,
      date,
      time,
    };

    let resultWarnings: string[] = [];

    if (initialTransaction) {
      const result = updateTransaction(initialTransaction.id, payload);
      if (!result.ok) {
        setValidationErrors(result.errors);
        return;
      }
      resultWarnings = result.warnings ?? [];
      setWarnings(resultWarnings);
      onSave?.();
    } else {
      const result = addTransaction(payload);
      if (!result.ok) {
        setValidationErrors(result.errors);
        return;
      }
      resultWarnings = result.warnings ?? [];
      setWarnings(resultWarnings);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }

    if (resultWarnings.length === 0) {
      // Reset form
      setAmount("");
      setCategory(
        type === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
      );
      setDescription("");
      setDate(getCurrentISTDate());
      setTime(getCurrentISTTime());

      onClose?.();
    }
  };

  if (wallets.length === 0) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <p className="text-sm font-semibold text-amber-900">
              No wallets found
            </p>
            <p className="text-xs text-amber-800">
              Create a wallet first to add transactions.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className={compact ? "pb-3" : undefined}>
        <div className="flex items-center justify-between">
          <CardTitle className={compact ? "text-base" : undefined}>
            {initialTransaction
              ? "Edit Transaction"
              : type === "income"
                ? "Add Income"
                : "Add Expense"}
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Type Selection */}
        <div className="flex gap-2">
          <Button
            variant={type === "expense" ? "default" : "outline"}
            className="flex-1 text-xs h-8"
            onClick={() => {
              setType("expense");
              setCategory(EXPENSE_CATEGORIES[0]);
            }}
          >
            Expense
          </Button>
          <Button
            variant={type === "income" ? "default" : "outline"}
            className="flex-1 text-xs h-8"
            onClick={() => {
              setType("income");
              setCategory(INCOME_CATEGORIES[0]);
            }}
          >
            Income
          </Button>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label className="text-xs">{formatCurrencyLabel()}</Label>
          <Input
            type="number"
            placeholder="0.00"
            inputMode="decimal"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              // Clear validation error when user starts typing
              if (validationErrors.amount) {
                setValidationErrors((prev) => ({ ...prev, amount: "" }));
              }
            }}
            className={`text-3xl font-semibold text-right ${validationErrors.amount ? "border-red-500" : ""}`}
          />
          {validationErrors.amount && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {validationErrors.amount}
            </p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label className="text-xs">Category</Label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((categoryItem) => {
              const icon = CATEGORY_ICONS[categoryItem] ?? "💳";
              const selected = categoryItem === category;
              return (
                <button
                  key={categoryItem}
                  type="button"
                  onClick={() => setCategory(categoryItem)}
                  className={`rounded-lg border p-2 text-center text-xs transition focus:outline-none focus:ring-2 focus:ring-primary ${
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background"
                  }`}
                >
                  <div className="text-lg">{icon}</div>
                  <div className="truncate mt-1">{categoryItem}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wallet */}
        <div className="space-y-2">
          <Label className="text-xs">Wallet</Label>
          <select
            className={`w-full p-2 border rounded-md bg-background text-sm ${validationErrors.walletId ? "border-red-500" : ""}`}
            value={walletId}
            onChange={(e) => {
              setWalletId(e.target.value);
              // Clear validation error when user makes selection
              if (validationErrors.walletId) {
                setValidationErrors((prev) => ({ ...prev, walletId: "" }));
              }
            }}
          >
            <option value="">Select a wallet</option>
            {wallets.map((w: Wallet) => (
              <option key={w.id} value={w.id}>
                {w.name} ({formatCurrency(w.balance)})
              </option>
            ))}
          </select>
          {validationErrors.walletId && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {validationErrors.walletId}
            </p>
          )}
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-xs">Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                // Clear validation error when user changes date
                if (validationErrors.date) {
                  setValidationErrors((prev) => ({ ...prev, date: "" }));
                }
              }}
              className={`text-sm ${validationErrors.date ? "border-red-500" : ""}`}
            />
            {validationErrors.date && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.date}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Time (IST)</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
                // Clear validation error when user changes time
                if (validationErrors.time) {
                  setValidationErrors((prev) => ({ ...prev, time: "" }));
                }
              }}
              className={`text-sm ${validationErrors.time ? "border-red-500" : ""}`}
            />
            {validationErrors.time && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.time}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label className="text-xs">Description (Optional)</Label>
          <Input
            placeholder="e.g., Lunch at ABC cafe"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="text-sm"
          />
        </div>
        {/* General validation error */}
        {validationErrors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {validationErrors.general}
            </p>
          </div>
        )}
        {warnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 space-y-1">
            {warnings.map((warning) => (
              <p
                key={warning}
                className="text-sm text-amber-700 flex items-center gap-1"
              >
                <AlertCircle className="h-4 w-4" />
                {warning}
              </p>
            ))}
          </div>
        )}
        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={amount.trim() === "" || !category || !walletId}
          className="w-full"
        >
          {type === "income" ? "Add Income" : "Add Expense"}
        </Button>

        {showSuccess && (
          <div className="text-center text-sm text-emerald-600 font-medium">
            ✓ Transaction added successfully!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
