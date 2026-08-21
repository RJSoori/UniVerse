/**
 * Stashes a group-habit invite code across the sign-in/sign-up flow.
 *
 * Someone who clicks an invite link (see buildInviteLink in features/habits/utils.ts) while
 * signed out lands on /habits/join, which has nowhere to keep the code once it redirects to
 * /signin — React Router state doesn't survive that redirect reliably, and email links open a
 * fresh tab with no prior app state at all. localStorage does survive it, so JoinGroupInvite
 * stashes the code here before redirecting, and SignIn/StudentRegistration pick it back up
 * after a successful login to finish the join automatically.
 */

import { joinGroupHabit } from "../api/habitsApi";
import type { HabitGroup } from "../../features/habits/types";

const PENDING_INVITE_CODE_KEY = "pending_group_invite_code";

const canUseStorage = () => typeof window !== "undefined" && Boolean(window.localStorage);

export function setPendingGroupInviteCode(code: string): void {
  if (!canUseStorage() || !code) return;
  window.localStorage.setItem(PENDING_INVITE_CODE_KEY, code);
}

export function getPendingGroupInviteCode(): string | null {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(PENDING_INVITE_CODE_KEY);
}

export function clearPendingGroupInviteCode(): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(PENDING_INVITE_CODE_KEY);
}

/**
 * If an invite code is stashed (see the module doc above), attempts to join that group and
 * always clears the stash afterward — a failed join (e.g. an expired code) shouldn't keep
 * retrying silently on every future sign-in. Call this right after a successful login/signup.
 * Resolves to `null`/`null` when there was no pending invite to redeem.
 */
export async function redeemPendingGroupInvite(
  studentId: number
): Promise<{ group: HabitGroup | null; error: string | null }> {
  const code = getPendingGroupInviteCode();
  if (!code) return { group: null, error: null };

  clearPendingGroupInviteCode();
  try {
    const group = await joinGroupHabit(studentId, code);
    return { group: group ?? null, error: null };
  } catch (err) {
    return { group: null, error: err instanceof Error ? err.message : "Could not join the group." };
  }
}
