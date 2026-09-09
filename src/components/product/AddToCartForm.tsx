"use client";

import { useMemo, useState } from "react";
import type { Product, ProductComponent, Size } from "@/types/product";
import type { CartSelection } from "@/types/cart";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/Button";
import { isSoldOut } from "@/lib/product-stock";
import { SizeGuideModal } from "@/components/product/SizeGuideModal";

export function AddToCartForm({ product }: { product: Product }) {
  if (product.category.type === "SET") {
    return <SetAddToCartForm product={product} />;
  }
  return <SimpleAddToCartForm product={product} />;
}

function SimpleAddToCartForm({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const { addItem, openDrawer } = useCart();

  function handleAdd() {
    if (!selectedSize) return;
    addItem(product, { size: selectedSize });
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

interface ComponentSelection {
  size: Size | null;
  color?: string;
}

function ComponentSelector({
  component,
  selection,
  onChange,
}: {
  component: ProductComponent;
  selection: ComponentSelection;
  onChange: (next: ComponentSelection) => void;
}) {
  const hasColorChoice = component.colors.length > 1;
  const activeColor = selection.color ?? component.colors[0];
  const sizeOptions = component.options.filter((option) => option.color === activeColor);

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">
        {component.name}
      </p>

      {hasColorChoice && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {component.colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange({ size: null, color })}
              aria-pressed={activeColor === color}
              className={`h-9 border px-3 text-xs font-medium uppercase tracking-wide transition-colors ${
                activeColor === color
                  ? "border-ink bg-ink text-cream-soft"
                  : "border-sand text-ink hover:border-ink"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      )}

      <div className="mt-2.5 flex flex-wrap gap-2">
        {sizeOptions.map((option) => (
          <button
            key={option.size}
            type="button"
            disabled={!option.available}
            onClick={() => onChange({ size: option.size, color: activeColor })}
            aria-pressed={selection.size === option.size}
            className={`flex h-11 w-11 items-center justify-center border text-xs font-medium uppercase tracking-wide transition-colors ${
              !option.available
                ? "cursor-not-allowed border-sand text-ink-muted/40 line-through"
                : selection.size === option.size
                  ? "border-ink bg-ink text-cream-soft"
                  : "border-sand text-ink hover:border-ink"
            }`}
          >
            {option.size}
          </button>
        ))}
      </div>
    </div>
  );
}

function SetAddToCartForm({ product }: { product: Product }) {
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const { addItem, openDrawer } = useCart();
  const components = useMemo(
    () => [...product.components].sort((a, b) => a.position - b.position),
    [product.components]
  );
  const [selections, setSelections] = useState<Record<string, ComponentSelection>>({});

  const complete = components.every((c) => selections[c.id]?.size);

  function handleAdd() {
    if (!complete) return;
    const lines: CartSelection[] = components.map((c) => ({
      componentId: c.id,
      componentName: c.name,
      size: selections[c.id]!.size!,
      color: selections[c.id]!.color,
    }));
    addItem(product, { selections: lines });
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
            onChange={(next) =>
              setSelections((prev) => ({ ...prev, [component.id]: next }))
            }
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
