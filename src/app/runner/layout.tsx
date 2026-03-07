"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

const navItems = [
  {
    label: "Jobs",
    href: "/runner",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    label: "Earnings",
    href: "/runner/earnings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/runner/settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function RunnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [available, setAvailable] = useState(true);

  const isActive = (href: string) => {
    if (href === "/runner") return pathname === "/runner" || pathname.startsWith("/runner/jobs");
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-[100svh] bg-[var(--color-cream)]">
      <header className="sticky top-0 z-50 border-b border-[var(--color-border-light)] bg-[var(--color-cream)]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <a href="/" className="text-xl font-800 tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              <span className="text-[var(--color-charcoal)]">ravst</span>
              <span className="text-[var(--color-forest)]">.</span>
            </a>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    isActive(item.href)
                      ? "bg-white text-[var(--color-charcoal)] shadow-sm"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-white/50"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Availability toggle */}
            <div className="flex items-center gap-2.5">
              <span className={`text-xs font-medium ${available ? "text-green-600" : "text-[var(--color-text-light)]"}`}>
                {available ? "Available" : "Offline"}
              </span>
              <button
                onClick={() => setAvailable(!available)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  available ? "bg-green-500" : "bg-gray-200"
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${available ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            {/* Avatar */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-forest)]/10 text-sm font-semibold text-[var(--color-forest)]">
              CM
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-white/50 transition-colors cursor-pointer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                {mobileNavOpen ? (
                  <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                ) : (
                  <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
                )}
              </svg>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileNavOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-[var(--color-border-light)]"
            >
              <div className="px-6 py-3 space-y-1">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive(item.href)
                        ? "bg-white text-[var(--color-charcoal)] shadow-sm"
                        : "text-[var(--color-text-muted)]"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </a>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:py-10">{children}</main>
    </div>
  );
}
