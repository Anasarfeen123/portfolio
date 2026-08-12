"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Layers, Search, Sparkles } from "lucide-react";
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
          <div className="kicker">
            <Sparkles size={12} /> Full Catalog
          </div>
          <h1 className="site-hero-title">{projects.length} real, shipped systems.</h1>
          <p className="site-hero-copy">
            Every project here is a real repository under active or completed development — reinforcement-learning
            robotics, LLM-driven agents, computer vision, and full-stack platforms with actual users. No filler.
          </p>

          <div className="site-hero-stats">
            {Array.from(counts.entries()).map(([cat, count]) => (
              <button
                key={cat}
                onClick={() => setActiveCategory((prev) => (prev === cat ? "all" : cat))}
                className={`stat-badge stat-badge-button ${activeCategory === cat ? "stat-badge-active" : ""}`}
              >
                <div>
                  <div className="stat-badge-value">{count}</div>
                  <div className="stat-badge-label">{cat}</div>
                </div>
              </button>
            ))}
          </div>
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
