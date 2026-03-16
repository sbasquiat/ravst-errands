"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useRealtimeCustomerErrands } from "@/lib/supabase/realtime";

type ErrandStatus = "pending" | "finding_runner" | "runner_assigned" | "in_progress" | "completed" | "cancelled" | "disputed";

interface ErrandData {
  id: string;
  display_id: string;
  type: string;
  item_description: string;
  pickup_address: string;
  dropoff_address: string;
  scheduled_date: string;
  time_slot_start: string;
  time_slot_end: string;
  total_price: number;
  status: ErrandStatus;
  created_at: string;
  runner: {
    id: string;
    profile: {
      full_name: string;
      avatar_url: string | null;
      phone: string | null;
    };
  } | null;
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

type FilterTab = "all" | "active" | "completed";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-IE", { day: "numeric", month: "short" });
}

function formatTime(start: string, end: string) {
  return `${start.slice(0, 5)} – ${end.slice(0, 5)}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ErrandsList({ errands: initialErrands, customerId }: { errands: ErrandData[]; customerId?: string }) {
  const [errands, setErrands] = useState(initialErrands);
  const [filter, setFilter] = useState<FilterTab>("all");

  // Real-time errand updates
  const handleErrandChange = useCallback(
    (payload: Record<string, unknown>, eventType: string) => {
      if (eventType === "INSERT") {
        setErrands((prev) => {
          if (prev.some((e) => e.id === payload.id)) return prev;
          // New errand appears — we only have raw columns, not the joined runner
          const newErrand: ErrandData = {
            id: payload.id as string,
            display_id: payload.display_id as string,
            type: payload.type as string,
            item_description: payload.item_description as string,
            pickup_address: payload.pickup_address as string,
            dropoff_address: payload.dropoff_address as string,
            scheduled_date: payload.scheduled_date as string,
            time_slot_start: payload.time_slot_start as string,
            time_slot_end: payload.time_slot_end as string,
            total_price: payload.total_price as number,
            status: payload.status as ErrandStatus,
            created_at: payload.created_at as string,
            runner: null,
          };
          return [newErrand, ...prev];
        });
      } else if (eventType === "UPDATE") {
        setErrands((prev) =>
          prev.map((e) =>
            e.id === payload.id
              ? { ...e, status: (payload.status as ErrandStatus) ?? e.status }
              : e
          )
        );
      }
    },
    []
  );

  useRealtimeCustomerErrands(customerId, handleErrandChange);

  const filtered = errands.filter((e) => {
    if (filter === "active") return !["completed", "cancelled", "disputed"].includes(e.status);
    if (filter === "completed") return ["completed", "cancelled", "disputed"].includes(e.status);
    return true;
  });

  const activeCount = errands.filter((e) => !["completed", "cancelled", "disputed"].includes(e.status)).length;

  // Quick stats
  const now = new Date();
  const thisMonth = errands.filter((e) => {
    const d = new Date(e.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const spent = thisMonth
    .filter((e) => e.status === "completed")
    .reduce((sum, e) => sum + e.total_price, 0);

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
            { label: "This month", value: String(thisMonth.length), sub: "errands" },
            { label: "Spent", value: `€${spent.toFixed(2)}`, sub: "this month" },
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
          const status = statusConfig[errand.status] ?? statusConfig.pending;
          const runnerName = errand.runner?.profile?.full_name;
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
                    {typeIcons[errand.type] ?? typeIcons.returns}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-[var(--color-charcoal)] truncate">
                        {errand.item_description}
                      </h3>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.bg} ${status.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-[var(--color-text-muted)] truncate">
                      {errand.pickup_address} → {errand.dropoff_address}
                    </p>
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-[var(--color-text-light)]">
                      <span>{formatDate(errand.scheduled_date)} · {formatTime(errand.time_slot_start, errand.time_slot_end)}</span>
                      {runnerName && (
                        <span className="flex items-center gap-1">
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-copper)]/10 text-[8px] font-bold text-[var(--color-copper)]">
                            {getInitials(runnerName)}
                          </span>
                          {runnerName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: price + arrow */}
                <div className="flex items-center gap-4 sm:flex-shrink-0">
                  <div className="text-right">
                    <p className="text-lg font-bold text-[var(--color-charcoal)]">€{errand.total_price.toFixed(2)}</p>
                    <p className="text-xs text-[var(--color-text-light)]">{errand.display_id}</p>
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
