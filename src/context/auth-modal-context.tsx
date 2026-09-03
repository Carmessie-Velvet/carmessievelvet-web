"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type AuthModalMode = "login" | "signup";

interface AuthModalContextValue {
  isOpen: boolean;
  mode: AuthModalMode;
  open: (mode?: AuthModalMode) => void;
  close: () => void;
  setMode: (mode: AuthModalMode) => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setModeState] = useState<AuthModalMode>("login");

  const open = useCallback((initialMode: AuthModalMode = "login") => {
    setModeState(initialMode);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);
  const setMode = useCallback((next: AuthModalMode) => setModeState(next), []);

  const value = useMemo(
    () => ({ isOpen, mode, open, close, setMode }),
    [isOpen, mode, open, close, setMode]
  );

  return <AuthModalContext.Provider value={value}>{children}</AuthModalContext.Provider>;
}

export function useAuthModal(): AuthModalContextValue {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within an AuthModalProvider");
  return ctx;
}
