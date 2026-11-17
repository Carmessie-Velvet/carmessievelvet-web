"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { authService } from "@/services/auth-service";
import { getErrorMessage } from "@/lib/get-error-message";
import { buttonClasses } from "@/components/ui/Button";

type ResendState = "idle" | "sending" | "sent";

/**
 * "Confirm your email" notice for a logged-in account whose email the API has
 * not verified yet. Renders nothing otherwise, so it can sit on any page that
 * should mention it (the account page, the checkout). Offers the two things a
 * person actually needs: another link, and a way to re-check without reloading
 * after they opened it in their mail app.
 */
export function EmailVerificationNotice({
  title = "Confirma tu correo",
  className = "",
}: {
  title?: string;
  className?: string;
}) {
  const { user, needsEmailVerification, refreshUser } = useAuth();
  const [resend, setResend] = useState<ResendState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [stillPending, setStillPending] = useState(false);

  if (!needsEmailVerification || !user) return null;

  async function handleResend() {
    if (!user) return;
    setError(null);
    setResend("sending");
    try {
      await authService.resendVerification(user.email);
      setResend("sent");
    } catch (err) {
      setResend("idle");
      setError(getErrorMessage(err, "No se pudo reenviar el correo. Intenta de nuevo en unos minutos."));
    }
  }

  async function handleCheck() {
    setStillPending(false);
    setIsChecking(true);
    await refreshUser();
    setIsChecking(false);
    // If the check confirmed it, `needsEmailVerification` flips and this whole
    // notice unmounts; reaching the line below means it is still unverified.
    setStillPending(true);
  }

  return (
    <div role="status" className={`border border-sand bg-cream-soft px-4 py-4 text-sm text-ink ${className}`}>
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-ink-muted">
        Te enviamos un enlace a <span className="text-ink">{user.email}</span>. Necesitas
        confirmarlo para poder comprar.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          onClick={handleResend}
          disabled={resend === "sending"}
          className={buttonClasses("outline", "px-4 py-2 text-xs")}
        >
          {resend === "sending" ? "Enviando…" : "Reenviar correo"}
        </button>
        <button
          type="button"
          onClick={handleCheck}
          disabled={isChecking}
          className="text-xs font-medium uppercase tracking-[0.1em] text-ink underline underline-offset-2 transition-colors hover:text-velvet disabled:opacity-60"
        >
          {isChecking ? "Revisando…" : "Ya lo confirmé"}
        </button>
      </div>

      {resend === "sent" && (
        <p className="mt-2 text-xs text-ink-muted">
          Te lo reenviamos. Si no lo ves, revisa tu carpeta de spam o correo no deseado.
        </p>
      )}
      {stillPending && !isChecking && (
        <p className="mt-2 text-xs text-ink-muted">
          Todavía no aparece confirmado. Abre el enlace del correo y vuelve aquí.
        </p>
      )}
      {error && <p className="mt-2 text-xs text-velvet">{error}</p>}
    </div>
  );
}
