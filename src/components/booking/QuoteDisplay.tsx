"use client";

import { motion } from "framer-motion";

interface QuoteDisplayProps {
  errandType: string;
  stops: number;
  isUrgent?: boolean;
}

// Mock pricing engine — mirrors product spec: distance + type + urgency
const basePrices: Record<string, number> = {
  returns: 7,
  handoffs: 9,
  collect: 10,
};

export default function QuoteDisplay({
  errandType,
  stops,
  isUrgent = false,
}: QuoteDisplayProps) {
  const base = basePrices[errandType] || 9;
  const extraStops = Math.max(0, stops - 2) * 3; // €3 per extra stop beyond 2
  const distanceEstimate = 2.5; // Mock distance surcharge
  const urgencyFee = isUrgent ? 4 : 0;
  const subtotal = base + extraStops + distanceEstimate + urgencyFee;
  const serviceFee = Math.round(subtotal * 0.12 * 100) / 100;
  const total = Math.round((subtotal + serviceFee) * 100) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5"
    >
      <h3 className="mb-4 text-sm font-semibold text-[var(--color-charcoal)]">
        Price breakdown
      </h3>

      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between">
          <span className="text-[var(--color-text-muted)]">Base price ({errandType})</span>
          <span className="font-medium text-[var(--color-text)]">€{base.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-text-muted)]">Distance estimate</span>
          <span className="font-medium text-[var(--color-text)]">€{distanceEstimate.toFixed(2)}</span>
        </div>
        {extraStops > 0 && (
          <div className="flex justify-between">
            <span className="text-[var(--color-text-muted)]">Extra stops ({stops - 2})</span>
            <span className="font-medium text-[var(--color-text)]">€{extraStops.toFixed(2)}</span>
          </div>
        )}
        {urgencyFee > 0 && (
          <div className="flex justify-between">
            <span className="text-[var(--color-text-muted)]">Express delivery</span>
            <span className="font-medium text-[var(--color-copper)]">€{urgencyFee.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-[var(--color-text-muted)]">Service fee</span>
          <span className="font-medium text-[var(--color-text)]">€{serviceFee.toFixed(2)}</span>
        </div>

        <div className="my-3 h-px bg-[var(--color-border-light)]" />

        <div className="flex justify-between">
          <span className="font-semibold text-[var(--color-charcoal)]">Total</span>
          <span className="text-lg font-bold text-[var(--color-charcoal)]">
            €{total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Trust indicators */}
      <div className="mt-4 flex flex-col gap-2 rounded-xl bg-[var(--color-cream)] p-3">
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-copper)" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Covered by €200 job guarantee
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-copper)" strokeWidth="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
          </svg>
          Card authorised now, charged on completion only
        </div>
      </div>
    </motion.div>
  );
}
