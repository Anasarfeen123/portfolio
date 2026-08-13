"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, GitFork, Star, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { type Project } from "@/data/portfolio";
import { GithubIcon } from "@/components/GithubIcon";
import { useCanRenderWebGL } from "@/hooks/useCanRenderWebGL";
import { useGitHubRepo } from "@/hooks/useGitHubRepo";

// Real WebGL + Three.js — code-split out of the modal's own chunk, and only
// ever requested when a project modal that can actually render it opens.
const ArchitectureDiagram = dynamic(() => import("@/components/ArchitectureDiagram").then((m) => m.ArchitectureDiagram), {
  ssr: false,
  loading: () => <div className="arch-diagram-canvas arch-diagram-loading">Loading diagram…</div>,
});

interface ProjectDetailsModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectDetailsModal({ project, onClose }: ProjectDetailsModalProps) {
  const ghStats = useGitHubRepo(project?.repoName);
  const canRenderWebGL = useCanRenderWebGL();
  const [showText, setShowText] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);

  // A fresh project should always open on the 3D view (if available) — a
  // "view as text" choice from a previously-viewed project shouldn't carry
  // over to the next one. Same for the live-preview toggle.
  useEffect(() => {
    setShowText(false);
    setShowLivePreview(false);
  }, [project?.id]);

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
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-[#1e293b] pb-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-[var(--accent)] font-semibold">
                <GithubIcon size={13} /> {project.repoName}
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

          {/* Image / Visual Header — a live iframe of the actual site when
              it has a demo URL, screenshot otherwise. Not mounted by
              default: embedding can be blocked by a site's own
              X-Frame-Options/CSP (nothing JS can detect ahead of time), so
              this stays an explicit "peek at it live" action rather than a
              default that might just show a blank frame. */}
          {project.demo && (
            <div className="mt-4 flex justify-end">
              <button type="button" className="project-live-preview-toggle" onClick={() => setShowLivePreview((v) => !v)}>
                {showLivePreview ? "Show screenshot" : "Show live preview"}
              </button>
            </div>
          )}
          {showLivePreview && project.demo ? (
            <div className="mt-2">
              <div className="project-live-preview-frame">
                <iframe src={project.demo} title={`${project.title} — live preview`} loading="lazy" />
              </div>
              <p className="project-live-preview-note">
                Some sites block being embedded — if this looks empty,{" "}
                <a href={project.demo} target="_blank" rel="noreferrer">
                  open it directly <ExternalLink size={10} />
                </a>
              </p>
            </div>
          ) : project.image ? (
            <div className={`overflow-hidden rounded-xl border border-[#1e293b] bg-[#02040a] ${project.demo ? "mt-2" : "mt-4"}`}>
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

          {/* Architecture — 3D exploded diagram by default, plain text as the fallback */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--accent)] font-semibold">How It's Built</h3>
              {canRenderWebGL && (
                <button type="button" className="arch-diagram-fallback-toggle" onClick={() => setShowText((v) => !v)}>
                  {showText ? "View in 3D" : "View as text"}
                </button>
              )}
            </div>
            <div className="mt-2">
              {canRenderWebGL && !showText ? (
                <ArchitectureDiagram project={project} />
              ) : (
                <div className="space-y-2">
                  {project.architecture.map((line, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 rounded-lg border border-[#1e293b] bg-[#0d1527] p-3 text-xs font-mono text-[#e2e8f0]">
                      <span className="text-[var(--accent)] font-bold">0{idx + 1}.</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Impact */}
          <div className="mt-4 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--accent)] font-semibold">Why It Matters</h3>
            <p className="mt-1 text-xs text-white font-medium">{project.impact}</p>
          </div>

          {/* Tech Stack Pills */}
          <div className="mt-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-[#94a3b8] font-semibold mb-2">Technologies Used</h3>
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.map((tech) => (
                <span key={tech} className="rounded-md border border-[#1e293b] bg-[#1e293b] px-3 py-1 font-mono text-xs text-[#cbd5e1]">
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
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-5 py-2 font-mono text-xs font-semibold text-white shadow-md hover:brightness-110 transition-all"
              >
                <GithubIcon size={14} /> Open GitHub Repository <ExternalLink size={12} />
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--signal)] bg-[color-mix(in_srgb,var(--signal)_10%,transparent)] px-5 py-2 font-mono text-xs font-semibold text-[var(--signal)] hover:bg-[color-mix(in_srgb,var(--signal)_20%,transparent)] transition-all"
              >
                Launch Live Demo <ExternalLink size={12} />
              </a>
            )}
            {project.links?.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[#1e293b] bg-[#0d1527] px-5 py-2 font-mono text-xs font-semibold text-[#cbd5e1] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
              >
                {link.label} <ExternalLink size={12} />
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
