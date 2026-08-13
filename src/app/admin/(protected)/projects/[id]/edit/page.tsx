import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFile } from "@/lib/github-content";
import { PROJECTS_PATH } from "@/lib/projects-validation";
import type { Project } from "@/data/portfolio";
import { ProjectEditor } from "@/components/admin/ProjectEditor";

export const metadata: Metadata = { title: "Edit project", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const file = await getFile(PROJECTS_PATH);
  const list: Project[] = file ? JSON.parse(file.content) : [];
  const project = list.find((p) => p.id === id);
  if (!project) notFound();

  return (
    <ProjectEditor
      mode="edit"
      initialProject={{
        id: project.id,
        repoName: project.repoName,
        title: project.title,
        category: project.category,
        featured: project.featured ?? false,
        signal: project.signal,
        problem: project.problem,
        architecture: project.architecture.join("\n"),
        impact: project.impact,
        technologies: project.technologies.join(", "),
        github: project.github,
        demo: project.demo ?? "",
        image: project.image ?? "",
        links: (project.links ?? []).map((l) => `${l.label} | ${l.href}`).join("\n"),
      }}
    />
  );
}
