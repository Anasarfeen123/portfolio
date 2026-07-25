"use client";

import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowRight, Code2, ExternalLink, FileText, GitFork, Mail, MapPin, Moon, Network, ScrollText, Sparkles, Star, Sun, Terminal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { experience, journey, profile, projects, skillClusters, type Project } from "@/data/portfolio";
import { ProjectDetailsModal } from "@/components/ProjectDetailsModal";
import { ResumeModal } from "@/components/ResumeModal";
import { TerminalModal } from "@/components/TerminalModal";
import { useGitHubRepo } from "@/hooks/useGitHubRepo";

function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

// Club Brand Logos
function ClubLogo({ iconKey }: { iconKey: "microsoft" | "linux" | "hackclub" }) {
  const [hasError, setHasError] = useState(false);

  const logoMap = {
    microsoft: {
      url: "https://avatars.githubusercontent.com/u/92003285?s=200&v=4",
      alt: "Microsoft Innovations Club VIT Chennai Logo",
    },
    linux: {
      url: "https://avatars.githubusercontent.com/u/100403019?v=4",
      alt: "Linux User Group VIT Chennai Logo",
    },
    hackclub: {
      url: "https://github.com/hackclub.png",
      alt: "Hack Club VIT Chennai Logo",
    },
  };

  const item = logoMap[iconKey];

  if (hasError || !item) {
    return (
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--line-strong)] bg-[var(--card-hover)] font-mono text-xs font-bold text-[var(--accent)] shadow-sm">
        {iconKey.slice(0, 2).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={item.url}
      alt={item.alt}
      onError={() => setHasError(true)}
      className="h-11 w-11 shrink-0 rounded-xl border border-[var(--line-strong)] object-cover bg-white/5 shadow-sm transition-transform hover:scale-105"
    />
  );
}

const SceneCanvas = dynamic(() => import("@/components/SceneCanvas").then((mod) => mod.SceneCanvas), {
  ssr: false,
  loading: () => <div className="scene-canvas" />,
});

const categories = [
  { id: "all", label: "All Builds" },
  { id: "ai", label: "AI & Vision" },
  { id: "terminal", label: "Terminal & CLI" },
  { id: "web", label: "Web & Telemetry" },
  { id: "games", label: "Games & Simulation" },
];

export function ScrollExperience() {
  const rootRef = useRef<HTMLElement | null>(null);
  const [booting, setBooting] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const timeout = window.setTimeout(() => setBooting(false), 1200);
    return () => window.clearTimeout(timeout);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsTerminalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!rootRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 0.8,
      lerp: 0.1,
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        onUpdate: (self) => {
          document.documentElement.style.setProperty("--stage-progress", self.progress.toFixed(4));
        },
      });
    }, rootRef);

    return () => {
      ctx.revert();
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
    };
  }, []);

  const filteredProjects = projects.filter((p) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "ai") return ["rover", "celeb", "movie_prediction", "clanofcode"].includes(p.id);
    if (activeCategory === "terminal") return ["ascii_cam", "musicalterm", "hyprland"].includes(p.id);
    if (activeCategory === "web") return ["amazecc", "signal", "clanofcode", "celeb"].includes(p.id);
    if (activeCategory === "games") return ["breakout", "convoy_gol"].includes(p.id);
    return true;
  });

  return (
    <main ref={rootRef} className="journey">
      {/* Fixed 3D WebGL Canvas Stage */}
      <div className="stage" aria-hidden="true">
        <SceneCanvas />
      </div>

      {/* Fast Boot Overlay */}
      <BootSequence visible={booting} />

      {/* Terminal Easter Egg Modal */}
      <TerminalModal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        onToggleTheme={toggleTheme}
        onOpenResume={() => setIsResumeOpen(true)}
      />

      {/* Embedded Resume Viewer Modal */}
      <ResumeModal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
      />

      {/* Project Details Modal Overlay */}
      <ProjectDetailsModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      {/* HUD Navigation Header */}
      <header className="hud">
        <a className="hud-mark" href="#top" aria-label="Anas Arfeen portfolio home">
          <span className="hud-status-dot" />
          ANAS_OS / EVOLUTION
        </a>
        <nav className="hud-actions" aria-label="Primary links">
          <button
            onClick={() => setIsTerminalOpen(true)}
            className="hud-link hud-button"
            title="Open Developer Shell (Cmd + K)"
          >
            <Terminal size={13} className="text-[var(--accent)]" />
            <span>CLI</span>
          </button>

          <button
            onClick={toggleTheme}
            className="hud-link hud-button"
            title="Toggle Light / Dark Theme"
          >
            {theme === "light" ? <Moon size={13} /> : <Sun size={13} className="text-amber-400" />}
          </button>

          <a className="hud-link hud-hide-mobile" href="#skills">
            <Network size={13} /> Skills
          </a>
          <a className="hud-link hud-hide-mobile" href="#projects">
            <Code2 size={13} /> Projects
          </a>
          <button onClick={() => setIsResumeOpen(true)} className="hud-link hud-button">
            <FileText size={13} /> Resume
          </button>
          <a className="hud-link hud-hide-mobile" href={profile.github} target="_blank" rel="noreferrer">
            <GithubIcon size={13} /> GitHub
          </a>
        </nav>
      </header>

      {/* Right Progress Rail */}
      <div className="progress-rail" aria-hidden="true">
        <span />
      </div>

      {/* Natural Scroll Content Stream */}
      <div className="narrative" id="top">
        {/* Section 1: Hero & Profile (Centered Main Card) */}
        <section className="chapter-section is-center">
          <div className="chapter-card">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Profile Avatar Photo */}
              <div className="relative shrink-0">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="h-28 w-28 sm:h-36 sm:w-36 rounded-2xl border-2 border-[var(--accent)] object-cover shadow-xl transition-transform hover:scale-105"
                />
                <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[var(--background)] bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]" />
              </div>

              <div className="flex-1">
                <div className="kicker">
                  <Sparkles size={12} /> AI Engineer & Systems Developer
                </div>
                <h1 className="mega-title">
                  {profile.name.split(" ")[0]}
                  <span>{profile.name.split(" ")[1]}</span>
                </h1>
                <p className="statement">{profile.statement}</p>
              </div>
            </div>

            <p className="chapter-copy mt-4">{profile.bio}</p>

            <div className="hero-stats">
              {profile.highlights.map((h) => (
                <div className="stat-badge" key={h.label}>
                  <div>
                    <div className="stat-badge-label">{h.label}</div>
                    <div className="stat-badge-value">{h.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="contact-vector mt-4">
              <a href={`mailto:${profile.email}`}>
                <Mail size={15} /> Contact Me
              </a>
              <button onClick={() => setIsResumeOpen(true)}>
                <FileText size={15} /> View Resume PDF
              </button>
              <button onClick={() => setIsTerminalOpen(true)}>
                <Terminal size={15} /> Open Terminal (⌘K)
              </button>
            </div>
          </div>
        </section>

        {/* Section 2: Origin & Education (Right) */}
        <section className="chapter-section is-right" id="origin">
          <div className="chapter-card">
            <div className="kicker">
              <MapPin size={12} /> Origin Trace
            </div>
            <h2 className="chapter-title">From systems curiosity to intelligent agents.</h2>
            <p className="chapter-copy">
              {profile.education}. The path moves from Linux systems and core data structures to dynamic reinforcement learning and AI communities.
            </p>

            <div className="timeline-stream">
              {journey.map((item) => (
                <div className="timeline-node" key={item.label}>
                  <div className="node-year">{item.year}</div>
                  <div>
                    <div className="node-label">{item.label}</div>
                    <div className="node-detail">{item.detail}</div>
                    {item.highlight && <span className="node-highlight">{item.highlight}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Skill Ecosystem (Left) */}
        <section className="chapter-section is-left" id="skills">
          <div className="chapter-card">
            <div className="kicker">
              <Network size={12} /> Tech Ecosystem
            </div>
            <h2 className="chapter-title">Skills as a connected neural map.</h2>
            <p className="chapter-copy">
              Organized by reinforcing systems: machine learning models, low-level systems, web engines, research habits, and developer tools.
            </p>

            <div className="skill-system">
              {skillClusters.map((cluster) => (
                <div className="skill-cluster-card" key={cluster.label}>
                  <div className="cluster-name">{cluster.label}</div>
                  <div className="cluster-desc">{cluster.description}</div>
                  <div className="cluster-modules">
                    {cluster.modules.map((mod) => (
                      <span className="module-pill" key={mod}>
                        {mod}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Projects Showcase (Right) */}
        <section className="chapter-section is-right" id="projects">
          <div className="chapter-card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="kicker">
                  <Terminal size={12} /> Project Portfolio
                </div>
                <h2 className="chapter-title">Systems under continuous inspection.</h2>
              </div>
            </div>

            {/* Filter Category Pills */}
            <div className="mt-6 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`rounded-full px-4 py-1.5 font-mono text-xs font-semibold transition-all ${
                    activeCategory === cat.id
                      ? "border border-[var(--accent)] bg-[var(--accent)] text-white shadow-md"
                      : "border border-[var(--line)] bg-[var(--card-hover)] text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--heading)]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="project-reel mt-6">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ProjectCard
                      index={index}
                      project={project}
                      onOpenDetails={(p) => setSelectedProject(p)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Section 5: Experience & Leadership (Left) */}
        <section className="chapter-section is-left" id="experience">
          <div className="chapter-card">
            <div className="kicker">
              <ScrollText size={12} /> Leadership & Community Impact
            </div>
            <h2 className="chapter-title">Clubs and ecosystem leadership.</h2>

            <div className="mission-log">
              {experience.map((item) => (
                <div className="log-row" key={`${item.role}-${item.org}`}>
                  <div className="log-time">{item.time}</div>
                  <div>
                    <div className="flex items-center gap-3">
                      <ClubLogo iconKey={item.icon} />
                      <div>
                        <div className="log-role">{item.role}</div>
                        <div className="node-detail font-medium text-[var(--accent)]">{item.org}</div>
                      </div>
                    </div>

                    <ul className="mt-3 space-y-1 text-xs text-[var(--muted)]">
                      {item.notes.map((note, nIdx) => (
                        <li key={nIdx}>• {note}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6: Convergence & Contact (Right) */}
        <section className="chapter-section is-right" id="contact">
          <div className="chapter-card">
            <div className="kicker">
              <Sparkles size={12} /> Convergence
            </div>
            <h2 className="chapter-title">Ready to build the next system.</h2>
            <p className="chapter-copy">
              Operating from Chennai, India. Let&apos;s collaborate on intelligent agents, machine learning applications, or developer infrastructure.
            </p>

            <div className="contact-vector">
              <a href={`mailto:${profile.email}`}>
                <Mail size={16} /> {profile.email}
              </a>
              <button onClick={() => setIsResumeOpen(true)}>
                <FileText size={16} /> Resume PDF
              </button>
              <a href={profile.github} target="_blank" rel="noreferrer">
                <GithubIcon size={16} /> GitHub (@Anasarfeen123)
              </a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer">
                <LinkedinIcon size={16} /> LinkedIn
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* Scroll Cue Indicator */}
      <div className="scroll-cue" aria-hidden="true">
        <ArrowDown size={13} /> Scroll to explore
      </div>
    </main>
  );
}

function BootSequence({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-[#f8f1e5] text-[#1a1410] pointer-events-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 0.8, duration: 0.4, ease: "easeInOut" }}
      aria-hidden="true"
    >
      <div className="w-[min(580px,88vw)] p-6 text-center sm:text-left">
        <motion.div
          className="mb-3 h-px bg-[var(--accent)]"
          initial={{ scaleX: 0, transformOrigin: "left" }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
        <motion.p
          className="font-mono text-xs uppercase tracking-wider text-[var(--accent)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          ANAS_ARFEEN // PORTFOLIO
        </motion.p>
        <motion.div
          className="mt-2 text-4xl font-bold tracking-tight text-[#0f0b08] sm:text-6xl"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {profile.name}
        </motion.div>
      </div>
    </motion.div>
  );
}

function ProjectCard({
  project,
  index,
  onOpenDetails,
}: {
  project: Project;
  index: number;
  onOpenDetails: (project: Project) => void;
}) {
  const ghStats = useGitHubRepo(project.repoName);

  return (
    <article
      onClick={() => onOpenDetails(project)}
      className="project-scene cursor-pointer group transition-all hover:border-[var(--accent)] hover:shadow-lg"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="project-index">PROJECT // 0{index + 1}</div>
        
        {!ghStats.loading && (
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--muted)]">
            {ghStats.language && (
              <span className="rounded bg-[var(--background)] px-2 py-0.5 font-semibold text-[var(--accent)] text-[11px]">
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

      <h3 className="project-title group-hover:text-[var(--accent)] transition-colors">{project.title}</h3>

      {/* Image Thumbnail (if available) */}
      {project.image ? (
        <div className="overflow-hidden rounded-lg border border-[var(--line)] max-h-[140px] bg-[#02040a]">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : null}

      <p className="text-xs text-[var(--foreground)] font-medium line-clamp-2">{project.signal}</p>

      <div className="tech-strip">
        {project.technologies.slice(0, 4).map((tech) => (
          <span className="module-pill" key={tech}>
            {tech}
          </span>
        ))}
        {project.technologies.length > 4 && (
          <span className="module-pill opacity-75">+{project.technologies.length - 4}</span>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 text-xs font-mono font-semibold">
        <span className="text-[var(--accent)] inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          View Full Details <ArrowRight size={12} />
        </span>

        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--muted)] hover:text-[var(--heading)]"
              title="GitHub Repo"
            >
              <GithubIcon size={14} />
            </a>
          )}
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--signal)] hover:underline"
              title="Live Demo"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
