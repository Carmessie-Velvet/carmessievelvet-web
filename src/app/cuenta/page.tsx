"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useAuthModal } from "@/context/auth-modal-context";
import { useRequireAuth } from "@/lib/use-require-auth";
import { userService } from "@/services/user-service";
import { orderService } from "@/services/order-service";
import { ApiError } from "@/lib/api-client";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";
import { formatCurrency } from "@/lib/format-currency";
import { formatOrderDate } from "@/lib/format-order-date";
import { buttonClasses } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ProfileSection } from "@/components/account/ProfileSection";
import { PaymentMethodsSection } from "@/components/account/PaymentMethodsSection";
import type { Order } from "@/types/order";

export default function CuentaPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { open: openAuthModal } = useAuthModal();
  const isAuthenticated = useRequireAuth();
  const [firstName, setFirstName] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[] | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    userService
      .getProfile()
      .then((profile) => {
        if (!cancelled) setFirstName(profile.firstName);
      })
      .catch(() => {});
    orderService
      .getMyOrders()
      .then((orders) => {
        if (!cancelled) setRecentOrders(orders.slice(0, 3));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
        <h1 className="text-3xl font-black uppercase tracking-tight text-ink">Mi cuenta</h1>
        <p className="mt-3 text-sm text-ink-muted">
          Inicia sesión o crea una cuenta para continuar.
        </p>
        <button
          type="button"
          onClick={() => openAuthModal("login")}
          className={`${buttonClasses("solid")} mt-8`}
        >
          Iniciar sesión
        </button>
      </div>
    );
  }

  async function handleDeleteAccount() {
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
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-10 lg:gap-y-8">
        <Reveal immediate className="lg:col-start-1 lg:row-start-1">
          <h1 className="text-2xl font-black uppercase tracking-tight text-ink sm:text-3xl">
            Hola{firstName ? `, ${firstName}` : ""}
          </h1>
        </Reveal>

        <div className="lg:col-start-1 lg:row-start-2">
          <Reveal immediate delay={0.1} className="mt-8 border border-sand bg-paper p-6 lg:mt-0">
            <SectionHeading icon={<UserIcon />} label="Perfil" />
            <div className="mt-4">
              <ProfileSection />
            </div>
          </Reveal>

          <Reveal immediate delay={0.16} className="mt-6 border border-sand bg-paper p-6">
            <SectionHeading icon={<CardIcon />} label="Tarjetas guardadas" />
            <div className="mt-4">
              <PaymentMethodsSection />
            </div>
          </Reveal>

          <Reveal immediate delay={0.22} className="mt-6 border border-velvet/25 bg-velvet/[0.03] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-velvet">
              Zona de riesgo
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              Eliminar tu cuenta es permanente y no se puede deshacer.
            </p>
            {deleteError && <p className="mt-2 text-sm text-velvet">{deleteError}</p>}
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="mt-4 text-xs font-medium uppercase tracking-[0.1em] text-velvet underline-offset-2 hover:underline"
            >
              {isDeleting ? "Eliminando…" : "Eliminar mi cuenta"}
            </button>
          </Reveal>
        </div>

        <Reveal
          immediate
          delay={0.08}
          className="mt-8 border border-sand bg-paper p-6 lg:col-start-2 lg:row-start-2 lg:mt-0"
        >
          <div className="flex items-center justify-between">
            <SectionHeading icon={<ReceiptIcon />} label="Pedidos recientes" />
            <Link
              href="/cuenta/pedidos"
              className="text-xs font-medium uppercase tracking-[0.1em] text-ink-muted transition-colors hover:text-velvet"
            >
              Ver todos
            </Link>
          </div>

          {recentOrders === null ? (
            <p className="mt-4 text-sm text-ink-muted">Cargando…</p>
          ) : recentOrders.length === 0 ? (
            <div className="mt-4 flex flex-col items-center gap-3 py-6 text-center">
              <p className="text-sm text-ink-muted">Todavía no tienes pedidos.</p>
              <Link href="/tienda" className={buttonClasses("outline")}>
                Ir a la tienda
              </Link>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-sand border-t border-sand">
              {recentOrders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/cuenta/pedidos/${order.id}`}
                    className="flex items-center justify-between gap-4 py-4 transition-colors hover:text-velvet"
                  >
                    <div>
                      <p className="text-sm text-ink">{order.orderNumber}</p>
                      <p className="mt-0.5 text-xs uppercase tracking-[0.1em] text-ink-muted">
                        {ORDER_STATUS_LABELS[order.status]} · {formatOrderDate(order.createdAt)}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-ink">
                      {formatCurrency(order.total)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Eliminar tu cuenta"
        description="Esta acción no se puede deshacer. Se eliminará tu perfil, tarjetas guardadas y acceso a tu historial de pedidos."
        confirmLabel="Eliminar mi cuenta"
        danger
        isConfirming={isDeleting}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
      />
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

function ReceiptIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M6 2h12v20l-2.5-1.6L13 22l-2.5-1.6L8 22l-2-1.6V2Z" strokeLinejoin="round" />
      <path d="M9 8h6M9 12h6" strokeLinecap="round" />
    </svg>
  );
}
