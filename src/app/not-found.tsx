import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

export const metadata = { title: "Página no encontrada" };

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[62vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">Error 404</p>
      <h1 className="mt-4 text-4xl font-black uppercase leading-[1.02] tracking-tight text-ink sm:text-5xl">
        Esta página no existe
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-muted">
        Puede que el enlace haya cambiado o que la pieza que buscas ya no esté disponible. Mira lo que
        tenemos ahora.
      </p>
      <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link href="/tienda" className={buttonClasses("solid", "h-[52px] sm:px-10")}>
          Ir a la tienda
        </Link>
        <Link href="/" className={buttonClasses("outline", "h-[52px] sm:px-10")}>
          Volver al inicio
        </Link>
      </div>
      <Link
        href="/contacto"
        className="mt-6 flex h-11 items-center text-xs font-medium uppercase tracking-[0.14em] text-ink-muted underline-offset-4 transition-colors hover:text-velvet hover:underline"
      >
        ¿Necesitas ayuda? Escríbenos
      </Link>
    </div>
  );
}
