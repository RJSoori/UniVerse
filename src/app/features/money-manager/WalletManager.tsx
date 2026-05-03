import { useState } from "react";
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
import { Switch } from "../../shared/ui/switch";
import { AlertCircle, Plus, Trash2, Edit2, Wallet } from "lucide-react";
import { useMoneyManager } from "./hooks/useMoneyManager";
import { Wallet as WalletType } from "./types";
import { formatCurrencyLabel, formatCurrency } from "./utils/currency";

export function WalletManager() {
  const {
    wallets,
    createWallet,
    deleteWallet,
    updateWalletBalance,
    updateWallet,
    getIncludedWalletBalance,
  } = useMoneyManager();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    balance: "",
    type: "cash" as WalletType["type"],
    includeInTotal: true,
  });
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");

  const handleCreate = () => {
    setCreateErrors({});
    setGeneralError("");
    const result = createWallet(
      formData.name,
      Number(formData.balance),
      formData.type,
      formData.includeInTotal,
    );
    if (!result.ok) {
      setCreateErrors(result.errors);
      return;
    }

    setFormData({
      name: "",
      balance: "",
      type: "cash",
      includeInTotal: true,
    });
    setIsOpen(false);
  };

  const handleUpdateBalance = (walletId: string) => {
    setEditErrors({});
    const result = updateWalletBalance(walletId, Number(editBalance));
    if (!result.ok) {
      setEditErrors(result.errors);
      return;
    }
    setEditingId(null);
    setEditBalance("");
  };

  const walletTypeIcons: Record<WalletType["type"], string> = {
    cash: "💵",
    debit: "💳",
    credit: "💳",
    savings: "🏦",
    digital: "📱",
  };

  const totalBalance = getIncludedWalletBalance();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Wallets</h3>
          <p className="text-sm text-muted-foreground">
            Manage your payment methods
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Wallet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Wallet</DialogTitle>
              <DialogDescription>
                Add a new payment method to track
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Wallet Name</Label>
                <Input
                  placeholder="e.g., My Debit Card"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={createErrors.name ? "border-red-500" : ""}
                />
                {createErrors.name && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {createErrors.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>{formatCurrencyLabel()}</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.balance}
                  onChange={(e) =>
                    setFormData({ ...formData, balance: e.target.value })
                  }
                  className={createErrors.balance ? "border-red-500" : ""}
                />
                {createErrors.balance && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {createErrors.balance}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <select
                  className="w-full p-2 border rounded-md bg-background text-sm"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as WalletType["type"],
                    })
                  }
                >
                  <option value="cash">Cash</option>
                  <option value="debit">Debit Card</option>
                  <option value="credit">Credit Card</option>
                  <option value="savings">Savings Account</option>
                  <option value="digital">Digital Wallet</option>
                </select>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label>Include in total balance</Label>
                  <p className="text-xs text-muted-foreground">
                    Wallet totals will be included in the main balance.
                  </p>
                </div>
                <Switch
                  checked={formData.includeInTotal}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, includeInTotal: checked })
                  }
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                Create Wallet
              </Button>
              {generalError && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {generalError}
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Total Balance Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Balance</p>
              <p className="text-3xl font-bold mt-1">
                {formatCurrency(totalBalance)}
              </p>
            </div>
            <Wallet className="h-8 w-8 text-primary/40" />
          </div>
        </CardContent>
      </Card>

      {/* Wallets Grid */}
      {wallets.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                No wallets yet. Create one to get started!
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wallets.map((wallet: WalletType) => (
            <Card key={wallet.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 flex flex-row items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {walletTypeIcons[wallet.type]}
                  </span>
                  <div>
                    <CardTitle className="text-base">{wallet.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {wallet.type}
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setGeneralError("");
                    const result = deleteWallet(wallet.id);
                    if (!result.ok) {
                      setGeneralError(result.errors.general || "Unable to delete wallet.");
                    }
                  }}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {editingId === wallet.id ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="New balance"
                        value={editBalance}
                        onChange={(e) => setEditBalance(e.target.value)}
                        className={`text-sm ${editErrors.balance ? "border-red-500" : ""}`}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleUpdateBalance(wallet.id)}
                      >
                        Save
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setEditingId(null);
                        setEditBalance("");
                      }}
                    >
                      Cancel
                    </Button>
                    {editErrors.balance && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {editErrors.balance}
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          Balance
                        </p>
                        <p className="text-2xl font-bold">
                          LKR {wallet.balance.toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingId(wallet.id);
                          setEditBalance(wallet.balance.toString());
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-col gap-3 pt-2 border-t">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Include in total balance</span>
                        <Switch
                          checked={wallet.includeInTotal}
                          onCheckedChange={(checked) =>
                            updateWallet(wallet.id, { includeInTotal: checked })
                          }
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Created{" "}
                        {new Date(wallet.createdDate).toLocaleDateString()}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {generalError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {generalError}
          </p>
        </div>
      )}
    </div>
  );
}
