"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { useCart } from "@/context/cart-context";
import { buttonClasses } from "@/components/ui/Button";
import { clearPendingOrder, readPendingOrder } from "@/lib/pending-order";

type Status = "checking" | "failed" | "unknown";

// Stripe's return_url for confirmPayment() — the browser lands here after any
// off-page confirmation step (3-D Secure challenge, OXXO voucher, SPEI),
// appending payment_intent_client_secret. There's no order state left in
// memory at that point, so this page re-derives the outcome straight from
// Stripe (stripe.retrievePaymentIntent — the same source of truth the
// no-redirect path already trusts) using the hand-off left in sessionStorage
// by handlePay() before it sent the shopper away.
export default function RetornoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clear } = useCart();
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    const clientSecret = searchParams.get("payment_intent_client_secret");
    const pending = readPendingOrder();

    if (!clientSecret || !pending) {
      Promise.resolve().then(() => setStatus("unknown"));
      return;
    }

    let cancelled = false;

    loadStripe(pending.publishableKey)
      .then((stripe) => stripe?.retrievePaymentIntent(clientSecret))
      .then((result) => {
        if (cancelled || !result || result.error || !result.paymentIntent) {
          if (!cancelled) setStatus("failed");
          return;
        }

        const { status: paymentStatus } = result.paymentIntent;
        if (paymentStatus === "succeeded" || paymentStatus === "processing") {
          clear();
          clearPendingOrder();
          router.replace(
            pending.isAuthenticated
              ? `/cuenta/pedidos/${pending.orderId}`
              : `/checkout/confirmacion?order=${encodeURIComponent(pending.orderNumber)}`
          );
          return;
        }

        setStatus("failed");
      })
      .catch(() => {
        if (!cancelled) setStatus("failed");
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams, router, clear]);

  if (status === "failed") {
    return (
      <RetornoLayout title="No se pudo confirmar tu pago">
        <p className="mt-3 text-sm text-ink-muted">
          Intenta de nuevo desde el checkout — tus artículos siguen en el carrito.
        </p>
        <Link href="/checkout" className={`${buttonClasses("solid")} mt-8`}>
          Volver al checkout
        </Link>
      </RetornoLayout>
    );
  }

  if (status === "unknown") {
    return (
      <RetornoLayout title="Revisa el estado de tu pedido">
        <p className="mt-3 text-sm text-ink-muted">
          No pudimos confirmar automáticamente el resultado de tu pago en esta pantalla. Revisa
          tus pedidos para confirmar si se procesó correctamente.
        </p>
        <Link href="/cuenta/pedidos" className={`${buttonClasses("solid")} mt-8`}>
          Ver mis pedidos
        </Link>
      </RetornoLayout>
    );
  }

  return (
    <RetornoLayout title="Confirmando tu pago…">
      <p className="mt-3 text-sm text-ink-muted">Esto solo toma un momento.</p>
    </RetornoLayout>
  );
}

function RetornoLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
      <h1 className="text-2xl font-black uppercase tracking-tight text-ink">{title}</h1>
      {children}
    </div>
  );
}
