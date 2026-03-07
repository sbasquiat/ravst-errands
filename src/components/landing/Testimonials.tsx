"use client";

import ScrollReveal from "@/components/ui/ScrollReveal";

const testimonials = [
  {
    quote:
      "I used to spend my Saturday mornings queuing at the post office for returns. Now I book a Ravst runner and get photo proof it's done while I'm at the park with my kids.",
    name: "Aoife Kelly",
    role: "Parent, Dublin 6",
    rating: 5,
    initials: "AK",
    color: "#b45309",
  },
  {
    quote:
      "Managing five rental properties means constant key handoffs. Ravst handles them with PIN verification — I know exactly who received what and when.",
    name: "Cian O'Brien",
    role: "Landlord & Host",
    rating: 5,
    initials: "CO",
    color: "#1a3a2f",
  },
  {
    quote:
      "We were sending staff on collection runs twice a week. Ravst costs less than the productivity we were losing. The proof system is brilliant for our records.",
    name: "Sarah Chen",
    role: "Small Business Owner",
    rating: 5,
    initials: "SC",
    color: "#6d28d9",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="var(--color-copper)"
          stroke="none"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="relative py-24 lg:py-32 bg-[var(--color-warm-white)]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.15em] text-[var(--color-copper)]">
              Testimonials
            </span>
            <h2 className="heading-section text-[clamp(2rem,4vw,3rem)] text-[var(--color-charcoal)]">
              Trusted by busy Dubliners
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <ScrollReveal key={t.name} delay={i * 0.12}>
              <div className="flex h-full flex-col rounded-2xl border border-[var(--color-border-light)] bg-white p-7 transition-all duration-500 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.06)]">
                <Stars count={t.rating} />

                <blockquote className="mt-5 flex-1 text-[0.9375rem] leading-relaxed text-[var(--color-text-muted)]">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <div className="mt-6 flex items-center gap-3 border-t border-[var(--color-border-light)] pt-5">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-charcoal)]">
                      {t.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">{t.role}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
