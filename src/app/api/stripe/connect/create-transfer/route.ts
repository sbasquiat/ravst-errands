import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify user is admin
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { payoutId, runnerId, amount } = await request.json();

    if (!payoutId || !runnerId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get runner's Connect account
    const { data: runner } = await admin
      .from("runner_profiles")
      .select("stripe_connect_account_id")
      .eq("id", runnerId)
      .single();

    if (!runner?.stripe_connect_account_id) {
      return NextResponse.json({ error: "Runner has no connected bank account" }, { status: 400 });
    }

    // Create transfer
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "eur",
      destination: runner.stripe_connect_account_id,
      metadata: {
        payout_id: payoutId,
        runner_id: runnerId,
      },
    });

    // Update payout status
    await admin
      .from("payouts")
      .update({
        status: "processing",
        stripe_transfer_id: transfer.id,
        processed_at: new Date().toISOString(),
      })
      .eq("id", payoutId);

    return NextResponse.json({ transferId: transfer.id });
  } catch (err) {
    console.error("[Stripe Connect] Create transfer error:", err);
    return NextResponse.json({ error: "Failed to create transfer" }, { status: 500 });
  }
}
