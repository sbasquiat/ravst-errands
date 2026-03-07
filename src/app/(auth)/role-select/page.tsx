"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type Role = "customer" | "runner" | null;

const roles = [
  {
    id: "customer" as const,
    title: "I need errands done",
    subtitle: "Customer account",
    description:
      "Post errands, track progress in real time, and get photo proof when they're completed.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
    perks: ["Book in under 2 minutes", "Real-time GPS tracking", "Photo proof on every errand"],
  },
  {
    id: "runner" as const,
    title: "I want to run errands",
    subtitle: "Runner account",
    description:
      "Earn money on your own schedule. Pick the errands you want, get paid when you're done.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="3" />
        <path d="M6.5 8C3.5 8.5 2 10 2 12.5c0 1 .5 2 1.5 2.5" />
        <path d="M17.5 8c3 .5 4.5 2 4.5 4.5 0 1-.5 2-1.5 2.5" />
        <path d="M10 22v-5l-2-3 1-3" />
        <path d="M14 22v-5l2-3-1-3" />
      </svg>
    ),
    perks: ["Flexible schedule", "Choose your errands", "Earn €12–€25+ per errand"],
  },
];

export default function RoleSelectPage() {
  const [selected, setSelected] = useState<Role>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = () => {
    if (!selected) return;
    setLoading(true);
    setTimeout(() => {
      // Simulate navigation based on role
      window.location.href = selected === "customer" ? "/dashboard" : "/runner/onboarding";
    }, 600);
  };

  return (
    <div>
      <div className="mb-8">
        <h1
          className="text-[1.75rem] font-bold text-[var(--color-charcoal)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          How will you use Ravst?
        </h1>
        <p className="mt-2 text-[0.9375rem] text-[var(--color-text-muted)]">
          You can always switch or add a role later.
        </p>
      </div>

      <div className="space-y-3">
        {roles.map((role, i) => (
          <motion.button
            key={role.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
            onClick={() => setSelected(role.id)}
            className={`group relative w-full rounded-2xl border-2 p-5 text-left transition-all duration-200 cursor-pointer ${
              selected === role.id
                ? "border-[var(--color-copper)] bg-[var(--color-copper)]/[0.04] shadow-[0_0_0_3px_var(--color-copper-glow)]"
                : "border-[var(--color-border)] bg-white hover:border-[var(--color-border-hover)] hover:shadow-sm"
            }`}
          >
            {/* Radio indicator */}
            <div className="absolute top-5 right-5">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                  selected === role.id
                    ? "border-[var(--color-copper)] bg-[var(--color-copper)]"
                    : "border-[var(--color-border)]"
                }`}
              >
                {selected === role.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="h-2 w-2 rounded-full bg-white"
                  />
                )}
              </div>
            </div>

            {/* Icon */}
            <div
              className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                selected === role.id
                  ? "bg-[var(--color-copper)]/10 text-[var(--color-copper)]"
                  : "bg-[var(--color-cream-dark)] text-[var(--color-text-muted)]"
              }`}
            >
              {role.icon}
            </div>

            {/* Text */}
            <div className="pr-8">
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-light)]">
                {role.subtitle}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-[var(--color-charcoal)]">
                {role.title}
              </h3>
              <p className="mt-1 text-sm text-[var(--color-text-muted)] leading-relaxed">
                {role.description}
              </p>
            </div>

            {/* Perks */}
            <div className="mt-4 flex flex-wrap gap-2">
              {role.perks.map((perk) => (
                <span
                  key={perk}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    selected === role.id
                      ? "bg-[var(--color-copper)]/10 text-[var(--color-copper)]"
                      : "bg-[var(--color-cream)] text-[var(--color-text-muted)]"
                  }`}
                >
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {perk}
                </span>
              ))}
            </div>
          </motion.button>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={handleContinue}
        disabled={!selected || loading}
        className="btn-primary mt-8 w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <>
            Continue
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </>
        )}
      </motion.button>

      <p className="mt-4 text-center text-xs text-[var(--color-text-light)]">
        You can change your role anytime from settings.
      </p>
    </div>
  );
}
