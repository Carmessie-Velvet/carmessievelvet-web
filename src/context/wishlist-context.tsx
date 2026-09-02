"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./auth-context";
import { wishlistService } from "@/services/wishlist-service";
import type { Product } from "@/types/product";
import type { WishlistItem } from "@/types/wishlist";

interface WishlistContextValue {
  items: WishlistItem[];
  isWishlisted: (productId: string) => boolean;
  toggle: (product: Product) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    // No cleanup of `items` on logout: `isWishlisted` already gates on
    // `isAuthenticated`, so stale items just stop being reflected in the UI
    // rather than needing an extra synchronous reset here.
    if (!isAuthenticated) return;
    let cancelled = false;
    wishlistService
      .getAll()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch(() => {
        // Best-effort — hearts just stay unfilled if this fails.
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // Guards against a rapid double-click on the same heart: without it, two
  // clicks fired before React re-renders both read the same stale `items`
  // snapshot and both resolve `currentlyIn` the same way — sending two
  // "add" calls instead of an add-then-remove. The backend's add is
  // idempotent so nothing duplicates, but the second click's intent (undo
  // the first) would silently never happen. A per-product in-flight guard
  // (a ref so it's read synchronously, not stale like state) makes a click
  // while one's already pending a no-op instead.
  const pendingRef = useRef<Set<string>>(new Set());

  // Deliberately not wrapped in useCallback/useMemo: this context's value
  // object is already a fresh reference on every render (see below), so
  // memoizing the functions inside it buys nothing and is one more place a
  // stale-dependency bug can hide.
  function isWishlisted(productId: string): boolean {
    return isAuthenticated && items.some((item) => item.product.id === productId);
  }

  async function toggle(product: Product): Promise<void> {
    if (pendingRef.current.has(product.id)) return;
    pendingRef.current.add(product.id);

    const sku = product.slug.toUpperCase();
    const previousItems = items;
    const currentlyIn = previousItems.some((item) => item.product.id === product.id);

    if (currentlyIn) {
      setItems(previousItems.filter((item) => item.product.id !== product.id));
    } else {
      setItems([
        ...previousItems,
        { id: `optimistic-${product.id}`, addedAt: new Date().toISOString(), product },
      ]);
    }

    try {
      if (currentlyIn) {
        await wishlistService.remove(sku);
      } else {
        const created = await wishlistService.add(sku);
        setItems((prev) =>
          prev.map((item) => (item.id === `optimistic-${product.id}` ? created : item))
        );
      }
    } catch (err) {
      setItems(previousItems);
      throw err;
    } finally {
      pendingRef.current.delete(product.id);
    }
  }

  const value: WishlistContextValue = { items, isWishlisted, toggle };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
