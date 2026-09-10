"use client";

import { useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useLockBodyScroll, useEscapeKey } from "@/lib/use-lock-body-scroll";
import type { ProductImage } from "@/types/product";

// The image box is sized off viewport *height* (`h-[70vh]` + `aspect-[2/3]`),
// but `sizes` only understands viewport *width* — there's no clean vw
// expression for a height-derived box, so this is a reasonable fixed
// estimate of the widest the box ever renders at. What matters more than
// precision here is that every <Image> in this file (main + both preloads)
// uses the exact same value, so they all resolve to the same optimized
// `/_next/image?...` URL and a preload actually warms the cache the real
// display request will hit.
const LIGHTBOX_IMAGE_SIZES = "600px";

// Full-screen viewer for "let me see that image big" — separate from the
// gallery's own pair/video logic above the fold: always cycles the whole
// `images` array regardless of how the gallery is currently paired, since
// once you're in here you just want to flip through every shot.
export function ImageLightbox({
  images,
  index,
  onClose,
  onNavigate,
  productName,
}: {
  images: ProductImage[];
  /** `null` means closed. */
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
  productName: string;
}) {
  const isOpen = index !== null;

  useLockBodyScroll(isOpen);
  useEscapeKey(onClose, isOpen);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") onNavigate((index! + 1) % images.length);
      if (event.key === "ArrowLeft") onNavigate((index! - 1 + images.length) % images.length);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, index, images.length, onNavigate]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex flex-col bg-ink"
          role="dialog"
          aria-modal="true"
          aria-label={`Imagen ${index! + 1} de ${images.length} de ${productName}`}
          onClick={onClose}
        >
          <div
            className="flex shrink-0 items-center justify-between px-4 py-3 sm:px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-cream-soft/70">
              {index! + 1} / {images.length}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="flex h-9 w-9 items-center justify-center text-cream-soft/80 transition-colors hover:text-cream-soft"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* No stopPropagation here on purpose — clicking the dark area
              around the image (this whole row, minus the image box and the
              arrow buttons below, which each stop their own click) closes
              the viewer, per feedback that the empty space felt dead. */}
          <div className="relative flex flex-1 items-center justify-center px-4 pb-2 sm:px-10">
            <div
              className="relative h-[70vh] max-h-full w-auto max-w-full aspect-[2/3]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[index!].src}
                alt={images[index!].alt}
                fill
                sizes={LIGHTBOX_IMAGE_SIZES}
                className="object-contain"
                priority
              />
            </div>

            {/* Preloaded eagerly (priority skips the lazy/IntersectionObserver
                gate a hidden element would otherwise never satisfy, and
                `fill` + the same `sizes` as the visible image means this
                requests the exact same optimized URL) so the neighbor is
                already cached by the time the shopper clicks — the visible
                swap felt slow purely because it fetched a full-size image
                from scratch on every click. */}
            {images.length > 1 && (
              <div className="relative hidden h-[70vh] aspect-[2/3]" aria-hidden="true">
                <Image
                  src={images[(index! - 1 + images.length) % images.length].src}
                  alt=""
                  fill
                  sizes={LIGHTBOX_IMAGE_SIZES}
                  priority
                />
                <Image
                  src={images[(index! + 1) % images.length].src}
                  alt=""
                  fill
                  sizes={LIGHTBOX_IMAGE_SIZES}
                  priority
                />
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate((index! - 1 + images.length) % images.length);
                  }}
                  aria-label="Imagen anterior"
                  className="absolute left-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-cream-soft/80 transition-colors hover:text-cream-soft sm:left-3"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-6 w-6" aria-hidden="true">
                    <path d="M15 6l-6 6 6 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate((index! + 1) % images.length);
                  }}
                  aria-label="Siguiente imagen"
                  className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-cream-soft/80 transition-colors hover:text-cream-soft sm:right-3"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-6 w-6" aria-hidden="true">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div
              className="flex shrink-0 justify-center gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((image, i) => (
                <button
                  key={image.src}
                  type="button"
                  onClick={() => onNavigate(i)}
                  aria-label={`Ver imagen ${i + 1}`}
                  aria-pressed={i === index}
                  className={`relative h-16 w-11 shrink-0 overflow-hidden transition-opacity ${
                    i === index ? "opacity-100 ring-2 ring-cream-soft" : "opacity-50 hover:opacity-80"
                  }`}
                >
                  <Image src={image.src} alt={image.alt} fill sizes="44px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}