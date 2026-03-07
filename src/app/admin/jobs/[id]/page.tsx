"use client";

import { use, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Types ─────────────────────────────────────────────── */

interface JobEvent {
  time: string;
  label: string;
  detail?: string;
}

/* ── Mock data ─────────────────────────────────────────── */

const job = {
  id: "JOB-010",
  item: "Amazon return parcel",
  type: "Returns & Drop-offs",
  status: "active" as const,
  amount: "€8.62",
  tip: "€2.00",
  platformFee: "€1.72",
  runnerPayout: "€8.90",
  customer: { name: "Sarah Mitchell", email: "sarah.m@email.com", phone: "+353 87 123 4567", avatar: "SM", joinDate: "Jan 2026", jobsPosted: 14, rating: 4.8 },
  runner: { name: "Cian O'Brien", email: "cian.o@email.com", phone: "+353 86 987 6543", avatar: "CO", joinDate: "Dec 2025", jobsCompleted: 89, rating: 4.9, transport: "Bicycle" },
  pickup: { address: "12 Grafton Street, Dublin 2", time: "14:00" },
  dropoff: { address: "An Post, O'Connell Street, Dublin 1", time: "16:00" },
  distance: "1.2 km",
  createdAt: "7 Mar 2026, 13:45",
  acceptedAt: "7 Mar 2026, 13:48",
  proofPickup: true,
  proofDropoff: false,
};

const timeline: JobEvent[] = [
  { time: "13:45", label: "Job created", detail: "Customer posted the errand" },
  { time: "13:48", label: "Runner accepted", detail: "Cian O'Brien accepted the job" },
  { time: "14:02", label: "En route to pickup", detail: "Runner heading to Grafton Street" },
  { time: "14:15", label: "At pickup location", detail: "Runner arrived at pickup" },
  { time: "14:18", label: "Pickup confirmed", detail: "Photo proof captured + GPS verified" },
  { time: "14:20", label: "In transit", detail: "Heading to drop-off" },
];

const statusConfig = {
  active: { label: "Active", color: "text-blue-700", bg: "bg-blue-50", dot: "bg-blue-500 animate-pulse" },
  completed: { label: "Completed", color: "text-green-700", bg: "bg-green-50", dot: "bg-green-500" },
  disputed: { label: "Disputed", color: "text-red-700", bg: "bg-red-50", dot: "bg-red-500" },
  cancelled: { label: "Cancelled", color: "text-gray-500", bg: "bg-gray-100", dot: "bg-gray-400" },
};

/* ── Component ─────────────────────────────────────────── */

export default function AdminJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [showReassign, setShowReassign] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [actionDone, setActionDone] = useState<string | null>(null);

  const config = statusConfig[job.status];

  const handleAction = (label: string) => {
    setActionDone(label);
    setShowReassign(false);
    setShowCancel(false);
    setTimeout(() => setActionDone(null), 2000);
  };

  return (
    <div>
      {/* Breadcrumb + header */}
      <div className="mb-8">
        <a href="/admin/jobs" className="text-sm text-[var(--color-text-muted)] hover:text-red-600 transition-colors">
          ← Back to Jobs
        </a>
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-[1.75rem] font-bold text-[var(--color-charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
              {id}
            </h1>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${config.bg} ${config.color}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
              {config.label}
            </span>
          </div>

          {/* Admin actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowReassign(!showReassign)}
              className="rounded-lg border border-[var(--color-border-light)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-charcoal)] hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Reassign Runner
            </button>
            <button
              onClick={() => setShowCancel(!showCancel)}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
            >
              Cancel Job
            </button>
          </div>
        </div>
      </div>

      {/* Action done toast */}
      <AnimatePresence>
        {actionDone && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 font-medium"
          >
            ✓ {actionDone}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reassign panel */}
      <AnimatePresence>
        {showReassign && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h3 className="text-sm font-semibold text-amber-800 mb-3">Reassign to a Different Runner</h3>
              <div className="flex gap-2 flex-wrap">
                {["Aoife Murphy", "Liam Walsh", "Niamh Kelly", "Sean Byrne"].map((name) => (
                  <button
                    key={name}
                    onClick={() => handleAction(`Job reassigned to ${name}`)}
                    className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    {name}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowReassign(false)} className="mt-3 text-xs text-amber-600 hover:underline cursor-pointer">
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel panel */}
      <AnimatePresence>
        {showCancel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <h3 className="text-sm font-semibold text-red-800 mb-2">Cancel this Job?</h3>
              <p className="text-sm text-red-700/80 mb-4">This will notify both the customer and runner. The customer will receive a full refund.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction("Job cancelled and customer refunded")}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Confirm Cancel
                </button>
                <button onClick={() => setShowCancel(false)} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors cursor-pointer">
                  Never mind
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content — 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job details card */}
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5">
            <h3 className="text-sm font-semibold text-[var(--color-charcoal)] mb-4">Job Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-[var(--color-text-light)] mb-1">Item</p>
                <p className="font-medium text-[var(--color-charcoal)]">{job.item}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-light)] mb-1">Type</p>
                <p className="font-medium text-[var(--color-charcoal)]">{job.type}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-light)] mb-1">Pickup</p>
                <p className="font-medium text-[var(--color-charcoal)]">{job.pickup.address}</p>
                <p className="text-xs text-[var(--color-text-light)]">Window: {job.pickup.time}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-light)] mb-1">Drop-off</p>
                <p className="font-medium text-[var(--color-charcoal)]">{job.dropoff.address}</p>
                <p className="text-xs text-[var(--color-text-light)]">Window: {job.dropoff.time}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-light)] mb-1">Distance</p>
                <p className="font-medium text-[var(--color-charcoal)]">{job.distance}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-light)] mb-1">Created</p>
                <p className="font-medium text-[var(--color-charcoal)]">{job.createdAt}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5">
            <h3 className="text-sm font-semibold text-[var(--color-charcoal)] mb-4">Activity Timeline</h3>
            <div className="space-y-0">
              {timeline.map((event, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`h-2.5 w-2.5 rounded-full mt-1.5 ${i === timeline.length - 1 ? "bg-blue-500 ring-4 ring-blue-500/20" : "bg-green-500"}`} />
                    {i < timeline.length - 1 && <div className="w-px h-full bg-[var(--color-border-light)] my-1" />}
                  </div>
                  <div className="pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--color-charcoal)]">{event.label}</span>
                      <span className="text-xs text-[var(--color-text-light)]">{event.time}</span>
                    </div>
                    {event.detail && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{event.detail}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Proof of delivery */}
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5">
            <h3 className="text-sm font-semibold text-[var(--color-charcoal)] mb-4">Proof of Delivery</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[var(--color-text-light)] mb-2">Pickup Proof</p>
                {job.proofPickup ? (
                  <div className="rounded-xl bg-[var(--color-cream)] border border-[var(--color-border-light)] aspect-[4/3] flex items-center justify-center relative">
                    <div className="text-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-light)" strokeWidth="1.5" className="mx-auto mb-1"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                      <p className="text-xs text-[var(--color-text-light)]">pickup_proof.jpg</p>
                    </div>
                    <span className="absolute top-2 right-2 rounded-full bg-green-500 text-white text-[8px] font-bold px-1.5 py-0.5">✓ Verified</span>
                  </div>
                ) : (
                  <div className="rounded-xl bg-gray-50 border border-dashed border-gray-200 aspect-[4/3] flex items-center justify-center">
                    <p className="text-xs text-gray-400">Not yet captured</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-light)] mb-2">Drop-off Proof</p>
                {job.proofDropoff ? (
                  <div className="rounded-xl bg-[var(--color-cream)] border border-[var(--color-border-light)] aspect-[4/3] flex items-center justify-center">
                    <p className="text-xs text-[var(--color-text-light)]">dropoff_proof.jpg</p>
                  </div>
                ) : (
                  <div className="rounded-xl bg-gray-50 border border-dashed border-gray-200 aspect-[4/3] flex items-center justify-center">
                    <p className="text-xs text-gray-400">Not yet captured</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Financial breakdown */}
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5">
            <h3 className="text-sm font-semibold text-[var(--color-charcoal)] mb-4">Financial</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Job amount</span>
                <span className="font-medium text-[var(--color-charcoal)]">{job.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Tip</span>
                <span className="font-medium text-[var(--color-charcoal)]">{job.tip}</span>
              </div>
              <div className="border-t border-[var(--color-border-light)] pt-3 flex justify-between">
                <span className="text-[var(--color-text-muted)]">Platform fee (20%)</span>
                <span className="font-medium text-red-600">{job.platformFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-[var(--color-charcoal)]">Runner payout</span>
                <span className="font-bold text-[var(--color-forest)]">{job.runnerPayout}</span>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5">
            <h3 className="text-sm font-semibold text-[var(--color-charcoal)] mb-3">Customer</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-copper)]/10 text-sm font-semibold text-[var(--color-copper)]">
                {job.customer.avatar}
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-charcoal)]">{job.customer.name}</p>
                <p className="text-xs text-[var(--color-text-light)]">Since {job.customer.joinDate}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Email</span>
                <span className="text-[var(--color-charcoal)]">{job.customer.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Phone</span>
                <span className="text-[var(--color-charcoal)]">{job.customer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Jobs posted</span>
                <span className="font-medium text-[var(--color-charcoal)]">{job.customer.jobsPosted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Rating</span>
                <span className="font-medium text-[var(--color-charcoal)]">{job.customer.rating} ★</span>
              </div>
            </div>
          </div>

          {/* Runner */}
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5">
            <h3 className="text-sm font-semibold text-[var(--color-charcoal)] mb-3">Runner</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-forest)]/10 text-sm font-semibold text-[var(--color-forest)]">
                {job.runner.avatar}
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-charcoal)]">{job.runner.name}</p>
                <p className="text-xs text-[var(--color-text-light)]">Since {job.runner.joinDate} · {job.runner.transport}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Email</span>
                <span className="text-[var(--color-charcoal)]">{job.runner.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Phone</span>
                <span className="text-[var(--color-charcoal)]">{job.runner.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Jobs completed</span>
                <span className="font-medium text-[var(--color-charcoal)]">{job.runner.jobsCompleted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Rating</span>
                <span className="font-medium text-[var(--color-charcoal)]">{job.runner.rating} ★</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
