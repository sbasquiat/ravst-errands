"use client";

import { useState } from "react";

interface Props {
  runnerName: string;
  runnerInitials: string;
  pickup: string;
  dropoff: string;
}

export default function LiveTrackingMap({ runnerName, runnerInitials, pickup, dropoff }: Props) {
  const [trackingOn, setTrackingOn] = useState(true);

  return (
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-white overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border-light)]">
        <h3 className="text-sm font-semibold text-[var(--color-charcoal)]">Live Tracking</h3>
        <button
          onClick={() => setTrackingOn(!trackingOn)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
            trackingOn ? "bg-[var(--color-copper)]" : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
              trackingOn ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {trackingOn ? (
        <div className="relative h-64 bg-[#e8e4dc]">
          {/* Mock map with styled placeholder */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Grid lines to simulate a map */}
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={`h-${i}`} className="absolute left-0 right-0 border-t border-[var(--color-text-light)]" style={{ top: `${(i + 1) * 12}%` }} />
              ))}
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={`v-${i}`} className="absolute top-0 bottom-0 border-l border-[var(--color-text-light)]" style={{ left: `${(i + 1) * 16}%` }} />
              ))}
            </div>

            {/* Fake route path */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 256" fill="none">
              <path
                d="M100 200 C 130 180, 160 120, 200 100 S 280 60, 320 80"
                stroke="var(--color-copper)"
                strokeWidth="3"
                strokeDasharray="8 4"
                opacity="0.6"
              />
            </svg>

            {/* Pickup marker */}
            <div className="absolute" style={{ left: "22%", top: "72%" }}>
              <div className="flex flex-col items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 ring-4 ring-green-500/20" />
                <div className="mt-1 rounded bg-white/90 px-2 py-0.5 text-[10px] font-medium text-[var(--color-text)] shadow-sm whitespace-nowrap">
                  Pickup
                </div>
              </div>
            </div>

            {/* Drop-off marker */}
            <div className="absolute" style={{ left: "76%", top: "26%" }}>
              <div className="flex flex-col items-center">
                <div className="h-3 w-3 rounded-full bg-red-500 ring-4 ring-red-500/20" />
                <div className="mt-1 rounded bg-white/90 px-2 py-0.5 text-[10px] font-medium text-[var(--color-text)] shadow-sm whitespace-nowrap">
                  Drop-off
                </div>
              </div>
            </div>

            {/* Runner marker (animated) */}
            <div className="absolute animate-bounce" style={{ left: "48%", top: "42%", animationDuration: "2s" }}>
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-copper)] text-[10px] font-bold text-white ring-4 ring-[var(--color-copper)]/20 shadow-lg">
                  {runnerInitials}
                </div>
              </div>
            </div>
          </div>

          {/* Runner info overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 rounded-xl bg-white/95 backdrop-blur-sm p-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-copper)]/10 text-sm font-bold text-[var(--color-copper)]">
              {runnerInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-charcoal)]">{runnerName}</p>
              <p className="text-xs text-[var(--color-text-muted)]">En route to drop-off · ~8 min away</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-amber-600">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              4.9
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center bg-[var(--color-cream)]">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">Tracking paused</p>
            <p className="text-xs text-[var(--color-text-light)]">Toggle on to see live runner location</p>
          </div>
        </div>
      )}
    </div>
  );
}
