/**
 * Static navigation data shared by the footer, the desktop mega menu and the
 * mobile menu — one list instead of three copies drifting apart.
 */
export const helpLinks = [
  { href: "/rastrear-pedido", label: "Rastrear mi pedido" },
  { href: "/contacto", label: "Contáctanos" },
  { href: "/preguntas-frecuentes", label: "Preguntas frecuentes" },
  { href: "/devoluciones", label: "Devoluciones" },
  { href: "/terminos-de-servicio", label: "Términos de servicio" },
  { href: "/politica-de-privacidad", label: "Política de privacidad" },
];

/** The four links shoppers ask for most — what the menus show. */
export const quickHelpLinks = helpLinks.slice(0, 4);

/** Photo behind each category tile (menus and the homepage mosaic). */
export const categoryImages: Record<string, string> = {
  corsets: "/products/corset-brocade.jpeg",
  sets: "/products/set-black-fur.jpeg",
};

export const INSTAGRAM_URL = "https://www.instagram.com/carmessievelvet/";
