"use client";

import { useState } from "react";
import { motion } from "framer-motion";

/* ── Types ─────────────────────────────────────────────── */

interface Customer {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  joinDate: string;
  jobsPosted: number;
  totalSpent: string;
  rating: number;
  lastActive: string;
  status: "active" | "inactive";
  disputes: number;
}

/* ── Mock data ─────────────────────────────────────────── */

const customers: Customer[] = [
  { id: "CUS-001", name: "Sarah Mitchell", avatar: "SM", email: "sarah.m@email.com", phone: "+353 87 123 4567", joinDate: "Jan 2026", jobsPosted: 14, totalSpent: "€124.80", rating: 4.8, lastActive: "Just now", status: "active", disputes: 0 },
  { id: "CUS-002", name: "James Kennedy", avatar: "JK", email: "james.k@email.com", phone: "+353 86 234 5678", joinDate: "Jan 2026", jobsPosted: 9, totalSpent: "€87.40", rating: 4.9, lastActive: "1h ago", status: "active", disputes: 0 },
  { id: "CUS-003", name: "Emily Russell", avatar: "ER", email: "emily.r@email.com", phone: "+353 85 345 6789", joinDate: "Feb 2026", jobsPosted: 7, totalSpent: "€63.20", rating: 4.7, lastActive: "3h ago", status: "active", disputes: 1 },
  { id: "CUS-004", name: "David Lynch", avatar: "DL", email: "david.l@email.com", phone: "+353 83 456 7890", joinDate: "Feb 2026", jobsPosted: 5, totalSpent: "€42.50", rating: 5.0, lastActive: "Yesterday", status: "active", disputes: 0 },
  { id: "CUS-005", name: "Fiona Brady", avatar: "FB", email: "fiona.b@email.com", phone: "+353 89 567 8901", joinDate: "Feb 2026", jobsPosted: 4, totalSpent: "€35.80", rating: 4.6, lastActive: "Yesterday", status: "active", disputes: 0 },
  { id: "CUS-006", name: "Mark Thompson", avatar: "MT", email: "mark.t@email.com", phone: "+353 87 678 9012", joinDate: "Jan 2026", jobsPosted: 11, totalSpent: "€98.70", rating: 4.3, lastActive: "2 days ago", status: "active", disputes: 2 },
  { id: "CUS-007", name: "Lisa Hennessy", avatar: "LH", email: "lisa.h@email.com", phone: "+353 86 789 0123", joinDate: "Feb 2026", jobsPosted: 3, totalSpent: "€28.40", rating: 4.9, lastActive: "3 days ago", status: "active", disputes: 0 },
  { id: "CUS-008", name: "Tom Walsh", avatar: "TW", email: "tom.w@email.com", phone: "+353 85 890 1234", joinDate: "Jan 2026", jobsPosted: 2, totalSpent: "€15.20", rating: 4.5, lastActive: "1 week ago", status: "inactive", disputes: 0 },
  { id: "CUS-009", name: "Anna Collins", avatar: "AC", email: "anna.c@email.com", phone: "+353 83 901 2345", joinDate: "Mar 2026", jobsPosted: 1, totalSpent: "€5.80", rating: 0, lastActive: "5 days ago", status: "inactive", disputes: 0 },
  { id: "CUS-010", name: "Paul Dunne", avatar: "PD", email: "paul.d@email.com", phone: "+353 89 012 3456", joinDate: "Feb 2026", jobsPosted: 6, totalSpent: "€52.30", rating: 4.7, lastActive: "Today", status: "active", disputes: 0 },
];

/* ── Component ─────────────────────────────────────────── */

export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "spent" | "jobs">("recent");

  let filtered = customers.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (sortBy === "spent") filtered = [...filtered].sort((a, b) => parseFloat(b.totalSpent.replace("€", "").replace(",", "")) - parseFloat(a.totalSpent.replace("€", "").replace(",", "")));
  if (sortBy === "jobs") filtered = [...filtered].sort((a, b) => b.jobsPosted - a.jobsPosted);

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status === "active").length;
  const totalRevenue = "€553.90";

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[1.75rem] font-bold text-[var(--color-charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
            Customers
          </h1>
          <p className="mt-1 text-[var(--color-text-muted)]">{totalCustomers} registered · {activeCustomers} active</p>
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
          { label: "Active (last 7 days)", value: activeCustomers.toString() },
          { label: "Total Revenue", value: totalRevenue },
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
        {/* Header */}
        <div className="hidden lg:grid grid-cols-12 gap-2 px-5 py-3 text-[11px] font-medium text-[var(--color-text-light)] uppercase tracking-wider border-b border-[var(--color-border-light)] bg-[#fafaf8]">
          <div className="col-span-3">Customer</div>
          <div className="col-span-2">Contact</div>
          <div className="col-span-1">Jobs</div>
          <div className="col-span-2">Total Spent</div>
          <div className="col-span-1">Rating</div>
          <div className="col-span-1">Disputes</div>
          <div className="col-span-2">Last Active</div>
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
                  {customer.avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--color-charcoal)] truncate">{customer.name}</p>
                  <p className="text-xs text-[var(--color-text-light)]">Since {customer.joinDate}</p>
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-[var(--color-text-muted)] truncate">{customer.email}</p>
                <p className="text-xs text-[var(--color-text-light)]">{customer.phone}</p>
              </div>
              <div className="col-span-1">
                <span className="text-sm font-medium text-[var(--color-charcoal)]">{customer.jobsPosted}</span>
              </div>
              <div className="col-span-2">
                <span className="text-sm font-bold text-[var(--color-charcoal)]">{customer.totalSpent}</span>
              </div>
              <div className="col-span-1">
                {customer.rating > 0 ? (
                  <span className="text-sm text-[var(--color-charcoal)]">{customer.rating} ★</span>
                ) : (
                  <span className="text-xs text-[var(--color-text-light)]">—</span>
                )}
              </div>
              <div className="col-span-1">
                {customer.disputes > 0 ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-50 text-[10px] font-bold text-red-600 px-1.5">
                    {customer.disputes}
                  </span>
                ) : (
                  <span className="text-xs text-[var(--color-text-light)]">0</span>
                )}
              </div>
              <div className="col-span-2 flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-light)]">{customer.lastActive}</span>
                <span className={`h-2 w-2 rounded-full ${customer.status === "active" ? "bg-green-500" : "bg-gray-300"}`} />
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
