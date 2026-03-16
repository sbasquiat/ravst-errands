import { NextRequest, NextResponse } from "next/server";
import { getPlaceCoordinates } from "@/lib/geocoding";
import { rateLimit, getClientIP, rateLimits, rateLimitResponse } from "@/lib/rate-limit";
import { placeDetailsSchema, parseBody } from "@/lib/validation";

/**
 * Resolve a Google Place ID to coordinates
 * Called when user selects an address suggestion
 */
export async function GET(request: NextRequest) {
  // Rate limit: 30 req/min per IP (same as general API)
  const ip = getClientIP(request);
  const limit = rateLimit(`geocode-details:${ip}`, rateLimits.api);
  if (!limit.success) return rateLimitResponse(limit.resetMs);

  const { searchParams } = new URL(request.url);
  const { data } = parseBody(placeDetailsSchema, {
    place_id: searchParams.get("place_id"),
  });

  if (!data) {
    return NextResponse.json(
      { error: "place_id is required" },
      { status: 400 }
    );
  }

  try {
    const details = await getPlaceCoordinates(data.place_id);

    if (!details) {
      return NextResponse.json(
        { error: "Place not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(details);
  } catch (error) {
    console.error("Place details error:", error);
    return NextResponse.json(
      { error: "Failed to resolve place" },
      { status: 500 }
    );
  }
}
