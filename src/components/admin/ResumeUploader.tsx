"use client";

import { useRef, useState } from "react";
import { ExternalLink, FileUp, Loader2 } from "lucide-react";

export function ResumeUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "error" | "success"; message?: string }>({ type: "idle" });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    setStatus({ type: "idle" });
    try {
      const dataBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1] ?? "");
        reader.onerror = () => reject(new Error("Couldn't read that file."));
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/admin/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, dataBase64 }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Upload failed");
      setStatus({ type: "success", message: "Uploaded — committed to main, live in ~30–90s once the deploy finishes." });
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="admin-post-row">
        <div>
          <div className="admin-post-row-title">Current resume</div>
          <a href="/Resume.pdf" target="_blank" rel="noreferrer" className="admin-post-row-meta" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            /Resume.pdf <ExternalLink size={11} />
          </a>
        </div>
        <div>
          <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileSelect} className="hidden" />
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="admin-primary-button">
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <FileUp size={14} />}
            Upload new PDF
          </button>
        </div>
      </div>
      {status.type === "error" && <p className="admin-status admin-status-error" style={{ marginTop: 12 }}>{status.message}</p>}
      {status.type === "success" && <p className="admin-status admin-status-success" style={{ marginTop: 12 }}>{status.message}</p>}
    </div>
  );
}
