"use client";

import { buttonClasses } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";

// The brand-styled stand-in for window.confirm() — used anywhere a
// destructive action (remove a card, delete the account) needs a real
// confirmation step instead of the native browser dialog. A sheet from the
// bottom on a phone (buttons stacked, thumb-sized) and a small centered
// dialog on desktop, like every other panel on the site.
export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isConfirming = false,
  danger = false,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isConfirming?: boolean;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Sheet
      isOpen={isOpen}
      onClose={onCancel}
      desktop="center"
      labelledBy="confirm-dialog-heading"
      className="lg:max-w-sm!"
    >
      <div className="px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-1 lg:px-6 lg:pb-6 lg:pt-6">
        <h2
          id="confirm-dialog-heading"
          className="text-lg font-black uppercase leading-tight tracking-tight text-ink"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{description}</p>
        <div className="mt-6 flex flex-col gap-3 lg:flex-row-reverse">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className={`h-[52px] px-6 text-xs font-medium uppercase tracking-[0.18em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 lg:flex-1 ${
              danger
                ? "bg-velvet text-cream-soft hover:bg-velvet-light"
                : "bg-ink text-cream-soft hover:bg-velvet"
            }`}
          >
            {isConfirming ? "Espera…" : confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className={buttonClasses("outline", "h-[52px] lg:flex-1")}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </Sheet>
  );
}
