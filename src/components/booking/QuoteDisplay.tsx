"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface PricingBreakdown {
  baseFee: number;
  distanceFee: number;
  urgencyFee: number;
  totalPrice: number;
  platformFee: number;
  runnerPayout: number;
}

interface QuoteDisplayProps {
  errandType: string;
  stops: number;
  isUrgent?: boolean;
  pricing?: PricingBreakdown | null;
  distanceKm?: number;
  isLoading?: boolean;
  pickup?: string;
  dropoff?: string;
  hasPickupCoords?: boolean;
  hasDropoffCoords?: boolean;
}

// Base prices by errand type
const basePrices: Record<string, number> = {
  returns: 7,
  handoffs: 9,
  collect: 10,
};

const typeLabels: Record<string, string> = {
  returns: "Returns & Drop-offs",
  handoffs: "Pickup → Drop Handoffs",
  collect: "Queue & Collect",
};

// Animated counter for price changes
function AnimatedPrice({ value, className }: { value: number; className?: string }) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    if (prevRef.current === value) return;
    const from = prevRef.current;
    const to = value;
    const duration = 400;
    const start = performance.now();

    const animate = (time: number) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(from + (to - from) * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
    prevRef.current = value;
  }, [value]);

  return <span className={className}>€{displayValue.toFixed(2)}</span>;
}

export default function QuoteDisplay({
  errandType,
  stops,
  isUrgent = false,
  pricing,
  distanceKm,
  isLoading = false,
  pickup,
  dropoff,
  hasPickupCoords = false,
  hasDropoffCoords = false,
}: QuoteDisplayProps) {
  const hasRealPricing = pricing && pricing.totalPrice > 0;
  const hasBothAddresses = hasPickupCoords && hasDropoffCoords;

  const base = hasRealPricing ? pricing.baseFee : (basePrices[errandType] || 9);
  const distanceFee = hasRealPricing ? pricing.distanceFee : (hasBothAddresses ? 2.5 : 0);
  const urgencyFee = hasRealPricing ? pricing.urgencyFee : (isUrgent ? 4 : 0);
  const extraStopsFee = Math.max(0, stops - 2) * 3;

  const subtotal = base + distanceFee + urgencyFee + extraStopsFee;
  const serviceFee = hasRealPricing
    ? pricing.platformFee
    : (hasBothAddresses ? Math.round(subtotal * 0.12 * 100) / 100 : 0);

  const total = hasRealPricing
    ? pricing.totalPrice + extraStopsFee
    : (hasBothAddresses ? Math.round((subtotal + serviceFee) * 100) / 100 : base);

  const isEstimate = !hasRealPricing && hasBothAddresses;
  const isStartingFrom = !hasBothAddresses;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-[var(--color-border-light)] bg-white overflow-hidden"
    >
      {/* Type badge header */}
      <div className="bg-[var(--color-cream)] px-5 py-3 border-b border-[var(--color-border-light)]">
        <p className="text-xs font-semibold text-[var(--color-text-muted)]">
          {typeLabels[errandType] || errandType}
        </p>
      </div>

      <div className="p-5">
        {/* Route preview — shows as addresses are entered */}
        <AnimatePresence mode="popLayout">
          {(pickup || dropoff) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 space-y-1.5"
            >
              {pickup && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-xs"
                >
                  <span className="h-2 w-2 flex-shrink-0 rounded-full bg-green-400" />
                  <span className="text-[var(--color-text-muted)] truncate">{pickup}</span>
                  {hasPickupCoords && (
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 text-green-500">
                      <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </motion.div>
              )}
              {dropoff && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-2 text-xs"
                >
                  <span className="h-2 w-2 flex-shrink-0 rounded-full bg-red-400" />
                  <span className="text-[var(--color-text-muted)] truncate">{dropoff}</span>
                  {hasDropoffCoords && (
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 text-green-500">
                      <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </motion.div>
              )}
              {distanceKm != null && distanceKm > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] text-[var(--color-text-light)] pl-4"
                >
                  {distanceKm.toFixed(1)} km route
                </motion.p>
              )}
              <div className="h-px bg-[var(--color-border-light)] mt-2" />
            </motion.div>
          )}
        </AnimatePresence>

        <h3 className="mb-3 text-sm font-semibold text-[var(--color-charcoal)]">
          {isStartingFrom ? "Starting from" : "Price breakdown"}
        </h3>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-28 rounded bg-gray-100" />
                <div className="h-4 w-14 rounded bg-gray-100" />
              </div>
            ))}
            <div className="my-3 h-px bg-[var(--color-border-light)]" />
            <div className="flex justify-between">
              <div className="h-5 w-16 rounded bg-gray-100" />
              <div className="h-6 w-20 rounded bg-gray-100" />
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 text-sm">
            {/* Base fee — always visible */}
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Base price</span>
              <AnimatedPrice value={base} className="font-medium text-[var(--color-text)]" />
            </div>

            {/* Distance fee — only after both addresses geocoded */}
            <AnimatePresence>
              {hasBothAddresses && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex justify-between"
                >
                  <span className="text-[var(--color-text-muted)]">
                    Distance{distanceKm ? ` (${distanceKm.toFixed(1)} km)` : ""}
                  </span>
                  <AnimatedPrice value={distanceFee} className="font-medium text-[var(--color-text)]" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Extra stops — only when there are extra stops */}
            <AnimatePresence>
              {extraStopsFee > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex justify-between"
                >
                  <span className="text-[var(--color-text-muted)]">Extra stops ({stops - 2})</span>
                  <AnimatedPrice value={extraStopsFee} className="font-medium text-[var(--color-text)]" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Urgency fee — only when urgent */}
            <AnimatePresence>
              {urgencyFee > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex justify-between"
                >
                  <span className="text-[var(--color-text-muted)]">Express delivery</span>
                  <AnimatedPrice value={urgencyFee} className="font-medium text-[var(--color-copper)]" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Service fee — only after addresses */}
            <AnimatePresence>
              {hasBothAddresses && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex justify-between"
                >
                  <span className="text-[var(--color-text-muted)]">Service fee</span>
                  <AnimatedPrice value={serviceFee} className="font-medium text-[var(--color-text)]" />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="my-3 h-px bg-[var(--color-border-light)]" />

            {/* Total */}
            <div className="flex justify-between items-baseline">
              <span className="font-semibold text-[var(--color-charcoal)]">
                {isStartingFrom ? "From" : "Total"}
              </span>
              <AnimatedPrice
                value={total}
                className="text-lg font-bold text-[var(--color-charcoal)]"
              />
            </div>

            {/* Status indicators */}
            <AnimatePresence mode="wait">
              {isStartingFrom && (
                <motion.p
                  key="starting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] text-[var(--color-text-light)]"
                >
                  Enter addresses to see full pricing
                </motion.p>
              )}
              {isEstimate && (
                <motion.p
                  key="estimate"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] text-[var(--color-text-light)] italic"
                >
                  * Estimate — final price calculated from route
                </motion.p>
              )}
              {hasRealPricing && (
                <motion.div
                  key="confirmed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1 text-[10px] text-green-600 font-medium"
                >
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Price confirmed
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

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
      </div>
    </motion.div>
  );
}
