@AGENTS.md

# Carmessie Velvet — Frontend

Tienda de ropa. Este repo contiene **exclusivamente el frontend** (Next.js + Tailwind CSS). El backend (`../carmessievelvet-api`) lo construye otro equipo por separado; todo el consumo de datos pasa por una capa de `services/` en TypeScript detrás de una interfaz, así que quien conecta con el backend real puede reemplazar la implementación sin tocar la UI — el catálogo y el auth ya están conectados a la API real (ver sección de integración abajo), no quedan en mock.

Referencias de diseño: identidad de marca en [@carmessievelvet](https://www.instagram.com/carmessievelvet/) (Instagram) y dirección visual pedida por el cliente similar a [marsthelabel.com](https://marsthelabel.com). El logo real (proporcionado por la clienta, extraído de un PDF de Canva) vive en `public/brand/` — `carmessie-mark-ink.png`/`carmessie-mark-white.png` (wordmark con fondo transparente, en tinta o en blanco) y `carmessie-lockup-black.png` (lockup completo tal cual el diseño original, fondo negro). El SVG vectorial fuente (`carmessie-logo.svg`) también está ahí por si se necesita regenerar en otro tamaño/color.

**Catálogo real**: solo dos categorías — `corsets` (piezas sueltas) y `sets` (corset + falda o pantalón a juego) — y tallas `XS/S/M/L` (sin XL). Las fotos de producto en `public/products/` son fotografía real de la clienta (flat-lay sobre tela satinada), no placeholders.

**Rediseño de búsqueda/checkout/perfil** (partió de un canvas de diseño explorado antes de tocar código): `HeaderSearch.tsx` — buscador animado en el header (Framer Motion, debounced contra `productService.getAll({search})`, dropdown con resultados en vivo). `TiendaFilters.tsx` — pills con popovers animados para talla/orden (el buscador de texto se consolidó en el header, ya no vive en el filtro). Quick-add: `quick-add-context.tsx` + `QuickAddModal.tsx`, montado en `layout.tsx`, disparado por el ícono de bolsa que aparece en hover sobre `ProductCard`. Checkout: layout de dos columnas con resumen fijo (`OrderSummary`, reusado en ambos pasos), y el `PaymentElement` de Stripe themeado vía `appearance` API (`STRIPE_APPEARANCE` en `checkout/page.tsx`) para que combine con la marca en vez del blanco/redondeado por defecto. `FormField.tsx` ganó un anillo de foco sutil (afecta login/registro/perfil/checkout a la vez, ya que todos comparten el componente).

## Arquitectura de datos: services detrás de una interfaz

- `types/` — modelos de dominio en TypeScript puro (`Product`, `Category`, `Variant`, `CartItem`, etc.), sin lógica.
- `services/` — un archivo por dominio. Cada uno exporta una **interfaz** (`ProductService`, `AuthService`) y una implementación (`RestProductService`, `RestAuthService`) que habla con `carmessievelvet-api`. **Regla dura**: componentes, hooks y páginas solo importan de `services/`, nunca directo de `api-client`/`mocks/` (excepción documentada: `Header`/`MobileMenu`/`Footer` importan `mocks/categories.ts` directo para la nav estática — ver sección de integración).
- `mocks/categories.ts` sigue existiendo, sólo para esa nav estática — ya no hay mocks de productos (se borró `mocks/products.ts` al conectar `RestProductService`, `MockProductService` no quedó como fallback).

## Integración con la API real (`carmessievelvet-api`)

El backend real (`../carmessievelvet-api`, NestJS + TypeORM + Postgres + Stripe + S3) ya existe y **tanto auth como el catálogo están conectados** — ya no queda nada en mock salvo el checkout (ver Pendiente abajo). Referencia completa de contratos: `../carmessievelvet-api/docs/API-FRONTEND.md`.

- `src/lib/api-client.ts` — wrapper de `fetch` sobre `NEXT_PUBLIC_API_URL` (ver `.env.example`/`.env.local`). Desenvuelve el envelope `{success, message, data, timestamp}` / `{success:false, message, error, statusCode, path, timestamp}` de la API, lanza `ApiError`, y si una llamada con `auth: true` recibe 401 intenta un refresh silencioso una vez (`tryRefresh`) antes de fallar.
- `src/lib/auth-store.ts` — store externo (`useSyncExternalStore`, mismo patrón que `cart-context.tsx`) que persiste `{accessToken, refreshToken, user}` en `localStorage` bajo `carmessie-velvet-auth`.
- `src/services/auth-service.ts` — `AuthService` (interfaz) + `RestAuthService`, pega directo a `/auth/signup`, `/auth/login`, `/auth/me`, `/auth/logout`. Confirmado end-to-end contra un deploy real (signup → sesión → logout → login).
- `src/context/auth-context.tsx` (`AuthProvider`/`useAuth`) — expone `user`, `isAuthenticated`, `signup`, `login`, `logout`. Montado en `layout.tsx` envolviendo `CartProvider`.
- Páginas en `src/app/cuenta/` (`/cuenta`, `/cuenta/login`, `/cuenta/registro`); enlace "Mi cuenta" en `Header.tsx` (icono) y `MobileMenu.tsx`.
- Reglas de password del signup (`IsStrongPassword` del backend) replicadas en `src/lib/validate-password.ts` para dar feedback inmediato sin esperar la respuesta del servidor: mínimo 8 caracteres, 1 mayúscula, 1 número.

### Catálogo (`ProductService` → `RestProductService`)

El bloqueo de `slug` se resolvió: la API ahora usa el **SKU** del producto como identificador de ruta (`GET /store/products/:sku`, ej. `CORSET-BLK`, case-insensitive). `src/services/product-service.ts` aprovecha esto directamente — `Product.slug = sku.toLowerCase()` — sin generar nada del lado del cliente ni tocar las rutas (`/producto/[slug]` sigue igual).

- **Categorías**: la API no tiene slug de categoría, solo `id` + `name`, y sus nombres semilla son singulares (`"Corset"`, no `"Corsets"`). `CATEGORY_OVERRIDES` en `product-service.ts` mapea esos dos nombres conocidos a los slugs/labels que el sitio ya usaba (`corsets`→"Corsets", `sets`→"Sets"); una categoría nueva no mapeada cae a un slug genérico (`name` en minúsculas, espacios→guiones). `mocks/categories.ts` sigue existiendo aparte, sin tocar — lo usan `Header`/`MobileMenu`/`Footer` directo para la nav (no pasa por el service), es estático a propósito y coincide con el mismo mapeo.
- **Precio/descuento**: `Product.price` = `finalPrice` de la API (precio ya con descuento activo aplicado); `Product.compareAtPrice` = `price` de catálogo, sólo si `appliedDiscount` viene presente. La API nunca calcula esto en el cliente.
- **Tallas**: `Product.variants` se reconstruye recorriendo las 4 tallas fijas y marcando `inStock` según si aparecen en `availableSizes` (la API sólo manda las tallas con stock > 0, no un desglose completo).
- **`isNew`**: la API no expone `createdAt` ni una bandera "nuevo" en `StoreProductDto` — `getNewArrivals()` simplemente pide los más recientes (`sortBy=createdAt&sortOrder=DESC`) y marca esos resultados como `isNew: true` client-side; `getAll()`/`getBySlug()` siempre devuelven `isNew: false` porque no hay forma de saberlo fuera de ese contexto.
- **`color`**: la API ya expone `Product.color` (texto libre, ver `AddProductColor` en la API) pero el tipo `Product`/la UI de este proyecto todavía no lo usan — no se agregó porque nada en el diseño actual lo pedía; queda documentado por si se decide mostrarlo.
- `getAll()` pide `limit=100` (el máximo de la API) en una sola llamada — no hay UI de paginación todavía, así que "toda la tienda" asume que el catálogo cabe en 100 productos.
- `/tienda`, `/producto/[slug]` y la home ahora usan `export const revalidate = 60` en vez de `generateStaticParams` (SSG): con datos reales (precio/stock cambian), pre-renderizar todo en build ya no tiene sentido — se cachean 60s y se refrescan.
- `next.config.ts` tiene `images.remotePatterns` para los hosts reales de imágenes: `*.s3.*.amazonaws.com` (bucket de S3 donde vive la fotografía subida desde el admin) y `via.placeholder.com` (el placeholder que la API devuelve para un producto sin imágenes). Si esto falta, `next/image` crashea exactamente como pasó antes con `picsum.photos` — no lo quites sin agregar el host nuevo primero.

### Tienda: búsqueda, filtros, orden

`ProductListOptions` (`product-service.ts`) creció con `search`/`size`/`minPrice`/`maxPrice`/`inStock`/`sortBy`/`sortOrder`, todos ya soportados por `/store/products`. `TiendaFilters.tsx` (client component) los refleja en la URL (`?q=&talla=&orden=`) vía `useSearchParams`/`router.push`, así que `/tienda` (server component) los lee de `searchParams` como ya hacía con `categoria` — nada de estado client-side compartido.

### Cuenta: perfil, pedidos, tarjetas

- `src/services/user-service.ts` (`RestUserService`) — `/api/user/profile` (GET/PATCH), `/api/user/account` (DELETE), `/api/user/payment-methods` (GET/DELETE). **Importante**: estas rutas no llevan `/v1` — `apiFetch` ahora acepta `{ base: USER_API_BASE_URL }` (`src/lib/api-client.ts`, deriva la base sin `/v1` de `NEXT_PUBLIC_API_URL`) para este caso puntual.
- `src/services/order-service.ts` (`RestOrderService`) — `POST /orders` (checkout, ver abajo), `GET /me/orders`, `GET /me/orders/:id`. `createOrder` siempre pasa `auth: true`; como `apiFetch` solo agrega el header `Authorization` si hay sesión guardada, esto ya replica exactamente la semántica `@OptionalAuth()` de la API (invitado si no hay sesión, token real si la hay) sin lógica extra.
- `/cuenta`: perfil editable (`ProfileSection`), tarjetas guardadas (`PaymentMethodsSection`), y eliminar cuenta (con confirmación, hace logout y redirige a `/` al terminar).
- `/cuenta/pedidos` y `/cuenta/pedidos/[id]`: historial de pedidos del usuario logueado (`ORDER_STATUS_LABELS` en `src/lib/order-status.ts` traduce el enum de la API).

### Checkout (`/checkout`) — Stripe real

`src/app/checkout/page.tsx`: formulario de envío + email de invitado (si no hay sesión) + cupón → `POST /api/v1/orders` (`src/services/order-service.ts`, `orderService.createOrder`) → la API responde con `clientSecret`/`publishableKey` reales (modo test) → se monta `<Elements>`/`<PaymentElement>` (`@stripe/stripe-js` + `@stripe/react-stripe-js`) con esos valores tal cual, sin ninguna clave de Stripe propia en el frontend. `stripe.confirmPayment({ elements, redirect: "if_required" })` evita el redirect completo para pagos con tarjeta. Al confirmar: usuario logueado → redirige a `/cuenta/pedidos/:id` (reusa la página de detalle de pedido); invitado → `/checkout/confirmacion?order=<orderNumber>` (página simple sin llamar a la API, porque no hay endpoint de tracking para invitados — ver lista de gaps).

Verificado en vivo contra el deploy real: la orden se crea (`CM-001000`), el `PaymentIntent`/Elements se monta con la key `pk_test_...` real. No se completó un pago de prueba end-to-end en esta sesión (el sandbox de browser no pudo interactuar con el iframe de Stripe) — pendiente de que el usuario pruebe una tarjeta de test (`4242 4242 4242 4242`) manualmente.

**Pendiente real**: nada del lado del checkout en sí — ver la lista de gaps del backend (tracking de orden para invitados, notificaciones) para lo que falta para un checkout "completo".

### Novedades de la API integradas (rate limit, preview de cupón, wishlist)

La API agregó tres cosas que antes estaban en la lista de gaps — ya conectadas:

- **Rate limiting en auth**: `POST /auth/login`/`signup`/`refresh` ahora pueden responder `429` con un campo `retryAfter` (segundos). `ApiError` (`src/lib/api-client.ts`) lo expone; `src/lib/get-error-message.ts` (`getErrorMessage`) arma el mensaje amigable ("Intenta de nuevo en N minutos") y lo usan `/cuenta/login` y `/cuenta/registro`. `src/lib/format-retry-after.ts` hace la conversión segundos→texto.
- **Preview de cupón**: `POST /store/coupons/validate` (`productService.validateCoupon`, `src/services/product-service.ts`) — en `/checkout`, el campo de cupón tiene un botón "Validar" que llama a este endpoint con el carrito actual y muestra el descuento real (`-$X`) o el motivo exacto por el que no aplica (`COUPON_REASON_LABELS` en `checkout/page.tsx`, uno por cada `CouponInvalidReason`). Es sólo un preview — `POST /orders` vuelve a validar el cupón por su cuenta, así que el envío del formulario no depende de haber validado antes.
- **Wishlist** (`/api/v1/me/wishlist`, `USER`-only): `src/services/wishlist-service.ts` + `src/context/wishlist-context.tsx` (`WishlistProvider`, montado en `layout.tsx` dentro de `AuthProvider`/fuera de `CartProvider` — necesita `useAuth()`). El contexto expone `items: WishlistItem[]` completo (no sólo un `Set` de ids) — es la única fuente de verdad, así que `/cuenta/favoritos`, el corazón del header y el tab de favoritos del `CartDrawer` siempre están sincronizados entre sí sin fetches duplicados.
  - **Dónde vive el corazón**: `ProductCard.tsx` (esquina superior derecha, siempre visible — a diferencia del bag de quick-add, que es sólo on-hover), `WishlistButton.tsx` (detalle de producto), `Header.tsx` (ícono junto al carrito con badge de `items.length`, linkea a `/cuenta/favoritos`), y como tab dentro de `CartDrawer.tsx` (ver abajo). Clic sin sesión → redirige a `/cuenta/login`.
  - **`CartDrawer.tsx` ya no es solo el carrito**: tiene dos tabs arriba (bolsa/corazón, estilo marsthelabel.com) que alternan entre ver el carrito y ver la wishlist en el mismo panel lateral — el tab de carrito sigue siendo el default al abrir desde el ícono de bolsa.
  - El toggle es optimista con revert-on-error, y tiene un guard por producto (`pendingRef`, un `useRef<Set<string>>` — no state, para que se lea sin el retraso de un re-render) que ignora un segundo clic mientras el primero sigue en vuelo.
  - `apiFetch` (`api-client.ts`) tuvo que aprender a manejar `204 No Content` sin body — `DELETE /me/wishlist/:sku` es el único endpoint de toda la API que no responde `200 { data: true }`, y antes de este fix un 204 se trataba como error (`!body` caía en la rama de error).
  - ⚠️ **Bug real de la API, ya mitigado en el cliente**: `POST /me/wishlist` (agregar) devuelve el producto **sin el campo `category`** en su `product` embebido — a diferencia de `GET /me/wishlist` (listar), que sí lo trae completo. Esto causaba el bug que reportó el usuario ("el corazón no se pone rojo al agregar"): `mapProduct()` llamaba `mapCategory(api.category)` y crasheaba con `api.category` en `undefined`, el error lo atrapaba el `catch` de `toggle()` y revertía la actualización optimista — **aunque el producto sí se había guardado en el servidor** (confirmado con `GET /me/wishlist` justo después). `ApiStoreProduct.category` ahora es opcional y `mapCategory()` (`product-service.ts`) devuelve `{slug:"", name:""}` si falta, en vez de tronar. Vale la pena que alguien le avise al equipo de backend — es un contrato inconsistente entre dos endpoints que deberían devolver la misma forma (`StoreProductDto`), y probablemente afecta a cualquier otro consumidor de `POST /me/wishlist`, no sólo a este frontend.
  - Nota de una sesión de pruebas: contra el deploy real (latencia de red variable) varios clics disparados en ráfaga en segundos pueden desincronizar la UI del servidor incluso con el guard puesto — un solo clic o una recarga de página siempre queda consistente (verificado repetidas veces), así que no vale la pena perseguir ese caso extremo más allá del guard ya puesto.

### Video en la home (`VideoShowcase.tsx`)

Sección sin título al final de la home (el heading "En movimiento" se quitó a pedido del cliente) — grid de 4 tiles en loop, mudos, sin ninguna interacción (no hay visor fullscreen, no hay navegación tipo feed, no están ligados a un producto). Es deliberadamente la versión simple: se evaluó (y se descartó por ahora) un visor interactivo estilo marsthelabel.com porque implica bastante más trabajo de frontend (reproductor a pantalla completa, swipe al siguiente clip, precarga del adyacente) y el costo real de esa versión no es el almacenamiento sino el **bandwidth** — sin CDN de por medio, un feed con autoplay de varios clips puede salir caro. Si más adelante se construye esa versión, hacerlo con CloudFront (o similar) desde el principio.

- `public/videos/showcase-{1,2,3}.mp4` + `showcase-{1,2,3}-poster.jpg` — los `.MOV` originales de iPhone (1080×1920, 6–13MB, uno a 240fps/slo-mo) se re-codificaron con `ffmpeg` a 480px de ancho, 30fps, **sin audio** (`-an`, innecesario si van muteados), H.264 `crf 28`, `+faststart`: quedaron en 87–232KB cada uno (~50-70x más chicos). El poster es un frame extraído (`select=eq(n\,2)`) para que no se vea en blanco mientras carga.
- Solo hay 3 clips fuente reales; el grid es de 4 (`grid-cols-2 sm:grid-cols-4`), así que `DISPLAY_VIDEOS` repite el primero al final (`[...VIDEOS, VIDEOS[0]]`) para llenar la cuarta celda sin quedar adyacente a sí mismo. Reemplazar por un 4° clip real (mismo pipeline de compresión) y quitar el repeat en cuanto haya uno disponible.
- Fondo de la sección es `bg-cream`, a propósito el mismo que "Recién llegado" (que no declara fondo propio y hereda el `body { background: var(--color-cream) }` de `globals.css`) — así el scroll entre esas dos secciones y la de "Explora por categoría" (también pasada a `bg-cream` por la misma razón) no tiene costuras de color. `bg-cream-soft` (más claro, `#f8f3ec` vs `#f1e9df`) queda reservado para paneles/tarjetas elevadas (`OrderSummary`, `CartDrawer`, etc.), no para secciones de página completa.
- `<video autoPlay muted loop playsInline preload="auto">` — sin JS, es un server component; `preload="auto"` porque los archivos ya son tan chicos que no vale la pena la complejidad de diferir la carga.
- Si se agregan clips nuevos, repetir el mismo pipeline de compresión — nunca subir el `.MOV`/`.MP4` original tal cual (son ordenes de magnitud más pesados).

## Guía de marca y diseño

- **Paleta**: neutros cálidos como base (crema/beige `#f1e9df`, texto marrón cálido `#6b5d52`) con acento "velvet" (`#4b1530`) para CTAs y elementos de alto contraste.
- **Tipografía**: el logo real es un wordmark en mayúsculas, sans-serif geométrica extra bold (no itálica, no serif — eso fue una hipótesis inicial descartada al ver el logo real). Todo el sitio usa una sola familia (Archivo, variable) — headings en `font-black` (a veces `uppercase tracking-tight`) para hacer eco del peso del logo, cuerpo en pesos normales. No reintroducir una segunda tipografía "elegante" sin que la clienta lo pida.
- **Mobile-first**: diseñar primero en viewport ~375px, breakpoints estándar de Tailwind (`sm/md/lg/xl`). Patrón de header: menú hamburguesa a la izquierda, logo centrado, buscador + carrito a la derecha, barra de anuncio/promo opcional arriba de todo.
- **Hero**: imagen full-bleed editorial con un botón outline superpuesto (ej. "NEW ARRIVALS").
- **Catálogo/PDP**: grid de producto simple (nombre + precio), fichas de producto claras; seguir los patrones de `storefront-best-practices` para PDP, carrito y checkout.
- **Tono general**: minimalista — mucho whitespace, la fotografía de producto es la protagonista, mínima cantidad de elementos de UI por pantalla.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4, scaffolded con `create-next-app`.
- `@stripe/stripe-js` + `@stripe/react-stripe-js` para el checkout — sin SDK propio de servidor, todo pasa por `carmessievelvet-api` (ver Checkout abajo).
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
