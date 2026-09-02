"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { getErrorMessage } from "@/lib/get-error-message";
import { passwordStrengthError } from "@/lib/validate-password";
import { FormField } from "@/components/ui/FormField";
import { buttonClasses } from "@/components/ui/Button";

export default function RegistroPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const passwordError = passwordStrengthError(form.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(form);
      router.push("/cuenta");
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo crear la cuenta."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-black uppercase tracking-tight text-ink">
        Crear cuenta
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Guarda tus datos para comprar más rápido la próxima vez.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            id="firstName"
            label="Nombre"
            autoComplete="given-name"
            required
            value={form.firstName}
            onChange={update("firstName")}
          />
          <FormField
            id="lastName"
            label="Apellido"
            autoComplete="family-name"
            required
            value={form.lastName}
            onChange={update("lastName")}
          />
        </div>
        <FormField
          id="email"
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={update("email")}
        />
        <FormField
          id="phoneNumber"
          label="Teléfono"
          type="tel"
          autoComplete="tel"
          required
          value={form.phoneNumber}
          onChange={update("phoneNumber")}
        />
        <FormField
          id="password"
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          required
          value={form.password}
          onChange={update("password")}
        />
        <p className="-mt-3 text-xs text-ink-muted">
          Mínimo 8 caracteres, con al menos una mayúscula y un número.
        </p>

        {error && <p className="text-sm text-velvet">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className={buttonClasses("solid", "mt-2")}
        >
          {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-8 text-sm text-ink-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href="/cuenta/login" className="font-medium text-ink underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
