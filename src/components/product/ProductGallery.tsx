"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { ProductImage } from "@/types/product";

// Portrait crop matching the reference site's own product photography
// (measured live off marsthelabel.com's gallery: 30x45px thumbnails, a
// clean 2:3) — taller than the old 4:5 so the garment actually reads
// instead of looking cropped/squashed.
const GALLERY_RATIO = "aspect-[2/3]";

const SLIDE_TRANSITION = { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const };

// A swipe, not a crossfade: the new image slides in from the side the
// shopper is "moving toward" while the old one slides out the opposite
// side, both at once (no `mode="wait"` — that would stall the enter until
// the exit finishes, losing the sliding-past feel).
const slideVariants = {
  enter: (direction: number) => ({ x: direction >= 0 ? "100%" : "-100%" }),
  center: { x: 0 },
  exit: (direction: number) => ({ x: direction >= 0 ? "-100%" : "100%" }),
};

function GallerySlot({
  image,
  direction,
  priority,
}: {
  image: ProductImage;
  direction: number;
  priority?: boolean;
}) {
  return (
    <AnimatePresence custom={direction} initial={false}>
      <motion.div
        key={image.src}
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={SLIDE_TRANSITION}
        className="absolute inset-0"
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 22vw, 45vw"
          className="object-cover"
          priority={priority}
        />
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

  function selectIndex(i: number) {
    setDirection(i > primaryIndex ? 1 : i < primaryIndex ? -1 : direction);
    setPrimaryIndex(i);
  }

  // Trivial case (the old, simple layout): a single image and no video —
  // nothing to pick between, so skip the interactive gallery entirely.
  if (!videoUrl && images.length <= 1) {
    const only = images[0];
    return only ? (
      <div className={`relative ${GALLERY_RATIO} overflow-hidden bg-sand`}>
        <Image
          src={only.src}
          alt={only.alt}
          fill
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover"
          priority
        />
      </div>
    ) : null;
  }

  // With a video, it's pinned left and never changes — the right slot picks
  // through `images`. Without one, clicking a thumbnail pairs it with the
  // next image (wrapping past the end) so the layout always shows two.
  const rightImage = videoUrl
    ? images[primaryIndex]
    : images[(primaryIndex + 1) % images.length];
  const leftImage = videoUrl ? undefined : images[primaryIndex];

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <div className={`relative ${GALLERY_RATIO} overflow-hidden bg-sand`}>
          {videoUrl ? (
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
          ) : (
            leftImage && <GallerySlot image={leftImage} direction={direction} priority />
          )}
        </div>
        <div className={`relative ${GALLERY_RATIO} overflow-hidden bg-sand`}>
          {rightImage && <GallerySlot image={rightImage} direction={direction} priority />}
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                className={`relative h-24 w-16 shrink-0 overflow-hidden bg-sand transition-opacity duration-300 ${
                  active ? "opacity-100 ring-2 ring-ink" : "opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={image.src} alt={image.alt} fill sizes="64px" className="object-cover" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
