"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthModal } from "@/context/auth-modal-context";
import { useAuth } from "@/context/auth-context";
import { authService } from "@/services/auth-service";
import { ApiError } from "@/lib/api-client";
import { useLockBodyScroll, useEscapeKey } from "@/lib/use-lock-body-scroll";
import { getErrorMessage } from "@/lib/get-error-message";
import { passwordStrengthError } from "@/lib/validate-password";
import { FormField } from "@/components/ui/FormField";
import { buttonClasses } from "@/components/ui/Button";

// The site-wide replacement for navigating to /cuenta/login: any "please
// sign in" moment (header account icon, a gated account page, the wishlist
// heart) opens this over whatever the shopper was already looking at,
// instead of losing their place. /cuenta/login and /cuenta/registro still
// exist as real pages for direct links (emails, bookmarks) — this modal is
// the in-context shortcut, not a replacement for them.
export function AuthModal() {
  const { isOpen, mode, close, setMode } = useAuthModal();

  useLockBodyScroll(isOpen);
  useEscapeKey(close, isOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-[2px]"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-heading"
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-paper p-7 shadow-[0_30px_70px_-20px_rgba(42,31,28,0.45)] sm:p-8"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-6">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  id="auth-modal-heading"
                  className={`pb-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${
                    mode === "login"
                      ? "border-b-2 border-ink text-ink"
                      : "border-b-2 border-transparent text-ink-muted hover:text-ink"
                  }`}
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`pb-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${
                    mode === "signup"
                      ? "border-b-2 border-ink text-ink"
                      : "border-b-2 border-transparent text-ink-muted hover:text-ink"
                  }`}
                >
                  Crear cuenta
                </button>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Cerrar"
                className="flex h-8 w-8 shrink-0 items-center justify-center text-ink-muted transition-transform duration-300 ease-out hover:rotate-90 hover:text-ink"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="mt-2 border-b border-sand" />

            <div className="mt-6">
              {mode === "login" ? <LoginForm /> : <SignupForm />}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LoginForm() {
  const { login } = useAuth();
  const { close, setMode } = useAuthModal();
  const [view, setView] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      close();
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

  if (view === "forgot") {
    return forgotSent ? (
      <div>
        <p className="text-sm text-ink-muted">
          Si <span className="text-ink">{email}</span> tiene una cuenta con nosotros, te
          enviamos un enlace para restablecer tu contraseña.
        </p>
        <button
          type="button"
          onClick={() => {
            setView("login");
            setForgotSent(false);
          }}
          className="mt-6 text-sm font-medium text-ink underline"
        >
          Volver a iniciar sesión
        </button>
      </div>
    ) : (
      <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
        <p className="text-sm text-ink-muted">
          Escribe tu correo y te mandamos un enlace para elegir una nueva contraseña.
        </p>
        <FormField
          id="modal-forgot-email"
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && <p className="text-sm text-velvet">{error}</p>}
        <button type="submit" disabled={isSubmitting} className={buttonClasses("solid")}>
          {isSubmitting ? "Enviando…" : "Enviar enlace"}
        </button>
        <button
          type="button"
          onClick={() => {
            setView("login");
            setError(null);
          }}
          className="text-sm font-medium text-ink underline"
        >
          Volver a iniciar sesión
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField
        id="modal-email"
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div className="flex flex-col gap-1.5">
        <FormField
          id="modal-password"
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
            setView("forgot");
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

      <button type="submit" disabled={isSubmitting} className={buttonClasses("solid")}>
        {isSubmitting ? "Ingresando…" : "Ingresar"}
      </button>
      <button
        type="button"
        onClick={() => setMode("signup")}
        className={buttonClasses("outline")}
      >
        Crear cuenta
      </button>
    </form>
  );
}

function SignupForm() {
  const { signup } = useAuth();
  const { close } = useAuthModal();
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
      close();
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo crear la cuenta."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          id="modal-firstName"
          label="Nombre"
          autoComplete="given-name"
          required
          value={form.firstName}
          onChange={update("firstName")}
        />
        <FormField
          id="modal-lastName"
          label="Apellido"
          autoComplete="family-name"
          required
          value={form.lastName}
          onChange={update("lastName")}
        />
      </div>
      <FormField
        id="modal-signup-email"
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        required
        value={form.email}
        onChange={update("email")}
      />
      <FormField
        id="modal-phoneNumber"
        label="Teléfono"
        type="tel"
        autoComplete="tel"
        required
        value={form.phoneNumber}
        onChange={update("phoneNumber")}
      />
      <FormField
        id="modal-signup-password"
        label="Contraseña"
        type="password"
        autoComplete="new-password"
        required
        value={form.password}
        onChange={update("password")}
      />
      <p className="-mt-2 text-xs text-ink-muted">
        Mínimo 8 caracteres, con al menos una mayúscula y un número.
      </p>

      {error && <p className="text-sm text-velvet">{error}</p>}

      <button type="submit" disabled={isSubmitting} className={buttonClasses("solid")}>
        {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
      </button>
    </form>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
