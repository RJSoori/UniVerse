import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { SellerAccessRecovery } from "./SellerAccessRecovery";
import {
  ShoppingBag, GraduationCap, Lock, UserPlus, Key,
  ArrowLeft, Eye, EyeOff, Store, User, Upload,
  MapPin, FileText, Tag, ShieldCheck, Phone,
} from "lucide-react";

// ── Account storage ───────────────────────────────────────────────────────────
interface SellerAccount {
  password: string;
  sellerType?: string;
  businessName?: string;
  idNumber?: string;
  contactNumber?: string;
  location?: string;
  categoryFocus?: string;
  storeDescription?: string;
}

function getAccounts(): Record<string, SellerAccount> {
  try {
    return JSON.parse(localStorage.getItem("universe-seller-accounts") || "{}");
  } catch { return {}; }
}

function saveAccounts(accounts: Record<string, SellerAccount>) {
  localStorage.setItem("universe-seller-accounts", JSON.stringify(accounts));
}
// ─────────────────────────────────────────────────────────────────────────────

export default function SellerRegister({ onNavigate }: { onNavigate: (id: string) => void }) {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [sellerType, setSellerType] = useState<"shop" | "individual" | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);   // ✅ recovery state

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Register state
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [registerError, setRegisterError] = useState("");

  // Verification state
  const [verifBusinessName, setVerifBusinessName] = useState("");
  const [verifIdNumber, setVerifIdNumber] = useState("");
  const [verifContact, setVerifContact] = useState("");
  const [verifLocation, setVerifLocation] = useState("");
  const [verifCategory, setVerifCategory] = useState("");
  const [verifDescription, setVerifDescription] = useState("");
  const [verifyError, setVerifyError] = useState("");

  // ✅ Show recovery screen
  if (showRecovery) {
    return <SellerAccessRecovery onBack={() => setShowRecovery(false)} />;
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = () => {
    setLoginError("");
    if (!loginEmail || !loginPassword) {
      setLoginError("Please fill in all fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) {
      setLoginError("Please enter a valid email address.");
      return;
    }
    if (loginPassword.length < 8) {
      setLoginError("Password must be at least 8 characters.");
      return;
    }
    const accounts = getAccounts();
    const account = accounts[loginEmail.toLowerCase()];
    if (!account) {
      setLoginError("No seller account found with this email. Please register first.");
      return;
    }
    if (account.password !== loginPassword) {
      setLoginError("Incorrect password. Please try again.");
      return;
    }
    setIsAuthenticated(true);
    setIsRegistered(true);
    setStep(3);
    if (!sellerType) setSellerType("shop");
  };

  // ── Register ───────────────────────────────────────────────────────────────
  const handleRegister = () => {
    setRegisterError("");
    if (!regEmail || !regPassword || !regConfirm) {
      setRegisterError("Please fill in all fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) {
      setRegisterError("Please enter a valid email address.");
      return;
    }
    if (regPassword.length < 8) {
      setRegisterError("Password must be at least 8 characters.");
      return;
    }
    if (regPassword !== regConfirm) {
      setRegisterError("Passwords do not match.");
      return;
    }
    const accounts = getAccounts();
    if (accounts[regEmail.toLowerCase()]) {
      setRegisterError("An account with this email already exists. Please log in.");
      return;
    }
    accounts[regEmail.toLowerCase()] = { password: regPassword };
    saveAccounts(accounts);
    setLoginEmail(regEmail);
    setIsAuthenticated(true);
    setStep(1);
  };

  // ── Verification ───────────────────────────────────────────────────────────
  const handleVerificationSubmit = () => {
    setVerifyError("");
    if (!verifBusinessName || !verifIdNumber || !verifContact || !verifLocation) {
      setVerifyError("Please fill in all required fields.");
      return;
    }
    if (!/^\d{7,15}$/.test(verifContact.replace(/\s/g, ""))) {
      setVerifyError("Please enter a valid contact number.");
      return;
    }
    const accounts = getAccounts();
    const email = regEmail || loginEmail;
    if (accounts[email.toLowerCase()]) {
      accounts[email.toLowerCase()] = {
        ...accounts[email.toLowerCase()],
        sellerType: sellerType ?? undefined,
        businessName: verifBusinessName,
        idNumber: verifIdNumber,
        contactNumber: verifContact,
        location: verifLocation,
        categoryFocus: verifCategory,
        storeDescription: verifDescription,
      };
      saveAccounts(accounts);
    }
    setIsRegistered(true);
    setStep(3);
  };

  // ── Step 3: navigate to dashboard ─────────────────────────────────────────
  if (isAuthenticated && isRegistered && step === 3) {
    onNavigate("seller-dashboard");
    return null;
  }

  // ── Auth screen ────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="size-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
            <GraduationCap className="size-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">UniVerse Seller</h1>
        </div>

        <Card className="w-full max-w-md border-primary/20 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Lock className="text-primary size-6" />
            </div>
            <CardTitle>Seller Portal</CardTitle>
            <CardDescription>Login or register to manage your listings</CardDescription>
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
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => { setLoginPassword(e.target.value); setLoginError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                {loginError && <p className="text-xs text-destructive">{loginError}</p>}
                <Button className="w-full" onClick={handleLogin}>Sign In</Button>
                {/* ✅ Forgot Password link */}
                <Button
                  variant="link"
                  className="w-full text-xs text-muted-foreground hover:text-primary"
                  onClick={() => setShowRecovery(true)}
                >
                  Forgot Password?
                </Button>
              </TabsContent>

              {/* ── Register Tab ── */}
              <TabsContent value="register" className="space-y-4">
                <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
                  We'll collect your store details in the next step.
                </p>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    placeholder="jane@example.com"
                    value={regEmail}
                    onChange={(e) => { setRegEmail(e.target.value); setRegisterError(""); }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={regPassword}
                      onChange={(e) => { setRegPassword(e.target.value); setRegisterError(""); }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input
                    type="password"
                    placeholder="Re-enter your password"
                    value={regConfirm}
                    onChange={(e) => { setRegConfirm(e.target.value); setRegisterError(""); }}
                  />
                </div>
                {registerError && <p className="text-xs text-destructive">{registerError}</p>}
                <Button className="w-full" variant="secondary" onClick={handleRegister}>
                  <UserPlus className="mr-2 size-4" /> Continue
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Button variant="ghost" className="mt-6 text-muted-foreground" onClick={() => onNavigate("signup")}>
          <ArrowLeft className="mr-2 size-4" /> Back to Sign Up Options
        </Button>
      </div>
    );
  }

  // ── Step 1: Seller type selection ──────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-black text-primary">Seller Type</h2>
            <p className="text-muted-foreground text-lg">How would you like to sell on UniVerse?</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card
              className={`group cursor-pointer hover:border-primary transition-all duration-300 border-2 shadow-sm ${sellerType === "shop" ? "border-primary bg-primary/5" : "border-muted"}`}
              onClick={() => setSellerType("shop")}
            >
              <CardContent className="p-8 flex flex-col items-center gap-4">
                <div className={`p-4 rounded-2xl transition-colors ${sellerType === "shop" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"}`}>
                  <Store className="size-12" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold">Shop / Business</h3>
                  <p className="text-sm text-muted-foreground mt-1">Registered stores & campus businesses</p>
                </div>
              </CardContent>
            </Card>
            <Card
              className={`group cursor-pointer hover:border-primary transition-all duration-300 border-2 shadow-sm ${sellerType === "individual" ? "border-primary bg-primary/5" : "border-muted"}`}
              onClick={() => setSellerType("individual")}
            >
              <CardContent className="p-8 flex flex-col items-center gap-4">
                <div className={`p-4 rounded-2xl transition-colors ${sellerType === "individual" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"}`}>
                  <User className="size-12" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold">Individual</h3>
                  <p className="text-sm text-muted-foreground mt-1">Students selling personal items</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1 h-12" onClick={() => setIsAuthenticated(false)}>Cancel</Button>
            <Button className="flex-[2] h-12 font-bold" disabled={!sellerType} onClick={() => setStep(2)}>
              Continue to Verification
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2: Verification ───────────────────────────────────────────────────
  if (step === 2) {
    return (
      <div className="min-h-screen bg-background py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-primary">Seller Verification</h2>
            <p className="text-muted-foreground">Complete your store profile as a {sellerType === "shop" ? "Shop / Business" : "Individual"} seller.</p>
          </div>

          <Card className="border-primary/10 shadow-2xl bg-card/50 backdrop-blur overflow-hidden">
            <CardHeader className="bg-muted/30 border-b p-8">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-primary size-6" />
                <CardTitle className="text-xl">Store Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest opacity-70">
                      {sellerType === "shop" ? "Business Name" : "Full Legal Name"} <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Store className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        className="pl-10 h-11 bg-muted/20 border-none"
                        placeholder={sellerType === "shop" ? "e.g. Campus Books Store" : "Your full name"}
                        value={verifBusinessName}
                        onChange={(e) => { setVerifBusinessName(e.target.value); setVerifyError(""); }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest opacity-70">
                      {sellerType === "shop" ? "BR Number" : "NIC / Student ID"} <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        className="pl-10 h-11 bg-muted/20 border-none"
                        placeholder={sellerType === "shop" ? "e.g. PV-XXXXXX" : "e.g. 200XXXXXXXXX"}
                        value={verifIdNumber}
                        onChange={(e) => { setVerifIdNumber(e.target.value); setVerifyError(""); }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest opacity-70">
                      Contact Number <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        className="pl-10 h-11 bg-muted/20 border-none"
                        placeholder="e.g. 0771234567"
                        value={verifContact}
                        onChange={(e) => { setVerifContact(e.target.value); setVerifyError(""); }}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest opacity-70">
                      Pickup / Location <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        className="pl-10 h-11 bg-muted/20 border-none"
                        placeholder="e.g. Faculty of Engineering, Block A"
                        value={verifLocation}
                        onChange={(e) => { setVerifLocation(e.target.value); setVerifyError(""); }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest opacity-70">Category Focus</Label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        className="pl-10 h-11 bg-muted/20 border-none"
                        placeholder="e.g. Textbooks, Electronics"
                        value={verifCategory}
                        onChange={(e) => setVerifCategory(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest opacity-70">Store Description</Label>
                  <Textarea
                    className="resize-none h-28 bg-muted/20 border-none p-4"
                    placeholder="Describe what you sell and why students should buy from you..."
                    value={verifDescription}
                    onChange={(e) => setVerifDescription(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2 pt-6">
                  <Label className="text-xs font-bold uppercase tracking-widest opacity-70 mb-4 block text-primary">Verification Documents</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/40 transition-all cursor-pointer bg-muted/10 group">
                      <div className="p-3 bg-background rounded-full group-hover:bg-primary/10">
                        <Upload className="size-6 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <span className="text-xs font-bold mt-1">{sellerType === "shop" ? "BR Certificate" : "NIC / Student ID"}</span>
                    </div>
                    {sellerType === "shop" && (
                      <div className="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/40 transition-all cursor-pointer bg-muted/10 group">
                        <div className="p-3 bg-background rounded-full group-hover:bg-primary/10">
                          <ShoppingBag className="size-6 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <span className="text-xs font-bold mt-1">Shop Logo</span>
                      </div>
                    )}
                    <div className="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/40 transition-all cursor-pointer bg-muted/10 group">
                      <div className="p-3 bg-background rounded-full group-hover:bg-primary/10">
                        <ShieldCheck className="size-6 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <span className="text-xs font-bold mt-1">Proof of Items</span>
                    </div>
                  </div>
                </div>
              </div>

              {verifyError && <p className="text-xs text-destructive mt-4">{verifyError}</p>}

              <div className="flex flex-col sm:flex-row gap-4 mt-12 pt-8 border-t">
                <Button variant="ghost" className="flex-1 h-12 order-2 sm:order-1" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 size-4" /> Go Back
                </Button>
                <Button
                  className="flex-[2] h-12 font-black uppercase text-sm tracking-widest order-1 sm:order-2 shadow-xl shadow-primary/20"
                  onClick={handleVerificationSubmit}
                >
                  Submit & Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
