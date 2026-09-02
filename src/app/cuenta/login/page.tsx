"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { getErrorMessage } from "@/lib/get-error-message";
import { FormField } from "@/components/ui/FormField";
import { buttonClasses } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
      router.push("/cuenta");
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo iniciar sesión."));
    } finally {
      setIsSubmitting(false);
    }
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
        <FormField
          id="password"
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

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
