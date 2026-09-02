import Link from "next/link";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";
import { Accordion } from "@/components/ui/Accordion";

// Placeholder copy — pendiente de confirmar respuestas reales con la clienta.
const faqs = [
  {
    question: "¿Cuánto tarda mi pedido en llegar?",
    answer: "Hacemos envíos a todo México. El tiempo estimado de entrega es de 3 a 7 días hábiles una vez confirmado el pago.",
  },
  {
    question: "¿Puedo cambiar o devolver una prenda?",
    answer: (
      <>
        Sí, tienes 15 días naturales desde la entrega para solicitar un cambio sin costo. Revisa
        las condiciones completas en{" "}
        <Link href="/devoluciones" className="text-ink underline underline-offset-2 hover:text-velvet">
          Devoluciones
        </Link>
        .
      </>
    ),
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer: "Aceptamos tarjetas de crédito y débito a través de una pasarela de pago segura.",
  },
  {
    question: "¿Cómo sé qué talla pedir?",
    answer: "Cada producto incluye las tallas disponibles (XS, S, M, L). Si tienes dudas sobre cuál te queda mejor, escríbenos antes de comprar.",
  },
  {
    question: "¿Puedo rastrear mi pedido?",
    answer: (
      <>
        Sí — si tienes cuenta, entra a{" "}
        <Link href="/cuenta/pedidos" className="text-ink underline underline-offset-2 hover:text-velvet">
          Mi cuenta &gt; Pedidos
        </Link>{" "}
        para ver el estado de tu compra.
      </>
    ),
  },
  {
    question: "¿Hacen envíos internacionales?",
    answer: "Por ahora solo enviamos dentro de México. Estamos evaluando envíos internacionales a futuro.",
  },
];

export default function PreguntasFrecuentesPage() {
  return (
    <LegalPageLayout title="Preguntas frecuentes">
      <Accordion items={faqs} />
      <p className="text-sm">
        ¿No encontraste lo que buscabas?{" "}
        <Link href="/contacto" className="text-ink underline underline-offset-2 hover:text-velvet">
          Contáctanos
        </Link>
        .
      </p>
    </LegalPageLayout>
  );
}
