import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/context/cart-context";
import { CartDrawer } from "@/components/cart/CartDrawer";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Carmessie Velvet",
  description:
    "Carmessie Velvet — corsets y sets de tiraje corto para vestir con actitud.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${archivo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <MotionConfig reducedMotion="user">
          <CartProvider>
            <AnnouncementBar />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
          </CartProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
