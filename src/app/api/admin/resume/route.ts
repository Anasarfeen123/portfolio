import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { putBinaryFile } from "@/lib/github-binary";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB — generous for a resume PDF
const RESUME_PATH = "public/Resume.pdf";

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
  }

  let body: { filename?: unknown; dataBase64?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const filename = typeof body.filename === "string" ? body.filename : "";
  const dataBase64 = typeof body.dataBase64 === "string" ? body.dataBase64 : "";

  if (!filename.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Only PDF files are allowed." }, { status: 400 });
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(dataBase64, "base64");
  } catch {
    return NextResponse.json({ error: "Invalid file data" }, { status: 400 });
  }
  if (buffer.byteLength === 0) return NextResponse.json({ error: "Empty file" }, { status: 400 });
  // A real PDF starts with "%PDF-" — cheap sanity check against uploading a
  // renamed non-PDF, on top of the extension check above.
  if (buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
    return NextResponse.json({ error: "That doesn't look like a valid PDF." }, { status: 400 });
  }
  if (buffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: `File too large — max ${MAX_BYTES / 1024 / 1024}MB.` }, { status: 400 });
  }

  try {
    await putBinaryFile(RESUME_PATH, buffer, "resume: replace Resume.pdf");
  } catch (err) {
    console.error("admin: resume upload failed", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Upload failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
