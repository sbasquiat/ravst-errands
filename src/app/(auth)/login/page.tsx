"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import AuthInput from "@/components/auth/AuthInput";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import { signInWithEmail } from "@/lib/supabase/actions";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = "Email is required";
    if (!password) errs.password = "Password is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const result = await signInWithEmail(email, password);
      if (result.error) {
        setErrors({ email: result.error });
        setLoading(false);
        return;
      }
      const dest = redirectTo
        ? redirectTo
        : result.role === "runner"
          ? "/runner"
          : result.role === "admin"
            ? "/admin"
            : "/dashboard";
      router.push(dest);
      router.refresh();
    } catch {
      setErrors({ email: "Something went wrong. Please try again." });
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <h1
          className="text-[1.75rem] font-bold text-[var(--color-charcoal)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Welcome back
        </h1>
        <p className="mt-2 text-[0.9375rem] text-[var(--color-text-muted)]">
          Log in to manage your errands.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
        <div>
          <AuthInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: "" })); }}
            error={errors.password}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            }
          />
          <div className="mt-1.5 text-right">
            <a
              href="/forgot-password"
              className="text-sm font-medium text-[var(--color-copper)] hover:text-[var(--color-copper-hover)] transition-colors"
            >
              Forgot password?
            </a>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center !mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            "Log In"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--color-border-light)]" />
        <span className="text-xs text-[var(--color-text-light)]">or</span>
        <div className="h-px flex-1 bg-[var(--color-border-light)]" />
      </div>

      {/* Social login */}
      <SocialLoginButtons />

      <p className="mt-8 text-center text-sm text-[var(--color-text-muted)]">
        Don&apos;t have an account?{" "}
        <a href="/signup" className="font-semibold text-[var(--color-copper)] hover:text-[var(--color-copper-hover)] transition-colors">
          Sign up
        </a>
      </p>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-copper)]/30 border-t-[var(--color-copper)]" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
