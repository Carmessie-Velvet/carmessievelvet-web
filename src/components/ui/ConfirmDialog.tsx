"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLockBodyScroll, useEscapeKey } from "@/lib/use-lock-body-scroll";
import { buttonClasses } from "@/components/ui/Button";

// The brand-styled stand-in for window.confirm() — used anywhere a
// destructive action (remove a card, delete the account) needs a real
// confirmation step instead of the native browser dialog.
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
  useLockBodyScroll(isOpen);
  useEscapeKey(onCancel, isOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-[2px]"
          onClick={onCancel}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-heading"
        >
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-paper p-6 shadow-[0_30px_70px_-20px_rgba(42,31,28,0.45)]"
          >
            <h2
              id="confirm-dialog-heading"
              className="text-base font-black uppercase tracking-tight text-ink"
            >
              {title}
            </h2>
            <p className="mt-2 text-sm text-ink-muted">{description}</p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className={`${buttonClasses("outline")} flex-1`}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isConfirming}
                className={`flex-1 px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
                  danger
                    ? "bg-velvet text-cream-soft hover:bg-velvet-light"
                    : "bg-ink text-cream-soft hover:bg-velvet"
                }`}
              >
                {isConfirming ? "Espera…" : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
