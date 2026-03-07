"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Types ─────────────────────────────────────────────── */

type PayoutStatus = "pending" | "processing" | "completed" | "failed";
type FilterStatus = "all" | PayoutStatus;

interface Payout {
  id: string;
  runner: { name: string; avatar: string; bank: string; accountEnding: string };
  amount: string;
  jobCount: number;
  period: string;
  status: PayoutStatus;
  scheduledDate: string;
  processedDate?: string;
}

/* ── Mock data ─────────────────────────────────────────── */

const payouts: Payout[] = [
  { id: "PAY-012", runner: { name: "Cian O'Brien", avatar: "CO", bank: "Bank of Ireland", accountEnding: "4827" }, amount: "€187.60", jobCount: 22, period: "3-7 Mar", status: "pending", scheduledDate: "Mon 10 Mar" },
  { id: "PAY-011", runner: { name: "Aoife Murphy", avatar: "AM", bank: "AIB", accountEnding: "3391" }, amount: "€156.40", jobCount: 18, period: "3-7 Mar", status: "pending", scheduledDate: "Mon 10 Mar" },
  { id: "PAY-010", runner: { name: "Liam Walsh", avatar: "LW", bank: "Revolut", accountEnding: "7812" }, amount: "€142.80", jobCount: 16, period: "3-7 Mar", status: "pending", scheduledDate: "Mon 10 Mar" },
  { id: "PAY-009", runner: { name: "Sean Byrne", avatar: "SB", bank: "Bank of Ireland", accountEnding: "5543" }, amount: "€98.50", jobCount: 11, period: "3-7 Mar", status: "pending", scheduledDate: "Mon 10 Mar" },
  { id: "PAY-008", runner: { name: "Niamh Kelly", avatar: "NK", bank: "AIB", accountEnding: "6290" }, amount: "€72.30", jobCount: 8, period: "3-7 Mar", status: "pending", scheduledDate: "Mon 10 Mar" },
  { id: "PAY-007", runner: { name: "Cian O'Brien", avatar: "CO", bank: "Bank of Ireland", accountEnding: "4827" }, amount: "€210.30", jobCount: 25, period: "24-28 Feb", status: "processing", scheduledDate: "Mon 3 Mar" },
  { id: "PAY-006", runner: { name: "Aoife Murphy", avatar: "AM", bank: "AIB", accountEnding: "3391" }, amount: "€178.90", jobCount: 21, period: "24-28 Feb", status: "processing", scheduledDate: "Mon 3 Mar" },
  { id: "PAY-005", runner: { name: "Liam Walsh", avatar: "LW", bank: "Revolut", accountEnding: "7812" }, amount: "€195.80", jobCount: 23, period: "17-21 Feb", status: "completed", scheduledDate: "Mon 24 Feb", processedDate: "24 Feb" },
  { id: "PAY-004", runner: { name: "Cian O'Brien", avatar: "CO", bank: "Bank of Ireland", accountEnding: "4827" }, amount: "€178.45", jobCount: 20, period: "17-21 Feb", status: "completed", scheduledDate: "Mon 24 Feb", processedDate: "24 Feb" },
  { id: "PAY-003", runner: { name: "Sean Byrne", avatar: "SB", bank: "Bank of Ireland", accountEnding: "5543" }, amount: "€134.20", jobCount: 15, period: "17-21 Feb", status: "completed", scheduledDate: "Mon 24 Feb", processedDate: "24 Feb" },
  { id: "PAY-002", runner: { name: "Niamh Kelly", avatar: "NK", bank: "AIB", accountEnding: "6290" }, amount: "€89.60", jobCount: 10, period: "17-21 Feb", status: "completed", scheduledDate: "Mon 24 Feb", processedDate: "24 Feb" },
  { id: "PAY-001", runner: { name: "Roisin Brennan", avatar: "RB", bank: "BOI", accountEnding: "1122" }, amount: "€45.20", jobCount: 5, period: "10-14 Feb", status: "failed", scheduledDate: "Mon 17 Feb" },
];

const statusConfig: Record<PayoutStatus, { label: string; color: string; bg: string; dot: string }> = {
  pending: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500" },
  processing: { label: "Processing", color: "text-blue-700", bg: "bg-blue-50", dot: "bg-blue-500 animate-pulse" },
  completed: { label: "Completed", color: "text-green-700", bg: "bg-green-50", dot: "bg-green-500" },
  failed: { label: "Failed", color: "text-red-700", bg: "bg-red-50", dot: "bg-red-500" },
};

/* ── Component ─────────────────────────────────────────── */

export default function AdminPayoutsPage() {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [actionDone, setActionDone] = useState<string | null>(null);

  const filtered = filter === "all" ? payouts : payouts.filter((p) => p.status === filter);

  const pendingTotal = payouts
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + parseFloat(p.amount.replace("€", "").replace(",", "")), 0);

  const processingTotal = payouts
    .filter((p) => p.status === "processing")
    .reduce((sum, p) => sum + parseFloat(p.amount.replace("€", "").replace(",", "")), 0);

  const completedTotal = payouts
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + parseFloat(p.amount.replace("€", "").replace(",", "")), 0);

  const counts = {
    all: payouts.length,
    pending: payouts.filter((p) => p.status === "pending").length,
    processing: payouts.filter((p) => p.status === "processing").length,
    completed: payouts.filter((p) => p.status === "completed").length,
    failed: payouts.filter((p) => p.status === "failed").length,
  };

  const handleAction = (label: string) => {
    setActionDone(label);
    setTimeout(() => setActionDone(null), 2500);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[1.75rem] font-bold text-[var(--color-charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
            Payouts
          </h1>
          <p className="mt-1 text-[var(--color-text-muted)]">
            {counts.pending} pending · {counts.processing} processing
          </p>
        </div>

        <button
          onClick={() => handleAction("Batch payout triggered for all pending payouts")}
          className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors shadow-sm cursor-pointer w-fit"
        >
          Trigger Batch Payout
        </button>
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

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Pending", value: `€${pendingTotal.toFixed(2)}`, color: "text-amber-600", accent: "border-amber-200 bg-amber-50/50", sub: `${counts.pending} payouts` },
          { label: "Processing", value: `€${processingTotal.toFixed(2)}`, color: "text-blue-600", accent: "border-blue-200 bg-blue-50/50", sub: `${counts.processing} payouts` },
          { label: "Completed", value: `€${completedTotal.toFixed(2)}`, color: "text-green-600", accent: "border-green-200 bg-green-50/50", sub: `${counts.completed} payouts` },
          { label: "Failed", value: counts.failed.toString(), color: "text-red-600", accent: "border-red-200 bg-red-50/50", sub: "Needs attention" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-2xl border p-4 ${stat.accent}`}>
            <p className="text-xs text-[var(--color-text-light)] mb-1">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-[var(--color-text-light)] mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-1 rounded-xl bg-white p-1 shadow-sm border border-[var(--color-border-light)] w-fit">
        {([
          { key: "all" as FilterStatus, label: "All" },
          { key: "pending" as FilterStatus, label: "Pending" },
          { key: "processing" as FilterStatus, label: "Processing" },
          { key: "completed" as FilterStatus, label: "Completed" },
          { key: "failed" as FilterStatus, label: "Failed" },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              filter === tab.key
                ? "bg-[var(--color-charcoal)] text-white shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {tab.label}
            <span className={`ml-1 ${filter === tab.key ? "text-white/60" : "text-[var(--color-text-light)]"}`}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Payouts table */}
      <div className="rounded-2xl border border-[var(--color-border-light)] bg-white overflow-hidden">
        {/* Header */}
        <div className="hidden lg:grid grid-cols-12 gap-2 px-5 py-3 text-[11px] font-medium text-[var(--color-text-light)] uppercase tracking-wider border-b border-[var(--color-border-light)] bg-[#fafaf8]">
          <div className="col-span-1">ID</div>
          <div className="col-span-3">Runner</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-1">Jobs</div>
          <div className="col-span-2">Period</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2">Action</div>
        </div>

        <div className="divide-y divide-[var(--color-border-light)]">
          {filtered.map((payout, i) => {
            const config = statusConfig[payout.status];
            return (
              <motion.div
                key={payout.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="lg:grid grid-cols-12 gap-2 px-5 py-4 hover:bg-[var(--color-cream)]/50 transition-colors"
              >
                <div className="col-span-1 text-xs text-[var(--color-text-light)] font-mono">{payout.id}</div>
                <div className="col-span-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-forest)]/10 text-[10px] font-semibold text-[var(--color-forest)]">
                    {payout.runner.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-charcoal)] truncate">{payout.runner.name}</p>
                    <p className="text-[10px] text-[var(--color-text-light)]">{payout.runner.bank} ····{payout.runner.accountEnding}</p>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-sm font-bold text-[var(--color-charcoal)]">{payout.amount}</span>
                </div>
                <div className="col-span-1">
                  <span className="text-sm text-[var(--color-text-muted)]">{payout.jobCount}</span>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-[var(--color-text-muted)]">{payout.period}</p>
                  <p className="text-[10px] text-[var(--color-text-light)]">
                    {payout.processedDate ? `Paid ${payout.processedDate}` : `Scheduled ${payout.scheduledDate}`}
                  </p>
                </div>
                <div className="col-span-1">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${config.bg} ${config.color}`}>
                    <span className={`h-1 w-1 rounded-full ${config.dot}`} />
                    {config.label}
                  </span>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  {payout.status === "pending" && (
                    <button
                      onClick={() => handleAction(`${payout.id}: Payout to ${payout.runner.name} triggered`)}
                      className="rounded-md bg-[var(--color-forest)] px-2.5 py-1 text-[10px] font-medium text-white hover:bg-[var(--color-forest)]/90 transition-colors cursor-pointer"
                    >
                      Pay Now
                    </button>
                  )}
                  {payout.status === "failed" && (
                    <button
                      onClick={() => handleAction(`${payout.id}: Retry payout to ${payout.runner.name}`)}
                      className="rounded-md bg-red-600 px-2.5 py-1 text-[10px] font-medium text-white hover:bg-red-700 transition-colors cursor-pointer"
                    >
                      Retry
                    </button>
                  )}
                  {payout.status === "completed" && (
                    <span className="text-[10px] text-green-600 font-medium">✓ Done</span>
                  )}
                  {payout.status === "processing" && (
                    <span className="text-[10px] text-blue-600 font-medium">In progress…</span>
                  )}
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-16 text-center text-sm text-[var(--color-text-muted)]">
              No payouts matching this filter
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
