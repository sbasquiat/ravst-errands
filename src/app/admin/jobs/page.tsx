"use client";

import { useState } from "react";
import { motion } from "framer-motion";

/* ── Types ─────────────────────────────────────────────── */

type StatusFilter = "all" | "active" | "completed" | "disputed" | "cancelled";
type TypeFilter = "all" | "returns" | "handoffs" | "collect";

interface AdminJob {
  id: string;
  item: string;
  type: "returns" | "handoffs" | "collect";
  typeLabel: string;
  customer: { name: string; avatar: string };
  runner: { name: string; avatar: string } | null;
  status: "active" | "completed" | "disputed" | "cancelled" | "pending";
  amount: string;
  date: string;
  time: string;
  pickup: string;
  dropoff: string;
}

/* ── Mock data ─────────────────────────────────────────── */

const mockJobs: AdminJob[] = [
  { id: "JOB-010", item: "Amazon return parcel", type: "returns", typeLabel: "Returns", customer: { name: "Sarah M.", avatar: "SM" }, runner: { name: "Cian O'Brien", avatar: "CO" }, status: "active", amount: "€8.62", date: "Today", time: "14:15", pickup: "12 Grafton St", dropoff: "An Post, O'Connell St" },
  { id: "JOB-009", item: "Signed legal documents", type: "handoffs", typeLabel: "Handoffs", customer: { name: "James K.", avatar: "JK" }, runner: { name: "Aoife Murphy", avatar: "AM" }, status: "active", amount: "€11.20", date: "Today", time: "12:40", pickup: "Law Library, Four Courts", dropoff: "Arthur Cox, Earlsfort Tce" },
  { id: "JOB-008", item: "Prescription collection", type: "collect", typeLabel: "Queue & Collect", customer: { name: "Emily R.", avatar: "ER" }, runner: { name: "Liam Walsh", avatar: "LW" }, status: "completed", amount: "€10.50", date: "Today", time: "10:30", pickup: "Boots, Grafton St", dropoff: "88 Capel Street" },
  { id: "JOB-007", item: "ASOS return (3 items)", type: "returns", typeLabel: "Returns", customer: { name: "David L.", avatar: "DL" }, runner: { name: "Niamh Kelly", avatar: "NK" }, status: "completed", amount: "€7.80", date: "Today", time: "08:45", pickup: "22 Baggot Street", dropoff: "DPD Pickup, Rathmines" },
  { id: "JOB-006", item: "Keys handoff", type: "handoffs", typeLabel: "Handoffs", customer: { name: "Fiona B.", avatar: "FB" }, runner: { name: "Sean Byrne", avatar: "SB" }, status: "completed", amount: "€9.10", date: "Yesterday", time: "16:20", pickup: "45 Pearse Street", dropoff: "12 Camden Street" },
  { id: "JOB-005", item: "Zara return", type: "returns", typeLabel: "Returns", customer: { name: "Mark T.", avatar: "MT" }, runner: { name: "Cian O'Brien", avatar: "CO" }, status: "disputed", amount: "€7.20", date: "Yesterday", time: "14:00", pickup: "34 Nassau Street", dropoff: "Zara, Grafton St" },
  { id: "JOB-004", item: "Passport collection", type: "collect", typeLabel: "Queue & Collect", customer: { name: "Lisa H.", avatar: "LH" }, runner: { name: "Aoife Murphy", avatar: "AM" }, status: "completed", amount: "€15.40", date: "Yesterday", time: "11:15", pickup: "Passport Office, Molesworth St", dropoff: "78 Ranelagh Road" },
  { id: "JOB-003", item: "DPD parcel drop", type: "returns", typeLabel: "Returns", customer: { name: "Tom W.", avatar: "TW" }, runner: { name: "Liam Walsh", avatar: "LW" }, status: "completed", amount: "€6.90", date: "6 Mar", time: "15:30", pickup: "56 Drumcondra Rd", dropoff: "DPD Pickup, Phibsborough" },
  { id: "JOB-002", item: "Book return to library", type: "returns", typeLabel: "Returns", customer: { name: "Anna C.", avatar: "AC" }, runner: null, status: "pending", amount: "€5.80", date: "6 Mar", time: "10:00", pickup: "92 Clontarf Road", dropoff: "Raheny Library" },
  { id: "JOB-001", item: "Gym key handoff", type: "handoffs", typeLabel: "Handoffs", customer: { name: "Paul D.", avatar: "PD" }, runner: { name: "Sean Byrne", avatar: "SB" }, status: "cancelled", amount: "€8.00", date: "5 Mar", time: "09:00", pickup: "FlyeFit, Macken St", dropoff: "18 Hanover Quay" },
];

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  active: { label: "Active", color: "text-blue-700", bg: "bg-blue-50", dot: "bg-blue-500 animate-pulse" },
  completed: { label: "Completed", color: "text-green-700", bg: "bg-green-50", dot: "bg-green-500" },
  disputed: { label: "Disputed", color: "text-red-700", bg: "bg-red-50", dot: "bg-red-500" },
  cancelled: { label: "Cancelled", color: "text-gray-500", bg: "bg-gray-100", dot: "bg-gray-400" },
  pending: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500" },
};

/* ── Component ─────────────────────────────────────────── */

export default function AdminJobsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = mockJobs.filter((job) => {
    if (statusFilter !== "all" && job.status !== statusFilter) return false;
    if (typeFilter !== "all" && job.type !== typeFilter) return false;
    if (search && !job.item.toLowerCase().includes(search.toLowerCase()) && !job.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: mockJobs.length,
    active: mockJobs.filter((j) => j.status === "active").length,
    completed: mockJobs.filter((j) => j.status === "completed").length,
    disputed: mockJobs.filter((j) => j.status === "disputed").length,
    cancelled: mockJobs.filter((j) => j.status === "cancelled").length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[1.75rem] font-bold text-[var(--color-charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
            Jobs
          </h1>
          <p className="mt-1 text-[var(--color-text-muted)]">{mockJobs.length} total jobs</p>
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-light)]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            type="text"
            placeholder="Search jobs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-[var(--color-border-light)] bg-white pl-9 pr-4 py-2.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 transition-all"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        {/* Status filter */}
        <div className="flex gap-1 rounded-xl bg-white p-1 shadow-sm border border-[var(--color-border-light)] w-fit">
          {([
            { key: "all" as StatusFilter, label: "All" },
            { key: "active" as StatusFilter, label: "Active" },
            { key: "completed" as StatusFilter, label: "Done" },
            { key: "disputed" as StatusFilter, label: "Disputed" },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                statusFilter === tab.key
                  ? "bg-[var(--color-charcoal)] text-white shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {tab.label}
              <span className={`ml-1 ${statusFilter === tab.key ? "text-white/60" : "text-[var(--color-text-light)]"}`}>
                {counts[tab.key === "completed" ? "completed" : tab.key] ?? ""}
              </span>
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div className="flex gap-1 rounded-xl bg-white p-1 shadow-sm border border-[var(--color-border-light)] w-fit">
          {([
            { key: "all" as TypeFilter, label: "All Types" },
            { key: "returns" as TypeFilter, label: "Returns" },
            { key: "handoffs" as TypeFilter, label: "Handoffs" },
            { key: "collect" as TypeFilter, label: "Collect" },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setTypeFilter(tab.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                typeFilter === tab.key
                  ? "bg-[var(--color-charcoal)] text-white shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs table */}
      <div className="rounded-2xl border border-[var(--color-border-light)] bg-white overflow-hidden">
        {/* Table header */}
        <div className="hidden lg:grid grid-cols-12 gap-2 px-5 py-3 text-[11px] font-medium text-[var(--color-text-light)] uppercase tracking-wider border-b border-[var(--color-border-light)] bg-[#fafaf8]">
          <div className="col-span-1">ID</div>
          <div className="col-span-3">Item</div>
          <div className="col-span-2">Customer</div>
          <div className="col-span-2">Runner</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1">Amount</div>
          <div className="col-span-2">Route</div>
        </div>

        <div className="divide-y divide-[var(--color-border-light)]">
          {filtered.map((job, i) => {
            const config = statusConfig[job.status];
            return (
              <motion.a
                key={job.id}
                href={`/admin/jobs/${job.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="block lg:grid grid-cols-12 gap-2 px-5 py-4 hover:bg-[var(--color-cream)]/50 transition-colors group"
              >
                <div className="col-span-1 text-xs text-[var(--color-text-light)] font-mono">{job.id}</div>
                <div className="col-span-3">
                  <p className="text-sm font-medium text-[var(--color-charcoal)] group-hover:text-red-600 transition-colors">{job.item}</p>
                  <p className="text-xs text-[var(--color-text-light)]">{job.typeLabel} · {job.date} {job.time}</p>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-copper)]/10 text-[10px] font-semibold text-[var(--color-copper)]">
                    {job.customer.avatar}
                  </div>
                  <span className="text-sm text-[var(--color-text-muted)]">{job.customer.name}</span>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  {job.runner ? (
                    <>
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-forest)]/10 text-[10px] font-semibold text-[var(--color-forest)]">
                        {job.runner.avatar}
                      </div>
                      <span className="text-sm text-[var(--color-text-muted)]">{job.runner.name}</span>
                    </>
                  ) : (
                    <span className="text-xs text-amber-600 font-medium">Unassigned</span>
                  )}
                </div>
                <div className="col-span-1">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${config.bg} ${config.color}`}>
                    <span className={`h-1 w-1 rounded-full ${config.dot}`} />
                    {config.label}
                  </span>
                </div>
                <div className="col-span-1 text-sm font-semibold text-[var(--color-charcoal)]">{job.amount}</div>
                <div className="col-span-2 text-xs text-[var(--color-text-light)] truncate">
                  {job.pickup} → {job.dropoff}
                </div>
              </motion.a>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-16 text-center text-sm text-[var(--color-text-muted)]">
              No jobs found matching your filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
