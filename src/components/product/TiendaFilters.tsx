"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { Size } from "@/types/product";

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "recientes", label: "Más recientes" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "nombre", label: "Nombre A-Z" },
  { value: "descuento", label: "Con descuento" },
];

const SIZES: Size[] = ["XS", "S", "M", "L"];

const popoverMotion = {
  initial: { opacity: 0, y: -8, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.98 },
  transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const },
};

export function TiendaFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [openPopover, setOpenPopover] = useState<"talla" | "orden" | null>(null);

  useEffect(() => {
    if (!openPopover) return;
    function handleClickOutside(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpenPopover(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openPopover]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/tienda?${params.toString()}`);
  }

  const activeSize = searchParams.get("talla") ?? "";
  const activeSort = searchParams.get("orden") ?? "recientes";
  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === activeSort)?.label ?? SORT_OPTIONS[0].label;
  const activeQuery = searchParams.get("q") ?? "";

  return (
    <div ref={wrapRef} className="mt-6 flex flex-wrap items-center gap-3 border-b border-sand pb-6">
      {activeQuery && (
        <button
          type="button"
          onClick={() => updateParam("q", "")}
          className="flex items-center gap-2 rounded-full border border-sand bg-paper px-4 py-2 text-xs font-medium uppercase tracking-[0.1em] text-ink-muted transition-colors hover:border-ink hover:text-ink"
        >
          &ldquo;{activeQuery}&rdquo;
          <span aria-hidden="true">×</span>
        </button>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenPopover(openPopover === "talla" ? null : "talla")}
          className={pillClass(!!activeSize || openPopover === "talla")}
        >
          Talla{activeSize ? `: ${activeSize}` : ""}
        </button>
        <AnimatePresence>
          {openPopover === "talla" && (
            <motion.div {...popoverMotion} className={`${popoverClass} w-48`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink">Talla</p>
              <div className="mt-2.5 grid grid-cols-4 gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      updateParam("talla", activeSize === size ? "" : size);
                      setOpenPopover(null);
                    }}
                    className={sizeChipClass(activeSize === size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenPopover(openPopover === "orden" ? null : "orden")}
          className={pillClass(activeSort !== "recientes" || openPopover === "orden")}
        >
          {activeSortLabel}
          <ChevronIcon />
        </button>
        <AnimatePresence>
          {openPopover === "orden" && (
            <motion.div {...popoverMotion} className={`${popoverClass} min-w-[210px]`}>
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    updateParam("orden", option.value);
                    setOpenPopover(null);
                  }}
                  className={sortOptionClass(activeSort === option.value)}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function pillClass(active: boolean) {
  return `inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.1em] transition-colors duration-200 ${
    active
      ? "border-ink bg-ink text-cream-soft"
      : "border-sand bg-paper text-ink-muted hover:border-ink hover:text-ink"
  }`;
}

const popoverClass =
  "absolute left-0 top-11 z-30 border border-sand bg-paper p-3.5 shadow-[0_18px_40px_-12px_rgba(42,31,28,0.22)]";

function sizeChipClass(active: boolean) {
  return `flex h-9 items-center justify-center whitespace-nowrap border text-[11px] font-semibold uppercase tracking-wide transition-colors duration-200 ${
    active ? "border-ink bg-ink text-cream-soft" : "border-sand text-ink hover:border-ink"
  }`;
}

function sortOptionClass(active: boolean) {
  return `block w-full px-1 py-2 text-left text-xs transition-colors duration-150 ${
    active ? "font-semibold text-ink" : "text-ink-muted hover:text-ink"
  }`;
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="h-2.5 w-2.5" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
