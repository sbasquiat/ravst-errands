import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { accountDeletionSchema, parseBody } from "@/lib/validation";
import { rateLimit, getClientIP, rateLimits, rateLimitResponse } from "@/lib/rate-limit";

/**
 * GDPR Article 17 — Right to erasure.
 * Deletes the user's account and all associated data.
 * Requires confirmation text "DELETE MY ACCOUNT".
 */
export async function POST(request: NextRequest) {
  // Strict rate limit: 3 per hour
  const ip = getClientIP(request);
  const limit = rateLimit(`gdpr-delete:${ip}`, {
    maxRequests: 3,
    windowMs: 60 * 60_000,
  });
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
    const { data, error: validationError } = parseBody(accountDeletionSchema, body);

    if (!data) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Double-check confirmation
    if (data.confirmation !== "DELETE MY ACCOUNT") {
      return NextResponse.json(
        { error: "Please type 'DELETE MY ACCOUNT' to confirm" },
        { status: 400 }
      );
    }

    // Check for active errands (in_progress or assigned)
    const { data: activeErrands } = await supabase
      .from("errands")
      .select("id")
      .eq("customer_id", user.id)
      .in("status", ["pending", "finding_runner", "runner_assigned", "in_progress"])
      .limit(1);

    if (activeErrands && activeErrands.length > 0) {
      return NextResponse.json(
        {
          error:
            "You have active errands. Please wait for them to complete or cancel them before deleting your account.",
        },
        { status: 400 }
      );
    }

    // Use admin client for deletion (bypasses RLS)
    const admin = createAdminClient();

    // Delete user data in order (respecting foreign keys)
    // 1. Notification preferences
    await admin
      .from("notification_preferences")
      .delete()
      .eq("user_id", user.id);

    // 2. Chat messages
    await admin.from("chat_messages").delete().eq("sender_id", user.id);

    // 3. Ratings
    await admin.from("ratings").delete().eq("rater_id", user.id);

    // 4. Disputes
    await admin.from("disputes").delete().eq("filed_by", user.id);

    // 5. Proof photos (for user's errands) — delete storage files too
    const { data: userErrands } = await admin
      .from("errands")
      .select("id")
      .eq("customer_id", user.id);

    if (userErrands && userErrands.length > 0) {
      const errandIds = userErrands.map((e) => e.id);

      // Get photo storage paths before deleting records
      const { data: photos } = await admin
        .from("proof_photos")
        .select("storage_path")
        .in("errand_id", errandIds);

      if (photos && photos.length > 0) {
        // Delete files from storage
        const paths = photos.map((p) => p.storage_path);
        await admin.storage.from("proof-photos").remove(paths);

        // Delete proof photo records
        await admin.from("proof_photos").delete().in("errand_id", errandIds);
      }

      // 6. Anonymize completed errands (keep for runner records/accounting)
      await admin
        .from("errands")
        .update({
          customer_id: null as unknown as string,
          pickup_address: "[deleted]",
          dropoff_address: "[deleted]",
          description: "[deleted]",
          recipient_name: null,
          recipient_phone: null,
        })
        .eq("customer_id", user.id)
        .in("status", ["completed", "cancelled"]);
    }

    // 7. Subscriptions
    await admin.from("subscriptions").delete().eq("user_id", user.id);

    // 8. Runner-specific data (if they were also a runner)
    await admin.from("runner_documents").delete().eq("runner_id", user.id);
    await admin.from("job_offers").delete().eq("runner_id", user.id);

    // 9. Delete profile
    await admin.from("profiles").delete().eq("id", user.id);

    // 10. Delete auth user (this signs them out everywhere)
    await admin.auth.admin.deleteUser(user.id);

    return NextResponse.json({
      success: true,
      message:
        "Your account and all associated data have been deleted. You will be signed out.",
    });
  } catch (error) {
    console.error("[GDPR Delete] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete account. Please contact support." },
      { status: 500 }
    );
  }
}
