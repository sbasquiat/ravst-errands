"use client";

import ScrollReveal from "@/components/ui/ScrollReveal";

const features = [
  {
    title: "Photo proof at every step",
    description:
      "Timestamped photos at pickup and drop-off. See exactly what happened, when it happened.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
  },
  {
    title: "GPS-verified locations",
    description:
      "Every checkpoint is GPS-stamped. Know your runner was exactly where they needed to be.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    title: "Vetted & rated runners",
    description:
      "Every runner passes ID verification and a background check. Two-way ratings keep standards high.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "€200 job guarantee",
    description:
      "Every errand is backed by our guarantee fund. If something goes wrong, you're covered — up to €200.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
];

export default function Trust() {
  return (
    <section
      id="trust"
      className="relative py-24 lg:py-32 bg-[var(--color-forest)] overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-white/[0.02] blur-[1px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[var(--color-copper)]/[0.04] blur-[80px]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-center">
          {/* Left copy */}
          <div>
            <ScrollReveal>
              <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.15em] text-[var(--color-copper-light)]">
                Built on Trust
              </span>
              <h2 className="heading-section text-[clamp(2rem,4vw,3rem)] text-white mb-6">
                Trust isn&apos;t a feature.
                <br />
                <span className="text-[var(--color-copper-light)]">It&apos;s the product.</span>
              </h2>
              <p className="text-lg leading-relaxed text-white/60 max-w-md">
                Every errand comes with a proof chain — photos, GPS coordinates,
                timestamps. You never have to wonder if it was done right.
              </p>
            </ScrollReveal>

            {/* Stats */}
            <ScrollReveal delay={0.2}>
              <div className="mt-10 grid grid-cols-3 gap-6">
                {[
                  { value: "100%", label: "Jobs verified" },
                  { value: "4.9★", label: "Avg. rating" },
                  { value: "€200", label: "Guarantee" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p
                      className="text-2xl font-bold text-white lg:text-3xl"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-white/40">{stat.label}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>

          {/* Right: feature grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature, i) => (
              <ScrollReveal key={feature.title} delay={i * 0.1}>
                <div className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition-all duration-500 hover:bg-white/[0.07] hover:border-white/15 h-full">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-copper)]/15 text-[var(--color-copper-light)]">
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/50">
                    {feature.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
