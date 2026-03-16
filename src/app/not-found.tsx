import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "Page Not Found — Ravst",
};

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] flex items-center justify-center bg-[var(--color-cream)]">
        <div className="mx-auto max-w-lg px-6 text-center py-32">
          <p
            className="text-[8rem] font-bold leading-none text-[var(--color-copper)]/20"
            style={{ fontFamily: "var(--font-display)" }}
          >
            404
          </p>
          <h1
            className="mt-4 text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-[var(--color-charcoal)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Page not found
          </h1>
          <p className="mt-3 text-[var(--color-text-muted)]">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="btn-primary !py-2.5 !px-6 !text-sm"
            >
              Go Home
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-[var(--color-border)] px-6 py-2.5 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-copper)] hover:text-[var(--color-copper)] transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
