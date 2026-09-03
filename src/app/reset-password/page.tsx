"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getErrorMessage } from "@/lib/get-error-message";
import { passwordStrengthError } from "@/lib/validate-password";
import { FormField } from "@/components/ui/FormField";
import { buttonClasses } from "@/components/ui/Button";

// The exact path (`/reset-password?token=...`) the PASSWORD_RESET email's
// button links to — see docs/API-FRONTEND.md sección 14 in the API repo.
// Consuming the token is this page's own POST /auth/reset-password (never
// a direct GET on click), and a successful reset invalidates every other
// session on the account and logs this one in with the fresh tokens it
// returns.
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-24 sm:px-6" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword } = useAuth();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-black uppercase tracking-tight text-ink">
          Enlace inválido
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          Este enlace no incluye un código para restablecer tu contraseña.
        </p>
        <Link href="/cuenta/login" className={`${buttonClasses("solid")} mt-8`}>
          Ir a iniciar sesión
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-black uppercase tracking-tight text-ink">
          Contraseña actualizada
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          Ya iniciaste sesión con tu nueva contraseña. Cerramos tus otras sesiones por
          seguridad.
        </p>
        <Link href="/cuenta" className={`${buttonClasses("solid")} mt-8`}>
          Ir a mi cuenta
        </Link>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const passwordError = passwordStrengthError(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(token as string, password);
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo restablecer tu contraseña."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-black uppercase tracking-tight text-ink">
        Restablecer contraseña
      </h1>
      <p className="mt-2 text-sm text-ink-muted">Elige una nueva contraseña para tu cuenta.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <FormField
          id="password"
          label="Nueva contraseña"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="-mt-3 text-xs text-ink-muted">
          Mínimo 8 caracteres, con al menos una mayúscula y un número.
        </p>
        <FormField
          id="confirmPassword"
          label="Confirma tu contraseña"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error && <p className="text-sm text-velvet">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className={buttonClasses("solid", "mt-2")}
        >
          {isSubmitting ? "Guardando…" : "Guardar nueva contraseña"}
        </button>
      </form>
    </div>
  );
}
