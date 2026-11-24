"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePurchaseWindow } from "@/lib/use-purchase-window";
import { describeOpenDays, formatCountdown } from "@/lib/purchase-window";
import { getLeadTime } from "@/lib/lead-time";

// How long each message stays before the next one slides in.
const ROTATE_MS = 3600;

type Tone = "ink" | "velvet" | "ember";

const TONE_CLASS: Record<Tone, string> = {
  ink: "bg-ink",
  velvet: "bg-velvet",
  // Deliberately outside the cream/ink/velvet palette — the closed state is
  // the one message the client wants to read as its own "pay attention"
  // signal (see --color-ember in globals.css), so the whole bar takes it on
  // while that message is showing.
  ember: "bg-ember",
};

interface Message {
  key: string;
  tone: Tone;
  node: ReactNode;
}

/**
 * The single bar above the header. It replaces what used to be two stacked
 * bars (the order-window banner and the shipping/lead-time announcement):
 * the same three messages now take turns in 32px instead of using 76px of a
 * phone's screen. The bar pauses while the pointer or keyboard focus is on
 * it, so the "¿Cómo funciona?" tooltip never disappears under the cursor.
 *
 * Height is fixed (`--topbar-h`, globals.css): `--header-stack-height` is
 * computed from it, and a taller render would leave a gap between the fixed
 * stack and the page content below it.
 */
export function TopBar() {
  const purchaseWindow = usePurchaseWindow();
  const { weeks, campaign } = getLeadTime();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const messages: Message[] = [];

  // Until the first status fetch resolves there is nothing honest to say
  // about the order window (and rendering a guess would risk a hydration
  // mismatch against the client's clock) — the other two messages cover it.
  if (purchaseWindow) {
    const neverCloses = purchaseWindow.closedDays.length === 0;
    messages.push({
      key: "status",
      tone: purchaseWindow.isOpen ? "velvet" : "ember",
      node: (
        <>
          <span className="flex shrink-0 items-center gap-1.5 font-bold">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-cream-soft motion-safe:animate-[soft-pulse_1.8s_ease-in-out_infinite]"
              aria-hidden="true"
            />
            {purchaseWindow.isOpen ? "Pedidos abiertos" : "Pedidos cerrados"}
          </span>
          {purchaseWindow.secondsRemaining !== null && (
            <span className="shrink-0 tabular-nums opacity-90">
              {purchaseWindow.isOpen ? "Cierra en " : "Abren en "}
              {formatCountdown(purchaseWindow.secondsRemaining)}
            </span>
          )}
          {/* No `relative` here on purpose: the tooltip positions against the
              (full-width) message row, so on a phone it is centered in the
              screen instead of hanging off the right edge and making the page
              scroll sideways. */}
          <span className="group/info flex shrink-0">
            <button
              type="button"
              aria-label="Cómo funciona el horario de pedidos"
              className="flex h-4 w-4 items-center justify-center rounded-full border border-cream-soft/60 text-[9px] font-bold leading-none text-cream-soft/90 transition-colors hover:border-cream-soft hover:text-cream-soft"
            >
              i
            </button>
            <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 block w-72 max-w-[calc(100vw-2rem)] -translate-x-1/2 border border-sand bg-paper p-4 text-left font-normal normal-case tracking-normal text-ink opacity-0 shadow-[0_16px_40px_-12px_rgba(42,31,28,0.35)] transition-opacity duration-150 group-hover/info:opacity-100 group-focus-within/info:opacity-100">
              <span className="block text-xs font-bold uppercase tracking-[0.14em] text-ink">
                ¿Cómo funciona?
              </span>
              <span className="mt-2 block text-xs leading-relaxed text-ink-muted">
                {neverCloses
                  ? "Por ahora procesamos pedidos todos los días, sin restricción de horario."
                  : `Procesamos pedidos ${describeOpenDays(purchaseWindow.closedDays)}. Puedes armar y ajustar tu carrito cualquier día — el pago se habilita únicamente en esas fechas.`}
              </span>
            </span>
          </span>
        </>
      ),
    });
  }

  messages.push({
    key: "shipping",
    tone: "ink",
    node: <span>{campaign ?? "Envíos a todo México"}</span>,
  });
  messages.push({
    key: "lead",
    tone: "ink",
    node: <span>Hecho sobre pedido · {weeks}</span>,
  });

  useEffect(() => {
    if (paused || messages.length < 2) return;
    const id = setInterval(() => setIndex((i) => i + 1), ROTATE_MS);
    return () => clearInterval(id);
    // `messages.length` changes once, when the order-window status resolves.
  }, [paused, messages.length]);

  const active = index % messages.length;
  const tone = messages[active].tone;

  return (
    <div
      className={`relative h-[var(--topbar-h)] text-cream-soft transition-colors duration-500 ${TONE_CLASS[tone]}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {messages.map((message, i) => (
        <div
          key={message.key}
          aria-hidden={i !== active}
          inert={i !== active}
          // The one leaving fades out quickly and the one arriving waits for it,
          // so the two lines never sit on top of each other mid-change.
          className={`absolute inset-0 flex items-center justify-center gap-2 px-3 text-center text-[10px] font-medium uppercase tracking-[0.16em] transition-all ease-[var(--ease-soft)] sm:text-[11px] sm:tracking-[0.2em] ${
            i === active
              ? "translate-y-0 opacity-100 delay-[220ms] duration-500"
              : "pointer-events-none translate-y-2 opacity-0 delay-0 duration-200"
          }`}
        >
          {message.node}
        </div>
      ))}
    </div>
  );
}
