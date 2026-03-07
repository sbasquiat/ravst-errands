"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type ErrandStatus = "finding_runner" | "runner_assigned" | "in_progress" | "completed" | "cancelled";

interface MockErrand {
  id: string;
  type: "returns" | "handoffs" | "collect";
  typeLabel: string;
  item: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  total: string;
  status: ErrandStatus;
  runner?: { name: string; initials: string; rating: number };
  createdAt: string;
}

const statusConfig: Record<ErrandStatus, { label: string; color: string; bg: string; dot: string }> = {
  finding_runner: { label: "Finding runner", color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-400 animate-pulse" },
  runner_assigned: { label: "Runner assigned", color: "text-blue-600", bg: "bg-blue-50", dot: "bg-blue-400" },
  in_progress: { label: "In progress", color: "text-[var(--color-copper)]", bg: "bg-[var(--color-copper)]/[0.08]", dot: "bg-[var(--color-copper)] animate-pulse" },
  completed: { label: "Completed", color: "text-green-600", bg: "bg-green-50", dot: "bg-green-500" },
  cancelled: { label: "Cancelled", color: "text-gray-500", bg: "bg-gray-50", dot: "bg-gray-400" },
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

const mockErrands: MockErrand[] = [
  {
    id: "ERR-20260307-001",
    type: "returns",
    typeLabel: "Returns & Drop-offs",
    item: "Amazon return parcel",
    pickup: "12 Grafton Street, Dublin 2",
    dropoff: "An Post, O'Connell St, Dublin 1",
    date: "Today",
    time: "14:00 – 16:00",
    total: "€10.78",
    status: "in_progress",
    runner: { name: "Cian Murphy", initials: "CM", rating: 4.9 },
    createdAt: "2h ago",
  },
  {
    id: "ERR-20260306-003",
    type: "handoffs",
    typeLabel: "Pickup → Drop Handoffs",
    item: "Apartment keys",
    pickup: "45 Pearse Street, Dublin 2",
    dropoff: "88 Capel Street, Dublin 1",
    date: "Today",
    time: "10:00 – 12:00",
    total: "€12.50",
    status: "finding_runner",
    createdAt: "4h ago",
  },
  {
    id: "ERR-20260305-002",
    type: "collect",
    typeLabel: "Queue & Collect",
    item: "Prescription pickup",
    pickup: "Boots Pharmacy, Grafton St",
    dropoff: "12 Grafton Street, Dublin 2",
    date: "Yesterday",
    time: "16:00 – 18:00",
    total: "€14.20",
    status: "completed",
    runner: { name: "Aoife Kelly", initials: "AK", rating: 5.0 },
    createdAt: "1d ago",
  },
  {
    id: "ERR-20260304-001",
    type: "returns",
    typeLabel: "Returns & Drop-offs",
    item: "ASOS return (2 items)",
    pickup: "12 Grafton Street, Dublin 2",
    dropoff: "DPD Pickup Point, Rathmines",
    date: "5 Mar",
    time: "08:00 – 10:00",
    total: "€9.64",
    status: "completed",
    runner: { name: "Sean O'Brien", initials: "SO", rating: 4.8 },
    createdAt: "2d ago",
  },
  {
    id: "ERR-20260302-005",
    type: "handoffs",
    typeLabel: "Pickup → Drop Handoffs",
    item: "Signed documents",
    pickup: "Law Library, Four Courts",
    dropoff: "Arthur Cox, Earlsfort Terr",
    date: "2 Mar",
    time: "12:00 – 14:00",
    total: "€11.30",
    status: "completed",
    runner: { name: "Cian Murphy", initials: "CM", rating: 4.9 },
    createdAt: "5d ago",
  },
  {
    id: "ERR-20260228-001",
    type: "collect",
    typeLabel: "Queue & Collect",
    item: "Click & collect - Penneys",
    pickup: "Penneys, Mary St, Dublin 1",
    dropoff: "12 Grafton Street, Dublin 2",
    date: "28 Feb",
    time: "14:00 – 16:00",
    total: "€13.10",
    status: "cancelled",
    createdAt: "1w ago",
  },
];

type FilterTab = "all" | "active" | "completed";

export default function DashboardPage() {
  const [filter, setFilter] = useState<FilterTab>("all");

  const filtered = mockErrands.filter((e) => {
    if (filter === "active") return !["completed", "cancelled"].includes(e.status);
    if (filter === "completed") return e.status === "completed";
    return true;
  });

  const activeCount = mockErrands.filter((e) => !["completed", "cancelled"].includes(e.status)).length;

  return (
    <div>
      {/* Page header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            className="text-[1.75rem] font-bold text-[var(--color-charcoal)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Your Errands
          </h1>
          <p className="mt-1 text-[var(--color-text-muted)]">
            {activeCount > 0 ? `${activeCount} active errand${activeCount > 1 ? "s" : ""}` : "No active errands"}
          </p>
        </div>

        {/* Quick stats */}
        <div className="flex gap-3">
          {[
            { label: "This month", value: "4", sub: "errands" },
            { label: "Spent", value: "€47.72", sub: "this month" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-[var(--color-border-light)] bg-white px-4 py-3">
              <p className="text-lg font-bold text-[var(--color-charcoal)]">{stat.value}</p>
              <p className="text-xs text-[var(--color-text-light)]">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-white p-1 shadow-sm border border-[var(--color-border-light)] w-fit">
        {(["all", "active", "completed"] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
              filter === tab
                ? "bg-[var(--color-charcoal)] text-white shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === "active" && activeCount > 0 && (
              <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-copper)] text-[10px] font-bold text-white">
                {activeCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Errands list */}
      <div className="space-y-3">
        {filtered.map((errand, i) => {
          const status = statusConfig[errand.status];
          return (
            <motion.a
              key={errand.id}
              href={`/dashboard/errands/${errand.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="block rounded-2xl border border-[var(--color-border-light)] bg-white p-5 transition-all hover:shadow-md hover:border-[var(--color-border)] group"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Left: type + item */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--color-cream)] text-[var(--color-text-muted)]">
                    {typeIcons[errand.type]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-[var(--color-charcoal)] truncate">
                        {errand.item}
                      </h3>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.bg} ${status.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-[var(--color-text-muted)] truncate">
                      {errand.pickup} → {errand.dropoff}
                    </p>
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-[var(--color-text-light)]">
                      <span>{errand.date} · {errand.time}</span>
                      {errand.runner && (
                        <span className="flex items-center gap-1">
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-copper)]/10 text-[8px] font-bold text-[var(--color-copper)]">
                            {errand.runner.initials}
                          </span>
                          {errand.runner.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: price + arrow */}
                <div className="flex items-center gap-4 sm:flex-shrink-0">
                  <div className="text-right">
                    <p className="text-lg font-bold text-[var(--color-charcoal)]">{errand.total}</p>
                    <p className="text-xs text-[var(--color-text-light)]">{errand.id}</p>
                  </div>
                  <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-cream)] text-[var(--color-text-light)] group-hover:bg-[var(--color-copper)]/10 group-hover:text-[var(--color-copper)] transition-all">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.a>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-cream)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <p className="text-[var(--color-text-muted)]">No errands found</p>
            <a href="/book" className="btn-primary mt-4 inline-flex">
              Book Your First Errand
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
