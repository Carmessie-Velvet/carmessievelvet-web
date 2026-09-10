"use client";

import { usePurchaseWindow } from "@/lib/use-purchase-window";
import { describeOpenDays, formatCountdown } from "@/lib/purchase-window";

// Part of the fixed header stack (see layout.tsx) — always on screen, not
// just at the top of the page, per feedback that it needs to stay "top of
// mind" while scrolling. Height must stay a fixed h-10 no matter the state
// (open/closed/still-mounting) — --header-stack-height in globals.css is
// computed assuming this exact height, and a taller render would leave a
// visible gap between the fixed stack and the page content below it.
export function PurchaseWindowBanner() {
  const state = usePurchaseWindow();

  // Nothing to show yet (avoids a hydration mismatch against the client's
  // real clock) — still reserve the slot so the layout never jumps once it
  // resolves a tick later.
  if (!state) return <div className="h-10 bg-ink" aria-hidden="true" />;

  const openDaysText = describeOpenDays(state.closedDays);
  const neverCloses = state.closedDays.length === 0;

  return (
    <div
      role="status"
      className={`relative flex h-10 items-center justify-center gap-2 px-3 text-center text-cream-soft ${
        state.isOpen ? "bg-velvet" : "bg-ember"
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-20 motion-reduce:hidden"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, rgba(255,255,255,0.4) 0 2px, transparent 2px 12px)",
          animation: "purchase-window-shimmer 2.2s linear infinite",
        }}
        aria-hidden="true"
      />

      <span className="relative flex shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] sm:text-xs sm:tracking-[0.16em]">
        <span
          className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-cream-soft"
          aria-hidden="true"
        />
        {state.isOpen ? "Pedidos abiertos" : "Pedidos cerrados"}
      </span>

      {state.secondsRemaining !== null && (
        <span
          className={`relative shrink-0 tabular-nums text-[10px] sm:text-xs ${
            state.isOpen ? "text-cream-soft/85" : "font-bold text-cream-soft"
          }`}
        >
          {state.isOpen ? "Cierra en " : "Abren en "}
          {formatCountdown(state.secondsRemaining)}
        </span>
      )}

      <div className="group/info relative flex shrink-0">
        <button
          type="button"
          aria-label="Cómo funciona el horario de pedidos"
          className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-cream-soft/60 text-[9px] font-bold leading-none text-cream-soft/90 transition-colors hover:border-cream-soft hover:text-cream-soft"
        >
          i
        </button>

        {/* Hover/focus reveal, same pattern as ProductCard's wishlist
            tooltip — no click needed, so it works the instant the cursor
            reaches the icon. */}
        <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-72 -translate-x-1/2 border border-sand bg-paper p-4 text-left text-ink opacity-0 shadow-[0_16px_40px_-12px_rgba(42,31,28,0.35)] transition-opacity duration-150 group-hover/info:opacity-100 group-focus-within/info:opacity-100">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink">
            ¿Cómo funciona?
          </p>
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">
            {neverCloses
              ? "Por ahora procesamos pedidos todos los días, sin restricción de horario."
              : `Procesamos pedidos ${openDaysText}. Puedes armar y ajustar tu carrito cualquier
            día — el pago se habilita únicamente en esas fechas.`}
          </p>
        </div>
      </div>
    </div>
  );
}
