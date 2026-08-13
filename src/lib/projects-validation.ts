import { projectCategories, type Project } from "@/data/portfolio";

export const PROJECTS_PATH = "content/projects.json";
export const PROJECT_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type ProjectBody = Partial<Record<keyof Project, unknown>>;

export function validateProject(body: ProjectBody): { project: Project } | { error: string } {
  const id = typeof body.id === "string" ? body.id.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const repoName = typeof body.repoName === "string" ? body.repoName.trim() : "";
  const category = typeof body.category === "string" ? body.category : "";
  const signal = typeof body.signal === "string" ? body.signal.trim() : "";
  const problem = typeof body.problem === "string" ? body.problem.trim() : "";
  const impact = typeof body.impact === "string" ? body.impact.trim() : "";
  const github = typeof body.github === "string" ? body.github.trim() : "";
  const demo = typeof body.demo === "string" ? body.demo.trim() : undefined;
  const image = typeof body.image === "string" ? body.image.trim() : undefined;
  const architecture = Array.isArray(body.architecture) ? body.architecture.map(String).filter(Boolean) : [];
  const technologies = Array.isArray(body.technologies) ? body.technologies.map(String).filter(Boolean) : [];
  const links = Array.isArray(body.links)
    ? (body.links as unknown[]).filter(
        (l): l is { label: string; href: string } =>
          !!l && typeof l === "object" && typeof (l as { label?: unknown }).label === "string" && typeof (l as { href?: unknown }).href === "string"
      )
    : undefined;
  const architectureLayers = Array.isArray(body.architectureLayers)
    ? (body.architectureLayers as unknown[])
        .filter(
          (l): l is { label: string; description: string; technologies?: unknown } =>
            !!l &&
            typeof l === "object" &&
            typeof (l as { label?: unknown }).label === "string" &&
            typeof (l as { description?: unknown }).description === "string"
        )
        .map((l) => ({
          label: l.label,
          description: l.description,
          ...(Array.isArray(l.technologies) && l.technologies.length > 0
            ? { technologies: l.technologies.map(String).filter(Boolean) }
            : {}),
        }))
    : undefined;

  if (!PROJECT_ID_RE.test(id)) return { error: "Id must be lowercase letters, numbers, and hyphens." };
  if (!title) return { error: "Title is required." };
  if (!repoName) return { error: "Repo name is required." };
  if (!projectCategories.includes(category as Project["category"])) return { error: "Invalid category." };
  if (!signal) return { error: "Signal line is required." };
  if (!problem) return { error: "Problem is required." };
  if (!impact) return { error: "Impact is required." };
  if (!github) return { error: "GitHub URL is required." };
  if (architecture.length === 0) return { error: "At least one architecture bullet is required." };
  if (technologies.length === 0) return { error: "At least one technology is required." };

  return {
    project: {
      id,
      title,
      repoName,
      category: category as Project["category"],
      featured: body.featured === true,
      signal,
      problem,
      impact,
      github,
      architecture,
      technologies,
      ...(demo ? { demo } : {}),
      ...(image ? { image } : {}),
      ...(links && links.length > 0 ? { links } : {}),
      ...(architectureLayers && architectureLayers.length > 0 ? { architectureLayers } : {}),
    },
  };
}
