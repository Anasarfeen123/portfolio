import type { Metadata } from "next";
import { ExperienceEditor } from "@/components/admin/ExperienceEditor";

export const metadata: Metadata = { title: "New experience", robots: { index: false, follow: false } };

export default function NewExperiencePage() {
  return <ExperienceEditor mode="new" />;
}
