import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, parseApiError } from "../shared/api/client";
import type { AuthUser } from "./tokenStore";
import {
  clearAuthStorage,
  getUser,
  onUnauthorized,
  setUser,
} from "./tokenStore";

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  name: string;
  degree: string;
  email: string;
  emailVerificationToken: string;
}

interface UpdateProfilePayload {
  name?: string;
  email?: string;
  degree?: string | null;
}

interface AuthResponse {
  //JWT token for authenticated session
  token: string;
  user: AuthUser;
}

function normalizeAuthUser(user: AuthUser): AuthUser {
  // Ensure the auth user has at least one timestamp the UI can use for onboarding
  // or sorting purposes. The backend may return `createdAt`; for older records
  // we set `firstSeenAt` on the client so components like HabitTracker can
  // determine account age reliably.
  if (user.createdAt || user.firstSeenAt) {
    return user;
  }

  return {
    ...user,
    firstSeenAt: new Date().toISOString(),
  };
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (patch: UpdateProfilePayload) => Promise<AuthUser>;
  refreshSession: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  //Initialize auth state from localStorage and manage session lifecycle
  const [userState, setUserState] = useState<AuthUser | null>(() => getUser());
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    clearAuthStorage();
    setUserState(null);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const response = await apiFetch("/api/auth/me");
      if (!response.ok) {
        clearSession();
        setLoading(false);
        return null;
      }
      const refreshedUser = (await response.json()) as AuthUser;
      setUser(refreshedUser);
      setUserState(refreshedUser);
      setLoading(false);
      return refreshedUser;
    } catch (error) {
      console.error("Session refresh failed:", error);
      clearSession();
      setLoading(false);
      return null;
    }
  }, [clearSession]);

  const applyAuthResponse = useCallback((auth: AuthResponse) => {
    const normalizedUser = normalizeAuthUser(auth.user);
    setUser(normalizedUser);
    setUserState(normalizedUser);
  }, []);

  const login = useCallback(
    //Perform login by sending credentials to backend and handling response
    async (credentials: LoginCredentials) => {
      const response = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      applyAuthResponse((await response.json()) as AuthResponse);
    },
    [applyAuthResponse],
  );

  const register = useCallback(
    //Perform registration by sending user details to backend and handling response
    async (credentials: RegisterCredentials) => {
      const response = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      applyAuthResponse((await response.json()) as AuthResponse);
    },
    [applyAuthResponse],
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Local logout should still complete even if the backend is unavailable.
    } finally {
      clearSession();
      navigate("/", { replace: true });
    }
  }, [clearSession, navigate]);

  const updateProfile = useCallback(
    async (patch: UpdateProfilePayload) => {
      const response = await apiFetch("/api/auth/me", {
        method: "PUT",
        body: JSON.stringify(patch),
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      const updatedUser = normalizeAuthUser((await response.json()) as AuthUser);
      setUser(updatedUser);
      setUserState(updatedUser);
      return updatedUser;
    },
    [],
  );

  useEffect(() => {
    onUnauthorized(() => {
      clearSession();
      navigate("/signin", { replace: true });
    });

    void refreshSession();

    return () => onUnauthorized(null);
  }, [clearSession, navigate, refreshSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: userState,
      loading,
      login,
      register,
      logout,
      updateProfile,
      refreshSession,
    }),
    [loading, login, logout, refreshSession, register, updateProfile, userState],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
