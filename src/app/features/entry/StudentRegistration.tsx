import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../auth/AuthContext";
import { Button } from "../../shared/ui/button";

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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== confirmPassword) {
      setPasswordError("Passwords do not match. Please enter the same password twice.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      await auth.register(formData);
      toast.success("Registration successful");
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
      <button
        onClick={() => (step === 2 ? setStep(1) : navigate("/"))}
        className="absolute top-8 left-8 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-sm font-medium"
      >
        {step === 2 ? "Previous Step" : "Back"}
      </button>

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

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground ml-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@address.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-border bg-background text-foreground rounded-xl px-4 py-3 focus:ring-4 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground/70"
                  required
                />
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
                {passwordError && <p className="text-xs text-destructive mt-1">{passwordError}</p>}
                {submitError && <p className="text-xs text-destructive mt-1">{submitError}</p>}
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
              >
                {submitting ? "Creating account..." : "Complete Registration"}
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
