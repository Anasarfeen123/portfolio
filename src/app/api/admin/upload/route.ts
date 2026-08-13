import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { putBinaryFile } from "@/lib/github-binary";

// 3MB raw, conservative: Vercel's Node serverless functions have historically
// defaulted to a ~4.5MB request body limit, and base64 inflates payload size
// ~33% over the raw file — 3MB raw keeps real-world headroom under that.
const MAX_BYTES = 3 * 1024 * 1024;
const ALLOWED_EXT: Record<string, string> = {
  png: "png",
  jpg: "jpg",
  jpeg: "jpeg",
  gif: "gif",
  webp: "webp",
};
const OWNER_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type UploadBody = {
  kind?: unknown;
  ownerId?: unknown;
  filename?: unknown;
  dataBase64?: unknown;
};

function slugifyFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
  }

  let body: UploadBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const kind = body.kind === "project" ? "project" : body.kind === "blog" ? "blog" : null;
  const ownerId = typeof body.ownerId === "string" ? body.ownerId : "";
  const filename = typeof body.filename === "string" ? body.filename : "";
  const dataBase64 = typeof body.dataBase64 === "string" ? body.dataBase64 : "";

  if (!kind) return NextResponse.json({ error: "kind must be 'blog' or 'project'" }, { status: 400 });
  if (!OWNER_ID_RE.test(ownerId)) return NextResponse.json({ error: "Invalid owner id" }, { status: 400 });

  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const safeExt = ALLOWED_EXT[ext];
  if (!safeExt) {
    return NextResponse.json({ error: "Only png, jpg, jpeg, gif, or webp images are allowed." }, { status: 400 });
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(dataBase64, "base64");
  } catch {
    return NextResponse.json({ error: "Invalid file data" }, { status: 400 });
  }
  if (buffer.byteLength === 0) return NextResponse.json({ error: "Empty file" }, { status: 400 });
  if (buffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: `Image too large — max ${MAX_BYTES / 1024 / 1024}MB.` }, { status: 400 });
  }

  // The route computes the path itself rather than trusting anything
  // client-supplied beyond the validated ownerId/extension above — never
  // accept a raw path from the client.
  const safeName = `${Date.now()}-${slugifyFilename(filename) || "image"}.${safeExt}`;
  const dir = kind === "blog" ? `public/uploads/blog/${ownerId}` : `public/uploads/projects/${ownerId}`;
  const repoPath = `${dir}/${safeName}`;
  const publicUrl = `/${dir.replace(/^public\//, "")}/${safeName}`;

  try {
    await putBinaryFile(repoPath, buffer, `upload: add image for ${kind} "${ownerId}"`);
  } catch (err) {
    console.error("admin: image upload failed", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Upload failed" }, { status: 502 });
  }

  return NextResponse.json({ url: publicUrl });
}
