"use client";

import Link from "next/link";
import type { Product } from "@/types/product";
import { Reveal } from "@/components/ui/Reveal";
import { useDragScroll } from "@/lib/use-drag-scroll";

// Section for products with a video (client-managed, `product.videoUrl`) —
// no title/price overlay on the tiles themselves (deliberately as bare as
// the old static reel; the shopper finds out which product it is by
// clicking through). Tile width is intentionally a fraction that doesn't
// divide the row evenly (45%/30%/22%) so the next tile always peeks in at
// the edge — that peek is the only "there's more" affordance; there's no
// visible scrollbar, and the rail only moves by touch/trackpad swipe or by
// clicking and dragging with a mouse (useDragScroll).
export function VideoShowcase({ products }: { products: Product[] }) {
  const { trackRef, dragHandlers } = useDragScroll<HTMLDivElement>();

  if (products.length === 0) return null;

  return (
    <section className="bg-cream py-12 sm:py-16">
      <div className="mx-auto max-w-7xl sm:px-6">
        <div
          ref={trackRef}
          {...dragHandlers}
          className="flex cursor-grab gap-2 overflow-x-auto px-4 [scrollbar-width:none] active:cursor-grabbing sm:gap-3 sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product, i) => (
            <Reveal
              key={product.id}
              delay={i * 0.06}
              className="w-[45%] shrink-0 sm:w-[30%] lg:w-[22%]"
            >
              <Link href={`/producto/${product.slug}`} draggable={false} className="block">
                <div className="relative aspect-[9/16] overflow-hidden bg-sand">
                  <video
                    src={product.videoUrl!}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    draggable={false}
                    className="pointer-events-none h-full w-full object-cover"
                  />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
