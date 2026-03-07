"use client";

import { useState } from "react";
import { motion } from "framer-motion";

/* ── Types ─────────────────────────────────────────────── */

type TimeRange = "today" | "week" | "month";
type JobStatus = "all" | "active" | "completed" | "disputed";

interface RecentJob {
  id: string;
  item: string;
  type: string;
  customer: string;
  runner: string;
  status: "active" | "completed" | "disputed" | "pending";
  amount: string;
  time: string;
}

interface LiveStat {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "flat";
}

/* ── Mock data ─────────────────────────────────────────── */

const analyticsData: Record<TimeRange, { jobsCompleted: number; revenue: string; activeRunners: number; avgCompletion: string; disputes: number; customerSat: string }> = {
  today: { jobsCompleted: 47, revenue: "€412.80", activeRunners: 12, avgCompletion: "38 min", disputes: 1, customerSat: "4.8" },
  week: { jobsCompleted: 312, revenue: "€2,847.60", activeRunners: 28, avgCompletion: "42 min", disputes: 4, customerSat: "4.7" },
  month: { jobsCompleted: 1284, revenue: "€11,420.50", activeRunners: 45, avgCompletion: "41 min", disputes: 12, customerSat: "4.8" },
};

const recentJobs: RecentJob[] = [
  { id: "JOB-010", item: "Amazon return parcel", type: "Returns", customer: "Sarah M.", runner: "Cian O'Brien", status: "active", amount: "€8.62", time: "2 min ago" },
  { id: "JOB-009", item: "Signed legal documents", type: "Handoffs", customer: "James K.", runner: "Aoife Murphy", status: "active", amount: "€11.20", time: "8 min ago" },
  { id: "JOB-008", item: "Prescription collection", type: "Queue & Collect", customer: "Emily R.", runner: "Liam Walsh", status: "completed", amount: "€10.50", time: "22 min ago" },
  { id: "JOB-007", item: "ASOS return (3 items)", type: "Returns", customer: "David L.", runner: "Niamh Kelly", status: "completed", amount: "€7.80", time: "45 min ago" },
  { id: "JOB-006", item: "Keys handoff", type: "Handoffs", customer: "Fiona B.", runner: "Sean Byrne", status: "completed", amount: "€9.10", time: "1h ago" },
  { id: "JOB-005", item: "Zara return", type: "Returns", customer: "Mark T.", runner: "Cian O'Brien", status: "disputed", amount: "€7.20", time: "2h ago" },
  { id: "JOB-004", item: "Passport collection", type: "Queue & Collect", customer: "Lisa H.", runner: "Aoife Murphy", status: "completed", amount: "€15.40", time: "3h ago" },
  { id: "JOB-003", item: "DPD parcel drop", type: "Returns", customer: "Tom W.", runner: "Liam Walsh", status: "completed", amount: "€6.90", time: "4h ago" },
];

const liveStats: LiveStat[] = [
  { label: "Active Jobs", value: "8", change: "+3 from 1h ago", trend: "up" },
  { label: "Online Runners", value: "12", change: "+2 from 1h ago", trend: "up" },
  { label: "Queue Depth", value: "3", change: "−1 from 1h ago", trend: "down" },
  { label: "Avg Wait Time", value: "4 min", change: "Same as usual", trend: "flat" },
];

const statusConfig = {
  active: { label: "Active", color: "text-blue-700", bg: "bg-blue-50", dot: "bg-blue-500 animate-pulse" },
  completed: { label: "Completed", color: "text-green-700", bg: "bg-green-50", dot: "bg-green-500" },
  disputed: { label: "Disputed", color: "text-red-700", bg: "bg-red-50", dot: "bg-red-500" },
  pending: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500" },
};

/* ── Component ─────────────────────────────────────────── */

export default function AdminOverviewPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("today");
  const [statusFilter, setStatusFilter] = useState<JobStatus>("all");

  const analytics = analyticsData[timeRange];

  const filteredJobs = statusFilter === "all"
    ? recentJobs
    : recentJobs.filter((j) => j.status === statusFilter);

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[1.75rem] font-bold text-[var(--color-charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
            Overview
          </h1>
          <p className="mt-1 text-[var(--color-text-muted)]">Platform activity at a glance</p>
        </div>

        {/* Time range toggle */}
        <div className="flex gap-1 rounded-xl bg-white p-1 shadow-sm border border-[var(--color-border-light)] w-fit">
          {([
            { key: "today" as TimeRange, label: "Today" },
            { key: "week" as TimeRange, label: "This Week" },
            { key: "month" as TimeRange, label: "This Month" },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setTimeRange(tab.key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
                timeRange === tab.key
                  ? "bg-[var(--color-charcoal)] text-white shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics cards */}
      <motion.div
        key={timeRange}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        {[
          { label: "Jobs Completed", value: analytics.jobsCompleted.toString(), icon: "📦", highlight: false },
          { label: "Revenue", value: analytics.revenue, icon: "💰", highlight: true },
          { label: "Active Runners", value: analytics.activeRunners.toString(), icon: "🏃", highlight: false },
          { label: "Avg Completion", value: analytics.avgCompletion, icon: "⏱️", highlight: false },
          { label: "Disputes", value: analytics.disputes.toString(), icon: "⚠️", highlight: false },
          { label: "Satisfaction", value: analytics.customerSat + " ★", icon: "⭐", highlight: false },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl border p-4 ${
              stat.highlight
                ? "border-red-200 bg-red-50/50"
                : "border-[var(--color-border-light)] bg-white"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">{stat.icon}</span>
              <p className="text-[11px] text-[var(--color-text-light)] uppercase tracking-wider font-medium">{stat.label}</p>
            </div>
            <p className={`text-xl font-bold ${stat.highlight ? "text-red-600" : "text-[var(--color-charcoal)]"}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Recent jobs — 3 cols */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white overflow-hidden">
            <div className="p-5 border-b border-[var(--color-border-light)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-sm font-semibold text-[var(--color-charcoal)]">Recent Jobs</h3>
              <div className="flex gap-1">
                {([
                  { key: "all" as JobStatus, label: "All" },
                  { key: "active" as JobStatus, label: "Active" },
                  { key: "completed" as JobStatus, label: "Completed" },
                  { key: "disputed" as JobStatus, label: "Disputed" },
                ]).map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setStatusFilter(f.key)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                      statusFilter === f.key
                        ? "bg-[var(--color-charcoal)] text-white"
                        : "text-[var(--color-text-muted)] hover:bg-gray-100"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table header */}
            <div className="hidden sm:grid grid-cols-12 gap-2 px-5 py-2.5 text-[11px] font-medium text-[var(--color-text-light)] uppercase tracking-wider border-b border-[var(--color-border-light)] bg-[#fafaf8]">
              <div className="col-span-1">ID</div>
              <div className="col-span-3">Item</div>
              <div className="col-span-2">Customer</div>
              <div className="col-span-2">Runner</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Amount</div>
              <div className="col-span-1">Time</div>
            </div>

            <div className="divide-y divide-[var(--color-border-light)]">
              {filteredJobs.map((job, i) => {
                const config = statusConfig[job.status];
                return (
                  <motion.a
                    key={job.id}
                    href={`/admin/jobs/${job.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="block sm:grid grid-cols-12 gap-2 px-5 py-3.5 hover:bg-[var(--color-cream)]/50 transition-colors group"
                  >
                    <div className="col-span-1 text-xs text-[var(--color-text-light)] font-mono">{job.id}</div>
                    <div className="col-span-3">
                      <p className="text-sm font-medium text-[var(--color-charcoal)] group-hover:text-red-600 transition-colors">{job.item}</p>
                      <p className="text-xs text-[var(--color-text-light)] sm:hidden">{job.type}</p>
                    </div>
                    <div className="col-span-2 text-sm text-[var(--color-text-muted)]">{job.customer}</div>
                    <div className="col-span-2 text-sm text-[var(--color-text-muted)]">{job.runner}</div>
                    <div className="col-span-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${config.bg} ${config.color}`}>
                        <span className={`h-1 w-1 rounded-full ${config.dot}`} />
                        {config.label}
                      </span>
                    </div>
                    <div className="col-span-1 text-sm font-semibold text-[var(--color-charcoal)]">{job.amount}</div>
                    <div className="col-span-1 text-xs text-[var(--color-text-light)]">{job.time}</div>
                  </motion.a>
                );
              })}
              {filteredJobs.length === 0 && (
                <div className="py-12 text-center text-sm text-[var(--color-text-muted)]">
                  No jobs matching this filter
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[var(--color-border-light)] text-center">
              <a href="/admin/jobs" className="text-sm font-medium text-red-600 hover:underline">
                View all jobs →
              </a>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Live stats */}
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white overflow-hidden">
            <div className="p-4 border-b border-[var(--color-border-light)]">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <h3 className="text-sm font-semibold text-[var(--color-charcoal)]">Live</h3>
              </div>
            </div>
            <div className="divide-y divide-[var(--color-border-light)]">
              {liveStats.map((stat) => (
                <div key={stat.label} className="p-4">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs text-[var(--color-text-light)]">{stat.label}</span>
                    <span className="text-lg font-bold text-[var(--color-charcoal)]">{stat.value}</span>
                  </div>
                  <p className={`text-[10px] ${
                    stat.trend === "up" ? "text-green-600" : stat.trend === "down" ? "text-red-600" : "text-[var(--color-text-light)]"
                  }`}>
                    {stat.change}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5">
            <h3 className="text-sm font-semibold text-[var(--color-charcoal)] mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: "View disputes", href: "/admin/disputes", count: 3 },
                { label: "Pending payouts", href: "/admin/payouts", count: 8 },
                { label: "Runner applications", href: "/admin/runners", count: 2 },
              ].map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-[var(--color-text-muted)] hover:bg-gray-50 transition-colors group"
                >
                  <span className="group-hover:text-[var(--color-charcoal)] transition-colors">{action.label}</span>
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-50 text-[10px] font-bold text-red-600 px-1.5">
                    {action.count}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Platform health */}
          <div className="rounded-2xl border border-green-200 bg-green-50/50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs font-semibold text-green-700">System Healthy</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700/70">API latency</span>
                <span className="font-medium text-green-800">42ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700/70">Uptime</span>
                <span className="font-medium text-green-800">99.98%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700/70">Error rate</span>
                <span className="font-medium text-green-800">0.02%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
