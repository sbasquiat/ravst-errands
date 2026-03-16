import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GDPR Article 20 — Right to data portability.
 * Returns all user data as a JSON download.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Gather all user data in parallel
    const [
      profileRes,
      errandsRes,
      proofPhotosRes,
      messagesRes,
      disputesRes,
      ratingsRes,
      notifPrefsRes,
      subscriptionRes,
    ] = await Promise.all([
      // Profile
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      // Errands (as customer)
      supabase
        .from("errands")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false }),
      // Proof photos (for user's errands) — fetched separately below
      Promise.resolve({ data: null }),
      // Chat messages (sent by this user)
      supabase
        .from("chat_messages")
        .select("*")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false }),
      // Disputes filed by this user
      supabase
        .from("disputes")
        .select("*")
        .eq("filed_by", user.id)
        .order("created_at", { ascending: false }),
      // Ratings given by this user
      supabase
        .from("ratings")
        .select("*")
        .eq("rater_id", user.id)
        .order("created_at", { ascending: false }),
      // Notification preferences
      supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single(),
      // Subscription
      supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1),
    ]);

    // Fetch proof photos for user's errands
    const errandIds = (errandsRes.data ?? []).map((e) => e.id);
    let proofPhotos: unknown[] = [];
    if (errandIds.length > 0) {
      const { data: photos } = await supabase
        .from("proof_photos")
        .select("*")
        .in("errand_id", errandIds);
      proofPhotos = photos ?? [];
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      account: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
      },
      profile: profileRes.data ?? null,
      errands: errandsRes.data ?? [],
      proofPhotos,
      messages: messagesRes.data ?? [],
      disputes: disputesRes.data ?? [],
      ratings: ratingsRes.data ?? [],
      notificationPreferences: notifPrefsRes.data ?? null,
      subscriptions: subscriptionRes.data ?? [],
    };

    // Return as downloadable JSON
    return new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="ravst-data-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("[GDPR Export] Error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
