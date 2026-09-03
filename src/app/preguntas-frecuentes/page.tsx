import Link from "next/link";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";
import { Accordion } from "@/components/ui/Accordion";

const faqs = [
  {
    question: "¿Cuánto tarda mi pedido en llegar?",
    answer: (
      <>
        Nuestras piezas son de tiraje corto — el tiempo de elaboración es de 3 a 4 semanas antes
        de que tu pedido salga a envío. Una vez que sale, tienes dos opciones:
        <ul className="mt-2 flex list-disc flex-col gap-1 pl-5">
          <li>Envío express (Estafeta): $150, 2 a 5 días hábiles.</li>
          <li>Envío estándar (Correos de México): $75, 8 a 20 días hábiles.</li>
        </ul>
      </>
    ),
  },
  {
    question: "¿Puedo cambiar o devolver una prenda?",
    answer: (
      <>
        Sí, tienes 15 días naturales desde que recibes tu pedido para solicitar un cambio o
        reembolso. Revisa las condiciones completas en{" "}
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
    answer: "Cada producto incluye las tallas disponibles (XS, S, M, L) y un enlace a nuestra guía de tallas con las medidas exactas por prenda — corset y bustier, faldas y pantalones.",
  },
  {
    question: "¿Puedo rastrear mi pedido?",
    answer: (
      <>
        Sí — si tienes cuenta, entra a{" "}
        <Link href="/cuenta/pedidos" className="text-ink underline underline-offset-2 hover:text-velvet">
          Mi cuenta &gt; Pedidos
        </Link>
        . Si compraste como invitada,{" "}
        <Link href="/rastrear-pedido" className="text-ink underline underline-offset-2 hover:text-velvet">
          rastrea tu pedido aquí
        </Link>{" "}
        con tu número de pedido y correo.
      </>
    ),
  },
  {
    question: "¿Hacen envíos internacionales?",
    answer: "Por ahora solo enviamos dentro de México. Estamos evaluando envíos internacionales a futuro.",
  },
  {
    question: "¿Cuánto tardan en responder mis mensajes?",
    answer: "Respondemos en un plazo de 24 a 48 horas.",
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
