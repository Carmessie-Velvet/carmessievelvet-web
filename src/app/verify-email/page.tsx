"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/auth-service";
import { getErrorMessage } from "@/lib/get-error-message";
import { buttonClasses } from "@/components/ui/Button";

type Status = "checking" | "success" | "failed" | "missing-token";

// The exact path (`/verify-email?token=...`) the EMAIL_VERIFICATION email's
// button links to — see docs/API-FRONTEND.md sección 14 in the API repo.
// The link only navigates here; consuming the token is this page's own
// POST /auth/verify-email, never a direct GET on click (an email scanner
// pre-visiting the link would otherwise burn a one-time token unused).
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<StatusLayout title="Verificando tu correo…" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("checking");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      Promise.resolve().then(() => setStatus("missing-token"));
      return;
    }

    let cancelled = false;
    authService
      .verifyEmail(token)
      .then(() => {
        if (cancelled) return;
        setStatus("success");
        setTimeout(() => {
          if (!cancelled) router.replace("/cuenta/login");
        }, 2500);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(getErrorMessage(err, "No se pudo verificar tu correo."));
        setStatus("failed");
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams, router]);

  if (status === "success") {
    return (
      <StatusLayout title="¡Correo verificado!">
        <p className="mt-3 text-sm text-ink-muted">
          Ya puedes iniciar sesión. Te llevamos a la pantalla de acceso…
        </p>
        <Link href="/cuenta/login" className={`${buttonClasses("solid")} mt-8`}>
          Iniciar sesión
        </Link>
      </StatusLayout>
    );
  }

  if (status === "failed" || status === "missing-token") {
    return (
      <StatusLayout title="No pudimos verificar tu correo">
        <p className="mt-3 text-sm text-ink-muted">
          {status === "missing-token"
            ? "Este enlace no incluye un código de verificación válido."
            : error}
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          Si el enlace ya venció, inicia sesión y te ofrecemos reenviarlo.
        </p>
        <Link href="/cuenta/login" className={`${buttonClasses("solid")} mt-8`}>
          Ir a iniciar sesión
        </Link>
      </StatusLayout>
    );
  }

  return <StatusLayout title="Verificando tu correo…" />;
}

function StatusLayout({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
      <h1 className="text-2xl font-black uppercase tracking-tight text-ink">{title}</h1>
      {children}
    </div>
  );
}
