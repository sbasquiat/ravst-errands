import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "Terms of Service — Ravst",
  description:
    "Terms of Service for using the Ravst errand service platform.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      'By accessing or using the Ravst platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the Service. We reserve the right to update these terms at any time — continued use constitutes acceptance of the revised terms.',
  },
  {
    title: "2. Service Description",
    content:
      "Ravst is a trust-first errand service operating in Dublin, Ireland. We connect customers with vetted, ID-verified runners who complete errands such as parcel returns, key handoffs, and queue-and-collect tasks. Every errand includes photo proof and GPS verification at each checkpoint.",
  },
  {
    title: "3. User Accounts",
    content:
      "You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You must be at least 18 years old to use the Service. Notify us immediately if you suspect unauthorized access to your account.",
  },
  {
    title: "4. Booking & Payment",
    content:
      'Ravst uses an authorize-then-capture payment model via Stripe. When you book an errand, your payment method is authorized for the quoted amount, but you are only charged once the errand is confirmed complete with proof. Prices are displayed clearly before you confirm — there are no hidden fees or surge pricing. Subscription bundles (Starter and Regular plans) are billed monthly in advance. Unused errands do not roll over to the next billing cycle.',
  },
  {
    title: "5. Cancellation Policy",
    content:
      "You may cancel a booked errand free of charge before a runner has been assigned. Once a runner is en route, cancellation may incur a fee to compensate the runner for their time. Subscription plans can be cancelled at any time; cancellation takes effect at the end of the current billing period.",
  },
  {
    title: "6. Runner Terms",
    content:
      "Runners are independent service providers, not employees of Ravst. All runners undergo identity verification and background checks before being approved on the platform. Runners must maintain professional conduct, handle items with care, and provide proof of completion for every errand. Ravst reserves the right to deactivate runner accounts that violate our standards.",
  },
  {
    title: "7. Proof of Completion",
    content:
      "Every errand includes a proof chain consisting of timestamped photos and GPS verification at each checkpoint. For returns, this includes a receipt photo. For handoffs, pickup and drop-off photos are captured. For collections, proof of pickup is provided. These records are available in your dashboard.",
  },
  {
    title: "8. Job Guarantee",
    content:
      "Every errand is backed by Ravst\u2019s Job Guarantee Fund of up to \u20ac200 per errand. If an item is lost, damaged, or an errand is not completed to the agreed specification, you may file a claim within 48 hours of the errand\u2019s completion. We will review the proof chain and issue a resolution, which may include a full or partial refund.",
  },
  {
    title: "9. Prohibited Items",
    content:
      "You may not use Ravst to transport illegal substances, hazardous materials, weapons, live animals, or any items prohibited by Irish law. Ravst reserves the right to refuse or cancel any errand involving prohibited items without refund.",
  },
  {
    title: "10. Limitation of Liability",
    content:
      'Ravst provides the platform on an "as is" basis. To the maximum extent permitted by law, Ravst shall not be liable for indirect, incidental, or consequential damages arising from your use of the Service. Our total liability is limited to the amount paid by you for the specific errand in question, subject to the Job Guarantee terms.',
  },
  {
    title: "11. Privacy",
    content:
      "Your use of the Service is also governed by our Privacy Policy, which describes how we collect, use, and protect your personal data. Please review our Privacy Policy for full details.",
  },
  {
    title: "12. Dispute Resolution",
    content:
      "If you have a dispute regarding an errand, please contact us at hello@ravst.com within 48 hours. We will review the proof chain and aim to resolve the matter within 5 business days. If we cannot resolve the dispute informally, it will be subject to the jurisdiction outlined below.",
  },
  {
    title: "13. Governing Law",
    content:
      "These Terms are governed by and construed in accordance with the laws of Ireland. Any disputes arising from these Terms or the Service shall be subject to the exclusive jurisdiction of the courts of Ireland.",
  },
];

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero header */}
        <section className="bg-[var(--color-cream)] pt-32 pb-12 lg:pt-40 lg:pb-16">
          <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-[var(--color-copper)]">
              Legal
            </p>
            <h1
              className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] text-[var(--color-charcoal)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Terms of Service
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-lg text-[var(--color-text-muted)]">
              Last updated: March 2026
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <div className="space-y-10">
              {sections.map((section) => (
                <div key={section.title}>
                  <h2
                    className="text-lg font-bold text-[var(--color-charcoal)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {section.title}
                  </h2>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--color-text-muted)]">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-16 rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-cream)] p-6 text-center">
              <p className="text-sm text-[var(--color-text-muted)]">
                Questions about our terms?{" "}
                <a href="/contact" className="font-medium text-[var(--color-copper)] hover:underline">
                  Contact us
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
