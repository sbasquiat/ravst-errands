import Navbar from "@/components/landing/Navbar";
import CTABanner from "@/components/landing/CTABanner";
import Footer from "@/components/landing/Footer";
import Link from "next/link";

export const metadata = {
  title: "About — Ravst",
  description:
    "Ravst is a trust-first errand service built in Dublin. Vetted runners, photo proof, and a €200 guarantee on every job.",
};

const values = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Trust Is the Product",
    description:
      "Every errand comes with a proof chain — timestamped photos, GPS verification, and a transparent paper trail. Trust isn't a feature; it's the entire foundation.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Radical Transparency",
    description:
      "No hidden fees. No surge pricing. You see the exact price before booking, your card is only charged when the errand is complete, and you can track every step.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: "Dublin-First",
    description:
      "We're building Ravst from the ground up in Dublin. Launching locally means we can obsess over quality, iterate fast, and build a service that truly works — before scaling elsewhere.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: "Community-Powered",
    description:
      "Ravst runners are locals who know Dublin. They're ID-verified, background-checked, and genuinely invested in the community. When they succeed, the whole neighbourhood benefits.",
  },
];

const differentiators = [
  {
    stat: "Photo + GPS",
    label: "Proof Chain",
    description: "Every errand comes with timestamped photos and GPS verification at each checkpoint.",
  },
  {
    stat: "Authorize First",
    label: "Fair Payment",
    description: "Your card is authorized at booking but only charged when the errand is complete with proof.",
  },
  {
    stat: "€200",
    label: "Job Guarantee",
    description: "Every errand is backed by our guarantee fund — if something goes wrong, we make it right.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-[var(--color-cream)] pt-32 pb-12 lg:pt-40 lg:pb-16">
          <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-[var(--color-copper)]">
              About
            </p>
            <h1
              className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] text-[var(--color-charcoal)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Trust-first errand service,
              <br />
              built in Dublin
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-lg text-[var(--color-text-muted)]">
              We believe errands shouldn&apos;t eat up your day. Ravst turns &ldquo;I need
              this done&rdquo; into a completed job — with proof.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-16">
              <div className="md:w-1/3">
                <h2
                  className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--color-charcoal)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Why Ravst exists
                </h2>
              </div>
              <div className="md:w-2/3 space-y-5 text-[var(--color-text-muted)] leading-relaxed">
                <p>
                  Returning a parcel. Handing off a set of keys. Queuing at a collection
                  point. These errands are small individually, but they pile up — stealing
                  hours you could spend working, resting, or being with the people who matter.
                </p>
                <p>
                  The problem isn&apos;t just time. It&apos;s that there&apos;s no reliable way to
                  delegate these tasks without wondering: <em>Did it actually get done?
                  Was the receipt collected? Did the package arrive?</em>
                </p>
                <p>
                  Ravst solves both problems at once. We provide vetted runners who handle
                  your errands, and a proof chain that removes all doubt. You book in
                  under 2 minutes, track everything in real time, and get photo and GPS
                  proof when it&apos;s done. Your card isn&apos;t charged until the job is confirmed complete.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 lg:py-28 bg-[var(--color-cream)]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2
                className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-[var(--color-charcoal)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                What we stand for
              </h2>
              <p className="mt-3 max-w-lg mx-auto text-[var(--color-text-muted)]">
                Four principles that guide every decision we make.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 transition-shadow hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-copper)]/10 text-[var(--color-copper)]">
                    {value.icon}
                  </div>
                  <h3
                    className="mt-4 text-[0.9375rem] font-bold text-[var(--color-charcoal)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Differentiators */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2
                className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-[var(--color-charcoal)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                How we&apos;re different
              </h2>
              <p className="mt-3 max-w-lg mx-auto text-[var(--color-text-muted)]">
                Built-in trust at every step — not bolted on as an afterthought.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {differentiators.map((d) => (
                <div key={d.label} className="text-center">
                  <p
                    className="text-3xl font-bold text-[var(--color-copper)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {d.stat}
                  </p>
                  <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-[var(--color-charcoal)]">
                    {d.label}
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-text-muted)] leading-relaxed max-w-xs mx-auto">
                    {d.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Join us banner */}
        <section className="py-16 bg-[var(--color-cream)]">
          <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
            <h2
              className="text-[clamp(1.25rem,2.5vw,1.75rem)] font-bold text-[var(--color-charcoal)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Want to join the team?
            </h2>
            <p className="mt-3 text-[var(--color-text-muted)]">
              We&apos;re looking for runners in Dublin to help us deliver errands with trust and care.
            </p>
            <Link
              href="/careers"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-charcoal)] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--color-charcoal)]/90"
            >
              View Careers
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </section>

        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
