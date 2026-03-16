"use client";

import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function CTABanner() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <div className="relative rounded-3xl copper-gradient px-8 py-16 text-center lg:px-16 lg:py-20 overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/[0.06] -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white/[0.04] translate-y-1/3 -translate-x-1/4" />
            <div className="absolute top-1/2 left-1/4 h-32 w-32 rounded-full bg-white/[0.03]" />

            <div className="relative z-10">
              <h2
                className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1.1] text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Ready to get your
                <br />
                time back?
              </h2>
              <p className="mx-auto mt-5 max-w-md text-lg text-white/70">
                Book your first errand in under 2 minutes. Get photo proof when
                it&apos;s done.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/book"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-[0.9375rem] font-semibold text-[var(--color-copper-hover)] transition-all duration-300 hover:bg-white/90 hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.2)]"
                >
                  Book an Errand
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-3.5 text-[0.9375rem] font-semibold text-white transition-all duration-300 hover:bg-white/10 hover:border-white/50"
                >
                  See Pricing
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
