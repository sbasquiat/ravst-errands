"use client";

import ScrollReveal from "@/components/ui/ScrollReveal";

const steps = [
  {
    number: "01",
    title: "Book your errand",
    description:
      "Tell us what you need — a return, pickup, or collection. Pick a time slot that works for you and get an instant quote.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-copper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "A vetted runner handles it",
    description:
      "We match you with a nearby, background-checked runner. Track progress in real-time and chat if you need to.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-copper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Get proof it's done",
    description:
      "Receive photo proof, GPS verification, and timestamps. Your errand is complete — no guesswork, just certainty.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-copper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16 lg:mb-20">
            <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.15em] text-[var(--color-copper)]">
              How It Works
            </span>
            <h2 className="heading-section text-[clamp(2rem,4vw,3rem)] text-[var(--color-charcoal)]">
              Three steps to done
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-[var(--color-text-muted)]">
              From booking to proof of completion in minutes, not hours.
            </p>
          </div>
        </ScrollReveal>

        <div className="relative grid gap-8 md:grid-cols-3 md:gap-6 lg:gap-12">
          {/* Connecting line (desktop) */}
          <div className="absolute top-[4.5rem] left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] hidden h-[1px] bg-gradient-to-r from-[var(--color-border)] via-[var(--color-copper)]/20 to-[var(--color-border)] md:block" />

          {steps.map((step, i) => (
            <ScrollReveal key={step.number} delay={i * 0.15}>
              <div className="relative flex flex-col items-center text-center">
                {/* Step circle */}
                <div className="relative mb-6 flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-2xl border border-[var(--color-border-light)] bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)]">
                  {step.icon}
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-copper)] text-[10px] font-bold text-white">
                    {step.number.replace("0", "")}
                  </span>
                </div>

                <h3
                  className="mb-3 text-xl font-semibold text-[var(--color-charcoal)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {step.title}
                </h3>
                <p className="max-w-xs text-[0.9375rem] leading-relaxed text-[var(--color-text-muted)]">
                  {step.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
