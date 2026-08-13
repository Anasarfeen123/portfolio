import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { getFile, putFile } from "@/lib/github-content";
import { PROJECTS_PATH, validateProject } from "@/lib/projects-validation";
import type { Project } from "@/data/portfolio";

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

  const validated = validateProject(body);
  if ("error" in validated) return NextResponse.json({ error: validated.error }, { status: 400 });

  try {
    const existing = await getFile(PROJECTS_PATH);
    const list: Project[] = existing ? JSON.parse(existing.content) : [];

    if (list.some((p) => p.id === validated.project.id)) {
      return NextResponse.json({ error: "A project with that id already exists." }, { status: 409 });
    }

    list.push(validated.project);
    await putFile(PROJECTS_PATH, JSON.stringify(list, null, 2) + "\n", `projects: add "${validated.project.title}"`, existing?.sha);
  } catch (err) {
    console.error("admin: create project failed", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to save" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, id: validated.project.id });
}
