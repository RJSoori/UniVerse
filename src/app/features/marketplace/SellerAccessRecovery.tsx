import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { ArrowLeft, ShieldCheck, Mail, Store, User, CheckCircle } from "lucide-react";
import { readJsonFromLocalStorage } from "../../shared/storage/localStorageJson";

interface SellerAccessRecoveryProps {
  onBack: () => void;
}

function getAccounts(): Record<string, { password: string; sellerType?: string; businessName?: string; idNumber?: string }> {
  return readJsonFromLocalStorage<Record<string, { password: string; sellerType?: string; businessName?: string; idNumber?: string }>>("universe-seller-accounts", {});
}

export function SellerAccessRecovery({ onBack }: SellerAccessRecoveryProps) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [sellerType, setSellerType] = useState<string | null>(null);
  const [idNumber, setIdNumber] = useState("");
  const [idError, setIdError] = useState("");
  const [recovered, setRecovered] = useState(false);

  // ── Step 1: Check email exists ─────────────────────────────────────────────
  const handleCheckEmail = () => {
    setEmailError("");
    if (!email) {
      setEmailError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    const accounts = getAccounts();
    const account = accounts[email.toLowerCase()];
    if (!account) {
      setEmailError("No seller account found with this email.");
      return;
    }
    // Determine seller type from saved account
    setSellerType(account.sellerType || "individual");
    setStep(2);
  };

  // ── Step 2: Verify ID number ───────────────────────────────────────────────
  const handleVerify = () => {
    setIdError("");
    if (!idNumber || idNumber.trim().length < 5) {
      setIdError(`Please enter a valid ${sellerType === "shop" ? "BR Number" : "NIC / Student ID"}.`);
      return;
    }
    const accounts = getAccounts();
    const account = accounts[email.toLowerCase()];
    // Check the saved ID number matches
    if (account?.idNumber && account.idNumber.toLowerCase() !== idNumber.toLowerCase()) {
      setIdError("The ID number does not match our records.");
      return;
    }
    // ✅ Verified — in a real app this would send a reset email
    setRecovered(true);
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (recovered) {
    return (
      <div className="max-w-md mx-auto pt-20 px-4">
        <Card className="border-primary/20 shadow-xl">
          <CardContent className="p-10 flex flex-col items-center gap-4 text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center">
              <CheckCircle className="text-green-600 size-8" />
            </div>
            <h2 className="text-xl font-bold">Verification Successful</h2>
            <p className="text-sm text-muted-foreground">
              A temporary access link has been sent to <strong>{email}</strong>. Check your inbox to reset your password.
            </p>
            <Button className="w-full mt-2" onClick={onBack}>
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pt-20 px-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={step === 1 ? onBack : () => setStep(1)}
        className="mb-4 text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="mr-2 size-4" />
        {step === 1 ? "Back to Login" : "Back"}
      </Button>

      <Card className="border-primary/20 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="text-primary size-6" />
          </div>
          <CardTitle>Account Recovery</CardTitle>
          <CardDescription>Verify your identity to recover access to your seller account</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">

          {/* ── Step 1: Email ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Registered Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="jane@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleCheckEmail()}
                  />
                </div>
                {emailError && <p className="text-xs text-destructive">{emailError}</p>}
              </div>
              <Button className="w-full" onClick={handleCheckEmail}>
                Identify Account
              </Button>
            </div>
          )}

          {/* ── Step 2: ID verification ── */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
              {/* Account type banner */}
              <div className="p-3 bg-muted rounded-lg flex items-center gap-3 border">
                {sellerType === "shop" ? (
                  <Store className="size-5 text-primary flex-shrink-0" />
                ) : (
                  <User className="size-5 text-primary flex-shrink-0" />
                )}
                <div className="text-sm">
                  <p className="font-bold">Account Type Identified</p>
                  <p className="text-muted-foreground capitalize">
                    {sellerType === "shop" ? "Shop / Business" : "Individual"} Seller
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  {sellerType === "shop" ? "Business Registration (BR) Number" : "NIC / Student ID Number"}
                </Label>
                <Input
                  placeholder={sellerType === "shop" ? "e.g. PV-XXXXXX" : "e.g. 200XXXXXXXXX"}
                  value={idNumber}
                  onChange={(e) => { setIdNumber(e.target.value); setIdError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                />
                {idError && <p className="text-xs text-destructive">{idError}</p>}
              </div>

              <Button className="w-full" onClick={handleVerify}>
                Verify & Recover Access
              </Button>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
