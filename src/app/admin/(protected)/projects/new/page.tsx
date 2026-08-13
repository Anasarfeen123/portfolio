import type { Metadata } from "next";
import { ProjectEditor } from "@/components/admin/ProjectEditor";

export const metadata: Metadata = { title: "New project", robots: { index: false, follow: false } };

export default function NewProjectPage() {
  return <ProjectEditor mode="new" />;
}
