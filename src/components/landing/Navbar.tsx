"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const navLinks = [
  { label: "How It Works", href: "/how-it-works", anchor: "#how-it-works" },
  { label: "Services", href: "/#services", anchor: "#services" },
  { label: "Pricing", href: "/pricing", anchor: "#pricing" },
  { label: "Trust", href: "/#trust", anchor: "#trust" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isLanding = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleNavClick = (link: typeof navLinks[number]) => {
    setMobileOpen(false);

    if (isLanding) {
      // On landing page, smooth scroll to anchor
      const el = document.querySelector(link.anchor);
      el?.scrollIntoView({ behavior: "smooth" });
    } else {
      // On other pages, navigate to the page or landing anchor
      router.push(link.href);
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[var(--color-cream)]/90 backdrop-blur-xl shadow-[0_1px_0_var(--color-border-light)]"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="relative z-10 font-[var(--font-display)] text-2xl font-800 tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className="text-[var(--color-charcoal)]">ravst</span>
            <span className="text-[var(--color-copper)]">.</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link)}
                className="relative px-4 py-2 text-[0.9375rem] font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)] cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="px-4 py-2 text-[0.9375rem] font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              Log In
            </Link>
            <Link href="/book" className="btn-primary !py-2.5 !px-5 !text-sm">
              Book an Errand
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="relative z-10 flex h-10 w-10 items-center justify-center md:hidden cursor-pointer"
            aria-label="Toggle menu"
          >
            <div className="flex w-5 flex-col gap-[5px]">
              <span
                className={`h-[1.5px] w-full bg-[var(--color-charcoal)] transition-all duration-300 origin-center ${
                  mobileOpen ? "rotate-45 translate-y-[6.5px]" : ""
                }`}
              />
              <span
                className={`h-[1.5px] w-full bg-[var(--color-charcoal)] transition-all duration-300 ${
                  mobileOpen ? "opacity-0 scale-x-0" : ""
                }`}
              />
              <span
                className={`h-[1.5px] w-full bg-[var(--color-charcoal)] transition-all duration-300 origin-center ${
                  mobileOpen ? "-rotate-45 -translate-y-[6.5px]" : ""
                }`}
              />
            </div>
          </button>
        </nav>
      </motion.header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[var(--color-cream)] md:hidden"
          >
            <nav className="flex flex-col items-center gap-2">
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  onClick={() => handleNavClick(link)}
                  className="py-3 text-3xl font-semibold text-[var(--color-charcoal)] cursor-pointer"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {link.label}
                </motion.button>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="mt-8 flex flex-col items-center gap-4"
              >
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-medium text-[var(--color-text-muted)]"
                >
                  Log In
                </Link>
                <Link
                  href="/book"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary text-lg"
                >
                  Book an Errand
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
