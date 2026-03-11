import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useMoneyManager } from "../../hooks/useMoneyManager";
import { ExpenseCategory, IncomeCategory, type Wallet } from "./types";
import { X } from "lucide-react";

interface AddTransactionFormProps {
  onClose?: () => void;
  compact?: boolean;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Food",
  "Dining Out",
  "Transportation",
  "Rent / Accommodation",
  "Education",
  "Shopping",
  "Entertainment",
  "Health",
  "Clothing",
  "Bills",
  "Other",
];

const INCOME_CATEGORIES: IncomeCategory[] = [
  "Allowance",
  "Salary",
  "Freelance",
  "Scholarship",
  "Business",
  "Dividends",
  "Investments",
  "Tips",
  "Other",
];

export function AddTransactionForm({
  onClose,
  compact,
}: AddTransactionFormProps) {
  const { wallets, addTransaction } = useMoneyManager();
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [walletId, setWalletId] = useState(wallets[0]?.id || "");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = () => {
    if (!amount || !category || !walletId) return;

    addTransaction({
      type,
      amount: parseFloat(amount),
      category: category as any,
      walletId,
      description: description || undefined,
      date,
    });

    // Reset form
    setAmount("");
    setCategory(
      type === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
    );
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);

    onClose?.();
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
            {type === "income" ? "Add Income" : "Add Expense"}
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
          <Label className="text-xs">Amount (LKR)</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-sm"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label className="text-xs">Category</Label>
          <select
            className="w-full p-2 border rounded-md bg-background text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Wallet */}
        <div className="space-y-2">
          <Label className="text-xs">Wallet</Label>
          <select
            className="w-full p-2 border rounded-md bg-background text-sm"
            value={walletId}
            onChange={(e) => setWalletId(e.target.value)}
          >
            {wallets.map((w: Wallet) => (
              <option key={w.id} value={w.id}>
                {w.name} (LKR {w.balance.toLocaleString()})
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label className="text-xs">Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-sm"
          />
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

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={!amount || !category || !walletId}
          className="w-full"
        >
          {type === "income" ? "Add Income" : "Add Expense"}
        </Button>
      </CardContent>
    </Card>
  );
}
