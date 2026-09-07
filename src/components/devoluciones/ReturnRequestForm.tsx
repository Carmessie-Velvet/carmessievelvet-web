"use client";

import { useState } from "react";
import { returnRequestService } from "@/services/return-request-service";
import { getErrorMessage } from "@/lib/get-error-message";
import { ApiError } from "@/lib/api-client";
import { FormField } from "@/components/ui/FormField";
import { buttonClasses } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import type { Order } from "@/types/order";

interface ReturnRequestFormProps {
  /**
   * Known ahead of time from the order-detail screen — when both are
   * given, the order-number/email fields are skipped entirely instead of
   * asking the shopper to retype what the page already knows.
   */
  orderNumber?: string;
  email?: string;
  onSubmitted?: (order: Order) => void;
}

export function ReturnRequestForm({
  orderNumber: fixedOrderNumber,
  email: fixedEmail,
  onSubmitted,
}: ReturnRequestFormProps = {}) {
  const isPrefilled = !!fixedOrderNumber && !!fixedEmail;
  const [orderNumber, setOrderNumber] = useState(fixedOrderNumber ?? "");
  const [email, setEmail] = useState(fixedEmail ?? "");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const order = await returnRequestService.submit({
        orderNumber: orderNumber.trim(),
        email: email.trim(),
        reason: reason.trim(),
      });
      setSubmitted(true);
      onSubmitted?.(order);
    } catch (err) {
      setError(
        getErrorMessage(err, "No se pudo enviar tu solicitud. Intenta de nuevo en unos minutos.", {
          400:
            err instanceof ApiError && /DELIVERED/i.test(err.message)
              ? "Solo podemos recibir solicitudes de devolución de pedidos ya entregados."
              : "Verifica el número de pedido — debe verse como CM-000000.",
          404: "No encontramos un pedido con ese número y correo. Verifica que ambos sean correctos.",
          409: "Ya hay una solicitud de devolución pendiente para este pedido. Te contactaremos pronto por correo.",
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="border border-sand bg-cream-soft p-5">
        <p className="text-sm text-ink">
          Recibimos tu solicitud. Te responderemos en 24 a 48 horas por correo con los siguientes
          pasos.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {!isPrefilled && (
        <>
          <FormField
            id="return-orderNumber"
            label="Número de pedido"
            placeholder="CM-001021"
            required
            pattern="CM-\d{6,}"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
          />
          <FormField
            id="return-email"
            label="Correo electrónico"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </>
      )}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="return-reason"
          className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted"
        >
          Motivo
        </label>
        <textarea
          id="return-reason"
          required
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="resize-none border border-sand bg-paper px-4 py-2.5 text-sm text-ink outline-none transition-all duration-200 focus:border-ink focus:shadow-[0_0_0_3px_rgba(75,21,48,0.08)]"
        />
      </div>

      {error && <p className="text-sm text-velvet">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className={`${buttonClasses("solid")} flex items-center justify-center gap-2`}
      >
        {isSubmitting && <Spinner className="h-3.5 w-3.5 border-cream-soft/40 border-t-cream-soft" />}
        {isSubmitting ? "Enviando…" : "Enviar solicitud"}
      </button>
    </form>
  );
}
