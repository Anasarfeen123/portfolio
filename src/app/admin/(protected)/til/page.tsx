import type { Metadata } from "next";
import Link from "next/link";
import matter from "gray-matter";
import { Pencil } from "lucide-react";
import { getFile, listMarkdownFiles } from "@/lib/github-content";
import { TIL_DIR } from "@/lib/til-validation";
import { TilQuickAdd } from "@/components/admin/TilQuickAdd";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const metadata: Metadata = { title: "Admin — TIL", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

async function loadEntries() {
  const files = await listMarkdownFiles(TIL_DIR);
  const entries = await Promise.all(
    files.map(async (f) => {
      const file = await getFile(f.path);
      const { data, content } = matter(file?.content ?? "");
      return { slug: f.slug, date: String(data.date ?? ""), content: content.trim() };
    })
  );
  return entries.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export default async function AdminTilPage() {
  const entries = await loadEntries();

  return (
    <div className="admin-page-inner">
      <div className="admin-page-header">
        <div>
          <div className="kicker">Admin</div>
          <h1 className="admin-page-title">TIL</h1>
        </div>
      </div>

      <TilQuickAdd />

      {entries.length === 0 ? (
        <p className="admin-empty">No entries yet — post one above.</p>
      ) : (
        <div className="admin-post-list">
          {entries.map((e) => (
            <div key={e.slug} className="admin-post-row">
              <div style={{ minWidth: 0 }}>
                <div className="admin-post-row-title" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {e.content.slice(0, 80)}
                  {e.content.length > 80 ? "…" : ""}
                </div>
                <div className="admin-post-row-meta">{e.date}</div>
              </div>
              <div className="admin-post-row-actions">
                <Link href={`/admin/til/${e.slug}/edit`} className="admin-icon-link" title={`Edit ${e.slug}`}>
                  <Pencil size={14} />
                </Link>
                <DeleteButton endpoint={`/api/admin/til/${e.slug}`} label={e.slug} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
