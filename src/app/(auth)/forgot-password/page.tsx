"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AuthInput from "@/components/auth/AuthInput";
import { resetPasswordRequest, updatePassword } from "@/lib/supabase/actions";

type Step = "email" | "sent" | "reset" | "done";

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // If user arrives via reset link from email, jump to reset step
  useEffect(() => {
    if (searchParams.get("step") === "reset") {
      setStep("reset");
    }
  }, [searchParams]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Enter a valid email";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    const result = await resetPasswordRequest(email);
    setLoading(false);

    if (result.error) {
      setErrors({ email: result.error });
      return;
    }

    setStep("sent");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!password) errs.password = "Password is required";
    else if (password.length < 8) errs.password = "Must be at least 8 characters";
    if (!confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) errs.confirmPassword = "Passwords don't match";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    const result = await updatePassword(password);
    setLoading(false);

    if (result.error) {
      setErrors({ password: result.error });
      return;
    }

    setStep("done");
  };

  return (
    <AnimatePresence mode="wait">
      {/* Step 1: Enter email */}
      {step === "email" && (
        <motion.div
          key="email"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3 }}
        >
          <a
            href="/login"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to login
          </a>

          <div className="mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-copper)]/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-copper)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <h1
              className="text-[1.75rem] font-bold text-[var(--color-charcoal)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Forgot password?
            </h1>
            <p className="mt-2 text-[0.9375rem] text-[var(--color-text-muted)]">
              No worries. Enter your email and we&apos;ll send you a reset code.
            </p>
          </div>

          <form onSubmit={handleSendCode} className="space-y-4">
            <AuthInput
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: "" })); }}
              error={errors.email}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              }
            />

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center !mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                "Send Reset Code"
              )}
            </button>
          </form>
        </motion.div>
      )}

      {/* Step 2: Email sent confirmation */}
      {step === "sent" && (
        <motion.div
          key="sent"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-copper)]/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-copper)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>

          <h1
            className="text-[1.5rem] font-bold text-[var(--color-charcoal)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Check your email
          </h1>
          <p className="mt-2 mb-8 text-sm text-[var(--color-text-muted)]">
            We sent a password reset link to{" "}
            <span className="font-medium text-[var(--color-text)]">{email}</span>
          </p>

          <p className="text-sm text-[var(--color-text-muted)]">
            Click the link in the email to set a new password. The link will expire in 1 hour.
          </p>

          <p className="mt-6 text-sm text-[var(--color-text-muted)]">
            Didn&apos;t receive the email?{" "}
            <button
              onClick={() => setStep("email")}
              className="font-semibold text-[var(--color-copper)] hover:text-[var(--color-copper-hover)] transition-colors cursor-pointer"
            >
              Try again
            </button>
          </p>

          <a
            href="/login"
            className="mt-4 inline-block text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
          >
            &larr; Back to login
          </a>
        </motion.div>
      )}

      {/* Step 3: Set new password */}
      {step === "reset" && (
        <motion.div
          key="reset"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-copper)]/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-copper)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
              </svg>
            </div>
            <h1
              className="text-[1.75rem] font-bold text-[var(--color-charcoal)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Set new password
            </h1>
            <p className="mt-2 text-[0.9375rem] text-[var(--color-text-muted)]">
              Must be at least 8 characters long.
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <AuthInput
              label="New password"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: "" })); }}
              error={errors.password}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              }
            />
            <AuthInput
              label="Confirm password"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(v) => { setConfirmPassword(v); setErrors((e) => ({ ...e, confirmPassword: "" })); }}
              error={errors.confirmPassword}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              }
            />

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center !mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        </motion.div>
      )}

      {/* Step 4: Success */}
      {step === "done" && (
        <motion.div
          key="done"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
          className="text-center"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>

          <h1
            className="text-[1.75rem] font-bold text-[var(--color-charcoal)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Password reset!
          </h1>
          <p className="mt-2 text-[0.9375rem] text-[var(--color-text-muted)]">
            Your password has been successfully reset. You can now log in with your new password.
          </p>

          <a
            href="/login"
            className="btn-primary mt-8 inline-flex w-full justify-center"
          >
            Back to Log In
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-copper)]/30 border-t-[var(--color-copper)]" /></div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
