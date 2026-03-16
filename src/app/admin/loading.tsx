export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5">
            <div className="h-3 w-24 rounded bg-[var(--color-cream-dark)]" />
            <div className="mt-3 h-7 w-16 rounded bg-[var(--color-cream-dark)]" />
          </div>
        ))}
      </div>
      {/* Table skeleton */}
      <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5">
        <div className="h-4 w-32 rounded bg-[var(--color-cream-dark)] mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-3 w-20 rounded bg-[var(--color-cream-dark)]" />
              <div className="h-3 w-32 rounded bg-[var(--color-cream-dark)]" />
              <div className="h-3 w-16 rounded bg-[var(--color-cream-dark)]" />
              <div className="h-3 w-24 rounded bg-[var(--color-cream-dark)] ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
