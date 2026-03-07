"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type JobStatus = "available" | "accepted" | "active";

interface MockJob {
  id: string;
  type: "returns" | "handoffs" | "collect";
  typeLabel: string;
  item: string;
  pickup: string;
  dropoff: string;
  distance: string;
  date: string;
  time: string;
  payout: string;
  status: JobStatus;
  urgency?: "express";
  postedAgo: string;
}

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

const mockJobs: MockJob[] = [
  {
    id: "JOB-20260307-010",
    type: "returns",
    typeLabel: "Returns & Drop-offs",
    item: "Amazon return parcel",
    pickup: "12 Grafton Street, Dublin 2",
    dropoff: "An Post, O'Connell St, Dublin 1",
    distance: "1.2 km",
    date: "Today",
    time: "14:00 – 16:00",
    payout: "€8.62",
    status: "active",
    postedAgo: "Active now",
  },
  {
    id: "JOB-20260307-011",
    type: "handoffs",
    typeLabel: "Pickup → Drop Handoffs",
    item: "Signed legal documents",
    pickup: "Law Library, Four Courts",
    dropoff: "Arthur Cox, Earlsfort Terrace",
    distance: "2.8 km",
    date: "Today",
    time: "16:00 – 18:00",
    payout: "€11.20",
    status: "available",
    urgency: "express",
    postedAgo: "2 min ago",
  },
  {
    id: "JOB-20260307-012",
    type: "collect",
    typeLabel: "Queue & Collect",
    item: "Prescription - Boots Pharmacy",
    pickup: "Boots, Grafton St, Dublin 2",
    dropoff: "88 Capel Street, Dublin 1",
    distance: "1.8 km",
    date: "Today",
    time: "16:00 – 18:00",
    payout: "€10.50",
    status: "available",
    postedAgo: "5 min ago",
  },
  {
    id: "JOB-20260307-013",
    type: "returns",
    typeLabel: "Returns & Drop-offs",
    item: "ASOS return (3 items)",
    pickup: "22 Baggot Street, Dublin 2",
    dropoff: "DPD Pickup, Rathmines Rd",
    distance: "2.1 km",
    date: "Tomorrow",
    time: "08:00 – 10:00",
    payout: "€7.80",
    status: "available",
    postedAgo: "12 min ago",
  },
  {
    id: "JOB-20260307-014",
    type: "handoffs",
    typeLabel: "Pickup → Drop Handoffs",
    item: "Apartment keys handoff",
    pickup: "45 Pearse Street, Dublin 2",
    dropoff: "12 Camden Street, Dublin 2",
    distance: "1.4 km",
    date: "Tomorrow",
    time: "10:00 – 12:00",
    payout: "€9.10",
    status: "available",
    postedAgo: "18 min ago",
  },
];

type ViewTab = "available" | "my_jobs";

export default function RunnerDashboardPage() {
  const [view, setView] = useState<ViewTab>("available");

  const available = mockJobs.filter((j) => j.status === "available");
  const myJobs = mockJobs.filter((j) => ["accepted", "active"].includes(j.status));

  const displayed = view === "available" ? available : myJobs;

  return (
    <div>
      {/* Header with stats */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[1.75rem] font-bold text-[var(--color-charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
            Jobs Board
          </h1>
          <p className="mt-1 text-[var(--color-text-muted)]">
            {available.length} job{available.length !== 1 ? "s" : ""} near you
          </p>
        </div>
        <div className="flex gap-3">
          {[
            { label: "Today", value: "€32.42", sub: "earned" },
            { label: "Active", value: myJobs.length.toString(), sub: "job" + (myJobs.length !== 1 ? "s" : "") },
            { label: "Rating", value: "4.9", sub: "★" },
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
        {([
          { key: "available" as ViewTab, label: "Available Jobs", count: available.length },
          { key: "my_jobs" as ViewTab, label: "My Jobs", count: myJobs.length },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
              view === tab.key
                ? "bg-[var(--color-charcoal)] text-white shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                view === tab.key ? "bg-white/20 text-white" : "bg-[var(--color-forest)]/10 text-[var(--color-forest)]"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Map placeholder + Jobs list */}
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

            {/* Job markers */}
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

            {/* Your location */}
            <div className="absolute" style={{ left: "45%", top: "45%" }}>
              <div className="flex flex-col items-center">
                <div className="h-4 w-4 rounded-full bg-blue-500 ring-4 ring-blue-500/20 shadow-lg" />
                <span className="mt-1 rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-medium text-[var(--color-text)] shadow-sm">You</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-2 text-xs text-[var(--color-text-muted)] shadow-sm">
            Dublin City Centre · 4 jobs nearby
          </div>
        </div>

        {/* Jobs list */}
        <div className="lg:col-span-3 space-y-3">
          {displayed.map((job, i) => (
            <motion.a
              key={job.id}
              href={`/runner/jobs/${job.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className={`block rounded-2xl border bg-white p-5 transition-all hover:shadow-md group ${
                job.status === "active"
                  ? "border-[var(--color-forest)] ring-1 ring-[var(--color-forest)]/20"
                  : "border-[var(--color-border-light)] hover:border-[var(--color-border)]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--color-cream)] text-[var(--color-text-muted)]">
                    {typeIcons[job.type]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-[var(--color-charcoal)]">{job.item}</h3>
                      {job.urgency === "express" && (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">EXPRESS</span>
                      )}
                      {job.status === "active" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-forest)]/[0.08] px-2 py-0.5 text-[10px] font-medium text-[var(--color-forest)]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-forest)] animate-pulse" />
                          Active
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-[var(--color-text-muted)] truncate">
                      {job.pickup} → {job.dropoff}
                    </p>
                    <div className="mt-2 flex items-center gap-3 flex-wrap text-xs text-[var(--color-text-light)]">
                      <span className="flex items-center gap-1">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        {job.distance}
                      </span>
                      <span>{job.date} · {job.time}</span>
                      <span className="text-[var(--color-text-light)]">{job.postedAgo}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-xl font-bold text-[var(--color-forest)]">{job.payout}</span>
                  {job.status === "available" && (
                    <span className="rounded-lg bg-[var(--color-forest)] px-3 py-1.5 text-xs font-semibold text-white group-hover:bg-[var(--color-forest)]/90 transition-colors">
                      View →
                    </span>
                  )}
                </div>
              </div>
            </motion.a>
          ))}

          {displayed.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-[var(--color-text-muted)]">
                {view === "available" ? "No available jobs right now. Check back soon!" : "No active jobs. Accept one from the available list!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
