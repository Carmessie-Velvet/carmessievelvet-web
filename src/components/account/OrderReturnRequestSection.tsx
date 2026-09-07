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
// two fields here) — only shown once the order is DELIVERED, mirroring the
// backend's own "only on a DELIVERED order" rule (docs/API-FRONTEND.md
// sección 20). Rendered right below `OrderStatusStepper`.
export function OrderReturnRequestSection({
  order,
  onOrderUpdate,
}: {
  order: Order;
  onOrderUpdate: (order: Order) => void;
}) {
  const [showForm, setShowForm] = useState(false);

  if (order.status !== "DELIVERED") return null;

  const returnRequest = order.returnRequest;

  // Once a request exists, it's resolved on the buyer's end either way —
  // PENDING is still being reviewed, APPROVED/REJECTED already got a final
  // answer. None of the three should offer the button again: the backend
  // itself only blocks a second submission while one is still PENDING, but
  // re-opening the form after an admin already resolved one reads as if
  // the outcome could be reargued from here, which it can't.
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
        {returnRequest.status === "APPROVED" && (
          <p className="mt-2 text-sm text-ink">
            Tu devolución fue aprobada —{" "}
            {returnRequest.refundMode ? REFUND_MODE_LABELS[returnRequest.refundMode] : "reembolso"}
            {returnRequest.refundedAmount
              ? ` de ${formatCurrency(returnRequest.refundedAmount, order.currency.toUpperCase())}`
              : ""}
            .
          </p>
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
