"use client";

import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";

const tiers = [
  {
    name: "Returns & Drop-offs",
    from: "€7",
    href: "/book/returns",
    description: "Parcel returns, post office drops, document deliveries",
    includes: [
      "Pickup from your location",
      "Drop-off at destination",
      "Photo proof + GPS verification",
      "Receipt confirmation",
      "Real-time status updates",
    ],
  },
  {
    name: "Pickup → Drop Handoffs",
    from: "€9",
    href: "/book/handoffs",
    description: "Keys, documents, and small items between two locations",
    includes: [
      "Pickup with photo proof",
      "Verified handoff at drop-off",
      "PIN verification for high-value items",
      "GPS-tracked full route",
      "In-app chat with runner",
    ],
    featured: true,
  },
  {
    name: "Queue & Collect",
    from: "€10",
    href: "/book/collect",
    description: "Click & collect pickups, queueing for collection tasks",
    includes: [
      "Runner queues on your behalf",
      "Collection with your order details",
      "Photo proof of collected items",
      "Delivery to your location",
      "Up to 60 min queue time included",
    ],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16 lg:mb-20">
            <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.15em] text-[var(--color-copper)]">
              Pricing
            </span>
            <h2 className="heading-section text-[clamp(2rem,4vw,3rem)] text-[var(--color-charcoal)]">
              Transparent, honest pricing
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-[var(--color-text-muted)]">
              Pay per errand based on distance and type. No hidden fees.
              Get an instant quote before you book.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-3 items-stretch">
          {tiers.map((tier, i) => (
            <ScrollReveal key={tier.name} delay={i * 0.12}>
              <div
                className={`relative flex h-full flex-col rounded-2xl border p-7 transition-all duration-500 ${
                  tier.featured
                    ? "border-[var(--color-copper)]/30 bg-white shadow-[0_16px_48px_-12px_rgba(180,83,9,0.1)]"
                    : "border-[var(--color-border-light)] bg-white hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.06)]"
                }`}
              >
                {tier.featured && (
                  <span className="absolute -top-3 left-6 rounded-full bg-[var(--color-copper)] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                    Most Popular
                  </span>
                )}

                <h3
                  className="text-lg font-semibold text-[var(--color-charcoal)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {tier.name}
                </h3>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  {tier.description}
                </p>

                <div className="my-6 flex items-baseline gap-1">
                  <span className="text-sm text-[var(--color-text-muted)]">from</span>
                  <span
                    className="text-4xl font-bold text-[var(--color-charcoal)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {tier.from}
                  </span>
                  <span className="text-sm text-[var(--color-text-muted)]">per errand</span>
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {tier.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--color-text-muted)]">
                      <svg
                        className="mt-0.5 flex-shrink-0"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--color-copper)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.href}
                  className={`block w-full rounded-full py-3 text-sm font-semibold text-center transition-all duration-300 ${
                    tier.featured
                      ? "bg-[var(--color-copper)] text-white hover:bg-[var(--color-copper-hover)] hover:shadow-[0_8px_30px_-8px_rgba(180,83,9,0.4)]"
                      : "border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-copper)] hover:text-[var(--color-copper)]"
                  }`}
                >
                  Get Instant Quote
                </Link>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Subscription teaser */}
        <ScrollReveal delay={0.3}>
          <div className="mt-12 rounded-2xl border border-[var(--color-border-light)] bg-white/60 p-8 text-center backdrop-blur-sm lg:p-10">
            <div className="mx-auto flex max-w-2xl flex-col items-center">
              <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--color-copper)]/8 px-3 py-1 text-xs font-semibold text-[var(--color-copper)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Save More
              </span>
              <h3
                className="mb-2 text-xl font-semibold text-[var(--color-charcoal)] lg:text-2xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Running errands regularly?
              </h3>
              <p className="mb-6 text-[var(--color-text-muted)]">
                Bundle your errands with a monthly plan and save up to 30%. Perfect for
                parents, landlords, and busy professionals.
              </p>
              <Link href="/pricing" className="btn-secondary">
                View Subscription Plans
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
