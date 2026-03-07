"use client";

import { use } from "react";
import { motion } from "framer-motion";
import LiveTrackingMap from "@/components/dashboard/LiveTrackingMap";
import ProofViewer from "@/components/dashboard/ProofViewer";
import ChatInterface from "@/components/dashboard/ChatInterface";

/* ── Mock data ─────────────────────────────────────────────── */

const mockErrand = {
  id: "ERR-20260307-001",
  type: "returns" as const,
  typeLabel: "Returns & Drop-offs",
  item: "Amazon return parcel",
  pickup: "12 Grafton Street, Dublin 2, D02 VF65",
  dropoff: "An Post, 14 O'Connell Street Lower, Dublin 1",
  date: "Friday, 7 March 2026",
  time: "14:00 – 16:00",
  total: "€10.78",
  status: "in_progress" as const,
  runner: { name: "Cian Murphy", initials: "CM", rating: 4.9, jobsCompleted: 142 },
  specialInstructions: "Parcel is in a white Amazon bag by the front door. Buzzer code: 4521",
  packageSize: "Medium (shoebox)",
  trackingNumber: "TBA934827164927",
};

const timeline = [
  { id: "t1", time: "13:42", label: "Errand booked", description: "Booking confirmed, searching for runners", icon: "book", done: true },
  { id: "t2", time: "13:45", label: "Runner assigned", description: "Cian Murphy accepted your errand", icon: "runner", done: true },
  { id: "t3", time: "14:02", label: "En route to pickup", description: "Runner heading to 12 Grafton Street", icon: "route", done: true },
  { id: "t4", time: "14:15", label: "At pickup", description: "Runner arrived, collecting your parcel", icon: "pickup", done: true },
  { id: "t5", time: "14:18", label: "Pickup confirmed", description: "Photo proof captured, parcel collected", icon: "proof", done: true },
  { id: "t6", time: "14:20", label: "In transit to drop-off", description: "Heading to An Post, O'Connell Street", icon: "transit", done: false, active: true },
  { id: "t7", time: "—", label: "At drop-off", description: "Runner arrives at destination", icon: "dropoff", done: false },
  { id: "t8", time: "—", label: "Errand complete", description: "Proof captured, job verified", icon: "complete", done: false },
];

const proofPhotos = [
  { id: "p1", type: "pickup" as const, label: "Pickup photo", timestamp: "14:15, 7 Mar 2026", gps: "53.3412°N, 6.2603°W", placeholder: "bg-emerald-400/80" },
  { id: "p2", type: "pickup" as const, label: "Parcel close-up", timestamp: "14:16, 7 Mar 2026", gps: "53.3412°N, 6.2603°W", placeholder: "bg-teal-400/80" },
];

const chatMessages = [
  { id: "m0", sender: "system" as const, text: "Cian Murphy assigned to your errand", time: "13:45" },
  { id: "m1", sender: "runner" as const, text: "Hi! I'm heading to pick up your parcel now. Should be there in about 15 minutes.", time: "13:48" },
  { id: "m2", sender: "customer" as const, text: "Great, thanks! The buzzer code is 4521, ground floor.", time: "13:50" },
  { id: "m3", sender: "runner" as const, text: "Perfect, I'm at the door now. I can see the Amazon bag!", time: "14:14" },
  { id: "m4", sender: "customer" as const, text: "That's the one! Cheers", time: "14:15" },
  { id: "m5", sender: "runner" as const, text: "Got it! Heading to An Post now. Should be about 10 minutes.", time: "14:18" },
];

/* ── Component ─────────────────────────────────────────────── */

const statusConfig = {
  finding_runner: { label: "Finding runner", color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-400 animate-pulse" },
  runner_assigned: { label: "Runner assigned", color: "text-blue-600", bg: "bg-blue-50", dot: "bg-blue-400" },
  in_progress: { label: "In progress", color: "text-[var(--color-copper)]", bg: "bg-[var(--color-copper)]/[0.08]", dot: "bg-[var(--color-copper)] animate-pulse" },
  completed: { label: "Completed", color: "text-green-600", bg: "bg-green-50", dot: "bg-green-500" },
  cancelled: { label: "Cancelled", color: "text-gray-500", bg: "bg-gray-50", dot: "bg-gray-400" },
};

export default function ErrandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const errand = mockErrand; // In production: fetch by id
  const status = statusConfig[errand.status];

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
                {errand.item}
              </h1>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.bg} ${status.color}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {errand.typeLabel} · {errand.id}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-[var(--color-charcoal)]">{errand.total}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — map + activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live tracking map */}
          {errand.runner && ["runner_assigned", "in_progress"].includes(errand.status) && (
            <LiveTrackingMap
              runnerName={errand.runner.name}
              runnerInitials={errand.runner.initials}
              pickup={errand.pickup}
              dropoff={errand.dropoff}
            />
          )}

          {/* Activity timeline */}
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-[var(--color-charcoal)]">Activity</h3>
            <div className="space-y-0">
              {timeline.map((step, i) => (
                <div key={step.id} className="flex gap-4">
                  {/* Timeline line + dot */}
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
                    {i < timeline.length - 1 && (
                      <div className={`w-px flex-1 min-h-[2rem] ${step.done ? "bg-green-200" : "bg-[var(--color-border-light)]"}`} />
                    )}
                  </div>

                  {/* Content */}
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
          </div>

          {/* Proof photos */}
          <ProofViewer photos={proofPhotos} />
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
                  <p className="text-[var(--color-text)]">{errand.pickup}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-red-400" />
                <div>
                  <span className="text-xs text-[var(--color-text-light)]">Drop-off</span>
                  <p className="text-[var(--color-text)]">{errand.dropoff}</p>
                </div>
              </div>

              <div className="h-px bg-[var(--color-border-light)]" />

              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Date</span>
                <span className="font-medium text-[var(--color-text)]">{errand.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Time slot</span>
                <span className="font-medium text-[var(--color-text)]">{errand.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Package size</span>
                <span className="font-medium text-[var(--color-text)]">{errand.packageSize}</span>
              </div>
              {errand.trackingNumber && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Tracking #</span>
                  <span className="font-mono text-xs font-medium text-[var(--color-text)]">{errand.trackingNumber}</span>
                </div>
              )}

              {errand.specialInstructions && (
                <>
                  <div className="h-px bg-[var(--color-border-light)]" />
                  <div>
                    <span className="text-xs text-[var(--color-text-light)]">Special instructions</span>
                    <p className="mt-1 text-[var(--color-text)]">{errand.specialInstructions}</p>
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
                  {errand.runner.initials}
                </div>
                <div>
                  <p className="font-semibold text-[var(--color-charcoal)]">{errand.runner.name}</p>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                    <span className="flex items-center gap-0.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--color-copper)" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      {errand.runner.rating}
                    </span>
                    <span>·</span>
                    <span>{errand.runner.jobsCompleted} jobs</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat */}
          {errand.runner && (
            <ChatInterface
              runnerName={errand.runner.name}
              runnerInitials={errand.runner.initials}
              messages={chatMessages}
            />
          )}

          {/* Actions */}
          <div className="space-y-2">
            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-cream)] transition-colors cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
              </svg>
              Get Receipt
            </button>
            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              Report Issue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
