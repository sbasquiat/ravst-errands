"use client";

import { motion } from "framer-motion";

const errandTypes = [
  {
    id: "returns",
    title: "Returns & Drop-offs",
    description:
      "Parcel shop drop-offs, post office returns, office or document deliveries.",
    examples: ["Return an online order", "Drop a parcel at the post office", "Deliver documents to an office"],
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    price: "From €7",
    color: "var(--color-copper)",
    bgColor: "var(--color-copper)",
  },
  {
    id: "handoffs",
    title: "Pickup → Drop Handoffs",
    description:
      "Keys, documents, small items picked up from one location and delivered to another.",
    examples: ["Hand off apartment keys", "Deliver signed documents", "Transfer a small package"],
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    price: "From €9",
    color: "var(--color-forest)",
    bgColor: "var(--color-forest)",
  },
  {
    id: "collect",
    title: "Queue & Collect",
    description:
      "Click & collect pickups, prescription collection, or any task that involves waiting in a queue.",
    examples: ["Pick up a click & collect order", "Collect a prescription", "Queue for event tickets"],
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    price: "From €10",
    color: "#7c3aed",
    bgColor: "#7c3aed",
  },
];

export default function BookPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-2 text-sm font-semibold uppercase tracking-[0.15em] text-[var(--color-copper)]"
        >
          New Errand
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold text-[var(--color-charcoal)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          What do you need done?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-2 text-[var(--color-text-muted)]"
        >
          Choose the type of errand and we&apos;ll guide you through the rest.
        </motion.p>
      </div>

      {/* Errand type cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {errandTypes.map((type, i) => (
          <motion.a
            key={type.id}
            href={`/book/${type.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.15 + i * 0.08,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
            className="group relative flex flex-col rounded-2xl border border-[var(--color-border-light)] bg-white p-6 transition-all duration-300 hover:border-transparent hover:shadow-lg hover:shadow-black/[0.06] hover:-translate-y-1"
          >
            {/* Icon */}
            <div
              className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl transition-colors duration-300"
              style={{
                backgroundColor: `color-mix(in srgb, ${type.bgColor} 8%, transparent)`,
                color: type.color,
              }}
            >
              {type.icon}
            </div>

            {/* Content */}
            <h3
              className="text-lg font-bold text-[var(--color-charcoal)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {type.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
              {type.description}
            </p>

            {/* Examples */}
            <ul className="mt-4 space-y-1.5 flex-1">
              {type.examples.map((ex) => (
                <li key={ex} className="flex items-start gap-2 text-xs text-[var(--color-text-light)]">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="mt-0.5 flex-shrink-0"
                    style={{ color: type.color }}
                  >
                    <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {ex}
                </li>
              ))}
            </ul>

            {/* Price + arrow */}
            <div className="mt-6 flex items-center justify-between border-t border-[var(--color-border-light)] pt-4">
              <span className="text-sm font-semibold" style={{ color: type.color }}>
                {type.price}
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-cream)] text-[var(--color-text-muted)] transition-all duration-300 group-hover:bg-[var(--color-charcoal)] group-hover:text-white">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </motion.a>
        ))}
      </div>

      {/* Bottom info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
      >
        {[
          { icon: "clock", text: "Takes ~2 mins to book" },
          { icon: "shield", text: "€200 job guarantee" },
          { icon: "card", text: "Pay only on completion" },
        ].map((item) => (
          <div key={item.text} className="flex items-center gap-2 text-xs text-[var(--color-text-light)]">
            {item.icon === "clock" && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            )}
            {item.icon === "shield" && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            )}
            {item.icon === "card" && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            )}
            {item.text}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
