import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";

const FETCH_TIMEOUT_MS = 8000;
const MAX_HTML_BYTES = 2 * 1024 * 1024; // don't read an unbounded response body

function extractMeta(html: string, property: string): string | null {
  // Handles both attribute orders: property/content and content/property.
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${property}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${property}["']`, "i"),
  ];
  for (const re of patterns) {
    const match = html.match(re);
    if (match) return decodeHtmlEntities(match[1]);
  }
  return null;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'");
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
  }

  let body: { url?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const rawUrl = typeof body.url === "string" ? body.url.trim() : "";
  let target: URL;
  try {
    target = new URL(rawUrl);
    if (target.protocol !== "http:" && target.protocol !== "https:") throw new Error("bad protocol");
  } catch {
    return NextResponse.json({ error: "Enter a valid http(s) URL." }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(target.toString(), {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PortfolioLinkPreview/1.0)" },
    });
  } catch {
    return NextResponse.json({ error: "Couldn't reach that URL." }, { status: 502 });
  }

  if (!res.ok || !res.headers.get("content-type")?.includes("text/html")) {
    return NextResponse.json({ error: "That URL didn't return an HTML page." }, { status: 502 });
  }

  const reader = res.body?.getReader();
  let html = "";
  if (reader) {
    let received = 0;
    const decoder = new TextDecoder();
    while (received < MAX_HTML_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      html += decoder.decode(value, { stream: true });
    }
    reader.cancel().catch(() => {});
  }

  const titleTagMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = extractMeta(html, "og:title") ?? (titleTagMatch ? decodeHtmlEntities(titleTagMatch[1]) : target.hostname);
  const description = extractMeta(html, "og:description") ?? extractMeta(html, "description") ?? "";
  const image = extractMeta(html, "og:image");

  return NextResponse.json({
    url: target.toString(),
    title: title.trim().slice(0, 200),
    description: description.trim().slice(0, 300),
    image: image ? new URL(image, target).toString() : null,
  });
}
