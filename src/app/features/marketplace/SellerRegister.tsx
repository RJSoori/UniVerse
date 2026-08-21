import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../shared/ui/tabs";
import { Textarea } from "../../shared/ui/textarea";
import { SellerAccessRecovery } from "./SellerAccessRecovery";
import {
  ShoppingBag, GraduationCap, Lock, UserPlus, Key,
  ArrowLeft, Eye, EyeOff, Store, User, Upload,
  MapPin, FileText, Tag, ShieldCheck, Phone, CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  registerSellerAuth,
  loginSellerAuth,
  setSellerToken,
  setSellerData,
  sendSellerEmailCode,
  verifySellerEmailCode,
} from "./marketplaceApi";

/**
 * Seller registration and authentication component
 * Handles: seller login, new account creation, seller type selection,
 * business verification, and session management
 */
export default function SellerRegister() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Deep-links here can request the Register tab open by default (?mode=register) —
  // otherwise Login is the default, e.g. for a returning seller.
  const [authTab, setAuthTab] = useState(searchParams.get("mode") === "register" ? "register" : "login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [sellerType, setSellerType] = useState<"shop" | "individual" | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manages seller login form data and validation
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Manages seller registration form data for new account creation
  const [regEmail, setRegEmail] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [registerError, setRegisterError] = useState("");

  // WORK EMAIL VERIFICATION STATE
  // Sellers must verify ownership of their email (6-digit code) before the account can be
  // created. Mirrors the recruiter signup flow in job-hub/JobRegistration.tsx.
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [emailVerificationToken, setEmailVerificationToken] = useState("");
  const [isSendingEmailCode, setIsSendingEmailCode] = useState(false);
  const [isVerifyingEmailCode, setIsVerifyingEmailCode] = useState(false);
  const [showEmailCodeInput, setShowEmailCodeInput] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [emailCodeError, setEmailCodeError] = useState("");
  const [emailResendCooldown, setEmailResendCooldown] = useState(0);

  // Manages business verification form data for store details submission
  const [verifBusinessName, setVerifBusinessName] = useState("");
  const [verifIdNumber, setVerifIdNumber] = useState("");
  const [verifContact, setVerifContact] = useState("");
  const [verifLocation, setVerifLocation] = useState("");
  const [verifCategory, setVerifCategory] = useState("");
  const [verifDescription, setVerifDescription] = useState("");
  const [verifyError, setVerifyError] = useState("");

  // Verification documents (optional uploads, stored in Azure Blob Storage on submit)
  const [identityDocument, setIdentityDocument] = useState<File | null>(null);
  const [shopLogo, setShopLogo] = useState<File | null>(null);
  const [proofOfItems, setProofOfItems] = useState<File | null>(null);

  // Automatically redirects to dashboard after completion
  const shouldRedirectToDashboard = isAuthenticated && isRegistered && step === 3;

  useEffect(() => {
    if (shouldRedirectToDashboard) {
      navigate("/seller/dashboard");
    }
  }, [navigate, shouldRedirectToDashboard]);

  // Any edit to the email after verification invalidates it - the verified token is only
  // valid for the exact address it was issued for.
  useEffect(() => {
    if (regEmail.trim().toLowerCase() !== verifiedEmail) {
      setEmailVerified(false);
      setEmailVerificationToken("");
    }
  }, [regEmail, verifiedEmail]);

  useEffect(() => {
    if (emailResendCooldown <= 0) return;
    const timer = setInterval(
      () => setEmailResendCooldown((s) => Math.max(0, s - 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, [emailResendCooldown]);

  const handleSendEmailCode = async () => {
    const normalizedEmail = regEmail.trim().toLowerCase();
    if (!normalizedEmail.includes("@")) {
      toast.error("Please enter a valid email first.");
      return;
    }
    setIsSendingEmailCode(true);
    try {
      await sendSellerEmailCode(normalizedEmail);
      toast.success("Verification code sent to your email.");
      setShowEmailCodeInput(true);
      setEmailCode("");
      setEmailCodeError("");
      setEmailResendCooldown(30);
    } catch (error) {
      console.error("Failed to send email verification code:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to send code. Please try again.",
      );
    } finally {
      setIsSendingEmailCode(false);
    }
  };

  const handleVerifyEmailCode = async () => {
    setEmailCodeError("");
    if (!/^\d{6}$/.test(emailCode)) {
      setEmailCodeError("Enter the 6-digit code from your email.");
      return;
    }
    const normalizedEmail = regEmail.trim().toLowerCase();
    setIsVerifyingEmailCode(true);
    try {
      const token = await verifySellerEmailCode(normalizedEmail, emailCode);
      setEmailVerificationToken(token);
      setVerifiedEmail(normalizedEmail);
      setEmailVerified(true);
      setShowEmailCodeInput(false);
      toast.success("Email verified!");
    } catch (error) {
      console.error("Email code verification failed:", error);
      setEmailCodeError(
        error instanceof Error ? error.message : "Invalid or expired code.",
      );
    } finally {
      setIsVerifyingEmailCode(false);
    }
  };

  // Displays account recovery interface for password reset
  if (showRecovery) {
    return <SellerAccessRecovery onBack={() => setShowRecovery(false)} />;
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    setLoginError("");
    if (!loginUsername || !loginPassword) {
      setLoginError("Please fill in all fields.");
      return;
    }
    if (loginPassword.length < 8) {
      setLoginError("Password must be at least 8 characters.");
      return;
    }
    setIsSubmitting(true);
    try {
      const auth = await loginSellerAuth({
          username: loginUsername,
          password: loginPassword,
     });
      setSellerToken(auth.token);
      setSellerData(auth.seller);
      localStorage.setItem("universe-active-seller", auth.seller.email.toLowerCase());
      setIsAuthenticated(true);
      setIsRegistered(true);
      setStep(3);
      if (!sellerType) setSellerType("shop");
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : "Invalid username or password. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Register ───────────────────────────────────────────────────────────────
  const handleRegister = () => {
    setRegisterError("");
    if (!regEmail || !regUsername || !regPassword || !regConfirm) {
      setRegisterError("Please fill in all fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) {
      setRegisterError("Please enter a valid email address.");
      return;
    }
    if (regUsername.length < 3) {
      setRegisterError("Username must be at least 3 characters.");
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
    if (!emailVerified || regEmail.trim().toLowerCase() !== verifiedEmail) {
      setRegisterError("Please verify your email before continuing.");
      return;
    }
    setIsAuthenticated(true);
    setStep(1);
  };

  // ── Verification ───────────────────────────────────────────────────────────
  const handleVerificationSubmit = async () => {
    setVerifyError("");
    if (!verifBusinessName || !verifIdNumber || !verifContact || !verifLocation) {
      setVerifyError("Please fill in all required fields.");
      return;
    }
    if (!/^\d{7,15}$/.test(verifContact.replace(/\s/g, ""))) {
      setVerifyError("Please enter a valid contact number.");
      return;
    }
    if (!identityDocument) {
      setVerifyError(`Please upload your ${sellerType === "shop" ? "BR Certificate" : "NIC / Student ID"}.`);
      return;
    }
    if (sellerType === "shop" && !shopLogo) {
      setVerifyError("Please upload your shop logo.");
      return;
    }
    if (!proofOfItems) {
      setVerifyError("Please upload proof of items.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("storeName", verifBusinessName);
      formData.append("email", regEmail);
      formData.append("username", regUsername);
      formData.append("password", regPassword);
      formData.append("phone", verifContact);
      formData.append("description", verifDescription);
      formData.append("emailVerificationToken", emailVerificationToken);
      if (identityDocument) formData.append("identityDocument", identityDocument);
      if (sellerType === "shop" && shopLogo) formData.append("shopLogo", shopLogo);
      if (proofOfItems) formData.append("proofOfItems", proofOfItems);

      const auth = await registerSellerAuth(formData);

      // ✅ Store seller token and data
      setSellerToken(auth.token);
      setSellerData(auth.seller);
      localStorage.setItem("universe-active-seller", auth.seller.email.toLowerCase());

      setIsRegistered(true);
      setStep(3);
    } catch (error) {
      setVerifyError(error instanceof Error ? error.message : "Failed to create seller account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (shouldRedirectToDashboard) {
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
            <Tabs value={authTab} onValueChange={setAuthTab} className="w-full">
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
                  <Label>Username</Label>
                  <Input
                    type="text"
                    placeholder="Your username"
                    value={loginUsername}
                    onChange={(e) => { setLoginUsername(e.target.value); setLoginError(""); }}
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
                <Button className="w-full" onClick={handleLogin} disabled={isSubmitting}>
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
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
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="jane@example.com"
                      className="flex-1"
                      value={regEmail}
                      onChange={(e) => { setRegEmail(e.target.value); setRegisterError(""); }}
                    />
                    {emailVerified ? (
                      <div className="px-3 rounded-md bg-green-500/10 border border-green-500/30 flex items-center gap-2 text-green-600 font-bold text-xs whitespace-nowrap">
                        <CheckCircle className="size-4" /> Verified
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="whitespace-nowrap"
                        onClick={handleSendEmailCode}
                        disabled={isSendingEmailCode || !regEmail.includes("@")}
                      >
                        {isSendingEmailCode ? "Sending..." : "Verify"}
                      </Button>
                    )}
                  </div>

                  {showEmailCodeInput && !emailVerified && (
                    <div className="flex gap-2 items-start pt-1">
                      <div className="flex-1">
                        <Input
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="000000"
                          className="font-mono tracking-[0.4em] text-center"
                          value={emailCode}
                          onChange={(e) => {
                            setEmailCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                            setEmailCodeError("");
                          }}
                          onKeyDown={(e) => e.key === "Enter" && handleVerifyEmailCode()}
                        />
                        {emailCodeError && <p className="text-xs text-destructive mt-1">{emailCodeError}</p>}
                        <button
                          type="button"
                          className="text-xs text-muted-foreground hover:text-primary mt-1 font-semibold disabled:opacity-50"
                          onClick={handleSendEmailCode}
                          disabled={emailResendCooldown > 0 || isSendingEmailCode}
                        >
                          {emailResendCooldown > 0 ? `Resend in ${emailResendCooldown}s` : "Resend code"}
                        </button>
                      </div>
                      <Button type="button" onClick={handleVerifyEmailCode} disabled={isVerifyingEmailCode || emailCode.length !== 6}>
                        {isVerifyingEmailCode ? "Checking..." : "Confirm"}
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    type="text"
                    placeholder="Choose a username"
                    value={regUsername}
                    onChange={(e) => { setRegUsername(e.target.value); setRegisterError(""); }}
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
                <Button className="w-full" variant="secondary" onClick={handleRegister} disabled={!emailVerified}>
                  <UserPlus className="mr-2 size-4" /> {emailVerified ? "Continue" : "Verify Your Email to Continue"}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Button variant="ghost" className="mt-6 text-muted-foreground" onClick={() => navigate("/signup")}>
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
                        type="tel"
                        inputMode="numeric"
                        value={verifContact}
                        onChange={(e) => { setVerifContact(e.target.value.replace(/\D/g, "")); setVerifyError(""); }}
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
                  <Label className="text-xs font-bold uppercase tracking-widest opacity-70 mb-4 block text-primary">
                    Verification Documents <span className="text-destructive">*</span>
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <label className="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/40 transition-all cursor-pointer bg-muted/10 group text-center">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,application/pdf"
                        className="hidden"
                        onChange={(e) => setIdentityDocument(e.target.files?.[0] || null)}
                      />
                      <div className="p-3 bg-background rounded-full group-hover:bg-primary/10">
                        {identityDocument ? (
                          <CheckCircle className="size-6 text-green-600" />
                        ) : (
                          <Upload className="size-6 text-muted-foreground group-hover:text-primary" />
                        )}
                      </div>
                      <span className="text-xs font-bold mt-1">{sellerType === "shop" ? "BR Certificate" : "NIC / Student ID"}</span>
                      {identityDocument && <span className="text-[10px] text-muted-foreground truncate max-w-full">{identityDocument.name}</span>}
                    </label>
                    {sellerType === "shop" && (
                      <label className="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/40 transition-all cursor-pointer bg-muted/10 group text-center">
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) => setShopLogo(e.target.files?.[0] || null)}
                        />
                        <div className="p-3 bg-background rounded-full group-hover:bg-primary/10">
                          {shopLogo ? (
                            <CheckCircle className="size-6 text-green-600" />
                          ) : (
                            <ShoppingBag className="size-6 text-muted-foreground group-hover:text-primary" />
                          )}
                        </div>
                        <span className="text-xs font-bold mt-1">Shop Logo</span>
                        {shopLogo && <span className="text-[10px] text-muted-foreground truncate max-w-full">{shopLogo.name}</span>}
                      </label>
                    )}
                    <label className="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/40 transition-all cursor-pointer bg-muted/10 group text-center">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,application/pdf"
                        className="hidden"
                        onChange={(e) => setProofOfItems(e.target.files?.[0] || null)}
                      />
                      <div className="p-3 bg-background rounded-full group-hover:bg-primary/10">
                        {proofOfItems ? (
                          <CheckCircle className="size-6 text-green-600" />
                        ) : (
                          <ShieldCheck className="size-6 text-muted-foreground group-hover:text-primary" />
                        )}
                      </div>
                      <span className="text-xs font-bold mt-1">Proof of Items</span>
                      {proofOfItems && <span className="text-[10px] text-muted-foreground truncate max-w-full">{proofOfItems.name}</span>}
                    </label>
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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Account..." : "Submit & Go to Dashboard"}
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