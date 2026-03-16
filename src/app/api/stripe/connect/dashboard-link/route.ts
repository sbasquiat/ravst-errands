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

    const admin = createAdminClient();
    const { data: runner } = await admin
      .from("runner_profiles")
      .select("stripe_connect_account_id")
      .eq("id", user.id)
      .single();

    if (!runner?.stripe_connect_account_id) {
      return NextResponse.json({ error: "No Connect account found" }, { status: 400 });
    }

    const loginLink = await stripe.accounts.createLoginLink(
      runner.stripe_connect_account_id
    );

    return NextResponse.json({ url: loginLink.url });
  } catch (err) {
    console.error("[Stripe Connect] Dashboard link error:", err);
    return NextResponse.json({ error: "Failed to create dashboard link" }, { status: 500 });
  }
}
