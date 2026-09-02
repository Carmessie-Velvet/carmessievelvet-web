import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/context/cart-context";
import { AuthProvider } from "@/context/auth-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { QuickAddProvider } from "@/context/quick-add-context";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { QuickAddModal } from "@/components/product/QuickAddModal";

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
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <QuickAddProvider>
                  <div className="fixed inset-x-0 top-0 z-40">
                    <AnnouncementBar />
                    <Header />
                  </div>
                  <main className="flex-1 pt-[var(--header-stack-height)]">
                    {children}
                  </main>
                  <Footer />
                  <CartDrawer />
                  <QuickAddModal />
                </QuickAddProvider>
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
