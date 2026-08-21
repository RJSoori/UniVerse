import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, CheckCircle, Mail } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { Button } from "../../shared/ui/button";
import { DEGREES } from "../../shared/constants/degrees";
import { apiFetch, parseApiError } from "../../shared/api/client";

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { user } = auth;

  const [name, setName] = useState(user?.name || "");
  const [degree, setDegree] = useState(user?.degree || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // EMAIL CHANGE STATE
  // Verifying ownership of a new email before it's applied mirrors the student
  // registration flow (see StudentRegistration.tsx) via the same send-code/verify-code
  // endpoints, then commits the change through a dedicated PUT /api/auth/me/email call.
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [emailVerificationToken, setEmailVerificationToken] = useState("");
  const [isSendingEmailCode, setIsSendingEmailCode] = useState(false);
  const [isVerifyingEmailCode, setIsVerifyingEmailCode] = useState(false);
  const [showEmailCodeInput, setShowEmailCodeInput] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [emailCodeError, setEmailCodeError] = useState("");
  const [emailResendCooldown, setEmailResendCooldown] = useState(0);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    // Update form fields when user data changes
    setName(user?.name || "");
    setDegree(user?.degree || "");
    setNewEmail(user?.email || "");
  }, [user]);

  useEffect(() => {
    if (newEmail.trim().toLowerCase() !== verifiedEmail) {
      setEmailVerified(false);
      setEmailVerificationToken("");
    }
  }, [newEmail, verifiedEmail]);

  useEffect(() => {
    if (emailResendCooldown <= 0) return;
    const timer = setInterval(
      () => setEmailResendCooldown((s) => Math.max(0, s - 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, [emailResendCooldown]);

  const handleSave = async (e: React.FormEvent) => {
    //Handle profile update with loading state and error handling
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await auth.updateProfile({ name, degree });
      setMessage("Changes saved!");
      window.setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err instanceof Error ? err.message : "Unable to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleSendEmailCode = async () => {
    const normalizedEmail = newEmail.trim().toLowerCase();
    if (!normalizedEmail.includes("@")) {
      setEmailError("Please enter a valid email address first.");
      return;
    }
    if (normalizedEmail === (user?.email || "").toLowerCase()) {
      setEmailError("That's already your current email address.");
      return;
    }
    setEmailError("");
    setIsSendingEmailCode(true);
    try {
      const response = await apiFetch("/api/auth/email/send-code", {
        method: "POST",
        body: JSON.stringify({ email: normalizedEmail }),
      });
      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }
      setShowEmailCodeInput(true);
      setEmailCode("");
      setEmailCodeError("");
      setEmailResendCooldown(30);
    } catch (err) {
      console.error("Failed to send email verification code:", err);
      setEmailError(err instanceof Error ? err.message : "Unable to send code. Please try again.");
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
    const normalizedEmail = newEmail.trim().toLowerCase();
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
    } catch (err) {
      console.error("Email code verification failed:", err);
      setEmailCodeError(err instanceof Error ? err.message : "Invalid or expired code.");
    } finally {
      setIsVerifyingEmailCode(false);
    }
  };

  const handleUpdateEmail = async () => {
    setEmailError("");
    setEmailMessage("");
    if (!emailVerified || newEmail.trim().toLowerCase() !== verifiedEmail) {
      setEmailError("Please verify your new email before saving.");
      return;
    }
    setIsSavingEmail(true);
    try {
      // The old email is only ever stored in this one column, so updating it here
      // is what frees the old address up for reuse on another account.
      await auth.changeEmail(verifiedEmail, emailVerificationToken);
      setEmailMessage("Email address updated!");
      setEmailVerified(false);
      setVerifiedEmail("");
      setEmailVerificationToken("");
      window.setTimeout(() => setEmailMessage(""), 3000);
    } catch (err) {
      console.error("Email update error:", err);
      setEmailError(err instanceof Error ? err.message : "Unable to update email.");
    } finally {
      setIsSavingEmail(false);
    }
  };

  const emailChanged = newEmail.trim().toLowerCase() !== (user?.email || "").toLowerCase();

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center p-4 relative">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        <div className="flex items-end justify-between mb-4 px-2">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Settings</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
          >
            Dashboard
          </button>
        </div>

        <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
          <form onSubmit={handleSave}>
            <div className="p-6 md:p-8 space-y-6">
              <section className="space-y-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground border-b border-border pb-2">
                  Profile Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground ml-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-input bg-input-background text-foreground dark:bg-input/30 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground ml-1">Username</label>
                    <input
                      type="text"
                      value={user?.username || ""}
                      readOnly
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-muted text-muted-foreground outline-none"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-foreground ml-1">Degree</label>
                    <select
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      className="w-full border border-input bg-input-background text-foreground dark:bg-input/30 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    >
                      <option value="">Choose your degree</option>
                      {degree && !DEGREES.includes(degree) && (
                        <option value={degree}>{degree}</option>
                      )}
                      {DEGREES.map((deg) => (
                        <option key={deg} value={deg}>
                          {deg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void auth.logout()}
                  className="px-6 py-5 rounded-xl font-bold text-sm"
                >
                  <LogOut className="size-4 mr-2" />
                  Logout
                </Button>
                {message && (
                  <span className="text-xs font-bold text-emerald-600 animate-in fade-in slide-in-from-left-2">
                    {message}
                  </span>
                )}
                {error && <span className="text-xs font-bold text-destructive">{error}</span>}
              </div>
            </div>
          </form>
        </div>

        <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
          <div className="p-6 md:p-8 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground border-b border-border pb-2 flex items-center gap-2">
              <Mail className="size-3.5" /> Email Address
            </h2>

            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground ml-1">Email Address</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                    setEmailError("");
                  }}
                  className="flex-1 border border-input bg-input-background text-foreground dark:bg-input/30 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
                {emailChanged && (
                  emailVerified ? (
                    <div className="px-4 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-2 text-green-600 font-bold text-xs whitespace-nowrap">
                      <CheckCircle className="size-4" /> Verified
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-lg font-bold whitespace-nowrap"
                      onClick={handleSendEmailCode}
                      disabled={isSendingEmailCode || !newEmail.includes("@")}
                    >
                      {isSendingEmailCode ? "Sending..." : "Verify"}
                    </Button>
                  )
                )}
              </div>

              {emailChanged && showEmailCodeInput && !emailVerified && (
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
                      className="w-full border border-border bg-background text-foreground rounded-lg px-3 py-2 font-mono text-center tracking-[0.4em] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
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
                  <Button
                    type="button"
                    onClick={handleVerifyEmailCode}
                    disabled={isVerifyingEmailCode || emailCode.length !== 6}
                  >
                    {isVerifyingEmailCode ? "Checking..." : "Confirm"}
                  </Button>
                </div>
              )}
              {emailChanged && !showEmailCodeInput && !emailVerified && (
                <p className="text-xs text-muted-foreground ml-1">
                  We'll send a 6-digit code to confirm you own this email before it replaces your current one.
                </p>
              )}
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Button
                type="button"
                onClick={handleUpdateEmail}
                disabled={!emailChanged || !emailVerified || isSavingEmail}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
              >
                {isSavingEmail ? "Updating..." : "Update Email"}
              </Button>
              {emailMessage && (
                <span className="text-xs font-bold text-emerald-600 animate-in fade-in slide-in-from-left-2">
                  {emailMessage}
                </span>
              )}
              {emailError && <span className="text-xs font-bold text-destructive">{emailError}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
