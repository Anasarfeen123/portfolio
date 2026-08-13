import { NextResponse } from "next/server";
import matter from "gray-matter";
import { requireAdminSession } from "@/lib/admin-auth";
import { getFile, putFile } from "@/lib/github-content";
import { generateTilSlug, tilFilePath, validateTilBody } from "@/lib/til-validation";

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const validated = validateTilBody(body);
  if ("error" in validated) return NextResponse.json({ error: validated.error }, { status: 400 });

  const slug = generateTilSlug(validated.date);
  const path = tilFilePath(slug);

  try {
    // Vanishingly unlikely to collide (date + random suffix), but check anyway
    // rather than silently overwriting if it somehow does.
    const existing = await getFile(path);
    if (existing) {
      return NextResponse.json({ error: "Slug collision — try again." }, { status: 409 });
    }

    const file = matter.stringify(validated.content, { date: validated.date, tags: validated.tags });
    await putFile(path, file, `til: add note (${validated.date})`);
  } catch (err) {
    console.error("admin: create til entry failed", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to save" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, slug });
}
