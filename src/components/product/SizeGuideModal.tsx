"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLockBodyScroll, useEscapeKey } from "@/lib/use-lock-body-scroll";

// All measurements in cm, straight from the client's own size charts — one
// modal with all three garment types (not just the product's own category)
// since a "set" pairs a corset/bustier with either a skirt or pants, and
// there's no per-garment-type field on Product yet to pick just one table.
const CORSET_ROWS = [
  { size: "XS", pecho: "85 cm" },
  { size: "S", pecho: "89 cm" },
  { size: "M", pecho: "94 cm" },
  { size: "L", pecho: "101 cm" },
];

const FALDA_ROWS = [
  { size: "XS", cintura: 63, cadera: 88 },
  { size: "S", cintura: 67, cadera: 91 },
  { size: "M", cintura: 72, cadera: 100 },
  { size: "L", cintura: 80, cadera: 108 },
];

const PANTALON_ROWS = [
  { size: "XS", cintura: 63, cadera: 98, largo: 105 },
  { size: "S", cintura: 67, cadera: 104, largo: 105 },
  { size: "M", cintura: 72, cadera: 110, largo: 105 },
  { size: "L", cintura: 80, cadera: 115, largo: 105 },
];

export function SizeGuideModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  useLockBodyScroll(isOpen);
  useEscapeKey(onClose, isOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-[2px]"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="size-guide-heading"
        >
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto bg-paper p-6 shadow-[0_30px_70px_-20px_rgba(42,31,28,0.45)] sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <h2
                id="size-guide-heading"
                className="text-base font-black uppercase tracking-tight text-ink"
              >
                Guía de tallas
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="shrink-0 text-ink-muted transition-colors hover:text-ink"
              >
                <CloseIcon />
              </button>
            </div>
            <p className="mt-1 text-xs text-ink-muted">Todas las medidas en centímetros.</p>

            <SizeTable
              title="Corset y bustier"
              columns={["Talla", "Pecho"]}
              note="Todos son ajustables por la espalda."
            >
              {CORSET_ROWS.map((row) => (
                <tr key={row.size}>
                  <td className="py-2 font-medium text-ink">{row.size}</td>
                  <td className="py-2">{row.pecho}</td>
                </tr>
              ))}
            </SizeTable>

            <SizeTable title="Faldas" columns={["Talla", "Cintura", "Cadera"]}>
              {FALDA_ROWS.map((row) => (
                <tr key={row.size}>
                  <td className="py-2 font-medium text-ink">{row.size}</td>
                  <td className="py-2">{row.cintura} cm</td>
                  <td className="py-2">{row.cadera} cm</td>
                </tr>
              ))}
            </SizeTable>

            <SizeTable title="Pantalones" columns={["Talla", "Cintura", "Cadera", "Largo"]}>
              {PANTALON_ROWS.map((row) => (
                <tr key={row.size}>
                  <td className="py-2 font-medium text-ink">{row.size}</td>
                  <td className="py-2">{row.cintura} cm</td>
                  <td className="py-2">{row.cadera} cm</td>
                  <td className="py-2">{row.largo} cm</td>
                </tr>
              ))}
            </SizeTable>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SizeTable({
  title,
  columns,
  note,
  children,
}: {
  title: string;
  columns: string[];
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink">{title}</p>
      <table className="mt-2.5 w-full border-collapse text-left text-sm text-ink-muted">
        <thead>
          <tr className="border-b border-sand">
            {columns.map((col) => (
              <th
                key={col}
                className="py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-sand">{children}</tbody>
      </table>
      {note && <p className="mt-2 text-xs text-ink-muted">{note}</p>}
    </div>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
