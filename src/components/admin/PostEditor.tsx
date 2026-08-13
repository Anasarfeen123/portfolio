"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { Eye, ImagePlus, Link2, Loader2, Pencil, Save } from "lucide-react";
import { projects } from "@/data/portfolio";
import { BlogContent } from "@/components/BlogContent";

export type EditorInitialPost = {
  title: string;
  excerpt: string;
  date: string;
  tags: string; // comma-joined, for the input
  readingTime: string;
  projectId: string; // "" for none
  content: string;
};

const EMPTY: EditorInitialPost = {
  title: "",
  excerpt: "",
  date: new Date().toISOString().slice(0, 10),
  tags: "",
  readingTime: "",
  projectId: "",
  content: "",
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function estimateReadingTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.readAsDataURL(file);
  });
}

/** Inserts `insertText` at `cursorPos` in `current`, adding blank-line
 * padding around it so it never runs into adjacent text/markdown. */
function insertAtCursor(current: string, insertText: string, cursorPos: number) {
  const before = current.slice(0, cursorPos);
  const after = current.slice(cursorPos);
  const prefix = before.length === 0 ? "" : before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
  const suffix = after.length === 0 ? "" : after.startsWith("\n\n") ? "" : after.startsWith("\n") ? "\n" : "\n\n";
  const text = before + prefix + insertText + suffix + after;
  return { text, newCursor: (before + prefix + insertText).length };
}

interface PostEditorProps {
  mode: "new" | "edit";
  slug?: string;
  initialPost?: EditorInitialPost;
}

export function PostEditor({ mode, slug: existingSlug, initialPost }: PostEditorProps) {
  const router = useRouter();
  const [post, setPost] = useState<EditorInitialPost>(initialPost ?? EMPTY);
  const [slug, setSlug] = useState(existingSlug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [preview, setPreview] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "saving" | "error" | "success"; message?: string }>({
    type: "idle",
  });
  const [uploading, setUploading] = useState(false);
  const [fetchingPreview, setFetchingPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = mode === "edit";
  const tagsPreview = useMemo(
    () => post.tags.split(",").map((t) => t.trim()).filter(Boolean),
    [post.tags]
  );

  const handleTitleChange = (title: string) => {
    setPost((p) => ({ ...p, title }));
    if (!slugTouched) setSlug(slugify(title));
  };

  const insertIntoContent = (markdown: string) => {
    const el = textareaRef.current;
    const cursorPos = el?.selectionStart ?? post.content.length;
    const { text, newCursor } = insertAtCursor(post.content, markdown, cursorPos);
    setPost((p) => ({ ...p, content: text }));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(newCursor, newCursor);
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // so picking the same file twice still fires onChange
    if (!file || !slug) return;

    setUploading(true);
    try {
      const dataBase64 = await fileToBase64(file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "blog", ownerId: slug, filename: file.name, dataBase64 }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Upload failed");
      insertIntoContent(`![](${body.url})`);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleAddLinkPreview = async () => {
    const url = window.prompt("URL to preview:");
    if (!url) return;

    setFetchingPreview(true);
    try {
      const res = await fetch("/api/admin/link-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Couldn't fetch a preview for that URL.");
      const block = "```linkpreview\n" + JSON.stringify({ url: body.url, title: body.title, description: body.description, image: body.image }) + "\n```";
      insertIntoContent(block);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Couldn't fetch a preview for that URL.");
    } finally {
      setFetchingPreview(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "saving" });

    const payload = {
      ...(isEdit ? {} : { slug }),
      title: post.title.trim(),
      excerpt: post.excerpt.trim(),
      date: post.date,
      tags: tagsPreview,
      readingTime: post.readingTime.trim(),
      projectId: post.projectId || undefined,
      content: post.content,
    };

    try {
      const res = await fetch(isEdit ? `/api/admin/posts/${existingSlug}` : "/api/admin/posts", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Save failed");

      setStatus({
        type: "success",
        message: `${isEdit ? "Saved" : "Published"} — committed to main, live in ~30–90s once the deploy finishes.`,
      });
      if (!isEdit) router.push(`/admin/${body.slug}/edit`);
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
          <h1 className="admin-page-title">{isEdit ? "Edit post" : "New post"}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="admin-field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            required
            value={post.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="What's this post about?"
          />
        </div>

        <div className="admin-editor-grid">
          <div className="admin-field">
            <label htmlFor="slug">Slug</label>
            <input
              id="slug"
              required
              disabled={isEdit}
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              placeholder="auto-generated-from-title"
            />
            {isEdit && <span className="admin-field-hint">Slug can&apos;t change after publishing (it&apos;s the URL and filename).</span>}
          </div>

          <div className="admin-editor-grid-2">
            <div className="admin-field">
              <label htmlFor="date">Date</label>
              <input id="date" type="date" required value={post.date} onChange={(e) => setPost((p) => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="admin-field">
              <label htmlFor="readingTime">Reading time</label>
              <input
                id="readingTime"
                value={post.readingTime}
                onChange={(e) => setPost((p) => ({ ...p, readingTime: e.target.value }))}
                onFocus={(e) => {
                  if (!e.target.value) setPost((p) => ({ ...p, readingTime: estimateReadingTime(p.content) }));
                }}
                placeholder="6 min read"
              />
            </div>
          </div>

          <div className="admin-field">
            <label htmlFor="excerpt">Excerpt</label>
            <input
              id="excerpt"
              required
              value={post.excerpt}
              onChange={(e) => setPost((p) => ({ ...p, excerpt: e.target.value }))}
              placeholder="One or two sentences — shown on the blog index"
            />
          </div>

          <div className="admin-editor-grid-2">
            <div className="admin-field">
              <label htmlFor="tags">Tags</label>
              <input
                id="tags"
                value={post.tags}
                onChange={(e) => setPost((p) => ({ ...p, tags: e.target.value }))}
                placeholder="Comma-separated, e.g. Reinforcement Learning, PyTorch"
              />
            </div>
            <div className="admin-field">
              <label htmlFor="projectId">Related project (optional)</label>
              <select id="projectId" value={post.projectId} onChange={(e) => setPost((p) => ({ ...p, projectId: e.target.value }))}>
                <option value="">None</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="admin-field" style={{ marginTop: 20 }}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label htmlFor="content">Content (Markdown)</label>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!slug || uploading}
                title={slug ? "Upload an image" : "Enter a title/slug first"}
                className="admin-header-link"
              >
                {uploading ? <Loader2 size={12} className="animate-spin" /> : <ImagePlus size={12} />} Image
              </button>
              <button
                type="button"
                onClick={handleAddLinkPreview}
                disabled={fetchingPreview}
                className="admin-header-link"
              >
                {fetchingPreview ? <Loader2 size={12} className="animate-spin" /> : <Link2 size={12} />} Link preview
              </button>
              <button type="button" onClick={() => setPreview((v) => !v)} className="admin-header-link">
                {preview ? (
                  <>
                    <Pencil size={12} /> Write
                  </>
                ) : (
                  <>
                    <Eye size={12} /> Preview
                  </>
                )}
              </button>
            </div>
          </div>

          {preview ? (
            <div className="admin-preview">
              <BlogContent content={post.content || "*Nothing written yet.*"} />
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              id="content"
              required
              className="admin-textarea"
              value={post.content}
              onChange={(e) => setPost((p) => ({ ...p, content: e.target.value }))}
              placeholder={"## A heading\n\nA paragraph. **Bold**, _italic_, `code`, and lists all work.\n\n> **Callout label**\n>\n> A blockquote whose first line is bold renders as a highlighted callout.\n\n> A plain quote.\n>\n> — Attributed to someone (a blockquote's last line starting with an em dash renders as a citation)"}
            />
          )}
          <span className="admin-field-hint">
            Standard Markdown + GFM (tables, strikethrough). A bold blockquote first line renders as a callout; a last
            line starting with &ldquo;— &rdquo; renders as a citation. &ldquo;Image&rdquo; needs a slug set first (images
            are stored per-post). Max image size 3MB.
          </span>
        </div>

        <div className="admin-toolbar">
          <div className="admin-toolbar-actions">
            <button type="submit" disabled={status.type === "saving"} className="admin-primary-button">
              {status.type === "saving" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {isEdit ? "Save changes" : "Publish"}
            </button>
          </div>
          {status.type === "error" && <span className="admin-status admin-status-error">{status.message}</span>}
          {status.type === "success" && <span className="admin-status admin-status-success">{status.message}</span>}
        </div>
      </form>
    </div>
  );
}
