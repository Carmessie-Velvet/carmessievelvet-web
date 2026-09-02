import Image from "next/image";
import Link from "next/link";
import { categories } from "@/mocks/categories";
import { InstagramIcon } from "@/components/icons/InstagramIcon";

const helpLinks = [
  { href: "/contacto", label: "Contáctanos" },
  { href: "/preguntas-frecuentes", label: "Preguntas frecuentes" },
  { href: "/devoluciones", label: "Devoluciones" },
  { href: "/terminos-de-servicio", label: "Términos de servicio" },
  { href: "/politica-de-privacidad", label: "Política de privacidad" },
];

export function Footer() {
  return (
    <footer className="bg-ink text-cream-soft">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-6 py-14 sm:grid-cols-4 sm:gap-10">
        <div className="col-span-2 sm:col-span-1">
          <Image
            src="/brand/carmessie-mark-white.png"
            alt="Carmessie Velvet"
            width={186}
            height={32}
            className="h-7 w-auto"
          />
          <p className="mt-3 max-w-xs text-sm text-cream-soft/70">
            Piezas de tiraje corto, pensadas para durar más que la temporada.
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cream-soft/60">
            Colección
          </p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/tienda?categoria=${cat.slug}`}
                  className="text-sm text-cream-soft/85 transition-colors hover:text-cream-soft"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cream-soft/60">
            Ayuda
          </p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {helpLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-cream-soft/85 transition-colors hover:text-cream-soft"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cream-soft/60">
            Síguenos
          </p>
          <div className="mt-4 flex gap-3">
            <a
              href="https://www.instagram.com/carmessievelvet/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-cream-soft/20 text-cream-soft/85 transition-colors hover:border-cream-soft/50 hover:text-cream-soft"
            >
              <InstagramIcon />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-cream-soft/10 px-6 py-5 text-center text-[11px] uppercase tracking-[0.18em] text-cream-soft/50">
        © {new Date().getFullYear()} Carmessie Velvet
      </div>
    </footer>
  );
}
