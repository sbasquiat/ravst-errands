"use client";

import { motion } from "framer-motion";

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100svh] bg-[var(--color-cream)]">
      {/* Compact header */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-border-light)] bg-[var(--color-cream)]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <a
            href="/"
            className="text-xl font-800 tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className="text-[var(--color-charcoal)]">ravst</span>
            <span className="text-[var(--color-copper)]">.</span>
          </a>

          <a
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Dashboard
          </a>
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
        className="mx-auto max-w-5xl px-6 py-8 lg:py-12"
      >
        {children}
      </motion.main>
    </div>
  );
}
