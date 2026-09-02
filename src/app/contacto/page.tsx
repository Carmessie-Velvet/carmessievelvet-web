"use client";

import { useState } from "react";
import { FormField } from "@/components/ui/FormField";
import { buttonClasses } from "@/components/ui/Button";

// No hay endpoint de backend para contacto todavía — el envío es solo local
// (simula éxito) para tener la pantalla lista. Conectar a un endpoint real
// (o a un proveedor de email) en cuanto exista.
export default function ContactoPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 500);
  }

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-black uppercase tracking-tight text-ink">¡Gracias!</h1>
        <p className="mt-3 text-sm text-ink-muted">
          Recibimos tu mensaje y te responderemos a la brevedad.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-3xl font-black uppercase tracking-tight text-ink">Contacto</h1>
      <p className="mt-3 text-sm text-ink-muted">
        Escríbenos tus dudas, sugerencias o problemas con un pedido — no olvides incluir tu
        número de pedido si aplica.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <FormField
          id="name"
          label="Nombre"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <FormField
          id="email"
          label="Correo electrónico"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormField
          id="orderNumber"
          label="Número de pedido (opcional)"
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
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border border-sand bg-paper px-4 py-2.5 text-sm text-ink outline-none transition-all duration-200 focus:border-ink focus:shadow-[0_0_0_3px_rgba(75,21,48,0.08)]"
          />
        </div>

        <button type="submit" disabled={isSubmitting} className={`${buttonClasses("solid")} mt-2`}>
          {isSubmitting ? "Enviando…" : "Enviar"}
        </button>
      </form>
    </div>
  );
}
