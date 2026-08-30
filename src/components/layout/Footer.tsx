import Image from "next/image";
import Link from "next/link";
import { categories } from "@/mocks/categories";

export function Footer() {
  return (
    <footer className="bg-ink text-cream-soft">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-3">
        <div>
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
            Síguenos
          </p>
          <ul className="mt-4 flex flex-col gap-2.5">
            <li>
              <a
                href="https://www.instagram.com/carmessievelvet/"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-cream-soft/85 transition-colors hover:text-cream-soft"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream-soft/10 px-6 py-5 text-center text-[11px] uppercase tracking-[0.18em] text-cream-soft/50">
        © {new Date().getFullYear()} Carmessie Velvet
      </div>
    </footer>
  );
}
