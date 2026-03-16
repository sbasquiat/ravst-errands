"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        await supabase.auth.resend({ type: "signup", email: user.email });
        setResent(true);
        toast.success("Verification email sent!");
      }
    } catch {
      toast.error("Failed to resend. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-cream)] px-6">
      <div className="mx-auto max-w-md w-full text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-copper)]/10">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-copper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>

        <h1
          className="text-2xl font-bold text-[var(--color-charcoal)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Check your email
        </h1>
        <p className="mt-3 text-[var(--color-text-muted)]">
          We sent a verification link to your email address. Click the link to activate your account.
        </p>

        <div className="mt-8 rounded-2xl border border-[var(--color-border-light)] bg-white p-6 space-y-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            Didn&apos;t receive the email? Check your spam folder or click below to resend.
          </p>
          <button
            onClick={handleResend}
            disabled={resending || resent}
            className="btn-primary w-full !py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resent ? "Email Sent!" : resending ? "Sending..." : "Resend Verification Email"}
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 text-sm">
          <Link href="/login" className="text-[var(--color-copper)] hover:underline font-medium">
            Back to Login
          </Link>
          <span className="text-[var(--color-text-light)]">·</span>
          <Link href="/contact" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            Need Help?
          </Link>
        </div>
      </div>
    </div>
  );
}
