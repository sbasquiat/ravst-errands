import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "Privacy Policy — Ravst",
  description:
    "How Ravst collects, uses, and protects your personal data.",
};

const sections = [
  {
    title: "1. Introduction",
    content:
      "Ravst (\u201cwe\u201d, \u201cour\u201d, \u201cus\u201d) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, share, and safeguard your personal information when you use the Ravst platform, website, and related services.",
  },
  {
    title: "2. Data Controller",
    content:
      "Ravst is the data controller responsible for your personal data. We are based in Dublin, Ireland and operate under the General Data Protection Regulation (GDPR) and Irish data protection law. For any enquiries, contact us at hello@ravst.com.",
  },
  {
    title: "3. Data We Collect",
    content:
      "We collect the following categories of data: Account information (name, email address, phone number, profile photo); Payment information (processed securely by Stripe \u2014 we never store full card numbers); Errand data (addresses, item descriptions, special instructions, photos, GPS coordinates); Device and usage data (browser type, IP address, pages visited, interaction data); Communications (messages with runners, support conversations).",
  },
  {
    title: "4. How We Use Your Data",
    content:
      "We use your data to: Create and manage your account; Process and fulfil errand bookings; Facilitate secure payments via Stripe; Provide real-time tracking and proof of completion; Communicate with you about your errands and account; Improve our platform, features, and user experience; Comply with legal obligations; Protect against fraud and abuse.",
  },
  {
    title: "5. Legal Basis for Processing (GDPR)",
    content:
      "We process your data on the following legal bases: Contract performance \u2014 to fulfil errand bookings and manage your account; Legitimate interests \u2014 to improve our service, prevent fraud, and ensure platform security; Consent \u2014 for marketing communications (you can opt out at any time); Legal obligation \u2014 to comply with applicable laws and regulations.",
  },
  {
    title: "6. Data Sharing",
    content:
      "We share your data only as necessary: With runners \u2014 limited to what is needed to complete your errand (pickup/drop-off addresses, item description, special instructions); Stripe \u2014 to process payments securely; Cloud infrastructure providers \u2014 to host and operate our platform (Supabase, Vercel); Legal authorities \u2014 if required by law or to protect rights and safety. We never sell your personal data to third parties.",
  },
  {
    title: "7. Data Retention",
    content:
      "We retain your personal data for as long as your account is active and for a reasonable period afterward to comply with legal obligations, resolve disputes, and enforce our agreements. Errand records (including proof photos) are retained for 12 months after completion. You can request deletion of your account and associated data at any time.",
  },
  {
    title: "8. Your Rights",
    content:
      "Under GDPR, you have the right to: Access your personal data; Rectify inaccurate data; Erase your data (\u201cright to be forgotten\u201d); Restrict or object to processing; Data portability; Withdraw consent at any time; Lodge a complaint with the Data Protection Commission (Ireland). To exercise any of these rights, contact us at hello@ravst.com.",
  },
  {
    title: "9. Cookies",
    content:
      "We use cookies to operate the platform, maintain your login session, and improve your experience. For full details on the cookies we use and how to manage them, please see our Cookie Policy.",
  },
  {
    title: "10. Security",
    content:
      "We implement appropriate technical and organisational measures to protect your data, including encryption in transit (TLS), secure authentication, and access controls. While no system is 100% secure, we continuously review and improve our security practices.",
  },
  {
    title: "11. Changes to This Policy",
    content:
      "We may update this Privacy Policy from time to time. We will notify you of material changes via email or a notice on our platform. The \u201cLast updated\u201d date at the top of this policy indicates when it was last revised.",
  },
  {
    title: "12. Contact",
    content:
      "If you have questions or concerns about this Privacy Policy or your personal data, please contact us at hello@ravst.com or visit our Contact page.",
  },
];

export default function PrivacyPage() {
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
              Privacy Policy
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
                Questions about your data?{" "}
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
