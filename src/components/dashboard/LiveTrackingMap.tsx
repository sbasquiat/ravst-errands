"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";
import { useRunnerLocation } from "@/lib/tracking/location-subscriber";

// Dynamically import Map to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("@/components/maps/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-[var(--color-cream)] flex items-center justify-center">
      <div className="text-sm text-[var(--color-text-muted)]">Loading map...</div>
    </div>
  ),
});

interface Props {
  errandId: string;
  runnerName: string;
  runnerInitials: string;
  runnerRating: number;
  pickup: string;
  dropoff: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
}

function createDotIcon(color: string, size = 12) {
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};box-shadow:0 0 0 4px ${color}33;"></div>`,
  });
}

function createRunnerIcon(initials: string) {
  return L.divIcon({
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    html: `<div style="width:32px;height:32px;border-radius:50%;background:#c27a4a;color:white;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,0.3),0 0 0 4px rgba(194,122,74,0.2);transition:all 0.5s ease;">${initials}</div>`,
  });
}

export default function LiveTrackingMap({
  errandId,
  runnerName,
  runnerInitials,
  runnerRating,
  pickup,
  dropoff,
  pickupLat,
  pickupLng,
  dropoffLat,
  dropoffLng,
}: Props) {
  const [trackingOn, setTrackingOn] = useState(true);
  const mapRef = useRef<L.Map | null>(null);
  const runnerMarkerRef = useRef<L.Marker | null>(null);
  const runnerPosition = useRunnerLocation(trackingOn ? errandId : null);

  const center = useMemo<[number, number]>(
    () => [(pickupLat + dropoffLat) / 2, (pickupLng + dropoffLng) / 2],
    [pickupLat, pickupLng, dropoffLat, dropoffLng]
  );

  const handleMapReady = (map: L.Map) => {
    mapRef.current = map;

    // Pickup marker
    L.marker([pickupLat, pickupLng], { icon: createDotIcon("#22c55e") })
      .addTo(map)
      .bindTooltip(pickup.split(",")[0] || "Pickup", {
        permanent: false,
        direction: "top",
      });

    // Dropoff marker
    L.marker([dropoffLat, dropoffLng], { icon: createDotIcon("#ef4444") })
      .addTo(map)
      .bindTooltip(dropoff.split(",")[0] || "Drop-off", {
        permanent: false,
        direction: "top",
      });

    // Dashed route line
    L.polyline(
      [
        [pickupLat, pickupLng],
        [dropoffLat, dropoffLng],
      ],
      {
        color: "#c27a4a",
        weight: 3,
        dashArray: "8 6",
        opacity: 0.5,
      }
    ).addTo(map);

    // Fit bounds to show both markers
    const bounds = L.latLngBounds([
      [pickupLat, pickupLng],
      [dropoffLat, dropoffLng],
    ]);
    map.fitBounds(bounds, { padding: [40, 40] });
  };

  // Update runner marker when position changes
  useEffect(() => {
    if (!mapRef.current || !runnerPosition) return;

    const pos: [number, number] = [runnerPosition.lat, runnerPosition.lng];

    if (runnerMarkerRef.current) {
      runnerMarkerRef.current.setLatLng(pos);
    } else {
      runnerMarkerRef.current = L.marker(pos, {
        icon: createRunnerIcon(runnerInitials),
        zIndexOffset: 1000,
      }).addTo(mapRef.current);
    }
  }, [runnerPosition, runnerInitials]);

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
        <div className="relative">
          <MapComponent
            center={center}
            zoom={14}
            className="h-64"
            onMapReady={handleMapReady}
          />

          {/* Runner info overlay */}
          <div className="absolute bottom-3 left-3 right-3 z-[1000] flex items-center gap-3 rounded-xl bg-white/95 backdrop-blur-sm p-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-copper)]/10 text-sm font-bold text-[var(--color-copper)]">
              {runnerInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-charcoal)]">{runnerName}</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {runnerPosition ? "Live tracking active" : "Waiting for location..."}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-amber-600">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {runnerRating.toFixed(1)}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center bg-[var(--color-cream)]">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
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
