import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { getFile } from "@/lib/github-content";
import { PROJECTS_PATH } from "@/lib/projects-validation";
import type { Project } from "@/data/portfolio";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const metadata: Metadata = { title: "Admin — Projects", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const file = await getFile(PROJECTS_PATH);
  const projects: Project[] = file ? JSON.parse(file.content) : [];

  return (
    <div className="admin-page-inner">
      <div className="admin-page-header">
        <div>
          <div className="kicker">Admin</div>
          <h1 className="admin-page-title">Projects</h1>
        </div>
        <Link href="/admin/projects/new" className="admin-primary-button">
          <Plus size={14} /> New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="admin-empty">No projects yet.</p>
      ) : (
        <div className="admin-post-list">
          {projects.map((p) => (
            <div key={p.id} className="admin-post-row">
              <div>
                <div className="admin-post-row-title">
                  {p.title} {p.featured && <span className="admin-badge">Featured</span>}
                </div>
                <div className="admin-post-row-meta">
                  {p.category} · /projects#{p.id}
                </div>
              </div>
              <div className="admin-post-row-actions">
                <Link href={`/admin/projects/${p.id}/edit`} className="admin-icon-link" title={`Edit ${p.id}`}>
                  <Pencil size={14} />
                </Link>
                <DeleteButton endpoint={`/api/admin/projects/${p.id}`} label={p.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
