import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

// Paths with no SEO value and/or personal data — never worth indexing.
// Everything else (/, /tienda, /producto/*, /contacto, /preguntas-frecuentes,
// /politica-de-privacidad, /devoluciones, /terminos-de-servicio) is public
// content and stays crawlable.
const DISALLOWED = [
  "/carrito",
  "/checkout",
  "/checkout/",
  "/cuenta",
  "/cuenta/",
  "/rastrear-pedido",
  "/reset-password",
  "/verify-email",
];

/**
 * Explicit rules per crawler, not just a blanket `*` — the goal (clienta's
 * own ask) is to show up in ChatGPT/Gemini/Perplexity answers, not just
 * classic Google/Bing search. The bots that actually decide whether a page
 * can appear inside an AI answer are the *retrieval* crawlers
 * (OAI-SearchBot, Claude-SearchBot, PerplexityBot, ChatGPT-User) — those
 * are explicitly allowed here, same as Googlebot/Bingbot, so a generic
 * rule never accidentally blocks them. The separate *training* crawlers
 * (GPTBot, ClaudeBot, Google-Extended, CCBot) don't affect either search
 * ranking or AI-answer citation either way — they only feed future model
 * training — so there's no SEO/GEO reason to block them, and nothing on
 * this site is sensitive enough to justify it; left allowed by the
 * catch-all `*` rule below instead of calling them out one by one.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOWED },
      { userAgent: "OAI-SearchBot", allow: "/", disallow: DISALLOWED },
      { userAgent: "ChatGPT-User", allow: "/", disallow: DISALLOWED },
      { userAgent: "Claude-SearchBot", allow: "/", disallow: DISALLOWED },
      { userAgent: "PerplexityBot", allow: "/", disallow: DISALLOWED },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
