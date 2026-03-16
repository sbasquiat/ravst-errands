import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/send";
import { rateLimit, getClientIP, rateLimits, rateLimitResponse } from "@/lib/rate-limit";
import { contactSchema, parseBody } from "@/lib/validation";

export async function POST(request: NextRequest) {
  // Rate limit: 5 per 15 minutes per IP
  const ip = getClientIP(request);
  const limit = rateLimit(`contact:${ip}`, rateLimits.contact);
  if (!limit.success) return rateLimitResponse(limit.resetMs);

  try {
    const body = await request.json();
    const { data, error: validationError } = parseBody(contactSchema, body);

    if (!data) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { name, email, subject, message } = data;

    // Sanitize HTML in user inputs to prevent XSS in emails
    const esc = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px;">
        <h2 style="color: #1a1a1a; margin-bottom: 20px;">New Contact Form Submission</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #555; width: 100px;">Name</td>
            <td style="padding: 8px 12px; color: #1a1a1a;">${esc(name)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #555;">Email</td>
            <td style="padding: 8px 12px; color: #1a1a1a;"><a href="mailto:${esc(email)}">${esc(email)}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #555;">Subject</td>
            <td style="padding: 8px 12px; color: #1a1a1a;">${esc(subject)}</td>
          </tr>
        </table>
        <div style="margin-top: 20px; padding: 16px; background: #f9f9f9; border-radius: 8px;">
          <p style="margin: 0; font-weight: 600; color: #555; margin-bottom: 8px;">Message</p>
          <p style="margin: 0; color: #1a1a1a; white-space: pre-wrap;">${esc(message)}</p>
        </div>
        <hr style="margin-top: 24px; border: none; border-top: 1px solid #eee;" />
        <p style="color: #999; font-size: 12px; margin-top: 12px;">
          Reply directly to this email to respond to ${esc(name)} at ${esc(email)}.
        </p>
      </div>
    `;

    const text = `New Contact Form Submission\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`;

    const toEmail = process.env.RESEND_FROM_EMAIL?.match(/<(.+)>/)?.[1] || "hello@ravst.com";

    await sendEmail(
      toEmail,
      `[Contact] ${subject} — from ${name}`,
      html,
      text
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Contact] Failed to send:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
