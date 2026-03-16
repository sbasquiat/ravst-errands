import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "Cookie Policy — Ravst",
  description:
    "How Ravst uses cookies and similar technologies on our platform.",
};

const sections = [
  {
    title: "1. What Are Cookies?",
    content:
      "Cookies are small text files placed on your device when you visit a website. They help the site remember your preferences, keep you logged in, and understand how you interact with the platform. Cookies can be \u201csession\u201d cookies (deleted when you close your browser) or \u201cpersistent\u201d cookies (remain until they expire or you delete them).",
  },
  {
    title: "2. Essential Cookies",
    content:
      "These cookies are necessary for the platform to function. They include: Authentication cookies \u2014 managed by Supabase to keep you logged in securely; Session cookies \u2014 to maintain your session as you navigate between pages; Security cookies \u2014 to protect against cross-site request forgery (CSRF) and other threats. You cannot opt out of essential cookies as the platform cannot function without them.",
  },
  {
    title: "3. Functional Cookies",
    content:
      "We use functional cookies to remember your preferences, such as your selected errand type, booking draft data, and interface settings. These cookies enhance your experience but are not strictly required for the platform to operate.",
  },
  {
    title: "4. Third-Party Cookies",
    content:
      "Some cookies are placed by third-party services we use: Stripe \u2014 for secure payment processing. Stripe may set cookies to detect fraud and manage payment sessions. For details, see Stripe\u2019s privacy policy at stripe.com/privacy. We do not use advertising or tracking cookies from third-party ad networks.",
  },
  {
    title: "5. Managing Cookies",
    content:
      "You can control cookies through your browser settings. Most browsers allow you to: View cookies stored on your device; Delete individual or all cookies; Block cookies from specific or all websites; Set preferences for first-party vs third-party cookies. Note that blocking essential cookies may prevent you from using the Ravst platform. For instructions on managing cookies in your specific browser, visit your browser\u2019s help documentation.",
  },
  {
    title: "6. Changes to This Policy",
    content:
      "We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated \u201cLast updated\u201d date. We encourage you to review this policy periodically.",
  },
  {
    title: "7. Contact",
    content:
      "If you have questions about our use of cookies, please contact us at hello@ravst.com or visit our Contact page.",
  },
];

export default function CookiePolicyPage() {
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
              Cookie Policy
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
                Questions about cookies?{" "}
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
