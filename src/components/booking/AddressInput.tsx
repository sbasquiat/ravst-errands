"use client";

import { useState } from "react";

interface AddressInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  icon?: "pickup" | "dropoff" | "stop";
}

const mockSuggestions = [
  "12 Grafton Street, Dublin 2, D02 VF65",
  "St Stephen's Green Shopping Centre, Dublin 2",
  "Trinity College Dublin, College Green, Dublin 2",
  "O'Connell Street, Dublin 1",
  "Dundrum Town Centre, Sandyford Rd, Dublin 16",
  "Dublin Airport, Terminal 1",
];

export default function AddressInput({
  label,
  placeholder = "Search for an address...",
  value,
  onChange,
  error,
  icon = "pickup",
}: AddressInputProps) {
  const [focused, setFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = value.length > 1
    ? mockSuggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase()))
    : [];

  const iconColor =
    icon === "pickup" ? "text-green-500" : icon === "dropoff" ? "text-red-400" : "text-[var(--color-copper)]";

  return (
    <div className="relative">
      <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
        {label}
      </label>
      <div
        className={`relative flex items-center rounded-xl border transition-all duration-200 ${
          error
            ? "border-red-400 bg-red-50/50"
            : focused
              ? "border-[var(--color-copper)] bg-white shadow-[0_0_0_3px_var(--color-copper-glow)]"
              : "border-[var(--color-border)] bg-white hover:border-[var(--color-border)]"
        }`}
      >
        <span className={`pl-3.5 ${iconColor}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => {
            setFocused(true);
            if (value.length > 1) setShowSuggestions(true);
          }}
          onBlur={() => {
            setFocused(false);
            // Delay to allow click on suggestion
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={placeholder}
          className="w-full bg-transparent px-3 py-3 text-[0.9375rem] text-[var(--color-text)] placeholder:text-[var(--color-text-light)] focus:outline-none"
        />
        {value && (
          <button
            type="button"
            onClick={() => { onChange(""); setShowSuggestions(false); }}
            className="pr-3 text-[var(--color-text-light)] hover:text-[var(--color-text-muted)] transition-colors cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1.5 rounded-xl border border-[var(--color-border-light)] bg-white py-1.5 shadow-lg shadow-black/[0.06]">
          {filtered.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(suggestion);
                setShowSuggestions(false);
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-cream)] transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="truncate">{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}
