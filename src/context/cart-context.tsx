"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { CartItem } from "@/types/cart";
import type { Product, Size } from "@/types/product";

const STORAGE_KEY = "carmessie-velvet-cart";

type Listener = () => void;

function createCartStore() {
  let items: CartItem[] = [];
  let loadedFromStorage = false;
  const listeners = new Set<Listener>();

  function loadOnce() {
    if (loadedFromStorage || typeof window === "undefined") return;
    loadedFromStorage = true;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      items = raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      items = [];
    }
  }

  function persist() {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function emit() {
    for (const listener of listeners) listener();
  }

  return {
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot() {
      loadOnce();
      return items;
    },
    getServerSnapshot() {
      return items;
    },
    setItems(next: CartItem[]) {
      items = next;
      persist();
      emit();
    },
    getItems() {
      loadOnce();
      return items;
    },
  };
}

const cartStore = createCartStore();

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, size: Size, quantity?: number) => void;
  removeItem: (productId: string, size: Size) => void;
  setQuantity: (productId: string, size: Size, quantity: number) => void;
  clear: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot
  );

  const addItem = useCallback(
    (product: Product, size: Size, quantity = 1) => {
      const current = cartStore.getItems();
      const existing = current.find(
        (item) => item.product.id === product.id && item.size === size
      );
      const next = existing
        ? current.map((item) =>
            item === existing
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        : [...current, { product, size, quantity }];
      cartStore.setItems(next);
    },
    []
  );

  const removeItem = useCallback((productId: string, size: Size) => {
    const next = cartStore
      .getItems()
      .filter((item) => !(item.product.id === productId && item.size === size));
    cartStore.setItems(next);
  }, []);

  const setQuantity = useCallback(
    (productId: string, size: Size, quantity: number) => {
      const next = cartStore
        .getItems()
        .map((item) =>
          item.product.id === productId && item.size === size
            ? { ...item, quantity }
            : item
        )
        .filter((item) => item.quantity > 0);
      cartStore.setItems(next);
    },
    []
  );

  const clear = useCallback(() => cartStore.setItems([]), []);

  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      addItem,
      removeItem,
      setQuantity,
      clear,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
    }),
    [
      items,
      itemCount,
      subtotal,
      addItem,
      removeItem,
      setQuantity,
      clear,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
