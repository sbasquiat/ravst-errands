import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import ContactForm from "@/components/marketing/ContactForm";
import Link from "next/link";

export const metadata = {
  title: "Contact — Ravst",
  description:
    "Get in touch with Ravst. We'd love to hear from you.",
};

const contactInfo = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    label: "Email",
    value: "hello@ravst.com",
    href: "mailto:hello@ravst.com",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
    label: "Location",
    value: "Dublin, Ireland",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    label: "Response Time",
    value: "Within 24 hours",
  },
];

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-[var(--color-cream)] pt-32 pb-12 lg:pt-40 lg:pb-16">
          <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-[var(--color-copper)]">
              Contact
            </p>
            <h1
              className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] text-[var(--color-charcoal)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Get in touch
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-lg text-[var(--color-text-muted)]">
              Have a question, feedback, or just want to say hello? We&apos;d love to hear from you.
            </p>
          </div>
        </section>

        {/* Contact content */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-5">
              {/* Form */}
              <div className="lg:col-span-3">
                <ContactForm />
              </div>

              {/* Info */}
              <div className="lg:col-span-2 space-y-6">
                {contactInfo.map((info) => (
                  <div
                    key={info.label}
                    className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 flex items-start gap-4"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--color-copper)]/10 text-[var(--color-copper)]">
                      {info.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                        {info.label}
                      </p>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="mt-0.5 text-sm font-medium text-[var(--color-charcoal)] hover:text-[var(--color-copper)] transition-colors"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="mt-0.5 text-sm font-medium text-[var(--color-charcoal)]">
                          {info.value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Runner CTA */}
                <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-cream)] p-6">
                  <h3
                    className="text-[0.9375rem] font-bold text-[var(--color-charcoal)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Interested in becoming a runner?
                  </h3>
                  <p className="mt-2 text-sm text-[var(--color-text-muted)] leading-relaxed">
                    We&apos;re looking for reliable runners in Dublin. Flexible hours, fair pay.
                  </p>
                  <Link
                    href="/careers"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-copper)] hover:underline"
                  >
                    Learn more about running with Ravst
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
