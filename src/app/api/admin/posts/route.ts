import { NextResponse } from "next/server";
import matter from "gray-matter";
import { requireAdminSession } from "@/lib/admin-auth";
import { blogFilePath, getFile, putFile } from "@/lib/github-content";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type PostBody = {
  slug?: unknown;
  title?: unknown;
  excerpt?: unknown;
  date?: unknown;
  tags?: unknown;
  readingTime?: unknown;
  projectId?: unknown;
  content?: unknown;
};

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // A plain HTML form post can't set this header, so this closes the
  // (already small, thanks to SameSite=Lax cookies) residual CSRF gap.
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
  }

  let body: PostBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "Slug must be lowercase letters, numbers, and hyphens." }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }
  if (!content) {
    return NextResponse.json({ error: "Content is required." }, { status: 400 });
  }

  const path = blogFilePath(slug);

  try {
    const existing = await getFile(path);
    if (existing) {
      return NextResponse.json({ error: "A post with that slug already exists." }, { status: 409 });
    }

    const file = matter.stringify(content, {
      title,
      excerpt: typeof body.excerpt === "string" ? body.excerpt.trim() : "",
      date: typeof body.date === "string" && body.date ? body.date : new Date().toISOString().slice(0, 10),
      tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
      readingTime: typeof body.readingTime === "string" ? body.readingTime.trim() : "",
      ...(typeof body.projectId === "string" && body.projectId ? { projectId: body.projectId } : {}),
    });

    await putFile(path, file, `blog: publish "${title}"`);
  } catch (err) {
    console.error("admin: create post failed", err);
    return NextResponse.json({ error: "Failed to publish — check server logs." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, slug });
}
