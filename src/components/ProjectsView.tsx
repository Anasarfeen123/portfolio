"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Layers, Search } from "lucide-react";
import { projectCategories, projects, type Project, type ProjectCategory } from "@/data/portfolio";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectDetailsModal } from "@/components/ProjectDetailsModal";
import { SiteHeader } from "@/components/SiteHeader";

type CategoryFilter = "all" | ProjectCategory;

export function ProjectsView() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("tech") ?? "");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const counts = useMemo(() => {
    const byCategory = new Map<ProjectCategory, number>();
    for (const cat of projectCategories) byCategory.set(cat, 0);
    for (const p of projects) byCategory.set(p.category, (byCategory.get(p.category) ?? 0) + 1);
    return byCategory;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesCategory = activeCategory === "all" || p.category === activeCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.signal.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.technologies.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query, activeCategory]);

  return (
    <div className="site-page">
      <SiteHeader active="projects" />

      <div className="site-page-inner">
        <div className="site-hero">
          <div className="kicker">Projects</div>
          <h1 className="site-hero-title">Everything I&apos;ve built, {projects.length} repos deep.</h1>
          <p className="site-hero-copy">
            Some of these are polished, some are weekend builds I never went back to clean up. All of them are real
            and I wrote all the code. Search or filter by category below.
          </p>
        </div>

        <div className="filter-bar">
          <div className="filter-search">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search by title, tech, or category..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="filter-pills">
            <button
              onClick={() => setActiveCategory("all")}
              className={`filter-pill ${activeCategory === "all" ? "filter-pill-active" : ""}`}
            >
              All ({projects.length})
            </button>
            {projectCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`filter-pill ${activeCategory === cat ? "filter-pill-active" : ""}`}
              >
                {cat} ({counts.get(cat) ?? 0})
              </button>
            ))}
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="project-grid">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} onOpenDetails={setSelectedProject} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Layers size={22} />
            <p>No projects match &ldquo;{query}&rdquo;. Try a different search or clear the category filter.</p>
          </div>
        )}
      </div>

      <ProjectDetailsModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </div>
  );
}
