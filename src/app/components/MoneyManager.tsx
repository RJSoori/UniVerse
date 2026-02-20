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
  ArrowDownLeft,
  Sparkles,
  Target,
  Lightbulb
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

  // --- NEW ADDITION: Intelligent Analysis & Suggestions ---
  const emergencyFundGoal = 100000;
  const goalProgress = Math.min(Math.round((balance / emergencyFundGoal) * 100), 100);

  const getSuggestions = () => {
    const suggestions = [];
    const expenses = transactions.filter(t => t.type === "expense");

    // Category Analysis
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    // 1. Entertainment Analysis (Scolding logic)
    const entertainmentSpend = categoryTotals["Entertainment"] || 0;
    if (totalExpenses > 0 && (entertainmentSpend / totalExpenses) > 0.25) {
      suggestions.push({
        text: `Analysis: Entertainment spending is ${Math.round((entertainmentSpend / totalExpenses) * 100)}% of your total outgoings. This is significantly above the average for students.`,
        icon: TrendingDown,
        color: "text-destructive"
      });
    }

    // 2. Liquidity Check
    if (balance < 5000 && balance > 0) {
      suggestions.push({
        text: "Low liquidity detected. We suggest postponing non-essential 'General' purchases this week.",
        icon: Lightbulb,
        color: "text-amber-600"
      });
    }

    // 3. Goal Tracking
    suggestions.push({
      text: `You have reached ${goalProgress}% of your 100k Emergency Fund goal. At this rate, you are on track for completion.`,
      icon: Target,
      color: "text-primary"
    });

    return suggestions;
  };

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

        {/* --- NEW ADDITION: AI Suggestions UI --- */}
        <Card className="border-primary/20 bg-primary/5 shadow-sm">
          <CardHeader className="py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold text-primary uppercase">UniVerse Financial Advisor</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {getSuggestions().map((suggestion, idx) => (
                <div key={idx} className="flex gap-3 text-[11px] bg-background p-3 rounded-lg border border-primary/10 items-start shadow-sm">
                  <suggestion.icon className={`h-4 w-4 shrink-0 ${suggestion.color}`} />
                  <p className="text-muted-foreground leading-relaxed">{suggestion.text}</p>
                </div>
            ))}
            <div className="pt-2 border-t border-primary/10">
              <div className="flex justify-between text-[10px] mb-1 font-bold">
                <span>100,000 LKR Savings Goal</span>
                <span>{goalProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${goalProgress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wider opacity-70">Current Balance</CardTitle>
              <Wallet className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">LKR {balance.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-emerald-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wider opacity-70">Total Income</CardTitle>
              <ArrowUpRight className="size-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">LKR {totalIncome.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-destructive/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wider opacity-70">Total Expenses</CardTitle>
              <ArrowDownLeft className="size-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">LKR {totalExpenses.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {showAddForm && (
            <Card className="border-primary/20 shadow-md">
              <CardHeader>
                <CardTitle>New Transaction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                        placeholder="e.g. Salary, Cinema, Uber"
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
                    <select
                        className="w-full p-2 border rounded-md bg-background text-sm"
                        value={newTx.category}
                        onChange={(e) => setNewTx({...newTx, category: e.target.value})}
                    >
                      <option value="General">General</option>
                      <option value="Food">Food</option>
                      <option value="Transport">Transport</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Academic">Academic</option>
                      <option value="Salary">Salary</option>
                    </select>
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
        <Card className="shadow-sm">
          <CardHeader className="border-b">
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {transactions.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground text-sm italic">No transactions yet.</p>
              ) : (
                  transactions.map((t) => (
                      <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-all shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}>
                            {t.type === 'income' ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">{t.title}</h4>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">{t.category} • {t.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                    <span className={`font-bold text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-destructive'}`}>
                      {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString()}
                    </span>
                          <Button variant="ghost" size="sm" onClick={() => deleteTransaction(t.id)} className="text-muted-foreground hover:text-destructive h-8 w-8">
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