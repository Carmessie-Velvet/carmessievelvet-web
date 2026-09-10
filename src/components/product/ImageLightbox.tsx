"use client";

import { useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useLockBodyScroll, useEscapeKey } from "@/lib/use-lock-body-scroll";
import type { ProductImage } from "@/types/product";

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
          <div className="flex shrink-0 items-center justify-between px-4 py-3 sm:px-6">
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

          <div className="relative flex-1 px-4 pb-2 sm:px-10" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[index!].src}
              alt={images[index!].alt}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate((index! - 1 + images.length) % images.length)}
                  aria-label="Imagen anterior"
                  className="absolute left-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-cream-soft/80 transition-colors hover:text-cream-soft sm:left-3"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-6 w-6" aria-hidden="true">
                    <path d="M15 6l-6 6 6 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate((index! + 1) % images.length)}
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
