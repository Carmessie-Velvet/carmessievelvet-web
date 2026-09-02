import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

// Placeholder copy — pendiente de confirmar condiciones reales con la clienta.
export default function DevolucionesPage() {
  return (
    <LegalPageLayout title="Devoluciones">
      <p>Cambios sin costo dentro de los primeros 15 días naturales a partir de la entrega.</p>

      <div>
        <h2 className="mb-1.5 text-xs font-bold uppercase tracking-[0.16em] text-ink">
          Condiciones
        </h2>
        <ul className="flex list-disc flex-col gap-1.5 pl-5">
          <li>La prenda debe estar sin uso, sin lavar y con las etiquetas originales.</li>
          <li>Debe conservarse el empaque original siempre que sea posible.</li>
          <li>
            Por higiene, no aceptamos cambios ni devoluciones de corsets ni prendas íntimas ya
            usadas.
          </li>
        </ul>
      </div>

      <div>
        <h2 className="mb-1.5 text-xs font-bold uppercase tracking-[0.16em] text-ink">
          ¿Cómo solicito un cambio?
        </h2>
        <p>
          Escríbenos desde nuestra{" "}
          <a href="/contacto" className="text-ink underline underline-offset-2 hover:text-velvet">
            página de contacto
          </a>{" "}
          indicando tu número de pedido y el motivo del cambio. Te responderemos con los pasos a
          seguir.
        </p>
      </div>

      <div>
        <h2 className="mb-1.5 text-xs font-bold uppercase tracking-[0.16em] text-ink">
          Reembolsos
        </h2>
        <p>
          Una vez recibida y revisada la prenda, el reembolso se procesa al método de pago
          original en un plazo estimado de 5 a 10 días hábiles.
        </p>
      </div>

      <p className="text-xs text-ink-muted/70">
        Política genérica sujeta a confirmación final. Última actualización: 2026.
      </p>
    </LegalPageLayout>
  );
}
