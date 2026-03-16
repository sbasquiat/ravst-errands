export default function RunnerLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5">
            <div className="h-3 w-20 rounded bg-[var(--color-cream-dark)]" />
            <div className="mt-3 h-7 w-14 rounded bg-[var(--color-cream-dark)]" />
          </div>
        ))}
      </div>
      {/* Job cards skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 rounded bg-[var(--color-cream-dark)]" />
              <div className="h-5 w-16 rounded-full bg-[var(--color-cream-dark)]" />
            </div>
            <div className="mt-3 h-3 w-44 rounded bg-[var(--color-cream-dark)]" />
            <div className="mt-2 h-3 w-32 rounded bg-[var(--color-cream-dark)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
