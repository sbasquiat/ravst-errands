"use client";

import { useState } from "react";

interface TimeSlotPickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedSlot: string;
  onSlotChange: (slot: string) => void;
  error?: string;
}

const generateDates = () => {
  const dates: { label: string; value: string; day: string; dayNum: string }[] = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayName = d.toLocaleDateString("en-IE", { weekday: "short" });
    const dayNum = d.getDate().toString();
    const value = d.toISOString().split("T")[0];
    const label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : dayName;
    dates.push({ label, value, day: dayName, dayNum });
  }
  return dates;
};

const timeSlots = [
  { label: "8:00 – 10:00", value: "08:00-10:00" },
  { label: "10:00 – 12:00", value: "10:00-12:00" },
  { label: "12:00 – 14:00", value: "12:00-14:00" },
  { label: "14:00 – 16:00", value: "14:00-16:00" },
  { label: "16:00 – 18:00", value: "16:00-18:00" },
  { label: "18:00 – 20:00", value: "18:00-20:00" },
];

export default function TimeSlotPicker({
  selectedDate,
  onDateChange,
  selectedSlot,
  onSlotChange,
  error,
}: TimeSlotPickerProps) {
  const [dates] = useState(generateDates);

  return (
    <div>
      <label className="mb-3 block text-sm font-medium text-[var(--color-text)]">
        When do you need this done?
      </label>

      {/* Date selector */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {dates.map((d) => (
          <button
            key={d.value}
            type="button"
            onClick={() => onDateChange(d.value)}
            className={`flex flex-shrink-0 flex-col items-center rounded-xl px-4 py-3 transition-all duration-200 cursor-pointer ${
              selectedDate === d.value
                ? "bg-[var(--color-charcoal)] text-white shadow-md"
                : "border border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-border)] hover:bg-[var(--color-cream)]"
            }`}
          >
            <span className={`text-[10px] font-medium uppercase tracking-wider ${
              selectedDate === d.value ? "text-white/60" : "text-[var(--color-text-light)]"
            }`}>
              {d.label}
            </span>
            <span className="mt-0.5 text-lg font-bold">{d.dayNum}</span>
          </button>
        ))}
      </div>

      {/* Time slots */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {timeSlots.map((slot) => (
          <button
            key={slot.value}
            type="button"
            onClick={() => onSlotChange(slot.value)}
            className={`rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer ${
              selectedSlot === slot.value
                ? "bg-[var(--color-copper)] text-white shadow-md"
                : "border border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-copper)]/30 hover:bg-[var(--color-copper)]/[0.04]"
            }`}
          >
            {slot.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-2 text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}
