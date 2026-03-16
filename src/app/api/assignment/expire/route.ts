import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { expireOffer } from "@/lib/assignment/offer-job";

/**
 * Expire all pending offers that have passed their expiry time.
 * Designed to be called by Vercel cron (1-minute interval) or manually.
 */
export async function POST(request: NextRequest) {
  try {
    // Simple auth: check for cron secret or admin
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Find all expired pending offers
    const { data: expiredOffers, error } = await supabase
      .from("job_offers")
      .select("id")
      .eq("status", "pending")
      .lt("expires_at", new Date().toISOString());

    if (error) {
      console.error("[Assignment] Error finding expired offers:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!expiredOffers || expiredOffers.length === 0) {
      return NextResponse.json({ message: "No expired offers", count: 0 });
    }

    // Expire each offer and cascade to next runner
    for (const offer of expiredOffers) {
      await expireOffer(offer.id);
    }

    return NextResponse.json({
      message: `Expired ${expiredOffers.length} offer(s)`,
      count: expiredOffers.length,
    });
  } catch (err) {
    console.error("[Assignment] Expire error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
