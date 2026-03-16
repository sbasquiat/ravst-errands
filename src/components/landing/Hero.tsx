"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const badges = [
  { icon: "shield", label: "Vetted Runners" },
  { icon: "camera", label: "Photo Proof" },
  { icon: "guarantee", label: "€200 Guarantee" },
];

export default function Hero() {
  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden pt-20 pb-16 lg:pb-24">
      {/* Background decoration */}
      <div className="absolute inset-0 mesh-bg pointer-events-none" />
      <div className="absolute top-32 right-0 w-[500px] h-[500px] rounded-full bg-[var(--color-copper-glow)] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#1a3a2f08] blur-[100px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-[1fr_0.85fr] gap-12 lg:gap-20 items-center">
          {/* Left: copy */}
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.div
              variants={fadeUp}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/60 px-4 py-1.5 text-sm font-medium text-[var(--color-text-muted)] backdrop-blur-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-copper)]" />
              Now serving Dublin, Ireland
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="heading-display text-[clamp(2.75rem,6vw,4.5rem)] text-[var(--color-charcoal)]"
            >
              Your errands,
              <br />
              handled with{" "}
              <span className="relative inline-block text-[var(--color-copper)]">
                proof
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  viewBox="0 0 200 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <motion.path
                    d="M2 8.5C30 3.5 70 2 100 4C130 6 170 3.5 198 7"
                    stroke="#b45309"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.4 }}
                    transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
                  />
                </svg>
              </span>
              .
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--color-text-muted)] lg:text-xl"
            >
              Ravst connects you with vetted runners who handle your returns,
              pickups, and collections — with photo proof at every step.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
              <Link href="/book" className="btn-primary text-base">
                Book Your First Errand
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <button
                className="btn-secondary text-base"
                onClick={() =>
                  document.querySelector("#how-it-works")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                See How It Works
              </button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              variants={fadeUp}
              className="mt-14 flex flex-wrap items-center gap-6 lg:gap-8"
            >
              {badges.map((badge) => (
                <div key={badge.label} className="flex items-center gap-2.5 text-sm text-[var(--color-text-muted)]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-forest)]/8">
                    {badge.icon === "shield" && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-forest)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    )}
                    {badge.icon === "camera" && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-forest)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    )}
                    {badge.icon === "guarantee" && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-forest)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    )}
                  </div>
                  <span className="font-medium">{badge.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: proof card visual */}
          <motion.div
            initial={{ opacity: 0, x: 40, rotate: 1 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ delay: 0.6, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
          >
            {/* Main card */}
            <div className="relative rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)]">
              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#16a34a]/10">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-charcoal)]">Errand Complete</p>
                  <p className="text-xs text-[var(--color-text-muted)]">2 minutes ago</p>
                </div>
                <span className="ml-auto rounded-full bg-[#16a34a]/10 px-2.5 py-0.5 text-xs font-semibold text-[#16a34a]">
                  Verified
                </span>
              </div>

              {/* Errand info */}
              <div className="rounded-xl bg-[var(--color-cream)] p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📦</span>
                  <span className="font-semibold text-sm text-[var(--color-charcoal)]">Parcel Return</span>
                </div>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Dropped off at An Post, Grafton Street
                </p>
              </div>

              {/* Proof photos */}
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-light)]">
                  Proof Photos
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-[var(--color-sand)] to-[var(--color-cream-dark)] flex items-center justify-center text-[var(--color-text-light)]">
                    <div className="text-center">
                      <svg className="mx-auto mb-1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      <span className="text-[10px] font-medium">Drop-off</span>
                    </div>
                  </div>
                  <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-[var(--color-sand)] to-[var(--color-cream-dark)] flex items-center justify-center text-[var(--color-text-light)]">
                    <div className="text-center">
                      <svg className="mx-auto mb-1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      <span className="text-[10px] font-medium">Receipt</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification footer */}
              <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)] border-t border-[var(--color-border-light)] pt-3">
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  GPS Verified
                </span>
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  14:34
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-semibold text-[var(--color-copper)]">★ 5.0</span>
                  Runner rated
                </span>
              </div>
            </div>

            {/* Floating notification cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.6 }}
              className="absolute -bottom-4 -left-8 rounded-xl border border-[var(--color-border-light)] bg-white px-4 py-3 shadow-lg"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-copper)]/10">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-copper)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--color-charcoal)]">Runner assigned</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">Sarah M. · 4.9★ · 3 min away</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.6 }}
              className="absolute -top-3 -right-4 rounded-xl border border-[var(--color-border-light)] bg-white px-4 py-3 shadow-lg"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🔔</span>
                <p className="text-xs font-medium text-[var(--color-charcoal)]">
                  Your parcel was dropped off!
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
