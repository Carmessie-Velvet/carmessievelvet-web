"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/types/product";

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

  // Trivial case (the old, simple layout): a single image and no video —
  // nothing to pick between, so skip the interactive gallery entirely.
  if (!videoUrl && images.length <= 1) {
    const only = images[0];
    return only ? (
      <div className="relative aspect-[4/5] overflow-hidden bg-sand">
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
        <div className="relative aspect-[4/5] overflow-hidden bg-sand">
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
          ) : leftImage ? (
            <Image
              src={leftImage.src}
              alt={leftImage.alt}
              fill
              sizes="(min-width: 1024px) 22vw, 45vw"
              className="object-cover"
              priority
            />
          ) : null}
        </div>
        <div className="relative aspect-[4/5] overflow-hidden bg-sand">
          {rightImage && (
            <Image
              src={rightImage.src}
              alt={rightImage.alt}
              fill
              sizes="(min-width: 1024px) 22vw, 45vw"
              className="object-cover"
              priority
            />
          )}
        </div>
      </div>

      {images.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((image, i) => {
            const active = videoUrl
              ? i === primaryIndex
              : i === primaryIndex || i === (primaryIndex + 1) % images.length;
            return (
              <button
                key={image.src}
                type="button"
                onClick={() => setPrimaryIndex(i)}
                aria-label={`Ver imagen ${i + 1} de ${productName}`}
                aria-pressed={active}
                className={`relative h-20 w-16 shrink-0 overflow-hidden bg-sand transition-opacity ${
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
