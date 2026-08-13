"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, Save } from "lucide-react";
import { projectCategories, type Project } from "@/data/portfolio";

export type EditorInitialProject = {
  id: string;
  repoName: string;
  title: string;
  category: string;
  featured: boolean;
  signal: string;
  problem: string;
  architecture: string; // one bullet per line, for the textarea
  impact: string;
  technologies: string; // comma-separated
  github: string;
  demo: string;
  image: string;
  links: string; // "Label | https://url" per line
  architectureLayers: string; // "Label | Description | Tech1, Tech2" per line, tech segment optional
};

const EMPTY: EditorInitialProject = {
  id: "",
  repoName: "",
  title: "",
  category: projectCategories[0],
  featured: false,
  signal: "",
  problem: "",
  architecture: "",
  impact: "",
  technologies: "",
  github: "",
  demo: "",
  image: "",
  links: "",
  architectureLayers: "",
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseLinks(text: string): { label: string; href: string }[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, href] = line.split("|").map((s) => s.trim());
      return { label: label ?? "", href: href ?? "" };
    })
    .filter((l) => l.label && l.href);
}

function parseArchitectureLayers(text: string): { label: string; description: string; technologies?: string[] }[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, description, techs] = line.split("|").map((s) => s.trim());
      const technologies = techs
        ? techs.split(",").map((t) => t.trim()).filter(Boolean)
        : undefined;
      return { label: label ?? "", description: description ?? "", ...(technologies && technologies.length > 0 ? { technologies } : {}) };
    })
    .filter((l) => l.label && l.description);
}

interface ProjectEditorProps {
  mode: "new" | "edit";
  initialProject?: EditorInitialProject;
}

export function ProjectEditor({ mode, initialProject }: ProjectEditorProps) {
  const router = useRouter();
  const [project, setProject] = useState<EditorInitialProject>(initialProject ?? EMPTY);
  const [idTouched, setIdTouched] = useState(mode === "edit");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "saving" | "error" | "success"; message?: string }>({
    type: "idle",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = mode === "edit";

  const handleTitleChange = (title: string) => {
    setProject((p) => ({ ...p, title }));
    if (!idTouched) setProject((p) => ({ ...p, id: slugify(title) }));
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !project.id) return;

    setUploading(true);
    try {
      const dataBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1] ?? "");
        reader.onerror = () => reject(new Error("Couldn't read that file."));
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "project", ownerId: project.id, filename: file.name, dataBase64 }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Upload failed");
      setProject((p) => ({ ...p, image: body.url }));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "saving" });

    const payload: Partial<Project> = {
      id: project.id,
      repoName: project.repoName.trim(),
      title: project.title.trim(),
      category: project.category as Project["category"],
      featured: project.featured,
      signal: project.signal.trim(),
      problem: project.problem.trim(),
      architecture: project.architecture.split("\n").map((s) => s.trim()).filter(Boolean),
      impact: project.impact.trim(),
      technologies: project.technologies.split(",").map((s) => s.trim()).filter(Boolean),
      github: project.github.trim(),
      demo: project.demo.trim() || undefined,
      image: project.image.trim() || undefined,
      links: parseLinks(project.links),
      architectureLayers: parseArchitectureLayers(project.architectureLayers),
    };

    try {
      const res = await fetch(isEdit ? `/api/admin/projects/${project.id}` : "/api/admin/projects", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Save failed");

      setStatus({
        type: "success",
        message: `${isEdit ? "Saved" : "Created"} — committed to main, live in ~30–90s once the deploy finishes.`,
      });
      if (!isEdit) router.push(`/admin/projects/${body.id}/edit`);
      else router.refresh();
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Save failed" });
    }
  };

  return (
    <div className="admin-page-inner">
      <div className="admin-page-header">
        <div>
          <div className="kicker">Admin</div>
          <h1 className="admin-page-title">{isEdit ? "Edit project" : "New project"}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="admin-field">
          <label htmlFor="title">Title</label>
          <input id="title" required value={project.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Project name" />
        </div>

        <div className="admin-editor-grid">
          <div className="admin-editor-grid-2">
            <div className="admin-field">
              <label htmlFor="id">Id</label>
              <input
                id="id"
                required
                disabled={isEdit}
                value={project.id}
                onChange={(e) => {
                  setIdTouched(true);
                  setProject((p) => ({ ...p, id: slugify(e.target.value) }));
                }}
                placeholder="auto-generated-from-title"
              />
              {isEdit && <span className="admin-field-hint">Id can&apos;t change after creation.</span>}
            </div>
            <div className="admin-field">
              <label htmlFor="category">Category</label>
              <select id="category" value={project.category} onChange={(e) => setProject((p) => ({ ...p, category: e.target.value }))}>
                {projectCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-field">
            <label htmlFor="repoName">Repo name (owner/repo, or repo alone if it&apos;s yours)</label>
            <input id="repoName" required value={project.repoName} onChange={(e) => setProject((p) => ({ ...p, repoName: e.target.value }))} placeholder="Owner/repo" />
          </div>

          <div className="admin-editor-grid-2">
            <div className="admin-field">
              <label htmlFor="github">GitHub URL</label>
              <input id="github" required type="url" value={project.github} onChange={(e) => setProject((p) => ({ ...p, github: e.target.value }))} placeholder="https://github.com/..." />
            </div>
            <div className="admin-field">
              <label htmlFor="demo">Demo URL (optional)</label>
              <input id="demo" type="url" value={project.demo} onChange={(e) => setProject((p) => ({ ...p, demo: e.target.value }))} placeholder="https://..." />
            </div>
          </div>

          <div className="admin-field">
            <label htmlFor="signal">Signal (one-line hook)</label>
            <input id="signal" required value={project.signal} onChange={(e) => setProject((p) => ({ ...p, signal: e.target.value }))} />
          </div>

          <div className="admin-field">
            <label htmlFor="problem">Problem</label>
            <textarea id="problem" required rows={3} value={project.problem} onChange={(e) => setProject((p) => ({ ...p, problem: e.target.value }))} />
          </div>

          <div className="admin-field">
            <label htmlFor="architecture">Architecture (one bullet per line)</label>
            <textarea id="architecture" required rows={4} value={project.architecture} onChange={(e) => setProject((p) => ({ ...p, architecture: e.target.value }))} />
          </div>

          <div className="admin-field">
            <label htmlFor="impact">Impact</label>
            <textarea id="impact" required rows={3} value={project.impact} onChange={(e) => setProject((p) => ({ ...p, impact: e.target.value }))} />
          </div>

          <div className="admin-field">
            <label htmlFor="technologies">Technologies (comma-separated)</label>
            <input id="technologies" required value={project.technologies} onChange={(e) => setProject((p) => ({ ...p, technologies: e.target.value }))} />
          </div>

          <div className="admin-field">
            <label htmlFor="links">Related repos/links (optional, one &ldquo;Label | https://url&rdquo; per line)</label>
            <textarea id="links" rows={2} value={project.links} onChange={(e) => setProject((p) => ({ ...p, links: e.target.value }))} />
          </div>

          <div className="admin-field">
            <label htmlFor="architectureLayers">
              3D diagram layers (optional, one &ldquo;Label | Description | Tech1, Tech2&rdquo; per line — tech
              segment optional). Leave blank and the diagram auto-builds itself from Architecture + Technologies above.
            </label>
            <textarea
              id="architectureLayers"
              rows={4}
              value={project.architectureLayers}
              onChange={(e) => setProject((p) => ({ ...p, architectureLayers: e.target.value }))}
              placeholder={"Frontend | Next.js UI rendering the dashboard | Next.js, TypeScript, Tailwind CSS"}
            />
          </div>

          <div className="admin-field">
            <label htmlFor="image">Screenshot (optional)</label>
            <div className="flex items-center gap-2">
              <input id="image" value={project.image} onChange={(e) => setProject((p) => ({ ...p, image: e.target.value }))} placeholder="/projects/example.png or upload one" />
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={handleImageSelect} className="hidden" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!project.id || uploading}
                title={project.id ? "Upload a screenshot" : "Enter a title/id first"}
                className="admin-header-link"
              >
                {uploading ? <Loader2 size={12} className="animate-spin" /> : <ImagePlus size={12} />} Upload
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-[var(--foreground)]">
            <input type="checkbox" checked={project.featured} onChange={(e) => setProject((p) => ({ ...p, featured: e.target.checked }))} />
            Featured on homepage carousel
          </label>
        </div>

        <div className="admin-toolbar">
          <div className="admin-toolbar-actions">
            <button type="submit" disabled={status.type === "saving"} className="admin-primary-button">
              {status.type === "saving" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {isEdit ? "Save changes" : "Create"}
            </button>
          </div>
          {status.type === "error" && <span className="admin-status admin-status-error">{status.message}</span>}
          {status.type === "success" && <span className="admin-status admin-status-success">{status.message}</span>}
        </div>
      </form>
    </div>
  );
}
