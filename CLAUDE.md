@AGENTS.md

# Carmessie Velvet — Frontend

Tienda de ropa. Este repo contiene **exclusivamente el frontend** (Next.js + Tailwind CSS). El backend lo construye otro equipo por separado, así que todo el consumo de datos debe pasar por una capa de servicios simulada (mock) en TypeScript, lista para swapear por una API REST real sin tocar la UI.

Referencias de diseño: identidad de marca en [@carmessievelvet](https://www.instagram.com/carmessievelvet/) (Instagram) y dirección visual pedida por el cliente similar a [marsthelabel.com](https://marsthelabel.com). El logo real (proporcionado por la clienta, extraído de un PDF de Canva) vive en `public/brand/` — `carmessie-mark-ink.png`/`carmessie-mark-white.png` (wordmark con fondo transparente, en tinta o en blanco) y `carmessie-lockup-black.png` (lockup completo tal cual el diseño original, fondo negro). El SVG vectorial fuente (`carmessie-logo.svg`) también está ahí por si se necesita regenerar en otro tamaño/color.

**Catálogo real**: solo dos categorías — `corsets` (piezas sueltas) y `sets` (corset + falda o pantalón a juego) — y tallas `XS/S/M/L` (sin XL). Las fotos de producto en `public/products/` son fotografía real de la clienta (flat-lay sobre tela satinada), no placeholders.

## Arquitectura de datos: mock-data-service

- `types/` — modelos de dominio en TypeScript puro (`Product`, `Category`, `Variant`, `CartItem`, `Order`, etc.), sin lógica.
- `services/` — un archivo por dominio. Cada uno exporta:
  - una **interfaz** (`ProductService`) que define los métodos (`getAll`, `getBySlug`, `getByCategory`, ...);
  - una implementación mock (`MockProductService`) que lee de `mocks/*.ts` y simula latencia de red (`await delay(ms)`).
- `mocks/` — datos realistas (productos, precios, tallas, imágenes placeholder) coherentes con el tono de la marca. Nunca se importan directamente desde componentes.
- **Regla dura**: componentes, hooks y páginas solo importan de `services/`, nunca de `mocks/`. Así, cuando llegue la API real, se agrega `RestProductService` implementando la misma interfaz y se cambia el punto de inyección (por ejemplo un factory o contexto), sin tocar UI.
- Cada servicio expone también sus tipos de error/estado (loading, empty, error) para que los componentes puedan renderizar esos casos ya desde el mock.

## Guía de marca y diseño

- **Paleta**: neutros cálidos como base (crema/beige `#f1e9df`, texto marrón cálido `#6b5d52`) con acento "velvet" (`#4b1530`) para CTAs y elementos de alto contraste.
- **Tipografía**: el logo real es un wordmark en mayúsculas, sans-serif geométrica extra bold (no itálica, no serif — eso fue una hipótesis inicial descartada al ver el logo real). Todo el sitio usa una sola familia (Archivo, variable) — headings en `font-black` (a veces `uppercase tracking-tight`) para hacer eco del peso del logo, cuerpo en pesos normales. No reintroducir una segunda tipografía "elegante" sin que la clienta lo pida.
- **Mobile-first**: diseñar primero en viewport ~375px, breakpoints estándar de Tailwind (`sm/md/lg/xl`). Patrón de header: menú hamburguesa a la izquierda, logo centrado, buscador + carrito a la derecha, barra de anuncio/promo opcional arriba de todo.
- **Hero**: imagen full-bleed editorial con un botón outline superpuesto (ej. "NEW ARRIVALS").
- **Catálogo/PDP**: grid de producto simple (nombre + precio), fichas de producto claras; seguir los patrones de `storefront-best-practices` para PDP, carrito y checkout.
- **Tono general**: minimalista — mucho whitespace, la fotografía de producto es la protagonista, mínima cantidad de elementos de UI por pantalla.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4, scaffolded con `create-next-app`.
- `AGENTS.md` (generado y mantenido por `next dev`) advierte que esta versión de Next.js tiene cambios importantes respecto a versiones anteriores — antes de escribir código, revisar `node_modules/next/dist/docs/` o usar `find-docs`/`context7` en vez de asumir por memoria.

## Skills disponibles en este proyecto

Instaladas en `.agents/skills/` (symlink a Claude Code):
- `frontend-design` (Anthropic) — criterio de diseño/UX de alta calidad.
- `storefront-best-practices` (Medusa) — patrones de e-commerce: PDP, carrito, checkout, mobile-first.
- `react-nextjs-development` (tercero) — prácticas generales de React/Next.js.

Skills globales a usar durante el desarrollo:
- `find-docs` / regla `context7` — consultar documentación actualizada de Next.js, Tailwind, etc. en vez de asumir por memoria.
- `run` — levantar el dev server y verificar visualmente cada pantalla en mobile antes de dar una feature por terminada.
- `code-review` / `simplify` — pasadas de calidad sobre la capa de servicios y componentes.
- `security-review` — antes de dar por shippeable cualquier formulario (checkout, newsletter), aunque el backend sea de otro equipo.
- `design` (canvas) — opcional, para bocetar pantallas antes de codear.
