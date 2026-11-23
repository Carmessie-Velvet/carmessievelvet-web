"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * The payment page gets a one-line footer instead of the full one: the trust
 * row, the links and Instagram are exactly the kind of exits that page is
 * trying not to offer. The legal links stay. Receives the full footer as
 * `children` (rendered on the server) and shows it everywhere else.
 */
export function FooterSwitch({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname !== "/checkout") return <>{children}</>;

  return (
    <footer className="border-t border-sand bg-paper px-4 pb-28 pt-6 text-center text-xs text-ink-muted lg:pb-8">
      © {new Date().getFullYear()} Carmessie Velvet ·{" "}
      <Link href="/terminos-de-servicio" className="underline underline-offset-2 hover:text-velvet">
        Términos de servicio
      </Link>{" "}
      ·{" "}
      <Link href="/politica-de-privacidad" className="underline underline-offset-2 hover:text-velvet">
        Política de privacidad
      </Link>
    </footer>
  );
}
