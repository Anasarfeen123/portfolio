"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink, GitFork, Sparkles, Star } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import type { Project } from "@/data/portfolio";
import { useGitHubRepo } from "@/hooks/useGitHubRepo";

function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

interface HolodeckPrismProps {
  projects: Project[];
  onOpenDetails: (project: Project) => void;
}

export function HolodeckPrism({ projects, onOpenDetails }: HolodeckPrismProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Connect page scroll position of section to 3D Prism rotation angle
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const totalDist = windowHeight + rect.height;
      const currentDist = windowHeight - rect.top;
      const scrollRatio = Math.max(0, Math.min(1, currentDist / totalDist));

      const targetIndex = Math.min(
        projects.length - 1,
        Math.floor(scrollRatio * projects.length)
      );

      setActiveIndex(targetIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [projects.length]);

  const nextFacet = () => {
    setActiveIndex((prev) => (prev + 1) % projects.length);
  };

  const prevFacet = () => {
    setActiveIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  const rotationAngle = activeIndex * -120;

  return (
    <div
      ref={containerRef}
      className="relative w-full py-10 flex flex-col items-center select-none overflow-hidden"
    >
      {/* Holodeck Ambient Glow Pedestal */}
      <div className="absolute inset-x-0 bottom-12 h-36 bg-gradient-to-t from-[#38edf8]/15 via-[#38edf8]/5 to-transparent blur-3xl pointer-events-none" />

      {/* 3D Holodeck Prism Stage */}
      <div className="relative w-full h-[450px] sm:h-[490px] flex items-center justify-center [perspective:1400px]">
        <motion.div
          animate={{ rotateY: rotationAngle }}
          transition={{ duration: 0.85, ease: [0.25, 1, 0.5, 1] }}
          className="relative w-[min(720px,92vw)] h-full [transform-style:preserve-3d]"
        >
          {projects.map((project, idx) => {
            const facetAngle = idx * 120;
            const isActive = activeIndex === idx;

            return (
              <div
                key={project.id}
                onClick={() => {
                  if (isActive) {
                    onOpenDetails(project);
                  } else {
                    setActiveIndex(idx);
                  }
                }}
                style={{
                  transform: `rotateY(${facetAngle}deg) translateZ(360px)`,
                  backfaceVisibility: "hidden",
                }}
                className={`absolute inset-0 cursor-pointer rounded-3xl border p-6 sm:p-8 backdrop-blur-2xl transition-all duration-500 shadow-2xl flex flex-col justify-between ${
                  isActive
                    ? "border-[var(--accent)] bg-[#081224]/90 shadow-[0_0_55px_rgba(56,237,248,0.3)] ring-1 ring-[var(--accent)]"
                    : "border-[var(--line)] bg-[#040812]/80 opacity-60 hover:opacity-90"
                }`}
              >
                <HolodeckFacetContent project={project} index={idx} isActive={isActive} onOpenDetails={onOpenDetails} />
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Futuristic Controls */}
      <div className="mt-8 flex items-center justify-between w-full max-w-sm px-4">
        <button
          onClick={prevFacet}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--accent)]/40 bg-[#081224] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-all shadow-lg active:scale-95 cursor-pointer font-mono"
          aria-label="Previous Facet"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex items-center gap-3">
          {projects.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`flex items-center justify-center rounded-full font-mono text-xs font-bold transition-all cursor-pointer ${
                i === activeIndex
                  ? "h-9 w-9 border-2 border-[var(--accent)] bg-[var(--accent)] text-white shadow-[0_0_15px_var(--accent)] scale-110"
                  : "h-7 w-7 border border-[#1e293b] bg-[#090d16] text-[#94a3b8] hover:border-[var(--accent)] hover:text-white"
              }`}
            >
              0{i + 1}
            </button>
          ))}
        </div>

        <button
          onClick={nextFacet}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--accent)]/40 bg-[#081224] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-all shadow-lg active:scale-95 cursor-pointer font-mono"
          aria-label="Next Facet"
        >
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

function HolodeckFacetContent({
  project,
  index,
  isActive,
  onOpenDetails,
}: {
  project: Project;
  index: number;
  isActive: boolean;
  onOpenDetails: (p: Project) => void;
}) {
  const ghStats = useGitHubRepo(project.repoName);

  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="font-mono text-xs font-bold text-[var(--accent)] tracking-widest uppercase">
              HOLODECK PRISM // FACET_0{index + 1}
            </span>
          </div>

          {!ghStats.loading && (
            <div className="flex items-center gap-2.5 font-mono text-xs text-[var(--muted)]">
              {ghStats.language && (
                <span className="rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-0.5 font-semibold text-[var(--accent)] text-[11px]">
                  {ghStats.language}
                </span>
              )}
              {ghStats.stars > 0 && (
                <span className="flex items-center gap-1 font-bold text-amber-400">
                  <Star size={13} className="fill-amber-400" /> {ghStats.stars}
                </span>
              )}
            </div>
          )}
        </div>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
          {project.title}
        </h3>

        {/* Screenshot Banner */}
        {project.image && (
          <div className="my-3.5 overflow-hidden rounded-2xl border border-[#1e293b] max-h-[160px] sm:max-h-[185px] bg-[#02040a] relative group">
            <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-2 left-3 font-mono text-[10px] text-[var(--accent)] tracking-widest font-semibold">
              SYSTEM_STATE: OPERATIONAL
            </div>
          </div>
        )}

        <div className="border-l-2 border-[var(--accent)] pl-3 text-xs font-bold text-white mt-1">
          {project.signal}
        </div>

        <p className="text-xs text-[#cbd5e1] line-clamp-2 mt-1.5 leading-relaxed">{project.problem}</p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#1e293b] pt-3 text-xs font-mono font-bold">
        <span
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(project);
          }}
          className="text-[var(--accent)] inline-flex items-center gap-2 hover:underline cursor-pointer group"
        >
          View Full Engineering Pipeline <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </span>

        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          {project.github && (
            <a href={project.github} target="_blank" rel="noreferrer" className="text-[#94a3b8] hover:text-white transition-colors" title="GitHub Repo">
              <GithubIcon size={16} />
            </a>
          )}
          {project.demo && (
            <a href={project.demo} target="_blank" rel="noreferrer" className="text-[var(--signal)] hover:underline" title="Live Demo">
              <ExternalLink size={16} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
