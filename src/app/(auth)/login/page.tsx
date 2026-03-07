"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AuthInput from "@/components/auth/AuthInput";
import OTPInput from "@/components/auth/OTPInput";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";

type AuthMethod = "email" | "phone";

export default function LoginPage() {
  const [method, setMethod] = useState<AuthMethod>("email");
  const [step, setStep] = useState<"credentials" | "otp">("credentials");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (method === "email") {
      if (!email.trim()) errs.email = "Email is required";
      if (!password) errs.password = "Password is required";
    } else {
      if (!phone.trim()) errs.phone = "Phone number is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (method === "phone") {
        setStep("otp");
      } else {
        // Simulate email login → dashboard
        window.location.href = "/dashboard";
      }
    }, 800);
  };

  const handleVerify = (code: string) => {
    console.log("OTP:", code);
    setLoading(true);
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1000);
  };

  return (
    <AnimatePresence mode="wait">
      {step === "credentials" ? (
        <motion.div
          key="credentials"
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
              Welcome back
            </h1>
            <p className="mt-2 text-[0.9375rem] text-[var(--color-text-muted)]">
              Log in to manage your errands.
            </p>
          </div>

          {/* Method toggle */}
          <div className="mb-6 flex rounded-xl bg-[var(--color-cream-dark)] p-1">
            {(["email", "phone"] as AuthMethod[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMethod(m); setErrors({}); }}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer ${
                  method === m
                    ? "bg-white text-[var(--color-charcoal)] shadow-sm"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                {m === "email" ? "Email" : "Phone Number"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {method === "email" ? (
              <>
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
              </>
            ) : (
              <AuthInput
                label="Phone number"
                type="tel"
                placeholder="+353 8X XXX XXXX"
                value={phone}
                onChange={(v) => { setPhone(v); setErrors((e) => ({ ...e, phone: "" })); }}
                error={errors.phone}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                }
              />
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center !mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : method === "email" ? (
                "Log In"
              ) : (
                "Send Code"
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
      ) : (
        <motion.div
          key="otp"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-copper)]/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-copper)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
          </div>

          <h1
            className="text-[1.5rem] font-bold text-[var(--color-charcoal)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Enter verification code
          </h1>
          <p className="mt-2 mb-8 text-sm text-[var(--color-text-muted)]">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-[var(--color-text)]">{phone}</span>
          </p>

          <OTPInput onComplete={handleVerify} />

          <p className="mt-6 text-sm text-[var(--color-text-muted)]">
            Didn&apos;t receive the code?{" "}
            <button className="font-semibold text-[var(--color-copper)] hover:text-[var(--color-copper-hover)] transition-colors cursor-pointer">
              Resend
            </button>
          </p>

          <button
            onClick={() => setStep("credentials")}
            className="mt-4 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
          >
            &larr; Back to login
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
