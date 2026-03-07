"use client";

import { useState } from "react";

interface AuthInputProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export default function AuthInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  icon,
  disabled = false,
}: AuthInputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div>
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
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {icon && (
          <span className="pl-3.5 text-[var(--color-text-light)]">{icon}</span>
        )}
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-transparent px-3.5 py-3 text-[0.9375rem] text-[var(--color-text)] placeholder:text-[var(--color-text-light)] focus:outline-none disabled:cursor-not-allowed"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="pr-3.5 text-[var(--color-text-light)] hover:text-[var(--color-text-muted)] transition-colors cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}
