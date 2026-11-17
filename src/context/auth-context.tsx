"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
  /** Consumes a password-reset token and logs the account in with the fresh session it returns. */
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  /**
   * True when someone is logged in and the API has said their email is not
   * verified yet (an explicit `emailVerified: false`). While it is, the account
   * can browse and fill a cart but cannot place an order.
   */
  needsEmailVerification: boolean;
  /** Re-reads the account from `GET /auth/me` — picks up a verification done elsewhere. Best-effort: a failure leaves the stored user as it was. */
  refreshUser: () => Promise<void>;
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

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    const nextSession = await authService.resetPassword(token, newPassword);
    authStore.setSession(nextSession);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!authStore.getSession()) return;
    try {
      const me = await authService.me();
      // Read the session again after the await: the call may have silently
      // refreshed the tokens, and the user must be merged into that newer one.
      const latest = authStore.getSession();
      if (latest) authStore.updateUser({ ...latest.user, ...me });
    } catch {
      // Best-effort — the stored user (and the API's own 403 at checkout) stay
      // the source of truth if this can't reach the server.
    }
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

  // Stays true until the API has confirmed the email: an unverified account,
  // or a session stored before the API sent `emailVerified` (undefined).
  const needsVerificationCheck = !!session && session.user.emailVerified !== true;

  // While the email is unverified, keep the stored state honest: re-read it on
  // load and whenever the person comes back to this tab (they usually verify in
  // their mail app or another tab), so the "confirm your email" notice goes
  // away by itself the moment they do. Stops once the API says verified.
  useEffect(() => {
    if (!needsVerificationCheck) return;
    void refreshUser();
    const onReturn = () => {
      if (document.visibilityState === "visible") void refreshUser();
    };
    document.addEventListener("visibilitychange", onReturn);
    window.addEventListener("focus", onReturn);
    return () => {
      document.removeEventListener("visibilitychange", onReturn);
      window.removeEventListener("focus", onReturn);
    };
  }, [needsVerificationCheck, refreshUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: !!session,
      signup,
      login,
      logout,
      resetPassword,
      needsEmailVerification: !!session && session.user.emailVerified === false,
      refreshUser,
    }),
    [session, signup, login, logout, resetPassword, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
