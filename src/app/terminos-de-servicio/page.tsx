import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

// Placeholder copy — pendiente de revisión legal con la clienta antes de publicar.
export default function TerminosDeServicioPage() {
  return (
    <LegalPageLayout title="Términos de servicio">
      <p>
        Al usar el sitio de Carmessie Velvet y realizar una compra, aceptas los siguientes
        términos.
      </p>

      <div>
        <h2 className="mb-1.5 text-xs font-bold uppercase tracking-[0.16em] text-ink">
          Productos y disponibilidad
        </h2>
        <p>
          Trabajamos con tiraje corto — las piezas no se reponen una vez agotadas. Precios y
          disponibilidad pueden cambiar sin previo aviso.
        </p>
      </div>

      <div>
        <h2 className="mb-1.5 text-xs font-bold uppercase tracking-[0.16em] text-ink">Pagos</h2>
        <p>
          Los pagos se procesan a través de un proveedor externo certificado. No almacenamos
          datos completos de tarjetas en nuestros servidores.
        </p>
      </div>

      <div>
        <h2 className="mb-1.5 text-xs font-bold uppercase tracking-[0.16em] text-ink">
          Envíos y devoluciones
        </h2>
        <p>
          Consulta nuestra{" "}
          <a href="/devoluciones" className="text-ink underline underline-offset-2 hover:text-velvet">
            política de devoluciones
          </a>{" "}
          para tiempos y condiciones.
        </p>
      </div>

      <div>
        <h2 className="mb-1.5 text-xs font-bold uppercase tracking-[0.16em] text-ink">
          Propiedad intelectual
        </h2>
        <p>
          Todo el contenido del sitio (fotografías, diseños, textos, logotipo) es propiedad de
          Carmessie Velvet y no puede reproducirse sin autorización.
        </p>
      </div>

      <div>
        <h2 className="mb-1.5 text-xs font-bold uppercase tracking-[0.16em] text-ink">
          Cambios a estos términos
        </h2>
        <p>
          Podemos actualizar estos términos ocasionalmente. La versión vigente es siempre la
          publicada en esta página.
        </p>
      </div>

      <p className="text-xs text-ink-muted/70">
        Estos son términos genéricos, pendientes de personalización final. Última actualización:
        2026.
      </p>
    </LegalPageLayout>
  );
}
