"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Profile } from "@/types/database";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IE", { month: "short", year: "numeric" });
}

interface CustomerWithStats extends Profile {
  errand_count: number;
  total_spent: number;
  dispute_count: number;
}

interface AdminCustomersProps {
  customers: CustomerWithStats[];
}

export default function AdminCustomers({ customers }: AdminCustomersProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "spent" | "jobs">("recent");

  let filtered = customers.filter((c) => {
    if (search) {
      const s = search.toLowerCase();
      if (
        !(c.full_name ?? "").toLowerCase().includes(s) &&
        !(c.email ?? "").toLowerCase().includes(s)
      ) return false;
    }
    return true;
  });

  if (sortBy === "spent") filtered = [...filtered].sort((a, b) => b.total_spent - a.total_spent);
  if (sortBy === "jobs") filtered = [...filtered].sort((a, b) => b.errand_count - a.errand_count);

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[1.75rem] font-bold text-[var(--color-charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
            Customers
          </h1>
          <p className="mt-1 text-[var(--color-text-muted)]">{totalCustomers} registered</p>
        </div>

        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-light)]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-[var(--color-border-light)] bg-white pl-9 pr-4 py-2.5 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 transition-all"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { label: "Total Customers", value: totalCustomers.toString() },
          { label: "With Jobs", value: customers.filter((c) => c.errand_count > 0).length.toString() },
          { label: "Total Revenue", value: `€${totalRevenue.toFixed(2)}` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[var(--color-border-light)] bg-white p-4">
            <p className="text-xs text-[var(--color-text-light)] mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-[var(--color-charcoal)]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Sort */}
      <div className="mb-4 flex gap-1 rounded-xl bg-white p-1 shadow-sm border border-[var(--color-border-light)] w-fit">
        {([
          { key: "recent" as const, label: "Most Recent" },
          { key: "spent" as const, label: "Top Spenders" },
          { key: "jobs" as const, label: "Most Jobs" },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSortBy(tab.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              sortBy === tab.key
                ? "bg-[var(--color-charcoal)] text-white shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Customer table */}
      <div className="rounded-2xl border border-[var(--color-border-light)] bg-white overflow-hidden">
        <div className="hidden lg:grid grid-cols-12 gap-2 px-5 py-3 text-[11px] font-medium text-[var(--color-text-light)] uppercase tracking-wider border-b border-[var(--color-border-light)] bg-[#fafaf8]">
          <div className="col-span-3">Customer</div>
          <div className="col-span-3">Contact</div>
          <div className="col-span-1">Jobs</div>
          <div className="col-span-2">Total Spent</div>
          <div className="col-span-1">Disputes</div>
          <div className="col-span-2">Joined</div>
        </div>

        <div className="divide-y divide-[var(--color-border-light)]">
          {filtered.map((customer, i) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              className="lg:grid grid-cols-12 gap-2 px-5 py-4 hover:bg-[var(--color-cream)]/50 transition-colors"
            >
              <div className="col-span-3 flex items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-copper)]/10 text-xs font-semibold text-[var(--color-copper)]">
                  {getInitials(customer.full_name ?? "?")}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--color-charcoal)] truncate">{customer.full_name}</p>
                </div>
              </div>
              <div className="col-span-3">
                <p className="text-sm text-[var(--color-text-muted)] truncate">{customer.email}</p>
                <p className="text-xs text-[var(--color-text-light)]">{customer.phone ?? "—"}</p>
              </div>
              <div className="col-span-1">
                <span className="text-sm font-medium text-[var(--color-charcoal)]">{customer.errand_count}</span>
              </div>
              <div className="col-span-2">
                <span className="text-sm font-bold text-[var(--color-charcoal)]">€{customer.total_spent.toFixed(2)}</span>
              </div>
              <div className="col-span-1">
                {customer.dispute_count > 0 ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-50 text-[10px] font-bold text-red-600 px-1.5">
                    {customer.dispute_count}
                  </span>
                ) : (
                  <span className="text-xs text-[var(--color-text-light)]">0</span>
                )}
              </div>
              <div className="col-span-2">
                <span className="text-xs text-[var(--color-text-light)]">{formatDate(customer.created_at)}</span>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="py-16 text-center text-sm text-[var(--color-text-muted)]">
              No customers found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
