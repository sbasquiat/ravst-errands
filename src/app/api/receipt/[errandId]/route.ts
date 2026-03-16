import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const typeLabels: Record<string, string> = {
  returns: "Returns & Drop-offs",
  handoffs: "Pickup → Drop Handoffs",
  collect: "Queue & Collect",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ errandId: string }> }
) {
  const { errandId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: errand, error } = await supabase
    .from("errands")
    .select(
      `id, display_id, type, status, item_description,
       pickup_address, dropoff_address, scheduled_date,
       time_slot_start, time_slot_end, distance_km,
       base_fee, distance_fee, urgency_fee, tip,
       total_price, platform_fee, runner_payout,
       created_at, completed_at, customer_id`
    )
    .eq("id", errandId)
    .single();

  if (error || !errand) {
    return NextResponse.json({ error: "Errand not found" }, { status: 404 });
  }

  // Only allow the customer or admin to download the receipt
  if (errand.customer_id !== user.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  }

  if (errand.status !== "completed") {
    return NextResponse.json(
      { error: "Receipt only available for completed errands" },
      { status: 400 }
    );
  }

  // Get customer info
  const { data: customer } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", errand.customer_id)
    .single();

  const formattedDate = new Date(errand.scheduled_date + "T00:00:00").toLocaleDateString(
    "en-IE",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  );

  const completedDate = errand.completed_at
    ? new Date(errand.completed_at).toLocaleDateString("en-IE", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  // Generate HTML receipt
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt — ${errand.display_id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #faf8f5; padding: 40px 20px; color: #1a1a1a; }
    .receipt { max-width: 520px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 40px 32px; border: 1px solid #e8e4de; }
    .logo { text-align: center; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 8px; }
    .subtitle { text-align: center; font-size: 12px; color: #8a8a8a; margin-bottom: 32px; }
    .badge { display: inline-block; background: #e8f5e9; color: #2e7d32; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .ref { font-size: 20px; font-weight: 700; }
    .date { font-size: 12px; color: #8a8a8a; margin-top: 2px; }
    .section { margin-top: 24px; padding-top: 24px; border-top: 1px solid #f0ece6; }
    .section-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: #8a8a8a; margin-bottom: 12px; }
    .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
    .row .label { color: #8a8a8a; }
    .row .value { font-weight: 600; }
    .total-row { display: flex; justify-content: space-between; padding: 12px 0; font-size: 18px; font-weight: 700; border-top: 2px solid #1a1a1a; margin-top: 8px; }
    .address-block { margin-bottom: 8px; }
    .address-label { font-size: 11px; color: #8a8a8a; text-transform: uppercase; letter-spacing: 0.5px; }
    .address-text { font-size: 14px; margin-top: 2px; }
    .footer { text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #f0ece6; font-size: 12px; color: #aaa; }
    .guarantee { text-align: center; margin-top: 16px; padding: 12px; background: #faf8f5; border-radius: 8px; font-size: 12px; color: #6b6b6b; }
    @media print { body { background: #fff; padding: 0; } .receipt { border: none; box-shadow: none; } }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="logo">ravst</div>
    <div class="subtitle">Receipt</div>

    <div class="header">
      <div>
        <div class="ref">${errand.display_id}</div>
        <div class="date">${formattedDate}</div>
      </div>
      <span class="badge">Completed</span>
    </div>

    <div class="section">
      <div class="section-title">Customer</div>
      <div class="row"><span class="label">Name</span><span class="value">${customer?.full_name ?? "—"}</span></div>
      <div class="row"><span class="label">Email</span><span class="value">${customer?.email ?? "—"}</span></div>
    </div>

    <div class="section">
      <div class="section-title">Errand Details</div>
      <div class="row"><span class="label">Type</span><span class="value">${typeLabels[errand.type] ?? errand.type}</span></div>
      <div class="row"><span class="label">Item</span><span class="value">${errand.item_description}</span></div>
      <div class="row"><span class="label">Completed</span><span class="value">${completedDate}</span></div>
      ${errand.distance_km ? `<div class="row"><span class="label">Distance</span><span class="value">${errand.distance_km.toFixed(1)} km</span></div>` : ""}
    </div>

    <div class="section">
      <div class="section-title">Addresses</div>
      <div class="address-block">
        <div class="address-label">Pickup</div>
        <div class="address-text">${errand.pickup_address}</div>
      </div>
      <div class="address-block">
        <div class="address-label">Drop-off</div>
        <div class="address-text">${errand.dropoff_address}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Breakdown</div>
      <div class="row"><span class="label">Base fee</span><span class="value">\u20AC${errand.base_fee.toFixed(2)}</span></div>
      <div class="row"><span class="label">Distance fee</span><span class="value">\u20AC${errand.distance_fee.toFixed(2)}</span></div>
      ${errand.urgency_fee > 0 ? `<div class="row"><span class="label">Urgency fee</span><span class="value">\u20AC${errand.urgency_fee.toFixed(2)}</span></div>` : ""}
      ${errand.tip > 0 ? `<div class="row"><span class="label">Tip</span><span class="value">\u20AC${errand.tip.toFixed(2)}</span></div>` : ""}
      <div class="total-row"><span>Total Charged</span><span>\u20AC${errand.total_price.toFixed(2)}</span></div>
    </div>

    <div class="guarantee">Every Ravst errand is backed by our \u20AC200 guarantee.</div>

    <div class="footer">
      <p>Ravst — Your Errands, Handled With Proof</p>
      <p style="margin-top: 4px;">Dublin, Ireland · hello@ravst.com</p>
    </div>
  </div>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
