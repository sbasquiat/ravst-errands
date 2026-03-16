import { NextRequest, NextResponse } from "next/server";
import { calculatePricing } from "@/lib/supabase/queries";
import type { Enums } from "@/types/database";
import { rateLimit, getClientIP, rateLimits, rateLimitResponse } from "@/lib/rate-limit";
import { pricingSchema, parseBody } from "@/lib/validation";

export async function POST(request: NextRequest) {
  // Rate limit: 30 req/min per IP
  const ip = getClientIP(request);
  const limit = rateLimit(`pricing:${ip}`, rateLimits.api);
  if (!limit.success) return rateLimitResponse(limit.resetMs);

  try {
    const body = await request.json();
    const { data, error: validationError } = parseBody(pricingSchema, body);

    if (!data) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const result = await calculatePricing(
      data.type as Enums<"errand_type">,
      data.distanceKm,
      data.isUrgent
    );

    if (!result) {
      return NextResponse.json(
        { error: "Pricing calculation failed" },
        { status: 500 }
      );
    }

    // Map the DB result to the frontend pricing breakdown
    return NextResponse.json({
      baseFee: result.base_fee,
      distanceFee: result.distance_fee,
      urgencyFee: result.urgency_fee,
      totalPrice: result.total_price,
      platformFee: result.platform_fee,
      runnerPayout: result.runner_payout,
    });
  } catch (error) {
    console.error("Pricing error:", error);
    return NextResponse.json(
      { error: "Failed to calculate pricing" },
      { status: 500 }
    );
  }
}
