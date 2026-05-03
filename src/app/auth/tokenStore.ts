export type UserRole = "STUDENT" | "ADMIN" | "RECRUITER" | "SELLER";

export interface AuthUser {
  id: number;
  username: string;
  name: string;
  email: string;
  degree?: string | null;
  role: UserRole;
}

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

let unauthorizedCallback: (() => void) | null = null;

const canUseStorage = () => typeof window !== "undefined" && Boolean(window.localStorage);

export function getToken(): string | null {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(TOKEN_KEY);
}

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
  clearToken();
  clearUser();
}

export function onUnauthorized(callback: (() => void) | null): void {
  unauthorizedCallback = callback;
}

export function notifyUnauthorized(): void {
  unauthorizedCallback?.();
}
