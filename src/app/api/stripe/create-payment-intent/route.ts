import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getClientIP, rateLimits, rateLimitResponse } from "@/lib/rate-limit";
import { createPaymentIntentSchema, parseBody } from "@/lib/validation";

export async function POST(request: NextRequest) {
  // Rate limit: 10 req/min per IP
  const ip = getClientIP(request);
  const limit = rateLimit(`payment:${ip}`, rateLimits.payment);
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
    const { data, error: validationError } = parseBody(createPaymentIntentSchema, body);

    if (!data) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { amount, errandId, errandDisplayId, idempotencyKey } = data;

    // Create PaymentIntent with manual capture (authorize-then-capture)
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: Math.round(amount * 100), // Convert euros to cents
        currency: "eur",
        capture_method: "manual", // Authorize now, capture on completion
        metadata: {
          errand_id: errandId ?? "",
          errand_display_id: errandDisplayId ?? "",
          customer_id: user.id,
        },
      },
      // Idempotency key prevents duplicate charges on retries
      idempotencyKey ? { idempotencyKey } : undefined
    );

    // Store the payment intent ID on the errand
    if (errandId) {
      await supabase
        .from("errands")
        .update({ stripe_payment_intent_id: paymentIntent.id })
        .eq("id", errandId);
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
