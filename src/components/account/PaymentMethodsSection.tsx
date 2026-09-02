"use client";

import { useEffect, useState } from "react";
import { userService } from "@/services/user-service";
import { ApiError } from "@/lib/api-client";
import type { PaymentMethod } from "@/types/user";

const BRAND_LABELS: Record<string, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
};

export function PaymentMethodsSection() {
  const [methods, setMethods] = useState<PaymentMethod[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    userService
      .getPaymentMethods()
      .then((data) => {
        if (!cancelled) setMethods(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "No se pudieron cargar tus tarjetas."
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRemove(id: string) {
    if (!window.confirm("¿Eliminar esta tarjeta guardada?")) return;
    setRemovingId(id);
    try {
      await userService.deletePaymentMethod(id);
      setMethods((prev) => prev?.filter((m) => m.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo eliminar la tarjeta.");
    } finally {
      setRemovingId(null);
    }
  }

  if (error) return <p className="text-sm text-velvet">{error}</p>;
  if (!methods) return <p className="text-sm text-ink-muted">Cargando tarjetas…</p>;

  if (methods.length === 0) {
    return (
      <p className="text-sm text-ink-muted">
        No tienes tarjetas guardadas. Se guardan automáticamente cuando lo eliges al pagar.
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-sand">
      {methods.map((method) => (
        <li key={method.id} className="flex items-center justify-between py-3">
          <span className="text-sm text-ink">
            {BRAND_LABELS[method.brand] ?? method.brand} •••• {method.last4}
            <span className="ml-2 text-xs text-ink-muted">
              exp. {String(method.expMonth).padStart(2, "0")}/{method.expYear}
            </span>
          </span>
          <button
            type="button"
            onClick={() => handleRemove(method.id)}
            disabled={removingId === method.id}
            className="text-xs uppercase tracking-[0.1em] text-ink-muted underline-offset-2 hover:text-velvet hover:underline"
          >
            {removingId === method.id ? "Eliminando…" : "Eliminar"}
          </button>
        </li>
      ))}
    </ul>
  );
}
