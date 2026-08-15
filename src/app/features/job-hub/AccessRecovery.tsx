import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { ArrowLeft, ShieldCheck, Mail, KeyRound, Lock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, parseApiError } from "../../shared/api/client";

/**
 * Recruiter Access Recovery
 * Real forgot-password flow backed by the API:
 *   1. Enter the registered email -> backend emails a 6-digit code (if the email matches).
 *   2. Enter the code -> backend verifies it and returns a short-lived reset token.
 *   3. Choose a new password -> backend consumes the reset token and updates the password.
 */

interface AccessRecoveryProps {
  onBack: () => void;
}

const RESEND_COOLDOWN_SECONDS = 30;

export function AccessRecovery({ onBack }: AccessRecoveryProps) {
  // Tracks which step of recovery process user is on
  // 1: email, 2: verification code, 3: new password, 4: success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // ── Step 1: request a code for the given email ──────────────────────────
  const handleSendCode = async () => {
    setEmailError("");
    if (!email) {
      setEmailError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiFetch("/api/jobs/recruiters/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }
      toast.success("If that email is registered, a verification code is on its way.");
      setStep(2);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      console.error("Forgot password request failed:", error);
      toast.error(error instanceof Error ? error.message : "Unable to send code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step 2: verify the 6-digit code ──────────────────────────────────────
  const handleVerifyCode = async () => {
    setCodeError("");
    if (!/^\d{6}$/.test(code)) {
      setCodeError("Enter the 6-digit code from your email.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiFetch("/api/jobs/recruiters/verify-reset-code", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase(), code }),
      });
      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }
      const data = await response.json();
      setResetToken(data.resetToken);
      setStep(3);
    } catch (error) {
      console.error("Code verification failed:", error);
      setCodeError(error instanceof Error ? error.message : "Invalid or expired code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = () => {
    if (resendCooldown > 0 || isSubmitting) return;
    setCode("");
    handleSendCode();
  };

  // ── Step 3: set the new password ─────────────────────────────────────────
  const handleResetPassword = async () => {
    setPasswordError("");
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiFetch("/api/jobs/recruiters/reset-password", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          resetToken,
          newPassword,
        }),
      });
      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }
      setStep(4);
    } catch (error) {
      console.error("Password reset failed:", error);
      setPasswordError(
        error instanceof Error ? error.message : "Unable to reset password. Please restart the process.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step 4: success screen ────────────────────────────────────────────────
  if (step === 4) {
    return (
      <div className="max-w-md mx-auto pt-20 px-4">
        <Card className="border-primary/20 shadow-xl">
          <CardContent className="p-10 flex flex-col items-center gap-4 text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center">
              <CheckCircle className="text-green-600 size-8" />
            </div>
            <h2 className="text-xl font-bold">Password Updated</h2>
            <p className="text-sm text-muted-foreground">
              Your password has been reset successfully. You can now log in with your new password.
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
        onClick={step === 1 ? onBack : () => setStep((s) => (s === 3 ? 2 : 1))}
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
          <CardDescription>
            {step === 1 && "Enter your registered email to receive a verification code"}
            {step === 2 && "Enter the 6-digit code we sent to your email"}
            {step === 3 && "Choose a new password for your account"}
          </CardDescription>
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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                  />
                </div>
                {emailError && <p className="text-xs text-destructive">{emailError}</p>}
              </div>
              <Button className="w-full" onClick={handleSendCode} disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Verification Code"}
              </Button>
            </div>
          )}

          {/* ── Step 2: Verification code ── */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
              <div className="p-3 bg-muted rounded-lg flex items-center gap-3 border">
                <Mail className="size-5 text-primary flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-bold">Check your inbox</p>
                  <p className="text-muted-foreground">
                    We sent a code to <span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>6-Digit Verification Code</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    className="pl-10 tracking-[0.5em] font-mono text-center"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                      setCodeError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()}
                  />
                </div>
                {codeError && <p className="text-xs text-destructive">{codeError}</p>}
              </div>

              <Button className="w-full" onClick={handleVerifyCode} disabled={isSubmitting}>
                {isSubmitting ? "Verifying..." : "Verify Code"}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-xs text-muted-foreground"
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || isSubmitting}
              >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Didn't get it? Resend code"}
              </Button>
            </div>
          )}

          {/* ── Step 3: New password ── */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
              <div className="space-y-2">
                <Label>New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="At least 8 characters"
                    className="pl-10"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError("");
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Re-enter password"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                  />
                </div>
                {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
              </div>

              <Button className="w-full" onClick={handleResetPassword} disabled={isSubmitting}>
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
