import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Link from "next/link";

export const metadata = {
  title: "Careers — Ravst",
  description:
    "Become a Ravst runner. Run errands, earn money, and own your schedule in Dublin.",
};

const benefits = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Flexible Schedule",
    description:
      "Go online when you want, go offline when you're done. No minimum hours, no fixed shifts. You decide when and how often you run.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    title: "Earn €12–€25+ Per Errand",
    description:
      "Earnings depend on distance, time, and errand type. Plus, customers can tip — and 100% of tips go directly to you.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: "Choose Your Zone",
    description:
      "Work in the neighbourhoods you know best. Accept errands close to you and avoid areas outside your comfort zone.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
    title: "Simple & Supportive",
    description:
      "Easy-to-use runner dashboard, clear errand instructions, and real support when you need it. No confusing algorithms.",
  },
];

const steps = [
  {
    number: "01",
    title: "Sign Up & Get Verified",
    description:
      "Create your account, select 'Runner' as your role, and complete identity verification. We'll review your application — most are approved within 24–48 hours.",
  },
  {
    number: "02",
    title: "Go Online & Accept Errands",
    description:
      "When you're ready to earn, go online in your runner dashboard. Browse available errands in your area and accept the ones that work for you.",
  },
  {
    number: "03",
    title: "Complete & Get Paid",
    description:
      "Pick up the item, follow the instructions, and submit proof at each checkpoint (photos + GPS). Once verified, payment is released to your account.",
  },
];

const requirements = [
  "At least 18 years old",
  "Valid government-issued ID (passport, driving licence, or national ID)",
  "A smartphone with a camera and data plan",
  "Reliable mode of transport (walking, bike, car, or public transport)",
  "Based in or around Dublin, Ireland",
  "Good communication skills and a professional attitude",
];

export default function CareersPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-[var(--color-cream)] pt-32 pb-12 lg:pt-40 lg:pb-16">
          <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-[var(--color-copper)]">
              Careers
            </p>
            <h1
              className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] text-[var(--color-charcoal)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Run errands. Earn money.
              <br />
              Own your schedule.
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-lg text-[var(--color-text-muted)]">
              We&apos;re looking for reliable people in Dublin to join Ravst as runners.
              Flexible hours, fair pay, and a platform that respects your time.
            </p>
            <div className="mt-8">
              <Link
                href="/signup"
                className="btn-primary inline-flex items-center gap-2 !px-8 !py-3.5"
              >
                Sign Up as a Runner
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2
                className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-[var(--color-charcoal)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Why run with Ravst?
              </h2>
              <p className="mt-3 max-w-lg mx-auto text-[var(--color-text-muted)]">
                Built for runners, not just customers.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 transition-shadow hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-copper)]/10 text-[var(--color-copper)]">
                    {benefit.icon}
                  </div>
                  <h3
                    className="mt-4 text-[0.9375rem] font-bold text-[var(--color-charcoal)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works for runners */}
        <section className="py-20 lg:py-28 bg-[var(--color-cream)]">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2
                className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-[var(--color-charcoal)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                How it works for runners
              </h2>
              <p className="mt-3 max-w-lg mx-auto text-[var(--color-text-muted)]">
                Three steps from sign-up to your first payout.
              </p>
            </div>

            <div className="space-y-12">
              {steps.map((step) => (
                <div key={step.number} className="flex gap-6 items-start">
                  <div
                    className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--color-copper)] text-white text-lg font-bold"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {step.number}
                  </div>
                  <div>
                    <h3
                      className="text-xl font-bold text-[var(--color-charcoal)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {step.title}
                    </h3>
                    <p className="mt-2 text-[var(--color-text-muted)] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Requirements */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2
                className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-[var(--color-charcoal)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                What you need to get started
              </h2>
            </div>

            <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-8">
              <ul className="space-y-4">
                {requirements.map((req) => (
                  <li key={req} className="flex items-start gap-3">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--color-copper)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="flex-shrink-0 mt-0.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-[var(--color-text-muted)]">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 lg:py-28 bg-[var(--color-cream)]">
          <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
            <h2
              className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-[var(--color-charcoal)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ready to start running?
            </h2>
            <p className="mt-3 max-w-lg mx-auto text-[var(--color-text-muted)]">
              Join Ravst as a runner and start earning on your own terms. Sign up takes
              less than 5 minutes.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup"
                className="btn-primary inline-flex items-center gap-2 !px-8 !py-3.5"
              >
                Sign Up as a Runner
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-8 py-3.5 text-[0.9375rem] font-semibold text-[var(--color-charcoal)] transition-all hover:bg-[var(--color-charcoal)]/5"
              >
                Got Questions?
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
