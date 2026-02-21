import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ShoppingBag, CheckCircle, UserPlus, Key } from "lucide-react";

export default function SellerRegister({ onNavigate }: { onNavigate: (id: string) => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Register state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [registerError, setRegisterError] = useState("");

  const handleLogin = () => {
    if (!loginEmail || !loginPassword) {
      setLoginError("Please fill in all fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) {
      setLoginError("Please enter a valid email address.");
      return;
    }
    // Placeholder: connect to backend here
    console.log("Seller login:", { loginEmail, loginPassword });
    setIsAuthenticated(true);
  };

  const handleRegister = () => {
    if (!fullName || !email || !password || !confirmPassword || !storeName || !storeDescription) {
      setRegisterError("Please fill in all fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setRegisterError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setRegisterError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setRegisterError("Passwords do not match.");
      return;
    }
    // Placeholder: connect to backend here
    console.log("Seller registration:", { fullName, email, password, storeName, storeDescription });
    setIsAuthenticated(true);
  };

  // Success screen after login or register
  if (isAuthenticated) {
    return (
      <div className="max-w-md mx-auto pt-20">
        <Card className="border-primary/20 shadow-xl">
          <CardContent className="p-10 flex flex-col items-center gap-4 text-center">
            <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center">
              <CheckCircle className="text-green-600 size-8" />
            </div>
            <h2 className="text-2xl font-bold">Welcome to UniVerse!</h2>
            <p className="text-muted-foreground text-sm">
              Your seller account is ready. Start listing your products for the campus community.
            </p>
            {/* TODO: Replace with seller dashboard navigation once built */}
            <Button className="w-full mt-2" onClick={() => onNavigate("marketplace")}>
              Go to Marketplace
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

            {/* Login Tab */}
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
              <Button className="w-full" onClick={handleLogin}>
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

            {/* Register Tab */}
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
              <Button className="w-full" variant="secondary" onClick={handleRegister}>
                <UserPlus className="mr-2 size-4" /> Create Seller Account
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
