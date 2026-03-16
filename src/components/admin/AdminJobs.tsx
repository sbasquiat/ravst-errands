"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Errand, Profile } from "@/types/database";

type ErrandWithRelations = Errand & {
  customer: Pick<Profile, "id" | "full_name" | "email" | "avatar_url"> | null;
  runner: { id: string; profile: Pick<Profile, "full_name" | "avatar_url">; rating: number } | null;
};

type StatusFilter = "all" | "active" | "completed" | "disputed" | "cancelled";
type TypeFilter = "all" | "returns" | "handoffs" | "collect";

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500" },
  finding_runner: { label: "Finding", color: "text-blue-700", bg: "bg-blue-50", dot: "bg-blue-500 animate-pulse" },
  runner_assigned: { label: "Assigned", color: "text-blue-700", bg: "bg-blue-50", dot: "bg-blue-500" },
  in_progress: { label: "Active", color: "text-blue-700", bg: "bg-blue-50", dot: "bg-blue-500 animate-pulse" },
  completed: { label: "Completed", color: "text-green-700", bg: "bg-green-50", dot: "bg-green-500" },
  cancelled: { label: "Cancelled", color: "text-gray-500", bg: "bg-gray-100", dot: "bg-gray-400" },
  disputed: { label: "Disputed", color: "text-red-700", bg: "bg-red-50", dot: "bg-red-500" },
};

const typeLabels: Record<string, string> = {
  returns: "Returns",
  handoffs: "Handoffs",
  collect: "Queue & Collect",
};

function isActiveStatus(status: string) {
  return ["pending", "finding_runner", "runner_assigned", "in_progress"].includes(status);
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IE", { day: "numeric", month: "short" });
}

interface AdminJobsProps {
  errands: ErrandWithRelations[];
}

export default function AdminJobs({ errands }: AdminJobsProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = errands.filter((e) => {
    if (statusFilter === "active" && !isActiveStatus(e.status)) return false;
    if (statusFilter === "completed" && e.status !== "completed") return false;
    if (statusFilter === "disputed" && e.status !== "disputed") return false;
    if (statusFilter === "cancelled" && e.status !== "cancelled") return false;
    if (typeFilter !== "all" && e.type !== typeFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (
        !e.item_description.toLowerCase().includes(s) &&
        !(e.display_id ?? "").toLowerCase().includes(s) &&
        !(e.customer?.full_name ?? "").toLowerCase().includes(s)
      ) return false;
    }
    return true;
  });

  const counts = {
    all: errands.length,
    active: errands.filter((e) => isActiveStatus(e.status)).length,
    completed: errands.filter((e) => e.status === "completed").length,
    disputed: errands.filter((e) => e.status === "disputed").length,
    cancelled: errands.filter((e) => e.status === "cancelled").length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[1.75rem] font-bold text-[var(--color-charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
            Jobs
          </h1>
          <p className="mt-1 text-[var(--color-text-muted)]">{errands.length} total jobs</p>
        </div>

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
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

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
          {filtered.map((errand, i) => {
            const config = statusConfig[errand.status] ?? statusConfig.pending;
            const customerName = errand.customer?.full_name ?? "—";
            const runnerName = errand.runner?.profile?.full_name ?? null;
            return (
              <motion.a
                key={errand.id}
                href={`/admin/jobs/${errand.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="block lg:grid grid-cols-12 gap-2 px-5 py-4 hover:bg-[var(--color-cream)]/50 transition-colors group"
              >
                <div className="col-span-1 text-xs text-[var(--color-text-light)] font-mono">{errand.display_id?.slice(-7) ?? errand.id.slice(0, 8)}</div>
                <div className="col-span-3">
                  <p className="text-sm font-medium text-[var(--color-charcoal)] group-hover:text-red-600 transition-colors">{errand.item_description}</p>
                  <p className="text-xs text-[var(--color-text-light)]">{typeLabels[errand.type] ?? errand.type} · {formatDate(errand.created_at)} {errand.time_slot_start?.slice(0, 5)}</p>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-copper)]/10 text-[10px] font-semibold text-[var(--color-copper)]">
                    {getInitials(customerName)}
                  </div>
                  <span className="text-sm text-[var(--color-text-muted)]">{customerName}</span>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  {runnerName ? (
                    <>
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-forest)]/10 text-[10px] font-semibold text-[var(--color-forest)]">
                        {getInitials(runnerName)}
                      </div>
                      <span className="text-sm text-[var(--color-text-muted)]">{runnerName}</span>
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
                <div className="col-span-1 text-sm font-semibold text-[var(--color-charcoal)]">€{errand.total_price.toFixed(2)}</div>
                <div className="col-span-2 text-xs text-[var(--color-text-light)] truncate">
                  {errand.pickup_address} → {errand.dropoff_address}
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
