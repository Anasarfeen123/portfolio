import { NextResponse } from "next/server";
import { Resend } from "resend";

// Very small in-memory rate limit — resets whenever the serverless function
// cold-starts, so it's a speed bump against casual abuse, not a real guarantee.
const submissions = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (submissions.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  submissions.set(key, recent);
  return recent.length > RATE_LIMIT_MAX;
}

export async function POST(request: Request) {
  let body: { email?: unknown; message?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!message || message.length > 5000) {
    return NextResponse.json({ error: "Message is empty or too long." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many messages — try again later." }, { status: 429 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL ?? "codecrusader07@gmail.com";
  const fromEmail = process.env.CONTACT_FROM_EMAIL ?? "Portfolio Contact <onboarding@resend.dev>";

  if (!apiKey) {
    // Not configured yet (missing RESEND_API_KEY) — fail clearly so the UI can
    // point people at the mailto: fallback instead of pretending it worked.
    return NextResponse.json({ error: "Contact form isn't configured yet." }, { status: 503 });
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject: `Portfolio inquiry from ${email}`,
      text: message,
    });

    if (error) {
      console.error("contact form: resend returned an error", error);
      return NextResponse.json({ error: "Failed to send. Try emailing directly." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("contact form: send threw", err);
    return NextResponse.json({ error: "Failed to send. Try emailing directly." }, { status: 502 });
  }
}
