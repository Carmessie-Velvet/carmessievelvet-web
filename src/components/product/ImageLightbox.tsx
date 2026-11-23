"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useLockBodyScroll, useEscapeKey } from "@/lib/use-lock-body-scroll";
import { useCart } from "@/context/cart-context";
import { formatCurrency } from "@/lib/format-currency";
import { canPickSizeInline, inlineSizeOptions } from "@/lib/quick-add-options";
import { isSoldOut } from "@/lib/product-stock";
import type { Product, ProductImage, Size } from "@/types/product";

const EASE = [0.22, 0.8, 0.22, 1] as const;
const ZOOM = 2.6;
const DOUBLE_TAP_MS = 320;

interface ZoomState {
  z: number;
  tx: number;
  ty: number;
}
const NO_ZOOM: ZoomState = { z: 1, tx: 0, ty: 0 };

/**
 * Full-screen photo viewer. The photo takes almost the whole screen (8px of
 * margin on a phone), swipes between photos, zooms in (double tap on a phone,
 * click or wheel on desktop) and pans while zoomed. The shopper can also pick
 * a size and add the piece to the cart without closing it — before, the
 * viewer was a dead end: you had to close it to buy.
 *
 * On a phone the buy controls sit in a bar under the thumbnails; on desktop
 * the photo is on the left and name, price, thumbnails and buy controls on
 * the right.
 */
export function ImageLightbox({
  images,
  index: startIndex,
  onClose,
  product,
}: {
  images: ProductImage[];
  /** `null` means closed; otherwise the photo to open on. */
  index: number | null;
  onClose: () => void;
  product: Product;
}) {
  const isOpen = startIndex !== null;
  useLockBodyScroll(isOpen);
  useEscapeKey(onClose, isOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="fixed inset-0 z-[60] bg-[#1d1219] text-white"
          role="dialog"
          aria-modal="true"
          aria-label={`Fotos de ${product.name}`}
        >
          <LightboxBody images={images} startIndex={startIndex} onClose={onClose} product={product} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LightboxBody({
  images,
  startIndex,
  onClose,
  product,
}: {
  images: ProductImage[];
  startIndex: number;
  onClose: () => void;
  product: Product;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const frameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [index, setIndex] = useState(startIndex);
  const [zoom, setZoom] = useState<ZoomState>(NO_ZOOM);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);
  const lastTap = useRef<{ time: number; x: number; y: number } | null>(null);
  const count = images.length;
  const zoomed = zoom.z > 1;

  const goTo = useCallback(
    (next: number, smooth = true) => {
      const track = trackRef.current;
      if (!track) return;
      const clamped = Math.max(0, Math.min(count - 1, next));
      setZoom(NO_ZOOM);
      setIndex(clamped);
      track.scrollTo({ left: clamped * track.clientWidth, behavior: smooth ? "smooth" : "auto" });
    },
    [count]
  );

  // Land on the photo that was tapped, without animating there (DOM only).
  useEffect(() => {
    const track = trackRef.current;
    if (track) track.scrollTo({ left: startIndex * track.clientWidth, behavior: "auto" });
  }, [startIndex]);

  // Keyboard: arrows change photo.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") goTo(index + 1);
      if (event.key === "ArrowLeft") goTo(index - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, goTo]);

  function handleScroll() {
    const track = trackRef.current;
    if (!track || zoomed) return;
    const next = Math.round(track.scrollLeft / track.clientWidth);
    if (next !== index) setIndex(next);
  }

  /** Keeps a zoomed photo from being dragged out of its frame. */
  function clamp(next: ZoomState): ZoomState {
    const frame = frameRefs.current[index];
    if (!frame || next.z <= 1) return next.z <= 1 ? NO_ZOOM : next;
    const img = frame.querySelector("img");
    const cw = frame.clientWidth;
    const ch = frame.clientHeight;
    const ratio =
      img && img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 0.75;
    const displayedW = Math.min(cw, ch * ratio);
    const displayedH = Math.min(ch, cw / ratio);
    const maxX = Math.max(0, (displayedW * next.z - cw) / 2);
    const maxY = Math.max(0, (displayedH * next.z - ch) / 2);
    return {
      z: next.z,
      tx: Math.max(-maxX, Math.min(maxX, next.tx)),
      ty: Math.max(-maxY, Math.min(maxY, next.ty)),
    };
  }

  function zoomAt(clientX: number | null, clientY: number | null) {
    if (zoomed) {
      setZoom(NO_ZOOM);
      return;
    }
    const frame = frameRefs.current[index];
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    const cx = clientX === null ? 0 : clientX - (rect.left + rect.width / 2);
    const cy = clientY === null ? 0 : clientY - (rect.top + rect.height / 2);
    setZoom(clamp({ z: ZOOM, tx: -cx * (ZOOM - 1), ty: -cy * (ZOOM - 1) }));
  }

  function handlePointerDown(event: React.PointerEvent) {
    moved.current = false;
    if (!zoomed) return;
    dragStart.current = { x: event.clientX - zoom.tx, y: event.clientY - zoom.ty };
    setDragging(true);
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent) {
    const start = dragStart.current;
    if (!start) return;
    const next = { z: zoom.z, tx: event.clientX - start.x, ty: event.clientY - start.y };
    if (Math.abs(next.tx - zoom.tx) + Math.abs(next.ty - zoom.ty) > 3) moved.current = true;
    setZoom(clamp(next));
  }

  function handlePointerUp(event: React.PointerEvent) {
    dragStart.current = null;
    setDragging(false);
    // A tap, not a drag. Mouse: one click zooms. Touch: two quick taps.
    if (moved.current) return;
    if (event.pointerType === "mouse") {
      zoomAt(event.clientX, event.clientY);
      return;
    }
    const now = performance.now();
    const previous = lastTap.current;
    if (
      previous &&
      now - previous.time < DOUBLE_TAP_MS &&
      Math.hypot(event.clientX - previous.x, event.clientY - previous.y) < 40
    ) {
      lastTap.current = null;
      zoomAt(event.clientX, event.clientY);
    } else {
      lastTap.current = { time: now, x: event.clientX, y: event.clientY };
    }
  }

  function handleWheel(event: React.WheelEvent) {
    const factor = event.deltaY < 0 ? 1.18 : 1 / 1.18;
    const z = Math.max(1, Math.min(4, zoom.z * factor));
    setZoom(z <= 1.02 ? NO_ZOOM : clamp({ ...zoom, z }));
  }

  return (
    <div className="absolute inset-0 flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:grid-rows-[auto_minmax(0,1fr)]">
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between gap-2.5 px-3.5 py-3 lg:col-span-2 lg:px-7 lg:py-4">
        <span className="rounded-full bg-white/10 px-3.5 py-2.5 text-[11.5px] font-bold tracking-[0.16em]">
          {index + 1} / {count}
        </span>
        <span className="min-w-0 flex-1 truncate text-center text-xs font-bold uppercase tracking-[0.16em] text-white/75 lg:hidden">
          {product.name}
        </span>
        <div className="flex gap-2">
          <ToolButton label={zoomed ? "Alejar" : "Acercar"} onClick={() => zoomAt(null, null)}>
            <circle cx="11" cy="11" r="6.5" />
            <path d="M20 20l-4.2-4.2M8.5 11h5M11 8.5v5" />
          </ToolButton>
          <ToolButton label="Cerrar" onClick={onClose}>
            <path d="M6 6l12 12M18 6L6 18" />
          </ToolButton>
        </div>
      </div>

      {/* Stage: the photos */}
      <div className="relative min-h-0 flex-1 lg:col-start-1 lg:row-start-2">
        <motion.div
          ref={trackRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: EASE }}
          onScroll={handleScroll}
          className={`absolute inset-0 flex snap-x snap-mandatory overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            zoomed ? "overflow-x-hidden" : "overflow-x-auto"
          }`}
        >
          {images.map((image, i) => (
            <div key={image.src} className="relative h-full w-full shrink-0 snap-center">
              <div
                className={`absolute inset-0 overflow-hidden ${zoomed ? "touch-none" : "touch-pan-x"}`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={() => {
                  dragStart.current = null;
                  setDragging(false);
                }}
                onWheel={handleWheel}
              >
                {/* The frame is what moves and scales when zoomed; the photo
                    inside just fills it (next/image's `fill` sets its own
                    inline size, so it can't carry the margin itself). */}
                <div
                  ref={(el) => {
                    frameRefs.current[i] = el;
                  }}
                  className={`absolute inset-2 lg:inset-3 ${
                    i === index && zoomed
                      ? dragging
                        ? "cursor-grabbing"
                        : "cursor-grab transition-transform duration-[550ms] ease-[var(--ease-soft)]"
                      : "cursor-zoom-in transition-transform duration-[550ms] ease-[var(--ease-soft)]"
                  }`}
                  style={
                    i === index && zoomed
                      ? { transform: `translate(${zoom.tx}px, ${zoom.ty}px) scale(${zoom.z})` }
                      : undefined
                  }
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 1024px) 70vw, 100vw"
                    quality={85}
                    loading="eager"
                    draggable={false}
                    className="select-none object-contain"
                  />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {count > 1 && (
          <>
            <ArrowButton direction="prev" onClick={() => goTo(index - 1)} disabled={index === 0} />
            <ArrowButton direction="next" onClick={() => goTo(index + 1)} disabled={index === count - 1} />
          </>
        )}

        <p
          key={zoomed ? "z" : "n"}
          className="pointer-events-none absolute bottom-3 left-1/2 z-10 whitespace-nowrap rounded-full bg-[rgba(20,10,16,0.62)] px-3.5 py-2 text-[10.5px] uppercase tracking-[0.14em] text-white opacity-0 motion-safe:animate-[hint-fade_4.5s_var(--ease-soft)_1s_both]"
        >
          <span className="lg:hidden">Toca dos veces para acercar</span>
          <span className="hidden lg:inline">Clic para acercar · ← → para cambiar de foto</span>
        </p>
      </div>

      {/* Thumbnails + buy controls (side panel on desktop) */}
      <div className="flex shrink-0 flex-col lg:col-start-2 lg:row-start-2 lg:justify-center lg:gap-6 lg:px-10 lg:pb-8 lg:pl-3">
        <div className="hidden lg:block">
          <p className="text-2xl font-black uppercase leading-[1.1] tracking-tight">{product.name}</p>
          <p className="mt-2 text-[19px] font-extrabold">{formatCurrency(product.price)}</p>
        </div>

        {count > 1 && (
          <div className="flex justify-center gap-2 px-3.5 pb-2 pt-2.5 lg:justify-start lg:p-0 lg:gap-2.5">
            {images.map((image, i) => (
              <button
                key={image.src}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-pressed={i === index}
                className={`relative h-[62px] w-12 overflow-hidden border-[1.5px] transition-all duration-300 lg:h-[84px] lg:w-16 ${
                  i === index
                    ? "-translate-y-[3px] border-white opacity-100"
                    : "border-transparent opacity-50 hover:opacity-80"
                }`}
              >
                <Image src={image.src} alt="" fill sizes="64px" draggable={false} className="object-cover" />
              </button>
            ))}
          </div>
        )}

        <BuyControls product={product} onClose={onClose} />
      </div>
    </div>
  );
}

function ToolButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-all duration-300 hover:bg-white/20 active:scale-90"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true">
        {children}
      </svg>
    </button>
  );
}

function ArrowButton({
  direction,
  onClick,
  disabled,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Foto anterior" : "Foto siguiente"}
      className={`absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/25 disabled:opacity-30 lg:flex ${
        direction === "prev" ? "left-3.5" : "right-3.5"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className={`h-5 w-5 ${direction === "prev" ? "-scale-x-100" : ""}`}
        aria-hidden="true"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </button>
  );
}

/**
 * Size chips and the add-to-cart button, inside the viewer. Only a single
 * piece in one color can be bought from here (a size is all it needs); a set
 * (a size per piece) or a piece in several colors sends the shopper to the
 * purchase form on the page instead.
 */
function BuyControls({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addItem, openDrawer } = useCart();
  const [size, setSize] = useState<Size | null>(null);
  const [shake, setShake] = useState(0);
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inline = canPickSizeInline(product);
  const { options, color } = inlineSizeOptions(product);
  const soldOut = isSoldOut(product);

  useEffect(
    () => () => {
      if (addedTimer.current) clearTimeout(addedTimer.current);
    },
    []
  );

  function goToForm() {
    onClose();
    // After the viewer's exit animation has started, so the page can scroll.
    setTimeout(() => {
      document.getElementById("comprar")?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 250);
  }

  function handleAdd() {
    if (added) {
      onClose();
      openDrawer();
      return;
    }
    if (!size) {
      setShake((n) => n + 1);
      return;
    }
    addItem(product, { size, color });
    setAdded(true);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 4500);
  }

  if (soldOut) {
    return (
      <div className="px-3.5 pb-4 pt-2 lg:p-0">
        <p className="flex h-[52px] items-center justify-center bg-white/10 text-[11.5px] font-bold uppercase tracking-[0.16em] text-white/70">
          Agotado
        </p>
      </div>
    );
  }

  return (
    <div className="px-3.5 pb-4 pt-2 lg:p-0">
      {inline && (
        <motion.div
          key={shake}
          animate={shake ? { x: [0, -7, 6, -4, 3, 0] } : undefined}
          transition={{ duration: 0.5 }}
          className="mb-2.5 flex gap-2 lg:mb-3.5"
        >
          {options.map((option) => (
            <button
              key={option.size}
              type="button"
              disabled={!option.available}
              onClick={() => setSize(option.size)}
              aria-pressed={size === option.size}
              className={`h-[46px] flex-1 border-[1.5px] text-[13px] font-bold transition-all duration-300 ${
                !option.available
                  ? "cursor-not-allowed border-white/15 text-white/30 line-through"
                  : size === option.size
                    ? "-translate-y-[3px] border-white bg-white text-ink"
                    : "border-white/30 text-white hover:border-white"
              }`}
            >
              {option.size}
            </button>
          ))}
        </motion.div>
      )}

      <div className="flex items-center gap-3.5">
        <div className="min-w-0 flex-1 lg:hidden">
          <p className="truncate text-xs font-bold uppercase tracking-[0.06em]">{product.name}</p>
          <p className="text-[15px] font-extrabold">{formatCurrency(product.price)}</p>
        </div>
        {inline ? (
          <button
            type="button"
            onClick={handleAdd}
            className={`h-[52px] shrink-0 basis-[54%] text-[11.5px] font-bold uppercase tracking-[0.16em] transition-colors duration-300 lg:basis-full ${
              added
                ? "bg-[#2f6f4a] text-white"
                : size
                  ? "bg-white text-velvet hover:bg-cream"
                  : "bg-white/55 text-velvet"
            }`}
          >
            {added ? "✓ Agregado · Ver carrito" : size ? "Agregar al carrito" : "Elige tu talla"}
          </button>
        ) : (
          <button
            type="button"
            onClick={goToForm}
            className="h-[52px] shrink-0 basis-[54%] bg-white text-[11.5px] font-bold uppercase tracking-[0.16em] text-velvet transition-colors hover:bg-cream lg:basis-full"
          >
            {product.category.type === "SET" ? "Elegir talla y color" : "Elegir color y talla"}
          </button>
        )}
      </div>
    </div>
  );
}
