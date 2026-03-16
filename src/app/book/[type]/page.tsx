"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import AddressInput from "@/components/booking/AddressInput";
import TimeSlotPicker from "@/components/booking/TimeSlotPicker";
import ItemDetails from "@/components/booking/ItemDetails";
import QuoteDisplay from "@/components/booking/QuoteDisplay";
import type { PricingBreakdown } from "@/components/booking/QuoteDisplay";
import { getStripe } from "@/lib/stripe/client";
import { calculateRouteDistance } from "@/lib/geocoding";
import { createErrand } from "@/lib/supabase/actions";
import type { Enums } from "@/types/database";

const validTypes = ["returns", "handoffs", "collect"] as const;

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
  { id: "review", label: "Review & Pay" },
];

interface Coords {
  lat: number;
  lng: number;
}

// Inner form component that has access to Stripe context
function PaymentForm({
  onSuccess,
  loading,
  setLoading,
}: {
  onSuccess: (paymentIntentId: string) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;

    setLoading(true);
    setPaymentError(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setPaymentError(error.message ?? "Payment failed");
      setLoading(false);
    } else if (paymentIntent) {
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-light)]">
          Payment method
        </p>
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {paymentError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {paymentError}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || !stripe || !elements}
        className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <>
            Confirm &amp; Authorise Card
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </>
        )}
      </button>

      <p className="text-center text-[10px] text-[var(--color-text-light)]">
        Your card will be authorised now but only charged when the errand is completed.
      </p>
    </div>
  );
}

export default function BookingWizardPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type: errandType } = use(params);
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  // Validate errand type — redirect to /book if invalid
  const isValidType = validTypes.includes(errandType as (typeof validTypes)[number]);
  useEffect(() => {
    if (!isValidType) {
      router.replace("/book");
    }
  }, [isValidType, router]);

  if (!isValidType) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
        <p className="text-[var(--color-text-muted)]">Redirecting...</p>
      </div>
    );
  }

  // Location state — with coordinates
  const [pickup, setPickup] = useState("");
  const [pickupCoords, setPickupCoords] = useState<Coords | null>(null);
  const [dropoff, setDropoff] = useState("");
  const [dropoffCoords, setDropoffCoords] = useState<Coords | null>(null);
  const [extraStops, setExtraStops] = useState<string[]>([]);
  const [extraStopCoords, setExtraStopCoords] = useState<(Coords | null)[]>([]);
  const [locationErrors, setLocationErrors] = useState<Record<string, string>>({});

  // Schedule state
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [scheduleError, setScheduleError] = useState("");

  // Item details state
  const [itemValues, setItemValues] = useState<Record<string, string>>({});
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});

  // Pricing state
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | undefined>(undefined);
  const [pricingLoading, setPricingLoading] = useState(false);

  // Payment state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [errandId, setErrandId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const totalStops = 2 + extraStops.length;

  // Calculate distance and fetch pricing when coordinates change
  const fetchPricing = useCallback(async () => {
    if (!pickupCoords || !dropoffCoords) return;

    const allStops: Coords[] = [
      pickupCoords,
      ...extraStopCoords.filter((c): c is Coords => c !== null),
      dropoffCoords,
    ];

    const distance = calculateRouteDistance(allStops);
    setDistanceKm(distance);

    setPricingLoading(true);
    try {
      const res = await fetch("/api/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: errandType,
          distanceKm: distance,
          isUrgent: false,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPricing(data);
      }
    } catch {
      // Pricing API failed — QuoteDisplay will show estimates
    } finally {
      setPricingLoading(false);
    }
  }, [pickupCoords, dropoffCoords, extraStopCoords, errandType]);

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  const validateStep = () => {
    if (currentStep === 0) {
      const errs: Record<string, string> = {};
      if (!pickup.trim()) {
        errs.pickup = "Pickup address is required";
      } else if (!pickupCoords) {
        errs.pickup = "Please select a pickup address from the suggestions";
      }
      if (!dropoff.trim()) {
        errs.dropoff = "Drop-off address is required";
      } else if (!dropoffCoords) {
        errs.dropoff = "Please select a drop-off address from the suggestions";
      }
      extraStops.forEach((s, i) => {
        if (!s.trim()) {
          errs[`stop-${i}`] = "Address required or remove this stop";
        } else if (!extraStopCoords[i]) {
          errs[`stop-${i}`] = "Please select an address from the suggestions";
        }
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

  const handleNext = async () => {
    if (!validateStep()) return;

    // When moving to review step (step 3), create errand + payment intent
    if (currentStep === 2) {
      await createErrandAndPaymentIntent();
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const createErrandAndPaymentIntent = async () => {
    setLoading(true);
    setBookingError(null);

    try {
      const [slotStart, slotEnd] = selectedSlot.split("-");

      // Use real pricing if available, otherwise estimate
      const totalPrice = pricing
        ? pricing.totalPrice + Math.max(0, totalStops - 2) * 3
        : 12.0;
      const baseFee = pricing?.baseFee ?? 7;
      const distanceFee = pricing?.distanceFee ?? 2.5;
      const urgencyFee = pricing?.urgencyFee ?? 0;
      const platformFee = pricing?.platformFee ?? totalPrice * 0.2;
      const runnerPayout = pricing?.runnerPayout ?? totalPrice * 0.8;

      // 1. Create the errand in Supabase
      const errandResult = await createErrand({
        type: errandType as Enums<"errand_type">,
        pickup_address: pickup,
        pickup_lat: pickupCoords?.lat ?? 53.3498,
        pickup_lng: pickupCoords?.lng ?? -6.2603,
        dropoff_address: dropoff,
        dropoff_lat: dropoffCoords?.lat ?? 53.3498,
        dropoff_lng: dropoffCoords?.lng ?? -6.2603,
        distance_km: distanceKm ?? 0,
        scheduled_date: selectedDate,
        time_slot_start: slotStart,
        time_slot_end: slotEnd,
        item_description: itemValues.itemDescription,
        package_size: itemValues.packageSize ?? null,
        tracking_number: itemValues.trackingNumber ?? null,
        recipient_name: itemValues.recipientName ?? null,
        order_number: itemValues.orderNumber ?? null,
        collection_name: itemValues.collectionName ?? null,
        special_instructions: itemValues.specialInstructions ?? null,
        base_fee: baseFee,
        distance_fee: distanceFee,
        urgency_fee: urgencyFee,
        total_price: totalPrice,
        platform_fee: platformFee,
        runner_payout: runnerPayout,
        customer_id: "", // Will be set by the server action
      });

      if (errandResult.error || !errandResult.data) {
        setBookingError(errandResult.error ?? "Failed to create errand");
        setLoading(false);
        return;
      }

      setErrandId(errandResult.data.id);

      // 2. Create Stripe PaymentIntent (authorize-then-capture)
      // Idempotency key prevents duplicate charges on retries
      const idempotencyKey = `pi_${errandResult.data.id}_${Date.now()}`;
      const paymentRes = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPrice,
          errandId: errandResult.data.id,
          errandDisplayId: errandResult.data.display_id,
          idempotencyKey,
        }),
      });

      if (!paymentRes.ok) {
        setBookingError("Failed to set up payment");
        setLoading(false);
        return;
      }

      const { clientSecret: secret } = await paymentRes.json();
      setClientSecret(secret);
    } catch (err) {
      setBookingError("Something went wrong. Please try again.");
      console.error("Booking error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    // Redirect to confirmation page with errand ID
    window.location.href = `/book/confirm?errand=${errandId}&pi=${paymentIntentId}`;
  };

  const addStop = () => {
    if (extraStops.length < 1) {
      setExtraStops([...extraStops, ""]);
      setExtraStopCoords([...extraStopCoords, null]);
    }
  };

  const removeStop = (index: number) => {
    setExtraStops(extraStops.filter((_, i) => i !== index));
    setExtraStopCoords(extraStopCoords.filter((_, i) => i !== index));
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
                  onChange={(v, coords) => {
                    setPickup(v);
                    if (coords) setPickupCoords(coords);
                    else setPickupCoords(null);
                    setLocationErrors((e) => ({ ...e, pickup: "" }));
                  }}
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
                      onChange={(v, coords) => {
                        const updatedStops = [...extraStops];
                        updatedStops[i] = v;
                        setExtraStops(updatedStops);
                        const updatedCoords = [...extraStopCoords];
                        updatedCoords[i] = coords ?? null;
                        setExtraStopCoords(updatedCoords);
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
                  onChange={(v, coords) => {
                    setDropoff(v);
                    if (coords) setDropoffCoords(coords);
                    else setDropoffCoords(null);
                    setLocationErrors((e) => ({ ...e, dropoff: "" }));
                  }}
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

            {/* Step 4: Review & Pay */}
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
                  Review &amp; pay
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
                        <span className="text-[var(--color-text)] line-clamp-1">{pickup}</span>
                      </div>
                      {extraStops.map((s, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="mt-0.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[var(--color-copper)]" />
                          <span className="text-[var(--color-text)] line-clamp-1">{s}</span>
                        </div>
                      ))}
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-red-400" />
                        <span className="text-[var(--color-text)] line-clamp-1">{dropoff}</span>
                      </div>
                    </div>
                    {distanceKm && (
                      <p className="mt-2 text-xs text-[var(--color-text-light)]">
                        Estimated distance: {distanceKm.toFixed(1)} km
                      </p>
                    )}
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

                  {/* Error display */}
                  {bookingError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {bookingError}
                    </div>
                  )}

                  {/* Payment Element */}
                  {clientSecret ? (
                    <Elements
                      stripe={getStripe()}
                      options={{
                        clientSecret,
                        appearance: {
                          theme: "stripe",
                          variables: {
                            colorPrimary: "#c47a5a",
                            borderRadius: "12px",
                          },
                        },
                      }}
                    >
                      <PaymentForm
                        onSuccess={handlePaymentSuccess}
                        loading={loading}
                        setLoading={setLoading}
                      />
                    </Elements>
                  ) : loading ? (
                    <div className="flex items-center justify-center gap-3 rounded-xl border border-[var(--color-border-light)] bg-white px-4 py-8">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-copper)]" />
                      <span className="text-sm text-[var(--color-text-muted)]">Setting up payment...</span>
                    </div>
                  ) : null}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation buttons — hidden on review step since payment form has its own button */}
          {currentStep < steps.length - 1 && (
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

              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="btn-primary flex-1 justify-center sm:flex-none disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    Continue
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Back button on review step */}
          {currentStep === 3 && (
            <div className="mt-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back to details
              </button>
            </div>
          )}
        </div>

        {/* Right: Quote sidebar */}
        <div className="lg:w-[320px] lg:flex-shrink-0">
          <div className="sticky top-24">
            <QuoteDisplay
              errandType={errandType}
              stops={totalStops}
              pricing={pricing}
              distanceKm={distanceKm}
              isLoading={pricingLoading}
              pickup={pickup}
              dropoff={dropoff}
              hasPickupCoords={!!pickupCoords}
              hasDropoffCoords={!!dropoffCoords}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
