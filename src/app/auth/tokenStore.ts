export type UserRole = "STUDENT" | "ADMIN" | "RECRUITER" | "SELLER";

// Represents the authenticated user's information stored in localStorage
export interface AuthUser {
  id: number;
  username: string;
  name: string;
  email: string;
  degree?: string | null;
  role: UserRole;
  /** ISO timestamp when the account was created (added server-side). */
  createdAt?: string | null;
  /** Client-side fallback timestamp when the user was first seen by the frontend. */
  firstSeenAt?: string | null;
}

const USER_KEY = "auth_user";

let unauthorizedCallback: (() => void) | null = null;

const canUseStorage = () => typeof window !== "undefined" && Boolean(window.localStorage);

// Token is stored in an httpOnly cookie set by the backend — not accessible from JS.
export function getToken(): string | null { return null; }
export function setToken(_token: string): void {}
export function clearToken(): void {}

export function getUser(): AuthUser | null {
  if (!canUseStorage()) return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    window.localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setUser(user: AuthUser): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser(): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(USER_KEY);
}

export function clearAuthStorage(): void {
  clearUser();
}

export function onUnauthorized(callback: (() => void) | null): void {
  unauthorizedCallback = callback;
}

export function notifyUnauthorized(): void {
  unauthorizedCallback?.();
}
