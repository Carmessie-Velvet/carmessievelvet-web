"use client";

import { useEffect, useState } from "react";
import { addressService } from "@/services/address-service";
import { locationService } from "@/services/location-service";
import { ApiError } from "@/lib/api-client";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FormField } from "@/components/ui/FormField";
import { buttonClasses } from "@/components/ui/Button";
import type { AddressInput, UserAddress } from "@/types/address";
import type { MxState } from "@/types/mx-state";

const EMPTY_FORM: AddressInput = {
  fullName: "",
  phone: "",
  street: "",
  extNumber: "",
  intNumber: "",
  suburb: "",
  city: "",
  stateCode: "",
  postalCode: "",
  reference: "",
};

export function AddressesSection() {
  const [addresses, setAddresses] = useState<UserAddress[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    addressService
      .getAll()
      .then((data) => {
        if (!cancelled) setAddresses(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(
            err instanceof ApiError ? err.message : "No se pudieron cargar tus direcciones."
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSetDefault(id: string) {
    setActionError(null);
    setSettingDefaultId(id);
    try {
      const updated = await addressService.setDefault(id);
      setAddresses(
        (prev) =>
          prev?.map((a) => (a.id === id ? updated : { ...a, isDefault: false })) ?? null
      );
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "No se pudo actualizar la dirección predeterminada."
      );
    } finally {
      setSettingDefaultId(null);
    }
  }

  async function handleConfirmRemove() {
    if (!pendingRemoveId) return;
    const id = pendingRemoveId;
    setActionError(null);
    setRemovingId(id);
    try {
      await addressService.remove(id);
      // Deleting the default promotes another address to default server-side
      // (the oldest remaining one) — refetch instead of just filtering the
      // removed row out, so that promotion actually shows up here too.
      const refreshed = await addressService.getAll();
      setAddresses(refreshed);
      setPendingRemoveId(null);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "No se pudo eliminar la dirección.");
    } finally {
      setRemovingId(null);
    }
  }

  if (loadError) return <p className="text-sm text-velvet">{loadError}</p>;
  if (!addresses) return <p className="text-sm text-ink-muted">Cargando direcciones…</p>;

  const pendingAddress = addresses.find((a) => a.id === pendingRemoveId);
  const editingAddress = editingId && editingId !== "new" ? addresses.find((a) => a.id === editingId) : null;

  return (
    <>
      {addresses.length === 0 && editingId !== "new" && (
        <p className="text-sm text-ink-muted">Todavía no tienes direcciones guardadas.</p>
      )}

      {addresses.length > 0 && (
        <ul className="flex flex-col divide-y divide-sand">
          {addresses.map((address) => (
            <li key={address.id} className="py-3">
              {editingId === address.id ? (
                <AddressForm
                  initial={address}
                  onCancel={() => setEditingId(null)}
                  onSaved={(updated) => {
                    setAddresses((prev) => prev?.map((a) => (a.id === updated.id ? updated : a)) ?? null);
                    setEditingId(null);
                  }}
                />
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-ink">
                      {address.fullName}
                      {address.isDefault && (
                        <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-velvet">
                          Predeterminada
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {address.street} {address.extNumber}
                      {address.intNumber ? `, Int. ${address.intNumber}` : ""}, {address.suburb},{" "}
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingId(address.id)}
                        className="text-xs uppercase tracking-[0.1em] text-ink-muted underline-offset-2 hover:text-velvet hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingRemoveId(address.id)}
                        className="text-xs uppercase tracking-[0.1em] text-ink-muted underline-offset-2 hover:text-velvet hover:underline"
                      >
                        Eliminar
                      </button>
                    </div>
                    {!address.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(address.id)}
                        disabled={settingDefaultId === address.id}
                        className="text-xs uppercase tracking-[0.1em] text-ink-muted underline-offset-2 hover:text-velvet hover:underline disabled:opacity-50"
                      >
                        {settingDefaultId === address.id ? "Guardando…" : "Hacer predeterminada"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {editingId === "new" ? (
        <div className={addresses.length > 0 ? "mt-4 border-t border-sand pt-4" : ""}>
          <AddressForm
            initial={null}
            onCancel={() => setEditingId(null)}
            onSaved={(created) => {
              setAddresses((prev) => [...(prev ?? []), created]);
              setEditingId(null);
            }}
          />
        </div>
      ) : (
        !editingAddress && (
          <button
            type="button"
            onClick={() => setEditingId("new")}
            className={`text-xs font-medium uppercase tracking-[0.1em] text-ink underline-offset-2 hover:text-velvet hover:underline ${
              addresses.length > 0 ? "mt-3" : ""
            }`}
          >
            + Agregar dirección
          </button>
        )
      )}

      {actionError && <p className="mt-3 text-sm text-velvet">{actionError}</p>}

      <ConfirmDialog
        isOpen={!!pendingAddress}
        title="Eliminar dirección"
        description={
          pendingAddress
            ? `¿Eliminar la dirección de "${pendingAddress.fullName}"? Esto no afecta pedidos ya realizados.`
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

function AddressForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial: UserAddress | null;
  onCancel: () => void;
  onSaved: (address: UserAddress) => void;
}) {
  const [form, setForm] = useState<AddressInput>(
    initial
      ? {
          fullName: initial.fullName,
          phone: initial.phone ?? "",
          street: initial.street,
          extNumber: initial.extNumber,
          intNumber: initial.intNumber ?? "",
          suburb: initial.suburb,
          city: initial.city,
          stateCode: initial.stateCode,
          postalCode: initial.postalCode,
          reference: initial.reference ?? "",
        }
      : EMPTY_FORM
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mxStates, setMxStates] = useState<MxState[] | null>(null);
  const [suburbOptions, setSuburbOptions] = useState<string[]>([]);
  const [postalCodeNotFound, setPostalCodeNotFound] = useState(false);

  function update<K extends keyof AddressInput>(key: K, value: AddressInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // The state-code catalog is admin-agnostic but still has to come from the
  // API — these are Enviatodo's own codes, not SEPOMEX/CFDI, so there's no
  // safe hardcoded list to fall back to.
  useEffect(() => {
    let cancelled = false;
    locationService
      .getMxStates()
      .then((states) => {
        if (!cancelled) setMxStates(states);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Autofills city/state/colonia from the postal code once it's a complete
  // 5-digit CP. Never overwrites a value the shopper already typed — only
  // fills fields that are still blank.
  useEffect(() => {
    const postalCode = form.postalCode;
    if (!/^\d{5}$/.test(postalCode)) {
      setPostalCodeNotFound(false);
      setSuburbOptions([]);
      return;
    }
    let cancelled = false;
    locationService.lookupPostalCode(postalCode).then((result) => {
      if (cancelled) return;
      if (!result) {
        setPostalCodeNotFound(true);
        setSuburbOptions([]);
        return;
      }
      setPostalCodeNotFound(false);
      setSuburbOptions(result.suburbs);
      setForm((prev) =>
        prev.postalCode === postalCode
          ? {
              ...prev,
              city: prev.city || result.city,
              stateCode: prev.stateCode || result.stateCode,
              suburb: prev.suburb || (result.suburbs.length === 1 ? result.suburbs[0] : prev.suburb),
            }
          : prev
      );
    });
    return () => {
      cancelled = true;
    };
  }, [form.postalCode]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      const saved = initial
        ? await addressService.update(initial.id, form)
        : await addressService.create(form);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar la dirección.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <FormField
        id="addr-fullName"
        label="Nombre completo"
        required
        value={form.fullName}
        onChange={(e) => update("fullName", e.target.value)}
      />
      <FormField
        id="addr-phone"
        label="Teléfono"
        type="tel"
        required
        value={form.phone}
        onChange={(e) => update("phone", e.target.value)}
      />
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <FormField
          id="addr-street"
          label="Calle"
          required
          value={form.street}
          onChange={(e) => update("street", e.target.value)}
        />
        <FormField
          id="addr-extNumber"
          label="Núm. exterior"
          required
          value={form.extNumber}
          onChange={(e) => update("extNumber", e.target.value)}
        />
      </div>
      <FormField
        id="addr-intNumber"
        label="Núm. interior / depto (opcional)"
        value={form.intNumber}
        onChange={(e) => update("intNumber", e.target.value)}
      />
      <FormField
        id="addr-postalCode"
        label="Código postal"
        required
        inputMode="numeric"
        pattern="\d{5}"
        maxLength={5}
        value={form.postalCode}
        onChange={(e) => update("postalCode", e.target.value.replace(/\D/g, "").slice(0, 5))}
      />
      {postalCodeNotFound && (
        <p className="-mt-1.5 text-xs text-ink-muted">
          No encontramos ese código postal — verifica que sea correcto.
        </p>
      )}
      {suburbOptions.length > 1 ? (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="addr-suburb"
            className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted"
          >
            Colonia
          </label>
          <select
            id="addr-suburb"
            required
            value={form.suburb}
            onChange={(e) => update("suburb", e.target.value)}
            className="border border-sand bg-paper px-4 py-2.5 text-sm text-ink outline-none transition-all duration-200 focus:border-ink focus:shadow-[0_0_0_3px_rgba(75,21,48,0.08)]"
          >
            <option value="" disabled>
              Selecciona una colonia
            </option>
            {suburbOptions.map((suburb) => (
              <option key={suburb} value={suburb}>
                {suburb}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <FormField
          id="addr-suburb"
          label="Colonia"
          required
          value={form.suburb}
          onChange={(e) => update("suburb", e.target.value)}
        />
      )}
      <div className="grid grid-cols-2 gap-3">
        <FormField
          id="addr-city"
          label="Ciudad"
          required
          value={form.city}
          onChange={(e) => update("city", e.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="addr-stateCode"
            className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted"
          >
            Estado
          </label>
          <select
            id="addr-stateCode"
            required
            value={form.stateCode}
            onChange={(e) => update("stateCode", e.target.value)}
            className="border border-sand bg-paper px-4 py-2.5 text-sm text-ink outline-none transition-all duration-200 focus:border-ink focus:shadow-[0_0_0_3px_rgba(75,21,48,0.08)]"
          >
            <option value="" disabled>
              {mxStates ? "Selecciona un estado" : "Cargando…"}
            </option>
            {mxStates?.map((state) => (
              <option key={state.code} value={state.code}>
                {state.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <FormField
        id="addr-reference"
        label="Referencia / entre calles (opcional)"
        value={form.reference}
        onChange={(e) => update("reference", e.target.value)}
      />

      {error && <p className="text-sm text-velvet">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={isSaving} className={buttonClasses("solid")}>
          {isSaving ? "Guardando…" : "Guardar dirección"}
        </button>
        <button type="button" onClick={onCancel} className={buttonClasses("outline")}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
