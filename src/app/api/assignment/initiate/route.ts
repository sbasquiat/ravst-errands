import { NextRequest, NextResponse } from "next/server";
import { findEligibleRunners } from "@/lib/assignment/find-runners";
import { createJobOffer } from "@/lib/assignment/offer-job";
import { rateLimit, getClientIP, rateLimits, rateLimitResponse } from "@/lib/rate-limit";
import { initiateAssignmentSchema, parseBody } from "@/lib/validation";

export async function POST(request: NextRequest) {
  // Rate limit: 30 req/min per IP
  const ip = getClientIP(request);
  const limit = rateLimit(`assignment:${ip}`, rateLimits.api);
  if (!limit.success) return rateLimitResponse(limit.resetMs);

  try {
    const body = await request.json();
    const { data, error: validationError } = parseBody(initiateAssignmentSchema, body);

    if (!data) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const runners = await findEligibleRunners(data.errandId);

    if (runners.length === 0) {
      return NextResponse.json({
        message: "No runners available — errand remains pending for manual assignment",
      });
    }

    const result = await createJobOffer(data.errandId, runners[0].id);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ message: "Job offer created", offerId: result.data?.id });
  } catch (err) {
    console.error("[Assignment] Initiate error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
