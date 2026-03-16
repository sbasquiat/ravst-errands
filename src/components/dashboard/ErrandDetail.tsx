"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import LiveTrackingMap from "@/components/dashboard/LiveTrackingMap";
import ProofViewer from "@/components/dashboard/ProofViewer";
import ChatInterface from "@/components/dashboard/ChatInterface";
import { useRealtimeErrandStatus, useRealtimeTimeline } from "@/lib/supabase/realtime";
import { submitRating, cancelErrand, fileDispute, addTip } from "@/lib/supabase/actions";
import type { ErrandTimeline, ProofPhoto } from "@/types/database";

interface ErrandRunner {
  id: string;
  profile: { full_name: string; phone: string | null; avatar_url: string | null };
  rating: number;
  transport_mode: string;
  jobs_completed: number;
}

interface ErrandCustomer {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
}

interface ChatMsg {
  id: string;
  errand_id: string;
  sender_id: string;
  sender_role: string;
  message: string;
  created_at: string;
  sender: { full_name: string; avatar_url: string | null };
}

interface ErrandData {
  id: string;
  display_id: string;
  type: string;
  status: string;
  item_description: string;
  pickup_address: string;
  dropoff_address: string;
  scheduled_date: string;
  time_slot_start: string;
  time_slot_end: string;
  total_price: number;
  package_size: string | null;
  special_instructions: string | null;
  tracking_number: string | null;
  recipient_name: string | null;
  order_number: string | null;
  collection_name: string | null;
  current_phase: string | null;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  customer_id: string;
  runner_id: string | null;
  customer: ErrandCustomer;
  runner: ErrandRunner | null;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending: { label: "Pending", color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-400 animate-pulse" },
  finding_runner: { label: "Finding runner", color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-400 animate-pulse" },
  runner_assigned: { label: "Runner assigned", color: "text-blue-600", bg: "bg-blue-50", dot: "bg-blue-400" },
  in_progress: { label: "In progress", color: "text-[var(--color-copper)]", bg: "bg-[var(--color-copper)]/[0.08]", dot: "bg-[var(--color-copper)] animate-pulse" },
  completed: { label: "Completed", color: "text-green-600", bg: "bg-green-50", dot: "bg-green-500" },
  cancelled: { label: "Cancelled", color: "text-gray-500", bg: "bg-gray-50", dot: "bg-gray-400" },
  disputed: { label: "Disputed", color: "text-red-600", bg: "bg-red-50", dot: "bg-red-500" },
};

const typeLabels: Record<string, string> = {
  returns: "Returns & Drop-offs",
  handoffs: "Pickup → Drop Handoffs",
  collect: "Queue & Collect",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(start: string, end: string) {
  return `${start.slice(0, 5)} – ${end.slice(0, 5)}`;
}

interface ErrandDetailProps {
  errand: ErrandData;
  timeline: ErrandTimeline[];
  proofs: ProofPhoto[];
  messages: ChatMsg[];
  currentUserId: string;
}

export default function ErrandDetail({
  errand: initialErrand,
  timeline: initialTimeline,
  proofs,
  messages,
  currentUserId,
}: ErrandDetailProps) {
  const [errand, setErrand] = useState(initialErrand);
  const [timeline, setTimeline] = useState(initialTimeline);
  const [showRating, setShowRating] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingHover, setRatingHover] = useState(0);
  const [tipAmount, setTipAmount] = useState(5);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Real-time errand status updates
  const handleErrandUpdate = useCallback(
    (payload: Record<string, unknown>) => {
      setErrand((prev) => ({
        ...prev,
        status: (payload.status as string) ?? prev.status,
        current_phase: (payload.current_phase as string | null) ?? prev.current_phase,
        runner_id: (payload.runner_id as string | null) ?? prev.runner_id,
      }));
    },
    []
  );

  useRealtimeErrandStatus(errand.id, handleErrandUpdate);

  // Real-time timeline updates
  const handleTimelineInsert = useCallback(
    (payload: Record<string, unknown>) => {
      const newEntry: ErrandTimeline = {
        id: payload.id as string,
        errand_id: payload.errand_id as string,
        event_type: payload.event_type as string,
        label: payload.label as string,
        description: payload.description as string,
        created_at: payload.created_at as string,
      };
      setTimeline((prev) => {
        if (prev.some((t) => t.id === newEntry.id)) return prev;
        return [...prev, newEntry];
      });
    },
    []
  );

  useRealtimeTimeline(errand.id, handleTimelineInsert);

  const status = statusConfig[errand.status] ?? statusConfig.pending;
  const runnerName = errand.runner?.profile?.full_name ?? "";
  const runnerInitials = runnerName ? getInitials(runnerName) : "";
  const isCustomer = errand.customer_id === currentUserId;

  // Transform messages for ChatInterface
  const chatMessages = messages.map((m) => ({
    id: m.id,
    sender: m.sender_role as "customer" | "runner" | "system",
    text: m.message,
    time: new Date(m.created_at).toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" }),
  }));

  // Transform proof photos for ProofViewer
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const proofPhotos = proofs.map((p) => ({
    id: p.id,
    type: p.type as "pickup" | "dropoff",
    label: `${p.type === "pickup" ? "Pickup" : "Drop-off"} photo`,
    timestamp: new Date(p.captured_at).toLocaleString("en-IE", {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    gps: p.gps_lat && p.gps_lng ? `${p.gps_lat.toFixed(4)}°N, ${Math.abs(p.gps_lng).toFixed(4)}°W` : "Location unavailable",
    placeholder: p.type === "pickup" ? "bg-emerald-400/80" : "bg-blue-400/80",
    imageUrl: p.storage_path ? `${supabaseUrl}/storage/v1/object/public/proof-photos/${p.storage_path}` : undefined,
  }));

  // Determine which timeline steps are done/active
  const timelineSteps = timeline.map((step, i) => {
    const isLast = i === timeline.length - 1;
    return {
      id: step.id,
      time: new Date(step.created_at).toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" }),
      label: step.label,
      description: step.description,
      done: !isLast || errand.status === "completed",
      active: isLast && errand.status !== "completed" && errand.status !== "cancelled",
    };
  });

  return (
    <div>
      {/* Back + header */}
      <div className="mb-6">
        <a
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mb-4"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to errands
        </a>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1
                className="text-[1.5rem] font-bold text-[var(--color-charcoal)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {errand.item_description}
              </h1>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.bg} ${status.color}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {typeLabels[errand.type] ?? errand.type} · {errand.display_id}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-[var(--color-charcoal)]">€{errand.total_price.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — map + activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live tracking map */}
          {errand.runner && ["runner_assigned", "in_progress"].includes(errand.status) && (
            <LiveTrackingMap
              errandId={errand.id}
              runnerName={runnerName}
              runnerInitials={runnerInitials}
              runnerRating={errand.runner.rating}
              pickup={errand.pickup_address}
              dropoff={errand.dropoff_address}
              pickupLat={errand.pickup_lat}
              pickupLng={errand.pickup_lng}
              dropoffLat={errand.dropoff_lat}
              dropoffLng={errand.dropoff_lng}
            />
          )}

          {/* Activity timeline */}
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-[var(--color-charcoal)]">Activity</h3>
            {timelineSteps.length > 0 ? (
              <div className="space-y-0">
                {timelineSteps.map((step, i) => (
                  <div key={step.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
                          step.active
                            ? "bg-[var(--color-copper)] text-white ring-4 ring-[var(--color-copper)]/20"
                            : step.done
                            ? "bg-green-500 text-white"
                            : "bg-[var(--color-cream)] text-[var(--color-text-light)]"
                        }`}
                      >
                        {step.done ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : step.active ? (
                          <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                        ) : (
                          <div className="h-1.5 w-1.5 rounded-full bg-current" />
                        )}
                      </div>
                      {i < timelineSteps.length - 1 && (
                        <div className={`w-px flex-1 min-h-[2rem] ${step.done ? "bg-green-200" : "bg-[var(--color-border-light)]"}`} />
                      )}
                    </div>
                    <div className={`pb-5 ${!step.done && !step.active ? "opacity-50" : ""}`}>
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${step.active ? "text-[var(--color-copper)]" : "text-[var(--color-charcoal)]"}`}>
                          {step.label}
                        </p>
                        <span className="text-xs text-[var(--color-text-light)]">{step.time}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">No activity yet</p>
            )}
          </div>

          {/* Proof photos */}
          {proofPhotos.length > 0 && <ProofViewer photos={proofPhotos} />}
        </div>

        {/* Right column — details + chat */}
        <div className="space-y-6">
          {/* Errand details card */}
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-[var(--color-charcoal)]">Errand Details</h3>

            <div className="space-y-3.5 text-sm">
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-green-400" />
                <div>
                  <span className="text-xs text-[var(--color-text-light)]">Pickup</span>
                  <p className="text-[var(--color-text)]">{errand.pickup_address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-red-400" />
                <div>
                  <span className="text-xs text-[var(--color-text-light)]">Drop-off</span>
                  <p className="text-[var(--color-text)]">{errand.dropoff_address}</p>
                </div>
              </div>

              <div className="h-px bg-[var(--color-border-light)]" />

              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Date</span>
                <span className="font-medium text-[var(--color-text)]">{formatDate(errand.scheduled_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Time slot</span>
                <span className="font-medium text-[var(--color-text)]">{formatTime(errand.time_slot_start, errand.time_slot_end)}</span>
              </div>
              {errand.package_size && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Package size</span>
                  <span className="font-medium text-[var(--color-text)]">{errand.package_size}</span>
                </div>
              )}
              {errand.tracking_number && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Tracking #</span>
                  <span className="font-mono text-xs font-medium text-[var(--color-text)]">{errand.tracking_number}</span>
                </div>
              )}
              {errand.recipient_name && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Recipient</span>
                  <span className="font-medium text-[var(--color-text)]">{errand.recipient_name}</span>
                </div>
              )}
              {errand.order_number && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Order #</span>
                  <span className="font-mono text-xs font-medium text-[var(--color-text)]">{errand.order_number}</span>
                </div>
              )}

              {errand.special_instructions && (
                <>
                  <div className="h-px bg-[var(--color-border-light)]" />
                  <div>
                    <span className="text-xs text-[var(--color-text-light)]">Special instructions</span>
                    <p className="mt-1 text-[var(--color-text)]">{errand.special_instructions}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Runner card */}
          {errand.runner && (
            <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold text-[var(--color-charcoal)]">Your Runner</h3>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-copper)]/10 text-sm font-bold text-[var(--color-copper)]">
                  {runnerInitials}
                </div>
                <div>
                  <p className="font-semibold text-[var(--color-charcoal)]">{runnerName}</p>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                    <span className="flex items-center gap-0.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--color-copper)" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      {errand.runner.rating?.toFixed(1) ?? "—"}
                    </span>
                    <span>·</span>
                    <span>{errand.runner.jobs_completed ?? 0} jobs</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat */}
          {errand.runner && (
            <ChatInterface
              errandId={errand.id}
              senderRole="customer"
              runnerName={runnerName}
              runnerInitials={runnerInitials}
              messages={chatMessages}
            />
          )}

          {/* Post-completion: Rating + Tip */}
          {isCustomer && errand.status === "completed" && errand.runner && !ratingSubmitted && (
            <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold text-[var(--color-charcoal)]">How was your experience?</h3>
              {!showRating ? (
                <div className="space-y-2">
                  <button
                    onClick={() => setShowRating(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-copper)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--color-copper)]/90 transition-colors cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    Rate Your Runner
                  </button>
                  <button
                    onClick={() => setShowTip(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-cream)] transition-colors cursor-pointer"
                  >
                    Leave a Tip
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Star rating */}
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onMouseEnter={() => setRatingHover(star)}
                        onMouseLeave={() => setRatingHover(0)}
                        onClick={() => setRatingValue(star)}
                        className="cursor-pointer p-0.5 transition-transform hover:scale-110"
                      >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill={(ratingHover || ratingValue) >= star ? "var(--color-copper)" : "#e0dbd4"} stroke="none">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    placeholder="Add a comment (optional)…"
                    rows={2}
                    className="w-full rounded-xl border border-[var(--color-border-light)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-copper)]/20 focus:border-[var(--color-copper)]/40 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        setActionLoading(true);
                        const result = await submitRating(errand.id, errand.runner!.id, ratingValue, ratingComment || undefined);
                        setActionLoading(false);
                        if (result.error) {
                          toast.error(result.error);
                        } else {
                          toast.success("Rating submitted — thank you!");
                          setRatingSubmitted(true);
                          setShowRating(false);
                        }
                      }}
                      disabled={actionLoading}
                      className="flex-1 rounded-xl bg-[var(--color-copper)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-copper)]/90 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading ? "Submitting…" : "Submit Rating"}
                    </button>
                    <button
                      onClick={() => setShowRating(false)}
                      className="rounded-xl border border-[var(--color-border-light)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-cream)] transition-colors cursor-pointer"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tip modal */}
          <AnimatePresence>
            {showTip && errand.runner && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5"
              >
                <h3 className="text-sm font-semibold text-[var(--color-charcoal)] mb-3">Leave a tip for {runnerName}</h3>
                <div className="flex gap-2 mb-4">
                  {[2, 5, 10, 15].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setTipAmount(amount)}
                      className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all cursor-pointer ${
                        tipAmount === amount
                          ? "bg-[var(--color-copper)] text-white"
                          : "border border-[var(--color-border-light)] text-[var(--color-text-muted)] hover:border-[var(--color-copper)]"
                      }`}
                    >
                      €{amount}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      setActionLoading(true);
                      const result = await addTip(errand.id, tipAmount);
                      setActionLoading(false);
                      if (result.error) {
                        toast.error(result.error);
                      } else {
                        toast.success(`€${tipAmount} tip added — thank you!`);
                        setShowTip(false);
                      }
                    }}
                    disabled={actionLoading}
                    className="flex-1 rounded-xl bg-[var(--color-forest)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-forest)]/90 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? "Adding…" : `Add €${tipAmount} Tip`}
                  </button>
                  <button
                    onClick={() => setShowTip(false)}
                    className="rounded-xl border border-[var(--color-border-light)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-cream)] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cancel confirmation */}
          <AnimatePresence>
            {showCancel && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="rounded-2xl border border-red-200 bg-red-50 p-5"
              >
                <h3 className="text-sm font-semibold text-red-800 mb-2">Cancel this errand?</h3>
                <p className="text-sm text-red-700/80 mb-4">
                  Your payment authorization will be released immediately. This cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      setActionLoading(true);
                      const result = await cancelErrand(errand.id);
                      setActionLoading(false);
                      if (result.error) {
                        toast.error(result.error);
                      } else {
                        toast.success("Errand cancelled — your payment hold has been released");
                        setShowCancel(false);
                        setErrand((prev) => ({ ...prev, status: "cancelled" }));
                      }
                    }}
                    disabled={actionLoading}
                    className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? "Cancelling…" : "Confirm Cancel"}
                  </button>
                  <button
                    onClick={() => setShowCancel(false)}
                    className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    Keep it
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dispute form */}
          <AnimatePresence>
            {showDispute && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="rounded-2xl border border-amber-200 bg-amber-50 p-5"
              >
                <h3 className="text-sm font-semibold text-amber-800 mb-3">Report an issue</h3>
                <div className="space-y-3">
                  <select
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300/50 cursor-pointer"
                  >
                    <option value="">Select a reason…</option>
                    <option value="item_damaged">Item was damaged</option>
                    <option value="item_missing">Item was not delivered</option>
                    <option value="wrong_item">Wrong item collected</option>
                    <option value="late_delivery">Delivery was very late</option>
                    <option value="runner_issue">Issue with runner</option>
                    <option value="overcharged">Overcharged</option>
                    <option value="other">Other</option>
                  </select>
                  <textarea
                    value={disputeDescription}
                    onChange={(e) => setDisputeDescription(e.target.value)}
                    placeholder="Describe the issue in detail…"
                    rows={3}
                    className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300/50 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        if (!disputeReason) {
                          toast.error("Please select a reason");
                          return;
                        }
                        if (!disputeDescription.trim()) {
                          toast.error("Please describe the issue");
                          return;
                        }
                        setActionLoading(true);
                        const result = await fileDispute(errand.id, disputeReason, disputeDescription);
                        setActionLoading(false);
                        if (result.error) {
                          toast.error(result.error);
                        } else {
                          toast.success("Dispute filed — our team will review within 24 hours");
                          setShowDispute(false);
                          setErrand((prev) => ({ ...prev, status: "disputed" }));
                        }
                      }}
                      disabled={actionLoading}
                      className="flex-1 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading ? "Filing…" : "File Dispute"}
                    </button>
                    <button
                      onClick={() => setShowDispute(false)}
                      className="rounded-xl border border-amber-200 px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          <div className="space-y-2">
            {errand.status === "completed" && (
              <a
                href={`/api/receipt/${errand.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-cream)] transition-colors cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
                </svg>
                Download Receipt
              </a>
            )}
            {isCustomer && ["pending", "finding_runner", "runner_assigned"].includes(errand.status) && (
              <button
                onClick={() => { setShowCancel(true); setShowDispute(false); }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                Cancel Errand
              </button>
            )}
            {isCustomer && !["cancelled", "disputed"].includes(errand.status) && (
              <button
                onClick={() => { setShowDispute(true); setShowCancel(false); }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Report Issue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
