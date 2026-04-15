import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { useMoneyManager } from "../../hooks/useMoneyManager";
import { Search, TrendingUp, TrendingDown, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { type Wallet } from "./types";

export function SearchTransactions() {
  const { searchTransactions, deleteTransaction, wallets } = useMoneyManager();
  const [query, setQuery] = useState("");
  const results = query.trim() ? searchTransactions(query) : [];

  const highlightText = (text: string, term: string) => {
    if (!term) return text;
    const regex = new RegExp(
      `(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-foreground">
          {part}
        </mark>
      ) : (
        <span key={index}>{part}</span>
      ),
    );
  };

  const getWalletName = (walletId: string) => {
    return (
      wallets.find((w: Wallet) => w.id === walletId)?.name || "Unknown Wallet"
    );
  };

  const getCategoryEmoji = (category: string): string => {
    const mapping: Record<string, string> = {
      Food: "🍽️",
      "Dining Out": "🍕",
      Transportation: "🚗",
      "Rent / Accommodation": "🏠",
      Education: "📚",
      Shopping: "🛍️",
      Entertainment: "🎬",
      Health: "⚕️",
      Clothing: "👕",
      Bills: "💵",
      Allowance: "💰",
      Salary: "💼",
      Freelance: "💻",
      Scholarship: "🎓",
      Business: "📊",
      Dividends: "📈",
      Investments: "🏦",
      Tips: "🎁",
      Other: "📌",
    };
    return mapping[category] || "💳";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Search Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, category, or amount..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {query.trim() && (
          <div className="space-y-2">
            {results.length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No transactions found.
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  {results.length} result{results.length !== 1 ? "s" : ""} found
                </p>
                <div className="space-y-2">
                  {results.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className={`p-2 rounded-lg flex-shrink-0 ${
                            tx.type === "income"
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {tx.type === "income" ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              {getCategoryEmoji(tx.category)}
                            </span>
                            <h4 className="font-medium text-sm truncate">
                              {highlightText(tx.category, query)}
                            </h4>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {highlightText(
                              tx.description || getWalletName(tx.walletId),
                              query,
                            )}{" "}
                            • {tx.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`font-bold text-sm whitespace-nowrap ${
                            tx.type === "income"
                              ? "text-emerald-600"
                              : "text-destructive"
                          }`}
                        >
                          {tx.type === "income" ? "+" : "-"}LKR{" "}
                          {tx.amount.toLocaleString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTransaction(tx.id)}
                          className="text-destructive hover:text-destructive opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
