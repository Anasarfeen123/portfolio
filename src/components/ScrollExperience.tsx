"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, Check, Code2, FileText, Mail, Moon, Network, ScrollText, Send, Sun, Terminal, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { experience, journey, profile, projects, skillClusters, type Project } from "@/data/portfolio";
import { GithubIcon } from "@/components/GithubIcon";
import { ProjectDetailsModal } from "@/components/ProjectDetailsModal";
import { ResumeModal } from "@/components/ResumeModal";
import { Revolving3DCarousel } from "@/components/Revolving3DCarousel";
import { TerminalModal } from "@/components/TerminalModal";
import { useTheme } from "@/hooks/useTheme";
import { playChimeSound, playClickSound, setSoundEnabled } from "@/lib/audio";

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

// Featured Projects for the homepage 3D carousel — see `featured: true` in data/portfolio.ts
const featuredProjects = projects.filter((p) => p.featured);

export function ScrollExperience() {
  const rootRef = useRef<HTMLElement | null>(null);
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  // Section reveal animation — skips the 3D tilt/scale entrance and just fades in
  // for anyone with prefers-reduced-motion set.
  const reveal = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        whileInView: { opacity: 1 },
        viewport: { once: true },
        transition: { duration: 0.2 },
      }
    : {
        initial: { opacity: 0, y: 80, scale: 0.92, rotateX: 7 },
        whileInView: { opacity: 1, y: 0, scale: 1, rotateX: 0 },
        viewport: { once: false, amount: 0.15 },
        transition: { duration: 0.75, ease: [0.215, 0.61, 0.355, 1] as const },
      };
  const [booting, setBooting] = useState(true);
  const [theme, toggleThemeRaw] = useTheme();
  const [soundOn, setSoundOn] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Contact Form State
  const [contactEmail, setContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setBooting(false), 1200);
    return () => window.clearTimeout(timeout);
  }, []);

  const toggleTheme = () => {
    playClickSound();
    toggleThemeRaw();
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playChimeSound();
  };

  const triggerToast = (msg: string) => {
    playChimeSound();
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactMsg || contactStatus === "sending") return;

    setContactStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: contactEmail, message: contactMsg }),
      });

      if (!res.ok) throw new Error("send failed");

      setContactStatus("sent");
      triggerToast(`Message sent — I'll get back to you at ${contactEmail}.`);
      setContactEmail("");
      setContactMsg("");
    } catch {
      setContactStatus("error");
      triggerToast(`Couldn't send that — email me directly at ${profile.email} instead.`);
    }
  };

  const handleSkillClick = (moduleName: string) => {
    playClickSound();
    router.push(`/projects?tech=${encodeURIComponent(moduleName)}`);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        playClickSound();
        setIsTerminalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!rootRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    // Skip Lenis's smoothed/lerped scroll entirely for reduced-motion — native
    // instant scroll instead. The progress rail still works via ScrollTrigger.
    const lenis = prefersReducedMotion
      ? null
      : new Lenis({
          duration: 0.8,
          lerp: 0.1,
          smoothWheel: true,
        });

    lenis?.on("scroll", ScrollTrigger.update);

    const updateLenis = (time: number) => {
      lenis?.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: prefersReducedMotion ? false : 0.5,
        onUpdate: (self) => {
          document.documentElement.style.setProperty("--stage-progress", self.progress.toFixed(4));
        },
      });
    }, rootRef);

    return () => {
      ctx.revert();
      gsap.ticker.remove(updateLenis);
      lenis?.destroy();
    };
  }, [prefersReducedMotion]);

  return (
    <main ref={rootRef} className="journey">
      {/* Fixed 3D WebGL Canvas Stage */}
      <div className="stage" aria-hidden="true">
        <SceneCanvas />
      </div>

      {/* Fast Boot Overlay */}
      <BootSequence visible={booting} />

      {/* Animated Toast System Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 left-1/2 z-50 flex items-center gap-2 -translate-x-1/2 rounded-full border border-[var(--accent)] bg-[#0c1017] px-5 py-2.5 font-mono text-xs font-semibold text-white shadow-2xl backdrop-blur-md"
          >
            <Check size={14} className="text-[var(--accent)]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terminal Easter Egg Modal */}
      <TerminalModal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        onToggleTheme={toggleTheme}
        onOpenResume={() => setIsResumeOpen(true)}
        onNavigate={(path) => {
          setIsTerminalOpen(false);
          router.push(path);
        }}
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
          Anas Arfeen
        </a>
        <nav className="hud-actions" aria-label="Primary links">
          <button
            onClick={toggleSound}
            className="hud-link hud-button"
            title={soundOn ? "Mute Web Audio" : "Enable Web Audio SFX"}
          >
            {soundOn ? <Volume2 size={13} className="text-[var(--accent)]" /> : <VolumeX size={13} />}
          </button>

          <button
            onClick={() => {
              playClickSound();
              setIsTerminalOpen(true);
            }}
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
          <Link className="hud-link hud-hide-mobile" href="/projects" onClick={() => playClickSound()}>
            <Code2 size={13} /> Projects
          </Link>
          <Link className="hud-link hud-hide-mobile" href="/blog" onClick={() => playClickSound()}>
            <ScrollText size={13} /> Blog
          </Link>
          <button
            onClick={() => {
              playClickSound();
              setIsResumeOpen(true);
            }}
            className="hud-link hud-button"
          >
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
          <motion.div
            {...reveal}
            style={{ transformStyle: "preserve-3d" }}
            className="chapter-card"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Profile Avatar Photo - Hero Scaled */}
              <div className="relative shrink-0 mx-auto md:mx-0">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="h-32 w-32 sm:h-44 sm:w-44 md:h-52 md:w-52 rounded-2xl border-2 border-[var(--accent)] object-cover shadow-xl"
                />
                <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[var(--background)] bg-[var(--accent)]" />
              </div>

              <div className="flex-1">
                <div className="kicker">AI Engineer & Systems Developer</div>
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
                  <div className="stat-badge-label">{h.label}</div>
                  <div className="stat-badge-value">{h.value}</div>
                </div>
              ))}
            </div>

            <div className="contact-vector mt-4">
              <a href={`mailto:${profile.email}`}>
                <Mail size={15} /> Contact Me
              </a>
              <button
                onClick={() => {
                  playClickSound();
                  setIsResumeOpen(true);
                }}
              >
                <FileText size={15} /> View Resume PDF
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  setIsTerminalOpen(true);
                }}
              >
                <Terminal size={15} /> Open Terminal (⌘K)
              </button>
            </div>
          </motion.div>
        </section>

        {/* Section 2: Origin & Education (Right) */}
        <section className="chapter-section is-right" id="origin">
          <motion.div
            {...reveal}
            style={{ transformStyle: "preserve-3d" }}
            className="chapter-card"
          >
            <div className="kicker">Background</div>
            <h2 className="chapter-title">How I got here.</h2>
            <p className="chapter-copy">
              {profile.education}. Started with Linux and the C++/DSA basics, then drifted into reinforcement learning and the AI/ML club scene — that&apos;s the short version of the timeline below.
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
          </motion.div>
        </section>

        {/* Section 3: Skill Ecosystem (Left) */}
        <section className="chapter-section is-left" id="skills">
          <motion.div
            {...reveal}
            style={{ transformStyle: "preserve-3d" }}
            className="chapter-card"
          >
            <div className="kicker">Skills</div>
            <h2 className="chapter-title">What I actually use.</h2>
            <p className="chapter-copy">
              Roughly grouped into ML/RL, full-stack, systems, and general tooling. Click a pill to see which projects used it.
            </p>

            <div className="skill-system">
              {skillClusters.map((cluster) => (
                <div className="skill-cluster-card" key={cluster.label}>
                  <div className="cluster-name">{cluster.label}</div>
                  <div className="cluster-desc">{cluster.description}</div>
                  <div className="cluster-modules">
                    {cluster.modules.map((mod) => (
                      <button
                        key={mod}
                        onClick={() => handleSkillClick(mod)}
                        className="module-pill cursor-pointer transition-all hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      >
                        {mod}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Section 4: Projects Showcase (3D Revolving Cylindrical Carousel) */}
        <section className="chapter-section is-right" id="projects">
          <motion.div
            {...reveal}
            style={{ transformStyle: "preserve-3d" }}
            className="chapter-card"
          >
            <h2 className="chapter-title">A few things I&apos;ve built.</h2>
            <p className="chapter-copy">A handful of the projects I&apos;m most likely to talk your ear off about.</p>

            {/* 3D Revolving Cylindrical Carousel */}
            <div className="mt-4">
              <Revolving3DCarousel
                projects={featuredProjects}
                onOpenDetails={(p) => {
                  playClickSound();
                  setSelectedProject(p);
                }}
              />
            </div>

            <div className="mt-6 text-center border-t border-[var(--line)] pt-6">
              <Link
                href="/projects"
                onClick={() => playClickSound()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full border border-[var(--line-strong)] px-6 py-3 font-mono text-xs font-bold text-[var(--heading)] hover:border-[var(--accent)] hover:text-[var(--accent)] active:scale-95 transition-all cursor-pointer"
              >
                See all {projects.length} projects <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Section 5: Experience & Leadership (Left) */}
        <section className="chapter-section is-left" id="experience">
          <motion.div
            {...reveal}
            style={{ transformStyle: "preserve-3d" }}
            className="chapter-card"
          >
            <div className="kicker">Experience</div>
            <h2 className="chapter-title">Clubs & leadership.</h2>

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
          </motion.div>
        </section>

        {/* Section 6: Contact Form (Right) */}
        <section className="chapter-section is-right" id="contact">
          <motion.div
            {...reveal}
            style={{ transformStyle: "preserve-3d" }}
            className="chapter-card"
          >
            <div className="kicker">Contact</div>
            <h2 className="chapter-title">Get in touch.</h2>
            <p className="chapter-copy">
              Based in Chennai. Happy to talk about a project, a role, or just RL/CV/systems stuff in general.
            </p>

            <form onSubmit={handleContactSubmit} className="mt-4 space-y-3">
              <div>
                <input
                  type="email"
                  required
                  placeholder="you@email.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--background)] px-4 py-2.5 text-xs text-[var(--heading)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--accent)] transition-all font-mono"
                />
              </div>
              <div>
                <textarea
                  required
                  rows={3}
                  placeholder="What's up?"
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--background)] px-4 py-2.5 text-xs text-[var(--heading)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--accent)] transition-all font-mono resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={contactStatus === "sending"}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)] bg-[var(--accent)] px-5 py-2.5 font-mono text-xs font-semibold text-white shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send size={13} /> {contactStatus === "sending" ? "Sending…" : "Send"}
              </button>
              {contactStatus === "error" && (
                <p className="text-xs text-[var(--muted)]">
                  Couldn&apos;t send that — email me directly at{" "}
                  <a href={`mailto:${profile.email}`} className="text-[var(--accent)] underline">
                    {profile.email}
                  </a>{" "}
                  instead.
                </p>
              )}
            </form>

            <div className="contact-vector">
              <a href={`mailto:${profile.email}`}>
                <Mail size={16} /> {profile.email}
              </a>
              <button
                onClick={() => {
                  playClickSound();
                  setIsResumeOpen(true);
                }}
              >
                <FileText size={16} /> Resume PDF
              </button>
              <a href={profile.github} target="_blank" rel="noreferrer">
                <GithubIcon size={16} /> GitHub (@Anasarfeen123)
              </a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer">
                <LinkedinIcon size={16} /> LinkedIn
              </a>
              <Link href="/blog" onClick={() => playClickSound()}>
                <ScrollText size={16} /> Read the Blog
              </Link>
            </div>
          </motion.div>
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] pointer-events-none p-4 select-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 0.9, duration: 0.45, ease: "easeInOut" }}
      aria-hidden="true"
    >
      <div className="w-[min(500px,88vw)] rounded-2xl border border-[var(--line-strong)] bg-[var(--card-bg)] p-6 sm:p-8 backdrop-blur-md shadow-2xl">
        {/* Loading Bar */}
        <motion.div
          className="mb-4 h-[2px] bg-[var(--accent)]"
          initial={{ scaleX: 0, transformOrigin: "left" }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        />

        <motion.div
          className="text-3xl sm:text-5xl font-extrabold text-[var(--heading)] tracking-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          Anas <span className="text-[var(--signal)]">Arfeen</span>
        </motion.div>

        <motion.p
          className="mt-2 text-xs sm:text-sm font-medium text-[var(--muted)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Robots, models, and a bit too much time in the terminal.
        </motion.p>
      </div>
    </motion.div>
  );
}
