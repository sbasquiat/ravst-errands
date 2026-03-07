"use client";

import { useState } from "react";
import { motion } from "framer-motion";

/* ── Mock data ─────────────────────────────────────────── */

const mockProfile = {
  name: "Cian Murphy",
  initials: "CM",
  email: "cian.murphy@email.com",
  phone: "+353 87 123 4567",
  bio: "Reliable runner covering Dublin city centre. Cyclist with great knowledge of the city.",
  memberSince: "January 2026",
  rating: 4.9,
  jobsCompleted: 142,
  transport: "bicycle",
};

const documents = [
  { name: "Photo ID (Passport)", status: "verified" as const, uploadedDate: "15 Jan 2026" },
  { name: "Proof of Address", status: "verified" as const, uploadedDate: "15 Jan 2026" },
  { name: "Garda Vetting", status: "verified" as const, uploadedDate: "18 Jan 2026" },
  { name: "Insurance Certificate", status: "expiring" as const, uploadedDate: "20 Jan 2026", expiresDate: "20 Apr 2026" },
];

const availabilityZones = [
  { name: "Dublin City Centre", active: true },
  { name: "Dublin 2 (Southside)", active: true },
  { name: "Dublin 4 (Ballsbridge)", active: true },
  { name: "Dublin 6 (Rathmines)", active: false },
  { name: "Dublin 8 (Liberties)", active: false },
];

const docStatusConfig = {
  verified: { label: "Verified", color: "text-green-600", bg: "bg-green-50", icon: "✓" },
  pending: { label: "Pending", color: "text-amber-600", bg: "bg-amber-50", icon: "•••" },
  expiring: { label: "Expiring Soon", color: "text-red-600", bg: "bg-red-50", icon: "!" },
  required: { label: "Required", color: "text-red-600", bg: "bg-red-50", icon: "↑" },
};

/* ── Component ─────────────────────────────────────────── */

export default function RunnerSettingsPage() {
  const [profile, setProfile] = useState(mockProfile);
  const [zones, setZones] = useState(availabilityZones);
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    newJobs: true,
    jobUpdates: true,
    earnings: true,
    marketing: false,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleZone = (index: number) => {
    setZones((prev) =>
      prev.map((z, i) => (i === index ? { ...z, active: !z.active } : z))
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[1.75rem] font-bold text-[var(--color-charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
          Settings
        </h1>
        <p className="mt-1 text-[var(--color-text-muted)]">Manage your runner profile and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6"
          >
            <h3 className="text-sm font-semibold text-[var(--color-charcoal)] mb-5">Profile</h3>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-forest)]/10 text-lg font-bold text-[var(--color-forest)]">
                {profile.initials}
              </div>
              <div>
                <p className="font-semibold text-[var(--color-charcoal)]">{profile.name}</p>
                <p className="text-sm text-[var(--color-text-muted)]">Runner since {profile.memberSince}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-[var(--color-text-light)]">
                  <span className="flex items-center gap-0.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--color-forest)" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    {profile.rating}
                  </span>
                  <span>{profile.jobsCompleted} jobs completed</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-light)] mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full rounded-lg border border-[var(--color-border-light)] bg-[var(--color-cream)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-forest)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-light)] mb-1.5">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full rounded-lg border border-[var(--color-border-light)] bg-[var(--color-cream)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-forest)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-light)] mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full rounded-lg border border-[var(--color-border-light)] bg-[var(--color-cream)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-forest)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-light)] mb-1.5">Transport Mode</label>
                <div className="flex gap-2">
                  {[
                    { key: "bicycle", label: "Bicycle", icon: "🚲" },
                    { key: "walking", label: "Walking", icon: "🚶" },
                    { key: "car", label: "Car", icon: "🚗" },
                  ].map((mode) => (
                    <button
                      key={mode.key}
                      onClick={() => setProfile({ ...profile, transport: mode.key })}
                      className={`flex-1 rounded-lg border py-2.5 text-center text-xs font-medium transition-all cursor-pointer ${
                        profile.transport === mode.key
                          ? "border-[var(--color-forest)] bg-[var(--color-forest)]/[0.06] text-[var(--color-forest)]"
                          : "border-[var(--color-border-light)] text-[var(--color-text-muted)] hover:border-[var(--color-border)]"
                      }`}
                    >
                      <span className="block text-base mb-0.5">{mode.icon}</span>
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-[var(--color-text-light)] mb-1.5">Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-[var(--color-border-light)] bg-[var(--color-cream)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-forest)] transition-colors resize-none"
              />
            </div>
          </motion.div>

          {/* Documents */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6"
          >
            <h3 className="text-sm font-semibold text-[var(--color-charcoal)] mb-5">Documents & Verification</h3>

            <div className="space-y-3">
              {documents.map((doc) => {
                const config = docStatusConfig[doc.status];
                return (
                  <div
                    key={doc.name}
                    className={`flex items-center justify-between rounded-xl border p-4 ${
                      doc.status === "expiring"
                        ? "border-red-200 bg-red-50/50"
                        : "border-[var(--color-border-light)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-cream)]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--color-charcoal)]">{doc.name}</p>
                        <p className="text-xs text-[var(--color-text-light)]">
                          Uploaded {doc.uploadedDate}
                          {doc.expiresDate && <span className="text-red-500"> · Expires {doc.expiresDate}</span>}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium ${config.bg} ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <button className="mt-4 flex items-center gap-1.5 text-sm font-medium text-[var(--color-forest)] hover:underline cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Upload new document
            </button>
          </motion.div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Availability zones */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5"
          >
            <h3 className="text-sm font-semibold text-[var(--color-charcoal)] mb-4">Availability Zones</h3>
            <p className="text-xs text-[var(--color-text-light)] mb-4">Choose the areas you want to receive jobs from</p>

            <div className="space-y-2">
              {zones.map((zone, i) => (
                <div key={zone.name} className="flex items-center justify-between rounded-lg border border-[var(--color-border-light)] px-3 py-2.5">
                  <span className={`text-sm ${zone.active ? "text-[var(--color-charcoal)] font-medium" : "text-[var(--color-text-muted)]"}`}>
                    {zone.name}
                  </span>
                  <button
                    onClick={() => toggleZone(i)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                      zone.active ? "bg-[var(--color-forest)]" : "bg-gray-200"
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${zone.active ? "translate-x-4.5" : "translate-x-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5"
          >
            <h3 className="text-sm font-semibold text-[var(--color-charcoal)] mb-4">Notifications</h3>

            <div className="space-y-3">
              {[
                { key: "newJobs" as const, label: "New job alerts", desc: "Get notified when nearby jobs are posted" },
                { key: "jobUpdates" as const, label: "Job updates", desc: "Status changes on your active jobs" },
                { key: "earnings" as const, label: "Earnings & payouts", desc: "Payout confirmations and summaries" },
                { key: "marketing" as const, label: "Tips & promotions", desc: "Bonus opportunities and running tips" },
              ].map((item) => (
                <div key={item.key} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-charcoal)]">{item.label}</p>
                    <p className="text-xs text-[var(--color-text-light)]">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                    className={`relative mt-0.5 inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                      notifications[item.key] ? "bg-[var(--color-forest)]" : "bg-gray-200"
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${notifications[item.key] ? "translate-x-4.5" : "translate-x-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Rating */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl border border-[var(--color-forest)]/20 bg-[var(--color-forest)]/[0.03] p-5"
          >
            <h3 className="text-sm font-semibold text-[var(--color-charcoal)] mb-3">Your Rating</h3>
            <div className="text-center">
              <p className="text-4xl font-bold text-[var(--color-forest)]">{profile.rating}</p>
              <div className="mt-1 flex justify-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < Math.round(profile.rating) ? "var(--color-forest)" : "#e5e7eb"} stroke="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="mt-2 text-xs text-[var(--color-text-light)]">Based on {profile.jobsCompleted} completed jobs</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Save button */}
      <div className="mt-8 flex items-center justify-end gap-3">
        {saved && (
          <motion.span
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm font-medium text-green-600"
          >
            ✓ Saved!
          </motion.span>
        )}
        <button
          onClick={handleSave}
          className="rounded-xl bg-[var(--color-forest)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-forest)]/90 transition-colors cursor-pointer"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
