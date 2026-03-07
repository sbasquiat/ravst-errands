import Navbar from "@/components/landing/Navbar";
import Pricing from "@/components/landing/Pricing";
import CTABanner from "@/components/landing/CTABanner";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "Pricing — Ravst",
  description:
    "Transparent, honest pricing. Pay per errand or save with a subscription bundle.",
};

const faqs = [
  {
    q: "When am I charged?",
    a: "Your card is authorised when you book, but you're only charged once the errand is confirmed complete with proof.",
  },
  {
    q: "Are there any hidden fees?",
    a: "Never. The price you see at booking is the price you pay. No surge pricing, no surprise add-ons.",
  },
  {
    q: "How does the subscription work?",
    a: "Choose a bundle (e.g. 5 errands/month for €35). Unused errands don't roll over, but you can upgrade or cancel anytime.",
  },
  {
    q: "Can I tip my runner?",
    a: "Yes! Tipping is optional and 100% goes to your runner. You can add a tip after the errand is marked complete.",
  },
  {
    q: "What's the €200 guarantee?",
    a: "Every errand is covered by our job guarantee fund. If something goes wrong, we'll make it right — up to €200 per errand.",
  },
  {
    q: "What affects the final price?",
    a: "Pricing is based on errand type, distance between stops, and time urgency. You always see the full price before confirming.",
  },
];

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero header */}
        <section className="bg-[var(--color-cream)] pt-32 pb-12 lg:pt-40 lg:pb-16">
          <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-[var(--color-copper)]">
              Pricing
            </p>
            <h1
              className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] text-[var(--color-charcoal)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Simple, transparent
              <br />
              pricing
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-lg text-[var(--color-text-muted)]">
              Pay per errand or save with a subscription bundle. You always see
              the price before you confirm — no surprises.
            </p>
          </div>
        </section>

        <Pricing />

        {/* FAQ section */}
        <section className="py-20 lg:py-28 bg-[var(--color-cream)]">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2
                className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-[var(--color-charcoal)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Frequently asked questions
              </h2>
              <p className="mt-3 text-[var(--color-text-muted)]">
                Everything you need to know about our pricing.
              </p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq) => (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6"
                >
                  <h3 className="text-[0.9375rem] font-semibold text-[var(--color-charcoal)]">
                    {faq.q}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
