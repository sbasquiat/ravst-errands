"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Errand, Payout, Profile } from "@/types/database";

type CompletedJob = Errand & {
  customer: Pick<Profile, "full_name" | "phone" | "avatar_url"> | null;
};

type TimePeriod = "today" | "week" | "month";

const typeLabels: Record<string, string> = {
  returns: "Returns",
  handoffs: "Handoffs",
  collect: "Queue & Collect",
};

const payoutStatusConfig = {
  pending: { label: "Accumulating", color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-400 animate-pulse" },
  processing: { label: "Processing", color: "text-blue-600", bg: "bg-blue-50", dot: "bg-blue-400 animate-pulse" },
  completed: { label: "Paid", color: "text-green-600", bg: "bg-green-50", dot: "bg-green-500" },
  failed: { label: "Failed", color: "text-red-600", bg: "bg-red-50", dot: "bg-red-500" },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IE", { day: "numeric", month: "short" });
}

interface RunnerEarningsProps {
  completedJobs: CompletedJob[];
  payouts: Payout[];
  runnerStats: {
    rating: number;
    jobsCompleted: number;
    totalEarnings: number;
  };
}

export default function RunnerEarnings({ completedJobs, payouts, runnerStats }: RunnerEarningsProps) {
  const [period, setPeriod] = useState<TimePeriod>("month");

  const now = new Date();

  const filteredJobs = completedJobs.filter((job) => {
    const d = new Date(job.completed_at ?? job.created_at);
    if (period === "today") return d.toDateString() === now.toDateString();
    if (period === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    }
    // month
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalEarned = filteredJobs.reduce((sum, j) => sum + j.runner_payout, 0);
  const totalTips = filteredJobs.reduce((sum, j) => sum + j.tip, 0);
  const avgPerJob = filteredJobs.length > 0 ? totalEarned / filteredJobs.length : 0;

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
        className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          { label: "Total Earned", value: `€${totalEarned.toFixed(2)}`, highlight: true },
          { label: "Jobs Completed", value: filteredJobs.length.toString(), highlight: false },
          { label: "Tips", value: `€${totalTips.toFixed(2)}`, highlight: false },
          { label: "Avg per Job", value: `€${avgPerJob.toFixed(2)}`, highlight: false },
        ].map((stat) => (
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
              {filteredJobs.slice(0, 15).map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between p-4 hover:bg-[var(--color-cream)]/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--color-cream)] text-xs text-[var(--color-text-muted)]">
                      {(typeLabels[job.type] ?? "R").charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--color-charcoal)] truncate">{job.item_description}</p>
                      <p className="text-xs text-[var(--color-text-light)]">
                        {formatDate(job.completed_at ?? job.created_at)} · {typeLabels[job.type] ?? job.type}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm font-bold text-[var(--color-forest)]">€{job.runner_payout.toFixed(2)}</p>
                    {job.tip > 0 && (
                      <p className="text-[10px] text-[var(--color-text-light)]">+€{job.tip.toFixed(2)} tip</p>
                    )}
                  </div>
                </motion.div>
              ))}

              {filteredJobs.length === 0 && (
                <div className="p-8 text-center text-sm text-[var(--color-text-muted)]">
                  No completed jobs for this period
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payout schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payout method placeholder */}
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5">
            <h3 className="text-sm font-semibold text-[var(--color-charcoal)] mb-3">Payout Method</h3>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-charcoal)]">Bank account</p>
                <p className="text-xs text-[var(--color-text-light)]">Connected via Stripe</p>
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
              {payouts.slice(0, 5).map((payout) => {
                const config = payoutStatusConfig[payout.status] ?? payoutStatusConfig.pending;
                return (
                  <div key={payout.id} className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-[var(--color-charcoal)]">€{payout.amount.toFixed(2)}</p>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${config.bg} ${config.color}`}>
                        <span className={`h-1 w-1 rounded-full ${config.dot}`} />
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-light)]">
                      {new Date(payout.period_start).toLocaleDateString("en-IE", { day: "numeric", month: "short" })} – {new Date(payout.period_end).toLocaleDateString("en-IE", { day: "numeric", month: "short" })}
                    </p>
                    <p className="text-xs text-[var(--color-text-light)]">
                      {payout.job_count} jobs · Scheduled {new Date(payout.scheduled_date).toLocaleDateString("en-IE", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                );
              })}

              {payouts.length === 0 && (
                <div className="p-6 text-center text-sm text-[var(--color-text-muted)]">
                  No payouts yet
                </div>
              )}
            </div>
          </div>

          {/* Performance card */}
          <div className="rounded-2xl border border-[var(--color-forest)]/20 bg-[var(--color-forest)]/[0.03] p-5">
            <div className="flex items-center gap-2 mb-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-forest)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
              </svg>
              <span className="text-xs font-semibold text-[var(--color-forest)]">Performance</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Jobs completed</span>
                <span className="font-medium text-[var(--color-charcoal)]">{runnerStats.jobsCompleted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Total earned</span>
                <span className="font-medium text-[var(--color-charcoal)]">€{runnerStats.totalEarnings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Customer rating</span>
                <span className="font-medium text-[var(--color-charcoal)]">{runnerStats.rating.toFixed(1)} ★</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
