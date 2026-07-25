"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Download, ExternalLink, FileText, Layers, Printer, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { experience, profile, projects, skillClusters } from "@/data/portfolio";

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResumeModal({ isOpen, onClose }: ResumeModalProps) {
  const [activeTab, setActiveTab] = useState<"pdf" | "summary">("pdf");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-lg"
        onClick={onClose}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <motion.div
          className="relative flex flex-col w-full max-w-4xl h-[88vh] overflow-hidden rounded-2xl border border-[var(--line-strong)] bg-[var(--card-bg)] text-[var(--foreground)] shadow-2xl"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          data-lenis-prevent="true"
        >
          {/* Top Bar Controls & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[var(--line)] bg-[var(--card-hover)] px-4 py-3 gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-[var(--accent)]" />
                <span className="font-mono text-xs sm:text-sm font-bold text-[var(--heading)]">
                  {profile.name} — Resume
                </span>
              </div>

              {/* View Mode Tabs */}
              <div className="flex items-center rounded-lg border border-[var(--line)] bg-[var(--background)] p-0.5 font-mono text-xs">
                <button
                  onClick={() => setActiveTab("pdf")}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    activeTab === "pdf"
                      ? "bg-[var(--accent)] text-white font-semibold shadow-sm"
                      : "text-[var(--muted)] hover:text-[var(--heading)]"
                  }`}
                >
                  PDF Document
                </button>
                <button
                  onClick={() => setActiveTab("summary")}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    activeTab === "summary"
                      ? "bg-[var(--accent)] text-white font-semibold shadow-sm"
                      : "text-[var(--muted)] hover:text-[var(--heading)]"
                  }`}
                >
                  Quick Summary
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--card-bg)] px-3 py-1.5 font-mono text-xs font-medium text-[var(--heading)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all cursor-pointer"
                title="Print Resume"
              >
                <Printer size={13} /> Print
              </button>

              <a
                href={profile.resume}
                download="Anas_Arfeen_Resume.pdf"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--card-bg)] px-3 py-1.5 font-mono text-xs font-medium text-[var(--heading)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
              >
                <Download size={13} /> PDF
              </a>

              <a
                href={profile.resume}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--card-bg)] px-3 py-1.5 font-mono text-xs font-medium text-[var(--heading)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
              >
                <ExternalLink size={13} /> Open
              </a>

              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-[var(--muted)] hover:bg-[var(--line)] hover:text-[var(--heading)] transition-colors cursor-pointer"
                aria-label="Close resume viewer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Modal Content Body */}
          {activeTab === "pdf" ? (
            <div className="flex-1 w-full h-full bg-[#040810]" data-lenis-prevent="true">
              <iframe
                src={`${profile.resume}#toolbar=0`}
                title={`${profile.name} Resume PDF`}
                className="w-full h-full border-none"
              />
            </div>
          ) : (
            <div
              className="flex-1 w-full h-full overflow-y-auto p-5 sm:p-8 space-y-6 font-sans bg-[var(--background)]"
              data-lenis-prevent="true"
            >
              {/* Header Overview */}
              <div className="border-b border-[var(--line)] pb-5">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--heading)]">{profile.name}</h2>
                <p className="text-xs sm:text-sm font-mono text-[var(--accent)] mt-1 font-semibold">{profile.role}</p>
                <p className="text-xs text-[var(--muted)] mt-2 leading-relaxed">{profile.bio}</p>

                <div className="mt-3 flex flex-wrap gap-4 font-mono text-xs text-[var(--muted)]">
                  <span>📍 {profile.location}</span>
                  <span>✉️ {profile.email}</span>
                  <span>🎓 {profile.education}</span>
                </div>
              </div>

              {/* Education */}
              <div>
                <h3 className="font-mono text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-2">
                  EDUCATION
                </h3>
                <div className="rounded-xl border border-[var(--line)] bg-[var(--card-hover)] p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-[var(--heading)] text-sm">{profile.education}</div>
                      <div className="text-xs text-[var(--muted)] mt-1">Specialization in Computer Science & Artificial Intelligence</div>
                    </div>
                    <span className="font-mono text-xs text-[var(--signal)] font-semibold">2025 – 2029</span>
                  </div>
                </div>
              </div>

              {/* Experience & Leadership */}
              <div>
                <h3 className="font-mono text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-2">
                  LEADERSHIP & POSITIONS
                </h3>
                <div className="space-y-3">
                  {experience.map((item) => (
                    <div key={item.org} className="rounded-xl border border-[var(--line)] bg-[var(--card-hover)] p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-[var(--heading)] text-sm">{item.role}</div>
                          <div className="text-xs font-semibold text-[var(--accent)]">{item.org}</div>
                        </div>
                        <span className="font-mono text-xs text-[var(--signal)] font-semibold">{item.time}</span>
                      </div>
                      <ul className="mt-2 space-y-1 text-xs text-[var(--muted)]">
                        {item.notes.map((note, idx) => (
                          <li key={idx}>• {note}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Ecosystem */}
              <div>
                <h3 className="font-mono text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-2">
                  TECH ECOSYSTEM
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {skillClusters.map((cluster) => (
                    <div key={cluster.label} className="rounded-xl border border-[var(--line)] bg-[var(--card-hover)] p-3.5">
                      <div className="font-mono text-xs font-bold text-[var(--heading)]">{cluster.label}</div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {cluster.modules.map((mod) => (
                          <span key={mod} className="rounded-md border border-[var(--line)] bg-[var(--background)] px-2 py-0.5 font-mono text-[10px] text-[var(--accent)] font-semibold">
                            {mod}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
