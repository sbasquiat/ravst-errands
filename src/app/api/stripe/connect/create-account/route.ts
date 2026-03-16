import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if runner already has a Connect account
    const admin = createAdminClient();
    const { data: runner } = await admin
      .from("runner_profiles")
      .select("stripe_connect_account_id")
      .eq("id", user.id)
      .single();

    if (runner?.stripe_connect_account_id) {
      return NextResponse.json({
        accountId: runner.stripe_connect_account_id,
        message: "Account already exists",
      });
    }

    // Get runner's profile for pre-filling
    const { data: profile } = await admin
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    // Create Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: "express",
      country: "IE",
      email: profile?.email || user.email,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: "individual",
      metadata: {
        runner_id: user.id,
      },
    });

    // Store account ID in runner profile
    await admin
      .from("runner_profiles")
      .update({ stripe_connect_account_id: account.id })
      .eq("id", user.id);

    return NextResponse.json({ accountId: account.id });
  } catch (err) {
    console.error("[Stripe Connect] Create account error:", err);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
