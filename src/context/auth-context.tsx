"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { authStore } from "@/lib/auth-store";
import { authService } from "@/services/auth-service";
import type { AuthUser, LoginPayload, SignupPayload } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  signup: (payload: SignupPayload) => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const session = useSyncExternalStore(
    authStore.subscribe,
    authStore.getSnapshot,
    authStore.getServerSnapshot
  );

  const signup = useCallback(async (payload: SignupPayload) => {
    const nextSession = await authService.signup(payload);
    authStore.setSession(nextSession);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const nextSession = await authService.login(payload);
    authStore.setSession(nextSession);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Best-effort: the server session isn't invalidated either way (the
      // API's logout is a stub), so a failed call shouldn't block clearing
      // the local session.
    }
    authStore.setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: !!session,
      signup,
      login,
      logout,
    }),
    [session, signup, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
