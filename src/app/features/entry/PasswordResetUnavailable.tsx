import { useNavigate } from "react-router-dom";
import { Button } from "../../shared/ui/button";

export default function PasswordResetUnavailable() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted px-4 text-center">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Password Reset</h2>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Password reset by email is not available yet. Contact your administrator to reset your password.
        </p>
        <Button className="mt-8 w-full rounded-xl bg-primary py-5 font-bold text-primary-foreground hover:bg-primary/90" onClick={() => navigate("/signin")}>
          Back to Sign In
        </Button>
      </div>
    </div>
  );
}
