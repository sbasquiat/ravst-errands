import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { respondToOffer } from "@/lib/assignment/offer-job";
import { rateLimit, getClientIP, rateLimits, rateLimitResponse } from "@/lib/rate-limit";
import { respondToOfferSchema, parseBody } from "@/lib/validation";

export async function POST(request: NextRequest) {
  // Rate limit: 30 req/min per IP
  const ip = getClientIP(request);
  const limit = rateLimit(`assignment:${ip}`, rateLimits.api);
  if (!limit.success) return rateLimitResponse(limit.resetMs);

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { data, error: validationError } = parseBody(respondToOfferSchema, body);

    if (!data) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Verify the offer belongs to this runner
    const { data: offer } = await supabase
      .from("job_offers")
      .select("runner_id")
      .eq("id", data.offerId)
      .single();

    if (!offer || offer.runner_id !== user.id) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    const result = await respondToOffer(data.offerId, data.accept);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      message: data.accept ? "Job accepted" : "Job declined",
    });
  } catch (err) {
    console.error("[Assignment] Respond error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
