"use client";

import { useRef, useState, useCallback } from "react";

interface OTPInputProps {
  length?: number;
  onComplete: (code: string) => void;
  error?: string;
}

export default function OTPInput({
  length = 6,
  onComplete,
  error,
}: OTPInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = useCallback(
    (index: number, val: string) => {
      if (!/^\d*$/.test(val)) return;

      const newValues = [...values];
      newValues[index] = val.slice(-1);
      setValues(newValues);

      if (val && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      const code = newValues.join("");
      if (code.length === length && !newValues.includes("")) {
        onComplete(code);
      }
    },
    [values, length, onComplete]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !values[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [values]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
      const newValues = [...values];
      for (let i = 0; i < pasted.length; i++) {
        newValues[i] = pasted[i];
      }
      setValues(newValues);

      const nextEmpty = newValues.findIndex((v) => !v);
      const focusIndex = nextEmpty === -1 ? length - 1 : nextEmpty;
      inputRefs.current[focusIndex]?.focus();

      if (pasted.length === length) {
        onComplete(pasted);
      }
    },
    [values, length, onComplete]
  );

  return (
    <div>
      <div className="flex justify-center gap-2.5">
        {values.map((val, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={val}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            className={`h-13 w-11 rounded-xl border text-center text-lg font-semibold text-[var(--color-charcoal)] transition-all duration-200 focus:outline-none ${
              error
                ? "border-red-400 bg-red-50/50"
                : val
                  ? "border-[var(--color-copper)] bg-white"
                  : "border-[var(--color-border)] bg-white focus:border-[var(--color-copper)] focus:shadow-[0_0_0_3px_var(--color-copper-glow)]"
            }`}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2.5 text-center text-xs font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
