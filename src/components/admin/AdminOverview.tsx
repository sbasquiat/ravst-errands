"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Errand, Profile } from "@/types/database";

type TimeRange = "today" | "week" | "month";
type JobStatus = "all" | "active" | "completed" | "disputed";

type ErrandWithRelations = Errand & {
  customer: Pick<Profile, "id" | "full_name" | "email" | "avatar_url"> | null;
  runner: { id: string; profile: Pick<Profile, "full_name" | "avatar_url">; rating: number } | null;
};

interface AdminOverviewProps {
  errands: ErrandWithRelations[];
  stats: {
    totalErrands: number;
    activeErrands: number;
    completedErrands: number;
    totalRevenue: number;
    totalRunners: number;
    activeRunners: number;
    totalCustomers: number;
    openDisputes: number;
    pendingPayouts: number;
  };
}

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500" },
  finding_runner: { label: "Finding", color: "text-blue-700", bg: "bg-blue-50", dot: "bg-blue-500 animate-pulse" },
  runner_assigned: { label: "Assigned", color: "text-blue-700", bg: "bg-blue-50", dot: "bg-blue-500" },
  in_progress: { label: "Active", color: "text-blue-700", bg: "bg-blue-50", dot: "bg-blue-500 animate-pulse" },
  completed: { label: "Completed", color: "text-green-700", bg: "bg-green-50", dot: "bg-green-500" },
  cancelled: { label: "Cancelled", color: "text-gray-500", bg: "bg-gray-100", dot: "bg-gray-400" },
  disputed: { label: "Disputed", color: "text-red-700", bg: "bg-red-50", dot: "bg-red-500" },
};

function formatTimeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return d.toLocaleDateString("en-IE", { day: "numeric", month: "short" });
}

const typeLabels: Record<string, string> = {
  returns: "Returns",
  handoffs: "Handoffs",
  collect: "Queue & Collect",
};

function isActiveStatus(status: string) {
  return ["pending", "finding_runner", "runner_assigned", "in_progress"].includes(status);
}

export default function AdminOverview({ errands, stats }: AdminOverviewProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("today");
  const [statusFilter, setStatusFilter] = useState<JobStatus>("all");

  const now = new Date();

  const filteredByTime = errands.filter((e) => {
    const d = new Date(e.created_at);
    if (timeRange === "today") return d.toDateString() === now.toDateString();
    if (timeRange === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    }
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const periodCompleted = filteredByTime.filter((e) => e.status === "completed").length;
  const periodRevenue = filteredByTime.filter((e) => e.status === "completed").reduce((sum, e) => sum + e.total_price, 0);
  const periodActive = filteredByTime.filter((e) => isActiveStatus(e.status)).length;
  const periodDisputes = filteredByTime.filter((e) => e.status === "disputed").length;

  const filteredJobs = statusFilter === "all"
    ? filteredByTime
    : filteredByTime.filter((e) => {
        if (statusFilter === "active") return isActiveStatus(e.status);
        if (statusFilter === "completed") return e.status === "completed";
        if (statusFilter === "disputed") return e.status === "disputed";
        return true;
      });

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
          { label: "Jobs Completed", value: periodCompleted.toString(), icon: "📦", highlight: false },
          { label: "Revenue", value: `€${periodRevenue.toFixed(2)}`, icon: "💰", highlight: true },
          { label: "Active Runners", value: stats.activeRunners.toString(), icon: "🏃", highlight: false },
          { label: "Active Jobs", value: periodActive.toString(), icon: "⏱️", highlight: false },
          { label: "Disputes", value: periodDisputes.toString(), icon: "⚠️", highlight: false },
          { label: "Customers", value: stats.totalCustomers.toString(), icon: "⭐", highlight: false },
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
        {/* Recent jobs */}
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
              {filteredJobs.slice(0, 10).map((errand, i) => {
                const config = statusConfig[errand.status] ?? statusConfig.pending;
                return (
                  <motion.a
                    key={errand.id}
                    href={`/admin/jobs/${errand.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="block sm:grid grid-cols-12 gap-2 px-5 py-3.5 hover:bg-[var(--color-cream)]/50 transition-colors group"
                  >
                    <div className="col-span-1 text-xs text-[var(--color-text-light)] font-mono">{errand.display_id?.slice(-7) ?? errand.id.slice(0, 8)}</div>
                    <div className="col-span-3">
                      <p className="text-sm font-medium text-[var(--color-charcoal)] group-hover:text-red-600 transition-colors">{errand.item_description}</p>
                      <p className="text-xs text-[var(--color-text-light)] sm:hidden">{typeLabels[errand.type] ?? errand.type}</p>
                    </div>
                    <div className="col-span-2 text-sm text-[var(--color-text-muted)]">{errand.customer?.full_name ?? "—"}</div>
                    <div className="col-span-2 text-sm text-[var(--color-text-muted)]">{errand.runner?.profile?.full_name ?? "Unassigned"}</div>
                    <div className="col-span-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${config.bg} ${config.color}`}>
                        <span className={`h-1 w-1 rounded-full ${config.dot}`} />
                        {config.label}
                      </span>
                    </div>
                    <div className="col-span-1 text-sm font-semibold text-[var(--color-charcoal)]">€{errand.total_price.toFixed(2)}</div>
                    <div className="col-span-1 text-xs text-[var(--color-text-light)]">{formatTimeAgo(errand.created_at)}</div>
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
              {[
                { label: "Active Jobs", value: stats.activeErrands.toString() },
                { label: "Online Runners", value: stats.activeRunners.toString() },
                { label: "Open Disputes", value: stats.openDisputes.toString() },
                { label: "Pending Payouts", value: `€${stats.pendingPayouts.toFixed(2)}` },
              ].map((stat) => (
                <div key={stat.label} className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--color-text-light)]">{stat.label}</span>
                    <span className="text-lg font-bold text-[var(--color-charcoal)]">{stat.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5">
            <h3 className="text-sm font-semibold text-[var(--color-charcoal)] mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: "View disputes", href: "/admin/disputes", count: stats.openDisputes },
                { label: "Pending payouts", href: "/admin/payouts" },
                { label: "Manage runners", href: "/admin/runners" },
              ].map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-[var(--color-text-muted)] hover:bg-gray-50 transition-colors group"
                >
                  <span className="group-hover:text-[var(--color-charcoal)] transition-colors">{action.label}</span>
                  {action.count !== undefined && action.count > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-50 text-[10px] font-bold text-red-600 px-1.5">
                      {action.count}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Platform totals */}
          <div className="rounded-2xl border border-green-200 bg-green-50/50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs font-semibold text-green-700">Platform Totals</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700/70">Total jobs</span>
                <span className="font-medium text-green-800">{stats.totalErrands}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700/70">Total revenue</span>
                <span className="font-medium text-green-800">€{stats.totalRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700/70">Runners</span>
                <span className="font-medium text-green-800">{stats.totalRunners}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
