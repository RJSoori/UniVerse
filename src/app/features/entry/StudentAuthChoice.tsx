import { Button } from "../../shared/ui/button";
import { useNavigate } from "react-router-dom";

export default function StudentAuthChoice() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted px-4">

      <div className="w-full max-w-md bg-card p-10 rounded-2xl shadow-xl border border-border text-center">

        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">UniVerse</h2>
          <p className="text-muted-foreground mt-2">Your academic journey starts here.</p>
        </div>

        <div className="space-y-10">
          {/* Sign Up Section - The Primary Action */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-full">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">New here?</h3>
              <Button
                className="w-full py-6 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 active:scale-95"
                onClick={() => navigate("/signup/student/register")}
              >
                Create Account
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-4 text-muted-foreground text-sm">or</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          {/* Sign In Section - The Secondary Action */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-full">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Returning Student?</h3>
              <Button
                variant="outline"
                className="w-full py-6 text-lg font-semibold border-2 border-border hover:bg-muted text-foreground transition-all duration-200 active:scale-95"
                onClick={() => navigate("/signin")}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-12 text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}
