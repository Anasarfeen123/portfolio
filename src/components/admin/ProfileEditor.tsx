"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import type { Profile } from "@/data/portfolio";

export type EditorProfile = Omit<Profile, "highlights"> & { highlights: string }; // "Label | Value" per line

interface ProfileEditorProps {
  initialProfile: EditorProfile;
}

export function ProfileEditor({ initialProfile }: ProfileEditorProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<EditorProfile>(initialProfile);
  const [status, setStatus] = useState<{ type: "idle" | "saving" | "error" | "success"; message?: string }>({
    type: "idle",
  });

  const field = (key: keyof EditorProfile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setProfile((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "saving" });

    const highlights = profile.highlights
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [label, value] = line.split("|").map((s) => s.trim());
        return { label: label ?? "", value: value ?? "" };
      })
      .filter((h) => h.label && h.value);

    const payload = { ...profile, highlights };

    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
          <h1 className="admin-page-title">Profile</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="admin-editor-grid">
          <div className="admin-editor-grid-2">
            <div className="admin-field">
              <label htmlFor="name">Name</label>
              <input id="name" required value={profile.name} onChange={field("name")} />
            </div>
            <div className="admin-field">
              <label htmlFor="role">Role</label>
              <input id="role" required value={profile.role} onChange={field("role")} />
            </div>
          </div>

          <div className="admin-field">
            <label htmlFor="statement">Statement (hero tagline)</label>
            <textarea id="statement" required rows={2} value={profile.statement} onChange={field("statement")} />
          </div>

          <div className="admin-field">
            <label htmlFor="bio">Bio</label>
            <textarea id="bio" required rows={4} value={profile.bio} onChange={field("bio")} />
          </div>

          <div className="admin-editor-grid-2">
            <div className="admin-field">
              <label htmlFor="location">Location</label>
              <input id="location" value={profile.location} onChange={field("location")} />
            </div>
            <div className="admin-field">
              <label htmlFor="education">Education</label>
              <input id="education" value={profile.education} onChange={field("education")} />
            </div>
          </div>

          <div className="admin-editor-grid-2">
            <div className="admin-field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" required value={profile.email} onChange={field("email")} />
            </div>
            <div className="admin-field">
              <label htmlFor="handle">GitHub handle</label>
              <input id="handle" value={profile.handle} onChange={field("handle")} />
            </div>
          </div>

          <div className="admin-editor-grid-2">
            <div className="admin-field">
              <label htmlFor="github">GitHub URL</label>
              <input id="github" type="url" value={profile.github} onChange={field("github")} />
            </div>
            <div className="admin-field">
              <label htmlFor="linkedin">LinkedIn URL</label>
              <input id="linkedin" type="url" value={profile.linkedin} onChange={field("linkedin")} />
            </div>
          </div>

          <div className="admin-editor-grid-2">
            <div className="admin-field">
              <label htmlFor="portfolio">Site URL</label>
              <input id="portfolio" type="url" value={profile.portfolio} onChange={field("portfolio")} />
            </div>
            <div className="admin-field">
              <label htmlFor="avatar">Avatar path</label>
              <input id="avatar" value={profile.avatar} onChange={field("avatar")} placeholder="/Photo.jpg" />
            </div>
          </div>

          <div className="admin-field">
            <label htmlFor="resume">Resume path</label>
            <input id="resume" value={profile.resume} onChange={field("resume")} placeholder="/Resume.pdf" />
            <span className="admin-field-hint">
              To replace the actual PDF file, use the <a href="/admin/resume" className="underline">Resume</a> page — this
              field just points at the path.
            </span>
          </div>

          <div className="admin-field">
            <label htmlFor="highlights">Hero highlights (one &ldquo;Label | Value&rdquo; per line)</label>
            <textarea id="highlights" rows={4} value={profile.highlights} onChange={field("highlights")} />
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
