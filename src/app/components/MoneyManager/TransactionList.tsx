import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useMoneyManager } from "../../hooks/useMoneyManager";
import { Transaction, type Wallet } from "./types";
import {
  Trash2,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface TransactionListProps {
  maxItems?: number;
  compact?: boolean;
}

export function TransactionList({ maxItems, compact }: TransactionListProps) {
  const { transactions, wallets, deleteTransaction } = useMoneyManager();
  const [expanded, setExpanded] = useState(false);

  const displayTransactions =
    expanded || !maxItems ? transactions : transactions.slice(0, maxItems);

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
      <CardHeader className={compact ? "pb-3" : undefined}>
        <CardTitle className={compact ? "text-base" : undefined}>
          {compact ? "Recent Transactions" : "Transaction History"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No transactions yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayTransactions.map((tx: Transaction) => (
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
                        {tx.category}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {tx.description || getWalletName(tx.walletId)} • {tx.date}
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
                    className="text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {maxItems && transactions.length > maxItems && (
              <Button
                variant="outline"
                className="w-full text-xs h-8 mt-2"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <>
                    Show Less <ChevronUp className="ml-2 h-3 w-3" />
                  </>
                ) : (
                  <>
                    Show All ({transactions.length}){" "}
                    <ChevronDown className="ml-2 h-3 w-3" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
