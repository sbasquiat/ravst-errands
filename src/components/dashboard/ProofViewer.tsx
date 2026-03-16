"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ProofPhoto {
  id: string;
  type: "pickup" | "dropoff" | "receipt";
  label: string;
  timestamp: string;
  gps: string;
  placeholder: string; // Color for fallback placeholder
  imageUrl?: string; // Supabase Storage public URL
}

interface Props {
  photos: ProofPhoto[];
}

export default function ProofViewer({ photos }: Props) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  if (photos.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-[var(--color-charcoal)]">Proof Photos</h3>
        <div className="flex items-center gap-3 rounded-xl bg-[var(--color-cream)] px-4 py-6 text-center">
          <div className="mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
            <p className="text-sm text-[var(--color-text-muted)]">Photos will appear here as the runner completes checkpoints</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-[var(--color-charcoal)]">
          Proof Photos
          <span className="ml-2 text-xs font-normal text-[var(--color-text-light)]">{photos.length} photo{photos.length !== 1 ? "s" : ""}</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => setSelectedIdx(i)}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl cursor-pointer"
            >
              {photo.imageUrl ? (
                <img
                  src={photo.imageUrl}
                  alt={photo.label}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className={`absolute inset-0 ${photo.placeholder} flex items-center justify-center`}>
                  <div className="text-center text-white/80">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-1">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span className="text-[10px] font-medium">{photo.label}</span>
                  </div>
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </div>
              </div>
              {/* Type badge */}
              <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                {photo.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
            onClick={() => setSelectedIdx(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {photos[selectedIdx].imageUrl ? (
                <img
                  src={photos[selectedIdx].imageUrl}
                  alt={photos[selectedIdx].label}
                  className="aspect-[4/3] w-full rounded-2xl object-cover"
                />
              ) : (
                <div className={`aspect-[4/3] rounded-2xl ${photos[selectedIdx].placeholder} flex items-center justify-center`}>
                  <div className="text-center text-white/80">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                    </svg>
                    <p className="text-sm font-medium">{photos[selectedIdx].label}</p>
                  </div>
                </div>
              )}

              {/* Photo info */}
              <div className="mt-3 flex items-center justify-between text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  {photos[selectedIdx].timestamp}
                </div>
                <div className="flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  {photos[selectedIdx].gps}
                </div>
              </div>

              {/* Nav buttons */}
              <div className="absolute top-1/2 -left-12 -translate-y-1/2">
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedIdx(Math.max(0, selectedIdx - 1)); }}
                  className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors cursor-pointer ${selectedIdx === 0 ? "opacity-30" : ""}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
              </div>
              <div className="absolute top-1/2 -right-12 -translate-y-1/2">
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedIdx(Math.min(photos.length - 1, selectedIdx + 1)); }}
                  className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors cursor-pointer ${selectedIdx === photos.length - 1 ? "opacity-30" : ""}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </div>

              {/* Close button */}
              <button
                onClick={() => setSelectedIdx(null)}
                className="absolute -top-10 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
