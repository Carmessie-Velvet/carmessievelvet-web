"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { userService } from "@/services/user-service";
import { ApiError } from "@/lib/api-client";
import { buttonClasses } from "@/components/ui/Button";
import { ProfileSection } from "@/components/account/ProfileSection";
import { PaymentMethodsSection } from "@/components/account/PaymentMethodsSection";

export default function CuentaPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
        <h1 className="text-3xl font-black uppercase tracking-tight text-ink">
          Mi cuenta
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          Inicia sesión o crea una cuenta para continuar.
        </p>
        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link href="/cuenta/login" className={buttonClasses("solid")}>
            Iniciar sesión
          </Link>
          <Link href="/cuenta/registro" className={buttonClasses("outline")}>
            Crear cuenta
          </Link>
        </div>
      </div>
    );
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  }

  async function handleDeleteAccount() {
    if (
      !window.confirm(
        "¿Seguro que quieres eliminar tu cuenta? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await userService.deleteAccount();
      await logout();
      router.push("/");
    } catch (err) {
      setDeleteError(
        err instanceof ApiError ? err.message : "No se pudo eliminar tu cuenta."
      );
      setIsDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ink text-lg font-bold text-cream-soft">
          {user.email.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-black uppercase tracking-tight text-ink">
            Mi cuenta
          </h1>
          <p className="truncate text-xs text-ink-muted">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="shrink-0 text-xs font-medium uppercase tracking-[0.1em] text-ink-muted underline-offset-2 hover:text-velvet hover:underline"
        >
          {isLoggingOut ? "Cerrando…" : "Cerrar sesión"}
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <Link
          href="/cuenta/pedidos"
          className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-velvet"
        >
          Mis pedidos
          <ArrowIcon />
        </Link>
        <Link
          href="/cuenta/favoritos"
          className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-velvet"
        >
          Mis favoritos
          <ArrowIcon />
        </Link>
      </div>

      <section className="mt-8 border border-sand bg-paper p-6">
        <SectionHeading icon={<UserIcon />} label="Perfil" />
        <div className="mt-4">
          <ProfileSection />
        </div>
      </section>

      <section className="mt-6 border border-sand bg-paper p-6">
        <SectionHeading icon={<CardIcon />} label="Tarjetas guardadas" />
        <div className="mt-4">
          <PaymentMethodsSection />
        </div>
      </section>

      <section className="mt-6 border border-velvet/25 bg-velvet/[0.03] p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-velvet">
          Zona de riesgo
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          Eliminar tu cuenta es permanente y no se puede deshacer.
        </p>
        {deleteError && <p className="mt-2 text-sm text-velvet">{deleteError}</p>}
        <button
          type="button"
          onClick={handleDeleteAccount}
          disabled={isDeleting}
          className="mt-4 text-xs font-medium uppercase tracking-[0.1em] text-velvet underline-offset-2 hover:underline"
        >
          {isDeleting ? "Eliminando…" : "Eliminar mi cuenta"}
        </button>
      </section>
    </div>
  );
}

function SectionHeading({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream-soft text-velvet">
        {icon}
      </span>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink">{label}</p>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-3 w-3" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5" aria-hidden="true">
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5 20c0-3.6 3.13-6 7-6s7 2.4 7 6" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5" aria-hidden="true">
      <rect x="2" y="6" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}
