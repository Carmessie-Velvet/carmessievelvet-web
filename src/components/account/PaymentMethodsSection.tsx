"use client";

import { useEffect, useState } from "react";
import { userService } from "@/services/user-service";
import { ApiError } from "@/lib/api-client";
import { cardBrandLabel } from "@/lib/card-brand-label";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { PaymentMethod } from "@/types/user";

export function PaymentMethodsSection() {
  const [methods, setMethods] = useState<PaymentMethod[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    userService
      .getPaymentMethods()
      .then((data) => {
        if (!cancelled) setMethods(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(
            err instanceof ApiError ? err.message : "No se pudieron cargar tus tarjetas."
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleConfirmRemove() {
    if (!pendingRemoveId) return;
    const id = pendingRemoveId;
    setActionError(null);
    setRemovingId(id);
    try {
      await userService.deletePaymentMethod(id);
      setMethods((prev) => prev?.filter((m) => m.id !== id) ?? null);
      setPendingRemoveId(null);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "No se pudo eliminar la tarjeta.");
    } finally {
      setRemovingId(null);
    }
  }

  if (loadError) return <p className="text-sm text-velvet">{loadError}</p>;
  if (!methods) return <p className="text-sm text-ink-muted">Cargando tarjetas…</p>;

  const pendingMethod = methods.find((m) => m.id === pendingRemoveId);

  return (
    <>
      {methods.length === 0 ? (
        <p className="text-sm text-ink-muted">
          No tienes tarjetas guardadas. Se guardan automáticamente cuando lo eliges al pagar.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-sand">
          {methods.map((method) => (
            <li key={method.id} className="flex items-center justify-between py-3">
              <span className="text-sm text-ink">
                {cardBrandLabel(method.brand)} •••• {method.last4}
                <span className="ml-2 text-xs text-ink-muted">
                  exp. {String(method.expMonth).padStart(2, "0")}/{method.expYear}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setPendingRemoveId(method.id)}
                className="text-xs uppercase tracking-[0.1em] text-ink-muted underline-offset-2 hover:text-velvet hover:underline"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
      {actionError && <p className="mt-2 text-sm text-velvet">{actionError}</p>}

      <ConfirmDialog
        isOpen={!!pendingMethod}
        title="Eliminar tarjeta"
        description={
          pendingMethod
            ? `¿Eliminar la tarjeta ${cardBrandLabel(pendingMethod.brand)} terminada en ${pendingMethod.last4}?`
            : ""
        }
        confirmLabel="Eliminar"
        danger
        isConfirming={!!removingId}
        onConfirm={handleConfirmRemove}
        onCancel={() => setPendingRemoveId(null)}
      />
    </>
  );
}
