"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "ravst_cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay so it doesn't flash on page load
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
        >
          <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-lg sm:flex sm:items-center sm:gap-4">
            <div className="flex-1 text-sm text-[var(--color-text-muted)] mb-3 sm:mb-0">
              <p>
                We use essential cookies for authentication and security.
                No tracking cookies are used.{" "}
                <Link
                  href="/cookies"
                  className="underline text-[var(--color-charcoal)] hover:text-[var(--color-forest)] transition-colors"
                >
                  Cookie Policy
                </Link>
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={handleDecline}
                className="rounded-lg border border-[var(--color-border-light)] px-4 py-2 text-xs font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-cream)] transition-colors cursor-pointer"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="rounded-lg bg-[var(--color-charcoal)] px-4 py-2 text-xs font-medium text-white hover:bg-[var(--color-charcoal)]/90 transition-colors cursor-pointer"
              >
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
