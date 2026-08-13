import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { getFile, putFile } from "@/lib/github-content";
import { PROFILE_PATH, validateProfile } from "@/lib/profile-validation";

export async function PUT(request: Request) {
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

  const validated = validateProfile(body);
  if ("error" in validated) return NextResponse.json({ error: validated.error }, { status: 400 });

  try {
    const existing = await getFile(PROFILE_PATH);
    await putFile(PROFILE_PATH, JSON.stringify(validated.profile, null, 2) + "\n", "profile: update", existing?.sha);
  } catch (err) {
    console.error("admin: update profile failed", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to save" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
