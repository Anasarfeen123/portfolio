import type { Profile } from "@/data/portfolio";

export const PROFILE_PATH = "content/profile.json";

type ProfileBody = Partial<Record<keyof Profile, unknown>>;

export function validateProfile(body: ProfileBody): { profile: Profile } | { error: string } {
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const name = str(body.name);
  const handle = str(body.handle);
  const avatar = str(body.avatar);
  const role = str(body.role);
  const statement = str(body.statement);
  const bio = str(body.bio);
  const location = str(body.location);
  const email = str(body.email);
  const github = str(body.github);
  const linkedin = str(body.linkedin);
  const portfolio = str(body.portfolio);
  const resume = str(body.resume);
  const education = str(body.education);
  const highlights = Array.isArray(body.highlights)
    ? (body.highlights as unknown[]).filter(
        (h): h is { label: string; value: string } =>
          !!h && typeof h === "object" && typeof (h as { label?: unknown }).label === "string" && typeof (h as { value?: unknown }).value === "string"
      )
    : [];

  if (!name) return { error: "Name is required." };
  if (!role) return { error: "Role is required." };
  if (!statement) return { error: "Statement is required." };
  if (!bio) return { error: "Bio is required." };
  if (!email) return { error: "Email is required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email." };

  return {
    profile: { name, handle, avatar, role, statement, bio, location, email, github, linkedin, portfolio, resume, education, highlights },
  };
}
