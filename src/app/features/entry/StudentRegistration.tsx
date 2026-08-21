import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../auth/AuthContext";
import { redeemPendingGroupInvite } from "../../shared/invites/pendingInvite";
import { Button } from "../../shared/ui/button";
import { apiFetch, parseApiError } from "../../shared/api/client";
import { CheckCircle } from "lucide-react";

//Multi-step student registration process
export default function StudentRegistration() {
  const navigate = useNavigate();
  const auth = useAuth();
  const degrees = [
    "Engineering",
    "IT & Computing",
    "Medicine & Health Sciences",
    "Management & Business",
    "Architecture & Design",
    "Natural & Physical Sciences",
    "Social Sciences & Humanities",
    "Education & Teaching",
    "Agriculture & Veterinary",
  ];

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    degree: "",
    email: "",
    username: "",
    password: "",
  });

  //validation and UI feedback states
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // WORK EMAIL VERIFICATION STATE
  // Students must verify ownership of their email (6-digit code) before the account
  // can be created. Mirrors the recruiter signup flow in job-hub/JobRegistration.tsx.
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [emailVerificationToken, setEmailVerificationToken] = useState("");
  const [isSendingEmailCode, setIsSendingEmailCode] = useState(false);
  const [isVerifyingEmailCode, setIsVerifyingEmailCode] = useState(false);
  const [showEmailCodeInput, setShowEmailCodeInput] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [emailCodeError, setEmailCodeError] = useState("");
  const [emailResendCooldown, setEmailResendCooldown] = useState(0);

  useEffect(() => {
    if (formData.email.trim().toLowerCase() !== verifiedEmail) {
      setEmailVerified(false);
      setEmailVerificationToken("");
    }
  }, [formData.email, verifiedEmail]);

  useEffect(() => {
    if (emailResendCooldown <= 0) return;
    const timer = setInterval(
      () => setEmailResendCooldown((s) => Math.max(0, s - 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, [emailResendCooldown]);

  const handleSendEmailCode = async () => {
    const normalizedEmail = formData.email.trim().toLowerCase();
    if (!normalizedEmail.includes("@")) {
      toast.error("Please enter a valid email address first.");
      return;
    }
    setIsSendingEmailCode(true);
    try {
      const response = await apiFetch("/api/auth/email/send-code", {
        method: "POST",
        body: JSON.stringify({ email: normalizedEmail }),
      });
      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }
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
    const normalizedEmail = formData.email.trim().toLowerCase();
    setIsVerifyingEmailCode(true);
    try {
      const response = await apiFetch("/api/auth/email/verify-code", {
        method: "POST",
        body: JSON.stringify({ email: normalizedEmail, code: emailCode }),
      });
      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }
      const data = await response.json();
      setEmailVerificationToken(data.verificationToken);
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

  //Generic input changes Handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "confirmPassword") {
      setConfirmPassword(value);
      if (passwordError && value === formData.password) setPasswordError("");
    } else {
      setFormData({ ...formData, [name]: value });
      if (name === "password" && confirmPassword && value === confirmPassword) {
        setPasswordError("");
      }
    }

    if (submitError) setSubmitError("");
  };

  //step transition handler
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  //final form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    //final client-side validation
    if (formData.password !== confirmPassword) {
      setPasswordError("Passwords do not match. Please enter the same password twice.");
      return;
    }
    if (!emailVerified || formData.email.trim().toLowerCase() !== verifiedEmail) {
      setSubmitError("Please verify your email before submitting.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const registeredUser = await auth.register({ ...formData, emailVerificationToken });
      toast.success("Registration successful");

      // If they arrived here via a group invite link, finish that join now.
      const { group, error: inviteError } = await redeemPendingGroupInvite(registeredUser.id);
      if (group) {
        toast.success(`Joined ${group.name}`);
        navigate("/habits");
        return;
      }
      if (inviteError) {
        toast.error(inviteError);
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      setSubmitError(error instanceof Error ? error.message : "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted px-4">
      {/* Navigation Control: Toggles between form steps or returns to landing */}
      <button
        onClick={() => (step === 2 ? setStep(1) : navigate("/"))}
        className="absolute top-8 left-8 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-sm font-medium"
      >
        {step === 2 ? "Previous Step" : "Back"}
      </button>

      {/*Visual indicators for current registration step*/}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Create Profile</h2>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className={`h-2 w-12 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
            <div className={`h-2 w-12 rounded-full transition-colors ${step === 2 ? "bg-primary" : "bg-muted"}`} />
          </div>
          <p className="text-muted-foreground mt-4 font-medium">
            {step === 1 ? "Basic Information" : "Account Security"}
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-xl border border-border p-8 sm:p-10">
          {/*Profile Information Step*/}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground ml-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-border bg-background text-foreground rounded-xl px-4 py-3 focus:ring-4 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground/70"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground ml-1">Select Degree</label>
                <select
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  className="w-full border border-border bg-background text-foreground rounded-xl px-4 py-3 focus:ring-4 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                  required
                >
                  <option value="">Choose your degree</option>
                  {degrees.map((deg) => (
                    <option key={deg} value={deg}>
                      {deg}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
              >
                Continue
              </Button>
            </form>
          )}

          {/*Account Credentials Step*/}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground ml-1">Email Address</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    name="email"
                    placeholder="name@address.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="flex-1 border border-border bg-background text-foreground rounded-xl px-4 py-3 focus:ring-4 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground/70"
                    required
                  />
                  {emailVerified ? (
                    <div className="px-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-2 text-green-600 font-bold text-xs whitespace-nowrap">
                      <CheckCircle className="size-4" /> Verified
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl font-bold whitespace-nowrap"
                      onClick={handleSendEmailCode}
                      disabled={isSendingEmailCode || !formData.email.includes("@")}
                    >
                      {isSendingEmailCode ? "Sending..." : "Verify"}
                    </Button>
                  )}
                </div>

                {showEmailCodeInput && !emailVerified && (
                  <div className="flex gap-2 items-start pt-1">
                    <div className="flex-1">
                      <input
                        inputMode="numeric"
                        placeholder="000000"
                        maxLength={6}
                        value={emailCode}
                        onChange={(e) => {
                          setEmailCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                          setEmailCodeError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleVerifyEmailCode())}
                        className="w-full border border-border bg-background text-foreground rounded-xl px-4 py-2.5 font-mono text-center tracking-[0.4em] focus:ring-4 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                      />
                      {emailCodeError && <p className="text-xs text-destructive mt-1 ml-1">{emailCodeError}</p>}
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:text-primary mt-1 ml-1 font-semibold disabled:opacity-50"
                        onClick={handleSendEmailCode}
                        disabled={emailResendCooldown > 0 || isSendingEmailCode}
                      >
                        {emailResendCooldown > 0 ? `Resend in ${emailResendCooldown}s` : "Resend code"}
                      </button>
                    </div>
                    <Button type="button" className="rounded-xl" onClick={handleVerifyEmailCode} disabled={isVerifyingEmailCode || emailCode.length !== 6}>
                      {isVerifyingEmailCode ? "Checking..." : "Confirm"}
                    </Button>
                  </div>
                )}
                {!showEmailCodeInput && !emailVerified && (
                  <p className="text-xs text-muted-foreground ml-1">We'll send a 6-digit code to confirm you own this email.</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground ml-1">Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Choose a unique username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full border border-border bg-background text-foreground rounded-xl px-4 py-3 focus:ring-4 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground/70"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground ml-1">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border border-border bg-background text-foreground rounded-xl px-4 py-3 focus:ring-4 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground/70"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground ml-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={handleChange}
                  className="w-full border border-border bg-background text-foreground rounded-xl px-4 py-3 focus:ring-4 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground/70"
                  required
                />
                
                {/*Validation Feedback*/}
                {passwordError && <p className="text-xs text-destructive mt-1">{passwordError}</p>}
                {submitError && <p className="text-xs text-destructive mt-1">{submitError}</p>}
              </div>

              <Button
                type="submit"
                disabled={submitting || !emailVerified}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
              >
                {submitting
                  ? "Creating account..."
                  : emailVerified
                    ? "Complete Registration"
                    : "Verify Your Email to Continue"}
              </Button>
            </form>
          )}

          <p className="text-center mt-8 text-sm text-muted-foreground">
            Already have an account?{" "}
            <span className="text-primary font-bold cursor-pointer hover:underline" onClick={() => navigate("/signin")}>
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
