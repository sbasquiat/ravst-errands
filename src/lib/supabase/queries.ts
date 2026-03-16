"use server";

import { createClient } from "./server";
import type {
  Profile,
  Errand,
  ErrandTimeline,
  ProofPhoto,
  ChatMessage,
  RunnerProfile,
  Payout,
  Dispute,
  DisputeEvidence,
  NotificationPreferences,
  Subscription,
  Rating,
  Enums,
} from "@/types/database";

// ============================================
// Auth / Profile Queries
// ============================================

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}

export async function getRunnerProfile(
  userId: string
): Promise<(RunnerProfile & { profile: Profile }) | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("runner_profiles")
    .select("*, profile:profiles(*)")
    .eq("id", userId)
    .single();
  return data as (RunnerProfile & { profile: Profile }) | null;
}

export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();
  return data;
}

// ============================================
// Errand Queries (Customer)
// ============================================

export async function getCustomerErrands(
  customerId: string,
  filter?: "all" | "active" | "completed"
) {
  const supabase = await createClient();
  let query = supabase
    .from("errands")
    .select(
      `*,
       runner:runner_id(
         id,
         profile:profiles(full_name, avatar_url, phone)
       )`
    )
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (filter === "active") {
    query = query.in("status", [
      "pending",
      "finding_runner",
      "runner_assigned",
      "in_progress",
    ]);
  } else if (filter === "completed") {
    query = query.in("status", ["completed", "cancelled", "disputed"]);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getErrandById(errandId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("errands")
    .select(
      `*,
       customer:customer_id(id, full_name, email, phone, avatar_url),
       runner:runner_id(
         id,
         profile:profiles(full_name, phone, avatar_url),
         rating, transport_mode, jobs_completed
       )`
    )
    .eq("id", errandId)
    .single();

  if (error) throw error;
  return data;
}

export async function getErrandByDisplayId(displayId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("errands")
    .select(
      `*,
       customer:customer_id(id, full_name, email, phone, avatar_url),
       runner:runner_id(
         id,
         profile:profiles(full_name, phone, avatar_url),
         rating, transport_mode, jobs_completed
       )`
    )
    .eq("display_id", displayId)
    .single();

  if (error) throw error;
  return data;
}

export async function getErrandTimeline(
  errandId: string
): Promise<ErrandTimeline[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("errand_timeline")
    .select("*")
    .eq("errand_id", errandId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getErrandProofs(
  errandId: string
): Promise<ProofPhoto[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proof_photos")
    .select("*")
    .eq("errand_id", errandId)
    .order("captured_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getErrandMessages(
  errandId: string
): Promise<(ChatMessage & { sender: Pick<Profile, "full_name" | "avatar_url"> })[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*, sender:sender_id(full_name, avatar_url)")
    .eq("errand_id", errandId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as (ChatMessage & {
    sender: Pick<Profile, "full_name" | "avatar_url">;
  })[];
}

// ============================================
// Runner Queries
// ============================================

export async function getAvailableJobs() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("errands")
    .select(
      `*,
       customer:customer_id(full_name, avatar_url)`
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getRunnerJobs(
  runnerId: string,
  filter?: "active" | "completed"
) {
  const supabase = await createClient();
  let query = supabase
    .from("errands")
    .select(
      `*,
       customer:customer_id(full_name, phone, avatar_url)`
    )
    .eq("runner_id", runnerId)
    .order("created_at", { ascending: false });

  if (filter === "active") {
    query = query.in("status", [
      "runner_assigned",
      "in_progress",
    ]);
  } else if (filter === "completed") {
    query = query.in("status", ["completed", "cancelled"]);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getPendingOffers(runnerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_offers")
    .select(
      `*,
       errand:errand_id(
         id, display_id, type, item_description, pickup_address, dropoff_address,
         scheduled_date, runner_payout, total_price, distance_km, time_slot_start, time_slot_end, urgency_fee,
         customer:customer_id(full_name, avatar_url)
       )`
    )
    .eq("runner_id", runnerId)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("offered_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getRunnerPayouts(runnerId: string): Promise<Payout[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payouts")
    .select("*")
    .eq("runner_id", runnerId)
    .order("scheduled_date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getRunnerRatings(runnerId: string): Promise<Rating[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ratings")
    .select("*, from_user:from_user_id(full_name, avatar_url)")
    .eq("to_user_id", runnerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getRunnerDocuments(runnerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("runner_documents")
    .select("*")
    .eq("runner_id", runnerId)
    .order("uploaded_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ============================================
// Subscription Queries
// ============================================

export async function getCustomerSubscription(
  customerId: string
): Promise<Subscription | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("customer_id", customerId)
    .eq("status", "active")
    .single();
  return data;
}

// ============================================
// Admin Queries
// ============================================

export async function getAllErrands(
  status?: Enums<"errand_status">,
  limit = 50
) {
  const supabase = await createClient();
  let query = supabase
    .from("errands")
    .select(
      `*,
       customer:customer_id(id, full_name, email, avatar_url),
       runner:runner_id(
         id,
         profile:profiles(full_name, avatar_url),
         rating
       )`
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getAllRunners() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("runner_profiles")
    .select("*, profile:profiles(full_name, email, phone, avatar_url, created_at)")
    .order("jobs_completed", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getAllCustomers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getAllDisputes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("disputes")
    .select(
      `*,
       errand:errand_id(display_id, type, item_description),
       filer:filed_by(id, full_name, email),
       evidence:dispute_evidence(*)`
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getAllPayouts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payouts")
    .select(
      `*,
       runner:runner_id(
         id,
         profile:profiles(full_name, email)
       )`
    )
    .order("scheduled_date", { ascending: false });

  if (error) throw error;
  return data;
}

// ============================================
// Admin Stats
// ============================================

export async function getAdminStats() {
  const supabase = await createClient();

  const [errandsRes, runnersRes, customersRes, disputesRes, payoutsRes] =
    await Promise.all([
      supabase.from("errands").select("id, status, total_price, created_at"),
      supabase.from("runner_profiles").select("id, status"),
      supabase.from("profiles").select("id").eq("role", "customer"),
      supabase.from("disputes").select("id, status"),
      supabase.from("payouts").select("id, amount, status"),
    ]);

  const errands = errandsRes.data ?? [];
  const runners = runnersRes.data ?? [];
  const customers = customersRes.data ?? [];
  const disputes = disputesRes.data ?? [];
  const payouts = payoutsRes.data ?? [];

  return {
    totalErrands: errands.length,
    activeErrands: errands.filter((e) =>
      ["pending", "finding_runner", "runner_assigned", "in_progress"].includes(
        e.status
      )
    ).length,
    completedErrands: errands.filter((e) => e.status === "completed").length,
    totalRevenue: errands
      .filter((e) => e.status === "completed")
      .reduce((sum, e) => sum + e.total_price, 0),
    totalRunners: runners.length,
    activeRunners: runners.filter((r) => r.status === "active").length,
    totalCustomers: customers.length,
    openDisputes: disputes.filter((d) =>
      ["open", "investigating"].includes(d.status)
    ).length,
    pendingPayouts: payouts
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0),
  };
}

// ============================================
// Pricing
// ============================================

export async function calculatePricing(
  type: Enums<"errand_type">,
  distanceKm: number,
  isUrgent = false
) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("calculate_pricing", {
    p_type: type,
    p_distance_km: distanceKm,
    p_is_urgent: isUrgent,
  });

  if (error) throw error;
  return data?.[0] ?? null;
}
