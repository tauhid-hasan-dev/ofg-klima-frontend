import type { Metadata, Viewport } from "next";
import { Archivo, Barlow, JetBrains_Mono } from "next/font/google";
import { AnalyticsTracker } from "@/components/analytics/Tracker";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { HeaderHeightSync } from "@/components/layout/HeaderHeightSync";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { CartProvider } from "@/lib/store/cart";
import { site } from "@/lib/site";
import "./globals.css";

/**
 * Type pairing: Archivo for display (industrial grotesque, very tight caps that
 * suit part names set in uppercase) over Barlow for UI text (designed for
 * signage, so it stays legible at 13–14px). Both ship full Latin-Extended, which
 * is non-negotiable here — ş, ğ, ı, İ, ö, ü and ç appear in almost every string
 * on this site, and most "default" UI fonts fake them.
 */
const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800"],
  variable: "--font-archivo",
  display: "swap",
});

const barlow = Barlow({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "oto klima kompresörü",
    "klima radyatörü",
    "kondenser",
    "klima kasnak seti",
    "oto klima gazı",
    "yedek parça",
  ],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: site.name,
    title: `${site.name} | ${site.tagline}`,
    description: site.description,
    url: site.url,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#e71a21",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${archivo.variable} ${barlow.variable} ${jetbrainsMono.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <CartProvider>
          <a
            href="#icerik"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] focus:rounded-md focus:bg-ink-950 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
          >
            İçeriğe geç
          </a>

          <Header />
          <HeaderHeightSync />

          <main id="icerik" className="flex-1">
            {children}
          </main>

          <Footer />
          <WhatsAppFab />
          <AnalyticsTracker />
        </CartProvider>
      </body>
    </html>
  );
}
