"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, GitFork, Sparkles, Star, X } from "lucide-react";
import { useEffect } from "react";
import { type Project } from "@/data/portfolio";
import { useGitHubRepo } from "@/hooks/useGitHubRepo";

function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

interface ProjectDetailsModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectDetailsModal({ project, onClose }: ProjectDetailsModalProps) {
  const ghStats = useGitHubRepo(project?.repoName);

  useEffect(() => {
    if (project) {
      document.body.style.overflow = "hidden";
      const handleKeyScrollBlock = (e: KeyboardEvent) => {
        const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "PageUp", "PageDown"];
        if (keys.includes(e.key) || keys.includes(e.code)) {
          e.preventDefault();
        }
      };

      window.addEventListener("keydown", handleKeyScrollBlock, { capture: true });
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyScrollBlock, { capture: true });
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [project]);

  if (!project) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md"
        onClick={onClose}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <motion.div
          className="relative flex flex-col w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-2xl border border-[var(--line-strong)] bg-[#090d16] text-[#e2e8f0] p-6 shadow-2xl"
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          data-lenis-prevent="true"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-[#1e293b] pb-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-[var(--accent)] font-semibold">
                <Sparkles size={13} /> {project.repoName}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">{project.title}</h2>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-2 text-[#94a3b8] hover:bg-[#1e293b] hover:text-white transition-colors"
              aria-label="Close project details"
            >
              <X size={18} />
            </button>
          </div>

          {/* Image / Visual Header */}
          {project.image ? (
            <div className="mt-4 overflow-hidden rounded-xl border border-[#1e293b] bg-[#02040a]">
              <img src={project.image} alt={project.title} className="w-full max-h-[320px] object-cover" />
            </div>
          ) : null}

          {/* GitHub Stats Strip */}
          {!ghStats.loading && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-[#1e293b] bg-[#0d1527] px-4 py-2.5 font-mono text-xs text-[#94a3b8]">
              {ghStats.language && (
                <span className="font-semibold text-[var(--accent)]">
                  Primary Language: {ghStats.language}
                </span>
              )}
              {ghStats.stars > 0 && (
                <span className="flex items-center gap-1">
                  <Star size={12} className="text-amber-500 fill-amber-500" /> {ghStats.stars} Stars
                </span>
              )}
              {ghStats.forks > 0 && (
                <span className="flex items-center gap-1">
                  <GitFork size={12} /> {ghStats.forks} Forks
                </span>
              )}
              {ghStats.updatedAt && <span>Last Commit: {ghStats.updatedAt}</span>}
            </div>
          )}

          {/* Signal */}
          <div className="mt-4 border-l-2 border-[var(--accent)] pl-4 text-sm font-medium text-white">
            {project.signal}
          </div>

          {/* Problem Statement */}
          <div className="mt-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--signal)] font-semibold">The Problem</h3>
            <p className="mt-1 text-sm text-[#cbd5e1] leading-relaxed">{project.problem}</p>
          </div>

          {/* Architecture Pipeline */}
          <div className="mt-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--accent)] font-semibold">Engineering Pipeline & Architecture</h3>
            <div className="mt-2 space-y-2">
              {project.architecture.map((line, idx) => (
                <div key={idx} className="flex items-start gap-2.5 rounded-lg border border-[#1e293b] bg-[#0d1527] p-3 text-xs font-mono text-[#e2e8f0]">
                  <span className="text-[var(--accent)] font-bold">0{idx + 1}.</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Impact */}
          <div className="mt-4 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--accent)] font-semibold">Impact & Results</h3>
            <p className="mt-1 text-xs text-white font-medium">{project.impact}</p>
          </div>

          {/* Tech Stack Pills */}
          <div className="mt-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-[#94a3b8] font-semibold mb-2">Technologies Used</h3>
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.map((tech) => (
                <span key={tech} className="rounded-full border border-[#1e293b] bg-[#1e293b] px-3 py-1 font-mono text-xs text-[#cbd5e1]">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Action Links */}
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#1e293b] pt-4">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)] bg-[var(--accent)] px-5 py-2 font-mono text-xs font-semibold text-white shadow-md hover:brightness-110 transition-all"
              >
                <GithubIcon size={14} /> Open GitHub Repository <ExternalLink size={12} />
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--signal)] bg-amber-500/10 px-5 py-2 font-mono text-xs font-semibold text-[var(--signal)] hover:bg-amber-500/20 transition-all"
              >
                Launch Live Demo <ExternalLink size={12} />
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
