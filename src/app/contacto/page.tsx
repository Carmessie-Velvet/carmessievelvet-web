"use client";

import { useState } from "react";
import { FormField } from "@/components/ui/FormField";
import { buttonClasses } from "@/components/ui/Button";
import { contactService } from "@/services/contact-service";
import { getErrorMessage } from "@/lib/get-error-message";
import { SUPPORT_EMAIL } from "@/lib/support-email";

// Shown instead of the API's own (English) message for the failures a shopper
// can actually hit — and every one of them points at the inbox, so a message
// is never lost just because the form could not deliver it.
const SEND_ERRORS: Record<number, string> = {
  400: "Revisa los datos: el mensaje debe tener al menos 10 caracteres y el correo debe ser válido.",
  429: `Enviaste varios mensajes seguidos. Intenta de nuevo más tarde o escríbenos a ${SUPPORT_EMAIL}.`,
  503: `No pudimos enviar tu mensaje en este momento. Intenta de nuevo en unos minutos o escríbenos a ${SUPPORT_EMAIL}.`,
};

const SEND_ERROR_FALLBACK = `No pudimos enviar tu mensaje. Intenta de nuevo o escríbenos a ${SUPPORT_EMAIL}.`;

export default function ContactoPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [message, setMessage] = useState("");
  // Spam trap — rendered off-screen and never filled by a person. A bot that
  // fills every field fills this one too, and the API drops that message.
  const [website, setWebsite] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await contactService.send({
        name,
        email,
        message,
        website,
        ...(orderNumber.trim() ? { orderNumber } : {}),
      });
      setSubmitted(true);
    } catch (err) {
      // "Gracias" only after the API confirmed the email went out — never on
      // a failure (the form used to simulate success without sending anything).
      setError(getErrorMessage(err, SEND_ERROR_FALLBACK, SEND_ERRORS));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-black uppercase tracking-tight text-ink">¡Gracias!</h1>
        <p className="mt-3 text-sm text-ink-muted">
          Recibimos tu mensaje y te responderemos a la brevedad al correo que nos diste.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-3xl font-black uppercase tracking-tight text-ink">Contacto</h1>
      <p className="mt-3 text-sm text-ink-muted">
        Escríbenos tus dudas, sugerencias o problemas con un pedido — no olvides incluir tu
        número de pedido si aplica. También puedes escribirnos directamente a{" "}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="text-ink underline underline-offset-2 hover:text-velvet"
        >
          {SUPPORT_EMAIL}
        </a>
        .
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <FormField
          id="name"
          label="Nombre"
          required
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <FormField
          id="email"
          label="Correo electrónico"
          type="email"
          required
          maxLength={254}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormField
          id="orderNumber"
          label="Número de pedido (opcional)"
          maxLength={30}
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="message"
            className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted"
          >
            Mensaje
          </label>
          <textarea
            id="message"
            required
            rows={5}
            minLength={10}
            maxLength={2000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border border-sand bg-paper px-4 py-2.5 text-sm text-ink outline-none transition-all duration-200 focus:border-ink focus:shadow-[0_0_0_3px_rgba(75,21,48,0.08)]"
          />
        </div>

        {/* Spam trap: off-screen (not `display: none`, which some bots skip),
            out of the tab order and hidden from assistive tech. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="website">No llenes este campo</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-velvet">
            {error}
          </p>
        )}

        <button type="submit" disabled={isSubmitting} className={`${buttonClasses("solid")} mt-2`}>
          {isSubmitting ? "Enviando…" : "Enviar"}
        </button>
      </form>
    </div>
  );
}
