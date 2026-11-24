"use client";

import { Sheet } from "@/components/ui/Sheet";

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
  // Same panel as the cart and quick add: a sheet that rises from the bottom
  // on a phone (draggable to dismiss), a centered dialog on desktop. It opens
  // over the quick-add dialog too, so it is mounted after it and sits above.
  return (
    <Sheet isOpen={isOpen} onClose={onClose} desktop="center" labelledBy="size-guide-heading">
      <div className="flex shrink-0 items-start justify-between gap-4 px-5 pb-2 lg:px-8 lg:pt-7">
        <div>
          <h2
            id="size-guide-heading"
            className="text-xl font-black uppercase leading-tight tracking-tight text-ink"
          >
            Guía de tallas
          </h2>
          <p className="mt-1 text-xs text-ink-muted">Todas las medidas en centímetros.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="-mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center text-ink-muted transition-colors hover:text-ink"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="overflow-y-auto overscroll-contain px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:px-8 lg:pb-8">
        <SizeTable
          title="Corset y bustier"
          columns={["Talla", "Pecho"]}
          note="Todos son ajustables por la espalda."
        >
          {CORSET_ROWS.map((row) => (
            <tr key={row.size}>
              <td className="py-2.5 font-medium text-ink">{row.size}</td>
              <td className="py-2.5">{row.pecho}</td>
            </tr>
          ))}
        </SizeTable>

        <SizeTable title="Faldas" columns={["Talla", "Cintura", "Cadera"]}>
          {FALDA_ROWS.map((row) => (
            <tr key={row.size}>
              <td className="py-2.5 font-medium text-ink">{row.size}</td>
              <td className="py-2.5">{row.cintura} cm</td>
              <td className="py-2.5">{row.cadera} cm</td>
            </tr>
          ))}
        </SizeTable>

        <SizeTable title="Pantalones" columns={["Talla", "Cintura", "Cadera", "Largo"]}>
          {PANTALON_ROWS.map((row) => (
            <tr key={row.size}>
              <td className="py-2.5 font-medium text-ink">{row.size}</td>
              <td className="py-2.5">{row.cintura} cm</td>
              <td className="py-2.5">{row.cadera} cm</td>
              <td className="py-2.5">{row.largo} cm</td>
            </tr>
          ))}
        </SizeTable>
      </div>
    </Sheet>
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
