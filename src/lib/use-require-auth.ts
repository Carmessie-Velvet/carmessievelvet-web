"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import { useAuthModal } from "@/context/auth-modal-context";
import { authStore } from "@/lib/auth-store";

/**
 * Opens the login modal when a gated page is *visited* while signed out —
 * but only that case, not when the shopper logs out while already on the
 * page. Without the "ever authenticated" guard, logging out from /cuenta
 * flips isAuthenticated to false a moment before the page unmounts, and
 * this same effect would pop the modal right as they're being sent home.
 *
 * There's a second trap this also has to dodge: on a hard/full-page load,
 * useSyncExternalStore renders getServerSnapshot()'s value (always "no
 * session" — it's a browser-only, localStorage-backed store) for the very
 * first commit, even for an already-logged-in shopper, and only self-heals
 * to the real client value moments later. useEffect fires on that first
 * commit too, so isAuthenticated briefly reads false — reliably enough to
 * trip this modal — before React corrects it. Re-checking authStore
 * directly (a synchronous localStorage read, not React's possibly-stale
 * render value) is what actually distinguishes that flash from a real
 * logged-out visit.
 */
export function useRequireAuth(): boolean {
  const { isAuthenticated } = useAuth();
  const { open: openAuthModal } = useAuthModal();
  const wasEverAuthenticated = useRef(false);

  useEffect(() => {
    if (isAuthenticated) {
      wasEverAuthenticated.current = true;
      return;
    }
    if (wasEverAuthenticated.current) return;
    if (!authStore.getSession()) {
      openAuthModal("login");
    }
  }, [isAuthenticated, openAuthModal]);

  return isAuthenticated;
}
