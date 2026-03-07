"use client";

import { useState } from "react";
import { motion } from "framer-motion";

/* ── Types ─────────────────────────────────────────────── */

type TimePeriod = "today" | "week" | "month";

interface EarningsJob {
  id: string;
  item: string;
  type: string;
  date: string;
  time: string;
  payout: string;
  tip: string;
  status: "paid" | "pending";
}

/* ── Mock data ─────────────────────────────────────────── */

const earningsSummary: Record<TimePeriod, { total: string; jobs: number; tips: string; avgPerJob: string; hours: string }> = {
  today: { total: "€32.42", jobs: 4, tips: "€6.00", avgPerJob: "€8.11", hours: "3.5" },
  week: { total: "€187.60", jobs: 22, tips: "€34.50", avgPerJob: "€8.53", hours: "18" },
  month: { total: "€742.15", jobs: 89, tips: "€128.00", avgPerJob: "€8.34", hours: "72" },
};

const recentJobs: EarningsJob[] = [
  { id: "JOB-010", item: "Amazon return parcel", type: "Returns", date: "Today", time: "14:15", payout: "€8.62", tip: "€2.00", status: "pending" },
  { id: "JOB-009", item: "Signed legal documents", type: "Handoffs", date: "Today", time: "12:40", payout: "€11.20", tip: "€0.00", status: "pending" },
  { id: "JOB-008", item: "Prescription collection", type: "Queue & Collect", date: "Today", time: "10:30", payout: "€10.50", tip: "€3.00", status: "pending" },
  { id: "JOB-007", item: "ASOS return (3 items)", type: "Returns", date: "Today", time: "08:45", payout: "€7.80", tip: "€1.00", status: "pending" },
  { id: "JOB-006", item: "Keys handoff", type: "Handoffs", date: "Yesterday", time: "16:20", payout: "€9.10", tip: "€2.00", status: "paid" },
  { id: "JOB-005", item: "Zara return", type: "Returns", date: "Yesterday", time: "14:00", payout: "€7.20", tip: "€0.00", status: "paid" },
  { id: "JOB-004", item: "Passport collection", type: "Queue & Collect", date: "Yesterday", time: "11:15", payout: "€15.40", tip: "€5.00", status: "paid" },
  { id: "JOB-003", item: "DPD parcel drop", type: "Returns", date: "6 Mar", time: "15:30", payout: "€6.90", tip: "€1.50", status: "paid" },
];

const payoutSchedule = [
  { period: "This week (3-7 Mar)", amount: "€187.60", status: "accumulating" as const, date: "Pays out Mon 10 Mar" },
  { period: "Last week (24-28 Feb)", amount: "€210.30", status: "processing" as const, date: "Processing…" },
  { period: "Week of 17-21 Feb", amount: "€195.80", status: "paid" as const, date: "Paid 24 Feb" },
  { period: "Week of 10-14 Feb", amount: "€178.45", status: "paid" as const, date: "Paid 17 Feb" },
];

const payoutStatusConfig = {
  accumulating: { label: "Accumulating", color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-400 animate-pulse" },
  processing: { label: "Processing", color: "text-blue-600", bg: "bg-blue-50", dot: "bg-blue-400 animate-pulse" },
  paid: { label: "Paid", color: "text-green-600", bg: "bg-green-50", dot: "bg-green-500" },
};

/* ── Component ─────────────────────────────────────────── */

export default function RunnerEarningsPage() {
  const [period, setPeriod] = useState<TimePeriod>("today");
  const summary = earningsSummary[period];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[1.75rem] font-bold text-[var(--color-charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
          Earnings
        </h1>
        <p className="mt-1 text-[var(--color-text-muted)]">Track your income and payouts</p>
      </div>

      {/* Period toggle */}
      <div className="mb-6 flex gap-1 rounded-xl bg-white p-1 shadow-sm border border-[var(--color-border-light)] w-fit">
        {([
          { key: "today" as TimePeriod, label: "Today" },
          { key: "week" as TimePeriod, label: "This Week" },
          { key: "month" as TimePeriod, label: "This Month" },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setPeriod(tab.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
              period === tab.key
                ? "bg-[var(--color-charcoal)] text-white shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats cards */}
      <motion.div
        key={period}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 grid grid-cols-2 sm:grid-cols-5 gap-3"
      >
        {[
          { label: "Total Earned", value: summary.total, highlight: true },
          { label: "Jobs Completed", value: summary.jobs.toString(), highlight: false },
          { label: "Tips", value: summary.tips, highlight: false },
          { label: "Avg per Job", value: summary.avgPerJob, highlight: false },
          { label: "Hours Active", value: summary.hours + "h", highlight: false },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={`rounded-2xl border p-4 ${
              stat.highlight
                ? "border-[var(--color-forest)]/30 bg-[var(--color-forest)]/[0.04] col-span-2 sm:col-span-1"
                : "border-[var(--color-border-light)] bg-white"
            }`}
          >
            <p className="text-xs text-[var(--color-text-light)] mb-1">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.highlight ? "text-[var(--color-forest)]" : "text-[var(--color-charcoal)]"}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Job history */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white overflow-hidden">
            <div className="p-5 border-b border-[var(--color-border-light)]">
              <h3 className="text-sm font-semibold text-[var(--color-charcoal)]">Job History</h3>
            </div>

            <div className="divide-y divide-[var(--color-border-light)]">
              {recentJobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between p-4 hover:bg-[var(--color-cream)]/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--color-cream)] text-xs text-[var(--color-text-muted)]">
                      {job.type.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--color-charcoal)] truncate">{job.item}</p>
                      <p className="text-xs text-[var(--color-text-light)]">
                        {job.date} at {job.time} · {job.type}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm font-bold text-[var(--color-forest)]">{job.payout}</p>
                    {job.tip !== "€0.00" && (
                      <p className="text-[10px] text-[var(--color-text-light)]">+{job.tip} tip</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-4 border-t border-[var(--color-border-light)] text-center">
              <button className="text-sm font-medium text-[var(--color-forest)] hover:underline cursor-pointer">
                View all jobs →
              </button>
            </div>
          </div>
        </div>

        {/* Payout schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payout method */}
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5">
            <h3 className="text-sm font-semibold text-[var(--color-charcoal)] mb-3">Payout Method</h3>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-charcoal)]">Bank of Ireland</p>
                <p className="text-xs text-[var(--color-text-light)]">•••• •••• •••• 4827</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-[var(--color-text-light)]">Payouts processed every Monday</p>
          </div>

          {/* Payout history */}
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white overflow-hidden">
            <div className="p-5 border-b border-[var(--color-border-light)]">
              <h3 className="text-sm font-semibold text-[var(--color-charcoal)]">Payout Schedule</h3>
            </div>

            <div className="divide-y divide-[var(--color-border-light)]">
              {payoutSchedule.map((payout) => {
                const config = payoutStatusConfig[payout.status];
                return (
                  <div key={payout.period} className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-[var(--color-charcoal)]">{payout.amount}</p>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${config.bg} ${config.color}`}>
                        <span className={`h-1 w-1 rounded-full ${config.dot}`} />
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-light)]">{payout.period}</p>
                    <p className="text-xs text-[var(--color-text-light)]">{payout.date}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick stats */}
          <div className="rounded-2xl border border-[var(--color-forest)]/20 bg-[var(--color-forest)]/[0.03] p-5">
            <div className="flex items-center gap-2 mb-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-forest)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
              </svg>
              <span className="text-xs font-semibold text-[var(--color-forest)]">Performance</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Completion rate</span>
                <span className="font-medium text-[var(--color-charcoal)]">98%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">On-time rate</span>
                <span className="font-medium text-[var(--color-charcoal)]">96%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Customer rating</span>
                <span className="font-medium text-[var(--color-charcoal)]">4.9 ★</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Tip rate</span>
                <span className="font-medium text-[var(--color-charcoal)]">72%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
