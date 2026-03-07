"use client";

import { useState } from "react";
import { motion } from "framer-motion";

/* ── Types ─────────────────────────────────────────────── */

type RunnerStatus = "active" | "inactive" | "pending" | "suspended";
type FilterStatus = "all" | RunnerStatus;

interface Runner {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  status: RunnerStatus;
  transport: string;
  joinDate: string;
  jobsCompleted: number;
  rating: number;
  earnings: string;
  lastActive: string;
  zones: string[];
  verified: boolean;
  documentsComplete: boolean;
}

/* ── Mock data ─────────────────────────────────────────── */

const runners: Runner[] = [
  { id: "RUN-001", name: "Cian O'Brien", avatar: "CO", email: "cian.o@email.com", phone: "+353 86 987 6543", status: "active", transport: "Bicycle", joinDate: "Dec 2025", jobsCompleted: 89, rating: 4.9, earnings: "€742.15", lastActive: "Just now", zones: ["City Centre", "Rathmines"], verified: true, documentsComplete: true },
  { id: "RUN-002", name: "Aoife Murphy", avatar: "AM", email: "aoife.m@email.com", phone: "+353 87 234 5678", status: "active", transport: "Walking", joinDate: "Jan 2026", jobsCompleted: 67, rating: 4.8, earnings: "€558.30", lastActive: "5 min ago", zones: ["City Centre", "Portobello"], verified: true, documentsComplete: true },
  { id: "RUN-003", name: "Liam Walsh", avatar: "LW", email: "liam.w@email.com", phone: "+353 85 345 6789", status: "active", transport: "Car", joinDate: "Jan 2026", jobsCompleted: 52, rating: 4.7, earnings: "€431.60", lastActive: "12 min ago", zones: ["Drumcondra", "Phibsborough", "City Centre"], verified: true, documentsComplete: true },
  { id: "RUN-004", name: "Niamh Kelly", avatar: "NK", email: "niamh.k@email.com", phone: "+353 83 456 7890", status: "inactive", transport: "Bicycle", joinDate: "Feb 2026", jobsCompleted: 34, rating: 4.6, earnings: "€283.40", lastActive: "2 days ago", zones: ["Ranelagh", "Rathmines"], verified: true, documentsComplete: true },
  { id: "RUN-005", name: "Sean Byrne", avatar: "SB", email: "sean.b@email.com", phone: "+353 89 567 8901", status: "active", transport: "Walking", joinDate: "Feb 2026", jobsCompleted: 41, rating: 4.9, earnings: "€340.20", lastActive: "30 min ago", zones: ["City Centre"], verified: true, documentsComplete: true },
  { id: "RUN-006", name: "Emma Doyle", avatar: "ED", email: "emma.d@email.com", phone: "+353 87 678 9012", status: "pending", transport: "Bicycle", joinDate: "Mar 2026", jobsCompleted: 0, rating: 0, earnings: "€0.00", lastActive: "Never", zones: ["Clontarf"], verified: false, documentsComplete: false },
  { id: "RUN-007", name: "Conor Ryan", avatar: "CR", email: "conor.r@email.com", phone: "+353 86 789 0123", status: "pending", transport: "Car", joinDate: "Mar 2026", jobsCompleted: 0, rating: 0, earnings: "€0.00", lastActive: "Never", zones: ["Sandyford", "Dundrum"], verified: false, documentsComplete: true },
  { id: "RUN-008", name: "Roisin Brennan", avatar: "RB", email: "roisin.b@email.com", phone: "+353 85 890 1234", status: "suspended", transport: "Walking", joinDate: "Jan 2026", jobsCompleted: 12, rating: 3.8, earnings: "€99.60", lastActive: "1 week ago", zones: ["City Centre"], verified: true, documentsComplete: true },
];

const statusConfig: Record<RunnerStatus, { label: string; color: string; bg: string; dot: string }> = {
  active: { label: "Active", color: "text-green-700", bg: "bg-green-50", dot: "bg-green-500" },
  inactive: { label: "Inactive", color: "text-gray-500", bg: "bg-gray-100", dot: "bg-gray-400" },
  pending: { label: "Pending Review", color: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500 animate-pulse" },
  suspended: { label: "Suspended", color: "text-red-700", bg: "bg-red-50", dot: "bg-red-500" },
};

/* ── Component ─────────────────────────────────────────── */

export default function AdminRunnersPage() {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [expandedRunner, setExpandedRunner] = useState<string | null>(null);
  const [actionDone, setActionDone] = useState<string | null>(null);

  const filtered = runners.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: runners.length,
    active: runners.filter((r) => r.status === "active").length,
    inactive: runners.filter((r) => r.status === "inactive").length,
    pending: runners.filter((r) => r.status === "pending").length,
    suspended: runners.filter((r) => r.status === "suspended").length,
  };

  const handleAction = (label: string) => {
    setActionDone(label);
    setTimeout(() => setActionDone(null), 2000);
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
          const config = statusConfig[runner.status];
          const isExpanded = expandedRunner === runner.id;

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
                    {runner.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-[var(--color-charcoal)]">{runner.name}</h3>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${config.bg} ${config.color}`}>
                        <span className={`h-1 w-1 rounded-full ${config.dot}`} />
                        {config.label}
                      </span>
                      {!runner.verified && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">Unverified</span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-[var(--color-text-light)]">
                      <span>{runner.transport}</span>
                      <span>·</span>
                      <span>{runner.jobsCompleted} jobs</span>
                      {runner.rating > 0 && (
                        <>
                          <span>·</span>
                          <span>{runner.rating} ★</span>
                        </>
                      )}
                      <span>·</span>
                      <span>Last: {runner.lastActive}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-sm font-bold text-[var(--color-charcoal)] hidden sm:block">{runner.earnings}</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
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
                      <p className="text-sm text-[var(--color-charcoal)]">{runner.email}</p>
                      <p className="text-sm text-[var(--color-charcoal)]">{runner.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-text-light)] mb-1">Active Zones</p>
                      <div className="flex flex-wrap gap-1">
                        {runner.zones.map((zone) => (
                          <span key={zone} className="rounded-md bg-[var(--color-cream)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]">{zone}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-text-light)] mb-1">Documents</p>
                      <p className={`text-sm font-medium ${runner.documentsComplete ? "text-green-600" : "text-amber-600"}`}>
                        {runner.documentsComplete ? "✓ All complete" : "⚠ Incomplete"}
                      </p>
                      <p className="text-xs text-[var(--color-text-light)]">Joined {runner.joinDate}</p>
                    </div>
                  </div>

                  {/* Admin actions */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-[var(--color-border-light)]">
                    {runner.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleAction(`${runner.name} approved and activated`)}
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors cursor-pointer"
                        >
                          Approve & Activate
                        </button>
                        <button
                          onClick={() => handleAction(`${runner.name}'s application rejected`)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {runner.status === "active" && (
                      <button
                        onClick={() => handleAction(`${runner.name} deactivated`)}
                        className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                      >
                        Deactivate
                      </button>
                    )}
                    {runner.status === "inactive" && (
                      <button
                        onClick={() => handleAction(`${runner.name} reactivated`)}
                        className="rounded-lg bg-[var(--color-forest)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--color-forest)]/90 transition-colors cursor-pointer"
                      >
                        Reactivate
                      </button>
                    )}
                    {runner.status === "suspended" && (
                      <button
                        onClick={() => handleAction(`${runner.name} unsuspended`)}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        Unsuspend
                      </button>
                    )}
                    {runner.status !== "suspended" && runner.status !== "pending" && (
                      <button
                        onClick={() => handleAction(`${runner.name} suspended`)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        Suspend
                      </button>
                    )}
                    <button className="rounded-lg border border-[var(--color-border-light)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:bg-gray-50 transition-colors cursor-pointer">
                      View Jobs History
                    </button>
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
