"use client";

export default function RunnerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-[var(--color-charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
        Something went wrong
      </h2>
      <p className="mt-2 max-w-sm text-sm text-[var(--color-text-muted)]">
        We had trouble loading this page. This is usually temporary.
      </p>
      <button
        onClick={reset}
        className="btn-primary mt-6"
      >
        Try Again
      </button>
    </div>
  );
}
