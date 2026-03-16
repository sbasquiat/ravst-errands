"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { adminResolveDispute } from "@/lib/supabase/actions";
import type { Dispute, DisputeEvidence } from "@/types/database";

type DisputeWithRelations = Dispute & {
  errand: { display_id: string | null; type: string; item_description: string } | null;
  filer: { id: string; full_name: string | null; email: string | null } | null;
  evidence: DisputeEvidence[];
};

type DisputeStatus = "open" | "investigating" | "resolved" | "escalated";
type FilterStatus = "all" | "open" | "investigating" | "resolved";

const statusConfig: Record<DisputeStatus, { label: string; color: string; bg: string; dot: string }> = {
  open: { label: "Open", color: "text-red-700", bg: "bg-red-50", dot: "bg-red-500 animate-pulse" },
  investigating: { label: "Investigating", color: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500 animate-pulse" },
  resolved: { label: "Resolved", color: "text-green-700", bg: "bg-green-50", dot: "bg-green-500" },
  escalated: { label: "Escalated", color: "text-purple-700", bg: "bg-purple-50", dot: "bg-purple-500" },
};

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  high: { label: "High", color: "text-red-600", bg: "bg-red-50" },
  medium: { label: "Medium", color: "text-amber-600", bg: "bg-amber-50" },
  low: { label: "Low", color: "text-gray-500", bg: "bg-gray-100" },
};

const evidenceIcons: Record<string, React.ReactNode> = {
  photo: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
  ),
  text: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
  ),
  gps: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
  ),
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return `Today, ${d.toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" })}`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday, ${d.toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" })}`;
  return d.toLocaleDateString("en-IE", { day: "numeric", month: "short" }) + ", " + d.toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" });
}

interface AdminDisputesProps {
  disputes: DisputeWithRelations[];
}

export default function AdminDisputes({ disputes }: AdminDisputesProps) {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionDone, setActionDone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = filter === "all" ? disputes : disputes.filter((d) => d.status === filter);

  const counts = {
    all: disputes.length,
    open: disputes.filter((d) => d.status === "open").length,
    investigating: disputes.filter((d) => d.status === "investigating").length,
    resolved: disputes.filter((d) => d.status === "resolved").length,
  };

  const handleResolve = async (disputeId: string, resolution: string, label: string) => {
    setLoading(true);
    const result = await adminResolveDispute(disputeId, resolution);
    setLoading(false);
    if (!result.error) {
      setActionDone(label);
      setTimeout(() => setActionDone(null), 2500);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[1.75rem] font-bold text-[var(--color-charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
          Disputes
        </h1>
        <p className="mt-1 text-[var(--color-text-muted)]">
          {counts.open} open · {counts.investigating} investigating
        </p>
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
          { label: "Open", value: counts.open.toString(), color: "text-red-600", accent: "border-red-200 bg-red-50/50" },
          { label: "Investigating", value: counts.investigating.toString(), color: "text-amber-600", accent: "border-amber-200 bg-amber-50/50" },
          { label: "Resolved", value: counts.resolved.toString(), color: "text-green-600", accent: "border-green-200 bg-green-50/50" },
          { label: "Total", value: disputes.length.toString(), color: "text-[var(--color-charcoal)]", accent: "border-[var(--color-border-light)] bg-white" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-2xl border p-4 ${stat.accent}`}>
            <p className="text-xs text-[var(--color-text-light)] mb-1">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-1 rounded-xl bg-white p-1 shadow-sm border border-[var(--color-border-light)] w-fit">
        {([
          { key: "all" as FilterStatus, label: "All" },
          { key: "open" as FilterStatus, label: "Open" },
          { key: "investigating" as FilterStatus, label: "Investigating" },
          { key: "resolved" as FilterStatus, label: "Resolved" },
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

      {/* Dispute cards */}
      <div className="space-y-3">
        {filtered.map((dispute, i) => {
          const config = statusConfig[dispute.status as DisputeStatus] ?? statusConfig.open;
          const pConfig = priorityConfig[dispute.priority] ?? priorityConfig.medium;
          const isExpanded = expandedId === dispute.id;

          return (
            <motion.div
              key={dispute.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`rounded-2xl border bg-white overflow-hidden ${
                dispute.priority === "high" && dispute.status === "open"
                  ? "border-red-200 ring-1 ring-red-100"
                  : "border-[var(--color-border-light)]"
              }`}
            >
              {/* Header row */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : dispute.id)}
                className="w-full flex items-start justify-between p-5 text-left hover:bg-[var(--color-cream)]/30 transition-colors cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-mono text-[var(--color-text-light)]">{dispute.display_id}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${config.bg} ${config.color}`}>
                      <span className={`h-1 w-1 rounded-full ${config.dot}`} />
                      {config.label}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${pConfig.bg} ${pConfig.color}`}>
                      {pConfig.label}
                    </span>
                  </div>
                  <h3 className="font-semibold text-[var(--color-charcoal)]">{dispute.reason}</h3>
                  <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
                    {dispute.errand?.item_description ?? "—"} · {dispute.errand?.display_id ?? "—"} · Filed {formatDate(dispute.created_at)}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-[var(--color-text-light)]">
                    <span>Filed by: {dispute.filer?.full_name ?? "Unknown"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className={`text-[var(--color-text-light)] transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </button>

              {/* Expanded detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-[var(--color-border-light)] overflow-hidden"
                  >
                    <div className="p-5 space-y-4">
                      {/* Description */}
                      <div>
                        <p className="text-xs font-medium text-[var(--color-text-light)] mb-1 uppercase tracking-wider">Description</p>
                        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{dispute.description}</p>
                      </div>

                      {/* Evidence */}
                      {dispute.evidence.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-[var(--color-text-light)] mb-2 uppercase tracking-wider">Evidence ({dispute.evidence.length})</p>
                          <div className="flex flex-wrap gap-2">
                            {dispute.evidence.map((ev) => (
                              <div key={ev.id} className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border-light)] bg-[var(--color-cream)] px-3 py-2 text-xs text-[var(--color-text-muted)]">
                                {evidenceIcons[ev.type] ?? evidenceIcons.text}
                                {ev.label}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Resolution actions */}
                      {dispute.status !== "resolved" && (
                        <div className="pt-3 border-t border-[var(--color-border-light)]">
                          <p className="text-xs font-medium text-[var(--color-text-light)] mb-3 uppercase tracking-wider">Resolution</p>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleResolve(dispute.id, "full_refund", `${dispute.display_id}: Full refund issued`)}
                              disabled={loading}
                              className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Full Refund
                            </button>
                            <button
                              onClick={() => handleResolve(dispute.id, "partial_refund", `${dispute.display_id}: Partial refund issued`)}
                              disabled={loading}
                              className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Partial Refund
                            </button>
                            <button
                              onClick={() => handleResolve(dispute.id, "favour_runner", `${dispute.display_id}: Resolved in favour of runner`)}
                              disabled={loading}
                              className="rounded-lg border border-[var(--color-border-light)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Favour Runner
                            </button>
                          </div>
                        </div>
                      )}

                      {dispute.status === "resolved" && (
                        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3">
                          <p className="text-sm text-green-700 font-medium">✓ Resolved — {dispute.resolution ?? "Decision made"}</p>
                          {dispute.resolved_at && (
                            <p className="text-xs text-green-600 mt-0.5">Resolved on {formatDate(dispute.resolved_at)}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-[var(--color-text-muted)]">
            No disputes matching this filter
          </div>
        )}
      </div>
    </div>
  );
}
