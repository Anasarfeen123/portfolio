"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Send } from "lucide-react";

export function TilQuickAdd() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<{ type: "idle" | "saving" | "error"; message?: string }>({ type: "idle" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setStatus({ type: "saving" });

    try {
      const res = await fetch("/api/admin/til", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Save failed");

      setContent("");
      setTags("");
      setStatus({ type: "idle" });
      router.refresh();
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Save failed" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="viz-card" style={{ marginBottom: 20 }}>
      <textarea
        required
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What did you learn? A sentence or two, Markdown works."
        className="admin-textarea"
        style={{ minHeight: 80 }}
      />
      <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginTop: 10 }}>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags, comma-separated (optional)"
          className="admin-field-hint"
          style={{ flex: 1, minWidth: 180, border: "1px solid var(--line)", borderRadius: 8, padding: "6px 10px", background: "var(--background)" }}
        />
        <button type="submit" disabled={status.type === "saving"} className="admin-primary-button">
          {status.type === "saving" ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Post
        </button>
      </div>
      {status.type === "error" && <p className="admin-status admin-status-error" style={{ marginTop: 8 }}>{status.message}</p>}
    </form>
  );
}
