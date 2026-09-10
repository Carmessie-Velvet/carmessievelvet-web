import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";
import { SITE_URL } from "@/lib/site-url";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { PurchaseWindowBanner } from "@/components/layout/PurchaseWindowBanner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/context/cart-context";
import { AuthProvider } from "@/context/auth-context";
import { AuthModalProvider } from "@/context/auth-modal-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { QuickAddProvider } from "@/context/quick-add-context";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { QuickAddModal } from "@/components/product/QuickAddModal";
import { AuthModal } from "@/components/account/AuthModal";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const SITE_NAME = "Carmessie Velvet";
const SITE_DESCRIPTION =
  "Carmessie Velvet — corsets y sets de tiraje corto para vestir con actitud. Piezas de tiraje corto, hechas en México.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s — ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  keywords: [
    "corsets",
    "corset",
    "sets de corset",
    "ropa femenina México",
    "Carmessie Velvet",
    "moda tiraje corto",
  ],
  applicationName: SITE_NAME,
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

// Sitewide structured data — Organization (who the brand is, for
// knowledge-panel-style answers) + WebSite with a SearchAction (the
// `/tienda?q=` search already documented in CLAUDE.md, wired here so
// Google can offer a sitelinks search box). Both are static/site-level
// facts, so this lives in the root layout instead of being repeated per
// page.
function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/carmessie-mark-ink.png`,
    sameAs: ["https://www.instagram.com/carmessievelvet/"],
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

function WebSiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/tienda?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${archivo.variable} h-full antialiased`}>
      <head>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <MotionConfig reducedMotion="user">
          <AuthProvider>
            <AuthModalProvider>
              <WishlistProvider>
                <CartProvider>
                  <QuickAddProvider>
                    <div className="fixed inset-x-0 top-0 z-40">
                      <PurchaseWindowBanner />
                      <AnnouncementBar />
                      <Header />
                    </div>
                    <main className="flex-1 pt-[var(--header-stack-height)]">
                      {children}
                    </main>
                    <Footer />
                    <CartDrawer />
                    <QuickAddModal />
                    <AuthModal />
                  </QuickAddProvider>
                </CartProvider>
              </WishlistProvider>
            </AuthModalProvider>
          </AuthProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
