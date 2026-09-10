"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { ProductImage } from "@/types/product";
import { ImageLightbox } from "@/components/product/ImageLightbox";

// Portrait crop matching the reference site's own product photography
// (measured live off marsthelabel.com's gallery: 30x45px thumbnails, a
// clean 2:3) — taller than the old 4:5 so the garment actually reads
// instead of looking cropped/squashed.
const IMAGE_RATIO = "aspect-[2/3]";
// Two 2:3 columns side by side (gap is a hairline, negligible for the ratio
// math) — width doubles, height doesn't, so the pair's own box is 4:3.
const PAIR_RATIO = "aspect-[4/3]";

const SLIDE_TRANSITION = { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const };

// A swipe, not a crossfade: the new content slides in from the side the
// shopper is "moving toward" while the old one slides out the opposite
// side, both at once (no `mode="wait"` — that would stall the enter until
// the exit finishes, losing the sliding-past feel).
const slideVariants = {
  enter: (direction: number) => ({ x: direction >= 0 ? "100%" : "-100%" }),
  center: { x: 0 },
  exit: (direction: number) => ({ x: direction >= 0 ? "-100%" : "100%" }),
};

function SlidingBox({
  slideKey,
  direction,
  className,
  children,
}: {
  slideKey: string;
  direction: number;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence custom={direction} initial={false}>
      <motion.div
        key={slideKey}
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={SLIDE_TRANSITION}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function ProductGallery({
  images,
  videoUrl,
  productName,
}: {
  images: ProductImage[];
  videoUrl: string | null;
  productName: string;
}) {
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  function selectIndex(i: number) {
    setDirection(i > primaryIndex ? 1 : i < primaryIndex ? -1 : direction);
    setPrimaryIndex(i);
  }

  // Trivial case (the old, simple layout): a single image and no video —
  // nothing to pick between, so skip the interactive gallery entirely.
  if (!videoUrl && images.length <= 1) {
    const only = images[0];
    return only ? (
      <>
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          aria-label={`Ver imagen de ${productName} en grande`}
          className={`relative block w-full ${IMAGE_RATIO} cursor-zoom-in overflow-hidden bg-sand`}
        >
          <Image
            src={only.src}
            alt={only.alt}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
            priority
          />
        </button>
        <ImageLightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
          productName={productName}
        />
      </>
    ) : null;
  }

  return (
    // `min-w-0` overrides the grid item's default `min-width: auto` — without
    // it, the thumbnail row's `overflow-x-auto` never actually gets to
    // constrain anything: the row (and everything above it) grows to fit
    // every thumbnail instead of scrolling, which was overflowing the whole
    // page sideways on mobile (a real, reported layout bug, not cosmetic).
    <div className="min-w-0">
      {videoUrl ? (
        // Video pinned left, never slides — only the right image changes,
        // so it's a single sliding box, nothing to keep "together" here.
        <div className="grid grid-cols-2 gap-px">
          <div className={`relative ${IMAGE_RATIO} overflow-hidden bg-sand`}>
            <video
              src={videoUrl}
              poster={images[0]?.src}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="h-full w-full object-cover"
            />
          </div>
          <div className={`relative ${IMAGE_RATIO} overflow-hidden bg-sand`}>
            {images[primaryIndex] && (
              <SlidingBox
                slideKey={images[primaryIndex].src}
                direction={direction}
                className="absolute inset-0"
              >
                <button
                  type="button"
                  onClick={() => setLightboxIndex(primaryIndex)}
                  aria-label={`Ver imagen de ${productName} en grande`}
                  className="relative block h-full w-full cursor-zoom-in"
                >
                  <Image
                    src={images[primaryIndex].src}
                    alt={images[primaryIndex].alt}
                    fill
                    sizes="(min-width: 1024px) 22vw, 45vw"
                    className="object-cover"
                    priority
                  />
                </button>
              </SlidingBox>
            )}
          </div>
        </div>
      ) : (
        // No video: clicking a thumbnail pairs it with the next image
        // (wrapping past the end). The pair is ONE sliding unit — both
        // images move together as a single block, not as two elements
        // independently animating — so they're rendered inside one
        // AnimatePresence/motion.div keyed by the pair, with the grid
        // split living *inside* that single sliding box.
        <div className={`relative ${PAIR_RATIO} overflow-hidden bg-sand`}>
          {(() => {
            const leftIndex = primaryIndex;
            const rightIndex = (primaryIndex + 1) % images.length;
            const left = images[leftIndex];
            const right = images[rightIndex];
            return (
              <SlidingBox
                slideKey={`${left.src}|${right.src}`}
                direction={direction}
                className="absolute inset-0 grid grid-cols-2 gap-px"
              >
                <button
                  type="button"
                  onClick={() => setLightboxIndex(leftIndex)}
                  aria-label={`Ver imagen de ${productName} en grande`}
                  className="relative block h-full w-full cursor-zoom-in overflow-hidden bg-sand"
                >
                  <Image
                    src={left.src}
                    alt={left.alt}
                    fill
                    sizes="(min-width: 1024px) 22vw, 45vw"
                    className="object-cover"
                    priority
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxIndex(rightIndex)}
                  aria-label={`Ver imagen de ${productName} en grande`}
                  className="relative block h-full w-full cursor-zoom-in overflow-hidden bg-sand"
                >
                  <Image
                    src={right.src}
                    alt={right.alt}
                    fill
                    sizes="(min-width: 1024px) 22vw, 45vw"
                    className="object-cover"
                    priority
                  />
                </button>
              </SlidingBox>
            );
          })()}
        </div>
      )}

      {images.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((image, i) => {
            const active = videoUrl
              ? i === primaryIndex
              : i === primaryIndex || i === (primaryIndex + 1) % images.length;
            return (
              <button
                key={image.src}
                type="button"
                onClick={() => selectIndex(i)}
                aria-label={`Ver imagen ${i + 1} de ${productName}`}
                aria-pressed={active}
                className={`relative ${IMAGE_RATIO} w-20 shrink-0 overflow-hidden bg-sand transition-opacity duration-300 ${
                  active ? "opacity-100" : "opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={image.src} alt={image.alt} fill sizes="80px" className="object-cover" />
              </button>
            );
          })}
        </div>
      )}

      <ImageLightbox
        images={images}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
        productName={productName}
      />
    </div>
  );
}
