"use client";

import { createBrowserClient } from "@supabase/ssr";

let watchId: number | null = null;
let intervalId: ReturnType<typeof setInterval> | null = null;
let latestPosition: GeolocationPosition | null = null;

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function sendLocation(errandId: string, runnerId: string) {
  if (!latestPosition) return;

  const supabase = getSupabase();
  const { error } = await supabase.from("runner_locations").insert({
    runner_id: runnerId,
    errand_id: errandId,
    lat: latestPosition.coords.latitude,
    lng: latestPosition.coords.longitude,
    accuracy: latestPosition.coords.accuracy ?? null,
    heading: latestPosition.coords.heading ?? null,
    speed: latestPosition.coords.speed ?? null,
  });

  if (error) {
    console.error("[Tracking] Failed to send location:", error.message);
  }
}

export function startLocationUpdates(errandId: string, runnerId: string) {
  if (!("geolocation" in navigator)) {
    console.warn("[Tracking] Geolocation not available");
    return;
  }

  // Watch position continuously
  watchId = navigator.geolocation.watchPosition(
    (position) => {
      latestPosition = position;
    },
    (err) => {
      console.error("[Tracking] Geolocation error:", err.message);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000,
    }
  );

  // Send to database every 10 seconds
  intervalId = setInterval(() => {
    sendLocation(errandId, runnerId);
  }, 10000);

  // Send immediately once position is available
  const initialSend = setInterval(() => {
    if (latestPosition) {
      sendLocation(errandId, runnerId);
      clearInterval(initialSend);
    }
  }, 1000);
}

export function stopLocationUpdates() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
  latestPosition = null;
}
