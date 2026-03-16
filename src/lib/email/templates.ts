const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #faf8f5;
  padding: 40px 20px;
`;

const cardStyle = `
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  max-width: 520px;
  margin: 0 auto;
  border: 1px solid #e8e4de;
`;

const headerStyle = `
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
`;

const textStyle = `
  font-size: 14px;
  color: #6b6b6b;
  line-height: 1.6;
  margin: 0 0 16px 0;
`;

const detailRowStyle = `
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  border-bottom: 1px solid #f0ece6;
`;

const labelStyle = `color: #8a8a8a;`;
const valueStyle = `font-weight: 600; color: #1a1a1a;`;

const buttonStyle = `
  display: inline-block;
  background-color: #c17f59;
  color: #ffffff;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  margin-top: 16px;
`;

const logoHtml = `
  <div style="text-align: center; margin-bottom: 24px;">
    <span style="font-size: 24px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.5px;">ravst</span>
  </div>
`;

const footerHtml = `
  <div style="text-align: center; margin-top: 32px; font-size: 12px; color: #aaa;">
    <p style="margin: 0;">Ravst — Your Errands, Handled With Proof</p>
    <p style="margin: 4px 0 0 0;">Dublin, Ireland</p>
    <p style="margin: 8px 0 0 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://ravst.ie"}/dashboard/settings" style="color: #aaa; text-decoration: underline;">Email preferences</a>
      &nbsp;·&nbsp;
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://ravst.ie"}/privacy" style="color: #aaa; text-decoration: underline;">Privacy</a>
    </p>
  </div>
`;

// ── Welcome Email ────────────────────────────────────

export function welcomeEmail(name: string) {
  const html = `
    <div style="${baseStyle}">
      ${logoHtml}
      <div style="${cardStyle}">
        <h1 style="${headerStyle}">Welcome to Ravst!</h1>
        <p style="${textStyle}">Hi ${name}, thanks for signing up! We're excited to have you on board.</p>
        <p style="${textStyle}">Ravst connects you with vetted runners who handle your returns, pickups, and collections in Dublin — with photo proof at every step.</p>

        <div style="background: #faf8f5; border-radius: 12px; padding: 16px; margin: 16px 0;">
          <p style="font-size: 14px; font-weight: 600; color: #1a1a1a; margin: 0 0 12px 0;">Here's how it works:</p>
          <div style="padding: 6px 0; font-size: 14px; color: #6b6b6b;">
            <strong style="color: #c17f59;">1.</strong> Book an errand — tell us what you need done
          </div>
          <div style="padding: 6px 0; font-size: 14px; color: #6b6b6b;">
            <strong style="color: #c17f59;">2.</strong> A vetted runner handles it with real-time tracking
          </div>
          <div style="padding: 6px 0; font-size: 14px; color: #6b6b6b;">
            <strong style="color: #c17f59;">3.</strong> Get photo proof it's done — no guesswork
          </div>
        </div>

        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://ravst.ie"}/dashboard" style="${buttonStyle}">Book Your First Errand</a>
        <p style="font-size: 12px; color: #aaa; margin-top: 16px;">Every errand comes with a €200 guarantee and photo proof.</p>
      </div>
      ${footerHtml}
    </div>
  `;

  const text = `Hi ${name}, welcome to Ravst!\n\nWe connect you with vetted runners who handle your returns, pickups, and collections in Dublin — with photo proof at every step.\n\nHow it works:\n1. Book an errand\n2. A vetted runner handles it\n3. Get photo proof it's done\n\nEvery errand comes with a €200 guarantee.`;

  return { subject: "Welcome to Ravst! 🎉", html, text };
}

// ── Booking Confirmation ──────────────────────────────

export function bookingConfirmationEmail(
  customerName: string,
  errandType: string,
  displayId: string,
  scheduledDate: string,
  pickupAddress: string,
  dropoffAddress: string,
  totalPrice: number
) {
  const formattedDate = new Date(scheduledDate + "T00:00:00").toLocaleDateString("en-IE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const typeLabel =
    errandType === "returns" ? "Returns & Drop-offs" :
    errandType === "handoffs" ? "Pickup → Drop Handoffs" :
    errandType === "collect" ? "Queue & Collect" : errandType;

  const html = `
    <div style="${baseStyle}">
      ${logoHtml}
      <div style="${cardStyle}">
        <h1 style="${headerStyle}">Errand booked!</h1>
        <p style="${textStyle}">Hi ${customerName}, your errand has been confirmed. We're finding a runner for you now.</p>

        <div style="background: #faf8f5; border-radius: 12px; padding: 16px; margin: 16px 0;">
          <div style="${detailRowStyle}">
            <span style="${labelStyle}">Reference</span>
            <span style="${valueStyle}">${displayId}</span>
          </div>
          <div style="${detailRowStyle}">
            <span style="${labelStyle}">Type</span>
            <span style="${valueStyle}">${typeLabel}</span>
          </div>
          <div style="${detailRowStyle}">
            <span style="${labelStyle}">Date</span>
            <span style="${valueStyle}">${formattedDate}</span>
          </div>
          <div style="${detailRowStyle}">
            <span style="${labelStyle}">Pickup</span>
            <span style="${valueStyle}">${pickupAddress}</span>
          </div>
          <div style="${detailRowStyle}">
            <span style="${labelStyle}">Drop-off</span>
            <span style="${valueStyle}">${dropoffAddress}</span>
          </div>
          <div style="${detailRowStyle}; border-bottom: none;">
            <span style="${labelStyle}">Total</span>
            <span style="font-weight: 700; font-size: 16px; color: #1a1a1a;">\u20AC${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://ravst.ie"}/dashboard" style="${buttonStyle}">View in Dashboard</a>
      </div>
      ${footerHtml}
    </div>
  `;

  const text = `Hi ${customerName}, your errand ${displayId} has been booked!\n\nType: ${typeLabel}\nDate: ${formattedDate}\nPickup: ${pickupAddress}\nDrop-off: ${dropoffAddress}\nTotal: \u20AC${totalPrice.toFixed(2)}\n\nWe're finding a runner for you now.`;

  return { subject: `Errand ${displayId} confirmed`, html, text };
}

// ── Runner Assigned ──────────────────────────────────

export function runnerAssignedEmail(
  customerName: string,
  runnerName: string,
  displayId: string
) {
  const html = `
    <div style="${baseStyle}">
      ${logoHtml}
      <div style="${cardStyle}">
        <h1 style="${headerStyle}">Runner assigned!</h1>
        <p style="${textStyle}">Hi ${customerName}, <strong>${runnerName}</strong> has been assigned to your errand ${displayId}. You can track progress and chat with your runner in the dashboard.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://ravst.ie"}/dashboard" style="${buttonStyle}">Track Errand</a>
      </div>
      ${footerHtml}
    </div>
  `;

  const text = `Hi ${customerName}, ${runnerName} has been assigned to your errand ${displayId}. Track progress in the dashboard.`;

  return { subject: `Runner assigned to ${displayId}`, html, text };
}

// ── Errand Completed ─────────────────────────────────

export function errandCompletedEmail(
  customerName: string,
  displayId: string,
) {
  const html = `
    <div style="${baseStyle}">
      ${logoHtml}
      <div style="${cardStyle}">
        <h1 style="${headerStyle}">Errand complete!</h1>
        <p style="${textStyle}">Hi ${customerName}, your errand ${displayId} has been completed with photo proof. View the proof photos and details in your dashboard.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://ravst.ie"}/dashboard" style="${buttonStyle}">View Proof</a>
      </div>
      ${footerHtml}
    </div>
  `;

  const text = `Hi ${customerName}, your errand ${displayId} has been completed with photo proof. View details in your dashboard.`;

  return { subject: `Errand ${displayId} completed`, html, text };
}

// ── Runner Job Offer ─────────────────────────────────

export function runnerJobOfferEmail(
  runnerName: string,
  errandType: string,
  pickupAddress: string,
  dropoffAddress: string,
  payout: number
) {
  const typeLabel =
    errandType === "returns" ? "Returns & Drop-offs" :
    errandType === "handoffs" ? "Pickup → Drop Handoffs" :
    errandType === "collect" ? "Queue & Collect" : errandType;

  const html = `
    <div style="${baseStyle}">
      ${logoHtml}
      <div style="${cardStyle}">
        <h1 style="${headerStyle}">New job available!</h1>
        <p style="${textStyle}">Hi ${runnerName}, a new ${typeLabel.toLowerCase()} job is available near you.</p>

        <div style="background: #faf8f5; border-radius: 12px; padding: 16px; margin: 16px 0;">
          <div style="${detailRowStyle}">
            <span style="${labelStyle}">Pickup</span>
            <span style="${valueStyle}">${pickupAddress}</span>
          </div>
          <div style="${detailRowStyle}">
            <span style="${labelStyle}">Drop-off</span>
            <span style="${valueStyle}">${dropoffAddress}</span>
          </div>
          <div style="${detailRowStyle}; border-bottom: none;">
            <span style="${labelStyle}">Your payout</span>
            <span style="font-weight: 700; font-size: 16px; color: #2d6a4f;">\u20AC${payout.toFixed(2)}</span>
          </div>
        </div>

        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://ravst.ie"}/runner" style="${buttonStyle}">View Job</a>
        <p style="font-size: 12px; color: #aaa; margin-top: 12px;">This offer expires in 5 minutes.</p>
      </div>
      ${footerHtml}
    </div>
  `;

  const text = `Hi ${runnerName}, a new ${typeLabel.toLowerCase()} job is available!\n\nPickup: ${pickupAddress}\nDrop-off: ${dropoffAddress}\nPayout: \u20AC${payout.toFixed(2)}\n\nThis offer expires in 5 minutes. View it in the app.`;

  return { subject: `New job available — \u20AC${payout.toFixed(2)}`, html, text };
}

// ── Dispute Opened ───────────────────────────────────

export function disputeOpenedEmail(
  customerName: string,
  displayId: string,
  reason: string
) {
  const html = `
    <div style="${baseStyle}">
      ${logoHtml}
      <div style="${cardStyle}">
        <h1 style="${headerStyle}">Dispute opened</h1>
        <p style="${textStyle}">Hi ${customerName}, a dispute has been filed for errand ${displayId}.</p>
        <p style="${textStyle}"><strong>Reason:</strong> ${reason}</p>
        <p style="${textStyle}">Our team will review this and get back to you within 24 hours.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://ravst.ie"}/dashboard" style="${buttonStyle}">View Details</a>
      </div>
      ${footerHtml}
    </div>
  `;

  const text = `Hi ${customerName}, a dispute has been filed for errand ${displayId}.\n\nReason: ${reason}\n\nOur team will review this within 24 hours.`;

  return { subject: `Dispute opened for ${displayId}`, html, text };
}

// ── Dispute Resolved ─────────────────────────────────

export function disputeResolvedEmail(
  customerName: string,
  displayId: string,
  resolution: string
) {
  const resolutionLabel =
    resolution === "full_refund" ? "Full refund issued" :
    resolution === "partial_refund" ? "Partial refund issued" :
    resolution === "favour_runner" ? "Resolved in favour of the runner" :
    resolution;

  const html = `
    <div style="${baseStyle}">
      ${logoHtml}
      <div style="${cardStyle}">
        <h1 style="${headerStyle}">Dispute resolved</h1>
        <p style="${textStyle}">Hi ${customerName}, your dispute for errand ${displayId} has been resolved.</p>
        <p style="${textStyle}"><strong>Resolution:</strong> ${resolutionLabel}</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://ravst.ie"}/dashboard" style="${buttonStyle}">View Details</a>
      </div>
      ${footerHtml}
    </div>
  `;

  const text = `Hi ${customerName}, your dispute for errand ${displayId} has been resolved.\n\nResolution: ${resolutionLabel}`;

  return { subject: `Dispute resolved for ${displayId}`, html, text };
}

// ── Runner En Route ─────────────────────────────────

export function runnerEnRouteEmail(
  customerName: string,
  runnerName: string,
  displayId: string,
  pickupAddress: string
) {
  const html = `
    <div style="${baseStyle}">
      ${logoHtml}
      <div style="${cardStyle}">
        <h1 style="${headerStyle}">Runner is on the way!</h1>
        <p style="${textStyle}">Hi ${customerName}, <strong>${runnerName}</strong> is now heading to the pickup location for errand ${displayId}.</p>
        <div style="background: #faf8f5; border-radius: 12px; padding: 16px; margin: 16px 0;">
          <div style="${detailRowStyle}; border-bottom: none;">
            <span style="${labelStyle}">Heading to</span>
            <span style="${valueStyle}">${pickupAddress}</span>
          </div>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://ravst.ie"}/dashboard" style="${buttonStyle}">Track Live</a>
      </div>
      ${footerHtml}
    </div>
  `;

  const text = `Hi ${customerName}, ${runnerName} is now heading to pick up your errand ${displayId} at ${pickupAddress}. Track live in your dashboard.`;

  return { subject: `${runnerName} is on the way — ${displayId}`, html, text };
}

// ── Pickup Complete ─────────────────────────────────

export function pickupCompleteEmail(
  customerName: string,
  runnerName: string,
  displayId: string
) {
  const html = `
    <div style="${baseStyle}">
      ${logoHtml}
      <div style="${cardStyle}">
        <h1 style="${headerStyle}">Pickup complete!</h1>
        <p style="${textStyle}">Hi ${customerName}, <strong>${runnerName}</strong> has picked up your item for errand ${displayId} and is heading to the drop-off point.</p>
        <p style="${textStyle}">Photo proof of pickup has been uploaded — you can view it in your dashboard.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://ravst.ie"}/dashboard" style="${buttonStyle}">View Progress</a>
      </div>
      ${footerHtml}
    </div>
  `;

  const text = `Hi ${customerName}, ${runnerName} has picked up your item for errand ${displayId} and is heading to drop-off. Photo proof is in your dashboard.`;

  return { subject: `Pickup complete — ${displayId}`, html, text };
}

// ── Errand Cancelled ─────────────────────────────────

export function errandCancelledEmail(
  customerName: string,
  displayId: string
) {
  const html = `
    <div style="${baseStyle}">
      ${logoHtml}
      <div style="${cardStyle}">
        <h1 style="${headerStyle}">Errand cancelled</h1>
        <p style="${textStyle}">Hi ${customerName}, your errand ${displayId} has been cancelled. Any payment authorization has been released — no charge was made.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://ravst.ie"}/dashboard" style="${buttonStyle}">View Dashboard</a>
      </div>
      ${footerHtml}
    </div>
  `;

  const text = `Hi ${customerName}, your errand ${displayId} has been cancelled. No charge was made.`;

  return { subject: `Errand ${displayId} cancelled`, html, text };
}

// ── Payment Captured ─────────────────────────────────

export function paymentCapturedEmail(
  customerName: string,
  displayId: string,
  amount: number
) {
  const html = `
    <div style="${baseStyle}">
      ${logoHtml}
      <div style="${cardStyle}">
        <h1 style="${headerStyle}">Payment confirmed</h1>
        <p style="${textStyle}">Hi ${customerName}, the payment for your errand ${displayId} has been captured successfully.</p>
        <div style="background: #faf8f5; border-radius: 12px; padding: 16px; margin: 16px 0;">
          <div style="${detailRowStyle}; border-bottom: none;">
            <span style="${labelStyle}">Amount charged</span>
            <span style="font-weight: 700; font-size: 16px; color: #1a1a1a;">\u20AC${amount.toFixed(2)}</span>
          </div>
        </div>
        <p style="${textStyle}">You can download your receipt from the dashboard.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://ravst.ie"}/dashboard" style="${buttonStyle}">View Receipt</a>
      </div>
      ${footerHtml}
    </div>
  `;

  const text = `Hi ${customerName}, the payment of \u20AC${amount.toFixed(2)} for errand ${displayId} has been captured. Download your receipt from the dashboard.`;

  return { subject: `Payment confirmed — ${displayId}`, html, text };
}

// ── Payment Failed ───────────────────────────────────

export function paymentFailedEmail(
  customerName: string,
  displayId: string,
  reason: string
) {
  const html = `
    <div style="${baseStyle}">
      ${logoHtml}
      <div style="${cardStyle}">
        <h1 style="${headerStyle}">Payment issue</h1>
        <p style="${textStyle}">Hi ${customerName}, there was a problem processing the payment for errand ${displayId}.</p>
        <div style="background: #fef2f2; border-radius: 12px; padding: 16px; margin: 16px 0;">
          <p style="font-size: 14px; color: #991b1b; margin: 0;"><strong>Issue:</strong> ${reason}</p>
        </div>
        <p style="${textStyle}">Please update your payment method or contact us if you need help.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://ravst.ie"}/dashboard" style="${buttonStyle}">Update Payment</a>
      </div>
      ${footerHtml}
    </div>
  `;

  const text = `Hi ${customerName}, there was a problem processing payment for errand ${displayId}.\n\nIssue: ${reason}\n\nPlease update your payment method in the dashboard.`;

  return { subject: `Payment issue — ${displayId}`, html, text };
}

// ── Refund Issued ────────────────────────────────────

export function refundIssuedEmail(
  customerName: string,
  displayId: string,
  amount: number
) {
  const html = `
    <div style="${baseStyle}">
      ${logoHtml}
      <div style="${cardStyle}">
        <h1 style="${headerStyle}">Refund processed</h1>
        <p style="${textStyle}">Hi ${customerName}, a refund has been issued for errand ${displayId}.</p>
        <div style="background: #faf8f5; border-radius: 12px; padding: 16px; margin: 16px 0;">
          <div style="${detailRowStyle}; border-bottom: none;">
            <span style="${labelStyle}">Refund amount</span>
            <span style="font-weight: 700; font-size: 16px; color: #2d6a4f;">\u20AC${amount.toFixed(2)}</span>
          </div>
        </div>
        <p style="${textStyle}">It may take 5–10 business days for the refund to appear on your statement.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://ravst.ie"}/dashboard" style="${buttonStyle}">View Details</a>
      </div>
      ${footerHtml}
    </div>
  `;

  const text = `Hi ${customerName}, a refund of \u20AC${amount.toFixed(2)} has been issued for errand ${displayId}. It may take 5–10 business days to appear on your statement.`;

  return { subject: `Refund processed — ${displayId}`, html, text };
}

// ── Subscription Created ─────────────────────────────

export function subscriptionCreatedEmail(
  customerName: string,
  planName: string,
  errandsIncluded: number
) {
  const html = `
    <div style="${baseStyle}">
      ${logoHtml}
      <div style="${cardStyle}">
        <h1 style="${headerStyle}">Subscription active!</h1>
        <p style="${textStyle}">Hi ${customerName}, your Ravst <strong>${planName}</strong> plan is now active.</p>
        <div style="background: #faf8f5; border-radius: 12px; padding: 16px; margin: 16px 0;">
          <div style="${detailRowStyle}">
            <span style="${labelStyle}">Plan</span>
            <span style="${valueStyle}">${planName}</span>
          </div>
          <div style="${detailRowStyle}; border-bottom: none;">
            <span style="${labelStyle}">Errands included</span>
            <span style="${valueStyle}">${errandsIncluded} per month</span>
          </div>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://ravst.ie"}/dashboard" style="${buttonStyle}">Book an Errand</a>
      </div>
      ${footerHtml}
    </div>
  `;

  const text = `Hi ${customerName}, your ${planName} plan is now active! You have ${errandsIncluded} errands included per month. Book your next errand in the dashboard.`;

  return { subject: `${planName} plan activated`, html, text };
}

// ── Subscription Cancelled ───────────────────────────

export function subscriptionCancelledEmail(
  customerName: string,
  planName: string
) {
  const html = `
    <div style="${baseStyle}">
      ${logoHtml}
      <div style="${cardStyle}">
        <h1 style="${headerStyle}">Subscription cancelled</h1>
        <p style="${textStyle}">Hi ${customerName}, your <strong>${planName}</strong> plan has been cancelled.</p>
        <p style="${textStyle}">You can still book errands on a pay-as-you-go basis. If you change your mind, you can resubscribe at any time from your dashboard.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://ravst.ie"}/pricing" style="${buttonStyle}">View Plans</a>
      </div>
      ${footerHtml}
    </div>
  `;

  const text = `Hi ${customerName}, your ${planName} plan has been cancelled. You can still book errands on a pay-as-you-go basis. Resubscribe any time from your dashboard.`;

  return { subject: `${planName} plan cancelled`, html, text };
}

// ── Runner Welcome ───────────────────────────────────

export function runnerWelcomeEmail(runnerName: string) {
  const html = `
    <div style="${baseStyle}">
      ${logoHtml}
      <div style="${cardStyle}">
        <h1 style="${headerStyle}">Welcome to the Ravst runner team!</h1>
        <p style="${textStyle}">Hi ${runnerName}, thanks for signing up as a runner. Here's what happens next:</p>

        <div style="background: #faf8f5; border-radius: 12px; padding: 16px; margin: 16px 0;">
          <div style="padding: 6px 0; font-size: 14px; color: #6b6b6b;">
            <strong style="color: #2d6a4f;">1.</strong> Our team reviews your profile (usually within 24 hours)
          </div>
          <div style="padding: 6px 0; font-size: 14px; color: #6b6b6b;">
            <strong style="color: #2d6a4f;">2.</strong> Once verified, you can go online and accept errands
          </div>
          <div style="padding: 6px 0; font-size: 14px; color: #6b6b6b;">
            <strong style="color: #2d6a4f;">3.</strong> Complete errands with photo proof and get paid weekly
          </div>
        </div>

        <p style="${textStyle}">In the meantime, make sure your profile is complete — it helps us verify you faster.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://ravst.ie"}/runner" style="${buttonStyle}">Complete Your Profile</a>
        <p style="font-size: 12px; color: #aaa; margin-top: 16px;">Runners typically earn \u20AC12–\u20AC25+ per errand.</p>
      </div>
      ${footerHtml}
    </div>
  `;

  const text = `Hi ${runnerName}, welcome to the Ravst runner team!\n\nNext steps:\n1. Our team reviews your profile (usually within 24 hours)\n2. Once verified, you can go online and accept errands\n3. Complete errands with photo proof and get paid weekly\n\nMake sure your profile is complete — it helps us verify you faster.\n\nRunners typically earn \u20AC12–\u20AC25+ per errand.`;

  return { subject: "Welcome to Ravst Runners! 🏃", html, text };
}

// ── Runner Verified ──────────────────────────────────

export function runnerVerifiedEmail(runnerName: string) {
  const html = `
    <div style="${baseStyle}">
      ${logoHtml}
      <div style="${cardStyle}">
        <h1 style="${headerStyle}">You're verified!</h1>
        <p style="${textStyle}">Hi ${runnerName}, great news — your runner profile has been verified. You can now go online and start accepting errands.</p>

        <div style="background: #e8f5e9; border-radius: 12px; padding: 16px; margin: 16px 0; text-align: center;">
          <p style="font-size: 14px; font-weight: 600; color: #2e7d32; margin: 0;">✓ Profile verified</p>
          <p style="font-size: 12px; color: #4caf50; margin: 4px 0 0 0;">You're ready to accept errands</p>
        </div>

        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://ravst.ie"}/runner" style="${buttonStyle}">Go Online</a>
      </div>
      ${footerHtml}
    </div>
  `;

  const text = `Hi ${runnerName}, great news — your runner profile has been verified! You can now go online and start accepting errands.`;

  return { subject: "You're verified — start earning with Ravst!", html, text };
}

// ── Runner Rejected ──────────────────────────────────

export function runnerRejectedEmail(runnerName: string) {
  const html = `
    <div style="${baseStyle}">
      ${logoHtml}
      <div style="${cardStyle}">
        <h1 style="${headerStyle}">Verification update</h1>
        <p style="${textStyle}">Hi ${runnerName}, unfortunately we weren't able to verify your runner profile at this time.</p>
        <p style="${textStyle}">This could be due to incomplete information or missing documentation. If you believe this is an error, please contact us and we'll review your application again.</p>
        <a href="mailto:hello@ravst.com" style="${buttonStyle}">Contact Us</a>
      </div>
      ${footerHtml}
    </div>
  `;

  const text = `Hi ${runnerName}, unfortunately we weren't able to verify your runner profile at this time. If you believe this is an error, please contact us at hello@ravst.com.`;

  return { subject: "Runner verification update", html, text };
}

// ── Payout Completed ─────────────────────────────────

export function payoutCompletedEmail(
  runnerName: string,
  amount: number,
  periodStart: string,
  periodEnd: string
) {
  const start = new Date(periodStart).toLocaleDateString("en-IE", { day: "numeric", month: "short" });
  const end = new Date(periodEnd).toLocaleDateString("en-IE", { day: "numeric", month: "short" });

  const html = `
    <div style="${baseStyle}">
      ${logoHtml}
      <div style="${cardStyle}">
        <h1 style="${headerStyle}">Payout sent!</h1>
        <p style="${textStyle}">Hi ${runnerName}, your payout has been processed and sent to your bank account.</p>
        <div style="background: #faf8f5; border-radius: 12px; padding: 16px; margin: 16px 0;">
          <div style="${detailRowStyle}">
            <span style="${labelStyle}">Period</span>
            <span style="${valueStyle}">${start} – ${end}</span>
          </div>
          <div style="${detailRowStyle}; border-bottom: none;">
            <span style="${labelStyle}">Amount</span>
            <span style="font-weight: 700; font-size: 16px; color: #2d6a4f;">\u20AC${amount.toFixed(2)}</span>
          </div>
        </div>
        <p style="${textStyle}">It may take 1–2 business days to arrive in your account.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://ravst.ie"}/runner" style="${buttonStyle}">View Earnings</a>
      </div>
      ${footerHtml}
    </div>
  `;

  const text = `Hi ${runnerName}, your payout of \u20AC${amount.toFixed(2)} for ${start} – ${end} has been sent. It may take 1–2 business days to arrive.`;

  return { subject: `Payout sent — \u20AC${amount.toFixed(2)}`, html, text };
}

// ── Payout Failed ────────────────────────────────────

export function payoutFailedEmail(
  runnerName: string,
  amount: number
) {
  const html = `
    <div style="${baseStyle}">
      ${logoHtml}
      <div style="${cardStyle}">
        <h1 style="${headerStyle}">Payout issue</h1>
        <p style="${textStyle}">Hi ${runnerName}, we encountered an issue processing your payout of <strong>\u20AC${amount.toFixed(2)}</strong>.</p>
        <div style="background: #fef2f2; border-radius: 12px; padding: 16px; margin: 16px 0;">
          <p style="font-size: 14px; color: #991b1b; margin: 0;">Please check that your Stripe account is set up correctly and your bank details are up to date.</p>
        </div>
        <p style="${textStyle}">We'll retry the payout automatically. If the issue persists, contact us for help.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://ravst.ie"}/runner" style="${buttonStyle}">Check Account</a>
      </div>
      ${footerHtml}
    </div>
  `;

  const text = `Hi ${runnerName}, we encountered an issue processing your payout of \u20AC${amount.toFixed(2)}. Please check your Stripe account and bank details. We'll retry automatically.`;

  return { subject: `Payout issue — \u20AC${amount.toFixed(2)}`, html, text };
}
