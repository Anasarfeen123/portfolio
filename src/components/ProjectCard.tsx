"use client";

import { ArrowRight, ExternalLink, Star } from "lucide-react";
import type { Project } from "@/data/portfolio";
import { GithubIcon } from "@/components/GithubIcon";
import { useGitHubRepo } from "@/hooks/useGitHubRepo";

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
