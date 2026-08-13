import type { ExperienceEntry } from "@/data/portfolio";

export const EXPERIENCE_PATH = "content/experience.json";
export const EXPERIENCE_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ICONS: ExperienceEntry["icon"][] = ["microsoft", "linux", "hackclub"];

type ExperienceBody = Partial<Record<keyof ExperienceEntry, unknown>>;

export function validateExperience(body: ExperienceBody): { entry: ExperienceEntry } | { error: string } {
  const id = typeof body.id === "string" ? body.id.trim() : "";
  const role = typeof body.role === "string" ? body.role.trim() : "";
  const org = typeof body.org === "string" ? body.org.trim() : "";
  const icon = typeof body.icon === "string" ? body.icon : "";
  const time = typeof body.time === "string" ? body.time.trim() : "";
  const notes = Array.isArray(body.notes) ? body.notes.map(String).filter(Boolean) : [];

  if (!EXPERIENCE_ID_RE.test(id)) return { error: "Id must be lowercase letters, numbers, and hyphens." };
  if (!role) return { error: "Role is required." };
  if (!org) return { error: "Org is required." };
  if (!ICONS.includes(icon as ExperienceEntry["icon"])) return { error: "Icon must be microsoft, linux, or hackclub." };
  if (!time) return { error: "Time range is required." };
  if (notes.length === 0) return { error: "At least one note is required." };

  return { entry: { id, role, org, icon: icon as ExperienceEntry["icon"], time, notes } };
}
