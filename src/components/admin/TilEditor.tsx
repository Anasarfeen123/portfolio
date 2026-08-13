"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Save } from "lucide-react";

export function TilEditor({ slug, initialContent, initialDate, initialTags }: { slug: string; initialContent: string; initialDate: string; initialTags: string }) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [date, setDate] = useState(initialDate);
  const [tags, setTags] = useState(initialTags);
  const [status, setStatus] = useState<{ type: "idle" | "saving" | "error" | "success"; message?: string }>({ type: "idle" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "saving" });

    try {
      const res = await fetch(`/api/admin/til/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          date,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Save failed");

      setStatus({ type: "success", message: "Saved — committed to main, live in ~30–90s once the deploy finishes." });
      router.refresh();
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Save failed" });
    }
  };

  return (
    <div className="admin-page-inner">
      <div className="admin-page-header">
        <div>
          <div className="kicker">Admin</div>
          <h1 className="admin-page-title">Edit TIL entry</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="admin-field">
          <label htmlFor="content">Content</label>
          <textarea id="content" required rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
        </div>

        <div className="admin-editor-grid-2" style={{ marginTop: 14 }}>
          <div className="admin-field">
            <label htmlFor="date">Date</label>
            <input id="date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="admin-field">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
        </div>

        <div className="admin-toolbar">
          <div className="admin-toolbar-actions">
            <button type="submit" disabled={status.type === "saving"} className="admin-primary-button">
              {status.type === "saving" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save changes
            </button>
          </div>
          {status.type === "error" && <span className="admin-status admin-status-error">{status.message}</span>}
          {status.type === "success" && <span className="admin-status admin-status-success">{status.message}</span>}
        </div>
      </form>
    </div>
  );
}
