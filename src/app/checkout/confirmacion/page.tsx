"use client";

import Link from "next/link";
import { use, useRef, useState } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { getLeadTime } from "@/lib/lead-time";
import { INSTAGRAM_URL } from "@/lib/nav-links";

export default function ConfirmacionPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = use(searchParams);
  const { weeks } = getLeadTime();

  // The official CM- folio is only assigned once the payment is confirmed, so
  // it doubles as the signal that the payment went through. Anything else (the
  // TMP- placeholder — an OXXO/SPEI payment still waiting on the shopper, or a
  // confirmation call that didn't get through) must not claim the payment is
  // settled.
  const isConfirmed = !!order?.startsWith("CM-");

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 pb-16 pt-12 text-center sm:px-6 sm:pt-20">
      <span
        className={`flex h-16 w-16 items-center justify-center rounded-full ${
          isConfirmed ? "bg-ink text-cream-soft" : "bg-sand text-ink"
        }`}
        aria-hidden="true"
      >
        {isConfirmed ? <CheckIcon /> : <ClockIcon />}
      </span>

      <h1 className="mt-6 text-3xl font-black uppercase leading-[1.05] tracking-tight text-ink sm:text-4xl">
        ¡Gracias por tu compra!
      </h1>

      {order && (
        <div className="mt-7 w-full border border-sand bg-paper px-6 py-5">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">
            {isConfirmed ? "Número de pedido" : "Folio temporal"}
          </p>
          <p className="mt-1 text-3xl font-black tracking-tight text-ink">{order}</p>
          <CopyButton value={order} />
        </div>
      )}

      <p className="mt-5 text-sm leading-relaxed text-ink-muted">
        {isConfirmed
          ? "Pago confirmado. Guarda tu número de pedido — al no tener cuenta, es la única forma de identificarlo."
          : "Tu pago se está confirmando. Este folio es temporal: te enviaremos tu número de pedido por correo cuando se confirme el pago. Guárdalo — junto con tu correo, te permite consultar tu pedido."}
      </p>

      <ol className="mt-9 w-full border border-sand bg-paper p-5 text-left" aria-label="Qué sigue">
        <Step
          number={1}
          done={isConfirmed}
          title={isConfirmed ? "Pago confirmado" : "Confirmando tu pago"}
          text={isConfirmed ? "Recibimos tu pago y tu pedido ya está en cola." : "Te avisamos por correo en cuanto se acredite."}
        />
        <Step
          number={2}
          title="Elaboramos tu pieza"
          text={`Cada prenda se hace después de tu compra. Considera ${weeks} de elaboración.`}
        />
        <Step
          number={3}
          title="Te la enviamos"
          text="Te escribimos con tu número de guía en cuanto salga. Envíos a todo México."
          last
        />
      </ol>

      <div className="mt-8 flex w-full flex-col gap-3">
        {order && (
          <Link
            href={`/rastrear-pedido?pedido=${encodeURIComponent(order)}`}
            className={buttonClasses("solid", "h-[52px] w-full")}
          >
            Ver estado de mi pedido
          </Link>
        )}
        <Link
          href="/tienda"
          className={buttonClasses(order ? "outline" : "solid", "h-[52px] w-full")}
        >
          Seguir comprando
        </Link>
      </div>

      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex h-11 items-center text-xs font-medium uppercase tracking-[0.14em] text-ink-muted underline-offset-4 transition-colors hover:text-velvet hover:underline"
      >
        Síguenos en Instagram
      </a>
    </div>
  );
}

function Step({
  number,
  title,
  text,
  done = false,
  last = false,
}: {
  number: number;
  title: string;
  text: string;
  done?: boolean;
  last?: boolean;
}) {
  return (
    <li className="relative flex gap-4 pb-5 last:pb-0">
      {!last && (
        <span className="absolute left-[15px] top-8 h-[calc(100%-2rem)] w-px bg-sand" aria-hidden="true" />
      )}
      <span
        className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          done ? "bg-ink text-cream-soft" : "border border-sand bg-cream-soft text-ink-muted"
        }`}
      >
        {done ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="h-4 w-4" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        ) : (
          number
        )}
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">{text}</p>
      </div>
    </li>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the number is still on screen to copy by hand.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="mx-auto mt-2 flex h-11 items-center px-3 text-xs font-medium uppercase tracking-[0.14em] text-ink-muted underline-offset-4 transition-colors hover:text-velvet hover:underline"
    >
      {copied ? "Copiado" : "Copiar número"}
    </button>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-8 w-8" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-8 w-8" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
