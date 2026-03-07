import Navbar from "@/components/landing/Navbar";
import HowItWorks from "@/components/landing/HowItWorks";
import Trust from "@/components/landing/Trust";
import CTABanner from "@/components/landing/CTABanner";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "How It Works — Ravst",
  description:
    "Book an errand in under 2 minutes, a vetted runner handles it, and you get photo proof when it's done.",
};

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero header */}
        <section className="bg-[var(--color-cream)] pt-32 pb-12 lg:pt-40 lg:pb-16">
          <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-[var(--color-copper)]">
              How it works
            </p>
            <h1
              className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] text-[var(--color-charcoal)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Three steps to getting
              <br />
              your errand done
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-lg text-[var(--color-text-muted)]">
              No apps to install, no complicated setup. Just tell us what you
              need and we handle the rest — with proof.
            </p>
          </div>
        </section>

        <HowItWorks />

        {/* Detailed explainer section */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <div className="space-y-16">
              {/* Step 1 detail */}
              <div className="flex flex-col gap-8 md:flex-row md:items-start">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--color-copper)]/10 text-[var(--color-copper)]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--color-charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
                    1. Tell us what you need
                  </h3>
                  <p className="mt-2 text-[var(--color-text-muted)] leading-relaxed">
                    Choose your errand type — return a parcel, hand off some keys, or queue &amp;
                    collect a package. Add the pickup and drop-off addresses (up to 3 stops), pick a
                    2-hour time window, and add any special instructions. You&apos;ll see an instant
                    quote before confirming.
                  </p>
                </div>
              </div>

              {/* Step 2 detail */}
              <div className="flex flex-col gap-8 md:flex-row md:items-start">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--color-forest)]/10 text-[var(--color-forest)]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--color-charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
                    2. A vetted runner handles it
                  </h3>
                  <p className="mt-2 text-[var(--color-text-muted)] leading-relaxed">
                    We match your errand to a nearby, ID-verified and background-checked runner.
                    Track their progress live on a map (or turn tracking off — your choice). If
                    anything comes up, chat with your runner directly in the app.
                  </p>
                </div>
              </div>

              {/* Step 3 detail */}
              <div className="flex flex-col gap-8 md:flex-row md:items-start">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--color-charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
                    3. Get proof it&apos;s done
                  </h3>
                  <p className="mt-2 text-[var(--color-text-muted)] leading-relaxed">
                    Every errand comes with photo proof and GPS verification at each checkpoint.
                    For returns you get a receipt photo, for handoffs you get pickup and drop-off
                    photos, and for collections the runner captures proof of pickup. You only get
                    charged when the errand is confirmed complete.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Trust />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
