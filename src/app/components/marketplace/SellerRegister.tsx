import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ShoppingBag, UserPlus, Key, Loader2 } from "lucide-react";

interface SellerAccount {
  fullName: string;
  storeName: string;
  storeDescription: string;
  password: string;
}

function getAccounts(): Record<string, SellerAccount> {
  try {
    return JSON.parse(localStorage.getItem("universe-seller-accounts") || "{}");
  } catch {
    return {};
  }
}

function saveAccounts(accounts: Record<string, SellerAccount>) {
  localStorage.setItem("universe-seller-accounts", JSON.stringify(accounts));
}

export default function SellerRegister({ onNavigate }: { onNavigate: (id: string) => void }) {
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  const handleLogin = () => {
    setLoginError("");

    // 1. Empty field check
    if (!loginEmail || !loginPassword) {
      setLoginError("Please fill in all fields.");
      return;
    }

    // 2. Email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) {
      setLoginError("Please enter a valid email address.");
      return;
    }

    // 3. Password length check
    if (loginPassword.length < 8) {
      setLoginError("Password must be at least 8 characters.");
      return;
    }

    // 4. Check account exists
    const accounts = getAccounts();
    const account = accounts[loginEmail.toLowerCase()];
    if (!account) {
      setLoginError("No seller account found with this email. Please register first.");
      return;
    }

    // 5. Check password matches
    if (account.password !== loginPassword) {
      setLoginError("Incorrect password. Please try again.");
      return;
    }

    // ✅ All checks passed — now navigate
    setLoginLoading(true);
    setTimeout(() => onNavigate("seller-dashboard"), 100);
  };

  const handleRegister = () => {
    setRegisterError("");

    // 1. Empty field check
    if (!fullName || !email || !password || !confirmPassword || !storeName || !storeDescription) {
      setRegisterError("Please fill in all fields.");
      return;
    }

    // 2. Email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setRegisterError("Please enter a valid email address.");
      return;
    }

    // 3. Password length check
    if (password.length < 8) {
      setRegisterError("Password must be at least 8 characters.");
      return;
    }

    // 4. Password match check
    if (password !== confirmPassword) {
      setRegisterError("Passwords do not match.");
      return;
    }

    // 5. Duplicate account check
    const accounts = getAccounts();
    if (accounts[email.toLowerCase()]) {
      setRegisterError("An account with this email already exists. Please log in.");
      return;
    }

    // ✅ All checks passed — save account and navigate
    accounts[email.toLowerCase()] = { fullName, storeName, storeDescription, password };
    saveAccounts(accounts);

    setRegisterLoading(true);
    setTimeout(() => onNavigate("seller-dashboard"), 100);
  };

  return (
    <div className="max-w-md mx-auto pt-20">
      <Card className="border-primary/20 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <ShoppingBag className="text-primary size-6" />
          </div>
          <CardTitle>Seller Portal</CardTitle>
          <CardDescription>List and manage your products on UniVerse</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <Key className="size-3" /> Login
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center gap-2">
                <UserPlus className="size-3" /> Register
              </TabsTrigger>
            </TabsList>

            {/* ── Login Tab ── */}
            <TabsContent value="login" className="space-y-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="jane@example.com"
                  value={loginEmail}
                  onChange={(e) => { setLoginEmail(e.target.value); setLoginError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => { setLoginPassword(e.target.value); setLoginError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
              {loginError && (
                <p className="text-xs text-destructive">{loginError}</p>
              )}
              <Button className="w-full" onClick={handleLogin} disabled={loginLoading}>
                {loginLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Access Account
              </Button>
              <Button
                variant="link"
                className="w-full text-xs text-muted-foreground hover:text-primary"
                onClick={() => onNavigate("signup")}
              >
                ← Back to Sign Up
              </Button>
            </TabsContent>

            {/* ── Register Tab ── */}
            <TabsContent value="register" className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  type="text"
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setRegisterError(""); }}
                />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setRegisterError(""); }}
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setRegisterError(""); }}
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setRegisterError(""); }}
                />
              </div>
              <div className="space-y-2">
                <Label>Store / Shop Name</Label>
                <Input
                  type="text"
                  placeholder="e.g. Jane's Handmade Crafts"
                  value={storeName}
                  onChange={(e) => { setStoreName(e.target.value); setRegisterError(""); }}
                />
              </div>
              <div className="space-y-2">
                <Label>Store Description</Label>
                <Input
                  type="text"
                  placeholder="Briefly describe what you plan to sell..."
                  value={storeDescription}
                  onChange={(e) => { setStoreDescription(e.target.value); setRegisterError(""); }}
                />
              </div>
              {registerError && (
                <p className="text-xs text-destructive">{registerError}</p>
              )}
              <Button className="w-full" variant="secondary" onClick={handleRegister} disabled={registerLoading}>
                {registerLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <UserPlus className="mr-2 size-4" />}
                Create Seller Account
              </Button>
              <Button
                variant="link"
                className="w-full text-xs text-muted-foreground hover:text-primary"
                onClick={() => onNavigate("signup")}
              >
                ← Back to Sign Up
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
