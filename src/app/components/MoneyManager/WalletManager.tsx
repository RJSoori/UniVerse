import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Plus, Trash2, Edit2, Wallet } from "lucide-react";
import { useMoneyManager } from "../../hooks/useMoneyManager";
import { Wallet as WalletType } from "./types";

export function WalletManager() {
  const { wallets, createWallet, deleteWallet, updateWalletBalance } =
    useMoneyManager();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    balance: "",
    type: "cash" as WalletType["type"],
  });

  const handleCreate = () => {
    if (formData.name && formData.balance) {
      createWallet(formData.name, parseFloat(formData.balance), formData.type);
      setFormData({ name: "", balance: "", type: "cash" });
      setIsOpen(false);
    }
  };

  const handleUpdateBalance = (walletId: string) => {
    if (editBalance) {
      updateWalletBalance(walletId, parseFloat(editBalance));
      setEditingId(null);
      setEditBalance("");
    }
  };

  const walletTypeIcons: Record<WalletType["type"], string> = {
    cash: "💵",
    debit: "💳",
    credit: "💳",
    savings: "🏦",
    digital: "📱",
  };

  const totalBalance = wallets.reduce(
    (sum: number, w: WalletType) => sum + w.balance,
    0,
  );

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
                />
              </div>
              <div className="space-y-2">
                <Label>Initial Balance (LKR)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.balance}
                  onChange={(e) =>
                    setFormData({ ...formData, balance: e.target.value })
                  }
                />
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
              <Button onClick={handleCreate} className="w-full">
                Create Wallet
              </Button>
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
                LKR {totalBalance.toLocaleString()}
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
                  onClick={() => deleteWallet(wallet.id)}
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
                        className="text-sm"
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
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Created{" "}
                      {new Date(wallet.createdDate).toLocaleDateString()}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
