import { useState } from "react";
import { useUniStorage } from "../hooks/useUniStorage";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import {
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react";

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
}

export function MoneyManager() {
  const [transactions, setTransactions] = useUniStorage<Transaction[]>("money-transactions", []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTx, setNewTx] = useState({
    title: "",
    amount: "",
    type: "expense" as "income" | "expense",
    category: "General",
  });

  const addTransaction = () => {
    if (!newTx.title || !newTx.amount) return;
    const tx: Transaction = {
      id: Date.now().toString(),
      title: newTx.title,
      amount: parseFloat(newTx.amount),
      type: newTx.type,
      category: newTx.category,
      date: new Date().toISOString().split("T")[0],
    };
    setTransactions([tx, ...transactions]);
    setNewTx({ title: "", amount: "", type: "expense", category: "General" });
    setShowAddForm(false);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Money Manager</h2>
            <p className="text-muted-foreground text-sm">Track your budget and savings goals</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="mr-2 h-4 w-4" /> Add Transaction
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
              <Wallet className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">LKR {balance.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <ArrowUpRight className="size-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">LKR {totalIncome.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <ArrowDownLeft className="size-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">LKR {totalExpenses.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>New Transaction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                        placeholder="e.g. Salary, Grocery, Internet"
                        value={newTx.title}
                        onChange={(e) => setNewTx({...newTx, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Amount (LKR)</Label>
                    <Input
                        type="number"
                        placeholder="0.00"
                        value={newTx.amount}
                        onChange={(e) => setNewTx({...newTx, amount: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <Label>Type</Label>
                    <select
                        className="w-full p-2 border rounded-md bg-background text-sm"
                        value={newTx.type}
                        onChange={(e) => setNewTx({...newTx, type: e.target.value as any})}
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Category</Label>
                    <Input
                        placeholder="e.g. Food, Transport"
                        value={newTx.category}
                        onChange={(e) => setNewTx({...newTx, category: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={addTransaction} className="flex-1">Save Transaction</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
        )}

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground text-sm">No transactions yet.</p>
              ) : (
                  transactions.map((t) => (
                      <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}>
                            {t.type === 'income' ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{t.title}</h4>
                            <p className="text-[10px] text-muted-foreground uppercase">{t.category} • {t.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                    <span className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-destructive'}`}>
                      {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString()}
                    </span>
                          <Button variant="ghost" size="sm" onClick={() => deleteTransaction(t.id)} className="text-destructive">
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
  );
}