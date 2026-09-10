import { useRef } from "react";

// Distinguishing "tapping a tile" from "dragging the rail to scroll" by
// distance alone eats real clicks/taps — a genuine tap routinely lands a
// few pixels off, and how much varies a lot by input device. Duration is
// the reliable signal: below this, it's a click no matter how far the
// cursor wandered; past it, distance decides. See VideoShowcase, where
// this was worked out against two rounds of real click-through bugs.
const DRAG_TIME_THRESHOLD_MS = 300;
const DRAG_DISTANCE_THRESHOLD = 15;

/**
 * Manual pointer-driven horizontal drag-to-scroll for a rail with no
 * visible scrollbar — mouse-drag and touch-swipe both move the track, and
 * a real tap/click still reaches its target underneath. No
 * `setPointerCapture`: it throws for pointer events that don't originate
 * from genuine hardware input, which isn't worth the tradeoff for a
 * compact rail like this (pointermove keeps bubbling from any child
 * inside the track regardless).
 */
export function useDragScroll<T extends HTMLElement>() {
  const trackRef = useRef<T>(null);
  const drag = useRef({ dragging: false, startX: 0, startScrollLeft: 0, moved: 0, startTime: 0 });

  function handlePointerDown(e: React.PointerEvent) {
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

  function handlePointerMove(e: React.PointerEvent) {
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

  return {
    trackRef,
    dragHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerUp,
      onClickCapture: handleClickCapture,
    },
  };
}
