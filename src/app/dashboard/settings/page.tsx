"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    firstName: "Seun",
    lastName: "Badejo",
    email: "seun@ravst.com",
    phone: "+353 87 123 4567",
  });

  const [addresses, setAddresses] = useState([
    { id: "1", label: "Home", address: "12 Grafton Street, Dublin 2, D02 VF65", isDefault: true },
    { id: "2", label: "Office", address: "45 Pearse Street, Dublin 2, D02 YN67", isDefault: false },
  ]);

  const [notifications, setNotifications] = useState({
    push: true,
    sms: true,
    email: false,
    marketing: false,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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
              SB
            </div>
            <div>
              <p className="font-semibold text-[var(--color-charcoal)]">{profile.firstName} {profile.lastName}</p>
              <p className="text-sm text-[var(--color-text-muted)]">Customer since March 2026</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "First name", key: "firstName" as const },
              { label: "Last name", key: "lastName" as const },
              { label: "Email", key: "email" as const },
              { label: "Phone", key: "phone" as const },
            ].map((field) => (
              <div key={field.key}>
                <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">{field.label}</label>
                <input
                  type="text"
                  value={profile[field.key]}
                  onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })}
                  className="w-full rounded-xl border border-[var(--color-border-light)] bg-[var(--color-cream)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-copper)]/20 focus:border-[var(--color-copper)]"
                />
              </div>
            ))}
          </div>
        </motion.section>

        {/* Saved addresses */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-[var(--color-charcoal)]">Saved Addresses</h2>
            <button className="text-sm font-medium text-[var(--color-copper)] hover:text-[var(--color-copper-hover)] transition-colors cursor-pointer">
              + Add address
            </button>
          </div>

          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr.id} className="flex items-start justify-between gap-3 rounded-xl border border-[var(--color-border-light)] p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--color-cream)] text-[var(--color-text-muted)]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--color-charcoal)]">{addr.label}</span>
                      {addr.isDefault && (
                        <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-600">Default</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">{addr.address}</p>
                  </div>
                </div>
                <button className="text-xs text-[var(--color-text-light)] hover:text-[var(--color-text)] transition-colors cursor-pointer">
                  Edit
                </button>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Notification preferences */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
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

        {/* Save button */}
        <div className="flex justify-end pb-8">
          <button
            onClick={handleSave}
            className="btn-primary"
          >
            {saved ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Saved!
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
