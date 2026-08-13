import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { getFile } from "@/lib/github-content";
import { EXPERIENCE_PATH } from "@/lib/experience-validation";
import type { ExperienceEntry } from "@/data/portfolio";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const metadata: Metadata = { title: "Admin — Experience", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminExperiencePage() {
  const file = await getFile(EXPERIENCE_PATH);
  const entries: ExperienceEntry[] = file ? JSON.parse(file.content) : [];

  return (
    <div className="admin-page-inner">
      <div className="admin-page-header">
        <div>
          <div className="kicker">Admin</div>
          <h1 className="admin-page-title">Experience</h1>
        </div>
        <Link href="/admin/experience/new" className="admin-primary-button">
          <Plus size={14} /> New Entry
        </Link>
      </div>

      {entries.length === 0 ? (
        <p className="admin-empty">No experience entries yet.</p>
      ) : (
        <div className="admin-post-list">
          {entries.map((e) => (
            <div key={e.id} className="admin-post-row">
              <div>
                <div className="admin-post-row-title">{e.role}</div>
                <div className="admin-post-row-meta">
                  {e.org} · {e.time}
                </div>
              </div>
              <div className="admin-post-row-actions">
                <Link href={`/admin/experience/${e.id}/edit`} className="admin-icon-link" title={`Edit ${e.id}`}>
                  <Pencil size={14} />
                </Link>
                <DeleteButton endpoint={`/api/admin/experience/${e.id}`} label={e.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
