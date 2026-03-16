export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chat_messages: {
        Row: {
          created_at: string
          errand_id: string
          id: string
          message: string
          sender_id: string
          sender_role: Database["public"]["Enums"]["sender_role"]
        }
        Insert: {
          created_at?: string
          errand_id: string
          id?: string
          message: string
          sender_id: string
          sender_role: Database["public"]["Enums"]["sender_role"]
        }
        Update: {
          created_at?: string
          errand_id?: string
          id?: string
          message?: string
          sender_id?: string
          sender_role?: Database["public"]["Enums"]["sender_role"]
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_errand_id_fkey"
            columns: ["errand_id"]
            isOneToOne: false
            referencedRelation: "errands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dispute_evidence: {
        Row: {
          content: string | null
          created_at: string
          dispute_id: string
          id: string
          label: string
          storage_path: string | null
          type: Database["public"]["Enums"]["evidence_type"]
        }
        Insert: {
          content?: string | null
          created_at?: string
          dispute_id: string
          id?: string
          label: string
          storage_path?: string | null
          type: Database["public"]["Enums"]["evidence_type"]
        }
        Update: {
          content?: string | null
          created_at?: string
          dispute_id?: string
          id?: string
          label?: string
          storage_path?: string | null
          type?: Database["public"]["Enums"]["evidence_type"]
        }
        Relationships: [
          {
            foreignKeyName: "dispute_evidence_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      job_offers: {
        Row: {
          id: string
          errand_id: string
          runner_id: string
          status: Database["public"]["Enums"]["job_offer_status"]
          offered_at: string
          expires_at: string
          responded_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          errand_id: string
          runner_id: string
          status?: Database["public"]["Enums"]["job_offer_status"]
          offered_at?: string
          expires_at?: string
          responded_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          errand_id?: string
          runner_id?: string
          status?: Database["public"]["Enums"]["job_offer_status"]
          offered_at?: string
          expires_at?: string
          responded_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_offers_errand_id_fkey"
            columns: ["errand_id"]
            isOneToOne: false
            referencedRelation: "errands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_offers_runner_id_fkey"
            columns: ["runner_id"]
            isOneToOne: false
            referencedRelation: "runner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          created_at: string
          description: string
          display_id: string
          errand_id: string
          filed_by: string
          id: string
          priority: Database["public"]["Enums"]["dispute_priority"]
          reason: string
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["dispute_status"]
        }
        Insert: {
          created_at?: string
          description: string
          display_id: string
          errand_id: string
          filed_by: string
          id?: string
          priority?: Database["public"]["Enums"]["dispute_priority"]
          reason: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
        }
        Update: {
          created_at?: string
          description?: string
          display_id?: string
          errand_id?: string
          filed_by?: string
          id?: string
          priority?: Database["public"]["Enums"]["dispute_priority"]
          reason?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
        }
        Relationships: [
          {
            foreignKeyName: "disputes_errand_id_fkey"
            columns: ["errand_id"]
            isOneToOne: false
            referencedRelation: "errands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_filed_by_fkey"
            columns: ["filed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      errand_stops: {
        Row: {
          address: string
          errand_id: string
          id: string
          lat: number
          lng: number
          stop_order: number
        }
        Insert: {
          address: string
          errand_id: string
          id?: string
          lat?: number
          lng?: number
          stop_order?: number
        }
        Update: {
          address?: string
          errand_id?: string
          id?: string
          lat?: number
          lng?: number
          stop_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "errand_stops_errand_id_fkey"
            columns: ["errand_id"]
            isOneToOne: false
            referencedRelation: "errands"
            referencedColumns: ["id"]
          },
        ]
      }
      errand_timeline: {
        Row: {
          created_at: string
          description: string | null
          errand_id: string
          event_type: string
          id: string
          label: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          errand_id: string
          event_type: string
          id?: string
          label: string
        }
        Update: {
          created_at?: string
          description?: string | null
          errand_id?: string
          event_type?: string
          id?: string
          label?: string
        }
        Relationships: [
          {
            foreignKeyName: "errand_timeline_errand_id_fkey"
            columns: ["errand_id"]
            isOneToOne: false
            referencedRelation: "errands"
            referencedColumns: ["id"]
          },
        ]
      }
      errands: {
        Row: {
          base_fee: number
          collection_name: string | null
          completed_at: string | null
          created_at: string
          current_phase: string | null
          customer_id: string
          display_id: string
          distance_fee: number
          distance_km: number | null
          dropoff_address: string
          dropoff_lat: number
          dropoff_lng: number
          id: string
          item_description: string
          order_number: string | null
          package_size: string | null
          pickup_address: string
          pickup_lat: number
          pickup_lng: number
          platform_fee: number
          recipient_name: string | null
          runner_id: string | null
          runner_payout: number
          scheduled_date: string
          special_instructions: string | null
          status: Database["public"]["Enums"]["errand_status"]
          stripe_payment_intent_id: string | null
          time_slot_end: string
          time_slot_start: string
          tip: number
          total_price: number
          tracking_number: string | null
          type: Database["public"]["Enums"]["errand_type"]
          updated_at: string
          urgency_fee: number
        }
        Insert: {
          base_fee: number
          collection_name?: string | null
          completed_at?: string | null
          created_at?: string
          current_phase?: string | null
          customer_id: string
          display_id: string
          distance_fee?: number
          distance_km?: number | null
          dropoff_address: string
          dropoff_lat?: number
          dropoff_lng?: number
          id?: string
          item_description: string
          order_number?: string | null
          package_size?: string | null
          pickup_address: string
          pickup_lat?: number
          pickup_lng?: number
          platform_fee: number
          recipient_name?: string | null
          runner_id?: string | null
          runner_payout: number
          scheduled_date: string
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["errand_status"]
          stripe_payment_intent_id?: string | null
          time_slot_end: string
          time_slot_start: string
          tip?: number
          total_price: number
          tracking_number?: string | null
          type: Database["public"]["Enums"]["errand_type"]
          updated_at?: string
          urgency_fee?: number
        }
        Update: {
          base_fee?: number
          collection_name?: string | null
          completed_at?: string | null
          created_at?: string
          current_phase?: string | null
          customer_id?: string
          display_id?: string
          distance_fee?: number
          distance_km?: number | null
          dropoff_address?: string
          dropoff_lat?: number
          dropoff_lng?: number
          id?: string
          item_description?: string
          order_number?: string | null
          package_size?: string | null
          pickup_address?: string
          pickup_lat?: number
          pickup_lng?: number
          platform_fee?: number
          recipient_name?: string | null
          runner_id?: string | null
          runner_payout?: number
          scheduled_date?: string
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["errand_status"]
          stripe_payment_intent_id?: string | null
          time_slot_end?: string
          time_slot_start?: string
          tip?: number
          total_price?: number
          tracking_number?: string | null
          type?: Database["public"]["Enums"]["errand_type"]
          updated_at?: string
          urgency_fee?: number
        }
        Relationships: [
          {
            foreignKeyName: "errands_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "errands_runner_id_fkey"
            columns: ["runner_id"]
            isOneToOne: false
            referencedRelation: "runner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          email_enabled: boolean
          id: string
          job_updates: boolean
          promotions: boolean
          push_enabled: boolean
          sms_enabled: boolean
          user_id: string
        }
        Insert: {
          email_enabled?: boolean
          id?: string
          job_updates?: boolean
          promotions?: boolean
          push_enabled?: boolean
          sms_enabled?: boolean
          user_id: string
        }
        Update: {
          email_enabled?: boolean
          id?: string
          job_updates?: boolean
          promotions?: boolean
          push_enabled?: boolean
          sms_enabled?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_items: {
        Row: {
          amount: number
          errand_id: string
          id: string
          payout_id: string
          tip: number
        }
        Insert: {
          amount: number
          errand_id: string
          id?: string
          payout_id: string
          tip?: number
        }
        Update: {
          amount?: number
          errand_id?: string
          id?: string
          payout_id?: string
          tip?: number
        }
        Relationships: [
          {
            foreignKeyName: "payout_items_errand_id_fkey"
            columns: ["errand_id"]
            isOneToOne: false
            referencedRelation: "errands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_items_payout_id_fkey"
            columns: ["payout_id"]
            isOneToOne: false
            referencedRelation: "payouts"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount: number
          created_at: string
          display_id: string
          id: string
          job_count: number
          period_end: string
          period_start: string
          processed_at: string | null
          runner_id: string
          scheduled_date: string
          status: Database["public"]["Enums"]["payout_status"]
          stripe_transfer_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          display_id: string
          id?: string
          job_count: number
          period_end: string
          period_start: string
          processed_at?: string | null
          runner_id: string
          scheduled_date: string
          status?: Database["public"]["Enums"]["payout_status"]
          stripe_transfer_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          display_id?: string
          id?: string
          job_count?: number
          period_end?: string
          period_start?: string
          processed_at?: string | null
          runner_id?: string
          scheduled_date?: string
          status?: Database["public"]["Enums"]["payout_status"]
          stripe_transfer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payouts_runner_id_fkey"
            columns: ["runner_id"]
            isOneToOne: false
            referencedRelation: "runner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      proof_photos: {
        Row: {
          captured_at: string
          errand_id: string
          gps_lat: number | null
          gps_lng: number | null
          id: string
          notes: string | null
          storage_path: string
          type: Database["public"]["Enums"]["proof_photo_type"]
          verified: boolean
        }
        Insert: {
          captured_at?: string
          errand_id: string
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          notes?: string | null
          storage_path: string
          type: Database["public"]["Enums"]["proof_photo_type"]
          verified?: boolean
        }
        Update: {
          captured_at?: string
          errand_id?: string
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          notes?: string | null
          storage_path?: string
          type?: Database["public"]["Enums"]["proof_photo_type"]
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "proof_photos_errand_id_fkey"
            columns: ["errand_id"]
            isOneToOne: false
            referencedRelation: "errands"
            referencedColumns: ["id"]
          },
        ]
      }
      ratings: {
        Row: {
          comment: string | null
          created_at: string
          errand_id: string
          from_user_id: string
          id: string
          rating: number
          to_user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          errand_id: string
          from_user_id: string
          id?: string
          rating: number
          to_user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          errand_id?: string
          from_user_id?: string
          id?: string
          rating?: number
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_errand_id_fkey"
            columns: ["errand_id"]
            isOneToOne: false
            referencedRelation: "errands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      runner_locations: {
        Row: {
          id: string
          runner_id: string
          errand_id: string | null
          lat: number
          lng: number
          accuracy: number | null
          heading: number | null
          speed: number | null
          recorded_at: string
        }
        Insert: {
          id?: string
          runner_id: string
          errand_id?: string | null
          lat: number
          lng: number
          accuracy?: number | null
          heading?: number | null
          speed?: number | null
          recorded_at?: string
        }
        Update: {
          id?: string
          runner_id?: string
          errand_id?: string | null
          lat?: number
          lng?: number
          accuracy?: number | null
          heading?: number | null
          speed?: number | null
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runner_locations_runner_id_fkey"
            columns: ["runner_id"]
            isOneToOne: false
            referencedRelation: "runner_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runner_locations_errand_id_fkey"
            columns: ["errand_id"]
            isOneToOne: false
            referencedRelation: "errands"
            referencedColumns: ["id"]
          },
        ]
      }
      runner_documents: {
        Row: {
          expires_at: string | null
          id: string
          runner_id: string
          status: Database["public"]["Enums"]["document_status"]
          storage_path: string | null
          type: Database["public"]["Enums"]["document_type"]
          uploaded_at: string
        }
        Insert: {
          expires_at?: string | null
          id?: string
          runner_id: string
          status?: Database["public"]["Enums"]["document_status"]
          storage_path?: string | null
          type: Database["public"]["Enums"]["document_type"]
          uploaded_at?: string
        }
        Update: {
          expires_at?: string | null
          id?: string
          runner_id?: string
          status?: Database["public"]["Enums"]["document_status"]
          storage_path?: string | null
          type?: Database["public"]["Enums"]["document_type"]
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runner_documents_runner_id_fkey"
            columns: ["runner_id"]
            isOneToOne: false
            referencedRelation: "runner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      runner_profiles: {
        Row: {
          availability_zones: string[]
          documents_complete: boolean
          id: string
          is_available: boolean
          jobs_completed: number
          rating: number
          status: Database["public"]["Enums"]["runner_status"]
          stripe_connect_account_id: string | null
          total_earnings: number
          transport_mode: Database["public"]["Enums"]["transport_mode"]
          verified: boolean
        }
        Insert: {
          availability_zones?: string[]
          documents_complete?: boolean
          id: string
          is_available?: boolean
          jobs_completed?: number
          rating?: number
          status?: Database["public"]["Enums"]["runner_status"]
          stripe_connect_account_id?: string | null
          total_earnings?: number
          transport_mode?: Database["public"]["Enums"]["transport_mode"]
          verified?: boolean
        }
        Update: {
          availability_zones?: string[]
          documents_complete?: boolean
          id?: string
          is_available?: boolean
          jobs_completed?: number
          rating?: number
          status?: Database["public"]["Enums"]["runner_status"]
          stripe_connect_account_id?: string | null
          total_earnings?: number
          transport_mode?: Database["public"]["Enums"]["transport_mode"]
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "runner_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string
          current_period_start: string
          customer_id: string
          errands_remaining: number | null
          id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_subscription_id: string | null
        }
        Insert: {
          created_at?: string
          current_period_end: string
          current_period_start: string
          customer_id: string
          errands_remaining?: number | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_subscription_id?: string | null
        }
        Update: {
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          customer_id?: string
          errands_remaining?: number | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_pricing: {
        Args: {
          p_distance_km: number
          p_is_urgent?: boolean
          p_type: Database["public"]["Enums"]["errand_type"]
        }
        Returns: {
          base_fee: number
          distance_fee: number
          platform_fee: number
          runner_payout: number
          total_price: number
          urgency_fee: number
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      dispute_priority: "high" | "medium" | "low"
      dispute_status: "open" | "investigating" | "resolved" | "escalated"
      document_status: "pending" | "verified" | "expired" | "rejected"
      document_type:
        | "id_verification"
        | "background_check"
        | "insurance"
        | "transport_cert"
      errand_status:
        | "pending"
        | "finding_runner"
        | "runner_assigned"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "disputed"
      errand_type: "returns" | "handoffs" | "collect"
      job_offer_status: "pending" | "accepted" | "declined" | "expired"
      evidence_type: "photo" | "text" | "gps"
      payout_status: "pending" | "processing" | "completed" | "failed"
      proof_photo_type: "pickup" | "dropoff"
      runner_status: "pending" | "active" | "inactive" | "suspended"
      sender_role: "customer" | "runner" | "system"
      subscription_plan: "pay_as_you_go" | "starter" | "regular" | "power"
      subscription_status: "active" | "cancelled" | "past_due"
      transport_mode: "bicycle" | "walking" | "car"
      user_role: "customer" | "runner" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ============================================
// Convenience type helpers
// ============================================

type PublicSchema = Database["public"]

/** Row types — what you get back from a SELECT */
export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"]

/** Insert types — what you pass to an INSERT */
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"]

/** Update types — what you pass to an UPDATE */
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"]

/** Enum types */
export type Enums<T extends keyof PublicSchema["Enums"]> =
  PublicSchema["Enums"][T]

// ============================================
// Named row type aliases for clean imports
// ============================================

export type Profile = Tables<"profiles">
export type RunnerProfile = Tables<"runner_profiles">
export type RunnerDocument = Tables<"runner_documents">
export type Errand = Tables<"errands">
export type ErrandStop = Tables<"errand_stops">
export type ErrandTimeline = Tables<"errand_timeline">
export type ProofPhoto = Tables<"proof_photos">
export type ChatMessage = Tables<"chat_messages">
export type Dispute = Tables<"disputes">
export type DisputeEvidence = Tables<"dispute_evidence">
export type Payout = Tables<"payouts">
export type PayoutItem = Tables<"payout_items">
export type NotificationPreferences = Tables<"notification_preferences">
export type Subscription = Tables<"subscriptions">
export type Rating = Tables<"ratings">
export type JobOffer = Tables<"job_offers">
export type RunnerLocation = Tables<"runner_locations">

// ============================================
// Joined / enriched types used by UI
// ============================================

/** Errand with customer and runner profile info */
export type ErrandWithParticipants = Errand & {
  customer: Pick<Profile, "id" | "full_name" | "email" | "phone" | "avatar_url">
  runner: (Pick<Profile, "id" | "full_name" | "phone" | "avatar_url"> & {
    runner_profile: Pick<RunnerProfile, "rating" | "transport_mode" | "jobs_completed">
  }) | null
}

/** Dispute with related errand and filer info */
export type DisputeWithDetails = Dispute & {
  errand: Pick<Errand, "display_id" | "type" | "item_description">
  filer: Pick<Profile, "id" | "full_name" | "email">
  evidence: DisputeEvidence[]
}

/** Payout with runner info */
export type PayoutWithRunner = Payout & {
  runner: Pick<Profile, "id" | "full_name" | "email">
}

/** Runner profile with base profile info */
export type RunnerWithProfile = RunnerProfile & {
  profile: Pick<Profile, "full_name" | "email" | "phone" | "avatar_url" | "created_at">
}

/** Pricing calculation result from database function */
export type PricingResult = {
  base_fee: number
  distance_fee: number
  urgency_fee: number
  total_price: number
  platform_fee: number
  runner_payout: number
}
