"use client";

import ScrollReveal from "@/components/ui/ScrollReveal";

const services = [
  {
    title: "Returns & Drop-offs",
    description:
      "Parcel returns, post office drops, document deliveries. We handle the queue so you don't have to.",
    examples: ["Parcel shop returns", "Post office drops", "Document deliveries"],
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8v13H3V8" />
        <path d="M1 3h22v5H1z" />
        <path d="M10 12h4" />
      </svg>
    ),
    accent: "var(--color-copper)",
    accentBg: "#b4530910",
  },
  {
    title: "Pickup → Drop Handoffs",
    description:
      "Keys, documents, small items moved between locations. Tracked and verified at every handoff point.",
    examples: ["Key handoffs", "Document transfers", "Small item couriering"],
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    accent: "var(--color-forest)",
    accentBg: "#1a3a2f10",
  },
  {
    title: "Queue & Collect",
    description:
      "Click & collect pickups, queueing for collections. Your runner waits so you don't waste a moment.",
    examples: ["Click & collect pickup", "Prescription collection", "Queue-based pickups"],
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    accent: "#6d28d9",
    accentBg: "#6d28d910",
  },
];

export default function Services() {
  return (
    <section id="services" className="relative py-24 lg:py-32 bg-[var(--color-warm-white)]">
      {/* Subtle top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-16 lg:mb-20">
            <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.15em] text-[var(--color-copper)]">
              Services
            </span>
            <h2 className="heading-section text-[clamp(2rem,4vw,3rem)] text-[var(--color-charcoal)] max-w-lg">
              Every errand, handled end to end
            </h2>
            <p className="mt-4 max-w-xl text-lg text-[var(--color-text-muted)]">
              Three core services designed for the errands that eat your time.
              Each one comes with full tracking and proof of completion.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-3">
          {services.map((service, i) => (
            <ScrollReveal key={service.title} delay={i * 0.12}>
              <div className="group relative flex h-full flex-col rounded-2xl border border-[var(--color-border-light)] bg-white p-7 transition-all duration-500 hover:border-[var(--color-border)] hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.08)]">
                {/* Icon */}
                <div
                  className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundColor: service.accentBg, color: service.accent }}
                >
                  {service.icon}
                </div>

                <h3
                  className="mb-3 text-xl font-semibold text-[var(--color-charcoal)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {service.title}
                </h3>

                <p className="mb-6 text-[0.9375rem] leading-relaxed text-[var(--color-text-muted)] flex-1">
                  {service.description}
                </p>

                {/* Example use cases */}
                <div className="border-t border-[var(--color-border-light)] pt-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-light)]">
                    Common uses
                  </p>
                  <ul className="space-y-1.5">
                    {service.examples.map((ex) => (
                      <li key={ex} className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={service.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {ex}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
