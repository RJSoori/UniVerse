import { useEffect, useMemo, useState } from "react";
import { useUniStorage } from "../../hooks/useUniStorage";
import { useMoneyManager } from "../../hooks/useMoneyManager";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { AlertCircle, X } from "lucide-react";
import { getCurrentISTDate, getCurrentISTTime } from "../../utils/dateUtils";
import {
  CATEGORY_ICONS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "../../constants/transactionCategories";
import { formatCurrencyLabel, formatCurrency } from "../../utils/currencyUtils";
import {
  validateTransactionAmount,
  validateTransactionDate,
  validateTransactionTime,
} from "../../utils/validation";

export function QuickAddTransaction({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { wallets, addTransaction } = useMoneyManager();

  const [lastUsage, setLastUsage] = useUniStorage("quick-add-transaction", {
    type: "expense" as "expense" | "income",
    category: "Food",
    walletId: wallets[0]?.id ?? "",
  });

  const initialWalletId = useMemo(() => {
    if (!wallets.length) return "";
    return wallets.some((w) => w.id === lastUsage.walletId)
      ? lastUsage.walletId
      : wallets[0].id;
  }, [wallets, lastUsage.walletId]);

  const [type, setType] = useState<"income" | "expense">(lastUsage.type);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(lastUsage.category);
  const [walletId, setWalletId] = useState(initialWalletId);
  const [description, setDescription] = useState("");
  const [customDate, setCustomDate] = useState(getCurrentISTDate());
  const [customTime, setCustomTime] = useState(getCurrentISTTime());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    if (initialWalletId && walletId !== initialWalletId) {
      setWalletId(initialWalletId);
    }
  }, [initialWalletId, walletId]);

  useEffect(() => {
    if (open) {
      setAmount("");
      setDescription("");
      setCustomDate(getCurrentISTDate());
      setCustomTime(getCurrentISTTime());
    }
  }, [open]);

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleAdd = () => {
    setErrors({});
    setWarnings([]);

    const amountError = validateTransactionAmount(amount);
    const dateError = validateTransactionDate(customDate);
    const timeError = validateTransactionTime(customTime);
    if (amountError || dateError || timeError || !walletId || !category) {
      setErrors({
        ...(amountError ? { amount: amountError } : {}),
        ...(dateError ? { date: dateError } : {}),
        ...(timeError ? { time: timeError } : {}),
        ...(!walletId ? { walletId: "Please select a wallet." } : {}),
        ...(!category ? { category: "Choose a category." } : {}),
      });
      return;
    }

    const result = addTransaction({
      type,
      amount,
      category: category as any,
      walletId,
      description: description.trim() || undefined,
      date: customDate,
      time: customTime,
    });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setWarnings(result.warnings ?? []);

    setLastUsage({ type, category, walletId });
    if ((result.warnings ?? []).length === 0) {
      setAmount("");
      setDescription("");
      setCustomDate(getCurrentISTDate());
      setCustomTime(getCurrentISTTime());
      onOpenChange(false);
    }
  };

  const selectedIcon = CATEGORY_ICONS[category] ?? "💳";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0">
        <Card className="overflow-hidden">
          <CardHeader className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Quick Add</CardTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Add a transaction in 2–3 taps.
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-xs">Amount</Label>
                <Input
                  className="text-4xl font-bold text-right"
                  inputMode="decimal"
                  pattern="[0-9]*"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (errors.amount) setErrors((prev) => ({ ...prev, amount: "" }));
                  }}
                  placeholder="0.00"
                />
                {errors.amount && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.amount}
                  </p>
                )}
              </div>
              <div className="text-center">
                <div className="text-3xl">{selectedIcon}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {category}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Type</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={type === "expense" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setType("expense")}
                >
                  Expense
                </Button>
                <Button
                  variant={type === "income" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setType("income")}
                >
                  Income
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Category</Label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat) => {
                  const icon = CATEGORY_ICONS[cat] ?? "💳";
                  const selected = cat === category;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`rounded-lg border p-2 text-center text-xs transition focus:outline-none focus:ring-2 focus:ring-primary ${
                        selected
                          ? "border-primary bg-primary/10"
                          : "border-border bg-background"
                      }`}
                    >
                      <div className="text-lg">{icon}</div>
                      <div className="truncate mt-1">{cat}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Wallet</Label>
              <select
                value={walletId}
                onChange={(e) => {
                  setWalletId(e.target.value);
                  if (errors.walletId) {
                    setErrors((prev) => ({ ...prev, walletId: "" }));
                  }
                }}
                className={`w-full p-2 border rounded-md bg-background text-sm ${errors.walletId ? "border-red-500" : ""}`}
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({formatCurrency(w.balance)})
                  </option>
                ))}
              </select>
              {errors.walletId && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.walletId}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Description (Optional)</Label>
              <Input
                placeholder="Add a note..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={150}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Date</Label>
                <Input
                  type="date"
                  value={customDate}
                  onChange={(e) => {
                    setCustomDate(e.target.value);
                    if (errors.date) setErrors((prev) => ({ ...prev, date: "" }));
                  }}
                />
                {errors.date && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.date}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Time (IST)</Label>
                <Input
                  type="time"
                  value={customTime}
                  onChange={(e) => {
                    setCustomTime(e.target.value);
                    if (errors.time) setErrors((prev) => ({ ...prev, time: "" }));
                  }}
                />
                {errors.time && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.time}
                  </p>
                )}
              </div>
            </div>
            {warnings.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 space-y-1">
                {warnings.map((warning) => (
                  <p key={warning} className="text-sm text-amber-700 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {warning}
                  </p>
                ))}
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleAdd}
              disabled={amount.trim() === "" || !walletId || !category}
            >
              Add Transaction
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
