import { createAdminClient } from "@/lib/supabase/server";
import { findEligibleRunners } from "./find-runners";
import { sendEmail } from "@/lib/email/send";
import { runnerAssignedEmail, runnerJobOfferEmail } from "@/lib/email/templates";

/**
 * Create a job offer for a runner.
 */
export async function createJobOffer(errandId: string, runnerId: string) {
  const supabase = createAdminClient();

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("job_offers")
    .insert({
      errand_id: errandId,
      runner_id: runnerId,
      status: "pending",
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) {
    console.error("[Assignment] Failed to create offer:", error);
    return { error: error.message };
  }

  // Update errand status to finding_runner if it's still pending
  await supabase
    .from("errands")
    .update({ status: "pending" })
    .eq("id", errandId)
    .eq("status", "pending");

  // Send email notification to runner (fire-and-forget)
  try {
    const [errandResult, profileResult] = await Promise.all([
      supabase
        .from("errands")
        .select("type, pickup_address, dropoff_address, runner_payout")
        .eq("id", errandId)
        .single(),
      supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", runnerId)
        .single(),
    ]);

    const errand = errandResult.data;
    const profile = profileResult.data;

    if (errand && profile?.email) {
      const emailContent = runnerJobOfferEmail(
        profile.full_name || "Runner",
        errand.type,
        errand.pickup_address || "",
        errand.dropoff_address || "",
        errand.runner_payout || 0
      );
      sendEmail(profile.email, emailContent.subject, emailContent.html, emailContent.text);
    }
  } catch (e) {
    console.error("[Assignment] Failed to send offer email:", e);
  }

  return { error: null, data };
}

/**
 * Handle a runner's response to a job offer.
 */
export async function respondToOffer(offerId: string, accept: boolean) {
  const supabase = createAdminClient();

  // Get the offer
  const { data: offer, error: fetchError } = await supabase
    .from("job_offers")
    .select("*, errand:errands(customer_id, display_id)")
    .eq("id", offerId)
    .single();

  if (fetchError || !offer) {
    return { error: "Offer not found" };
  }

  if (offer.status !== "pending") {
    return { error: "Offer is no longer pending" };
  }

  // Check if expired
  if (new Date(offer.expires_at) < new Date()) {
    await supabase
      .from("job_offers")
      .update({ status: "expired", responded_at: new Date().toISOString() })
      .eq("id", offerId);
    return { error: "Offer has expired" };
  }

  if (accept) {
    // Accept: update offer, assign runner to errand
    await supabase
      .from("job_offers")
      .update({ status: "accepted", responded_at: new Date().toISOString() })
      .eq("id", offerId);

    await supabase
      .from("errands")
      .update({
        runner_id: offer.runner_id,
        status: "runner_assigned",
        current_phase: "job_details",
      })
      .eq("id", offer.errand_id);

    // Expire all other pending offers for this errand
    await supabase
      .from("job_offers")
      .update({ status: "expired", responded_at: new Date().toISOString() })
      .eq("errand_id", offer.errand_id)
      .eq("status", "pending")
      .neq("id", offerId);

    // Add timeline event
    await supabase.from("errand_timeline").insert({
      errand_id: offer.errand_id,
      event_type: "runner_assigned",
      label: "Runner assigned",
      description: "A runner has accepted this errand",
    });

    // Send runner-assigned email to customer (fire-and-forget)
    try {
      const errandData = offer.errand as { customer_id: string; display_id: string } | null;
      if (errandData) {
        const [customerResult, runnerResult] = await Promise.all([
          supabase.from("profiles").select("full_name, email").eq("id", errandData.customer_id).single(),
          supabase.from("profiles").select("full_name").eq("id", offer.runner_id).single(),
        ]);
        if (customerResult.data?.email) {
          const emailContent = runnerAssignedEmail(
            customerResult.data.full_name || "there",
            runnerResult.data?.full_name || "Your runner",
            errandData.display_id
          );
          sendEmail(customerResult.data.email, emailContent.subject, emailContent.html, emailContent.text);
        }
      }
    } catch (e) {
      console.error("[Assignment] Failed to send assigned email:", e);
    }

    return { error: null };
  } else {
    // Decline: update offer, try next runner
    await supabase
      .from("job_offers")
      .update({ status: "declined", responded_at: new Date().toISOString() })
      .eq("id", offerId);

    // Offer to next runner
    await offerToNextRunner(offer.errand_id);
    return { error: null };
  }
}

/**
 * Expire a pending offer and offer to the next runner.
 */
export async function expireOffer(offerId: string) {
  const supabase = createAdminClient();

  const { data: offer } = await supabase
    .from("job_offers")
    .select("errand_id")
    .eq("id", offerId)
    .eq("status", "pending")
    .single();

  if (!offer) return;

  await supabase
    .from("job_offers")
    .update({ status: "expired", responded_at: new Date().toISOString() })
    .eq("id", offerId);

  await offerToNextRunner(offer.errand_id);
}

/**
 * Find the next eligible runner and create an offer.
 * If none available, errand stays in pending for manual admin handling.
 */
export async function offerToNextRunner(errandId: string) {
  const runners = await findEligibleRunners(errandId);

  if (runners.length === 0) {
    console.log(`[Assignment] No more eligible runners for errand ${errandId}`);
    return;
  }

  await createJobOffer(errandId, runners[0].id);
}
