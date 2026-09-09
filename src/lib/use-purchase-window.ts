"use client";

import { useEffect, useState } from "react";
import { storeStatusService } from "@/services/store-status-service";
import type { StoreStatus } from "@/types/store-status";
import { derivePurchaseWindowState, type PurchaseWindowState } from "./purchase-window";

// Refetched periodically (not just once on mount) so an admin changing
// `closedDays` mid-session — or the calendar day simply rolling over — is
// picked up without the shopper needing to reload. Cheap, public,
// unauthenticated endpoint.
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Live purchase-window status, ticking once a second on top of a
 * periodically refreshed `GET /store/status`. Returns `null` until the
 * first fetch resolves — every consumer must treat `null` as "still
 * loading" (render nothing / a neutral placeholder) rather than guessing,
 * both for hydration safety and because there's no local fallback for which
 * days are open (that's admin-configured, not something to assume).
 */
export function usePurchaseWindow(): PurchaseWindowState | null {
  const [status, setStatus] = useState<StoreStatus | null>(null);
  const [state, setState] = useState<PurchaseWindowState | null>(null);

  useEffect(() => {
    let cancelled = false;
    function refresh() {
      storeStatusService
        .getStatus()
        .then((next) => {
          if (!cancelled) setStatus(next);
        })
        .catch(() => {
          // Best-effort — keep showing the last known status (or stay
          // `null`/hidden) rather than erroring the page over this.
        });
    }
    refresh();
    const refreshId = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(refreshId);
    };
  }, []);

  useEffect(() => {
    if (!status) return;
    setState(derivePurchaseWindowState(status));
    const tickId = setInterval(() => setState(derivePurchaseWindowState(status)), 1000);
    return () => clearInterval(tickId);
  }, [status]);

  return state;
}
