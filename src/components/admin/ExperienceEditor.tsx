"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import type { ExperienceEntry } from "@/data/portfolio";

export type EditorInitialExperience = {
  id: string;
  role: string;
  org: string;
  icon: ExperienceEntry["icon"];
  time: string;
  notes: string; // one per line, for the textarea
};

const EMPTY: EditorInitialExperience = {
  id: "",
  role: "",
  org: "",
  icon: "microsoft",
  time: "",
  notes: "",
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface ExperienceEditorProps {
  mode: "new" | "edit";
  initialEntry?: EditorInitialExperience;
}

export function ExperienceEditor({ mode, initialEntry }: ExperienceEditorProps) {
  const router = useRouter();
  const [entry, setEntry] = useState<EditorInitialExperience>(initialEntry ?? EMPTY);
  const [idTouched, setIdTouched] = useState(mode === "edit");
  const [status, setStatus] = useState<{ type: "idle" | "saving" | "error" | "success"; message?: string }>({
    type: "idle",
  });

  const isEdit = mode === "edit";

  const handleRoleChange = (role: string) => {
    setEntry((p) => ({ ...p, role }));
    if (!idTouched) setEntry((p) => ({ ...p, id: slugify(`${role}-${entry.org}`) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "saving" });

    const payload = {
      id: entry.id,
      role: entry.role.trim(),
      org: entry.org.trim(),
      icon: entry.icon,
      time: entry.time.trim(),
      notes: entry.notes.split("\n").map((s) => s.trim()).filter(Boolean),
    };

    try {
      const res = await fetch(isEdit ? `/api/admin/experience/${entry.id}` : "/api/admin/experience", {
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
      if (!isEdit) router.push(`/admin/experience/${body.id}/edit`);
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
          <h1 className="admin-page-title">{isEdit ? "Edit experience" : "New experience"}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="admin-editor-grid">
          <div className="admin-editor-grid-2">
            <div className="admin-field">
              <label htmlFor="role">Role</label>
              <input id="role" required value={entry.role} onChange={(e) => handleRoleChange(e.target.value)} placeholder="AI/ML Co-Lead" />
            </div>
            <div className="admin-field">
              <label htmlFor="org">Org</label>
              <input id="org" required value={entry.org} onChange={(e) => setEntry((p) => ({ ...p, org: e.target.value }))} placeholder="Microsoft Innovations Club, VIT Chennai" />
            </div>
          </div>

          <div className="admin-field">
            <label htmlFor="id">Id</label>
            <input
              id="id"
              required
              disabled={isEdit}
              value={entry.id}
              onChange={(e) => {
                setIdTouched(true);
                setEntry((p) => ({ ...p, id: slugify(e.target.value) }));
              }}
              placeholder="auto-generated-from-role-and-org"
            />
            {isEdit && <span className="admin-field-hint">Id can&apos;t change after creation.</span>}
          </div>

          <div className="admin-editor-grid-2">
            <div className="admin-field">
              <label htmlFor="icon">Club icon</label>
              <select id="icon" value={entry.icon} onChange={(e) => setEntry((p) => ({ ...p, icon: e.target.value as ExperienceEntry["icon"] }))}>
                <option value="microsoft">Microsoft Innovations Club</option>
                <option value="linux">Linux User Group</option>
                <option value="hackclub">Hack Club</option>
              </select>
            </div>
            <div className="admin-field">
              <label htmlFor="time">Time range</label>
              <input id="time" required value={entry.time} onChange={(e) => setEntry((p) => ({ ...p, time: e.target.value }))} placeholder="2026 – Present" />
            </div>
          </div>

          <div className="admin-field">
            <label htmlFor="notes">Notes (one bullet per line)</label>
            <textarea id="notes" required rows={4} value={entry.notes} onChange={(e) => setEntry((p) => ({ ...p, notes: e.target.value }))} />
          </div>
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
