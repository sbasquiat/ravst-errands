"use client";

import AuthInput from "@/components/auth/AuthInput";

interface ItemDetailsProps {
  errandType: string;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  errors?: Record<string, string>;
}

export default function ItemDetails({
  errandType,
  values,
  onChange,
  errors = {},
}: ItemDetailsProps) {
  return (
    <div className="space-y-4">
      <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
        Item &amp; errand details
      </label>

      {errandType === "returns" && (
        <>
          <AuthInput
            label="What are you returning?"
            placeholder="e.g. ASOS order, Amazon parcel"
            value={values.itemDescription || ""}
            onChange={(v) => onChange("itemDescription", v)}
            error={errors.itemDescription}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /></svg>
            }
          />
          <AuthInput
            label="Return label / tracking number"
            placeholder="Optional — attach label or share reference"
            value={values.trackingNumber || ""}
            onChange={(v) => onChange("trackingNumber", v)}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 7V4a2 2 0 012-2h2M4 17v3a2 2 0 002 2h2M16 2h2a2 2 0 012 2v3M16 22h2a2 2 0 002-2v-3" /></svg>
            }
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
              Package size
            </label>
            <div className="flex gap-2">
              {["Small (fits in hand)", "Medium (shoebox)", "Large (suitcase)"].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onChange("packageSize", size)}
                  className={`flex-1 rounded-xl px-3 py-2.5 text-xs font-medium transition-all cursor-pointer ${
                    values.packageSize === size
                      ? "bg-[var(--color-copper)] text-white"
                      : "border border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-copper)]/30"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {errors.packageSize && (
              <p className="mt-1.5 text-xs font-medium text-red-500">{errors.packageSize}</p>
            )}
          </div>
        </>
      )}

      {errandType === "handoffs" && (
        <>
          <AuthInput
            label="What's being handed off?"
            placeholder="e.g. apartment keys, signed lease"
            value={values.itemDescription || ""}
            onChange={(v) => onChange("itemDescription", v)}
            error={errors.itemDescription}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>
            }
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
              Item value
            </label>
            <div className="flex gap-2">
              {["Low value", "High value (keys, legal docs)"].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => onChange("itemValue", val)}
                  className={`flex-1 rounded-xl px-3 py-2.5 text-xs font-medium transition-all cursor-pointer ${
                    values.itemValue === val
                      ? "bg-[var(--color-forest)] text-white"
                      : "border border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-forest)]/30"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
          <AuthInput
            label="Recipient name"
            placeholder="Who should the runner hand this to?"
            value={values.recipientName || ""}
            onChange={(v) => onChange("recipientName", v)}
            error={errors.recipientName}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            }
          />
          <AuthInput
            label="Recipient phone"
            placeholder="+353 8X XXX XXXX"
            value={values.recipientPhone || ""}
            onChange={(v) => onChange("recipientPhone", v)}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" /></svg>
            }
          />
        </>
      )}

      {errandType === "collect" && (
        <>
          <AuthInput
            label="What are you collecting?"
            placeholder="e.g. Click & collect order from Argos"
            value={values.itemDescription || ""}
            onChange={(v) => onChange("itemDescription", v)}
            error={errors.itemDescription}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
            }
          />
          <AuthInput
            label="Order number / reference"
            placeholder="e.g. ORD-12345"
            value={values.orderNumber || ""}
            onChange={(v) => onChange("orderNumber", v)}
            error={errors.orderNumber}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 7V4a2 2 0 012-2h2M4 17v3a2 2 0 002 2h2M16 2h2a2 2 0 012 2v3M16 22h2a2 2 0 002-2v-3" /></svg>
            }
          />
          <AuthInput
            label="Collection name (name on the order)"
            placeholder="Name used when placing the order"
            value={values.collectionName || ""}
            onChange={(v) => onChange("collectionName", v)}
            error={errors.collectionName}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            }
          />
          <AuthInput
            label="Collection code (if any)"
            placeholder="PIN or barcode reference"
            value={values.collectionCode || ""}
            onChange={(v) => onChange("collectionCode", v)}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
            }
          />
        </>
      )}

      {/* Special instructions — all types */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
          Special instructions
          <span className="ml-1 font-normal text-[var(--color-text-light)]">(optional)</span>
        </label>
        <textarea
          value={values.specialInstructions || ""}
          onChange={(e) => onChange("specialInstructions", e.target.value)}
          placeholder="Anything the runner should know — access codes, timing notes, fragile items, etc."
          rows={3}
          className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3.5 py-3 text-[0.9375rem] text-[var(--color-text)] placeholder:text-[var(--color-text-light)] transition-all duration-200 focus:border-[var(--color-copper)] focus:shadow-[0_0_0_3px_var(--color-copper-glow)] focus:outline-none resize-none"
        />
      </div>
    </div>
  );
}
