"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface RunnerPosition {
  lat: number;
  lng: number;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  recorded_at: string;
}

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function useRunnerLocation(errandId: string | null): RunnerPosition | null {
  const [position, setPosition] = useState<RunnerPosition | null>(null);

  useEffect(() => {
    if (!errandId) return;

    const supabase = getSupabase();

    // Fetch latest position
    async function fetchLatest() {
      const { data } = await supabase
        .from("runner_locations")
        .select("lat, lng, accuracy, heading, speed, recorded_at")
        .eq("errand_id", errandId!)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setPosition({
          lat: Number(data.lat),
          lng: Number(data.lng),
          accuracy: data.accuracy ? Number(data.accuracy) : null,
          heading: data.heading ? Number(data.heading) : null,
          speed: data.speed ? Number(data.speed) : null,
          recorded_at: data.recorded_at,
        });
      }
    }

    fetchLatest();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`runner-location-${errandId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "runner_locations",
          filter: `errand_id=eq.${errandId}`,
        },
        (payload) => {
          const row = payload.new;
          setPosition({
            lat: Number(row.lat),
            lng: Number(row.lng),
            accuracy: row.accuracy ? Number(row.accuracy) : null,
            heading: row.heading ? Number(row.heading) : null,
            speed: row.speed ? Number(row.speed) : null,
            recorded_at: row.recorded_at,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [errandId]);

  return position;
}
