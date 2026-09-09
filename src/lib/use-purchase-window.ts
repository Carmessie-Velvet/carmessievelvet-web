"use client";

import { useEffect, useState } from "react";
import { getPurchaseWindowState, type PurchaseWindowState } from "./purchase-window";

/**
 * Live purchase-window status, ticking once a second. Returns `null` until
 * mounted — the server render has no reliable "now", so every consumer must
 * treat `null` as "still loading" (render nothing / a neutral placeholder)
 * rather than guessing, or it'll hydration-mismatch against the client's
 * real clock.
 */
export function usePurchaseWindow(): PurchaseWindowState | null {
  const [state, setState] = useState<PurchaseWindowState | null>(null);

  useEffect(() => {
    setState(getPurchaseWindowState());
    const id = setInterval(() => setState(getPurchaseWindowState()), 1000);
    return () => clearInterval(id);
  }, []);

  return state;
}
