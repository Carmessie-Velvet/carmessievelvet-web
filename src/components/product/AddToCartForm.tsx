"use client";

import { useState } from "react";
import type { Product, Size } from "@/types/product";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/Button";

export function AddToCartForm({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const { addItem, openDrawer } = useCart();

  function handleAdd() {
    if (!selectedSize) return;
    addItem(product, selectedSize);
    openDrawer();
  }

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">
        Talla
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {product.variants.map((variant) => (
          <button
            key={variant.size}
            type="button"
            disabled={!variant.inStock}
            onClick={() => setSelectedSize(variant.size)}
            aria-pressed={selectedSize === variant.size}
            className={`flex h-11 w-11 items-center justify-center border text-xs font-medium uppercase tracking-wide transition-colors ${
              selectedSize === variant.size
                ? "border-ink bg-ink text-cream-soft"
                : "border-sand text-ink hover:border-ink"
            } ${!variant.inStock ? "cursor-not-allowed border-sand text-ink-muted/40 line-through" : ""}`}
          >
            {variant.size}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <Button
          type="button"
          onClick={handleAdd}
          disabled={!selectedSize}
          className="w-full"
        >
          {selectedSize ? "Agregar al carrito" : "Elige una talla"}
        </Button>
      </div>
    </div>
  );
}
