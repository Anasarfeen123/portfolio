"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Code2, ExternalLink, GitFork, Search, Sparkles, Star, Terminal, X } from "lucide-react";
import { useState } from "react";
import { projects, type Project } from "@/data/portfolio";
import { useGitHubRepo } from "@/hooks/useGitHubRepo";

function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

interface AllProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (project: Project) => void;
}

const categories = [
  { id: "all", label: "All Builds (11)" },
  { id: "ai", label: "AI & Vision (4)" },
  { id: "terminal", label: "Terminal & CLI (3)" },
  { id: "web", label: "Web & Telemetry (4)" },
  { id: "games", label: "Games & Simulation (2)" },
];

export function AllProjectsModal({ isOpen, onClose, onSelectProject }: AllProjectsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCat, setActiveCat] = useState("all");

  if (!isOpen) return null;

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.signal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.technologies.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeCat === "all") return true;
    if (activeCat === "ai") return ["rover", "celeb", "movie_prediction", "clanofcode"].includes(p.id);
    if (activeCat === "terminal") return ["ascii_cam", "musicalterm", "hyprland"].includes(p.id);
    if (activeCat === "web") return ["amazecc", "signal", "clanofcode", "celeb"].includes(p.id);
    if (activeCat === "games") return ["breakout", "convoy_gol"].includes(p.id);
    return true;
  });

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md"
        onClick={onClose}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <motion.div
          className="relative flex flex-col w-full max-w-5xl h-[90vh] overflow-hidden rounded-2xl border border-[var(--line-strong)] bg-[#090d16] text-[#e2e8f0] p-4 sm:p-6 shadow-2xl"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          data-lenis-prevent="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-[var(--accent)] font-semibold uppercase tracking-wider">
                <Code2 size={14} /> Full Repository Catalog
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">All {projects.length} Engineered Systems</h2>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-2 text-[#94a3b8] hover:bg-[#1e293b] hover:text-white transition-colors"
              aria-label="Close projects catalog"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            {/* Search Input Bar */}
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]" />
              <input
                type="text"
                placeholder="Search by keyword, tech, or repo name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-[#1e293b] bg-[#02040a] pl-9 pr-4 py-2 text-xs font-mono text-white placeholder:text-[#64748b] outline-none focus:border-[var(--accent)] transition-all"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCat(cat.id)}
                  className={`rounded-full px-3 py-1.5 font-mono text-xs font-semibold transition-all ${
                    activeCat === cat.id
                      ? "border border-[var(--accent)] bg-[var(--accent)] text-white shadow-md"
                      : "border border-[#1e293b] bg-[#0d1527] text-[#94a3b8] hover:border-[#334155] hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Projects Grid Catalog Stream */}
          <div
            className="mt-4 flex-1 overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 gap-4"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            data-lenis-prevent="true"
          >
            {filtered.map((project, idx) => (
              <CatalogCard
                key={project.id}
                index={idx}
                project={project}
                onSelect={() => {
                  onSelectProject(project);
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function CatalogCard({
  project,
  index,
  onSelect,
}: {
  project: Project;
  index: number;
  onSelect: () => void;
}) {
  const ghStats = useGitHubRepo(project.repoName);

  return (
    <div
      onClick={onSelect}
      className="group flex flex-col justify-between rounded-xl border border-[#1e293b] bg-[#0d1527] p-4 cursor-pointer hover:border-[var(--accent)] hover:bg-[#111a30] transition-all shadow-md"
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">
            REPOS // 0{index + 1}
          </span>

          {!ghStats.loading && (
            <div className="flex items-center gap-2 font-mono text-xs text-[#94a3b8]">
              {ghStats.language && (
                <span className="rounded bg-[#02040a] px-2 py-0.5 font-semibold text-[var(--accent)] text-[10px]">
                  {ghStats.language}
                </span>
              )}
              {ghStats.stars > 0 && (
                <span className="flex items-center gap-1">
                  <Star size={11} className="text-amber-500 fill-amber-500" /> {ghStats.stars}
                </span>
              )}
            </div>
          )}
        </div>

        <h3 className="text-lg font-bold text-white group-hover:text-[var(--accent)] transition-colors mt-1">
          {project.title}
        </h3>

        {/* Screenshot Image if available */}
        {project.image && (
          <div className="my-2.5 overflow-hidden rounded-lg border border-[#1e293b] max-h-[120px] bg-[#02040a]">
            <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        )}

        <p className="text-xs text-[#cbd5e1] line-clamp-2 mt-1">{project.signal}</p>

        <div className="mt-3 flex flex-wrap gap-1">
          {project.technologies.map((tech) => (
            <span key={tech} className="rounded-full border border-[#1e293b] bg-[#02040a] px-2.5 py-0.5 font-mono text-[10px] text-[#94a3b8]">
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#1e293b] pt-3 text-xs font-mono font-semibold">
        <span className="text-[var(--accent)] inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          Full Details <ArrowRight size={12} />
        </span>

        <div className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
          {project.github && (
            <a href={project.github} target="_blank" rel="noreferrer" className="text-[#94a3b8] hover:text-white" title="GitHub Repo">
              <GithubIcon size={14} />
            </a>
          )}
          {project.demo && (
            <a href={project.demo} target="_blank" rel="noreferrer" className="text-[var(--signal)] hover:underline" title="Live Demo">
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
