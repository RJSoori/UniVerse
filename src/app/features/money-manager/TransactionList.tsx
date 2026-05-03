import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../shared/ui/dialog";
import { useMoneyManager } from "./hooks/useMoneyManager";
import { AddTransactionForm } from "./AddTransactionForm";
import { Transaction } from "./types";
import {
  Trash2,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Edit2,
  Search,
} from "lucide-react";
import { formatCurrency } from "./utils/currency";
import { getCategoryEmoji, getWalletName } from "./utils/transactions";

interface TransactionListProps {
  maxItems?: number;
  compact?: boolean;
  searchable?: boolean;
}

export function TransactionList({
  maxItems,
  compact,
  searchable = false,
}: TransactionListProps) {
  const { transactions, wallets, deleteTransaction } = useMoneyManager();
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
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

  const filteredTransactions = useMemo(() => {
    if (!searchable || !query.trim()) return sortedTransactions;

    const q = query.toLowerCase();
    return sortedTransactions.filter((tx) => {
      const walletName = getWalletName(tx.walletId, wallets).toLowerCase();
      return (
        tx.category.toLowerCase().includes(q) ||
        (tx.description || "").toLowerCase().includes(q) ||
        tx.date.toLowerCase().includes(q) ||
        tx.amount.toString().includes(q) ||
        walletName.includes(q)
      );
    });
  }, [sortedTransactions, query, searchable, wallets]);

  const displayTransactions =
    expanded || !maxItems
      ? filteredTransactions
      : filteredTransactions.slice(0, maxItems);

  return (
    <Card>
      <CardHeader className={compact ? "pb-3" : undefined}>
        <CardTitle className={compact ? "text-base" : undefined}>
          {searchable
            ? "Search Transactions"
            : compact
              ? "Recent Transactions"
              : "Transaction History"}
        </CardTitle>
      </CardHeader>
      <CardContent className={searchable ? "space-y-4" : undefined}>
        {searchable && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, category, wallet, date, or amount..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {!validTransactions || validTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No transactions yet.
            </p>
          </div>
        ) : searchable && query.trim() && filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No transactions found.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {searchable && query.trim() && (
              <p className="text-xs text-muted-foreground">
                {filteredTransactions.length} result
                {filteredTransactions.length !== 1 ? "s" : ""} found
              </p>
            )}

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
                          {searchable && query.trim()
                            ? highlightText(tx.category, query)
                            : tx.category}
                        </h4>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {searchable && query.trim()
                          ? highlightText(
                              tx.description ||
                                getWalletName(tx.walletId, wallets),
                              query,
                            )
                          : tx.description ||
                            getWalletName(tx.walletId, wallets)}{" "}
                        • {tx.date} {tx.time || "00:00"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        Wallet: {getWalletName(tx.walletId, wallets)}
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

            {maxItems && filteredTransactions.length > maxItems && (
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
                    Show All ({filteredTransactions.length}){" "}
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
