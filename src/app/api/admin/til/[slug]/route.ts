import { NextResponse } from "next/server";
import matter from "gray-matter";
import { requireAdminSession } from "@/lib/admin-auth";
import { deleteFile, getFile, putFile } from "@/lib/github-content";
import { tilFilePath, validateTilBody } from "@/lib/til-validation";

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
  }

  const { slug } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const validated = validateTilBody(body);
  if ("error" in validated) return NextResponse.json({ error: validated.error }, { status: 400 });

  const path = tilFilePath(slug);

  try {
    const existing = await getFile(path);
    if (!existing) return NextResponse.json({ error: "Entry not found." }, { status: 404 });

    const file = matter.stringify(validated.content, { date: validated.date, tags: validated.tags });
    await putFile(path, file, `til: update ${slug}`, existing.sha);
  } catch (err) {
    console.error("admin: update til entry failed", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to save" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, slug });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const path = tilFilePath(slug);

  try {
    const existing = await getFile(path);
    if (!existing) return NextResponse.json({ error: "Entry not found." }, { status: 404 });
    await deleteFile(path, `til: delete ${slug}`, existing.sha);
  } catch (err) {
    console.error("admin: delete til entry failed", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to delete" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
