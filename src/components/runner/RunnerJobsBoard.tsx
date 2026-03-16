"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRealtimeAvailableJobs } from "@/lib/supabase/realtime";
import type { Errand, Profile, JobOffer } from "@/types/database";

type JobWithCustomer = Errand & {
  customer: Pick<Profile, "full_name" | "avatar_url"> | null;
};

type OfferErrandData = {
  id: string;
  display_id: string;
  type: string;
  item_description: string;
  pickup_address: string;
  dropoff_address: string;
  scheduled_date: string;
  runner_payout: number;
  total_price: number;
  distance_km?: number | null;
  time_slot_start?: string;
  time_slot_end?: string;
  urgency_fee?: number;
  customer: Pick<Profile, "full_name" | "avatar_url"> | null;
};

type OfferWithErrand = JobOffer & {
  errand: OfferErrandData | null;
};

const typeIcons: Record<string, React.ReactNode> = {
  returns: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8v13H3V8" /><path d="M1 3h22v5H1z" /><path d="M10 12h4" />
    </svg>
  ),
  handoffs: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 014-4h14" /><path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  ),
  collect: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

const typeLabels: Record<string, string> = {
  returns: "Returns & Drop-offs",
  handoffs: "Pickup → Drop Handoffs",
  collect: "Queue & Collect",
};

type ViewTab = "offers" | "available" | "my_jobs";

function formatTimeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return d.toLocaleDateString("en-IE", { day: "numeric", month: "short" });
}

function formatTime(start: string, end: string) {
  return `${start.slice(0, 5)} – ${end.slice(0, 5)}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  if (isToday) return "Today";
  if (isTomorrow) return "Tomorrow";
  return d.toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" });
}

function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState("");
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setExpired(true);
        setRemaining("Expired");
        return;
      }
      const min = Math.floor(diff / 60000);
      const sec = Math.floor((diff % 60000) / 1000);
      setRemaining(`${min}:${sec.toString().padStart(2, "0")}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <span className={`font-mono text-sm font-bold ${expired ? "text-red-500" : "text-[var(--color-copper)]"}`}>
      {remaining}
    </span>
  );
}

interface RunnerJobsBoardProps {
  availableJobs: JobWithCustomer[];
  myJobs: JobWithCustomer[];
  pendingOffers: OfferWithErrand[];
  runnerStats: {
    todayEarnings: number;
    rating: number;
  };
}

export default function RunnerJobsBoard({
  availableJobs: initialAvailable,
  myJobs: initialMyJobs,
  pendingOffers: initialOffers,
  runnerStats,
}: RunnerJobsBoardProps) {
  const hasOffers = initialOffers.length > 0;
  const [view, setView] = useState<ViewTab>(hasOffers ? "offers" : "available");
  const [availableJobs, setAvailableJobs] = useState(initialAvailable);
  const [myJobs, setMyJobs] = useState(initialMyJobs);
  const [offers, setOffers] = useState(initialOffers);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  // Real-time updates for available jobs
  const handleJobChange = useCallback(
    (payload: Record<string, unknown>, eventType: string) => {
      const jobId = payload.id as string;
      const jobStatus = payload.status as string;

      if (eventType === "INSERT" && jobStatus === "pending") {
        setAvailableJobs((prev) => {
          if (prev.some((j) => j.id === jobId)) return prev;
          const newJob: JobWithCustomer = {
            ...(payload as unknown as Errand),
            customer: null,
          };
          return [newJob, ...prev];
        });
      } else if (eventType === "UPDATE") {
        if (jobStatus !== "pending") {
          setAvailableJobs((prev) => prev.filter((j) => j.id !== jobId));
        }
        setMyJobs((prev) =>
          prev.map((j) =>
            j.id === jobId ? { ...j, status: jobStatus as Errand["status"] } : j
          )
        );
      } else if (eventType === "DELETE") {
        setAvailableJobs((prev) => prev.filter((j) => j.id !== jobId));
        setMyJobs((prev) => prev.filter((j) => j.id !== jobId));
      }
    },
    []
  );

  useRealtimeAvailableJobs(handleJobChange);

  const handleRespondToOffer = async (offerId: string, accept: boolean) => {
    setRespondingTo(offerId);
    try {
      const res = await fetch("/api/assignment/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId, accept }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to respond");
      } else {
        setOffers((prev) => prev.filter((o) => o.id !== offerId));
        if (accept) {
          toast.success("Job accepted! Head to the pickup location.");
          setView("my_jobs");
        } else {
          toast.success("Offer declined");
        }
      }
    } catch {
      toast.error("Something went wrong");
    }
    setRespondingTo(null);
  };

  const tabs: { key: ViewTab; label: string; count: number }[] = [
    ...(offers.length > 0
      ? [{ key: "offers" as ViewTab, label: "Offers", count: offers.length }]
      : []),
    { key: "available", label: "Available Jobs", count: availableJobs.length },
    { key: "my_jobs", label: "My Jobs", count: myJobs.length },
  ];

  const displayed = view === "available" ? availableJobs : view === "my_jobs" ? myJobs : [];

  return (
    <div>
      {/* Header with stats */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[1.75rem] font-bold text-[var(--color-charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
            Jobs Board
          </h1>
          <p className="mt-1 text-[var(--color-text-muted)]">
            {availableJobs.length} job{availableJobs.length !== 1 ? "s" : ""} available
            {offers.length > 0 && ` · ${offers.length} offer${offers.length !== 1 ? "s" : ""} pending`}
          </p>
        </div>
        <div className="flex gap-3">
          {[
            { label: "Earnings", value: `€${runnerStats.todayEarnings.toFixed(2)}`, sub: "total" },
            { label: "Active", value: myJobs.length.toString(), sub: "job" + (myJobs.length !== 1 ? "s" : "") },
            { label: "Rating", value: runnerStats.rating.toFixed(1), sub: "★" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-[var(--color-border-light)] bg-white px-4 py-3 text-center">
              <p className="text-lg font-bold text-[var(--color-charcoal)]">{stat.value}</p>
              <p className="text-xs text-[var(--color-text-light)]">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* View toggle */}
      <div className="mb-6 flex gap-1 rounded-xl bg-white p-1 shadow-sm border border-[var(--color-border-light)] w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
              view === tab.key
                ? tab.key === "offers"
                  ? "bg-[var(--color-copper)] text-white shadow-sm"
                  : "bg-[var(--color-charcoal)] text-white shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                view === tab.key ? "bg-white/20 text-white" : tab.key === "offers" ? "bg-[var(--color-copper)]/10 text-[var(--color-copper)]" : "bg-[var(--color-forest)]/10 text-[var(--color-forest)]"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Pending Offers Section */}
      {view === "offers" && (
        <div className="space-y-4">
          {offers.map((offer, i) => {
            const errand = offer.errand;
            if (!errand) return null;
            return (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="rounded-2xl border-2 border-[var(--color-copper)] bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-copper)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-copper)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-copper)] animate-pulse" />
                      New Offer
                    </span>
                    <span className="text-xs text-[var(--color-text-light)]">
                      {typeLabels[errand.type] ?? errand.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--color-text-light)]">Expires in</span>
                    <CountdownTimer expiresAt={offer.expires_at} />
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--color-cream)] text-[var(--color-text-muted)]">
                      {typeIcons[errand.type] ?? typeIcons.returns}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-[var(--color-charcoal)]">{errand.item_description}</h3>
                      <p className="mt-0.5 text-sm text-[var(--color-text-muted)] truncate">
                        {errand.pickup_address} → {errand.dropoff_address}
                      </p>
                      <div className="mt-2 flex items-center gap-3 flex-wrap text-xs text-[var(--color-text-light)]">
                        {errand.distance_km && (
                          <span>{errand.distance_km.toFixed(1)} km</span>
                        )}
                        {errand.time_slot_start && errand.time_slot_end && (
                          <span>{formatDate(errand.scheduled_date)} · {formatTime(errand.time_slot_start, errand.time_slot_end)}</span>
                        )}
                        {!errand.time_slot_start && (
                          <span>{formatDate(errand.scheduled_date)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-[var(--color-forest)]">€{errand.runner_payout.toFixed(2)}</span>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleRespondToOffer(offer.id, true)}
                    disabled={respondingTo === offer.id}
                    className="flex-1 rounded-xl bg-[var(--color-forest)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-forest)]/90 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {respondingTo === offer.id ? "..." : "Accept Job"}
                  </button>
                  <button
                    onClick={() => handleRespondToOffer(offer.id, false)}
                    disabled={respondingTo === offer.id}
                    className="rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-cream)] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Decline
                  </button>
                </div>
              </motion.div>
            );
          })}

          {offers.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-[var(--color-text-muted)]">No pending offers right now.</p>
            </div>
          )}
        </div>
      )}

      {/* Map + Jobs list (for available/my_jobs views) */}
      {view !== "offers" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Mock map */}
          <div className="lg:col-span-2 rounded-2xl border border-[var(--color-border-light)] bg-[#e8e4dc] overflow-hidden h-64 lg:h-auto lg:min-h-[500px] relative">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 opacity-15">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={`h-${i}`} className="absolute left-0 right-0 border-t border-[var(--color-text-light)]" style={{ top: `${(i + 1) * 9}%` }} />
                ))}
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={`v-${i}`} className="absolute top-0 bottom-0 border-l border-[var(--color-text-light)]" style={{ left: `${(i + 1) * 12}%` }} />
                ))}
              </div>
              {[
                { left: "30%", top: "25%", color: "bg-[var(--color-copper)]" },
                { left: "55%", top: "40%", color: "bg-[var(--color-forest)]" },
                { left: "40%", top: "60%", color: "bg-purple-500" },
                { left: "70%", top: "30%", color: "bg-[var(--color-copper)]" },
              ].map((marker, i) => (
                <div key={i} className="absolute" style={{ left: marker.left, top: marker.top }}>
                  <div className={`h-3 w-3 rounded-full ${marker.color} ring-4 ${marker.color}/20 shadow-lg`} />
                </div>
              ))}
              <div className="absolute" style={{ left: "45%", top: "45%" }}>
                <div className="flex flex-col items-center">
                  <div className="h-4 w-4 rounded-full bg-blue-500 ring-4 ring-blue-500/20 shadow-lg" />
                  <span className="mt-1 rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-medium text-[var(--color-text)] shadow-sm">You</span>
                </div>
              </div>
            </div>
            <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-2 text-xs text-[var(--color-text-muted)] shadow-sm">
              Dublin City Centre · {availableJobs.length} jobs nearby
            </div>
          </div>

          {/* Jobs list */}
          <div className="lg:col-span-3 space-y-3">
            {displayed.map((job, i) => {
              const isActive = ["runner_assigned", "in_progress"].includes(job.status);
              return (
                <motion.a
                  key={job.id}
                  href={`/runner/jobs/${job.id}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className={`block rounded-2xl border bg-white p-5 transition-all hover:shadow-md group ${
                    isActive
                      ? "border-[var(--color-forest)] ring-1 ring-[var(--color-forest)]/20"
                      : "border-[var(--color-border-light)] hover:border-[var(--color-border)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--color-cream)] text-[var(--color-text-muted)]">
                        {typeIcons[job.type] ?? typeIcons.returns}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-[var(--color-charcoal)]">{job.item_description}</h3>
                          {job.urgency_fee > 0 && (
                            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">EXPRESS</span>
                          )}
                          {isActive && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-forest)]/[0.08] px-2 py-0.5 text-[10px] font-medium text-[var(--color-forest)]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-forest)] animate-pulse" />
                              Active
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-sm text-[var(--color-text-muted)] truncate">
                          {job.pickup_address} → {job.dropoff_address}
                        </p>
                        <div className="mt-2 flex items-center gap-3 flex-wrap text-xs text-[var(--color-text-light)]">
                          {job.distance_km && (
                            <span className="flex items-center gap-1">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                              {job.distance_km.toFixed(1)} km
                            </span>
                          )}
                          <span>{formatDate(job.scheduled_date)} · {formatTime(job.time_slot_start, job.time_slot_end)}</span>
                          <span className="text-[var(--color-text-light)]">{formatTimeAgo(job.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xl font-bold text-[var(--color-forest)]">€{job.runner_payout.toFixed(2)}</span>
                      {job.status === "pending" && (
                        <span className="rounded-lg bg-[var(--color-forest)] px-3 py-1.5 text-xs font-semibold text-white group-hover:bg-[var(--color-forest)]/90 transition-colors">
                          View →
                        </span>
                      )}
                    </div>
                  </div>
                </motion.a>
              );
            })}

            {displayed.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-[var(--color-text-muted)]">
                  {view === "available" ? "No available jobs right now. Check back soon!" : "No active jobs. Accept one from the available list!"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
