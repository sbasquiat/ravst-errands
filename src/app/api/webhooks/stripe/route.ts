import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/server";
import type Stripe from "stripe";
import { sendEmail } from "@/lib/email/send";
import {
  disputeOpenedEmail,
  paymentCapturedEmail,
  paymentFailedEmail,
  refundIssuedEmail,
  subscriptionCreatedEmail,
  subscriptionCancelledEmail,
  payoutCompletedEmail,
  payoutFailedEmail,
} from "@/lib/email/templates";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // Payment was captured — update errand status
        await supabase
          .from("errands")
          .update({ status: "completed" })
          .eq("stripe_payment_intent_id", paymentIntent.id)
          .eq("status", "in_progress");

        // Add timeline event and send email
        const { data: errand } = await supabase
          .from("errands")
          .select("id, display_id, customer_id")
          .eq("stripe_payment_intent_id", paymentIntent.id)
          .single();

        if (errand) {
          await supabase.from("errand_timeline").insert({
            errand_id: errand.id,
            event_type: "payment_captured",
            label: "Payment captured",
            description: `Payment of €${(paymentIntent.amount / 100).toFixed(2)} captured successfully`,
          });

          // Send payment confirmation email
          const { data: customer } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", errand.customer_id)
            .single();
          if (customer?.email) {
            const emailContent = paymentCapturedEmail(
              customer.full_name || "there",
              errand.display_id,
              paymentIntent.amount / 100
            );
            sendEmail(customer.email, emailContent.subject, emailContent.html, emailContent.text);
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { data: failedErrand } = await supabase
          .from("errands")
          .select("id, display_id, customer_id")
          .eq("stripe_payment_intent_id", paymentIntent.id)
          .single();

        if (failedErrand) {
          const failReason = paymentIntent.last_payment_error?.message ?? "Payment could not be processed";
          await supabase.from("errand_timeline").insert({
            errand_id: failedErrand.id,
            event_type: "payment_failed",
            label: "Payment failed",
            description: failReason,
          });

          // Send payment failed email
          const { data: failCustomer } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", failedErrand.customer_id)
            .single();
          if (failCustomer?.email) {
            const emailContent = paymentFailedEmail(
              failCustomer.full_name || "there",
              failedErrand.display_id,
              failReason
            );
            sendEmail(failCustomer.email, emailContent.subject, emailContent.html, emailContent.text);
          }
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const refundPaymentIntentId = charge.payment_intent as string;

        const { data: refundErrand } = await supabase
          .from("errands")
          .select("id, display_id, customer_id")
          .eq("stripe_payment_intent_id", refundPaymentIntentId)
          .single();

        if (refundErrand) {
          const refundAmount = charge.amount_refunded / 100;
          await supabase.from("errand_timeline").insert({
            errand_id: refundErrand.id,
            event_type: "refund_issued",
            label: "Refund issued",
            description: `Refund of €${refundAmount.toFixed(2)} processed`,
          });

          // Send refund email
          const { data: refundCustomer } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", refundErrand.customer_id)
            .single();
          if (refundCustomer?.email) {
            const emailContent = refundIssuedEmail(
              refundCustomer.full_name || "there",
              refundErrand.display_id,
              refundAmount
            );
            sendEmail(refundCustomer.email, emailContent.subject, emailContent.html, emailContent.text);
          }
        }
        break;
      }

      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        const paymentIntentId = dispute.payment_intent as string;

        const { data: errand } = await supabase
          .from("errands")
          .select("id, customer_id, display_id")
          .eq("stripe_payment_intent_id", paymentIntentId)
          .single();

        if (errand) {
          // Mark errand as disputed
          await supabase
            .from("errands")
            .update({ status: "disputed" })
            .eq("id", errand.id);

          // Count existing disputes for display ID
          const { count } = await supabase
            .from("disputes")
            .select("*", { count: "exact", head: true });

          const disputeNum = ((count ?? 0) + 1).toString().padStart(3, "0");

          // Create dispute record
          await supabase.from("disputes").insert({
            display_id: `DSP-${disputeNum}`,
            errand_id: errand.id,
            filed_by: errand.customer_id,
            reason: "stripe_dispute",
            description: `Stripe dispute filed: ${dispute.reason ?? "Unknown reason"}`,
            status: "open",
            priority: "high",
          });

          await supabase.from("errand_timeline").insert({
            errand_id: errand.id,
            event_type: "dispute_opened",
            label: "Dispute opened",
            description: "A payment dispute has been filed via Stripe",
          });

          // Send dispute email to customer (fire-and-forget)
          const { data: customer } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", errand.customer_id)
            .single();
          if (customer?.email) {
            const emailContent = disputeOpenedEmail(
              customer.full_name || "there",
              errand.display_id,
              dispute.reason ?? "Payment dispute filed"
            );
            sendEmail(customer.email, emailContent.subject, emailContent.html, emailContent.text);
          }
        }
        break;
      }

      case "transfer.created": {
        const transfer = event.data.object as Stripe.Transfer;
        const payoutId = transfer.metadata?.payout_id;
        if (payoutId) {
          await supabase
            .from("payouts")
            .update({ status: "processing", stripe_transfer_id: transfer.id })
            .eq("id", payoutId);
        }
        break;
      }

      case "transfer.updated": {
        const transfer = event.data.object as Stripe.Transfer;
        const completedPayoutId = transfer.metadata?.payout_id;
        if (completedPayoutId && !transfer.reversed) {
          // Get payout details before updating
          const { data: payoutRecord } = await supabase
            .from("payouts")
            .select("runner_id, amount, period_start, period_end")
            .eq("id", completedPayoutId)
            .single();

          await supabase
            .from("payouts")
            .update({ status: "completed", processed_at: new Date().toISOString() })
            .eq("id", completedPayoutId);

          // Send payout completed email to runner
          if (payoutRecord) {
            const { data: runner } = await supabase
              .from("profiles")
              .select("full_name, email")
              .eq("id", payoutRecord.runner_id)
              .single();
            if (runner?.email) {
              const emailContent = payoutCompletedEmail(
                runner.full_name || "there",
                payoutRecord.amount,
                payoutRecord.period_start,
                payoutRecord.period_end
              );
              sendEmail(runner.email, emailContent.subject, emailContent.html, emailContent.text);
            }
          }
        }
        break;
      }

      case "transfer.reversed": {
        const reversedTransfer = event.data.object as Stripe.Transfer;
        const failedPayoutId = reversedTransfer.metadata?.payout_id;
        if (failedPayoutId) {
          // Get payout details before updating
          const { data: failedPayout } = await supabase
            .from("payouts")
            .select("runner_id, amount")
            .eq("id", failedPayoutId)
            .single();

          await supabase
            .from("payouts")
            .update({ status: "failed" })
            .eq("id", failedPayoutId);

          // Send payout failed email to runner
          if (failedPayout) {
            const { data: failedRunner } = await supabase
              .from("profiles")
              .select("full_name, email")
              .eq("id", failedPayout.runner_id)
              .single();
            if (failedRunner?.email) {
              const emailContent = payoutFailedEmail(
                failedRunner.full_name || "there",
                failedPayout.amount
              );
              sendEmail(failedRunner.email, emailContent.subject, emailContent.html, emailContent.text);
            }
          }
        }
        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        const runnerId = account.metadata?.runner_id;
        if (runnerId) {
          await supabase
            .from("runner_profiles")
            .update({ stripe_connect_account_id: account.id })
            .eq("id", runnerId);
        }
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const userId = session.metadata?.supabase_user_id;
          const planId = session.metadata?.plan_id as
            | "pay_as_you_go"
            | "starter"
            | "regular"
            | "power"
            | undefined;
          if (userId && planId) {
            // Upsert the subscription record
            const subscriptionId =
              typeof session.subscription === "string"
                ? session.subscription
                : session.subscription.id;

            const errandsIncluded = planId === "starter" ? 5 : 10;

            const { data: existing } = await supabase
              .from("subscriptions")
              .select("id")
              .eq("customer_id", userId)
              .eq("status", "active")
              .single();

            if (existing) {
              await supabase
                .from("subscriptions")
                .update({
                  plan: planId,
                  stripe_subscription_id: subscriptionId,
                  current_period_start: new Date().toISOString(),
                  current_period_end: new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000
                  ).toISOString(),
                  errands_remaining: errandsIncluded,
                })
                .eq("id", existing.id);
            } else {
              await supabase.from("subscriptions").insert({
                customer_id: userId,
                plan: planId,
                status: "active",
                stripe_subscription_id: subscriptionId,
                current_period_start: new Date().toISOString(),
                current_period_end: new Date(
                  Date.now() + 30 * 24 * 60 * 60 * 1000
                ).toISOString(),
                errands_remaining: errandsIncluded,
              });
            }

            // Send subscription confirmation email
            const planLabels: Record<string, string> = {
              pay_as_you_go: "Pay As You Go",
              starter: "Starter",
              regular: "Regular",
              power: "Power",
            };
            const { data: subCustomer } = await supabase
              .from("profiles")
              .select("full_name, email")
              .eq("id", userId)
              .single();
            if (subCustomer?.email) {
              const emailContent = subscriptionCreatedEmail(
                subCustomer.full_name || "there",
                planLabels[planId] || planId,
                errandsIncluded
              );
              sendEmail(subCustomer.email, emailContent.subject, emailContent.html, emailContent.text);
            }
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const deletedSub = event.data.object as Stripe.Subscription;
        const deletedSubId = deletedSub.id;

        // Get the subscription record before updating
        const { data: subRecord } = await supabase
          .from("subscriptions")
          .select("customer_id, plan")
          .eq("stripe_subscription_id", deletedSubId)
          .single();

        await supabase
          .from("subscriptions")
          .update({ status: "cancelled" })
          .eq("stripe_subscription_id", deletedSubId);

        // Send cancellation email
        if (subRecord) {
          const planLabels: Record<string, string> = {
            pay_as_you_go: "Pay As You Go",
            starter: "Starter",
            regular: "Regular",
            power: "Power",
          };
          const { data: cancelCustomer } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", subRecord.customer_id)
            .single();
          if (cancelCustomer?.email) {
            const emailContent = subscriptionCancelledEmail(
              cancelCustomer.full_name || "there",
              planLabels[subRecord.plan] || subRecord.plan
            );
            sendEmail(cancelCustomer.email, emailContent.subject, emailContent.html, emailContent.text);
          }
        }
        break;
      }

      default:
        // Unhandled event type — acknowledge receipt
        break;
    }
  } catch (error) {
    console.error(`Webhook handler error for ${event.type}:`, error);
    // Return 200 to prevent Stripe retries for processing errors
    // (we log the error and can investigate)
  }

  return NextResponse.json({ received: true });
}
