import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

// Placeholder copy — pendiente de revisión legal con la clienta antes de publicar.
export default function PoliticaDePrivacidadPage() {
  return (
    <LegalPageLayout title="Política de privacidad">
      <p>
        En Carmessie Velvet respetamos tu privacidad. Este aviso explica qué información
        recopilamos cuando visitas o compras en nuestro sitio, cómo la usamos y qué opciones
        tienes al respecto.
      </p>

      <div>
        <h2 className="mb-1.5 text-xs font-bold uppercase tracking-[0.16em] text-ink">
          Información que recopilamos
        </h2>
        <p>
          Nombre, correo electrónico, teléfono y dirección de envío cuando creas una cuenta o
          realizas un pedido; datos de pago procesados directamente por nuestro proveedor de
          pagos (nunca almacenamos números de tarjeta completos); e información de navegación
          básica (páginas visitadas, dispositivo) con fines de mejora del sitio.
        </p>
      </div>

      <div>
        <h2 className="mb-1.5 text-xs font-bold uppercase tracking-[0.16em] text-ink">
          Cómo usamos tu información
        </h2>
        <p>
          Para procesar y dar seguimiento a tus pedidos, comunicarnos contigo sobre tu cuenta o
          compras, y — solo si diste tu consentimiento — enviarte novedades y promociones de la
          marca.
        </p>
      </div>

      <div>
        <h2 className="mb-1.5 text-xs font-bold uppercase tracking-[0.16em] text-ink">
          Con quién la compartimos
        </h2>
        <p>
          Compartimos datos únicamente con los proveedores necesarios para operar la tienda
          (procesamiento de pagos y paquetería). No vendemos tu información a terceros.
        </p>
      </div>

      <div>
        <h2 className="mb-1.5 text-xs font-bold uppercase tracking-[0.16em] text-ink">
          Tus derechos (ARCO)
        </h2>
        <p>
          Puedes solicitar acceso, rectificación, cancelación u oposición al tratamiento de tus
          datos personales en cualquier momento escribiéndonos a través de nuestra{" "}
          <a href="/contacto" className="text-ink underline underline-offset-2 hover:text-velvet">
            página de contacto
          </a>
          .
        </p>
      </div>

      <p className="text-xs text-ink-muted/70">
        Este es un aviso de privacidad genérico, pendiente de personalización final. Última
        actualización: 2026.
      </p>
    </LegalPageLayout>
  );
}
