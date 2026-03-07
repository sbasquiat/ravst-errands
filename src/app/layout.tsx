import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ravst — Your Errands, Handled With Proof",
  description:
    "Trust-first errand service in Dublin. Vetted runners handle your returns, pickups, and collections with photo proof at every step.",
  keywords: ["errand service", "Dublin", "returns", "pickup", "delivery", "proof"],
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
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
