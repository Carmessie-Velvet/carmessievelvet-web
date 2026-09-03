"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import type { Appearance } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { useAuthModal } from "@/context/auth-modal-context";
import { orderService } from "@/services/order-service";
import { productService } from "@/services/product-service";
import { userService } from "@/services/user-service";
import { getErrorMessage } from "@/lib/get-error-message";
import { formatCurrency } from "@/lib/format-currency";
import { clearPendingOrder, savePendingOrder } from "@/lib/pending-order";
import { waitForOrderPaid } from "@/lib/wait-for-order-paid";
import { cardBrandLabel } from "@/lib/card-brand-label";
import { lookupPostalCode } from "@/lib/lookup-postal-code";
import { FormField } from "@/components/ui/FormField";
import { buttonClasses } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import type { CreateOrderResult, ShippingAddress } from "@/types/order";
import type { CouponInvalidReason, CouponPreview } from "@/types/coupon";
import type { PaymentMethod } from "@/types/user";

const COUPON_REASON_LABELS: Record<CouponInvalidReason, string> = {
  NOT_FOUND: "No encontramos ese cupón.",
  DISABLED: "Este cupón ya no está disponible.",
  NOT_STARTED: "Este cupón todavía no está activo.",
  EXPIRED: "Este cupón ya expiró.",
  USAGE_LIMIT_REACHED: "Este cupón alcanzó su límite de usos.",
  BELOW_MINIMUM_AMOUNT: "Tu compra no alcanza el mínimo para aplicar este cupón.",
};

// Prices/ETAs confirmed by the client (2026-09-03) — Estafeta ~80% of the
// time, Correos de México the rest, depending on which guía comes out
// cheaper for a given shipment. Shown here so the shopper sees the real
// cost before paying, but NOT sent to `createOrder` yet: the backend's
// `CreateOrderDto` doesn't accept a shipping method and always prices
// shipping at $0 (`shippingMinor = 0` in `OrderService.create`) — sending
// an extra field would just 400 under `forbidNonWhitelisted`. Once the
// backend adds a `shippingMethod` field (see the request already sent),
// wire `shippingMethod` into the `createOrder` call below.
const SHIPPING_OPTIONS = [
  {
    id: "standard" as const,
    label: "Envío estándar",
    carrier: "Correos de México",
    eta: "8 a 20 días hábiles",
    price: 75,
  },
  {
    id: "express" as const,
    label: "Envío express",
    carrier: "Estafeta",
    eta: "2 a 5 días hábiles",
    price: 150,
  },
];

const EMPTY_ADDRESS: ShippingAddress = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "MX",
};

// Keeps Stripe's own PaymentElement UI from reading as a foreign, default-
// white widget dropped into an otherwise sharp-cornered, cream/ink/velvet
// page — themed straight from the brand's own tokens (see globals.css).
const STRIPE_APPEARANCE: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#2a1f1c",
    colorBackground: "#fffdfb",
    colorText: "#2a1f1c",
    colorTextSecondary: "#6b5d52",
    colorDanger: "#4b1530",
    fontFamily: "Archivo, system-ui, sans-serif",
    borderRadius: "0px",
    spacingUnit: "4px",
  },
  rules: {
    ".Label": {
      fontSize: "11px",
      fontWeight: "600",
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color: "#6b5d52",
    },
    ".Input": {
      border: "1px solid #dccfbf",
      boxShadow: "none",
    },
    ".Input:focus": {
      border: "1px solid #2a1f1c",
      boxShadow: "0 0 0 3px rgba(75,21,48,0.08)",
    },
    ".Tab": { border: "1px solid #dccfbf", boxShadow: "none" },
    ".Tab:hover": { border: "1px solid #2a1f1c" },
    ".Tab--selected": { border: "1px solid #2a1f1c", boxShadow: "none" },
  },
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clear, removeItem, setQuantity } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { open: openAuthModal } = useAuthModal();

  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);
  const [guestEmail, setGuestEmail] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponPreview, setCouponPreview] = useState<CouponPreview | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<CreateOrderResult | null>(null);
  const [savedMethods, setSavedMethods] = useState<PaymentMethod[] | null>(null);
  const [postalCodeNotFound, setPostalCodeNotFound] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<(typeof SHIPPING_OPTIONS)[number]["id"]>(
    "standard"
  );
  const selectedShipping = SHIPPING_OPTIONS.find((option) => option.id === shippingMethod)!;

  // Fetched once here (not re-fetched in the payment step) so the "guardar
  // tarjeta" checkbox below can hide itself for a shopper who already has a
  // saved card — showing "save this card" before they've even reached the
  // card form is exactly what read as broken.
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    userService
      .getPaymentMethods()
      .then((methods) => {
        if (!cancelled) setSavedMethods(methods);
      })
      .catch(() => {
        // Best-effort — worst case the checkbox just stays visible.
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // Prefills from the shipping address of the user's most recent order, but
  // only while the form is still untouched — an address the shopper already
  // started editing (even to a blank field) should never be clobbered by a
  // fetch that resolves later.
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    orderService
      .getMyOrders()
      .then((orders) => {
        if (cancelled || orders.length === 0) return;
        const mostRecent = [...orders].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        setAddress((prev) => (prev === EMPTY_ADDRESS ? mostRecent.shippingAddress : prev));
      })
      .catch(() => {
        // Best-effort — the shopper just types the address manually if this fails.
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // Autofills city/state from the postal code once it's a complete 5-digit
  // CP, so a typo there gets caught by "that doesn't look like a real
  // Mexican postal code" instead of silently reaching the courier. Never
  // overwrites a city/state the shopper already typed themselves.
  useEffect(() => {
    const postalCode = address.postalCode;
    if (!/^\d{5}$/.test(postalCode)) {
      setPostalCodeNotFound(false);
      return;
    }
    let cancelled = false;
    lookupPostalCode(postalCode).then((result) => {
      if (cancelled) return;
      if (!result) {
        setPostalCodeNotFound(true);
        return;
      }
      setPostalCodeNotFound(false);
      setAddress((prev) =>
        prev.postalCode === postalCode
          ? { ...prev, city: prev.city || result.city, state: prev.state || result.state }
          : prev
      );
    });
    return () => {
      cancelled = true;
    };
  }, [address.postalCode]);

  if (items.length === 0 && !order) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-black uppercase tracking-tight text-ink">
          Tu carrito está vacío
        </h1>
        <Link href="/tienda" className={`${buttonClasses("solid")} mt-8`}>
          Ir a la tienda
        </Link>
      </div>
    );
  }

  function updateAddress<K extends keyof ShippingAddress>(key: K, value: string) {
    setAddress((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreateOrder(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await orderService.createOrder({
        guestEmail: isAuthenticated ? undefined : guestEmail,
        items: items.map((item) => ({
          productId: item.product.id,
          size: item.size,
          quantity: item.quantity,
        })),
        shippingAddress: address,
        couponCode: couponCode || undefined,
        savePaymentMethod: isAuthenticated ? savePaymentMethod : undefined,
      });
      setOrder(result);
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo crear el pedido."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleValidateCoupon() {
    const code = couponCode.trim();
    if (!code) return;
    setIsValidatingCoupon(true);
    setCouponPreview(null);
    try {
      const result = await productService.validateCoupon(
        code,
        items.map((item) => ({
          productId: item.product.id,
          size: item.size,
          quantity: item.quantity,
        }))
      );
      setCouponPreview(result);
    } catch {
      setCouponPreview({
        valid: false,
        reason: "NOT_FOUND",
        message: "No se pudo validar el cupón.",
        code,
      });
    } finally {
      setIsValidatingCoupon(false);
    }
  }

  if (order) {
    return (
      <PaymentStep
        order={order}
        savedMethods={savedMethods}
        onSuccess={() => {
          clear();
          router.push(
            isAuthenticated
              ? `/cuenta/pedidos/${order.id}`
              : `/checkout/confirmacion?order=${encodeURIComponent(order.orderNumber)}`
          );
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-black uppercase tracking-tight text-ink">
        Checkout
      </h1>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:items-start lg:gap-16">
        <form onSubmit={handleCreateOrder} className="flex flex-col gap-8 lg:order-1">
          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <SectionTitle step={1} label="Contacto" />
              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={() => openAuthModal("login")}
                  className="text-xs font-medium uppercase tracking-[0.16em] text-ink underline underline-offset-2 transition-colors hover:text-velvet"
                >
                  Iniciar sesión
                </button>
              )}
            </div>
            {!isAuthenticated && (
              <FormField
                id="guestEmail"
                label="Correo electrónico"
                type="email"
                required
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
              />
            )}
            {isAuthenticated && user && (
              <p className="text-sm text-ink-muted">
                Se usará el correo de tu cuenta: <span className="text-ink">{user.email}</span>
              </p>
            )}
          </section>

          <section>
            <SectionTitle step={2} label="Dirección de envío" />
            <div className="flex flex-col gap-4">
              <FormField
                id="fullName"
                label="Nombre completo"
                required
                value={address.fullName}
                onChange={(e) => updateAddress("fullName", e.target.value)}
              />
              <FormField
                id="phone"
                label="Teléfono"
                type="tel"
                value={address.phone}
                onChange={(e) => updateAddress("phone", e.target.value)}
              />
              <FormField
                id="line1"
                label="Dirección"
                required
                value={address.line1}
                onChange={(e) => updateAddress("line1", e.target.value)}
              />
              <FormField
                id="line2"
                label="Depto / referencias (opcional)"
                value={address.line2}
                onChange={(e) => updateAddress("line2", e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  id="city"
                  label="Ciudad"
                  required
                  value={address.city}
                  onChange={(e) => updateAddress("city", e.target.value)}
                />
                <FormField
                  id="state"
                  label="Estado"
                  required
                  value={address.state}
                  onChange={(e) => updateAddress("state", e.target.value)}
                />
              </div>
              <FormField
                id="postalCode"
                label="Código postal"
                required
                inputMode="numeric"
                pattern="\d{5}"
                maxLength={5}
                value={address.postalCode}
                onChange={(e) =>
                  updateAddress("postalCode", e.target.value.replace(/\D/g, "").slice(0, 5))
                }
              />
              {postalCodeNotFound && (
                <p className="-mt-2 text-xs text-ink-muted">
                  No encontramos ese código postal — verifica que sea correcto.
                </p>
              )}
            </div>
          </section>

          <section>
            <SectionTitle step={3} label="Método de envío" />
            <div className="flex flex-col gap-3">
              {SHIPPING_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-center justify-between gap-4 border px-4 py-3 transition-colors ${
                    shippingMethod === option.id
                      ? "border-ink bg-cream-soft"
                      : "border-sand hover:border-ink"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={shippingMethod === option.id}
                      onChange={() => setShippingMethod(option.id)}
                    />
                    <div>
                      <p className="text-sm text-ink">{option.label}</p>
                      <p className="text-xs text-ink-muted">
                        {option.carrier} · {option.eta}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-ink">{formatCurrency(option.price)}</p>
                </label>
              ))}
            </div>
          </section>

          {isAuthenticated && savedMethods && savedMethods.length === 0 && (
            <label className="flex items-center gap-2 text-sm text-ink-muted">
              <input
                type="checkbox"
                checked={savePaymentMethod}
                onChange={(e) => setSavePaymentMethod(e.target.checked)}
              />
              Guardar la tarjeta que use en el siguiente paso para mis próximas compras
            </label>
          )}

          {error && <p className="text-sm text-velvet">{error}</p>}

          <button type="submit" disabled={isSubmitting} className={buttonClasses("solid")}>
            {isSubmitting ? "Procesando…" : "Continuar al pago"}
          </button>
        </form>

        <OrderSummary
          className="lg:sticky lg:top-24 lg:order-2"
          lines={items.map((item) => ({
            key: `${item.product.id}-${item.size}`,
            href: `/producto/${item.product.slug}`,
            image: item.product.images[0],
            name: item.product.name,
            meta: `Talla ${item.size}`,
            amount: formatCurrency(item.product.price * item.quantity),
            quantity: item.quantity,
            onQuantityChange: (quantity: number) =>
              setQuantity(item.product.id, item.size, quantity),
            onRemove: () => removeItem(item.product.id, item.size),
          }))}
          couponSlot={
            <CouponField
              code={couponCode}
              onCodeChange={(value) => {
                setCouponCode(value);
                setCouponPreview(null);
              }}
              onValidate={handleValidateCoupon}
              isValidating={isValidatingCoupon}
              preview={couponPreview}
            />
          }
          rows={[
            { label: "Subtotal", value: formatCurrency(subtotal) },
            {
              label: `Envío (${selectedShipping.carrier})`,
              value: formatCurrency(selectedShipping.price),
            },
            {
              label: "Total estimado",
              value: formatCurrency(subtotal + selectedShipping.price),
              strong: true,
            },
          ]}
          note="El total final (con descuentos o cupón aplicado) se calcula en el siguiente paso."
        />
      </div>
    </div>
  );
}

function SectionTitle({ step, label }: { step: number; label: string }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-[10px] font-semibold text-cream-soft">
        {step}
      </span>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink">{label}</p>
    </div>
  );
}

function OrderSummary({
  lines,
  rows,
  note,
  className = "",
  couponSlot,
}: {
  lines: {
    key: string;
    href?: string;
    image: { src: string; alt: string };
    name: string;
    meta: string;
    amount: string;
    quantity?: number;
    onQuantityChange?: (quantity: number) => void;
    onRemove?: () => void;
  }[];
  rows: { label: string; value: string; strong?: boolean }[];
  note?: string;
  className?: string;
  couponSlot?: React.ReactNode;
}) {
  return (
    <div className={`border border-sand bg-cream-soft p-6 ${className}`}>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">
        Tu pedido
      </p>
      <ul className="mt-3 flex flex-col divide-y divide-sand">
        {lines.map((line) => (
          <li key={line.key} className="flex gap-3 py-3 first:pt-0">
            {line.href ? (
              <Link
                href={line.href}
                className="relative h-24 w-20 shrink-0 overflow-hidden bg-sand"
              >
                <Image src={line.image.src} alt={line.image.alt} fill sizes="80px" className="object-cover" />
              </Link>
            ) : (
              <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-sand">
                <Image src={line.image.src} alt={line.image.alt} fill sizes="80px" className="object-cover" />
              </div>
            )}
            <div className="flex flex-1 justify-between gap-2">
              <div className="flex flex-col justify-between">
                <div>
                  {line.href ? (
                    <Link href={line.href} className="text-sm text-ink hover:text-velvet">
                      {line.name}
                    </Link>
                  ) : (
                    <p className="text-sm text-ink">{line.name}</p>
                  )}
                  <p className="mt-0.5 text-xs uppercase tracking-[0.1em] text-ink-muted">{line.meta}</p>
                </div>
                {line.onQuantityChange && line.quantity !== undefined && (
                  <div className="flex items-center border border-sand">
                    <button
                      type="button"
                      aria-label="Disminuir cantidad"
                      onClick={() => line.onQuantityChange!(line.quantity! - 1)}
                      className="flex h-6 w-6 items-center justify-center text-ink hover:bg-paper"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-xs">{line.quantity}</span>
                    <button
                      type="button"
                      aria-label="Aumentar cantidad"
                      onClick={() => line.onQuantityChange!(line.quantity! + 1)}
                      className="flex h-6 w-6 items-center justify-center text-ink hover:bg-paper"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end justify-between">
                {line.onRemove ? (
                  <button
                    type="button"
                    onClick={line.onRemove}
                    aria-label="Quitar del pedido"
                    className="flex h-6 w-6 shrink-0 items-center justify-center text-ink-muted transition-colors hover:text-velvet"
                  >
                    <RemoveIcon />
                  </button>
                ) : (
                  <span />
                )}
                <p className="shrink-0 text-sm font-medium text-ink">{line.amount}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {couponSlot && <div className="mt-4">{couponSlot}</div>}

      <div className="mt-4 flex flex-col gap-1.5 border-t border-sand pt-4 text-sm">
        {rows.map((row) => (
          <div
            key={row.label}
            className={`flex justify-between ${row.strong ? "text-base font-semibold text-ink" : "text-ink-muted"}`}
          >
            <span>{row.label}</span>
            <span className={row.strong ? "text-ink" : "text-ink"}>{row.value}</span>
          </div>
        ))}
      </div>

      {note && <p className="mt-3 text-xs text-ink-muted">{note}</p>}

      <div className="mt-5 flex items-center gap-2 border-t border-sand pt-4 text-xs text-ink-muted">
        <LockIcon />
        Pago 100% seguro y encriptado
      </div>
    </div>
  );
}

function CouponField({
  code,
  onCodeChange,
  onValidate,
  isValidating,
  preview,
}: {
  code: string;
  onCodeChange: (value: string) => void;
  onValidate: () => void;
  isValidating: boolean;
  preview: CouponPreview | null;
}) {
  return (
    <div>
      <label htmlFor="couponCode" className="sr-only">
        Código de cupón o tarjeta de regalo
      </label>
      <div className="flex overflow-hidden rounded-lg border border-ink transition-shadow duration-200 focus-within:shadow-[0_0_0_3px_rgba(75,21,48,0.08)]">
        <input
          id="couponCode"
          placeholder="Código de cupón o tarjeta de regalo"
          value={code}
          onChange={(e) => onCodeChange(e.target.value.toUpperCase())}
          className="min-w-0 flex-1 bg-paper px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-muted"
        />
        <button
          type="button"
          onClick={onValidate}
          disabled={!code.trim() || isValidating}
          className="shrink-0 border-l border-ink px-5 text-xs font-semibold uppercase tracking-wide text-ink-muted transition-colors enabled:hover:text-ink disabled:cursor-not-allowed disabled:text-ink-muted/40"
        >
          {isValidating ? "Validando…" : "Aplicar"}
        </button>
      </div>

      {preview && preview.valid && (
        <p className="mt-2 text-sm text-ink">
          Cupón aplicado
          {preview.discountAmount !== undefined && (
            <>
              : <span className="font-medium">-{formatCurrency(preview.discountAmount)}</span>
            </>
          )}
        </p>
      )}
      {preview && !preview.valid && (
        <p className="mt-2 text-sm text-velvet">{COUPON_REASON_LABELS[preview.reason]}</p>
      )}
    </div>
  );
}

function PaymentStep({
  order,
  savedMethods,
  onSuccess,
}: {
  order: CreateOrderResult;
  savedMethods: PaymentMethod[] | null;
  onSuccess: () => void;
}) {
  const stripePromise = useMemo(
    () => loadStripe(order.publishableKey),
    [order.publishableKey]
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-black uppercase tracking-tight text-ink">Pago</h1>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:items-start lg:gap-16">
        <div className="lg:order-1">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-[10px] font-semibold text-cream-soft">
              3
            </span>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink">Pago</p>
          </div>
          <div className="border border-sand bg-paper p-5">
            <Elements
              stripe={stripePromise}
              options={{ clientSecret: order.clientSecret, appearance: STRIPE_APPEARANCE }}
            >
              <PaymentForm
                order={order}
                savedMethods={savedMethods}
                onSuccess={onSuccess}
                total={formatCurrency(order.total, order.currency.toUpperCase())}
              />
            </Elements>
          </div>
        </div>

        <OrderSummary
          className="lg:sticky lg:top-24 lg:order-2"
          lines={order.items.map((item) => ({
            key: item.id,
            href: `/producto/${item.productSku.toLowerCase()}`,
            image: { src: item.productImage, alt: item.productName },
            name: item.productName,
            meta: `Talla ${item.size} · Cant. ${item.quantity}`,
            amount: formatCurrency(item.lineTotal, order.currency.toUpperCase()),
          }))}
          rows={[
            { label: "Subtotal", value: formatCurrency(order.subtotal, order.currency.toUpperCase()) },
            ...(order.discountTotal > 0
              ? [
                  {
                    label: `Descuento${order.couponCode ? ` (${order.couponCode})` : ""}`,
                    value: `−${formatCurrency(order.discountTotal, order.currency.toUpperCase())}`,
                  },
                ]
              : []),
            { label: "Total", value: formatCurrency(order.total, order.currency.toUpperCase()), strong: true },
          ]}
        />
      </div>
    </div>
  );
}

function PaymentForm({
  order,
  savedMethods,
  onSuccess,
  total,
}: {
  order: CreateOrderResult;
  savedMethods: PaymentMethod[] | null;
  onSuccess: () => void;
  total: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { isAuthenticated } = useAuth();
  const [isPaying, setIsPaying] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasSavedMethods = !!savedMethods && savedMethods.length > 0;
  const [selectedMethodId, setSelectedMethodId] = useState<string>(
    hasSavedMethods ? savedMethods![0].id : "new"
  );
  const usingNewCard = !hasSavedMethods || selectedMethodId === "new";

  async function handlePay(event: React.FormEvent) {
    event.preventDefault();
    if (!stripe) return;
    if (usingNewCard && !elements) return;
    setError(null);
    setIsPaying(true);

    // Some payment methods (3-D Secure challenges, OXXO, SPEI) leave the page
    // entirely — this is the only state that survives that round trip, read
    // back by /checkout/retorno once Stripe sends the shopper home.
    savePendingOrder({
      orderId: order.id,
      orderNumber: order.orderNumber,
      isAuthenticated,
      publishableKey: order.publishableKey,
    });

    // Paying with an already-saved card skips the Payment Element entirely —
    // confirmCardPayment against an existing PaymentMethod id (no card data
    // to collect) instead of the elements-bound confirmPayment used for a
    // freshly-entered card.
    const { error: stripeError, paymentIntent } = usingNewCard
      ? await stripe.confirmPayment({
          elements: elements!,
          redirect: "if_required",
          confirmParams: {
            return_url: `${window.location.origin}/checkout/retorno`,
          },
        })
      : await stripe.confirmCardPayment(order.clientSecret, {
          payment_method: selectedMethodId,
        });

    if (stripeError) {
      clearPendingOrder();
      setError(stripeError.message ?? "No se pudo procesar el pago.");
      setIsPaying(false);
      return;
    }

    if (
      paymentIntent &&
      (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")
    ) {
      clearPendingOrder();
      // Stripe confirming client-side isn't the same as the order being
      // PAID — that only happens once the payment_intent.succeeded webhook
      // lands (docs/API-FRONTEND.md sección 7). This is that "confirmando
      // pago" screen the docs call for, backed by a real poll instead of a
      // fake delay.
      setIsConfirming(true);
      await waitForOrderPaid(order.id, isAuthenticated);
      onSuccess();
      return;
    }

    clearPendingOrder();
    setError("No se pudo confirmar el pago. Intenta de nuevo.");
    setIsPaying(false);
  }

  if (isConfirming) {
    return <ConfirmingPayment />;
  }

  return (
    <form onSubmit={handlePay} className="flex flex-col gap-5">
      {hasSavedMethods && (
        <SavedCardPicker
          methods={savedMethods!}
          selectedId={selectedMethodId}
          onSelect={setSelectedMethodId}
        />
      )}
      {usingNewCard && <PaymentElement />}
      {error && <p className="text-sm text-velvet">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || isPaying}
        className={`${buttonClasses("solid")} gap-2.5`}
      >
        {isPaying && <Spinner className="border-cream-soft/40 border-t-cream-soft" />}
        {isPaying ? "Procesando pago…" : `Pagar ${total}`}
      </button>
    </form>
  );
}

function SavedCardPicker({
  methods,
  selectedId,
  onSelect,
}: {
  methods: PaymentMethod[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">
        Método de pago
      </p>
      <div className="mt-2.5 flex flex-col gap-2">
        {methods.map((method) => (
          <label
            key={method.id}
            className={`flex cursor-pointer items-center gap-3 border px-4 py-3 text-sm transition-colors ${
              selectedId === method.id ? "border-ink" : "border-sand hover:border-ink"
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              checked={selectedId === method.id}
              onChange={() => onSelect(method.id)}
              className="accent-ink"
            />
            <span className="text-ink">
              {cardBrandLabel(method.brand)} •••• {method.last4}
            </span>
            <span className="ml-auto text-xs text-ink-muted">
              exp. {String(method.expMonth).padStart(2, "0")}/{method.expYear}
            </span>
          </label>
        ))}
        <label
          className={`flex cursor-pointer items-center gap-3 border px-4 py-3 text-sm transition-colors ${
            selectedId === "new" ? "border-ink" : "border-sand hover:border-ink"
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            checked={selectedId === "new"}
            onChange={() => onSelect("new")}
            className="accent-ink"
          />
          <span className="text-ink">Usar otra tarjeta</span>
        </label>
      </div>
    </div>
  );
}

function ConfirmingPayment() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <Spinner className="h-9 w-9 border-sand border-t-ink" />
      <div>
        <p className="text-sm font-medium text-ink">Confirmando tu pago…</p>
        <p className="mt-1 text-xs text-ink-muted">No cierres ni recargues esta página.</p>
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
      <rect x="4" y="10" width="16" height="10" rx="1" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
