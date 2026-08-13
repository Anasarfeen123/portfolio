import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { getFile, putFile } from "@/lib/github-content";
import { EXPERIENCE_PATH, validateExperience } from "@/lib/experience-validation";
import type { ExperienceEntry } from "@/data/portfolio";

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

  const validated = validateExperience(body);
  if ("error" in validated) return NextResponse.json({ error: validated.error }, { status: 400 });

  try {
    const existing = await getFile(EXPERIENCE_PATH);
    const list: ExperienceEntry[] = existing ? JSON.parse(existing.content) : [];

    if (list.some((e) => e.id === validated.entry.id)) {
      return NextResponse.json({ error: "An entry with that id already exists." }, { status: 409 });
    }

    // New entries go first — the site always shows the most recent role first.
    list.unshift(validated.entry);
    await putFile(EXPERIENCE_PATH, JSON.stringify(list, null, 2) + "\n", `experience: add "${validated.entry.role}"`, existing?.sha);
  } catch (err) {
    console.error("admin: create experience failed", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to save" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, id: validated.entry.id });
}
