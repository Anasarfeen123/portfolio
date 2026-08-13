import type { Metadata } from "next";
import { ResumeUploader } from "@/components/admin/ResumeUploader";

export const metadata: Metadata = { title: "Admin — Resume", robots: { index: false, follow: false } };

export default function AdminResumePage() {
  return (
    <div className="admin-page-inner">
      <div className="admin-page-header">
        <div>
          <div className="kicker">Admin</div>
          <h1 className="admin-page-title">Resume</h1>
        </div>
      </div>
      <p className="admin-field-hint" style={{ marginBottom: 20 }}>
        Replaces <code>public/Resume.pdf</code> directly — the file everything on the site (the resume modal, download
        buttons) already points at. Same as everything else here: this commits to <code>main</code> and needs the
        redeploy (~30–90s) to actually go live.
      </p>
      <ResumeUploader />
    </div>
  );
}
