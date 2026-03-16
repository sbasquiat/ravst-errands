export default function BookingLoading() {
  return (
    <div className="animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <div className="h-4 w-12 rounded bg-gray-200" />
        <div className="h-4 w-4 rounded bg-gray-100" />
        <div className="h-4 w-32 rounded bg-gray-200" />
      </div>

      {/* Steps skeleton */}
      <div className="mb-10 flex items-center gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-1 items-center gap-1">
            <div className="flex flex-1 flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-gray-200" />
              <div className="mt-1.5 h-3 w-12 rounded bg-gray-100" />
            </div>
            {i < 4 && <div className="h-px flex-1 -mt-4 bg-gray-100" />}
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1 lg:max-w-[580px] space-y-4">
          <div className="h-7 w-32 rounded bg-gray-200" />
          <div className="h-14 w-full rounded-xl bg-gray-100" />
          <div className="h-14 w-full rounded-xl bg-gray-100" />
        </div>
        <div className="lg:w-[320px]">
          <div className="h-64 rounded-2xl bg-gray-100" />
        </div>
      </div>
    </div>
  );
}
