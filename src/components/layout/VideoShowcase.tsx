"use client";

import { useRef } from "react";
import Link from "next/link";
import type { Product } from "@/types/product";
import { Reveal } from "@/components/ui/Reveal";

// A drag past this many pixels counts as "scrolling", not "tapping the
// tile" — past it, the click that would otherwise follow pointerup is
// suppressed so dragging the rail never accidentally navigates.
const DRAG_CLICK_THRESHOLD = 6;

// Section for products with a video (client-managed, `product.videoUrl`) —
// no title/price overlay on the tiles themselves (deliberately as bare as
// the old static reel; the shopper finds out which product it is by
// clicking through). Tile width is intentionally a fraction that doesn't
// divide the row evenly (45%/30%/22%) so the next tile always peeks in at
// the edge — that peek is the only "there's more" affordance; there's no
// visible scrollbar, and the rail only moves by touch/trackpad swipe or by
// clicking and dragging with a mouse (handled below).
export function VideoShowcase({ products }: { products: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ dragging: false, startX: 0, startScrollLeft: 0, moved: 0 });

  if (products.length === 0) return null;

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const track = trackRef.current;
    if (!track) return;
    drag.current = { dragging: true, startX: e.clientX, startScrollLeft: track.scrollLeft, moved: 0 };
    track.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const track = trackRef.current;
    if (!track || !drag.current.dragging) return;
    const delta = e.clientX - drag.current.startX;
    drag.current.moved = Math.max(drag.current.moved, Math.abs(delta));
    track.scrollLeft = drag.current.startScrollLeft - delta;
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    trackRef.current?.releasePointerCapture(e.pointerId);
    drag.current.dragging = false;
  }

  function handleClickCapture(e: React.MouseEvent) {
    if (drag.current.moved > DRAG_CLICK_THRESHOLD) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  return (
    <section className="bg-cream py-12 sm:py-16">
      <div className="mx-auto max-w-7xl sm:px-6">
        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onClickCapture={handleClickCapture}
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
