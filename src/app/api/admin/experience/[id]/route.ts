import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { getFile, putFile } from "@/lib/github-content";
import { EXPERIENCE_PATH, validateExperience } from "@/lib/experience-validation";
import type { ExperienceEntry } from "@/data/portfolio";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const validated = validateExperience({ ...body, id });
  if ("error" in validated) return NextResponse.json({ error: validated.error }, { status: 400 });

  try {
    const existing = await getFile(EXPERIENCE_PATH);
    if (!existing) return NextResponse.json({ error: "No experience file found." }, { status: 404 });

    const list: ExperienceEntry[] = JSON.parse(existing.content);
    const index = list.findIndex((e) => e.id === id);
    if (index === -1) return NextResponse.json({ error: "Entry not found." }, { status: 404 });

    list[index] = validated.entry;
    await putFile(EXPERIENCE_PATH, JSON.stringify(list, null, 2) + "\n", `experience: update "${validated.entry.role}"`, existing.sha);
  } catch (err) {
    console.error("admin: update experience failed", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to save" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, id });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const existing = await getFile(EXPERIENCE_PATH);
    if (!existing) return NextResponse.json({ error: "No experience file found." }, { status: 404 });

    const list: ExperienceEntry[] = JSON.parse(existing.content);
    const next = list.filter((e) => e.id !== id);
    if (next.length === list.length) return NextResponse.json({ error: "Entry not found." }, { status: 404 });

    await putFile(EXPERIENCE_PATH, JSON.stringify(next, null, 2) + "\n", `experience: delete "${id}"`, existing.sha);
  } catch (err) {
    console.error("admin: delete experience failed", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to delete" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
