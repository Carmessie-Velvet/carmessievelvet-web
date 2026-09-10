# Carmessie Velvet — Tienda en línea

Frontend de la tienda en línea de [Carmessie Velvet](https://www.instagram.com/carmessievelvet/) (ropa/corsetería). Next.js + TypeScript + Tailwind CSS, consumiendo la API real del negocio (`carmessievelvet-api`, repositorio aparte) para catálogo, cuentas, checkout con Stripe, direcciones, envíos y devoluciones.

Este repo es **solo el frontend de la tienda**. El panel de administración vive en `carmessievelvet-admin` (repo aparte) y el backend en `carmessievelvet-api` (repo aparte) — ver [Repositorios relacionados](#repositorios-relacionados).

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript + [Tailwind CSS v4](https://tailwindcss.com)
- [Stripe](https://stripe.com) (`@stripe/stripe-js` + `@stripe/react-stripe-js`) para el pago — sin backend propio de Stripe en este repo, todo pasa por `carmessievelvet-api`
- [Framer Motion](https://www.framer.com/motion/) para animaciones puntuales (buscador, filtros)
- Desplegado en [Vercel](https://vercel.com), conectado a GitHub

## Requisitos previos

- Node.js 20 o superior
- Acceso a un ambiente de `carmessievelvet-api` corriendo (local, staging o producción) — este proyecto no funciona de forma aislada, siempre necesita la API real

## Puesta en marcha local

```bash
git clone https://github.com/Carmessie-Velvet/carmessievelvet-web.git
cd carmessievelvet-web
npm install
cp .env.example .env.local   # y ajustar NEXT_PUBLIC_API_URL, ver abajo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Si vas a correr `carmessievelvet-api` en local al mismo tiempo, esa API ocupa el puerto 3000 por defecto — levanta este proyecto en otro puerto: `npm run dev -- -p 3001`.

### Variables de entorno

| Variable | Requerida | Descripción |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Sí | Base URL de `carmessievelvet-api`, **incluyendo el prefijo de versión** (ej. `https://api-carmessie.spyrocode.tech/api/v1`, o `http://localhost:3000/api/v1` en local). |

No hay más variables de entorno en el frontend — las llaves de Stripe, credenciales de correo, S3, etc. viven únicamente en el backend; este proyecto nunca las toca directamente.

## Scripts disponibles

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga en caliente. |
| `npm run build` | Build de producción (`next build`). Corre también en cada deploy de Vercel. |
| `npm run start` | Sirve el build de producción ya generado (`next build` primero). |
| `npm run lint` | ESLint sobre todo el proyecto. |

Antes de abrir un PR, correr también `npx tsc --noEmit` (type-check completo) — no está como script de `package.json` pero es parte del checklist de todo cambio (ver [CLAUDE.md](CLAUDE.md)).

## Estructura del proyecto

```
src/
  app/          Rutas de Next.js (App Router) — una carpeta por página
  components/   Componentes de UI, organizados por dominio (account/, product/, checkout, ui/...)
  services/     Capa de acceso a datos: una interfaz + una implementación Rest* por dominio
  types/        Modelos de dominio en TypeScript puro, sin lógica
  lib/          Utilidades (formateo, cliente HTTP, helpers de errores, etc.)
  context/      React Context providers (auth, carrito, wishlist, modal de login)
```

**Regla de arquitectura**: los componentes y páginas nunca llaman `fetch` ni importan el cliente HTTP directamente — todo pasa por `services/`, detrás de una interfaz (`ProductService`, `OrderService`, etc.) implementada por una clase `Rest*Service` que habla con `carmessievelvet-api`. Esto es lo que permitiría, en teoría, cambiar de backend sin tocar la UI. El detalle completo de cada servicio y cómo mapea al contrato de la API está documentado en [CLAUDE.md](CLAUDE.md).

## Repositorios relacionados

| Repo | Qué es |
| --- | --- |
| [`carmessievelvet-api`](https://github.com/Carmessie-Velvet/carmessievelvet-api) | Backend (NestJS + Postgres + Stripe). Este frontend depende 100% de su contrato — ver `docs/API-FRONTEND.md` en ese repo para el detalle de cada endpoint. |
| [`carmessievelvet-admin`](https://github.com/Carmessie-Velvet/carmessievelvet-admin) | Panel de administración (catálogo, pedidos, cupones, envíos, estadísticas). Mismo flujo de despliegue que este repo. |

## Despliegue y ramas

- **`develop`** es la rama por defecto — todo el trabajo en curso apunta aquí. Se despliega automáticamente en Vercel al dominio de staging: **`staging.carmessievelvet.com.mx`**.
- **`main`** es producción — se despliega en **`carmessievelvet.com.mx`**.
- Ambas ramas están protegidas en GitHub: no se puede hacer `push` directo, todo cambio entra por Pull Request.
- Flujo normal: rama `feature/`/`fix/` desde `develop` → PR a `develop` → probar en `staging.carmessievelvet.com.mx` con la API real → PR de `develop` a `main` → producción.

El detalle completo del flujo (checklist antes de mergear a `main`, cómo funciona la protección de ramas, gotchas de `gh`/GitHub) está en [CLAUDE.md](CLAUDE.md), sección "Despliegue".

## Documentación adicional

[`CLAUDE.md`](CLAUDE.md) es la referencia técnica completa del proyecto: guía de marca, arquitectura de cada sección de la tienda (catálogo, checkout, cuentas, direcciones, devoluciones...), decisiones de diseño y su porqué, y el flujo de despliegue en detalle. Es el primer lugar donde buscar antes de tocar código o de dar de alta a alguien nuevo en el proyecto.
