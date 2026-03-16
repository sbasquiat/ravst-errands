import { z } from "zod";

// ============================================
// Pricing
// ============================================

export const pricingSchema = z.object({
  type: z.enum(["returns", "handoffs", "collect"], {
    message: "Invalid errand type",
  }),
  distanceKm: z
    .number({ message: "Distance is required" })
    .min(0, "Distance must be positive")
    .max(100, "Distance cannot exceed 100 km"),
  isUrgent: z.boolean().optional().default(false),
});

export type PricingInput = z.infer<typeof pricingSchema>;

// ============================================
// Contact Form
// ============================================

export const contactSchema = z.object({
  name: z
    .string({ message: "Name is required" })
    .min(1, "Name is required")
    .max(100, "Name is too long"),
  email: z
    .string({ message: "Email is required" })
    .email("Invalid email address")
    .max(254, "Email is too long"),
  subject: z
    .string({ message: "Subject is required" })
    .min(1, "Subject is required")
    .max(200, "Subject is too long"),
  message: z
    .string({ message: "Message is required" })
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message is too long"),
});

export type ContactInput = z.infer<typeof contactSchema>;

// ============================================
// Payment Intent
// ============================================

export const createPaymentIntentSchema = z.object({
  amount: z
    .number({ message: "Amount is required" })
    .positive("Amount must be positive")
    .max(500, "Amount cannot exceed €500"),
  errandId: z.string().uuid("Invalid errand ID").optional(),
  errandDisplayId: z.string().max(20).optional(),
  idempotencyKey: z
    .string()
    .max(255, "Idempotency key is too long")
    .optional(),
});

export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;

// ============================================
// Assignment
// ============================================

export const initiateAssignmentSchema = z.object({
  errandId: z.string().uuid("Invalid errand ID"),
});

export const respondToOfferSchema = z.object({
  offerId: z.string().uuid("Invalid offer ID"),
  accept: z.boolean({ message: "Accept/decline is required" }),
});

// ============================================
// Geocoding
// ============================================

export const geocodeSchema = z.object({
  q: z
    .string({ message: "Query is required" })
    .min(3, "Query must be at least 3 characters")
    .max(200, "Query is too long"),
});

export const placeDetailsSchema = z.object({
  place_id: z
    .string({ message: "Place ID is required" })
    .min(1, "Place ID is required")
    .max(500, "Place ID is too long"),
});

// ============================================
// File Upload
// ============================================

/** Max file size: 10 MB */
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

/** Allowed MIME types for proof photos */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export function validateUploadFile(file: File): { error: string | null } {
  if (file.size > MAX_UPLOAD_SIZE) {
    return {
      error: `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum size is ${MAX_UPLOAD_SIZE / 1024 / 1024} MB.`,
    };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return {
      error: `File type "${file.type}" is not allowed. Accepted: JPEG, PNG, WebP, HEIC.`,
    };
  }

  return { error: null };
}

// ============================================
// GDPR
// ============================================

export const gdprExportSchema = z.object({
  format: z.enum(["json"]).optional().default("json"),
});

export const accountDeletionSchema = z.object({
  confirmation: z.literal("DELETE MY ACCOUNT", {
    message: "Please type 'DELETE MY ACCOUNT' to confirm",
  }),
});

// ============================================
// Helpers
// ============================================

/**
 * Parse and validate request body with a Zod schema.
 * Returns { data, error } — if error, return it as a 400 response.
 */
export function parseBody<T extends z.ZodType>(
  schema: T,
  body: unknown
): { data: z.infer<T>; error: null } | { data: null; error: string } {
  const result = schema.safeParse(body);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    return { data: null, error: firstIssue?.message ?? "Invalid input" };
  }
  return { data: result.data, error: null };
}
