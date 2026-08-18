import { NextResponse } from "next/server";
import { buildAiSystemPrompt } from "@/lib/ai-context";

// Same shape as the contact route's limiter (src/app/api/contact/route.ts)
// — a small in-memory speed bump against casual abuse, not a real
// guarantee (resets on every serverless cold start). Tighter window/count
// than contact's, since a chat endpoint invites more back-and-forth than a
// one-shot form.
const requests = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX = 15;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (requests.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  requests.set(key, recent);
  return recent.length > RATE_LIMIT_MAX;
}

type ClientMessage = { role: "user" | "assistant"; content: string };

const MAX_MESSAGES = 12; // trailing window kept — enough for real back-and-forth, capped so one visitor can't balloon a single request's token cost
const MAX_MESSAGE_CHARS = 1000;

// Groq's available model lineup shifts over time (llama-3.1-8b-instant,
// this route's first choice, had already been retired by the time this
// shipped — verified against GET /openai/v1/models on the actual key in
// use). gpt-oss-20b is a *reasoning* model: it can spend completion tokens
// on an internal chain-of-thought before ever writing to `content`, so a
// low max_tokens risks `content` coming back empty (observed exactly that
// during setup). reasoning_effort: "low" keeps that internal reasoning
// short — this is a portfolio Q&A bot answering off a few KB of grounding
// data, not a task that benefits from deep reasoning — leaving the token
// budget mostly for the actual answer.
const GROQ_MODEL = "openai/gpt-oss-20b";

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    // Not configured yet — fail clearly so the widget can show a real
    // error instead of hanging, same convention as the contact route's
    // missing-RESEND_API_KEY case.
    return NextResponse.json({ error: "AI assistant isn't configured yet." }, { status: 503 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many messages — try again in a few minutes." }, { status: 429 });
  }

  let body: { messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!Array.isArray(body.messages)) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Validate and sanitize every message individually rather than trusting
  // the client array's shape — this is public, unauthenticated input.
  const history: ClientMessage[] = [];
  for (const raw of body.messages as unknown[]) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    if ((r.role !== "user" && r.role !== "assistant") || typeof r.content !== "string") continue;
    const content = r.content.trim().slice(0, MAX_MESSAGE_CHARS);
    if (!content) continue;
    history.push({ role: r.role, content });
  }
  if (history.length === 0) {
    return NextResponse.json({ error: "No message to answer." }, { status: 400 });
  }
  const trimmedHistory = history.slice(-MAX_MESSAGES);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "system", content: buildAiSystemPrompt() }, ...trimmedHistory],
        max_tokens: 400,
        temperature: 0.4,
        reasoning_effort: "low",
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!groqRes.ok) {
      return NextResponse.json({ error: "AI provider error — try again in a moment." }, { status: 502 });
    }

    const data = await groqRes.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      return NextResponse.json({ error: "AI provider returned an empty response." }, { status: 502 });
    }

    return NextResponse.json({ reply: reply.trim() });
  } catch {
    return NextResponse.json({ error: "AI assistant couldn't respond just now." }, { status: 502 });
  }
}
