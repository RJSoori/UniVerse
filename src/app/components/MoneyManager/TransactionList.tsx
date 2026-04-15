import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useMoneyManager } from "../../hooks/useMoneyManager";
import { AddTransactionForm } from "./AddTransactionForm";
import { Transaction, type Wallet } from "./types";
import {
  Trash2,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Edit2,
} from "lucide-react";
import { formatCurrency } from "../../utils/currencyUtils";

interface TransactionListProps {
  maxItems?: number;
  compact?: boolean;
}

export function TransactionList({ maxItems, compact }: TransactionListProps) {
  const { transactions, wallets, deleteTransaction } = useMoneyManager();
  const [expanded, setExpanded] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<
    string | null
  >(null);

  // Defensive check: ensure transactions is an array
  const validTransactions = Array.isArray(transactions) ? transactions : [];

  // Sort transactions chronologically by date and time (newest first for display)
  const sortedTransactions = useMemo(() => {
    return validTransactions
      .filter(
        (t) =>
          t &&
          t.id &&
          t.category &&
          t.type &&
          t.amount !== undefined &&
          t.amount !== null,
      )
      .sort((a, b) => {
        try {
          const dateA = new Date(`${a.date} ${a.time || "00:00"}`).getTime();
          const dateB = new Date(`${b.date} ${b.time || "00:00"}`).getTime();
          return dateB - dateA; // Newest first
        } catch {
          return 0;
        }
      });
  }, [validTransactions]);

  const editingTransaction = useMemo(
    () => validTransactions.find((t) => t.id === editingTransactionId) ?? null,
    [validTransactions, editingTransactionId],
  );

  const displayTransactions =
    expanded || !maxItems
      ? sortedTransactions
      : sortedTransactions.slice(0, maxItems);

  const getWalletName = (walletId: string) => {
    const walletsArray = Array.isArray(wallets) ? wallets : [];
    return (
      walletsArray.find((w: Wallet) => w.id === walletId)?.name ||
      "Unknown Wallet"
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
        {!validTransactions || validTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No transactions yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayTransactions.map((tx: Transaction) => {
              // Defensive check for transaction object
              if (
                !tx ||
                !tx.id ||
                !tx.category ||
                !tx.type ||
                tx.amount === undefined ||
                tx.amount === null
              ) {
                return null;
              }
              return (
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
                        {tx.description || getWalletName(tx.walletId)} •{" "}
                        {tx.date} {tx.time || "00:00"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        Wallet: {getWalletName(tx.walletId)}
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
                      {tx.type === "income" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTransactionId(tx.id)}
                      className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
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
              );
            })}

            {maxItems && sortedTransactions.length > maxItems && (
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
                    Show All ({sortedTransactions.length}){" "}
                    <ChevronDown className="ml-2 h-3 w-3" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>

      {editingTransaction && (
        <Dialog
          open={Boolean(editingTransaction)}
          onOpenChange={(open) => !open && setEditingTransactionId(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
            </DialogHeader>
            <AddTransactionForm
              initialTransaction={editingTransaction}
              onClose={() => setEditingTransactionId(null)}
              onSave={() => setEditingTransactionId(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
