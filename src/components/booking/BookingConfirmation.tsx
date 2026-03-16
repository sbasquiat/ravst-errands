"use client";

import { motion } from "framer-motion";

const typeLabels: Record<string, string> = {
  returns: "Returns & Drop-offs",
  handoffs: "Pickup → Drop Handoffs",
  collect: "Queue & Collect",
};

interface BookingData {
  displayId: string;
  type: string;
  pickup: string;
  dropoff: string;
  date: string;
  timeSlot: string;
  item: string;
  total: number;
  status: string;
}

interface BookingConfirmationProps {
  booking: BookingData;
}

export default function BookingConfirmation({ booking }: BookingConfirmationProps) {
  const formattedDate = new Date(booking.date + "T00:00:00").toLocaleDateString("en-IE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="mx-auto max-w-lg py-8 text-center">
      {/* Success animation */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
        className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50"
      >
        <motion.svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#16a34a"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </motion.svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h1
          className="text-[1.75rem] font-bold text-[var(--color-charcoal)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Errand booked!
        </h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          Your card has been authorised. You&apos;ll only be charged when the errand is complete.
        </p>
      </motion.div>

      {/* Booking summary card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-8 rounded-2xl border border-[var(--color-border-light)] bg-white p-6 text-left"
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-light)]">
            Booking reference
          </span>
          <span className="rounded-lg bg-[var(--color-cream)] px-2.5 py-1 text-xs font-bold text-[var(--color-charcoal)]">
            {booking.displayId}
          </span>
        </div>

        {/* Runner matching status */}
        <div className="mb-5 flex items-center gap-3 rounded-xl bg-[var(--color-copper)]/[0.06] px-4 py-3">
          <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--color-copper)]" />
          <span className="text-sm font-medium text-[var(--color-copper)]">
            Finding your runner...
          </span>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-green-400" />
            <div>
              <span className="text-xs text-[var(--color-text-light)]">Pickup</span>
              <p className="text-[var(--color-text)]">{booking.pickup}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-red-400" />
            <div>
              <span className="text-xs text-[var(--color-text-light)]">Drop-off</span>
              <p className="text-[var(--color-text)]">{booking.dropoff}</p>
            </div>
          </div>

          <div className="my-3 h-px bg-[var(--color-border-light)]" />

          <div className="flex justify-between">
            <span className="text-[var(--color-text-muted)]">Type</span>
            <span className="font-medium text-[var(--color-text)]">{typeLabels[booking.type] ?? booking.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-muted)]">Item</span>
            <span className="font-medium text-[var(--color-text)]">{booking.item}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-muted)]">Date</span>
            <span className="font-medium text-[var(--color-text)]">{formattedDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-muted)]">Time slot</span>
            <span className="font-medium text-[var(--color-text)]">{booking.timeSlot.replace("-", " – ")}</span>
          </div>

          <div className="my-3 h-px bg-[var(--color-border-light)]" />

          <div className="flex justify-between">
            <span className="font-semibold text-[var(--color-charcoal)]">Total (authorised)</span>
            <span className="text-lg font-bold text-[var(--color-charcoal)]">€{booking.total.toFixed(2)}</span>
          </div>
        </div>
      </motion.div>

      {/* What happens next */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="mt-6 rounded-2xl border border-[var(--color-border-light)] bg-white p-5 text-left"
      >
        <h3 className="mb-3 text-sm font-semibold text-[var(--color-charcoal)]">What happens next</h3>
        <div className="space-y-3">
          {[
            "We're matching you with a nearby vetted runner",
            "You'll get a notification when your runner is assigned",
            "Track your errand live and chat with your runner",
            "Get photo proof + GPS verification when it's done",
          ].map((text, i) => (
            <div key={text} className="flex items-start gap-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-cream)] text-xs font-bold text-[var(--color-text-muted)]">
                {i + 1}
              </div>
              <p className="text-sm text-[var(--color-text-muted)]">{text}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
      >
        <a
          href="/dashboard"
          className="btn-primary justify-center"
        >
          Go to Dashboard
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        <a
          href="/book"
          className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-5 py-3 text-sm font-medium text-[var(--color-text)] transition-all hover:bg-[var(--color-cream)]"
        >
          Book Another Errand
        </a>
      </motion.div>
    </div>
  );
}
