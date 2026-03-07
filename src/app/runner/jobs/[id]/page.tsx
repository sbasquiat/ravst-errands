"use client";

import { use, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ── Types ─────────────────────────────────────────────── */

type JobPhase =
  | "job_details"
  | "en_route_pickup"
  | "at_pickup"
  | "proof_pickup"
  | "in_transit"
  | "at_dropoff"
  | "proof_dropoff"
  | "complete";

interface ProofPhoto {
  id: string;
  label: string;
  placeholder: string;
  timestamp: string;
  gps: string;
}

/* ── Mock data ─────────────────────────────────────────── */

const mockJob = {
  id: "JOB-20260307-010",
  type: "returns" as const,
  typeLabel: "Returns & Drop-offs",
  item: "Amazon return parcel",
  pickup: "12 Grafton Street, Dublin 2, D02 VF65",
  dropoff: "An Post, 14 O'Connell Street Lower, Dublin 1",
  distance: "1.2 km",
  estimatedTime: "12 min",
  date: "Friday, 7 March 2026",
  time: "14:00 – 16:00",
  payout: "€8.62",
  baseFee: "€5.00",
  distanceFee: "€1.62",
  tip: "€2.00",
  status: "active" as const,
  customer: {
    name: "Seun B.",
    initials: "SB",
    rating: 4.8,
    memberSince: "Jan 2026",
  },
  specialInstructions:
    "Parcel is in a white Amazon bag by the front door. Buzzer code: 4521",
  packageSize: "Medium (shoebox)",
  trackingNumber: "TBA934827164927",
  postedAt: "13:40",
};

const chatMessages = [
  { id: "m0", sender: "system" as const, text: "You have been assigned to this errand", time: "13:45" },
  { id: "m1", sender: "runner" as const, text: "Hi! I'm heading to pick up your parcel now.", time: "13:48" },
  { id: "m2", sender: "customer" as const, text: "Great, thanks! The buzzer code is 4521, ground floor.", time: "13:50" },
];

/* ── Phase config ──────────────────────────────────────── */

const phaseSteps: { key: JobPhase; label: string; shortLabel: string }[] = [
  { key: "job_details", label: "Job Details", shortLabel: "Details" },
  { key: "en_route_pickup", label: "En Route to Pickup", shortLabel: "En Route" },
  { key: "at_pickup", label: "At Pickup Location", shortLabel: "At Pickup" },
  { key: "proof_pickup", label: "Capture Pickup Proof", shortLabel: "Proof" },
  { key: "in_transit", label: "In Transit to Drop-off", shortLabel: "Transit" },
  { key: "at_dropoff", label: "At Drop-off Location", shortLabel: "At Drop" },
  { key: "proof_dropoff", label: "Capture Drop-off Proof", shortLabel: "Proof" },
  { key: "complete", label: "Job Complete", shortLabel: "Done" },
];

/* ── Component ─────────────────────────────────────────── */

export default function RunnerJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const job = mockJob; // In production: fetch by id

  const [phase, setPhase] = useState<JobPhase>(job.status === "active" ? "en_route_pickup" : "job_details");
  const [accepted, setAccepted] = useState(job.status === "active");
  const [pickupPhotos, setPickupPhotos] = useState<ProofPhoto[]>([]);
  const [dropoffPhotos, setDropoffPhotos] = useState<ProofPhoto[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState(chatMessages);
  const [newMessage, setNewMessage] = useState("");

  const currentStepIndex = phaseSteps.findIndex((s) => s.key === phase);

  const handleAcceptJob = () => {
    setAccepted(true);
    setPhase("en_route_pickup");
  };

  const handleCaptureProof = (type: "pickup" | "dropoff") => {
    const photo: ProofPhoto = {
      id: `proof-${Date.now()}`,
      label: type === "pickup" ? "Pickup photo" : "Drop-off photo",
      placeholder: type === "pickup" ? "bg-emerald-400/80" : "bg-blue-400/80",
      timestamp: new Date().toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" }) + ", 7 Mar 2026",
      gps: "53.3412°N, 6.2603°W",
    };
    if (type === "pickup") {
      setPickupPhotos((prev) => [...prev, photo]);
    } else {
      setDropoffPhotos((prev) => [...prev, photo]);
    }
  };

  const advancePhase = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < phaseSteps.length) {
      setPhase(phaseSteps[nextIndex].key);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: `m${Date.now()}`, sender: "runner" as const, text: newMessage, time: new Date().toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" }) },
    ]);
    setNewMessage("");
  };

  return (
    <div>
      {/* Back link */}
      <a
        href="/runner"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mb-4"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to jobs
      </a>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[1.5rem] font-bold text-[var(--color-charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
              {job.item}
            </h1>
            {accepted && phase !== "complete" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-forest)]/[0.08] px-3 py-1 text-xs font-medium text-[var(--color-forest)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-forest)] animate-pulse" />
                Active
              </span>
            )}
            {phase === "complete" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                Completed
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{job.typeLabel} · {job.id}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-[var(--color-forest)]">{job.payout}</span>
          <p className="text-xs text-[var(--color-text-light)]">your payout</p>
        </div>
      </div>

      {/* Step progress bar (visible once accepted) */}
      {accepted && (
        <div className="mb-6 rounded-2xl border border-[var(--color-border-light)] bg-white p-4">
          <div className="flex items-center justify-between gap-1">
            {phaseSteps.slice(1).map((step, i) => {
              const stepIndex = i + 1;
              const isDone = currentStepIndex > stepIndex;
              const isActive = currentStepIndex === stepIndex;
              return (
                <div key={step.key} className="flex flex-1 items-center gap-1">
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                        isDone
                          ? "bg-green-500 text-white"
                          : isActive
                          ? "bg-[var(--color-forest)] text-white ring-4 ring-[var(--color-forest)]/20"
                          : "bg-[var(--color-cream)] text-[var(--color-text-light)]"
                      }`}
                    >
                      {isDone ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                      ) : (
                        stepIndex
                      )}
                    </div>
                    <span className={`text-[9px] text-center font-medium hidden sm:block ${
                      isActive ? "text-[var(--color-forest)]" : isDone ? "text-green-600" : "text-[var(--color-text-light)]"
                    }`}>
                      {step.shortLabel}
                    </span>
                  </div>
                  {i < phaseSteps.length - 2 && (
                    <div className={`h-0.5 flex-1 rounded-full transition-colors -mt-3 sm:mt-0 ${
                      isDone ? "bg-green-300" : "bg-[var(--color-border-light)]"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — active flow */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {/* PHASE: Job Details (pre-accept) */}
            {phase === "job_details" && (
              <motion.div key="details" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                {/* Map preview */}
                <div className="rounded-2xl border border-[var(--color-border-light)] bg-[#e8e4dc] overflow-hidden h-56 relative">
                  <div className="absolute inset-0 opacity-15">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={`h-${i}`} className="absolute left-0 right-0 border-t border-[var(--color-text-light)]" style={{ top: `${(i + 1) * 11}%` }} />
                    ))}
                  </div>
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                    <path d="M 100 140 Q 200 60 300 100" stroke="var(--color-forest)" strokeWidth="3" fill="none" strokeDasharray="8 4" opacity="0.6" />
                  </svg>
                  <div className="absolute" style={{ left: "24%", top: "65%" }}>
                    <div className="h-3 w-3 rounded-full bg-green-500 ring-4 ring-green-500/20" />
                  </div>
                  <div className="absolute" style={{ left: "74%", top: "45%" }}>
                    <div className="h-3 w-3 rounded-full bg-red-500 ring-4 ring-red-500/20" />
                  </div>
                  <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-2 text-xs text-[var(--color-text-muted)] shadow-sm">
                    {job.distance} · ~{job.estimatedTime} by bike
                  </div>
                </div>

                {/* Accept / Decline */}
                {!accepted && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleAcceptJob}
                      className="flex-1 rounded-xl bg-[var(--color-forest)] py-3.5 text-sm font-semibold text-white hover:bg-[var(--color-forest)]/90 transition-colors cursor-pointer"
                    >
                      Accept Job — {job.payout}
                    </button>
                    <a
                      href="/runner"
                      className="flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-white px-6 py-3.5 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-cream)] transition-colors"
                    >
                      Decline
                    </a>
                  </div>
                )}
              </motion.div>
            )}

            {/* PHASE: En Route to Pickup */}
            {phase === "en_route_pickup" && (
              <motion.div key="enroute" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                <div className="rounded-2xl border border-[var(--color-forest)]/30 bg-[var(--color-forest)]/[0.04] p-6 text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-forest)]/10">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-forest)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
                    Head to Pickup Location
                  </h3>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">{job.pickup}</p>
                  <p className="mt-3 text-xs text-[var(--color-text-light)]">{job.distance} away · ~{job.estimatedTime}</p>
                </div>

                <button
                  onClick={() => setPhase("at_pickup")}
                  className="w-full rounded-xl bg-[var(--color-forest)] py-3.5 text-sm font-semibold text-white hover:bg-[var(--color-forest)]/90 transition-colors cursor-pointer"
                >
                  I've Arrived at Pickup
                </button>
              </motion.div>
            )}

            {/* PHASE: At Pickup */}
            {phase === "at_pickup" && (
              <motion.div key="atpickup" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
                    At Pickup Location
                  </h3>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">Collect the item from the customer</p>
                </div>

                {job.specialInstructions && (
                  <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-4">
                    <p className="text-xs font-semibold text-[var(--color-text-light)] uppercase tracking-wider mb-1">Special Instructions</p>
                    <p className="text-sm text-[var(--color-text)]">{job.specialInstructions}</p>
                  </div>
                )}

                <button
                  onClick={() => setPhase("proof_pickup")}
                  className="w-full rounded-xl bg-[var(--color-forest)] py-3.5 text-sm font-semibold text-white hover:bg-[var(--color-forest)]/90 transition-colors cursor-pointer"
                >
                  Item Collected — Take Proof Photo
                </button>
              </motion.div>
            )}

            {/* PHASE: Proof Capture (Pickup) */}
            {phase === "proof_pickup" && (
              <motion.div key="proofpickup" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                <ProofCaptureUI
                  type="pickup"
                  photos={pickupPhotos}
                  onCapture={() => handleCaptureProof("pickup")}
                />
                {pickupPhotos.length > 0 && (
                  <button
                    onClick={() => setPhase("in_transit")}
                    className="w-full rounded-xl bg-[var(--color-forest)] py-3.5 text-sm font-semibold text-white hover:bg-[var(--color-forest)]/90 transition-colors cursor-pointer"
                  >
                    Confirm Pickup — Head to Drop-off
                  </button>
                )}
              </motion.div>
            )}

            {/* PHASE: In Transit */}
            {phase === "in_transit" && (
              <motion.div key="transit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="3" width="15" height="13" rx="2" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                      <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
                    In Transit to Drop-off
                  </h3>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">{job.dropoff}</p>
                </div>

                <button
                  onClick={() => setPhase("at_dropoff")}
                  className="w-full rounded-xl bg-[var(--color-forest)] py-3.5 text-sm font-semibold text-white hover:bg-[var(--color-forest)]/90 transition-colors cursor-pointer"
                >
                  I've Arrived at Drop-off
                </button>
              </motion.div>
            )}

            {/* PHASE: At Drop-off */}
            {phase === "at_dropoff" && (
              <motion.div key="atdropoff" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                <div className="rounded-2xl border border-purple-200 bg-purple-50 p-6 text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
                    At Drop-off Location
                  </h3>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">Deliver the item and take proof</p>
                </div>

                <button
                  onClick={() => setPhase("proof_dropoff")}
                  className="w-full rounded-xl bg-[var(--color-forest)] py-3.5 text-sm font-semibold text-white hover:bg-[var(--color-forest)]/90 transition-colors cursor-pointer"
                >
                  Item Delivered — Take Proof Photo
                </button>
              </motion.div>
            )}

            {/* PHASE: Proof Capture (Drop-off) */}
            {phase === "proof_dropoff" && (
              <motion.div key="proofdropoff" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                <ProofCaptureUI
                  type="dropoff"
                  photos={dropoffPhotos}
                  onCapture={() => handleCaptureProof("dropoff")}
                />
                {dropoffPhotos.length > 0 && (
                  <button
                    onClick={() => setPhase("complete")}
                    className="w-full rounded-xl bg-[var(--color-forest)] py-3.5 text-sm font-semibold text-white hover:bg-[var(--color-forest)]/90 transition-colors cursor-pointer"
                  >
                    Confirm Drop-off — Complete Job
                  </button>
                )}
              </motion.div>
            )}

            {/* PHASE: Complete */}
            {phase === "complete" && (
              <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500"
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </motion.div>
                  <h3 className="text-xl font-bold text-[var(--color-charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
                    Job Complete!
                  </h3>
                  <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                    Great work! Your payout of <span className="font-bold text-[var(--color-forest)]">{job.payout}</span> will be added to your earnings.
                  </p>
                </div>

                {/* Payout breakdown */}
                <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5">
                  <h4 className="text-sm font-semibold text-[var(--color-charcoal)] mb-3">Payout Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-muted)]">Base fee</span>
                      <span className="text-[var(--color-text)]">{job.baseFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-muted)]">Distance ({job.distance})</span>
                      <span className="text-[var(--color-text)]">{job.distanceFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-muted)]">Customer tip</span>
                      <span className="text-[var(--color-text)]">{job.tip}</span>
                    </div>
                    <div className="h-px bg-[var(--color-border-light)]" />
                    <div className="flex justify-between font-bold">
                      <span className="text-[var(--color-charcoal)]">Total payout</span>
                      <span className="text-[var(--color-forest)]">{job.payout}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <a
                    href="/runner"
                    className="flex-1 rounded-xl bg-[var(--color-forest)] py-3.5 text-center text-sm font-semibold text-white hover:bg-[var(--color-forest)]/90 transition-colors"
                  >
                    Find Next Job
                  </a>
                  <a
                    href="/runner/earnings"
                    className="flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-white px-6 py-3.5 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-cream)] transition-colors"
                  >
                    View Earnings
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Job info card */}
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-[var(--color-charcoal)]">Job Details</h3>
            <div className="space-y-3.5 text-sm">
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-green-400" />
                <div>
                  <span className="text-xs text-[var(--color-text-light)]">Pickup</span>
                  <p className="text-[var(--color-text)]">{job.pickup}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-red-400" />
                <div>
                  <span className="text-xs text-[var(--color-text-light)]">Drop-off</span>
                  <p className="text-[var(--color-text)]">{job.dropoff}</p>
                </div>
              </div>
              <div className="h-px bg-[var(--color-border-light)]" />
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Distance</span>
                <span className="font-medium text-[var(--color-text)]">{job.distance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Time slot</span>
                <span className="font-medium text-[var(--color-text)]">{job.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Package</span>
                <span className="font-medium text-[var(--color-text)]">{job.packageSize}</span>
              </div>
              {job.specialInstructions && (
                <>
                  <div className="h-px bg-[var(--color-border-light)]" />
                  <div>
                    <span className="text-xs text-[var(--color-text-light)]">Instructions</span>
                    <p className="mt-1 text-[var(--color-text)]">{job.specialInstructions}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Customer card */}
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-[var(--color-charcoal)]">Customer</h3>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-copper)]/10 text-sm font-bold text-[var(--color-copper)]">
                {job.customer.initials}
              </div>
              <div>
                <p className="font-semibold text-[var(--color-charcoal)]">{job.customer.name}</p>
                <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                  <span className="flex items-center gap-0.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--color-copper)" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    {job.customer.rating}
                  </span>
                  <span>·</span>
                  <span>Member since {job.customer.memberSince}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick chat */}
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white overflow-hidden">
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className="w-full flex items-center justify-between p-4 text-sm font-semibold text-[var(--color-charcoal)] hover:bg-[var(--color-cream)]/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                Chat with Customer
              </div>
              <motion.svg animate={{ rotate: chatOpen ? 180 : 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9" />
              </motion.svg>
            </button>

            <AnimatePresence>
              {chatOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden border-t border-[var(--color-border-light)]"
                >
                  <div className="max-h-48 overflow-y-auto p-3 space-y-2">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === "runner" ? "justify-end" : msg.sender === "system" ? "justify-center" : "justify-start"}`}>
                        {msg.sender === "system" ? (
                          <span className="rounded-full bg-[var(--color-cream)] px-3 py-1 text-[10px] text-[var(--color-text-light)]">{msg.text}</span>
                        ) : (
                          <div className={`max-w-[75%] rounded-xl px-3 py-2 text-xs ${
                            msg.sender === "runner"
                              ? "bg-[var(--color-charcoal)] text-white"
                              : "bg-[var(--color-cream)] text-[var(--color-text)]"
                          }`}>
                            <p>{msg.text}</p>
                            <p className={`mt-0.5 text-[9px] ${msg.sender === "runner" ? "text-white/50" : "text-[var(--color-text-light)]"}`}>{msg.time}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 border-t border-[var(--color-border-light)] p-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Message customer..."
                      className="flex-1 rounded-lg border border-[var(--color-border-light)] bg-[var(--color-cream)] px-3 py-2 text-xs outline-none focus:border-[var(--color-forest)] transition-colors"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-forest)] text-white hover:bg-[var(--color-forest)]/90 transition-colors cursor-pointer"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Payout card */}
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-[var(--color-charcoal)]">Payout</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Base fee</span>
                <span>{job.baseFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Distance</span>
                <span>{job.distanceFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Tip</span>
                <span>{job.tip}</span>
              </div>
              <div className="h-px bg-[var(--color-border-light)]" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-[var(--color-forest)]">{job.payout}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── ProofCaptureUI sub-component ──────────────────────── */

function ProofCaptureUI({
  type,
  photos,
  onCapture,
}: {
  type: "pickup" | "dropoff";
  photos: ProofPhoto[];
  onCapture: () => void;
}) {
  const label = type === "pickup" ? "Pickup" : "Drop-off";

  return (
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6">
      <h3 className="text-lg font-bold text-[var(--color-charcoal)] mb-1" style={{ fontFamily: "var(--font-display)" }}>
        Capture {label} Proof
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-5">
        Take a clear photo of the {type === "pickup" ? "item being collected" : "item being delivered"} as proof
      </p>

      {/* Camera mock */}
      <button
        onClick={onCapture}
        className="w-full aspect-[4/3] rounded-xl bg-[var(--color-charcoal)] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[var(--color-charcoal)]/90 transition-colors group"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/40 group-hover:border-white/60 transition-colors">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </div>
        <span className="text-sm text-white/70">Tap to take photo</span>
      </button>

      {/* Captured photos */}
      {photos.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-[var(--color-text-light)] mb-2">{photos.length} photo{photos.length !== 1 ? "s" : ""} captured</p>
          <div className="flex gap-2 flex-wrap">
            {photos.map((photo) => (
              <div key={photo.id} className={`relative h-16 w-16 rounded-lg ${photo.placeholder} flex items-center justify-center`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[8px] text-white font-bold">
                  ✓
                </span>
              </div>
            ))}
            <button
              onClick={onCapture}
              className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-[var(--color-border)] text-[var(--color-text-light)] hover:border-[var(--color-forest)] hover:text-[var(--color-forest)] transition-colors cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* GPS info */}
      <div className="mt-4 flex items-center gap-2 text-xs text-[var(--color-text-light)]">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
        GPS location will be tagged automatically
      </div>
    </div>
  );
}
