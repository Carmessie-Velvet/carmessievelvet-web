/**
 * `GET /store/testimonials` (público) — reseñas de clientes que el admin
 * escribe a mano en `carmessievelvet-admin`, no algo que un comprador
 * mande él mismo. `rating` siempre viene 1-5 (la API le pone 5 por
 * default si el admin no especifica uno al crearlo — no existe hoy un
 * testimonio sin calificación).
 */
export interface Testimonial {
  id: string;
  customerName: string;
  comment: string;
  rating: number;
  /** `'YYYY-MM-DD'` — un día calendario, no un momento puntual. */
  commentedAt: string;
}
