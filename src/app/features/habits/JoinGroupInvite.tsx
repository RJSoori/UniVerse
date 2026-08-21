import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { setPendingGroupInviteCode } from "../../shared/invites/pendingInvite";
import { joinGroupHabit } from "../../shared/api/habitsApi";
import { Button } from "../../shared/ui/button";
import { Loader2 } from "lucide-react";

/**
 * Landing page for a group-habit invite link (see buildInviteLink in ./utils.ts).
 *
 * - Already signed in: joins the group right away and drops the visitor on /habits.
 * - Signed out: stashes the invite code (pendingInvite.ts) and sends them to sign in —
 *   SignIn/StudentRegistration pick the stashed code back up after a successful login and
 *   finish the join automatically, so there's nothing left for the visitor to do by hand.
 */
export default function JoinGroupInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const attemptedRef = useRef(false);

  const code = (searchParams.get("code") || "").trim();

  useEffect(() => {
    if (loading) return;

    if (!code) {
      setErrorMessage("This invite link is missing its invite code.");
      return;
    }

    if (!user) {
      // Not signed in yet — stash the code and continue once they sign in or create an account.
      setPendingGroupInviteCode(code);
      navigate("/signin", { replace: true });
      return;
    }

    if (attemptedRef.current) return;
    attemptedRef.current = true;

    (async () => {
      try {
        await joinGroupHabit(user.id, code);
        navigate("/habits", { replace: true });
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Could not join the group.");
      }
    })();
  }, [code, loading, user, navigate]);

  if (errorMessage) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg font-semibold text-foreground">Couldn't join the group</p>
        <p className="max-w-sm text-sm text-muted-foreground">{errorMessage}</p>
        <Button onClick={() => navigate("/habits")}>Go to Habits</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="size-6 animate-spin" />
      <p>Joining group...</p>
    </div>
  );
}
