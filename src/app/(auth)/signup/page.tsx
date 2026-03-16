"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AuthInput from "@/components/auth/AuthInput";
import { signUpWithEmail } from "@/lib/supabase/actions";

type Step = "details" | "verify";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    else if (password.length < 8) errs.password = "Must be at least 8 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const result = await signUpWithEmail(name, email, password);
      if (result.error) {
        setErrors({ email: result.error });
        setLoading(false);
        return;
      }
      setStep("verify");
      setLoading(false);
    } catch {
      setErrors({ email: "Something went wrong. Please try again." });
      setLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {step === "details" ? (
        <motion.div
          key="details"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-8">
            <h1
              className="text-[1.75rem] font-bold text-[var(--color-charcoal)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Create your account
            </h1>
            <p className="mt-2 text-[0.9375rem] text-[var(--color-text-muted)]">
              Start getting your errands handled with proof.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput
              label="Full name"
              placeholder="Your full name"
              value={name}
              onChange={(v) => { setName(v); setErrors((e) => ({ ...e, name: "" })); }}
              error={errors.name}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              }
            />
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
            <AuthInput
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: "" })); }}
              error={errors.password}
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
                "Create Account"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[var(--color-text-muted)]">
            Already have an account?{" "}
            <a href="/login" className="font-semibold text-[var(--color-copper)] hover:text-[var(--color-copper-hover)] transition-colors">
              Log in
            </a>
          </p>
        </motion.div>
      ) : (
        <motion.div
          key="verify"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-copper)]/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-copper)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>

          <h1
            className="text-[1.5rem] font-bold text-[var(--color-charcoal)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Check your email
          </h1>
          <p className="mt-2 mb-8 text-sm text-[var(--color-text-muted)]">
            We sent a confirmation link to{" "}
            <span className="font-medium text-[var(--color-text)]">{email}</span>
          </p>

          <p className="text-sm text-[var(--color-text-muted)]">
            Click the link in the email to verify your account, then{" "}
            <a href="/login" className="font-semibold text-[var(--color-copper)] hover:text-[var(--color-copper-hover)] transition-colors">
              log in
            </a>.
          </p>

          <button
            onClick={() => setStep("details")}
            className="mt-6 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
          >
            &larr; Back to sign up
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
