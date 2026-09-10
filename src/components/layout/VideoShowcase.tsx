"use client";

import { useRef } from "react";
import Link from "next/link";
import type { Product } from "@/types/product";
import { Reveal } from "@/components/ui/Reveal";

// Distinguishing "tapping the tile" from "dragging the rail to scroll" by
// distance alone kept eating real clicks (reported live, twice — first at
// a 6px threshold, still broken at 15px): a real mousedown→mouseup or
// touch tap routinely lands more than a few pixels apart with zero intent
// to drag, and exactly how much varies a lot by input device (trackpad
// tap-to-click especially). Duration is a much more reliable signal — an
// intentional drag-to-scroll is a *sustained* motion, not an instant.
// Below DRAG_TIME_THRESHOLD_MS, it's a click no matter how much the
// cursor wandered; past it, fall back to distance so a genuine slow drag
// that ends up not moving far still doesn't accidentally navigate.
const DRAG_TIME_THRESHOLD_MS = 300;
const DRAG_DISTANCE_THRESHOLD = 15;

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
  const drag = useRef({ dragging: false, startX: 0, startScrollLeft: 0, moved: 0, startTime: 0 });

  if (products.length === 0) return null;

  // No setPointerCapture here on purpose — it doesn't buy much for a
  // compact row like this (pointermove keeps bubbling from any tile inside
  // the track regardless), and it throws in real, non-synthetic edge cases
  // (e.g. the browser already released the pointer for another reason),
  // which is exactly the kind of uncaught error that shouldn't be anywhere
  // near "did the shopper's click register."
  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const track = trackRef.current;
    if (!track) return;
    drag.current = {
      dragging: true,
      startX: e.clientX,
      startScrollLeft: track.scrollLeft,
      moved: 0,
      startTime: performance.now(),
    };
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const track = trackRef.current;
    if (!track || !drag.current.dragging) return;
    const delta = e.clientX - drag.current.startX;
    drag.current.moved = Math.max(drag.current.moved, Math.abs(delta));
    track.scrollLeft = drag.current.startScrollLeft - delta;
  }

  function handlePointerUp() {
    drag.current.dragging = false;
  }

  function handleClickCapture(e: React.MouseEvent) {
    const elapsed = performance.now() - drag.current.startTime;
    const wasDrag = elapsed >= DRAG_TIME_THRESHOLD_MS && drag.current.moved > DRAG_DISTANCE_THRESHOLD;
    if (wasDrag) {
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
