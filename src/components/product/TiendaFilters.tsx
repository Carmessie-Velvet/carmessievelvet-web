"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { Size } from "@/types/product";
import { productService } from "@/services/product-service";
import { Sheet } from "@/components/ui/Sheet";
import { setGridColumns, useGridColumns } from "@/lib/grid-columns";

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

export function TiendaFilters({ total }: { total: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [openPopover, setOpenPopover] = useState<"talla" | "orden" | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const columns = useGridColumns();

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
    // Any filter change invalidates the current page number (a different
    // result set may not even have that many pages) — always land back on
    // page 1 rather than risk an out-of-range page silently going empty.
    params.delete("pagina");
    router.push(`/tienda?${params.toString()}`);
  }

  const activeSize = searchParams.get("talla") ?? "";
  const activeSort = searchParams.get("orden") ?? "recientes";
  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === activeSort)?.label ?? SORT_OPTIONS[0].label;
  const activeQuery = searchParams.get("q") ?? "";

  return (
    <div ref={wrapRef} className="flex items-center gap-2.5 py-3 lg:py-4">
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

      {/* Phone: one chip that opens a bottom sheet with everything */}
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className={`${pillClass(!!activeSize || activeSort !== "recientes")} min-h-11 lg:hidden`}
      >
        Filtrar y ordenar
        <ChevronIcon />
      </button>

      <div className="relative hidden lg:block">
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

      <div className="relative hidden lg:block">
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

      <p className="ml-auto hidden text-xs text-ink-muted lg:block">
        {total} pieza{total === 1 ? "" : "s"}
      </p>

      {/* Phone: one or two columns */}
      <div className="ml-auto flex overflow-hidden rounded-full border border-sand bg-paper lg:hidden" role="group" aria-label="Columnas">
        {([2, 1] as const).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setGridColumns(n)}
            aria-label={n === 2 ? "Ver en 2 columnas" : "Ver en 1 columna"}
            aria-pressed={columns === n}
            className={`flex h-11 w-[46px] items-center justify-center transition-colors duration-200 ${
              columns === n ? "bg-velvet text-cream-soft" : "text-ink-muted"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="h-[18px] w-[18px]" aria-hidden="true">
              {n === 2 ? (
                <>
                  <rect x="4" y="4" width="7" height="16" />
                  <rect x="13" y="4" width="7" height="16" />
                </>
              ) : (
                <rect x="5" y="4" width="14" height="16" />
              )}
            </svg>
          </button>
        ))}
      </div>

      <Sheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} desktop="center" labelledBy="filters-heading">
        <FilterSheetBody
          initialSize={activeSize}
          initialSort={activeSort}
          category={searchParams.get("categoria") ?? undefined}
          query={activeQuery || undefined}
          total={total}
          onClose={() => setSheetOpen(false)}
          onApply={(size, sort) => {
            const params = new URLSearchParams(searchParams.toString());
            if (size) params.set("talla", size);
            else params.delete("talla");
            if (sort && sort !== "recientes") params.set("orden", sort);
            else params.delete("orden");
            params.delete("pagina");
            router.push(`/tienda?${params.toString()}`);
            setSheetOpen(false);
          }}
        />
      </Sheet>
    </div>
  );
}

/**
 * Contents of the phone filter sheet. Mounted only while the sheet is open, so
 * its draft always starts from what the URL currently says. The "Ver N piezas"
 * button asks the API how many results the draft would give.
 */
function FilterSheetBody({
  initialSize,
  initialSort,
  category,
  query,
  total,
  onClose,
  onApply,
}: {
  initialSize: string;
  initialSort: string;
  category: string | undefined;
  query: string | undefined;
  total: number;
  onClose: () => void;
  onApply: (size: string, sort: string) => void;
}) {
  const [size, setSize] = useState(initialSize);
  const [sort, setSort] = useState(initialSort);
  const [count, setCount] = useState<number | null>(null);
  const untouched = size === initialSize;

  useEffect(() => {
    // Nothing changed: the page already knows the number.
    if (untouched) return;
    let cancelled = false;
    productService
      .getPage({
        categorySlug: category,
        search: query,
        size: (size || undefined) as Size | undefined,
        limit: 1,
      })
      .then((result) => {
        if (!cancelled) setCount(result.total);
      })
      .catch(() => {
        if (!cancelled) setCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, [size, untouched, category, query]);

  const shown = untouched ? total : count;

  return (
    <div className="flex-1 overflow-y-auto px-5 pb-6 pt-1 lg:pt-5">
      <div className="flex items-center justify-between">
        <h2 id="filters-heading" className="text-lg font-black uppercase tracking-tight text-ink">
          Filtrar y ordenar
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="-mr-2 flex h-11 w-11 items-center justify-center text-ink"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <p className="mb-2.5 mt-4 text-xs font-bold uppercase tracking-[0.2em] text-ink">Talla</p>
      <div className="grid grid-cols-4 gap-2">
        {SIZES.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={size === option}
            onClick={() => setSize(size === option ? "" : option)}
            className={`h-12 border text-[13px] font-bold transition-all duration-200 active:scale-95 ${
              size === option
                ? "-translate-y-0.5 border-ink bg-ink text-cream-soft shadow-[0_10px_16px_-10px_rgba(42,31,28,0.6)]"
                : "border-sand bg-white text-ink"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <p className="mb-1 mt-6 text-xs font-bold uppercase tracking-[0.2em] text-ink">Ordenar por</p>
      <div role="radiogroup" aria-label="Ordenar por">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={sort === option.value}
            onClick={() => setSort(option.value)}
            className="flex min-h-[54px] w-full items-center justify-between border-b border-sand/70 text-left text-[14.5px] text-ink"
          >
            {option.label}
            <span
              className={`h-[22px] w-[22px] rounded-full border-2 transition-colors ${
                sort === option.value
                  ? "border-velvet bg-[radial-gradient(var(--color-velvet)_42%,transparent_46%)]"
                  : "border-sand"
              }`}
            />
          </button>
        ))}
      </div>

      <div className="mt-6 flex gap-2.5">
        <button
          type="button"
          onClick={() => {
            setSize("");
            setSort("recientes");
          }}
          className="h-14 border border-sand px-5 text-xs font-bold uppercase tracking-[0.16em] text-ink"
        >
          Limpiar
        </button>
        <button
          type="button"
          onClick={() => onApply(size, sort)}
          className="h-14 flex-1 bg-ink text-xs font-bold uppercase tracking-[0.18em] text-cream-soft transition-colors hover:bg-velvet"
        >
          {shown === null ? "Ver resultados" : `Ver ${shown} pieza${shown === 1 ? "" : "s"}`}
        </button>
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
