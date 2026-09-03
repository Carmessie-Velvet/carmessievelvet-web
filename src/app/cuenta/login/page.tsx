"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { authService } from "@/services/auth-service";
import { ApiError } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/get-error-message";
import { FormField } from "@/components/ui/FormField";
import { buttonClasses } from "@/components/ui/Button";

type Mode = "login" | "forgot";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Login's own 403 EMAIL_NOT_VERIFIED is distinct from a generic error —
  // it's the one case that offers a next step (resend the link) instead of
  // just an error string. See docs/API-FRONTEND.md sección 14.
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNeedsVerification(false);
    setIsSubmitting(true);
    try {
      await login({ email, password });
      router.push("/cuenta");
    } catch (err) {
      if (err instanceof ApiError && err.status === 403 && err.message === "EMAIL_NOT_VERIFIED") {
        setNeedsVerification(true);
      } else {
        setError(getErrorMessage(err, "No se pudo iniciar sesión."));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendVerification() {
    setIsResending(true);
    try {
      await authService.resendVerification(email);
      setResendSent(true);
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo reenviar el correo."));
    } finally {
      setIsResending(false);
    }
  }

  async function handleForgotPassword(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(email);
      setForgotSent(true);
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo enviar el correo."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (mode === "forgot") {
    return (
      <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
        <h1 className="text-3xl font-black uppercase tracking-tight text-ink">
          Recuperar contraseña
        </h1>

        {forgotSent ? (
          <>
            <p className="mt-4 text-sm text-ink-muted">
              Si <span className="text-ink">{email}</span> tiene una cuenta con nosotros, te
              enviamos un enlace para restablecer tu contraseña.
            </p>
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setForgotSent(false);
              }}
              className={`${buttonClasses("outline")} mt-8`}
            >
              Volver a iniciar sesión
            </button>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-ink-muted">
              Escribe tu correo y te mandamos un enlace para elegir una nueva contraseña.
            </p>
            <form onSubmit={handleForgotPassword} className="mt-8 flex flex-col gap-5">
              <FormField
                id="forgot-email"
                label="Correo electrónico"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {error && <p className="text-sm text-velvet">{error}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className={buttonClasses("solid", "mt-2")}
              >
                {isSubmitting ? "Enviando…" : "Enviar enlace"}
              </button>
            </form>
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className="mt-6 text-sm font-medium text-ink underline"
            >
              Volver a iniciar sesión
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-black uppercase tracking-tight text-ink">
        Iniciar sesión
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Accede para ver tu cuenta y agilizar tus compras.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <FormField
          id="email"
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <FormField
            id="password"
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => {
              setMode("forgot");
              setError(null);
              setNeedsVerification(false);
            }}
            className="self-end text-xs font-medium text-ink-muted underline hover:text-velvet"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        {needsVerification && (
          <div className="border border-sand bg-cream-soft p-4 text-sm text-ink-muted">
            <p>Tu correo todavía no está verificado. Revisa tu bandeja de entrada.</p>
            {resendSent ? (
              <p className="mt-2 text-ink">Te reenviamos el enlace de verificación.</p>
            ) : (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isResending}
                className="mt-2 font-medium text-ink underline disabled:opacity-40"
              >
                {isResending ? "Enviando…" : "Reenviar correo de verificación"}
              </button>
            )}
          </div>
        )}

        {error && <p className="text-sm text-velvet">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className={buttonClasses("solid", "mt-2")}
        >
          {isSubmitting ? "Ingresando…" : "Ingresar"}
        </button>
      </form>

      <p className="mt-8 text-sm text-ink-muted">
        ¿No tienes cuenta?{" "}
        <Link href="/cuenta/registro" className="font-medium text-ink underline">
          Regístrate
        </Link>
      </p>
    </div>
  );
}
