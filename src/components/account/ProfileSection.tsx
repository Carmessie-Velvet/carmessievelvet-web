"use client";

import { useEffect, useState } from "react";
import { userService } from "@/services/user-service";
import { ApiError } from "@/lib/api-client";
import type { UserProfile } from "@/types/user";
import { FormField } from "@/components/ui/FormField";
import { buttonClasses } from "@/components/ui/Button";

export function ProfileSection() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    userService
      .getProfile()
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        setForm({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "No se pudo cargar tu perfil.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSaving(true);
    try {
      const updated = await userService.updateProfile(form);
      setProfile(updated);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo actualizar tu perfil.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-ink-muted">Cargando perfil…</p>;
  }

  if (!profile) {
    return <p className="text-sm text-velvet">{error ?? "No se pudo cargar tu perfil."}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          id="firstName"
          label="Nombre"
          required
          value={form.firstName}
          onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
        />
        <FormField
          id="lastName"
          label="Apellido"
          required
          value={form.lastName}
          onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
        />
      </div>
      <FormField
        id="email"
        label="Correo electrónico"
        type="email"
        required
        value={form.email}
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
      />
      <FormField
        id="phoneNumber"
        label="Teléfono"
        value={profile.phoneNumber}
        disabled
        title="El teléfono no se puede editar desde aquí"
      />

      {error && <p className="text-sm text-velvet">{error}</p>}
      {success && <p className="text-sm text-ink-muted">Perfil actualizado.</p>}

      <button
        type="submit"
        disabled={isSaving}
        className={buttonClasses("outline", "self-start")}
      >
        {isSaving ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
