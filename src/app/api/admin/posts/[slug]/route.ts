import { NextResponse } from "next/server";
import matter from "gray-matter";
import { requireAdminSession } from "@/lib/admin-auth";
import { blogFilePath, deleteFile, getFile, putFile } from "@/lib/github-content";

type PostBody = {
  title?: unknown;
  excerpt?: unknown;
  date?: unknown;
  tags?: unknown;
  readingTime?: unknown;
  projectId?: unknown;
  content?: unknown;
};

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
  }

  const { slug } = await params;

  let body: PostBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });
  if (!content) return NextResponse.json({ error: "Content is required." }, { status: 400 });

  const path = blogFilePath(slug);

  try {
    const existing = await getFile(path);
    if (!existing) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const file = matter.stringify(content, {
      title,
      excerpt: typeof body.excerpt === "string" ? body.excerpt.trim() : "",
      date: typeof body.date === "string" && body.date ? body.date : new Date().toISOString().slice(0, 10),
      tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
      readingTime: typeof body.readingTime === "string" ? body.readingTime.trim() : "",
      ...(typeof body.projectId === "string" && body.projectId ? { projectId: body.projectId } : {}),
    });

    await putFile(path, file, `blog: update "${title}"`, existing.sha);
  } catch (err) {
    console.error("admin: update post failed", err);
    return NextResponse.json({ error: "Failed to save — check server logs." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, slug });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const path = blogFilePath(slug);

  try {
    const existing = await getFile(path);
    if (!existing) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }
    await deleteFile(path, `blog: delete "${slug}"`, existing.sha);
  } catch (err) {
    console.error("admin: delete post failed", err);
    return NextResponse.json({ error: "Failed to delete — check server logs." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
