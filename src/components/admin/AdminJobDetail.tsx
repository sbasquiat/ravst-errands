"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { adminUpdateErrandStatus, adminReassignRunner } from "@/lib/supabase/actions";
import type { Errand, ErrandTimeline, ProofPhoto, Profile } from "@/types/database";

type ErrandWithRelations = Errand & {
  customer: Pick<Profile, "id" | "full_name" | "email" | "phone" | "avatar_url">;
  runner: { id: string; profile: Pick<Profile, "full_name" | "phone" | "avatar_url">; rating: number; transport_mode: string; jobs_completed: number } | null;
};

type RunnerOption = {
  id: string;
  profile: Pick<Profile, "full_name" | "avatar_url">;
};

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500" },
  finding_runner: { label: "Finding Runner", color: "text-blue-700", bg: "bg-blue-50", dot: "bg-blue-500 animate-pulse" },
  runner_assigned: { label: "Assigned", color: "text-blue-700", bg: "bg-blue-50", dot: "bg-blue-500" },
  in_progress: { label: "Active", color: "text-blue-700", bg: "bg-blue-50", dot: "bg-blue-500 animate-pulse" },
  completed: { label: "Completed", color: "text-green-700", bg: "bg-green-50", dot: "bg-green-500" },
  cancelled: { label: "Cancelled", color: "text-gray-500", bg: "bg-gray-100", dot: "bg-gray-400" },
  disputed: { label: "Disputed", color: "text-red-700", bg: "bg-red-50", dot: "bg-red-500" },
};

const typeLabels: Record<string, string> = {
  returns: "Returns & Drop-offs",
  handoffs: "Pickup → Drop Handoffs",
  collect: "Queue & Collect",
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

interface AdminJobDetailProps {
  errand: ErrandWithRelations;
  timeline: ErrandTimeline[];
  proofs: ProofPhoto[];
  availableRunners: RunnerOption[];
}

export default function AdminJobDetail({ errand, timeline, proofs, availableRunners }: AdminJobDetailProps) {
  const [showReassign, setShowReassign] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [actionDone, setActionDone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const config = statusConfig[errand.status] ?? statusConfig.pending;

  const pickupProof = proofs.find((p) => p.type === "pickup");
  const dropoffProof = proofs.find((p) => p.type === "dropoff");

  const handleCancel = async () => {
    setLoading(true);
    const result = await adminUpdateErrandStatus(errand.id, "cancelled");
    setLoading(false);
    if (!result.error) {
      setActionDone("Job cancelled and customer notified");
      setShowCancel(false);
    }
  };

  const handleReassign = async (runnerId: string, runnerName: string) => {
    setLoading(true);
    const result = await adminReassignRunner(errand.id, runnerId);
    setLoading(false);
    if (!result.error) {
      setActionDone(`Job reassigned to ${runnerName}`);
      setShowReassign(false);
    }
  };

  const handleCapturePayment = async () => {
    if (!errand.stripe_payment_intent_id) {
      toast.error("No payment intent found for this errand");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/capture-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId: errand.stripe_payment_intent_id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to capture payment");
        return;
      }
      setActionDone(`Payment captured — €${(data.amount / 100).toFixed(2)}`);
      setTimeout(() => setActionDone(null), 3000);
    } catch {
      toast.error("Failed to capture payment");
    } finally {
      setLoading(false);
    }
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
              {errand.display_id ?? errand.id.slice(0, 8)}
            </h1>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${config.bg} ${config.color}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
              {config.label}
            </span>
          </div>

          {errand.status !== "completed" && errand.status !== "cancelled" && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowReassign(!showReassign)}
                disabled={loading}
                className="rounded-lg border border-[var(--color-border-light)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-charcoal)] hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                Reassign Runner
              </button>
              <button
                onClick={() => setShowCancel(!showCancel)}
                disabled={loading}
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel Job
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action toast */}
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
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h3 className="text-sm font-semibold text-amber-800 mb-3">Reassign to a Different Runner</h3>
              <div className="flex gap-2 flex-wrap">
                {availableRunners
                  .filter((r) => r.id !== errand.runner_id)
                  .map((runner) => (
                    <button
                      key={runner.id}
                      onClick={() => handleReassign(runner.id, runner.profile.full_name ?? "Runner")}
                      disabled={loading}
                      className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {runner.profile.full_name}
                    </button>
                  ))}
                {availableRunners.filter((r) => r.id !== errand.runner_id).length === 0 && (
                  <p className="text-sm text-amber-700">No other active runners available</p>
                )}
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
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <h3 className="text-sm font-semibold text-red-800 mb-2">Cancel this Job?</h3>
              <p className="text-sm text-red-700/80 mb-4">This will notify both the customer and runner. The customer will receive a full refund.</p>
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Cancelling…" : "Confirm Cancel"}
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
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job details */}
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5">
            <h3 className="text-sm font-semibold text-[var(--color-charcoal)] mb-4">Job Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-[var(--color-text-light)] mb-1">Item</p>
                <p className="font-medium text-[var(--color-charcoal)]">{errand.item_description}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-light)] mb-1">Type</p>
                <p className="font-medium text-[var(--color-charcoal)]">{typeLabels[errand.type] ?? errand.type}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-light)] mb-1">Pickup</p>
                <p className="font-medium text-[var(--color-charcoal)]">{errand.pickup_address}</p>
                <p className="text-xs text-[var(--color-text-light)]">Window: {errand.time_slot_start?.slice(0, 5)}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-light)] mb-1">Drop-off</p>
                <p className="font-medium text-[var(--color-charcoal)]">{errand.dropoff_address}</p>
                <p className="text-xs text-[var(--color-text-light)]">Window: {errand.time_slot_end?.slice(0, 5)}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-light)] mb-1">Distance</p>
                <p className="font-medium text-[var(--color-charcoal)]">{errand.distance_km?.toFixed(1) ?? "—"} km</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-light)] mb-1">Created</p>
                <p className="font-medium text-[var(--color-charcoal)]">{new Date(errand.created_at).toLocaleString("en-IE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5">
            <h3 className="text-sm font-semibold text-[var(--color-charcoal)] mb-4">Activity Timeline</h3>
            {timeline.length > 0 ? (
              <div className="space-y-0">
                {timeline.map((event, i) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`h-2.5 w-2.5 rounded-full mt-1.5 ${i === timeline.length - 1 ? "bg-blue-500 ring-4 ring-blue-500/20" : "bg-green-500"}`} />
                      {i < timeline.length - 1 && <div className="w-px h-full bg-[var(--color-border-light)] my-1" />}
                    </div>
                    <div className="pb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[var(--color-charcoal)]">{event.label}</span>
                        <span className="text-xs text-[var(--color-text-light)]">{new Date(event.created_at).toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      {event.description && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{event.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">No timeline events yet</p>
            )}
          </div>

          {/* Proof of delivery */}
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5">
            <h3 className="text-sm font-semibold text-[var(--color-charcoal)] mb-4">Proof of Delivery</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[var(--color-text-light)] mb-2">Pickup Proof</p>
                {pickupProof ? (
                  <div className="rounded-xl bg-[var(--color-cream)] border border-[var(--color-border-light)] aspect-[4/3] flex items-center justify-center relative">
                    <div className="text-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-light)" strokeWidth="1.5" className="mx-auto mb-1"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                      <p className="text-xs text-[var(--color-text-light)]">Pickup photo</p>
                      {pickupProof.gps_lat && <p className="text-[10px] text-[var(--color-text-light)]">GPS: {pickupProof.gps_lat.toFixed(4)}, {pickupProof.gps_lng?.toFixed(4)}</p>}
                    </div>
                    {pickupProof.verified && (
                      <span className="absolute top-2 right-2 rounded-full bg-green-500 text-white text-[8px] font-bold px-1.5 py-0.5">✓ Verified</span>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl bg-gray-50 border border-dashed border-gray-200 aspect-[4/3] flex items-center justify-center">
                    <p className="text-xs text-gray-400">Not yet captured</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-light)] mb-2">Drop-off Proof</p>
                {dropoffProof ? (
                  <div className="rounded-xl bg-[var(--color-cream)] border border-[var(--color-border-light)] aspect-[4/3] flex items-center justify-center relative">
                    <div className="text-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-light)" strokeWidth="1.5" className="mx-auto mb-1"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                      <p className="text-xs text-[var(--color-text-light)]">Dropoff photo</p>
                      {dropoffProof.gps_lat && <p className="text-[10px] text-[var(--color-text-light)]">GPS: {dropoffProof.gps_lat.toFixed(4)}, {dropoffProof.gps_lng?.toFixed(4)}</p>}
                    </div>
                    {dropoffProof.verified && (
                      <span className="absolute top-2 right-2 rounded-full bg-green-500 text-white text-[8px] font-bold px-1.5 py-0.5">✓ Verified</span>
                    )}
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
          {/* Financial */}
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5">
            <h3 className="text-sm font-semibold text-[var(--color-charcoal)] mb-4">Financial</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Base fee</span>
                <span className="font-medium text-[var(--color-charcoal)]">€{errand.base_fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Distance fee</span>
                <span className="font-medium text-[var(--color-charcoal)]">€{errand.distance_fee.toFixed(2)}</span>
              </div>
              {errand.urgency_fee > 0 && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Urgency fee</span>
                  <span className="font-medium text-[var(--color-charcoal)]">€{errand.urgency_fee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Tip</span>
                <span className="font-medium text-[var(--color-charcoal)]">€{errand.tip.toFixed(2)}</span>
              </div>
              <div className="border-t border-[var(--color-border-light)] pt-3 flex justify-between">
                <span className="text-[var(--color-text-muted)]">Total price</span>
                <span className="font-medium text-[var(--color-charcoal)]">€{errand.total_price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Platform fee (20%)</span>
                <span className="font-medium text-red-600">€{errand.platform_fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-[var(--color-charcoal)]">Runner payout</span>
                <span className="font-bold text-[var(--color-forest)]">€{errand.runner_payout.toFixed(2)}</span>
              </div>
            </div>

            {/* Capture payment button — only for completed errands with a payment intent */}
            {errand.status === "completed" && errand.stripe_payment_intent_id && (
              <button
                onClick={handleCapturePayment}
                disabled={loading}
                className="mt-4 w-full rounded-lg bg-[var(--color-copper)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-copper)]/90 transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? "Capturing…" : "Capture Payment"}
              </button>
            )}
          </div>

          {/* Customer */}
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5">
            <h3 className="text-sm font-semibold text-[var(--color-charcoal)] mb-3">Customer</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-copper)]/10 text-sm font-semibold text-[var(--color-copper)]">
                {getInitials(errand.customer?.full_name ?? "?")}
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-charcoal)]">{errand.customer?.full_name ?? "—"}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Email</span>
                <span className="text-[var(--color-charcoal)]">{errand.customer?.email ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Phone</span>
                <span className="text-[var(--color-charcoal)]">{errand.customer?.phone ?? "—"}</span>
              </div>
            </div>
          </div>

          {/* Runner */}
          {errand.runner && (
            <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5">
              <h3 className="text-sm font-semibold text-[var(--color-charcoal)] mb-3">Runner</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-forest)]/10 text-sm font-semibold text-[var(--color-forest)]">
                  {getInitials(errand.runner.profile?.full_name ?? "?")}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-charcoal)]">{errand.runner.profile?.full_name ?? "—"}</p>
                  <p className="text-xs text-[var(--color-text-light)]">{errand.runner.transport_mode}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Phone</span>
                  <span className="text-[var(--color-charcoal)]">{errand.runner.profile?.phone ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Jobs completed</span>
                  <span className="font-medium text-[var(--color-charcoal)]">{errand.runner.jobs_completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Rating</span>
                  <span className="font-medium text-[var(--color-charcoal)]">{errand.runner.rating.toFixed(1)} ★</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
