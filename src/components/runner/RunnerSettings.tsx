"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { updateProfile, updateRunnerProfile, updateNotificationPreferences } from "@/lib/supabase/actions";
import type { Profile, RunnerProfile, RunnerDocument, NotificationPreferences, Enums } from "@/types/database";

/* ── Config ─────────────────────────────────────────── */

const docTypeLabels: Record<string, string> = {
  id_verification: "Photo ID (Passport)",
  background_check: "Garda Vetting",
  insurance: "Insurance Certificate",
  transport_cert: "Transport Certificate",
};

const docStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  verified: { label: "Verified", color: "text-green-600", bg: "bg-green-50" },
  pending: { label: "Pending", color: "text-amber-600", bg: "bg-amber-50" },
  expired: { label: "Expired", color: "text-red-600", bg: "bg-red-50" },
  rejected: { label: "Rejected", color: "text-red-600", bg: "bg-red-50" },
  expiring: { label: "Expiring Soon", color: "text-red-600", bg: "bg-red-50" },
};

const ALL_ZONES = [
  // Dublin City — postal districts
  "Dublin City Centre (D1)",
  "Dublin 2 (St Stephen's Green)",
  "Dublin 3 (Clontarf)",
  "Dublin 4 (Ballsbridge)",
  "Dublin 5 (Raheny)",
  "Dublin 6 (Rathmines)",
  "Dublin 6W (Terenure)",
  "Dublin 7 (Phibsborough)",
  "Dublin 8 (Portobello)",
  "Dublin 9 (Drumcondra)",
  "Dublin 10 (Ballyfermot)",
  "Dublin 11 (Finglas)",
  "Dublin 12 (Drimnagh)",
  "Dublin 13 (Donaghmede)",
  "Dublin 14 (Dundrum)",
  "Dublin 15 (Blanchardstown)",
  "Dublin 16 (Ballinteer)",
  "Dublin 17 (Coolock)",
  "Dublin 18 (Sandyford)",
  "Dublin 20 (Palmerstown)",
  "Dublin 22 (Clondalkin)",
  "Dublin 24 (Tallaght)",
  // Greater Dublin
  "Dún Laoghaire-Rathdown",
  "Swords & North County",
  "Howth & Sutton",
  "Lucan & West Dublin",
  "Bray & North Wicklow",
];

/* ── Helpers ────────────────────────────────────────── */

function getDocDisplayStatus(doc: RunnerDocument): string {
  if (doc.status === "verified" && doc.expires_at) {
    const expiresAt = new Date(doc.expires_at);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) return "expiring";
  }
  return doc.status;
}

function formatDocDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" });
}

/* ── Props ──────────────────────────────────────────── */

interface RunnerSettingsProps {
  profile: Profile;
  runnerProfile: RunnerProfile;
  documents: RunnerDocument[];
  notificationPrefs: NotificationPreferences | null;
  memberSince: string;
  stripeConnectAccountId: string | null;
}

/* ── Component ──────────────────────────────────────── */

export default function RunnerSettings({
  profile,
  runnerProfile,
  documents,
  notificationPrefs,
  memberSince,
  stripeConnectAccountId,
}: RunnerSettingsProps) {
  const [name, setName] = useState(profile.full_name);
  const [email] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [transport, setTransport] = useState<Enums<"transport_mode">>(runnerProfile.transport_mode);
  const [zones, setZones] = useState<string[]>(runnerProfile.availability_zones);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [hasConnectAccount, setHasConnectAccount] = useState(!!stripeConnectAccountId);

  const [notifications, setNotifications] = useState({
    push_enabled: notificationPrefs?.push_enabled ?? true,
    job_updates: notificationPrefs?.job_updates ?? true,
    email_enabled: notificationPrefs?.email_enabled ?? true,
    promotions: notificationPrefs?.promotions ?? false,
  });

  const initials = profile.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const toggleZone = (zoneName: string) => {
    setZones((prev) =>
      prev.includes(zoneName)
        ? prev.filter((z) => z !== zoneName)
        : [...prev, zoneName]
    );
  };

  const handleConnectBank = async () => {
    setConnectLoading(true);
    try {
      // Create account if not exists
      if (!hasConnectAccount) {
        const res = await fetch("/api/stripe/connect/create-account", { method: "POST" });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Failed to create account");
          return;
        }
        setHasConnectAccount(true);
      }
      // Get onboarding link
      const res = await fetch("/api/stripe/connect/create-onboarding-link", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create onboarding link");
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error("Something went wrong");
    } finally {
      setConnectLoading(false);
    }
  };

  const handleOpenDashboard = async () => {
    setConnectLoading(true);
    try {
      const res = await fetch("/api/stripe/connect/dashboard-link", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to open dashboard");
        return;
      }
      window.open(data.url, "_blank");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setConnectLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        updateProfile({ full_name: name, phone: phone || undefined }),
        updateRunnerProfile({ transport_mode: transport, availability_zones: zones }),
        updateNotificationPreferences({
          push_enabled: notifications.push_enabled,
          job_updates: notifications.job_updates,
          email_enabled: notifications.email_enabled,
          promotions: notifications.promotions,
        }),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
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
                {initials}
              </div>
              <div>
                <p className="font-semibold text-[var(--color-charcoal)]">{profile.full_name}</p>
                <p className="text-sm text-[var(--color-text-muted)]">Runner since {memberSince}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-[var(--color-text-light)]">
                  <span className="flex items-center gap-0.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--color-forest)" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    {runnerProfile.rating.toFixed(1)}
                  </span>
                  <span>{runnerProfile.jobs_completed} jobs completed</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-light)] mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border-light)] bg-[var(--color-cream)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-forest)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-light)] mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full rounded-lg border border-[var(--color-border-light)] bg-gray-100 px-3 py-2.5 text-sm text-[var(--color-text-muted)] cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-light)] mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border-light)] bg-[var(--color-cream)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-forest)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-light)] mb-1.5">Transport Mode</label>
                <div className="flex gap-2">
                  {([
                    { key: "bicycle" as const, label: "Bicycle", icon: "🚲" },
                    { key: "walking" as const, label: "Walking", icon: "🚶" },
                    { key: "car" as const, label: "Car", icon: "🚗" },
                  ]).map((mode) => (
                    <button
                      key={mode.key}
                      onClick={() => setTransport(mode.key)}
                      className={`flex-1 rounded-lg border py-2.5 text-center text-xs font-medium transition-all cursor-pointer ${
                        transport === mode.key
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
                const displayStatus = getDocDisplayStatus(doc);
                const config = docStatusConfig[displayStatus] ?? docStatusConfig.pending;
                return (
                  <div
                    key={doc.id}
                    className={`flex items-center justify-between rounded-xl border p-4 ${
                      displayStatus === "expiring" || displayStatus === "expired"
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
                        <p className="text-sm font-medium text-[var(--color-charcoal)]">
                          {docTypeLabels[doc.type] ?? doc.type}
                        </p>
                        <p className="text-xs text-[var(--color-text-light)]">
                          Uploaded {formatDocDate(doc.uploaded_at)}
                          {doc.expires_at && (
                            <span className={displayStatus === "expiring" || displayStatus === "expired" ? "text-red-500" : ""}>
                              {" "}· Expires {formatDocDate(doc.expires_at)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium ${config.bg} ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                );
              })}

              {documents.length === 0 && (
                <p className="text-sm text-[var(--color-text-muted)] text-center py-4">No documents uploaded yet</p>
              )}
            </div>

            <button className="mt-4 flex items-center gap-1.5 text-sm font-medium text-[var(--color-forest)] hover:underline cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Upload new document
            </button>
          </motion.div>

          {/* Bank Account (Stripe Connect) */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6"
          >
            <h3 className="text-sm font-semibold text-[var(--color-charcoal)] mb-2">Bank Account</h3>
            <p className="text-xs text-[var(--color-text-light)] mb-5">
              Connect your bank account to receive payouts for completed jobs
            </p>

            {hasConnectAccount ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50/50 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">Bank account connected</p>
                    <p className="text-xs text-green-600">Payouts will be sent to your connected account</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleConnectBank}
                    disabled={connectLoading}
                    className="rounded-lg border border-[var(--color-border-light)] px-3 py-2 text-xs font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-cream)] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Update details
                  </button>
                  <button
                    onClick={handleOpenDashboard}
                    disabled={connectLoading}
                    className="rounded-lg border border-[var(--color-border-light)] px-3 py-2 text-xs font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-cream)] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    View payout dashboard
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleConnectBank}
                disabled={connectLoading}
                className="flex items-center gap-2 rounded-xl bg-[var(--color-forest)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--color-forest)]/90 transition-colors cursor-pointer disabled:opacity-60"
              >
                {connectLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                    Connect Bank Account
                  </>
                )}
              </button>
            )}
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
              {ALL_ZONES.map((zoneName) => {
                const active = zones.includes(zoneName);
                return (
                  <div key={zoneName} className="flex items-center justify-between rounded-lg border border-[var(--color-border-light)] px-3 py-2.5">
                    <span className={`text-sm ${active ? "text-[var(--color-charcoal)] font-medium" : "text-[var(--color-text-muted)]"}`}>
                      {zoneName}
                    </span>
                    <button
                      onClick={() => toggleZone(zoneName)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                        active ? "bg-[var(--color-forest)]" : "bg-gray-200"
                      }`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${active ? "translate-x-4.5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                );
              })}
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
              {([
                { key: "push_enabled" as const, label: "New job alerts", desc: "Get notified when nearby jobs are posted" },
                { key: "job_updates" as const, label: "Job updates", desc: "Status changes on your active jobs" },
                { key: "email_enabled" as const, label: "Earnings & payouts", desc: "Payout confirmations and summaries" },
                { key: "promotions" as const, label: "Tips & promotions", desc: "Bonus opportunities and running tips" },
              ]).map((item) => (
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
              <p className="text-4xl font-bold text-[var(--color-forest)]">{runnerProfile.rating.toFixed(1)}</p>
              <div className="mt-1 flex justify-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < Math.round(runnerProfile.rating) ? "var(--color-forest)" : "#e5e7eb"} stroke="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="mt-2 text-xs text-[var(--color-text-light)]">Based on {runnerProfile.jobs_completed} completed jobs</p>
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
          disabled={saving}
          className="rounded-xl bg-[var(--color-forest)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-forest)]/90 transition-colors cursor-pointer disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
