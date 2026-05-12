import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../shared/ui/dialog";
import { AlertCircle, Plus, Trash2, RefreshCw } from "lucide-react";
import { useMoneyManager } from "./hooks/useMoneyManager";
import { formatCurrency } from "./utils/currency";
import { EXPENSE_CATEGORIES } from "./constants/categories";
import type { ExpenseCategory } from "./types";

function computeEndDate(startDate: string, numberOfPayments: number): string {
  if (!startDate || numberOfPayments < 1) return "";
  const [y, m, d] = startDate.split("-").map(Number);
  const endMonth = m + numberOfPayments - 1;
  const endYear = y + Math.floor((endMonth - 1) / 12);
  const endMo = ((endMonth - 1) % 12) + 1;
  const maxDay = new Date(endYear, endMo, 0).getDate();
  const day = Math.min(d, maxDay);
  return `${endYear}-${String(endMo).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function RecurringExpenses() {
  const {
    wallets,
    recurringExpenses,
    createRecurringExpense,
    deleteRecurringExpense,
    getRecurringExpensesForCurrentMonth,
  } = useMoneyManager();

  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "Bills" as ExpenseCategory,
    walletId: "",
    startDate: "",
    numberOfPayments: "",
  });

  const activeThisMonth = getRecurringExpensesForCurrentMonth();

  const computedEndDate = useMemo(
    () => computeEndDate(formData.startDate, Number(formData.numberOfPayments) || 0),
    [formData.startDate, formData.numberOfPayments],
  );

  const resetForm = () => {
    setFormData({
      title: "",
      amount: "",
      category: "Bills",
      walletId: wallets[0]?.id ?? "",
      startDate: "",
      numberOfPayments: "",
    });
    setErrors({});
  };

  const handleCreate = () => {
    setErrors({});
    if (!formData.numberOfPayments || Number(formData.numberOfPayments) < 1) {
      setErrors({ numberOfPayments: "Enter at least 1 payment." });
      return;
    }
    const result = createRecurringExpense({
      title: formData.title,
      amount: Number(formData.amount),
      category: formData.category,
      walletId: formData.walletId,
      frequency: "monthly",
      startDate: formData.startDate,
      endDate: computedEndDate,
    });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    resetForm();
    setIsOpen(false);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Recurring Expenses</h3>
          <p className="text-sm text-muted-foreground">
            Manage your monthly fixed commitments
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" /> Add Recurring
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Recurring Expense</DialogTitle>
              <DialogDescription>
                Set up a monthly recurring expense that auto-generates transactions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="e.g., Netflix subscription"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className={errors.amount ? "border-red-500" : ""}
                />
                {errors.amount && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.amount}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  className="w-full p-2 border rounded-md bg-background text-sm"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as ExpenseCategory })
                  }
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.category}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Wallet</Label>
                <select
                  className={`w-full p-2 border rounded-md bg-background text-sm ${errors.walletId ? "border-red-500" : ""}`}
                  value={formData.walletId}
                  onChange={(e) => setFormData({ ...formData, walletId: e.target.value })}
                >
                  <option value="">Select a wallet</option>
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
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
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className={errors.startDate ? "border-red-500" : ""}
                />
                {errors.startDate && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Number of Payments</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="e.g., 12"
                  value={formData.numberOfPayments}
                  onChange={(e) => setFormData({ ...formData, numberOfPayments: e.target.value })}
                  className={errors.numberOfPayments ? "border-red-500" : ""}
                />
                {errors.numberOfPayments && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.numberOfPayments}
                  </p>
                )}
                {computedEndDate && (
                  <p className="text-xs text-muted-foreground">
                    End date: {computedEndDate}
                  </p>
                )}
              </div>

              <Button onClick={handleCreate} className="w-full">
                Create Recurring Expense
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {recurringExpenses.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <RefreshCw className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                No recurring expenses yet. Add your monthly subscriptions and fixed costs.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeThisMonth.length > 0 && (
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active This Month</p>
                    <p className="text-2xl font-bold mt-1">
                      {formatCurrency(activeThisMonth.reduce((sum, e) => sum + e.amount, 0))}
                    </p>
                  </div>
                  <RefreshCw className="h-8 w-8 text-primary/40" />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recurringExpenses.map((expense) => {
              const wallet = wallets.find((w) => w.id === expense.walletId);
              return (
                <Card key={expense.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3 flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{expense.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {expense.category} &middot; Monthly
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRecurringExpense(expense.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          Amount
                        </p>
                        <p className="text-xl font-bold">
                          {formatCurrency(expense.amount)}
                        </p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        {wallet && <p>{wallet.name}</p>}
                        <p>
                          {expense.startDate} &rarr; {expense.endDate}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
