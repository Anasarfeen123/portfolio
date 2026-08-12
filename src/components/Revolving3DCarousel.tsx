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

interface Revolving3DCarouselProps {
  projects: Project[];
  onOpenDetails: (project: Project) => void;
}

export function Revolving3DCarousel({ projects, onOpenDetails }: Revolving3DCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Connect page scroll position to 3D carousel index
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

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % projects.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full py-6 flex flex-col items-center select-none"
    >
      {/* Sleek Compact 3D Carousel Stage */}
      <div className="relative w-full h-[340px] sm:h-[370px] flex items-center justify-center [perspective:1000px]">
        {projects.map((project, idx) => {
          let offset = idx - activeIndex;
          if (offset < -1) offset += projects.length;
          if (offset > 1) offset -= projects.length;

          const isActive = offset === 0;
          const isLeft = offset === -1;
          const isRight = offset === 1;

          let rotateY = 0;
          let translateZ = 0;
          let translateX = "0%";
          let scale = 1;
          let opacity = 1;
          let zIndex = 20;

          if (isActive) {
            rotateY = 0;
            translateZ = 40;
            translateX = "0%";
            scale = 1;
            opacity = 1;
            zIndex = 30;
          } else if (isLeft) {
            rotateY = 28;
            translateZ = -90;
            translateX = "-32%";
            scale = 0.84;
            opacity = 0.6;
            zIndex = 10;
          } else if (isRight) {
            rotateY = -28;
            translateZ = -90;
            translateX = "32%";
            scale = 0.84;
            opacity = 0.6;
            zIndex = 10;
          } else {
            opacity = 0;
            zIndex = 0;
          }

          return (
            <motion.div
              key={project.id}
              onClick={() => {
                if (isActive) {
                  onOpenDetails(project);
                } else {
                  setActiveIndex(idx);
                }
              }}
              animate={{
                rotateY,
                translateZ,
                x: translateX,
                scale,
                opacity,
              }}
              transition={{
                duration: 0.55,
                ease: [0.25, 1, 0.5, 1],
              }}
              style={{ zIndex }}
              className={`absolute top-0 w-[min(480px,86vw)] h-full cursor-pointer rounded-2xl border p-5 backdrop-blur-lg shadow-xl transition-colors flex flex-col justify-between ${
                isActive
                  ? "border-[var(--accent)] bg-[var(--card-hover)] shadow-[0_0_30px_rgba(0,230,168,0.18)]"
                  : "border-[var(--line)] bg-[var(--card-bg)] hover:border-[var(--line-strong)]"
              }`}
            >
              <CarouselCardContent project={project} onOpenDetails={onOpenDetails} />
            </motion.div>
          );
        })}
      </div>

      {/* Navigation Controls & Dots */}
      <div className="mt-5 flex items-center justify-between w-full max-w-xs">
        <button
          onClick={prevSlide}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line-strong)] bg-[var(--card-hover)] text-[var(--heading)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all shadow-md active:scale-95 cursor-pointer"
          aria-label="Previous Project"
        >
          <ArrowLeft size={15} />
        </button>

        <div className="flex items-center gap-2">
          {projects.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                i === activeIndex ? "w-6 bg-[var(--accent)]" : "w-2 bg-[var(--line-strong)] hover:bg-[var(--heading)]"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line-strong)] bg-[var(--card-hover)] text-[var(--heading)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all shadow-md active:scale-95 cursor-pointer"
          aria-label="Next Project"
        >
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

function CarouselCardContent({
  project,
  onOpenDetails,
}: {
  project: Project;
  onOpenDetails: (p: Project) => void;
}) {
  const ghStats = useGitHubRepo(project.repoName);

  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs font-bold text-[var(--accent)] tracking-wider uppercase">
            {project.category}
          </span>

          {!ghStats.loading && (
            <div className="flex items-center gap-2 font-mono text-xs text-[var(--muted)]">
              {ghStats.language && (
                <span className="rounded bg-[var(--background)] px-2 py-0.5 font-semibold text-[var(--accent)] text-[10px]">
                  {ghStats.language}
                </span>
              )}
              {ghStats.stars > 0 && (
                <span className="flex items-center gap-1 font-bold text-amber-400">
                  <Star size={11} className="fill-amber-400" /> {ghStats.stars}
                </span>
              )}
            </div>
          )}
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-[var(--heading)] mt-1">{project.title}</h3>

        {/* Compact Screenshot Banner */}
        {project.image && (
          <div className="my-2.5 overflow-hidden rounded-xl border border-[var(--line)] max-h-[120px] bg-[#02040a]">
            <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="border-l-2 border-[var(--accent)] pl-2.5 text-xs font-semibold text-[var(--heading)]">
          {project.signal}
        </div>

        <p className="text-xs text-[var(--muted)] line-clamp-2 mt-1">{project.problem}</p>
      </div>

      <div className="mt-2.5 flex items-center justify-between border-t border-[var(--line)] pt-2.5 text-xs font-mono font-semibold">
        <span
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(project);
          }}
          className="text-[var(--accent)] inline-flex items-center gap-1 hover:underline cursor-pointer"
        >
          Full Details <ArrowRight size={12} />
        </span>

        <div className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
          {project.github && (
            <a href={project.github} target="_blank" rel="noreferrer" className="text-[var(--muted)] hover:text-[var(--heading)]" title="GitHub Repo">
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
