"use client";

import { useState } from "react";
import type { Product, Size } from "@/types/product";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/Button";
import { isSoldOut } from "@/lib/product-stock";
import { SizeGuideModal } from "@/components/product/SizeGuideModal";

export function AddToCartForm({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const { addItem, openDrawer } = useCart();

  function handleAdd() {
    if (!selectedSize) return;
    addItem(product, selectedSize);
    openDrawer();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">
          Talla
        </p>
        <button
          type="button"
          onClick={() => setShowSizeGuide(true)}
          className="text-xs font-medium uppercase tracking-[0.1em] text-ink-muted underline-offset-2 hover:text-velvet hover:underline"
        >
          Guía de tallas
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {product.variants.map((variant) => (
          <button
            key={variant.size}
            type="button"
            disabled={!variant.inStock}
            onClick={() => setSelectedSize(variant.size)}
            aria-pressed={selectedSize === variant.size}
            className={`flex h-11 w-11 items-center justify-center border text-xs font-medium uppercase tracking-wide transition-colors ${
              !variant.inStock
                ? "cursor-not-allowed border-sand text-ink-muted/40 line-through"
                : selectedSize === variant.size
                  ? "border-ink bg-ink text-cream-soft"
                  : "border-sand text-ink hover:border-ink"
            }`}
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
          {isSoldOut(product) ? "Agotado" : selectedSize ? "Agregar al carrito" : "Elige una talla"}
        </Button>
      </div>

      <SizeGuideModal isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} />
    </div>
  );
}
