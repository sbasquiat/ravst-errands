"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { updateProfile, updateNotificationPreferences, signOut } from "@/lib/supabase/actions";
import type { Profile, NotificationPreferences } from "@/types/database";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface SettingsFormProps {
  profile: Profile;
  notificationPreferences: NotificationPreferences | null;
}

export default function SettingsForm({ profile, notificationPreferences }: SettingsFormProps) {
  const nameParts = (profile.full_name ?? "").split(" ");
  const [firstName, setFirstName] = useState(nameParts[0] ?? "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");

  const [notifications, setNotifications] = useState({
    push: notificationPreferences?.push_enabled ?? true,
    sms: notificationPreferences?.sms_enabled ?? true,
    email: notificationPreferences?.email_enabled ?? false,
    marketing: notificationPreferences?.promotions ?? false,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setError("");

    const fullName = `${firstName} ${lastName}`.trim();

    const [profileRes, notifRes] = await Promise.all([
      updateProfile({ full_name: fullName, phone }),
      updateNotificationPreferences({
        push_enabled: notifications.push,
        sms_enabled: notifications.sms,
        email_enabled: notifications.email,
        promotions: notifications.marketing,
      }),
    ]);

    setSaving(false);

    if (profileRes.error || notifRes.error) {
      setError(profileRes.error ?? notifRes.error ?? "Failed to save");
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const initials = getInitials(`${firstName} ${lastName}`);
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-IE", { month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-2xl">
      <h1
        className="text-[1.75rem] font-bold text-[var(--color-charcoal)] mb-8"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Settings
      </h1>

      <div className="space-y-8">
        {/* Profile */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6"
        >
          <h2 className="text-base font-semibold text-[var(--color-charcoal)] mb-5">Profile</h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-copper)]/10 text-lg font-bold text-[var(--color-copper)]">
              {initials}
            </div>
            <div>
              <p className="font-semibold text-[var(--color-charcoal)]">{firstName} {lastName}</p>
              <p className="text-sm text-[var(--color-text-muted)]">Customer since {memberSince}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">First name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border-light)] bg-[var(--color-cream)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-copper)]/20 focus:border-[var(--color-copper)]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Last name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border-light)] bg-[var(--color-cream)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-copper)]/20 focus:border-[var(--color-copper)]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Email</label>
              <input
                type="text"
                value={profile.email}
                disabled
                className="w-full rounded-xl border border-[var(--color-border-light)] bg-gray-50 px-4 py-2.5 text-sm text-[var(--color-text-light)] cursor-not-allowed"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border-light)] bg-[var(--color-cream)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-copper)]/20 focus:border-[var(--color-copper)]"
              />
            </div>
          </div>
        </motion.section>

        {/* Notification preferences */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6"
        >
          <h2 className="text-base font-semibold text-[var(--color-charcoal)] mb-5">Notifications</h2>
          <div className="space-y-4">
            {[
              { key: "push" as const, label: "Push notifications", desc: "Real-time updates on your errands" },
              { key: "sms" as const, label: "SMS notifications", desc: "Text messages for key updates" },
              { key: "email" as const, label: "Email notifications", desc: "Booking confirmations and receipts" },
              { key: "marketing" as const, label: "Marketing emails", desc: "Deals, tips and product updates" },
            ].map((pref) => (
              <div key={pref.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-charcoal)]">{pref.label}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{pref.desc}</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, [pref.key]: !notifications[pref.key] })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    notifications[pref.key] ? "bg-[var(--color-copper)]" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                      notifications[pref.key] ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Data & Privacy */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6"
        >
          <h2 className="text-base font-semibold text-[var(--color-charcoal)] mb-2">Data &amp; Privacy</h2>
          <p className="text-xs text-[var(--color-text-muted)] mb-4">
            Under GDPR, you have the right to export or delete your personal data.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/api/gdpr/export"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border-light)] px-4 py-2.5 text-sm font-medium text-[var(--color-charcoal)] hover:bg-[var(--color-cream)] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export my data
            </a>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
              Delete my account
            </button>
          </div>
        </motion.section>

        {/* Account */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6"
        >
          <h2 className="text-base font-semibold text-[var(--color-charcoal)] mb-3">Account</h2>
          <button
            onClick={() => signOut()}
            className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors cursor-pointer"
          >
            Sign out
          </button>
        </motion.section>

        {/* Delete Account Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <DeleteAccountModal
              onClose={() => setShowDeleteModal(false)}
            />
          )}
        </AnimatePresence>

        {/* Error / Save */}
        {error && (
          <p className="text-center text-sm text-red-600">{error}</p>
        )}

        <div className="flex justify-end pb-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saved ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Saved!
              </>
            ) : saving ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Delete Account Modal
// ============================================

function DeleteAccountModal({ onClose }: { onClose: () => void }) {
  const [confirmation, setConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const isConfirmed = confirmation === "DELETE MY ACCOUNT";

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch("/api/gdpr/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation }),
      });

      const data = await res.json();

      if (!res.ok) {
        setDeleteError(data.error || "Failed to delete account");
        setDeleting(false);
        return;
      }

      toast.success("Account deleted. Redirecting...");
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch {
      setDeleteError("Something went wrong. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <h3 className="text-lg font-semibold text-[var(--color-charcoal)] mb-1">
          Delete your account
        </h3>
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          This will permanently delete your account, errands, messages, and all associated data.
          This action cannot be undone.
        </p>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">
            Type <span className="font-bold text-red-600">DELETE MY ACCOUNT</span> to confirm
          </label>
          <input
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="DELETE MY ACCOUNT"
            className="w-full rounded-xl border border-[var(--color-border-light)] bg-[var(--color-cream)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
          />
        </div>

        {deleteError && (
          <p className="mb-4 text-sm text-red-600">{deleteError}</p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-[var(--color-border-light)] px-4 py-2.5 text-sm font-medium text-[var(--color-charcoal)] hover:bg-[var(--color-cream)] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!isConfirmed || deleting}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {deleting ? (
              <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              "Delete permanently"
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
