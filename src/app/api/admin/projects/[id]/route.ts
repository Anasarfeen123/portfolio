import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { getFile, putFile } from "@/lib/github-content";
import { PROJECTS_PATH, validateProject } from "@/lib/projects-validation";
import type { Project } from "@/data/portfolio";

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

  // id can't change via this form (matches the URL param) — ignore any id in the body.
  const validated = validateProject({ ...body, id });
  if ("error" in validated) return NextResponse.json({ error: validated.error }, { status: 400 });

  try {
    const existing = await getFile(PROJECTS_PATH);
    if (!existing) return NextResponse.json({ error: "No projects file found." }, { status: 404 });

    const list: Project[] = JSON.parse(existing.content);
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) return NextResponse.json({ error: "Project not found." }, { status: 404 });

    list[index] = validated.project;
    await putFile(PROJECTS_PATH, JSON.stringify(list, null, 2) + "\n", `projects: update "${validated.project.title}"`, existing.sha);
  } catch (err) {
    console.error("admin: update project failed", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to save" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, id });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const existing = await getFile(PROJECTS_PATH);
    if (!existing) return NextResponse.json({ error: "No projects file found." }, { status: 404 });

    const list: Project[] = JSON.parse(existing.content);
    const next = list.filter((p) => p.id !== id);
    if (next.length === list.length) return NextResponse.json({ error: "Project not found." }, { status: 404 });

    await putFile(PROJECTS_PATH, JSON.stringify(next, null, 2) + "\n", `projects: delete "${id}"`, existing.sha);
  } catch (err) {
    console.error("admin: delete project failed", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to delete" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
