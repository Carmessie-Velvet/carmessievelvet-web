"use client";

import Image from "next/image";
import { useState } from "react";
import { useQuickAdd } from "@/context/quick-add-context";
import { useCart } from "@/context/cart-context";
import { Sheet } from "@/components/ui/Sheet";
import { formatLeadTime, getLeadTime } from "@/lib/lead-time";
import { useSetSelections } from "@/lib/use-set-selections";
import { formatCurrency } from "@/lib/format-currency";
import { isSoldOut } from "@/lib/product-stock";
import { discountPercent } from "@/lib/discount";
import { DiscountBadge } from "@/components/product/DiscountBadge";
import { ComponentSelector } from "@/components/product/ComponentSelector";
import { ColorPicker } from "@/components/product/ColorPicker";
import type { Product, Size } from "@/types/product";

function SimpleFields({
  product,
  onAdded,
}: {
  product: Product;
  onAdded: () => void;
}) {
  const { addItem, openDrawer } = useCart();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);

  const hasColorChoice = product.colors.length > 0;
  // Same rule as ComponentSelector/AddToCartForm: no color of its own means
  // `colors: []` and every option's `color: null` — skip the filter then.
  const activeColor = product.colors.length > 0 ? (selectedColor ?? product.colors[0]) : undefined;
  const sizeOptions =
    product.colors.length > 0
      ? product.options.filter((option) => option.color === activeColor)
      : product.options;

  function handleAdd() {
    if (!selectedSize) return;
    addItem(product, { size: selectedSize, color: activeColor });
    onAdded();
    openDrawer();
  }

  return (
    <>
      {hasColorChoice && (
        <>
          <p className="mt-6 text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">
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
        </>
      )}

      <p className={`text-xs font-bold uppercase tracking-[0.18em] text-ink ${hasColorChoice ? "mt-4" : "mt-5"}`}>
        Talla
      </p>
      <div className="mt-2.5 grid grid-cols-4 gap-2">
        {sizeOptions.map((option) => (
          <button
            key={option.size}
            type="button"
            disabled={!option.available}
            onClick={() => setSelectedSize(option.size)}
            aria-pressed={selectedSize === option.size}
            className={`h-12 border text-[13px] font-bold uppercase tracking-wide transition-all duration-200 active:scale-95 ${
              !option.available
                ? "cursor-not-allowed border-sand text-ink-muted/40 line-through"
                : selectedSize === option.size
                  ? "-translate-y-0.5 border-ink bg-ink text-cream-soft shadow-[0_10px_16px_-10px_rgba(42,31,28,0.6)]"
                  : "border-sand bg-white text-ink hover:border-ink"
            }`}
          >
            {option.size}
          </button>
        ))}
      </div>

      <MadeToOrderNote product={product} />

      <button
        type="button"
        onClick={handleAdd}
        disabled={!selectedSize}
        className={ctaClass}
      >
        {isSoldOut(product) ? "Agotado" : selectedSize ? "Agregar al carrito" : "Elige una talla"}
      </button>
    </>
  );
}

function SetFields({ product, onAdded }: { product: Product; onAdded: () => void }) {
  const { addItem, openDrawer } = useCart();
  const { components, selections, setSelection, complete, buildCartSelections } =
    useSetSelections(product.components);

  function handleAdd() {
    if (!complete) return;
    addItem(product, { selections: buildCartSelections() });
    onAdded();
    openDrawer();
  }

  const chosen = components.filter((component) => selections[component.id]?.size).length;

  return (
    <>
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-ink">
        Elige talla y color de cada prenda
      </p>
      <p className="mt-1 text-xs text-ink-muted">
        {chosen} de {components.length} prendas
      </p>
      <div className="mt-3 flex flex-col gap-4">
        {components.map((component) => (
          <ComponentSelector
            key={component.id}
            component={component}
            selection={selections[component.id] ?? { size: null }}
            onChange={(next) => setSelection(component.id, next)}
          />
        ))}
      </div>

      <MadeToOrderNote product={product} />

      <button
        type="button"
        onClick={handleAdd}
        disabled={!complete}
        className={ctaClass}
      >
        {isSoldOut(product) ? "Agotado" : complete ? "Agregar al carrito" : "Elige talla y color"}
      </button>
    </>
  );
}

const ctaClass =
  "mt-4 flex h-14 w-full items-center justify-center gap-2 bg-ink px-6 text-xs font-bold uppercase tracking-[0.18em] text-cream-soft transition-colors duration-200 hover:bg-velvet disabled:cursor-not-allowed disabled:opacity-40";

function MadeToOrderNote({ product }: { product: Product }) {
  if (!product.madeToOrder || isSoldOut(product)) return null;
  return (
    <p className="mt-4 flex items-center gap-2.5 border border-sand bg-cream-soft px-3 py-2.5 text-xs text-ink-muted">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-[18px] w-[18px] shrink-0 text-velvet" aria-hidden="true">
        <circle cx="6" cy="7" r="2.6" />
        <circle cx="6" cy="17" r="2.6" />
        <path d="M8.3 8.5L20 15M8.3 15.5L20 9" />
      </svg>
      <span>Hecho sobre pedido · lo elaboramos para ti en {formatLeadTime(getLeadTime())}</span>
    </p>
  );
}

/**
 * Pick a size (or a size and color per piece, for a set) without leaving the
 * page you are on. A bottom sheet on a phone, a centered dialog on desktop.
 */
export function QuickAddModal() {
  const { product, isOpen, close } = useQuickAdd();
  const discount = product ? discountPercent(product) : null;

  return (
    <Sheet isOpen={isOpen && !!product} onClose={close} desktop="center" labelledBy="quick-add-heading">
      {product && (
        // Remounts per product so SimpleFields/SetFields' own selection state
        // always starts fresh instead of leaking a previous product's picks.
        <div key={product.id} className="flex-1 overflow-y-auto px-5 pb-6 pt-1 lg:pt-5">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-sand">
              <Image
                src={product.images[0].src}
                alt={product.images[0].alt}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                {product.category.name}
              </p>
              <h2 id="quick-add-heading" className="mt-0.5 text-base font-black uppercase leading-tight tracking-tight text-ink">
                {product.name}
              </h2>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[15px] font-extrabold text-ink">
                {product.compareAtPrice && (
                  <span className="text-xs font-medium text-ink-muted line-through opacity-70">
                    {formatCurrency(product.compareAtPrice)}
                  </span>
                )}
                <span className={discount ? "text-velvet" : ""}>{formatCurrency(product.price)}</span>
                {discount && <DiscountBadge percent={discount} />}
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar"
              className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center self-start text-ink-muted transition-all duration-300 ease-out hover:rotate-90 hover:text-ink"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {product.category.type === "SET" ? (
            <SetFields product={product} onAdded={close} />
          ) : (
            <SimpleFields product={product} onAdded={close} />
          )}
        </div>
      )}
    </Sheet>
  );
}
