import Image from "next/image";
import Link from "next/link";
import { categories } from "@/mocks/categories";
import { helpLinks, INSTAGRAM_URL } from "@/lib/nav-links";
import { formatLeadTime, getLeadTime } from "@/lib/lead-time";
import { InstagramIcon } from "@/components/icons/InstagramIcon";

export function Footer() {
  return (
    <footer className="bg-ink text-cream-soft">
      {/* What a shopper wants to know before paying, one glance above the links. */}
      <div className="border-b border-cream-soft/10">
        <ul className="mx-auto grid max-w-7xl gap-3.5 px-6 py-6 sm:grid-cols-3 sm:gap-6 sm:py-8">
          <TrustItem icon={<TruckIcon />}>Envíos a todo México</TrustItem>
          <TrustItem icon={<ClockIcon />}>Hecho sobre pedido · {formatLeadTime(getLeadTime())}</TrustItem>
          <TrustItem icon={<CardIcon />}>Pago 100% seguro</TrustItem>
        </ul>
      </div>
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
          <ul className="mt-2 flex flex-col">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/tienda?categoria=${cat.slug}`}
                  className="inline-block py-3 text-sm text-cream-soft/85 transition-[color,padding] duration-300 hover:pl-1.5 hover:text-cream-soft"
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
          <ul className="mt-2 flex flex-col">
            {helpLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-block py-3 text-sm text-cream-soft/85 transition-[color,padding] duration-300 hover:pl-1.5 hover:text-cream-soft"
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
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram de Carmessie Velvet"
            className="mt-4 inline-flex min-h-11 items-center gap-3 border border-cream-soft/25 px-4 text-sm text-cream-soft/90 transition-colors hover:border-cream-soft/60 hover:text-cream-soft"
          >
            <InstagramIcon />
            @carmessievelvet
          </a>
        </div>
      </div>
      <div className="border-t border-cream-soft/10 px-6 py-5 text-center text-[11px] uppercase tracking-[0.18em] text-cream-soft/50 [.has-sticky-bar_&]:pb-24 lg:[.has-sticky-bar_&]:pb-5">
        © {new Date().getFullYear()} Carmessie Velvet
      </div>
    </footer>
  );
}

function TrustItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 text-xs uppercase tracking-[0.1em] text-cream-soft/90">
      <span className="text-[#e6b9a0]">{icon}</span>
      {children}
    </li>
  );
}

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  className: "h-[22px] w-[22px] shrink-0",
  "aria-hidden": true,
} as const;

function TruckIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}
