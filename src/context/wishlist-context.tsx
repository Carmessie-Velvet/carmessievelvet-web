"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "./auth-context";
import { wishlistService } from "@/services/wishlist-service";
import type { Product } from "@/types/product";

interface WishlistContextValue {
  isWishlisted: (productId: string) => boolean;
  toggle: (product: Product) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    wishlistService
      .getAll()
      .then((items) => {
        if (!cancelled) setIds(new Set(items.map((item) => item.product.id)));
      })
      .catch(() => {
        // Best-effort — hearts just stay unfilled if this fails.
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const isWishlisted = useCallback(
    (productId: string) => isAuthenticated && ids.has(productId),
    [isAuthenticated, ids]
  );

  // Guards against a rapid double-click on the same heart: without it, two
  // clicks fired before React re-renders both read the same stale `ids`
  // snapshot and both resolve `currentlyIn` the same way — sending two
  // "add" calls instead of an add-then-remove. The backend's add is
  // idempotent so nothing duplicates, but the second click's intent (undo
  // the first) would silently never happen. A per-product in-flight guard
  // (a ref so it's read synchronously, not stale like state) makes a click
  // while one's already pending a no-op instead.
  const pendingRef = useRef<Set<string>>(new Set());

  const toggle = useCallback(
    async (product: Product) => {
      if (pendingRef.current.has(product.id)) return;
      pendingRef.current.add(product.id);

      const sku = product.slug.toUpperCase();
      const currentlyIn = ids.has(product.id);

      setIds((prev) => {
        const next = new Set(prev);
        if (currentlyIn) next.delete(product.id);
        else next.add(product.id);
        return next;
      });

      try {
        if (currentlyIn) await wishlistService.remove(sku);
        else await wishlistService.add(sku);
      } catch (err) {
        setIds((prev) => {
          const next = new Set(prev);
          if (currentlyIn) next.add(product.id);
          else next.delete(product.id);
          return next;
        });
        throw err;
      } finally {
        pendingRef.current.delete(product.id);
      }
    },
    [ids]
  );

  const value = useMemo(() => ({ isWishlisted, toggle }), [isWishlisted, toggle]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
