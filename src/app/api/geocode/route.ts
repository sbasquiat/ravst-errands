import { NextRequest, NextResponse } from "next/server";
import { searchPlaces } from "@/lib/geocoding";
import { rateLimit, getClientIP, rateLimits, rateLimitResponse } from "@/lib/rate-limit";
import { geocodeSchema, parseBody } from "@/lib/validation";

/**
 * Address autocomplete using Google Places API
 * Returns suggestions with placeId (no coordinates — use /api/geocode/details)
 */
export async function GET(request: NextRequest) {
  // Rate limit: 10 req/min per IP
  const ip = getClientIP(request);
  const limit = rateLimit(`geocode:${ip}`, rateLimits.geocode);
  if (!limit.success) return rateLimitResponse(limit.resetMs);

  const { searchParams } = new URL(request.url);
  const { data } = parseBody(geocodeSchema, {
    q: searchParams.get("q"),
  });

  if (!data) {
    return NextResponse.json([]);
  }

  try {
    const results = await searchPlaces(data.q, 5);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Geocoding error:", error);
    return NextResponse.json(
      { error: "Geocoding failed" },
      { status: 500 }
    );
  }
}
