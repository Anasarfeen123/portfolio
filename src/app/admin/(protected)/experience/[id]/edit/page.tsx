import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFile } from "@/lib/github-content";
import { EXPERIENCE_PATH } from "@/lib/experience-validation";
import type { ExperienceEntry } from "@/data/portfolio";
import { ExperienceEditor } from "@/components/admin/ExperienceEditor";

export const metadata: Metadata = { title: "Edit experience", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function EditExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const file = await getFile(EXPERIENCE_PATH);
  const list: ExperienceEntry[] = file ? JSON.parse(file.content) : [];
  const entry = list.find((e) => e.id === id);
  if (!entry) notFound();

  return (
    <ExperienceEditor
      mode="edit"
      initialEntry={{
        id: entry.id,
        role: entry.role,
        org: entry.org,
        icon: entry.icon,
        time: entry.time,
        notes: entry.notes.join("\n"),
      }}
    />
  );
}
