import type { OrderStatus } from "@/types/order";

// Only the "happy path" statuses get a step — PENDING (not paid yet),
// CANCELLED, REFUNDED and PARTIALLY_REFUNDED all break the linear
// pagado→entregado flow, so the stepper just doesn't render for those (the
// status badge above it already covers them).
const STEPS: { status: OrderStatus; label: string; Icon: typeof PaidIcon }[] = [
  { status: "PAID", label: "Pagado", Icon: PaidIcon },
  { status: "PROCESSING", label: "En preparación", Icon: BoxIcon },
  { status: "SHIPPED", label: "Enviado", Icon: TruckIcon },
  { status: "DELIVERED", label: "Entregado", Icon: HouseIcon },
];

export function OrderStatusStepper({ status }: { status: OrderStatus }) {
  const currentIndex = STEPS.findIndex((step) => step.status === status);
  if (currentIndex === -1) return null;

  return (
    <div
      className="mt-6 flex items-start overflow-x-auto border-t border-sand pt-6"
      role="list"
      aria-label="Estatus del pedido"
    >
      {STEPS.map((step, index) => {
        const isReached = index <= currentIndex;
        return (
          <div key={step.status} className="flex flex-1 items-start last:flex-none">
            <div className="flex shrink-0 flex-col items-center gap-1.5" role="listitem">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11 ${
                  isReached ? "bg-ink text-cream-soft" : "bg-cream-soft text-ink-muted"
                }`}
              >
                <step.Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
              <span
                className={`w-[4.5rem] break-words text-center text-[9px] font-medium uppercase leading-tight tracking-[0.02em] sm:text-[10px] sm:tracking-[0.06em] ${
                  isReached ? "text-ink" : "text-ink-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`mt-[18px] h-px flex-1 sm:mt-[22px] ${index < currentIndex ? "bg-ink" : "bg-sand"}`}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PaidIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className={className} aria-hidden="true">
      <path d="M6 3h9l3 3v15H6z" strokeLinejoin="round" />
      <path d="M9 10.5l2 2 4-4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BoxIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className={className} aria-hidden="true">
      <path d="M3.5 8.2 12 4l8.5 4.2v8.6L12 21 3.5 16.8Z" strokeLinejoin="round" />
      <path d="M3.7 8.4 12 12.4l8.3-4M12 12.4V21" strokeLinejoin="round" />
    </svg>
  );
}

function TruckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className={className} aria-hidden="true">
      <path d="M2.5 6.5h11v10h-11z" strokeLinejoin="round" />
      <path d="M13.5 10h4l3 3v3.5h-7z" strokeLinejoin="round" />
      <circle cx="7" cy="17.5" r="1.7" />
      <circle cx="17" cy="17.5" r="1.7" />
    </svg>
  );
}

function HouseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className={className} aria-hidden="true">
      <path d="M4 11.5 12 4l8 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v10h12V10" strokeLinejoin="round" />
      <path d="M10 20v-6h4v6" strokeLinejoin="round" />
    </svg>
  );
}
