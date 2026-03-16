"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface PlaceSuggestion {
  placeId: string;
  displayName: string;
  mainText: string;
  secondaryText: string;
}

interface AddressInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string, coords?: { lat: number; lng: number }) => void;
  error?: string;
  icon?: "pickup" | "dropoff" | "stop";
}

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
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const selectedRef = useRef<string>(""); // tracks the selected display name

  // Debounced autocomplete search
  const searchAddresses = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data: PlaceSuggestion[] = await res.json();
        setSuggestions(data);
      }
    } catch {
      // Silently fail
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Trigger search on value change (only when user is typing, not when we set value from selection)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Don't search if value matches what user just selected
    if (value === selectedRef.current && isResolved) return;

    // If user modified the selected address, clear resolved state
    if (isResolved && value !== selectedRef.current) {
      setIsResolved(false);
      selectedRef.current = "";
      onChange(value); // Re-emit without coords to clear parent coords
    }

    if (!value || value.length < 3) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      searchAddresses(value);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  // Resolve coordinates when user selects a suggestion
  const handleSelect = async (suggestion: PlaceSuggestion) => {
    setShowSuggestions(false);
    setSuggestions([]);
    setIsResolving(true);

    // Set display name immediately
    selectedRef.current = suggestion.displayName;
    onChange(suggestion.displayName);

    try {
      const res = await fetch(
        `/api/geocode/details?place_id=${encodeURIComponent(suggestion.placeId)}`
      );

      if (res.ok) {
        const details: { lat: number; lng: number; formattedAddress: string } =
          await res.json();

        setIsResolved(true);
        // Use formatted address from Google for cleanliness
        selectedRef.current = details.formattedAddress;
        onChange(details.formattedAddress, {
          lat: details.lat,
          lng: details.lng,
        });
      } else {
        // Failed to resolve — clear selection
        setIsResolved(false);
        selectedRef.current = "";
      }
    } catch {
      setIsResolved(false);
      selectedRef.current = "";
    } finally {
      setIsResolving(false);
    }
  };

  const handleClear = () => {
    onChange("");
    setShowSuggestions(false);
    setSuggestions([]);
    setIsResolved(false);
    selectedRef.current = "";
  };

  const iconColor =
    icon === "pickup"
      ? "text-green-500"
      : icon === "dropoff"
        ? "text-red-400"
        : "text-[var(--color-copper)]";

  const showUnresolvedWarning =
    !isResolved && !isResolving && value.length >= 3 && !showSuggestions;

  return (
    <div className="relative">
      <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
        {label}
      </label>
      <div
        className={`relative flex items-center rounded-xl border transition-all duration-200 ${
          error
            ? "border-red-400 bg-red-50/50"
            : isResolved
              ? "border-green-400/60 bg-green-50/30"
              : focused
                ? "border-[var(--color-copper)] bg-white shadow-[0_0_0_3px_var(--color-copper-glow)]"
                : "border-[var(--color-border)] bg-white hover:border-[var(--color-border)]"
        }`}
      >
        <span className={`pl-3.5 ${iconColor}`}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value); // No coords — user is typing
            setShowSuggestions(true);
          }}
          onFocus={() => {
            setFocused(true);
            if (value.length > 2 && suggestions.length > 0)
              setShowSuggestions(true);
          }}
          onBlur={() => {
            setFocused(false);
            // Delay to allow click on suggestion
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={placeholder}
          className="w-full bg-transparent px-3 py-3 text-[0.9375rem] text-[var(--color-text)] placeholder:text-[var(--color-text-light)] focus:outline-none"
        />
        {/* Status indicators */}
        {isResolving && (
          <span className="pr-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-copper)]" />
          </span>
        )}
        {isSearching && !isResolving && (
          <span className="pr-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-copper)]" />
          </span>
        )}
        {isResolved && !isResolving && (
          <span className="pr-2 text-green-500">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M3 8l3.5 3.5L13 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
        {value && !isSearching && !isResolving && !isResolved && (
          <button
            type="button"
            onClick={handleClear}
            className="pr-3 text-[var(--color-text-light)] hover:text-[var(--color-text-muted)] transition-colors cursor-pointer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        {value && isResolved && !isResolving && (
          <button
            type="button"
            onClick={handleClear}
            className="pr-3 text-[var(--color-text-light)] hover:text-[var(--color-text-muted)] transition-colors cursor-pointer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1.5 rounded-xl border border-[var(--color-border-light)] bg-white py-1.5 shadow-lg shadow-black/[0.06]">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.placeId}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(suggestion)}
              className="flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left text-sm hover:bg-[var(--color-cream)] transition-colors cursor-pointer"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-text-light)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-0.5 flex-shrink-0"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div className="min-w-0 flex-1">
                <span className="font-medium text-[var(--color-text)] block truncate">
                  {suggestion.mainText}
                </span>
                <span className="text-xs text-[var(--color-text-muted)] block truncate">
                  {suggestion.secondaryText}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Hint to select from suggestions */}
      {showUnresolvedWarning && !error && (
        <p className="mt-1.5 text-xs text-amber-600">
          Please select an address from the suggestions
        </p>
      )}

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}
