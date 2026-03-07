"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const plans = [
  {
    id: "payg",
    name: "Pay As You Go",
    price: "No commitment",
    priceNote: "Pay per errand",
    features: ["Book anytime", "No monthly fee", "€200 guarantee per errand"],
    popular: false,
  },
  {
    id: "starter",
    name: "Starter Bundle",
    price: "€35",
    priceNote: "/month · 5 errands",
    savings: "Save €7/month vs pay-as-you-go",
    features: ["5 errands per month", "Priority runner matching", "€200 guarantee per errand", "Cancel anytime"],
    popular: true,
  },
  {
    id: "pro",
    name: "Pro Bundle",
    price: "€60",
    priceNote: "/month · 10 errands",
    savings: "Save €20/month vs pay-as-you-go",
    features: ["10 errands per month", "Priority runner matching", "Express time slots", "€200 guarantee per errand", "Cancel anytime"],
    popular: false,
  },
];

export default function SubscriptionPage() {
  const [currentPlan] = useState("payg");
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);

  return (
    <div className="mx-auto max-w-3xl">
      <h1
        className="text-[1.75rem] font-bold text-[var(--color-charcoal)] mb-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Subscription
      </h1>
      <p className="text-[var(--color-text-muted)] mb-8">
        Save money by bundling your errands. Upgrade or cancel anytime.
      </p>

      {/* Current plan summary */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8 rounded-2xl border border-[var(--color-border-light)] bg-white p-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-light)]">Current plan</p>
            <p className="mt-1 text-lg font-bold text-[var(--color-charcoal)]">Pay As You Go</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--color-text-light)]">This month</p>
            <p className="text-lg font-bold text-[var(--color-charcoal)]">4 errands · €47.72</p>
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-700">
            <span className="font-semibold">Tip:</span> You&apos;d save €12.72/month on the Starter Bundle with your current usage!
          </p>
        </div>
      </motion.div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {plans.map((plan, i) => (
          <motion.button
            key={plan.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }}
            onClick={() => setSelectedPlan(plan.id)}
            className={`relative rounded-2xl border-2 p-5 text-left transition-all cursor-pointer ${
              selectedPlan === plan.id
                ? "border-[var(--color-copper)] bg-white shadow-md"
                : "border-[var(--color-border-light)] bg-white hover:border-[var(--color-border)] hover:shadow-sm"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-copper)] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Most popular
              </span>
            )}

            {/* Radio indicator */}
            <div className="flex items-center justify-between mb-3">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                  selectedPlan === plan.id ? "border-[var(--color-copper)] bg-[var(--color-copper)]" : "border-[var(--color-border)]"
                }`}
              >
                {selectedPlan === plan.id && <div className="h-2 w-2 rounded-full bg-white" />}
              </div>
              {currentPlan === plan.id && (
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-600">Current</span>
              )}
            </div>

            <h3 className="text-base font-bold text-[var(--color-charcoal)]">{plan.name}</h3>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[var(--color-charcoal)]">{plan.price}</span>
              <span className="text-xs text-[var(--color-text-muted)]">{plan.priceNote}</span>
            </div>
            {plan.savings && (
              <p className="mt-1.5 text-xs font-medium text-green-600">{plan.savings}</p>
            )}

            <ul className="mt-4 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-[var(--color-text-muted)]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-copper)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </motion.button>
        ))}
      </div>

      {/* Upgrade button */}
      {selectedPlan !== currentPlan && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <button className="btn-primary">
            Upgrade to {plans.find((p) => p.id === selectedPlan)?.name}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </motion.div>
      )}

      {/* FAQ */}
      <div className="mt-12 pb-8">
        <h2
          className="text-lg font-bold text-[var(--color-charcoal)] mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Subscription FAQ
        </h2>
        <div className="space-y-4">
          {[
            { q: "What happens to unused errands?", a: "Unused errands don't roll over to the next month. We keep it simple — your allocation resets on your billing date." },
            { q: "Can I cancel anytime?", a: "Yes! Cancel anytime from this page. You'll keep access until the end of your billing period." },
            { q: "Can I upgrade mid-month?", a: "Absolutely. When you upgrade, we'll pro-rate the difference so you only pay for what's left in the month." },
          ].map((faq) => (
            <div key={faq.q} className="rounded-xl border border-[var(--color-border-light)] bg-white p-4">
              <h3 className="text-sm font-semibold text-[var(--color-charcoal)]">{faq.q}</h3>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
