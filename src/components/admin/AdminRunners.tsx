"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { adminUpdateRunnerStatus, adminToggleRunnerVerified } from "@/lib/supabase/actions";
import type { RunnerProfile, Profile } from "@/types/database";

type RunnerWithProfile = RunnerProfile & {
  profile: Pick<Profile, "full_name" | "email" | "phone" | "avatar_url" | "created_at"> | null;
};

type RunnerStatus = "active" | "inactive" | "pending" | "suspended";
type FilterStatus = "all" | RunnerStatus;

const statusConfig: Record<RunnerStatus, { label: string; color: string; bg: string; dot: string }> = {
  active: { label: "Active", color: "text-green-700", bg: "bg-green-50", dot: "bg-green-500" },
  inactive: { label: "Inactive", color: "text-gray-500", bg: "bg-gray-100", dot: "bg-gray-400" },
  pending: { label: "Pending Review", color: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500 animate-pulse" },
  suspended: { label: "Suspended", color: "text-red-700", bg: "bg-red-50", dot: "bg-red-500" },
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IE", { month: "short", year: "numeric" });
}

interface AdminRunnersProps {
  runners: RunnerWithProfile[];
}

export default function AdminRunners({ runners }: AdminRunnersProps) {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [expandedRunner, setExpandedRunner] = useState<string | null>(null);
  const [actionDone, setActionDone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = runners.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (
        !(r.profile?.full_name ?? "").toLowerCase().includes(s) &&
        !(r.profile?.email ?? "").toLowerCase().includes(s)
      ) return false;
    }
    return true;
  });

  const counts = {
    all: runners.length,
    active: runners.filter((r) => r.status === "active").length,
    inactive: runners.filter((r) => r.status === "inactive").length,
    pending: runners.filter((r) => r.status === "pending").length,
    suspended: runners.filter((r) => r.status === "suspended").length,
  };

  const handleStatusChange = async (runnerId: string, newStatus: RunnerStatus, runnerName: string) => {
    setLoading(true);
    const result = await adminUpdateRunnerStatus(runnerId, newStatus);
    setLoading(false);
    if (!result.error) {
      const labels: Record<string, string> = {
        active: `${runnerName} activated`,
        inactive: `${runnerName} deactivated`,
        suspended: `${runnerName} suspended`,
      };
      setActionDone(labels[newStatus] ?? `${runnerName} status updated`);
      setTimeout(() => setActionDone(null), 2000);
    }
  };

  const handleToggleVerified = async (runnerId: string, currentlyVerified: boolean, runnerName: string) => {
    setLoading(true);
    const result = await adminToggleRunnerVerified(runnerId, !currentlyVerified);
    setLoading(false);
    if (!result.error) {
      setActionDone(!currentlyVerified ? `${runnerName} marked as verified` : `${runnerName} verification removed`);
      setTimeout(() => setActionDone(null), 2000);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[1.75rem] font-bold text-[var(--color-charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
            Runners
          </h1>
          <p className="mt-1 text-[var(--color-text-muted)]">
            {counts.active} active · {counts.pending} pending review
          </p>
        </div>

        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-light)]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            type="text"
            placeholder="Search runners…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-[var(--color-border-light)] bg-white pl-9 pr-4 py-2.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 transition-all"
          />
        </div>
      </div>

      {/* Action toast */}
      {actionDone && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 font-medium"
        >
          ✓ {actionDone}
        </motion.div>
      )}

      {/* Filters */}
      <div className="mb-6 flex gap-1 rounded-xl bg-white p-1 shadow-sm border border-[var(--color-border-light)] w-fit">
        {([
          { key: "all" as FilterStatus, label: "All" },
          { key: "active" as FilterStatus, label: "Active" },
          { key: "pending" as FilterStatus, label: "Pending" },
          { key: "inactive" as FilterStatus, label: "Inactive" },
          { key: "suspended" as FilterStatus, label: "Suspended" },
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

      {/* Runner cards */}
      <div className="space-y-3">
        {filtered.map((runner, i) => {
          const config = statusConfig[runner.status as RunnerStatus] ?? statusConfig.pending;
          const isExpanded = expandedRunner === runner.id;
          const name = runner.profile?.full_name ?? "Unknown";

          return (
            <motion.div
              key={runner.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-2xl border border-[var(--color-border-light)] bg-white overflow-hidden"
            >
              {/* Main row */}
              <button
                onClick={() => setExpandedRunner(isExpanded ? null : runner.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--color-cream)]/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-forest)]/10 text-sm font-semibold text-[var(--color-forest)]">
                    {getInitials(name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-[var(--color-charcoal)]">{name}</h3>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${config.bg} ${config.color}`}>
                        <span className={`h-1 w-1 rounded-full ${config.dot}`} />
                        {config.label}
                      </span>
                      {!runner.verified && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">Unverified</span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-[var(--color-text-light)]">
                      <span>{runner.transport_mode}</span>
                      <span>·</span>
                      <span>{runner.jobs_completed} jobs</span>
                      {runner.rating > 0 && (
                        <>
                          <span>·</span>
                          <span>{runner.rating.toFixed(1)} ★</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-sm font-bold text-[var(--color-charcoal)] hidden sm:block">€{runner.total_earnings.toFixed(2)}</span>
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className={`text-[var(--color-text-light)] transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="border-t border-[var(--color-border-light)] px-5 py-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-[var(--color-text-light)] mb-1">Contact</p>
                      <p className="text-sm text-[var(--color-charcoal)]">{runner.profile?.email ?? "—"}</p>
                      <p className="text-sm text-[var(--color-charcoal)]">{runner.profile?.phone ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-text-light)] mb-1">Active Zones</p>
                      <div className="flex flex-wrap gap-1">
                        {(runner.availability_zones ?? []).map((zone) => (
                          <span key={zone} className="rounded-md bg-[var(--color-cream)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]">{zone}</span>
                        ))}
                        {(runner.availability_zones ?? []).length === 0 && (
                          <span className="text-xs text-[var(--color-text-light)]">None set</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-text-light)] mb-1">Verified</p>
                      <p className={`text-sm font-medium ${runner.verified ? "text-green-600" : "text-amber-600"}`}>
                        {runner.verified ? "✓ Verified" : "⚠ Unverified"}
                      </p>
                      {runner.profile?.created_at && (
                        <p className="text-xs text-[var(--color-text-light)]">Joined {formatDate(runner.profile.created_at)}</p>
                      )}
                    </div>
                  </div>

                  {/* Admin actions */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-[var(--color-border-light)]">
                    {/* Verification toggle */}
                    <button
                      onClick={() => handleToggleVerified(runner.id, runner.verified, name)}
                      disabled={loading}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 ${
                        runner.verified
                          ? "border border-green-200 text-green-700 hover:bg-green-50"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {runner.verified ? "✓ Verified" : "Mark Verified"}
                    </button>
                    {runner.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleStatusChange(runner.id, "active", name)}
                          disabled={loading}
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Approve & Activate
                        </button>
                        <button
                          onClick={() => handleStatusChange(runner.id, "inactive", name)}
                          disabled={loading}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {runner.status === "active" && (
                      <button
                        onClick={() => handleStatusChange(runner.id, "inactive", name)}
                        disabled={loading}
                        className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Deactivate
                      </button>
                    )}
                    {runner.status === "inactive" && (
                      <button
                        onClick={() => handleStatusChange(runner.id, "active", name)}
                        disabled={loading}
                        className="rounded-lg bg-[var(--color-forest)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--color-forest)]/90 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Reactivate
                      </button>
                    )}
                    {runner.status === "suspended" && (
                      <button
                        onClick={() => handleStatusChange(runner.id, "active", name)}
                        disabled={loading}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Unsuspend
                      </button>
                    )}
                    {runner.status !== "suspended" && runner.status !== "pending" && (
                      <button
                        onClick={() => handleStatusChange(runner.id, "suspended", name)}
                        disabled={loading}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-[var(--color-text-muted)]">
            No runners found matching your filters
          </div>
        )}
      </div>
    </div>
  );
}
