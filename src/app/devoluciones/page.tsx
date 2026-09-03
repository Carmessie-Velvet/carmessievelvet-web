import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

export default function DevolucionesPage() {
  return (
    <LegalPageLayout title="Devoluciones">
      <p>Tienes 15 días naturales a partir de que recibes tu pedido para solicitar un cambio o reembolso.</p>

      <div>
        <h2 className="mb-1.5 text-xs font-bold uppercase tracking-[0.16em] text-ink">
          Condiciones
        </h2>
        <ul className="flex list-disc flex-col gap-1.5 pl-5">
          <li>La prenda no debe haber sido usada.</li>
          <li>Debe regresarse en su empaque original.</li>
          <li>El costo de envío de la devolución corre por cuenta del cliente.</li>
        </ul>
      </div>

      <div>
        <h2 className="mb-1.5 text-xs font-bold uppercase tracking-[0.16em] text-ink">
          ¿Cómo solicito un cambio o reembolso?
        </h2>
        <p>
          Escríbenos a{" "}
          <a
            href="mailto:carmessievelvet@gmail.com"
            className="text-ink underline underline-offset-2 hover:text-velvet"
          >
            carmessievelvet@gmail.com
          </a>{" "}
          indicando tu número de pedido y el motivo. Te respondemos en un plazo de 24 a 48 horas
          con los pasos a seguir.
        </p>
      </div>

      <div>
        <h2 className="mb-1.5 text-xs font-bold uppercase tracking-[0.16em] text-ink">
          Cancelaciones
        </h2>
        <p>
          Puedes cancelar tu pedido en cualquier momento escribiendo al mismo correo,{" "}
          <a
            href="mailto:carmessievelvet@gmail.com"
            className="text-ink underline underline-offset-2 hover:text-velvet"
          >
            carmessievelvet@gmail.com
          </a>{" "}
          — no hay un límite de tiempo para solicitarlo.
        </p>
      </div>
    </LegalPageLayout>
  );
}
