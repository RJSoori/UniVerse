import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Button } from "../../shared/ui/button";

export default function SignIn() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await auth.login(formData);
      // Always land on a fresh dashboard after login. Deep-link preservation
      // would be confusing on a shared machine where account A's last route
      // gets replayed when account B signs in.
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Login Error:", err);
      setError(err instanceof Error ? err.message : "Unable to sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted px-4">
      <button
        onClick={() => navigate("/")}
        className="absolute top-8 left-8 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-sm font-medium"
      >
        Back to Home
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Welcome back</h2>
          <p className="text-muted-foreground mt-2">Enter your credentials to access your UniVerse</p>
        </div>

        <div className="bg-card rounded-2xl shadow-xl border border-border p-8 sm:p-10">
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border-l-4 border-destructive text-destructive text-sm rounded-r-md animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground ml-1">Username</label>
              <input
                type="text"
                name="username"
                placeholder="johndoe123"
                value={formData.username}
                onChange={handleChange}
                className="w-full border border-border bg-background text-foreground rounded-xl px-4 py-3 focus:ring-4 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground/70"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-semibold text-foreground">Password</label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot?
                </button>
              </div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-border bg-background text-foreground rounded-xl px-4 py-3 focus:ring-4 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground/70"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              {submitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center mt-8 text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <span
              className="text-primary font-bold cursor-pointer hover:underline"
              onClick={() => navigate("/signup/student/register")}
            >
              Sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
