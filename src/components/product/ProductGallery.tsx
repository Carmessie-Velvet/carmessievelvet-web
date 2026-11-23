"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { Product, ProductImage } from "@/types/product";
import { ImageLightbox } from "@/components/product/ImageLightbox";
import { useDragScroll } from "@/lib/use-drag-scroll";

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

/** The two-up layout used from `sm` (tablet and desktop) upward. */
function DesktopGallery({
  images,
  videoUrl,
  productName,
  onOpen,
}: {
  images: ProductImage[];
  videoUrl: string | null;
  productName: string;
  onOpen: (index: number) => void;
}) {
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const { trackRef, dragHandlers } = useDragScroll<HTMLDivElement>();

  function selectIndex(i: number) {
    setDirection(i > primaryIndex ? 1 : i < primaryIndex ? -1 : direction);
    setPrimaryIndex(i);
  }

  // Trivial case (the old, simple layout): a single image and no video —
  // nothing to pick between, so skip the interactive gallery entirely.
  if (!videoUrl && images.length <= 1) {
    const only = images[0];
    return only ? (
      <button
        type="button"
        onClick={() => onOpen(0)}
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
                  onClick={() => onOpen(primaryIndex)}
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
                  onClick={() => onOpen(leftIndex)}
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
                  onClick={() => onOpen(rightIndex)}
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
        <div
          ref={trackRef}
          {...dragHandlers}
          className="mt-2 flex cursor-grab gap-2 overflow-x-auto [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
        >
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
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="80px"
                  draggable={false}
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
}

/**
 * Phone gallery: one big photo at a time, edge to edge (the client asked for
 * large photos), swiped sideways with a counter and dots. A product with a
 * video starts on it. Tapping a photo opens the viewer. Before, a phone got
 * the same two half-width photos as desktop.
 */
function MobileGallery({
  images,
  videoUrl,
  productName,
  onOpen,
}: {
  images: ProductImage[];
  videoUrl: string | null;
  productName: string;
  onOpen: (index: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [slide, setSlide] = useState(0);
  const offset = videoUrl ? 1 : 0;
  const total = images.length + offset;

  // The video only plays while it is the slide on screen.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (slide === 0) video.play().catch(() => {});
    else video.pause();
  }, [slide]);

  function handleScroll() {
    const track = trackRef.current;
    if (!track) return;
    setSlide(Math.round(track.scrollLeft / track.clientWidth));
  }

  return (
    <div className="-mx-4 sm:hidden">
      <div className="relative">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {videoUrl && (
            <div className="relative aspect-[3/4] w-full shrink-0 snap-center overflow-hidden bg-sand">
              <video
                ref={videoRef}
                src={videoUrl}
                poster={images[0]?.src}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
              />
            </div>
          )}
          {images.map((image, i) => (
            <button
              key={image.src}
              type="button"
              onClick={() => onOpen(i)}
              aria-label={`Ver imagen ${i + 1} de ${productName} en grande`}
              className="relative aspect-[3/4] w-full shrink-0 snap-center overflow-hidden bg-sand"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="100vw"
                className="object-cover"
                priority={i === 0}
                draggable={false}
              />
            </button>
          ))}
        </div>
        {total > 1 && (
          <span className="pointer-events-none absolute bottom-3.5 right-3 bg-[rgba(36,25,21,0.6)] px-2.5 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-white backdrop-blur-sm">
            {slide + 1} / {total}
          </span>
        )}
      </div>
      {total > 1 && (
        <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
          {Array.from({ length: total }, (_, i) => (
            <i
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === slide ? "w-5 bg-velvet" : "w-1.5 bg-sand"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductGallery({
  product,
}: {
  product: Product;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { images, videoUrl, name } = product;

  return (
    <>
      <MobileGallery images={images} videoUrl={videoUrl} productName={name} onOpen={setLightboxIndex} />
      <div className="hidden sm:block">
        <DesktopGallery images={images} videoUrl={videoUrl} productName={name} onOpen={setLightboxIndex} />
      </div>
      {images.length > 0 && (
        <ImageLightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          product={product}
        />
      )}
    </>
  );
}
