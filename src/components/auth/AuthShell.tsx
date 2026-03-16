"use client";

import { motion } from "framer-motion";

export default function AuthShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100svh]">
      {/* Left panel — brand / illustration */}
      <div className="relative hidden w-[45%] overflow-hidden bg-[var(--color-forest)] lg:flex lg:flex-col lg:justify-between p-10 xl:p-14">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-white/[0.03] -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 h-[350px] w-[350px] rounded-full bg-[var(--color-copper)]/[0.06] translate-y-1/4 -translate-x-1/4" />

        {/* Logo */}
        <a
          href="/"
          className="relative z-10 text-2xl font-800 tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <span className="text-white">ravst</span>
          <span className="text-[var(--color-copper-light)]">.</span>
        </a>

        {/* Center content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10"
        >
          <h2
            className="text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-[1.15] text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Your errands,
            <br />
            handled with{" "}
            <span className="text-[var(--color-copper-light)]">proof</span>.
          </h2>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-white/50">
            Vetted runners, photo proof at every step, GPS verification.
            Dublin&apos;s trust-first errand service.
          </p>

          {/* Trust indicators */}
          <div className="mt-10 flex flex-col gap-4">
            {[
              { icon: "shield", text: "Every runner ID-verified & background-checked" },
              { icon: "camera", text: "Photo proof + GPS at every checkpoint" },
              { icon: "guarantee", text: "€200 job guarantee on every errand" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/[0.08]">
                  {item.icon === "shield" && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-copper-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  )}
                  {item.icon === "camera" && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-copper-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  )}
                  {item.icon === "guarantee" && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-copper-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  )}
                </div>
                <span className="text-sm text-white/40">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom */}
        <p className="relative z-10 text-xs text-white/20">
          &copy; 2026 Ravst. Dublin, Ireland.
        </p>
      </div>

      {/* Right panel — form area */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <div className="flex items-center justify-between px-6 py-5 lg:hidden">
          <a
            href="/"
            className="text-xl font-800 tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className="text-[var(--color-charcoal)]">ravst</span>
            <span className="text-[var(--color-copper)]">.</span>
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[420px]"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
