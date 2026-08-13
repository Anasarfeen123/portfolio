import type { Metadata } from "next";
import Link from "next/link";
import matter from "gray-matter";
import { Pencil, Plus } from "lucide-react";
import { listBlogFiles, getFile } from "@/lib/github-content";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
// Always fresh from GitHub, never cached — this reflects a publish instantly,
// unlike the public /blog pages which are static and only refresh on the
// redeploy a publish triggers. See src/lib/github-content.ts.
export const dynamic = "force-dynamic";

async function loadPostSummaries() {
  const files = await listBlogFiles();
  const posts = await Promise.all(
    files.map(async (f) => {
      const file = await getFile(f.path);
      const { data } = matter(file?.content ?? "");
      return { slug: f.slug, title: String(data.title ?? f.slug), date: String(data.date ?? "") };
    })
  );
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export default async function AdminDashboardPage() {
  const posts = await loadPostSummaries();

  return (
    <div className="admin-page-inner">
      <div className="admin-page-header">
        <div>
          <div className="kicker">Admin</div>
          <h1 className="admin-page-title">Posts</h1>
        </div>
        <Link href="/admin/new" className="admin-primary-button">
          <Plus size={14} /> New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="admin-empty">No posts yet — click &ldquo;New Post&rdquo; to write one.</p>
      ) : (
        <div className="admin-post-list">
          {posts.map((post) => (
            <div key={post.slug} className="admin-post-row">
              <div>
                <div className="admin-post-row-title">{post.title}</div>
                <div className="admin-post-row-meta">
                  {post.date || "no date"} · /blog/{post.slug}
                </div>
              </div>
              <div className="admin-post-row-actions">
                <Link href={`/admin/${post.slug}/edit`} className="admin-icon-link" title={`Edit ${post.slug}`}>
                  <Pencil size={14} />
                </Link>
                <DeleteButton endpoint={`/api/admin/posts/${post.slug}`} label={post.slug} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
