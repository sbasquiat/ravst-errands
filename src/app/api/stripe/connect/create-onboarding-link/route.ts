import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: runner } = await admin
      .from("runner_profiles")
      .select("stripe_connect_account_id")
      .eq("id", user.id)
      .single();

    if (!runner?.stripe_connect_account_id) {
      return NextResponse.json({ error: "No Connect account found" }, { status: 400 });
    }

    const accountLink = await stripe.accountLinks.create({
      account: runner.stripe_connect_account_id,
      refresh_url: `${appUrl}/runner/settings?connect=refresh`,
      return_url: `${appUrl}/runner/settings?connect=complete`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (err) {
    console.error("[Stripe Connect] Create onboarding link error:", err);
    return NextResponse.json({ error: "Failed to create link" }, { status: 500 });
  }
}
