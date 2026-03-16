import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "sonner";
import CookieConsent from "@/components/ui/CookieConsent";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ravst.ie";

export const metadata: Metadata = {
  title: {
    default: "Ravst — Your Errands, Handled With Proof",
    template: "%s | Ravst",
  },
  description:
    "Trust-first errand service in Dublin. Vetted runners handle your returns, pickups, and collections with photo proof at every step.",
  keywords: ["errand service", "Dublin", "returns", "pickup", "delivery", "proof", "Ireland"],
  metadataBase: new URL(appUrl),
  openGraph: {
    type: "website",
    locale: "en_IE",
    url: appUrl,
    siteName: "Ravst",
    title: "Ravst — Your Errands, Handled With Proof",
    description:
      "Trust-first errand service in Dublin. Vetted runners handle your returns, pickups, and collections with photo proof at every step.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@ravst_ie",
    creator: "@ravst_ie",
    title: "Ravst — Your Errands, Handled With Proof",
    description:
      "Trust-first errand service in Dublin. Vetted runners handle your returns, pickups, and collections with photo proof at every step.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="grain">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* JSON-LD structured data for rich search results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Ravst",
              description:
                "Trust-first errand service in Dublin. Vetted runners handle your returns, pickups, and collections with photo proof at every step.",
              url: appUrl,
              logo: `${appUrl}/icon`,
              image: `${appUrl}/opengraph-image`,
              address: {
                "@type": "PostalAddress",
                addressLocality: "Dublin",
                addressCountry: "IE",
              },
              areaServed: {
                "@type": "City",
                name: "Dublin",
              },
              sameAs: [
                "https://x.com/ravst.ie",
                "https://instagram.com/ravst.ie",
                "https://linkedin.com/company/ravst",
              ],
              priceRange: "€€",
            }),
          }}
        />
      </head>
      <body className="antialiased">
        {children}
        <CookieConsent />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "var(--font-body)",
              borderRadius: "12px",
            },
          }}
        />
        {/* Plausible Analytics — privacy-friendly, no cookies needed */}
        <Script
          async
          src="https://plausible.io/js/pa-Tbzdp8BglCK5QjWR_nt6T.js"
          strategy="afterInteractive"
        />
        <Script id="plausible-init" strategy="afterInteractive">
          {`window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init();`}
        </Script>
      </body>
    </html>
  );
}
