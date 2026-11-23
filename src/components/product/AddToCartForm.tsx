"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Product, Size } from "@/types/product";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/Button";
import { isSoldOut } from "@/lib/product-stock";
import { useSetSelections } from "@/lib/use-set-selections";
import { SizeGuideModal } from "@/components/product/SizeGuideModal";
import { ComponentSelector } from "@/components/product/ComponentSelector";
import { ColorPicker } from "@/components/product/ColorPicker";
import { MadeToOrderCard } from "@/components/product/MadeToOrderCard";
import { StickyBuyBar } from "@/components/product/StickyBuyBar";

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
  const ctaRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [shake, setShake] = useState(0);

  const hasColorChoice = product.colors.length > 0;
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

  // From the sticky bar with nothing chosen yet: bring the choices into view.
  function handleStickyPress() {
    if (selectedSize) {
      handleAdd();
      return;
    }
    formRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    setShake((n) => n + 1);
  }

  return (
    <div id="comprar" ref={formRef} className="scroll-mt-28">
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
      <motion.div
        key={shake}
        animate={shake ? { x: [0, -7, 6, -4, 3, 0] } : undefined}
        transition={{ duration: 0.5 }}
        className="mt-3 grid grid-cols-4 gap-2"
      >
        {sizeOptions.map((option) => (
          <button
            key={option.size}
            type="button"
            disabled={!option.available}
            onClick={() => setSelectedSize(option.size)}
            aria-pressed={selectedSize === option.size}
            className={`h-12 border text-[13px] font-bold uppercase tracking-wide transition-all duration-300 active:scale-95 ${
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
      </motion.div>

      {product.madeToOrder && !isSoldOut(product) && (
        <div className="mt-5">
          <MadeToOrderCard />
        </div>
      )}

      <div ref={ctaRef} className="mt-4">
        <Button
          type="button"
          onClick={handleAdd}
          disabled={!selectedSize}
          className="h-14 w-full"
        >
          {isSoldOut(product) ? "Agotado" : selectedSize ? "Agregar al carrito" : "Elige una talla"}
        </Button>
      </div>

      {!isSoldOut(product) && (
        <StickyBuyBar
          product={product}
          anchorRef={ctaRef}
          ready={!!selectedSize}
          label={selectedSize ? "Agregar al carrito" : "Elige tu talla"}
          onPress={handleStickyPress}
        />
      )}

      <SizeGuideModal isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} />
    </div>
  );
}

function SetAddToCartForm({ product }: { product: Product }) {
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const { addItem, openDrawer } = useCart();
  const { components, selections, setSelection, complete, buildCartSelections } =
    useSetSelections(product.components);
  const ctaRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  function handleAdd() {
    if (!complete) return;
    addItem(product, { selections: buildCartSelections() });
    openDrawer();
  }

  function handleStickyPress() {
    if (complete) {
      handleAdd();
      return;
    }
    formRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  return (
    <div id="comprar" ref={formRef} className="scroll-mt-28">
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
        <div className="mt-5">
          <MadeToOrderCard />
        </div>
      )}

      <div ref={ctaRef} className="mt-4">
        <Button type="button" onClick={handleAdd} disabled={!complete} className="h-14 w-full">
          {isSoldOut(product) ? "Agotado" : complete ? "Agregar al carrito" : "Elige talla y color"}
        </Button>
      </div>

      {!isSoldOut(product) && (
        <StickyBuyBar
          product={product}
          anchorRef={ctaRef}
          ready={complete}
          label={complete ? "Agregar al carrito" : "Elige talla y color"}
          onPress={handleStickyPress}
        />
      )}

      <SizeGuideModal isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} />
    </div>
  );
}
