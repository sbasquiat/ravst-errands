"use client";

import { useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AddressInput from "@/components/booking/AddressInput";
import TimeSlotPicker from "@/components/booking/TimeSlotPicker";
import ItemDetails from "@/components/booking/ItemDetails";
import QuoteDisplay from "@/components/booking/QuoteDisplay";

const typeLabels: Record<string, string> = {
  returns: "Returns & Drop-offs",
  handoffs: "Pickup → Drop Handoffs",
  collect: "Queue & Collect",
};

const typeColors: Record<string, string> = {
  returns: "var(--color-copper)",
  handoffs: "var(--color-forest)",
  collect: "#7c3aed",
};

const steps = [
  { id: "locations", label: "Locations" },
  { id: "schedule", label: "Schedule" },
  { id: "details", label: "Details" },
  { id: "review", label: "Review" },
];

export default function BookingWizardPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type: errandType } = use(params);
  const [currentStep, setCurrentStep] = useState(0);

  // Location state
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [extraStops, setExtraStops] = useState<string[]>([]);
  const [locationErrors, setLocationErrors] = useState<Record<string, string>>({});

  // Schedule state
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [scheduleError, setScheduleError] = useState("");

  // Item details state
  const [itemValues, setItemValues] = useState<Record<string, string>>({});
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});

  // Loading
  const [loading, setLoading] = useState(false);

  const totalStops = 2 + extraStops.length;

  const validateStep = () => {
    if (currentStep === 0) {
      const errs: Record<string, string> = {};
      if (!pickup.trim()) errs.pickup = "Pickup address is required";
      if (!dropoff.trim()) errs.dropoff = "Drop-off address is required";
      extraStops.forEach((s, i) => {
        if (!s.trim()) errs[`stop-${i}`] = "Address required or remove this stop";
      });
      setLocationErrors(errs);
      return Object.keys(errs).length === 0;
    }
    if (currentStep === 1) {
      if (!selectedDate || !selectedSlot) {
        setScheduleError("Please select a date and time slot");
        return false;
      }
      setScheduleError("");
      return true;
    }
    if (currentStep === 2) {
      const errs: Record<string, string> = {};
      if (!itemValues.itemDescription?.trim()) errs.itemDescription = "Please describe the item";
      if (errandType === "returns" && !itemValues.packageSize) errs.packageSize = "Select a package size";
      if (errandType === "handoffs" && !itemValues.recipientName?.trim()) errs.recipientName = "Recipient name is required";
      if (errandType === "collect" && !itemValues.orderNumber?.trim()) errs.orderNumber = "Order number is required";
      if (errandType === "collect" && !itemValues.collectionName?.trim()) errs.collectionName = "Collection name is required";
      setItemErrors(errs);
      return Object.keys(errs).length === 0;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      window.location.href = "/book/confirm";
    }, 800);
  };

  const addStop = () => {
    if (extraStops.length < 1) {
      setExtraStops([...extraStops, ""]);
    }
  };

  const removeStop = (index: number) => {
    setExtraStops(extraStops.filter((_, i) => i !== index));
  };

  const color = typeColors[errandType] || "var(--color-copper)";

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm">
        <a href="/book" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
          Book
        </a>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M6 4l4 4-4 4" stroke="var(--color-text-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-medium" style={{ color }}>
          {typeLabels[errandType] || errandType}
        </span>
      </div>

      {/* Progress steps */}
      <div className="mb-10">
        <div className="flex items-center gap-1">
          {steps.map((step, i) => (
            <div key={step.id} className="flex flex-1 items-center gap-1">
              <div className="flex flex-1 flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                    i < currentStep
                      ? "bg-[var(--color-charcoal)] text-white"
                      : i === currentStep
                        ? "text-white shadow-md"
                        : "border border-[var(--color-border)] bg-white text-[var(--color-text-light)]"
                  }`}
                  style={i === currentStep ? { backgroundColor: color } : {}}
                >
                  {i < currentStep ? (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={`mt-1.5 text-[10px] font-medium transition-colors ${
                  i <= currentStep ? "text-[var(--color-text)]" : "text-[var(--color-text-light)]"
                }`}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-px flex-1 -mt-4 transition-colors ${
                  i < currentStep ? "bg-[var(--color-charcoal)]" : "bg-[var(--color-border-light)]"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main content — 2 column on desktop */}
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Left: Form steps */}
        <div className="flex-1 lg:max-w-[580px]">
          <AnimatePresence mode="wait">
            {/* Step 1: Locations */}
            {currentStep === 0 && (
              <motion.div
                key="locations"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h2
                  className="mb-6 text-xl font-bold text-[var(--color-charcoal)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Where to?
                </h2>

                <AddressInput
                  label="Pickup address"
                  placeholder="Where should the runner pick up?"
                  value={pickup}
                  onChange={(v) => { setPickup(v); setLocationErrors((e) => ({ ...e, pickup: "" })); }}
                  error={locationErrors.pickup}
                  icon="pickup"
                />

                {/* Extra stops */}
                {extraStops.map((stop, i) => (
                  <div key={i} className="relative">
                    <AddressInput
                      label={`Stop ${i + 2}`}
                      placeholder="Additional stop address"
                      value={stop}
                      onChange={(v) => {
                        const updated = [...extraStops];
                        updated[i] = v;
                        setExtraStops(updated);
                        setLocationErrors((e) => ({ ...e, [`stop-${i}`]: "" }));
                      }}
                      error={locationErrors[`stop-${i}`]}
                      icon="stop"
                    />
                    <button
                      type="button"
                      onClick={() => removeStop(i)}
                      className="absolute right-0 top-0 text-xs text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <AddressInput
                  label="Drop-off address"
                  placeholder="Where should the runner deliver?"
                  value={dropoff}
                  onChange={(v) => { setDropoff(v); setLocationErrors((e) => ({ ...e, dropoff: "" })); }}
                  error={locationErrors.dropoff}
                  icon="dropoff"
                />

                {extraStops.length < 1 && (
                  <button
                    type="button"
                    onClick={addStop}
                    className="flex items-center gap-2 text-sm font-medium text-[var(--color-copper)] hover:text-[var(--color-copper-hover)] transition-colors cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                    Add a stop (up to 3 total)
                  </button>
                )}
              </motion.div>
            )}

            {/* Step 2: Schedule */}
            {currentStep === 1 && (
              <motion.div
                key="schedule"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.3 }}
              >
                <h2
                  className="mb-6 text-xl font-bold text-[var(--color-charcoal)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Pick a time
                </h2>

                <TimeSlotPicker
                  selectedDate={selectedDate}
                  onDateChange={(d) => { setSelectedDate(d); setScheduleError(""); }}
                  selectedSlot={selectedSlot}
                  onSlotChange={(s) => { setSelectedSlot(s); setScheduleError(""); }}
                  error={scheduleError}
                />
              </motion.div>
            )}

            {/* Step 3: Details */}
            {currentStep === 2 && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.3 }}
              >
                <h2
                  className="mb-6 text-xl font-bold text-[var(--color-charcoal)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Tell us about the errand
                </h2>

                <ItemDetails
                  errandType={errandType}
                  values={itemValues}
                  onChange={(key, val) => {
                    setItemValues((v) => ({ ...v, [key]: val }));
                    setItemErrors((e) => ({ ...e, [key]: "" }));
                  }}
                  errors={itemErrors}
                />
              </motion.div>
            )}

            {/* Step 4: Review */}
            {currentStep === 3 && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.3 }}
              >
                <h2
                  className="mb-6 text-xl font-bold text-[var(--color-charcoal)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Review your errand
                </h2>

                <div className="space-y-4">
                  {/* Locations summary */}
                  <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-light)]">Locations</h4>
                      <button onClick={() => setCurrentStep(0)} className="text-xs font-medium text-[var(--color-copper)] hover:underline cursor-pointer">Edit</button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-green-400" />
                        <span className="text-[var(--color-text)]">{pickup}</span>
                      </div>
                      {extraStops.map((s, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="mt-0.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[var(--color-copper)]" />
                          <span className="text-[var(--color-text)]">{s}</span>
                        </div>
                      ))}
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-red-400" />
                        <span className="text-[var(--color-text)]">{dropoff}</span>
                      </div>
                    </div>
                  </div>

                  {/* Schedule summary */}
                  <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-light)]">Schedule</h4>
                      <button onClick={() => setCurrentStep(1)} className="text-xs font-medium text-[var(--color-copper)] hover:underline cursor-pointer">Edit</button>
                    </div>
                    <p className="text-sm text-[var(--color-text)]">
                      {selectedDate && new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IE", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                      {" · "}
                      {selectedSlot.replace("-", " – ")}
                    </p>
                  </div>

                  {/* Details summary */}
                  <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-light)]">Errand Details</h4>
                      <button onClick={() => setCurrentStep(2)} className="text-xs font-medium text-[var(--color-copper)] hover:underline cursor-pointer">Edit</button>
                    </div>
                    <div className="space-y-1 text-sm text-[var(--color-text)]">
                      <p><span className="text-[var(--color-text-muted)]">Item:</span> {itemValues.itemDescription}</p>
                      {itemValues.packageSize && <p><span className="text-[var(--color-text-muted)]">Size:</span> {itemValues.packageSize}</p>}
                      {itemValues.recipientName && <p><span className="text-[var(--color-text-muted)]">Recipient:</span> {itemValues.recipientName}</p>}
                      {itemValues.orderNumber && <p><span className="text-[var(--color-text-muted)]">Order #:</span> {itemValues.orderNumber}</p>}
                      {itemValues.specialInstructions && <p><span className="text-[var(--color-text-muted)]">Notes:</span> {itemValues.specialInstructions}</p>}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="mt-8 flex items-center gap-3">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-white px-5 py-3 text-sm font-medium text-[var(--color-text)] transition-all hover:bg-[var(--color-cream)] cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary flex-1 justify-center sm:flex-none"
              >
                Continue
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className="btn-primary flex-1 justify-center sm:flex-none disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    Confirm &amp; Book
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right: Quote sidebar (visible from step 1+) */}
        <div className="lg:w-[320px] lg:flex-shrink-0">
          {currentStep >= 0 && (
            <div className="sticky top-24">
              <QuoteDisplay
                errandType={errandType}
                stops={totalStops}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
