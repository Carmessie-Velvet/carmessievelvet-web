"use client";

import { useState } from "react";
import { ReturnRequestForm } from "@/components/devoluciones/ReturnRequestForm";
import { buttonClasses } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/format-currency";
import type { Order } from "@/types/order";

const REFUND_MODE_LABELS: Record<string, string> = {
  FULL: "reembolso total",
  FULL_MINUS_SHIPPING: "reembolso total menos el envío",
  PARTIAL: "reembolso parcial",
};

// Shortcut to request a return without leaving the order-detail screen (the
// order number/email are already known, so `ReturnRequestForm` skips those
// two fields here) — the request itself is only offered while the order is
// DELIVERED, mirroring the backend's own "only on a DELIVERED order" rule
// (docs/API-FRONTEND.md sección 20). Rendered right below `OrderStatusStepper`.
export function OrderReturnRequestSection({
  order,
  onOrderUpdate,
}: {
  order: Order;
  onOrderUpdate: (order: Order) => void;
}) {
  const [showForm, setShowForm] = useState(false);

  // A refund can happen with or without a return request ever existing (an
  // admin can refund a paid order directly via /cancel) — and *approving* a
  // request itself moves `order.status` off DELIVERED to REFUNDED/
  // PARTIALLY_REFUNDED, so this has to be checked before the DELIVERED gate
  // below; gating it on DELIVERED the way the rest of this component does
  // would make the refunded state unreachable the moment it actually
  // happens. `order.refundedAmount` is the always-present source of truth
  // (0 until a refund happens); `returnRequest.refundMode` just adds a
  // nicer label when the refund happened to go through a return request.
  if (order.status === "REFUNDED" || order.status === "PARTIALLY_REFUNDED") {
    const modeLabel = order.returnRequest?.refundMode
      ? REFUND_MODE_LABELS[order.returnRequest.refundMode]
      : null;
    return (
      <div className="mt-6 border-t border-sand pt-6">
        <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">
          Reembolso
        </h2>
        <div className="mt-3 border border-sand bg-cream-soft px-6 py-5">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">
            Monto reembolsado
          </p>
          <p className="mt-1 text-2xl font-black tracking-tight text-ink sm:text-3xl">
            {formatCurrency(order.refundedAmount, order.currency.toUpperCase())}
          </p>
          {modeLabel && <p className="mt-2 text-xs text-ink-muted">{modeLabel}</p>}
        </div>
        {order.cancellationReason && (
          <p className="mt-3 text-sm text-ink-muted">&ldquo;{order.cancellationReason}&rdquo;</p>
        )}
      </div>
    );
  }

  if (order.status !== "DELIVERED") return null;

  const returnRequest = order.returnRequest;

  // A request still pending or already rejected — never offer the button
  // again once one exists: the backend only blocks a *second* submission
  // while one is still PENDING, but re-opening the form after a REJECTED
  // resolution reads as if the outcome could be reargued from here, which
  // it can't. (There's no APPROVED case to render here — approval always
  // moves `order.status` to REFUNDED/PARTIALLY_REFUNDED, caught above.)
  if (returnRequest) {
    return (
      <div className="mt-6 border-t border-sand pt-6">
        <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">
          Solicitud de devolución
        </h2>
        {returnRequest.status === "PENDING" && (
          <>
            <p className="mt-2 text-sm text-ink">
              Recibimos tu solicitud y la estamos revisando — te respondemos en 24 a 48 horas por
              correo.
            </p>
            <p className="mt-1 text-sm text-ink-muted">&ldquo;{returnRequest.reason}&rdquo;</p>
          </>
        )}
        {returnRequest.status === "REJECTED" && (
          <p className="mt-2 text-sm text-ink">
            Tu solicitud de devolución fue rechazada
            {returnRequest.resolutionNote ? `: "${returnRequest.resolutionNote}"` : "."}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-6 border-t border-sand pt-6">
      <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">
        Solicitud de devolución
      </h2>

      {showForm ? (
        <div className="mt-3">
          <ReturnRequestForm
            orderNumber={order.orderNumber}
            email={order.email}
            onSubmitted={onOrderUpdate}
          />
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm text-ink-muted">
            Tienes 15 días naturales desde que recibiste tu pedido para solicitar un cambio o
            reembolso.
          </p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className={`${buttonClasses("outline")} mt-4`}
          >
            Solicitar devolución
          </button>
        </>
      )}
    </div>
  );
}
