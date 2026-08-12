"use client";

import { ArrowRight, ExternalLink, Star } from "lucide-react";
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

export function ProjectCard({ project, onOpenDetails }: { project: Project; onOpenDetails: (p: Project) => void }) {
  const ghStats = useGitHubRepo(project.repoName);

  return (
    <div onClick={() => onOpenDetails(project)} className="project-card">
      <div className="flex items-center justify-between gap-2">
        <span className="project-card-category">{project.category}</span>
        {!ghStats.loading && (ghStats.language || ghStats.stars > 0) && (
          <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--muted)]">
            {ghStats.language && <span className="project-card-lang">{ghStats.language}</span>}
            {ghStats.stars > 0 && (
              <span className="flex items-center gap-1 font-semibold text-amber-500">
                <Star size={11} className="fill-amber-500 text-amber-500" /> {ghStats.stars}
              </span>
            )}
          </div>
        )}
      </div>

      <h3 className="project-card-title">{project.title}</h3>

      {project.image && (
        <div className="project-card-image">
          <img src={project.image} alt={project.title} loading="lazy" />
        </div>
      )}

      <p className="project-card-signal">{project.signal}</p>

      <div className="project-card-tech">
        {project.technologies.slice(0, 4).map((tech) => (
          <span key={tech}>{tech}</span>
        ))}
        {project.technologies.length > 4 && <span>+{project.technologies.length - 4}</span>}
      </div>

      <div className="project-card-footer">
        <span className="project-card-cta">
          Full Details <ArrowRight size={12} />
        </span>
        <div className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
          {project.github && (
            <a href={project.github} target="_blank" rel="noreferrer" title="GitHub Repo" className="project-card-icon-link">
              <GithubIcon size={14} />
            </a>
          )}
          {project.demo && (
            <a href={project.demo} target="_blank" rel="noreferrer" title="Live Demo" className="project-card-icon-link project-card-icon-link-demo">
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
