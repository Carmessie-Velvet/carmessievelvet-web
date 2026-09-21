"use client";

import { useState } from "react";
import type { Product, Size } from "@/types/product";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/Button";
import { isSoldOut } from "@/lib/product-stock";
import { useSetSelections } from "@/lib/use-set-selections";
import { SizeGuideModal } from "@/components/product/SizeGuideModal";
import { ComponentSelector } from "@/components/product/ComponentSelector";
import { ColorPicker } from "@/components/product/ColorPicker";

export function AddToCartForm({ product }: { product: Product }) {
  if (product.category.type === "SET") {
    return <SetAddToCartForm product={product} />;
  }
  return <SimpleAddToCartForm product={product} />;
}

function SimpleAddToCartForm({ product }: { product: Product }) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const { addItem, openDrawer } = useCart();

  const hasColorChoice = product.colors.length > 1;
  // Same rule as ComponentSelector: a product with no color of its own comes
  // back as `colors: []` and every option's `color: null` — skip the color
  // filter entirely rather than comparing against `undefined` (which would
  // never match `null` and silently hide every size).
  const activeColor = product.colors.length > 0 ? (selectedColor ?? product.colors[0]) : undefined;
  const sizeOptions =
    product.colors.length > 0
      ? product.options.filter((option) => option.color === activeColor)
      : product.options;

  function handleAdd() {
    if (!selectedSize) return;
    addItem(product, { size: selectedSize, color: activeColor });
    openDrawer();
  }

  return (
    <div>
      {hasColorChoice && (
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">
            Color
          </p>
          <ColorPicker
            colors={product.colors}
            value={activeColor ?? null}
            onChange={(color) => {
              setSelectedColor(color);
              setSelectedSize(null);
            }}
          />
        </div>
      )}

      <div className={`flex items-center justify-between ${hasColorChoice ? "mt-4" : ""}`}>
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
        {sizeOptions.map((option) => (
          <button
            key={option.size}
            type="button"
            disabled={!option.available}
            onClick={() => setSelectedSize(option.size)}
            aria-pressed={selectedSize === option.size}
            className={`flex h-11 w-11 items-center justify-center border text-xs font-medium uppercase tracking-wide transition-colors ${
              !option.available
                ? "cursor-not-allowed border-sand text-ink-muted/40 line-through"
                : selectedSize === option.size
                  ? "border-ink bg-ink text-cream-soft"
                  : "border-sand text-ink hover:border-ink"
            }`}
          >
            {option.size}
          </button>
        ))}
      </div>

      {product.madeToOrder && !isSoldOut(product) && (
        <p className="mt-3 text-xs text-ink-muted">
          Hecho sobre pedido · tiempo de elaboración de 3 a 4 semanas.
        </p>
      )}

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

function SetAddToCartForm({ product }: { product: Product }) {
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const { addItem, openDrawer } = useCart();
  const { components, selections, setSelection, complete, buildCartSelections } =
    useSetSelections(product.components);

  function handleAdd() {
    if (!complete) return;
    addItem(product, { selections: buildCartSelections() });
    openDrawer();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">
          Elige talla y color de cada prenda
        </p>
        <button
          type="button"
          onClick={() => setShowSizeGuide(true)}
          className="text-xs font-medium uppercase tracking-[0.1em] text-ink-muted underline-offset-2 hover:text-velvet hover:underline"
        >
          Guía de tallas
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-5">
        {components.map((component) => (
          <ComponentSelector
            key={component.id}
            component={component}
            selection={selections[component.id] ?? { size: null }}
            onChange={(next) => setSelection(component.id, next)}
          />
        ))}
      </div>

      {product.madeToOrder && !isSoldOut(product) && (
        <p className="mt-3 text-xs text-ink-muted">
          Hecho sobre pedido · tiempo de elaboración de 3 a 4 semanas.
        </p>
      )}

      <div className="mt-6">
        <Button type="button" onClick={handleAdd} disabled={!complete} className="w-full">
          {isSoldOut(product) ? "Agotado" : complete ? "Agregar al carrito" : "Elige talla y color"}
        </Button>
      </div>

      <SizeGuideModal isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} />
    </div>
  );
}
