"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "./server";
import type { Enums, TablesInsert } from "@/types/database";
import { sendEmail } from "@/lib/email/send";
import {
  bookingConfirmationEmail,
  runnerAssignedEmail,
  errandCompletedEmail,
  runnerEnRouteEmail,
  pickupCompleteEmail,
  errandCancelledEmail,
  disputeResolvedEmail,
  runnerWelcomeEmail,
  runnerVerifiedEmail,
  runnerRejectedEmail,
} from "@/lib/email/templates";

// ============================================
// Auth Actions
// ============================================

export async function signUpWithEmail(
  name: string,
  email: string,
  password: string
) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) return { error: error.message };

  // Supabase handles the confirmation email automatically
  // Check if email confirmation is required (user won't have a session yet)
  const needsConfirmation = !data.session;

  return { data, needsConfirmation, error: null };
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error: error.message };

  // Get the user's role to redirect properly
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const role = profile?.role ?? "customer";
  return { data, role, error: null };
}

export async function resendConfirmationEmail(email: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
    },
  });
  if (error) return { error: error.message };
  return { error: null };
}

export async function resetPasswordRequest(email: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/forgot-password?step=reset`,
  });
  if (error) return { error: error.message };
  return { error: null };
}

export async function updatePassword(newPassword: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) return { error: error.message };
  return { error: null };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function setUserRole(role: "customer" | "runner") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Upsert to handle edge case where profile row is missing
  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        role,
        email: user.email ?? "",
        full_name: user.user_metadata?.full_name ?? "",
      },
      { onConflict: "id" }
    );

  if (error) return { error: error.message };

  // Send runner welcome email when user chooses runner role
  if (role === "runner") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();
    if (profile?.email) {
      const emailContent = runnerWelcomeEmail(profile.full_name || "there");
      sendEmail(profile.email, emailContent.subject, emailContent.html, emailContent.text);
    }
  }

  revalidatePath("/", "layout");
  return { error: null, redirectTo: role === "customer" ? "/dashboard" : "/runner" };
}

// ============================================
// Profile Actions
// ============================================

export async function updateProfile(updates: {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return { error: null };
}

export async function updateNotificationPreferences(updates: {
  push_enabled?: boolean;
  sms_enabled?: boolean;
  email_enabled?: boolean;
  job_updates?: boolean;
  promotions?: boolean;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("notification_preferences")
    .update(updates)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return { error: null };
}

// ============================================
// Errand Actions
// ============================================

export async function createErrand(
  errand: Omit<
    TablesInsert<"errands">,
    "id" | "display_id" | "created_at" | "updated_at" | "status"
  >
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated", data: null };

  // Generate a temporary display_id — the trigger will replace it
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const tempDisplayId = `ERR-${dateStr}-000`;

  const { data, error } = await supabase
    .from("errands")
    .insert({
      ...errand,
      customer_id: user.id,
      display_id: tempDisplayId,
      status: "pending",
    })
    .select()
    .single();

  if (error) return { error: error.message, data: null };

  // Send booking confirmation email (fire-and-forget)
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();
    if (profile?.email) {
      const email = bookingConfirmationEmail(
        profile.full_name || "there",
        data.type,
        data.display_id,
        data.scheduled_date || "",
        data.pickup_address || "",
        data.dropoff_address || "",
        data.total_price || 0
      );
      sendEmail(profile.email, email.subject, email.html, email.text);
    }
  } catch (e) {
    console.error("[Email] Booking confirmation failed:", e);
  }

  // Initiate runner auto-assignment (fire-and-forget)
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    fetch(`${appUrl}/api/assignment/initiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ errandId: data.id }),
    });
  } catch (e) {
    console.error("[Assignment] Failed to initiate:", e);
  }

  revalidatePath("/dashboard");
  return { error: null, data };
}

export async function cancelErrand(errandId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Get errand to check status and payment
  const { data: errand } = await supabase
    .from("errands")
    .select("status, stripe_payment_intent_id, customer_id")
    .eq("id", errandId)
    .single();

  if (!errand) return { error: "Errand not found" };

  // Only the customer or admin can cancel
  if (errand.customer_id !== user.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      return { error: "Only the customer or an admin can cancel this errand" };
    }
  }

  // Only allow cancellation of pending/finding_runner/runner_assigned errands
  if (!["pending", "finding_runner", "runner_assigned"].includes(errand.status)) {
    return { error: "This errand can no longer be cancelled. File a dispute instead." };
  }

  // Cancel the Stripe payment intent (release the hold) if one exists
  if (errand.stripe_payment_intent_id) {
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      await fetch(`${appUrl}/api/stripe/cancel-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId: errand.stripe_payment_intent_id }),
      });
    } catch (e) {
      console.error("[Stripe] Failed to cancel payment intent:", e);
    }
  }

  const { error } = await supabase
    .from("errands")
    .update({ status: "cancelled" as Enums<"errand_status"> })
    .eq("id", errandId);

  if (error) return { error: error.message };

  // Send cancellation email (fire-and-forget)
  try {
    const { data: customerProfile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", errand.customer_id)
      .single();

    // We need the display_id
    const { data: errandData } = await supabase
      .from("errands")
      .select("display_id")
      .eq("id", errandId)
      .single();

    if (customerProfile?.email && errandData) {
      const emailContent = errandCancelledEmail(
        customerProfile.full_name || "there",
        errandData.display_id
      );
      sendEmail(customerProfile.email, emailContent.subject, emailContent.html, emailContent.text);
    }
  } catch (e) {
    console.error("[Email] Cancellation notification failed:", e);
  }

  revalidatePath("/dashboard");
  return { error: null };
}

export async function addTip(errandId: string, tipAmount: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };
  if (tipAmount < 0 || tipAmount > 50) return { error: "Tip must be between €0 and €50" };

  // Get the errand first to recalculate totals
  const { data: errand } = await supabase
    .from("errands")
    .select("base_fee, distance_fee, urgency_fee")
    .eq("id", errandId)
    .eq("customer_id", user.id)
    .single();

  if (!errand) return { error: "Errand not found" };

  const newTotal = (errand.base_fee || 0) + (errand.distance_fee || 0) + (errand.urgency_fee || 0) + tipAmount;
  const platformFee = Math.round((newTotal - tipAmount) * 0.2 * 100) / 100;
  const runnerPayout = newTotal - platformFee;

  const { error } = await supabase
    .from("errands")
    .update({
      tip: tipAmount,
      total_price: newTotal,
      platform_fee: platformFee,
      runner_payout: runnerPayout,
    })
    .eq("id", errandId)
    .eq("customer_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { error: null };
}

// ============================================
// Runner Actions
// ============================================

export async function acceptJob(errandId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Check concurrent job limit (max 3 active jobs)
  const { count } = await supabase
    .from("errands")
    .select("id", { count: "exact", head: true })
    .eq("runner_id", user.id)
    .in("status", ["runner_assigned", "in_progress"]);

  if ((count ?? 0) >= 3) {
    return { error: "You already have 3 active jobs. Complete one before accepting another." };
  }

  const { error } = await supabase
    .from("errands")
    .update({
      runner_id: user.id,
      status: "in_progress" as Enums<"errand_status">,
      current_phase: "en_route_pickup",
    })
    .eq("id", errandId)
    .eq("status", "pending"); // Only accept if still pending

  if (error) return { error: error.message };

  // Send runner-assigned email to customer (fire-and-forget)
  try {
    const { data: errand } = await supabase
      .from("errands")
      .select("customer_id, display_id")
      .eq("id", errandId)
      .single();
    if (errand) {
      const [customerResult, runnerResult] = await Promise.all([
        supabase.from("profiles").select("full_name, email").eq("id", errand.customer_id).single(),
        supabase.from("profiles").select("full_name").eq("id", user.id).single(),
      ]);
      const customer = customerResult.data;
      const runner = runnerResult.data;
      if (customer?.email) {
        const emailContent = runnerAssignedEmail(
          customer.full_name || "there",
          runner?.full_name || "Your runner",
          errand.display_id
        );
        sendEmail(customer.email, emailContent.subject, emailContent.html, emailContent.text, "job_update");
      }
    }
  } catch (e) {
    console.error("[Email] Runner assigned notification failed:", e);
  }

  revalidatePath("/runner");
  return { error: null };
}

export async function updateErrandPhase(
  errandId: string,
  phase: string,
  status?: Enums<"errand_status">
) {
  const supabase = await createClient();
  const updates: Record<string, unknown> = { current_phase: phase };

  if (status) {
    updates.status = status;
  }
  if (phase === "complete" || status === "completed") {
    updates.completed_at = new Date().toISOString();
    updates.status = "completed";
  }
  if (phase === "en_route_pickup" && !status) {
    updates.status = "in_progress";
  }

  const { error } = await supabase
    .from("errands")
    .update(updates)
    .eq("id", errandId);

  if (error) return { error: error.message };

  // Auto-capture Stripe payment on job completion (fire-and-forget)
  if (phase === "complete" || status === "completed") {
    try {
      const { data: completedErrand } = await supabase
        .from("errands")
        .select("stripe_payment_intent_id")
        .eq("id", errandId)
        .single();

      if (completedErrand?.stripe_payment_intent_id) {
        const { stripe } = await import("@/lib/stripe/server");
        await stripe.paymentIntents.capture(completedErrand.stripe_payment_intent_id);
        console.log(`[Payment] Auto-captured payment for errand ${errandId}`);
      }
    } catch (captureErr) {
      // Log but don't fail — admin can manually capture via dashboard
      console.error(`[Payment] Auto-capture failed for errand ${errandId}:`, captureErr);
    }
  }

  // Send milestone emails (fire-and-forget)
  try {
    const { data: errand } = await supabase
      .from("errands")
      .select("customer_id, display_id, pickup_address, runner_id")
      .eq("id", errandId)
      .single();

    if (errand) {
      const { data: customer } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", errand.customer_id)
        .single();

      const runnerName = errand.runner_id
        ? (await supabase.from("profiles").select("full_name").eq("id", errand.runner_id).single()).data?.full_name ?? "Your runner"
        : "Your runner";

      if (customer?.email) {
        if (phase === "en_route_pickup") {
          const emailContent = runnerEnRouteEmail(
            customer.full_name || "there",
            runnerName,
            errand.display_id,
            errand.pickup_address || ""
          );
          sendEmail(customer.email, emailContent.subject, emailContent.html, emailContent.text, "job_update");
        } else if (phase === "en_route_dropoff") {
          const emailContent = pickupCompleteEmail(
            customer.full_name || "there",
            runnerName,
            errand.display_id
          );
          sendEmail(customer.email, emailContent.subject, emailContent.html, emailContent.text, "job_update");
        } else if (phase === "complete" || status === "completed") {
          const emailContent = errandCompletedEmail(
            customer.full_name || "there",
            errand.display_id
          );
          sendEmail(customer.email, emailContent.subject, emailContent.html, emailContent.text);
        }
      }
    }
  } catch (e) {
    console.error("[Email] Milestone notification failed:", e);
  }

  revalidatePath("/runner");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function updateRunnerProfile(updates: {
  transport_mode?: Enums<"transport_mode">;
  is_available?: boolean;
  availability_zones?: string[];
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("runner_profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/runner/settings");
  return { error: null };
}

export async function uploadProofPhoto(
  errandId: string,
  type: "pickup" | "dropoff",
  file: File,
  gpsLat?: number,
  gpsLng?: number,
  notes?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Validate file size (10 MB max)
  const { validateUploadFile } = await import("@/lib/validation");
  const validation = validateUploadFile(file);
  if (validation.error) return { error: validation.error };

  // Upload to storage
  const filePath = `${errandId}/${type}-${Date.now()}.${file.name.split(".").pop()}`;
  const { error: uploadError } = await supabase.storage
    .from("proof-photos")
    .upload(filePath, file);

  if (uploadError) return { error: uploadError.message };

  // Create proof record
  const { error: insertError } = await supabase
    .from("proof_photos")
    .insert({
      errand_id: errandId,
      type,
      storage_path: filePath,
      gps_lat: gpsLat ?? null,
      gps_lng: gpsLng ?? null,
      notes: notes ?? null,
    });

  if (insertError) return { error: insertError.message };

  revalidatePath(`/runner/jobs/${errandId}`);
  revalidatePath(`/dashboard/errands/${errandId}`);
  return { error: null };
}

// ============================================
// Chat Actions
// ============================================

export async function sendMessage(
  errandId: string,
  message: string,
  senderRole: "customer" | "runner"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("chat_messages").insert({
    errand_id: errandId,
    sender_id: user.id,
    sender_role: senderRole,
    message,
  });

  if (error) return { error: error.message };
  return { error: null };
}

// ============================================
// Rating Actions
// ============================================

export async function submitRating(
  errandId: string,
  toUserId: string,
  rating: number,
  comment?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("ratings").insert({
    errand_id: errandId,
    from_user_id: user.id,
    to_user_id: toUserId,
    rating,
    comment: comment ?? null,
  });

  if (error) return { error: error.message };
  return { error: null };
}

// ============================================
// Dispute Actions
// ============================================

export async function fileDispute(
  errandId: string,
  reason: string,
  description: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Temporary display_id — trigger will replace
  const { error } = await supabase.from("disputes").insert({
    errand_id: errandId,
    filed_by: user.id,
    reason,
    description,
    display_id: "DSP-000",
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { error: null };
}

// ============================================
// Admin Actions
// ============================================

export async function adminUpdateErrandStatus(
  errandId: string,
  status: Enums<"errand_status">
) {
  const supabase = await createClient();
  const updates: Record<string, unknown> = { status };
  if (status === "completed") {
    updates.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("errands")
    .update(updates)
    .eq("id", errandId);

  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/jobs");
  return { error: null };
}

export async function adminReassignRunner(
  errandId: string,
  newRunnerId: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("errands")
    .update({
      runner_id: newRunnerId,
      status: "runner_assigned" as Enums<"errand_status">,
      current_phase: "job_details",
    })
    .eq("id", errandId);

  if (error) return { error: error.message };
  revalidatePath("/admin/jobs");
  return { error: null };
}

export async function adminUpdateRunnerStatus(
  runnerId: string,
  status: Enums<"runner_status">
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("runner_profiles")
    .update({ status })
    .eq("id", runnerId);

  if (error) return { error: error.message };
  revalidatePath("/admin/runners");
  return { error: null };
}

export async function adminToggleRunnerVerified(
  runnerId: string,
  verified: boolean
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("runner_profiles")
    .update({ verified })
    .eq("id", runnerId);

  if (error) return { error: error.message };

  // Send verified/rejected email to runner
  const { data: runnerProfile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", runnerId)
    .single();
  if (runnerProfile?.email) {
    const emailContent = verified
      ? runnerVerifiedEmail(runnerProfile.full_name || "there")
      : runnerRejectedEmail(runnerProfile.full_name || "there");
    sendEmail(runnerProfile.email, emailContent.subject, emailContent.html, emailContent.text);
  }

  revalidatePath("/admin/runners");
  return { error: null };
}

export async function adminResolveDispute(
  disputeId: string,
  resolution: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Get dispute details before resolving (for email)
  const { data: dispute } = await supabase
    .from("disputes")
    .select("errand_id, filed_by")
    .eq("id", disputeId)
    .single();

  const { error } = await supabase
    .from("disputes")
    .update({
      status: "resolved" as Enums<"dispute_status">,
      resolution,
      resolved_by: user.id,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", disputeId);

  if (error) return { error: error.message };

  // Send dispute resolved email to the customer who filed it
  if (dispute) {
    const { data: errand } = await supabase
      .from("errands")
      .select("display_id")
      .eq("id", dispute.errand_id)
      .single();
    const { data: filer } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", dispute.filed_by)
      .single();
    if (filer?.email && errand) {
      const emailContent = disputeResolvedEmail(
        filer.full_name || "there",
        errand.display_id,
        resolution
      );
      sendEmail(filer.email, emailContent.subject, emailContent.html, emailContent.text);
    }
  }

  revalidatePath("/admin/disputes");
  return { error: null };
}

export async function adminUpdatePayoutStatus(
  payoutId: string,
  status: Enums<"payout_status">
) {
  const supabase = await createClient();
  const updates: Record<string, unknown> = { status };
  if (status === "completed") {
    updates.processed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("payouts")
    .update(updates)
    .eq("id", payoutId);

  if (error) return { error: error.message };
  revalidatePath("/admin/payouts");
  return { error: null };
}
