"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Product } from "@/types/product";

interface QuickAddContextValue {
  product: Product | null;
  isOpen: boolean;
  open: (product: Product) => void;
  close: () => void;
}

const QuickAddContext = createContext<QuickAddContextValue | null>(null);

export function QuickAddProvider({ children }: { children: React.ReactNode }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback((p: Product) => {
    setProduct(p);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ product, isOpen, open, close }),
    [product, isOpen, open, close]
  );

  return <QuickAddContext.Provider value={value}>{children}</QuickAddContext.Provider>;
}

export function useQuickAdd(): QuickAddContextValue {
  const ctx = useContext(QuickAddContext);
  if (!ctx) throw new Error("useQuickAdd must be used within a QuickAddProvider");
  return ctx;
}
