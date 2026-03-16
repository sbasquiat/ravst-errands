import { getResend, fromEmail } from "./resend";
import { createAdminClient } from "@/lib/supabase/server";

export type EmailCategory = "transactional" | "job_update" | "promotional";

/**
 * Send an email with optional preference checks.
 *
 * - "transactional" emails (payment, booking, dispute, security) always send.
 * - "job_update" emails check `email_enabled` + `job_updates` preferences.
 * - "promotional" emails check `email_enabled` + `promotions` preferences.
 *
 * Pass category = "transactional" (default) to skip preference checks.
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string,
  category: EmailCategory = "transactional"
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY not set, skipping email send");
    return { error: null };
  }

  // Check email preferences for non-transactional emails
  if (category !== "transactional") {
    try {
      const supabase = createAdminClient();
      // Look up user by email → get their notification preferences
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", to)
        .single();

      if (profile) {
        const { data: prefs } = await supabase
          .from("notification_preferences")
          .select("email_enabled, job_updates, promotions")
          .eq("user_id", profile.id)
          .single();

        if (prefs) {
          // Global email opt-out
          if (!prefs.email_enabled) {
            console.log(`[Email] Skipped (email disabled) for ${to}: ${subject}`);
            return { error: null };
          }
          // Category-specific opt-out
          if (category === "job_update" && !prefs.job_updates) {
            console.log(`[Email] Skipped (job updates disabled) for ${to}: ${subject}`);
            return { error: null };
          }
          if (category === "promotional" && !prefs.promotions) {
            console.log(`[Email] Skipped (promotions disabled) for ${to}: ${subject}`);
            return { error: null };
          }
        }
      }
    } catch {
      // If preference check fails, send the email anyway
      console.warn("[Email] Failed to check preferences, sending anyway");
    }
  }

  try {
    const { error } = await getResend().emails.send({
      from: fromEmail,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("[Email] Failed to send:", error);
      return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    console.error("[Email] Unexpected error:", err);
    return { error: "Failed to send email" };
  }
}
