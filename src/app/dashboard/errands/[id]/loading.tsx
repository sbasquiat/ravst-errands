export default function ErrandDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-3 w-20 rounded bg-[var(--color-cream-dark)]" />
        <div className="mt-2 h-6 w-48 rounded bg-[var(--color-cream-dark)]" />
        <div className="mt-2 h-5 w-24 rounded-full bg-[var(--color-cream-dark)]" />
      </div>
      {/* Details skeleton */}
      <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 space-y-4">
        <div className="h-4 w-28 rounded bg-[var(--color-cream-dark)]" />
        <div className="h-3 w-full rounded bg-[var(--color-cream-dark)]" />
        <div className="h-3 w-3/4 rounded bg-[var(--color-cream-dark)]" />
        <div className="h-3 w-1/2 rounded bg-[var(--color-cream-dark)]" />
      </div>
      {/* Timeline skeleton */}
      <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 space-y-4">
        <div className="h-4 w-24 rounded bg-[var(--color-cream-dark)]" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-[var(--color-cream-dark)]" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 rounded bg-[var(--color-cream-dark)]" />
              <div className="h-3 w-48 rounded bg-[var(--color-cream-dark)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
