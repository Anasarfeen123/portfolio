"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, BrainCircuit, Check, Clock, Code2, FileText, Layers, Lightbulb, Mail, Moon, Network, ScrollText, Send, Sun, Terminal, TerminalSquare, Volume2, VolumeX, Wrench } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { BuildInfo } from "@/data/build-info";
import { experience, journey, profile, projects, skillClusters, type Project } from "@/data/portfolio";
import { AiSidebar } from "@/components/AiSidebar";
import { BuildBadge } from "@/components/BuildBadge";
import { ContributionGraph } from "@/components/ContributionGraph";
import { GithubIcon } from "@/components/GithubIcon";
import { GitHubActivityFeed } from "@/components/GitHubActivityFeed";
import { HudMobileMenu } from "@/components/HudMobileMenu";
import { ParallaxAvatar } from "@/components/ParallaxAvatar";
import { ProjectDetailsModal } from "@/components/ProjectDetailsModal";
import { ResumeModal } from "@/components/ResumeModal";
import { TerminalModal } from "@/components/TerminalModal";
import { useTheme } from "@/hooks/useTheme";
import { playChimeSound, playClickSound, setSoundEnabled } from "@/lib/audio";

// Real WebGL — same reasoning as SceneCanvas: Three.js touches browser
// globals at module-load time, not just render time, so it needs to stay
// out of the server bundle entirely rather than relying on an internal
// capability check alone.
const ProjectSphere = dynamic(() => import("@/components/ProjectSphere").then((m) => m.ProjectSphere), {
  ssr: false,
  loading: () => <div className="project-sphere-canvas project-sphere-loading" aria-hidden="true" />,
});

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

/** Keyed by skillClusters' own `label` (src/data/portfolio.ts) rather than
 * an index/position — a category's icon should stay attached to what it
 * actually is if the clusters ever get reordered. Falls back to Wrench
 * (the "general tooling" icon) for a label this map hasn't been taught
 * yet, so a new cluster degrades to "unlabeled but present" instead of
 * crashing the skills card. */
function clusterIcon(label: string) {
  const iconMap: Record<string, typeof BrainCircuit> = {
    "AI, LLM Agents & Vision": BrainCircuit,
    "Full-Stack Platforms": Layers,
    "Systems & Terminal UIs": TerminalSquare,
    "Environment & Tooling": Wrench,
  };
  const Icon = iconMap[label] ?? Wrench;
  return <Icon size={14} className="text-[var(--accent)]" />;
}

/** A small pulsing dot marking an entry as currently ongoing — attached
 * next to any year/time string containing "Present" (both the journey
 * timeline and the leadership log use the same "20XX -- Present" shape in
 * their data, see journey/experience in src/data/portfolio.ts), rather
 * than a one-off "current role" flag some entries would have and others
 * wouldn't. Genuinely informational, not just decorative — it's the one
 * piece of the timeline that's still moving. */
function LiveDot() {
  return <span className="live-dot" aria-hidden="true" />;
}

const SceneCanvas = dynamic(() => import("@/components/SceneCanvas").then((mod) => mod.SceneCanvas), {
  ssr: false,
  loading: () => <div className="scene-canvas" />,
});

interface ScrollExperienceProps {
  buildInfo?: BuildInfo | null;
}

export function ScrollExperience({ buildInfo = null }: ScrollExperienceProps) {
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
    // Long enough for the terminal boot log below to finish typing itself
    // out (~1.4s in) plus a short beat to actually read "ready" before the
    // panel exits — reduced motion skips the typewriter/scramble entirely,
    // so it only needs a brief beat to read as intentional, not a flash.
    const timeout = window.setTimeout(() => setBooting(false), prefersReducedMotion ? 250 : 1650);
    return () => window.clearTimeout(timeout);
  }, [prefersReducedMotion]);

  const toggleTheme = (origin?: { x: number; y: number }) => {
    playClickSound();
    toggleThemeRaw(origin);
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

    // Plain native scroll drives everything here — no Lenis. Lenis's own docs
    // say it doesn't support CSS scroll-snap without a separate plugin
    // (lenis/snap), and this page relies on native scroll-snap-type for the
    // one-card-at-a-time feel. Running Lenis's lerped scroll simulation on
    // top of that was two systems fighting over the same scroll position —
    // especially rough on touch, where it stepped on native momentum
    // scrolling. ScrollTrigger doesn't need Lenis either; it tracks native
    // window scroll on its own, which is all the progress rail needs.
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
    };
  }, [prefersReducedMotion]);

  // Desktop/trackpad "magnetic" section paging — one wheel gesture decisively
  // pulls you to the next/previous section instead of free-scrolling until
  // you happen to land near a snap point. Deliberately scoped to
  // `pointer: fine` (mouse/trackpad) only: touch runs on its own native
  // scroll-snap (see globals.css's `proximity` override under
  // `@media (pointer: coarse)`) precisely because a JS scroll layer fighting
  // native touch scrolling is the exact bug this site already had once this
  // session (Lenis vs. CSS scroll-snap) — not reopening that on purpose.
  // Skipped entirely under prefers-reduced-motion, same as everything else
  // scroll-driven on this page.
  useEffect(() => {
    if (prefersReducedMotion) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let isAnimating = false;
    let rafId: number | null = null;
    // A single small wheel tick (a light trackpad graze, one notch of a
    // mouse wheel) used to be enough to fire a full section jump on its
    // own — there was no way to nudge-scroll a card into view without
    // instantly being carried past it. These two make a jump require a
    // *decisive* gesture instead: deltaY keeps accumulating across
    // consecutive wheel events (so a real flick still fires promptly) but
    // resets — both on an idle pause and on the gesture reversing
    // direction — so a few small looks-at-the-card nudges never silently
    // sum into an unintended jump later.
    let wheelAccum = 0;
    let wheelIdleTimer: ReturnType<typeof setTimeout> | null = null;
    const WHEEL_JUMP_THRESHOLD = 60;
    const WHEEL_IDLE_RESET_MS = 250;

    const getSections = () => Array.from(document.querySelectorAll<HTMLElement>(".chapter-section"));

    // Sections can be taller than the viewport (a long section's card grows
    // past 100vh — see the min-height-only rule in globals.css), so "closest
    // to the top edge" isn't reliable: deep inside a tall section, its own
    // top can be further from 0 than the *next* section's top, which would
    // misidentify "current" as one section ahead. Instead: the current
    // section is the last one we've actually scrolled into — walk forward
    // while a section's top has crossed the midline, stop at the first one
    // that hasn't.
    const getCurrentIndex = (sections: HTMLElement[]) => {
      const threshold = window.innerHeight * 0.5;
      let current = 0;
      for (let i = 0; i < sections.length; i++) {
        if (sections[i].getBoundingClientRect().top <= threshold) {
          current = i;
        } else {
          break;
        }
      }
      return current;
    };

    // Strong ease-out, no overshoot — decisive and weighted without risking
    // a bounce-back on a full viewport-height scroll (an overshoot that's
    // pleasant on a small UI element can read as nauseating at this scale).
    const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);

    const animateScrollTo = (targetY: number, duration: number, onDone: () => void) => {
      const startY = window.scrollY;
      const distance = targetY - startY;
      const startTime = performance.now();

      // behavior: "instant" on every frame is deliberate, not redundant —
      // html has CSS scroll-behavior: smooth (globals.css), which by spec
      // also applies to plain scrollTo() calls unless a call explicitly
      // overrides it. Without this, the browser would smooth each of these
      // per-frame jumps on top of the easing curve already driving them,
      // doubling up into a mushy, imprecise result instead of the exact,
      // decisive motion this is for.
      const step = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        window.scrollTo({ top: startY + distance * easeOutQuint(t), behavior: "instant" });
        if (t < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          window.scrollTo({ top: targetY, behavior: "instant" });
          rafId = null;
          onDone();
        }
      };
      rafId = requestAnimationFrame(step);
    };

    const handleWheel = (e: WheelEvent) => {
      // Ignore mostly-horizontal gestures (shift+wheel, trackpad side-swipe)
      // — this page never scrolls sideways, no reason to hijack those.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (Math.abs(e.deltaY) < 2) return;

      e.preventDefault();
      if (isAnimating) return; // swallow the rest of a trackpad flick's burst of events

      if (wheelIdleTimer) clearTimeout(wheelIdleTimer);
      // A reversal mid-gesture means "actually, the other way" — starting
      // the accumulator over on direction change instead of letting the two
      // deltas partially cancel out.
      if (wheelAccum !== 0 && Math.sign(e.deltaY) !== Math.sign(wheelAccum)) {
        wheelAccum = 0;
      }
      wheelAccum += e.deltaY;
      wheelIdleTimer = setTimeout(() => {
        wheelAccum = 0;
      }, WHEEL_IDLE_RESET_MS);

      if (Math.abs(wheelAccum) < WHEEL_JUMP_THRESHOLD) return; // not decisive enough yet — let them keep looking

      const sections = getSections();
      if (sections.length === 0) return;

      const currentIndex = getCurrentIndex(sections);
      const direction = wheelAccum > 0 ? 1 : -1;
      wheelAccum = 0;
      if (wheelIdleTimer) {
        clearTimeout(wheelIdleTimer);
        wheelIdleTimer = null;
      }
      const targetIndex = Math.min(sections.length - 1, Math.max(0, currentIndex + direction));
      if (targetIndex === currentIndex) return; // already at the top/bottom boundary

      isAnimating = true;
      animateScrollTo(sections[targetIndex].offsetTop, 650, () => {
        isAnimating = false;
      });
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (wheelIdleTimer) clearTimeout(wheelIdleTimer);
    };
  }, [prefersReducedMotion]);

  return (
    <main ref={rootRef} className="journey">
      {/* Fixed 3D WebGL Canvas Stage */}
      <div className="stage" aria-hidden="true">
        <SceneCanvas />
      </div>

      {/* Fast Boot Overlay */}
      <AnimatePresence>{booting && <BootSequence key="boot" reducedMotion={!!prefersReducedMotion} />}</AnimatePresence>

      {/* Animated Toast System Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 left-1/2 z-50 flex items-center gap-2 -translate-x-1/2 rounded-lg border border-[var(--accent)] bg-[#0c1017] px-5 py-2.5 font-mono text-xs font-semibold text-white shadow-2xl backdrop-blur-sm"
          >
            <Check size={14} className="text-[var(--accent)]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Assistant — floating trigger + slide-in chat, grounded on this
          site's own portfolio data (see AiSidebar.tsx). Self-contained
          (owns its own open/message state) unlike Terminal/Resume below,
          which need to be triggered from several places across the page —
          nothing else on this page needs to open or react to this one. */}
      <AiSidebar />

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
        <div className="hud-mark-group">
          <a className="hud-mark" href="#top" aria-label="Anas Arfeen portfolio home">
            <span className="hud-status-dot" />
            Anas Arfeen
          </a>
          <BuildBadge buildInfo={buildInfo} />
        </div>
        <nav className="hud-actions" aria-label="Primary links">
          <button
            onClick={toggleSound}
            className="hud-link hud-button hud-hide-mobile"
            title={soundOn ? "Mute Web Audio" : "Enable Web Audio SFX"}
          >
            {soundOn ? <Volume2 size={13} className="text-[var(--accent)]" /> : <VolumeX size={13} />}
          </button>

          <button
            onClick={() => {
              playClickSound();
              setIsTerminalOpen(true);
            }}
            className="hud-link hud-button hud-hide-mobile"
            title="Open Developer Shell (Cmd + K)"
          >
            <Terminal size={13} className="text-[var(--accent)]" />
            <span>CLI</span>
          </button>

          <button
            onClick={(e) => toggleTheme({ x: e.clientX, y: e.clientY })}
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
          <Link className="hud-link hud-hide-mobile" href="/til" onClick={() => playClickSound()}>
            <Lightbulb size={13} /> TIL
          </Link>
          <Link className="hud-link hud-hide-mobile" href="/changelog" onClick={() => playClickSound()}>
            <Clock size={13} /> Changelog
          </Link>
          <button
            onClick={() => {
              playClickSound();
              setIsResumeOpen(true);
            }}
            className="hud-link hud-button hud-hide-mobile"
          >
            <FileText size={13} /> Resume
          </button>
          <a className="hud-link hud-hide-mobile" href={profile.github} target="_blank" rel="noreferrer">
            <GithubIcon size={13} /> GitHub
          </a>
          <HudMobileMenu
            items={[
              {
                key: "sound",
                label: soundOn ? "Mute Sound" : "Enable Sound",
                icon: soundOn ? <Volume2 size={15} className="text-[var(--accent)]" /> : <VolumeX size={15} />,
                onClick: toggleSound,
              },
              {
                key: "cli",
                label: "Developer Shell",
                icon: <Terminal size={15} className="text-[var(--accent)]" />,
                onClick: () => {
                  playClickSound();
                  setIsTerminalOpen(true);
                },
              },
              { key: "skills", label: "Skills", href: "#skills", icon: <Network size={15} /> },
              { key: "projects", label: "Projects", href: "/projects", icon: <Code2 size={15} />, onClick: () => playClickSound() },
              { key: "blog", label: "Blog", href: "/blog", icon: <ScrollText size={15} />, onClick: () => playClickSound() },
              { key: "til", label: "TIL", href: "/til", icon: <Lightbulb size={15} />, onClick: () => playClickSound() },
              { key: "changelog", label: "Changelog", href: "/changelog", icon: <Clock size={15} />, onClick: () => playClickSound() },
              {
                key: "resume",
                label: "Resume",
                icon: <FileText size={15} />,
                onClick: () => {
                  playClickSound();
                  setIsResumeOpen(true);
                },
              },
              { key: "github", label: "GitHub", href: profile.github, external: true, icon: <GithubIcon size={15} /> },
            ]}
          />
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
              {/* Profile Avatar Photo - Hero Scaled, layered cursor parallax + dynamic shadow */}
              <ParallaxAvatar
                src={profile.avatar}
                bgSrc={profile.avatar === "/Profile.jpg" ? "/Profile-bg.jpg" : undefined}
                fgSrc={profile.avatar === "/Profile.jpg" ? "/Profile-fg.png" : undefined}
                alt={profile.name}
              />

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
                  <div className="node-year">
                    {item.year}
                    {item.year.includes("Present") && <LiveDot />}
                  </div>
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
                  <div className="cluster-name flex items-center gap-1.5">
                    {clusterIcon(cluster.label)}
                    {cluster.label}
                  </div>
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
            <h2 className="chapter-title">Things I&apos;ve built.</h2>
            <p className="chapter-copy">Every project in the archive, wrapped into a draggable card shell.</p>

            {/* All projects distributed on a real 3D sphere */}
            <div className="mt-4">
              <ProjectSphere
                projects={projects}
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
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-lg border border-[var(--line-strong)] px-6 py-3 font-mono text-xs font-bold text-[var(--heading)] hover:border-[var(--accent)] hover:text-[var(--accent)] active:scale-95 transition-all cursor-pointer"
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
                <div className="log-row" key={item.id}>
                  <div className="log-time">
                    {item.time}
                    {item.time.includes("Present") && <LiveDot />}
                  </div>
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

        {/* Section 6: GitHub activity (Right) — split out of the old
            "experience" card, which used to carry the leadership log *and*
            the activity feed *and* the contribution graph all in one
            oversized card, well past what a single viewport-height section
            like every one of its siblings actually fits. Same content,
            just given its own properly-sized section instead of being
            stacked onto the bottom of an unrelated one. */}
        <section className="chapter-section is-right" id="activity">
          <motion.div
            {...reveal}
            style={{ transformStyle: "preserve-3d" }}
            className="chapter-card"
          >
            <div className="kicker">Open Source</div>
            <h2 className="chapter-title">Building in public.</h2>
            <p className="chapter-copy">What that leadership/mentorship time looks like in commits, not just titles.</p>

            <GitHubActivityFeed />
            <ContributionGraph />
          </motion.div>
        </section>

        {/* Section 7: Contact Form (Left) */}
        <section className="chapter-section is-left" id="contact">
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
                  className="hud-input w-full rounded-xl border border-[var(--line)] bg-[var(--background)] px-4 py-2.5 text-xs text-[var(--heading)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--accent)] transition-all font-mono"
                />
              </div>
              <div>
                <textarea
                  required
                  rows={3}
                  placeholder="What's up?"
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  className="hud-input w-full rounded-xl border border-[var(--line)] bg-[var(--background)] px-4 py-2.5 text-xs text-[var(--heading)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--accent)] transition-all font-mono resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={contactStatus === "sending"}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-5 py-2.5 font-mono text-xs font-semibold text-white shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
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

const SCRAMBLE_CHARS = "!<>-_\\/[]{}—=+*^?#01";
const BOOT_LOG = "$ boot anasarfeen.dev\n  scene       [ok]\n  data        [ok]\n  assistant   [ok]\n$ ready";

/** Decodes into `text` from scrambled characters, left to right — a small
 * nod to the terminal/hacker-shell identity established elsewhere on the
 * site (ANAS_OS, the CLI easter egg) rather than a generic fade-in. */
function ScrambleText({ text, startDelay, reducedMotion, className }: { text: string; startDelay: number; reducedMotion: boolean; className?: string }) {
  const [display, setDisplay] = useState(reducedMotion ? text : "");

  useEffect(() => {
    // Reduced motion already gets the resolved `text` from the initial
    // useState above — nothing to synchronize here, so just skip the
    // scramble timers rather than re-setting state the render already has.
    if (reducedMotion) return;
    const frames = 14;
    let frame = 0;
    let interval: number | undefined;
    const startTimer = window.setTimeout(() => {
      interval = window.setInterval(() => {
        frame++;
        const revealed = Math.floor((frame / frames) * text.length);
        setDisplay(
          text
            .split("")
            .map((ch, i) => (ch === " " || i < revealed ? ch : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]))
            .join(""),
        );
        if (frame >= frames) {
          setDisplay(text);
          if (interval) window.clearInterval(interval);
        }
      }, 32);
    }, startDelay);
    return () => {
      window.clearTimeout(startTimer);
      if (interval) window.clearInterval(interval);
    };
  }, [text, startDelay, reducedMotion]);

  return <span className={className}>{display}</span>;
}

/** Types `text` out character by character, like a real shell running a
 * script — used for the boot log instead of a checklist-with-checkmarks,
 * which reads as generic dashboard chrome rather than an actual terminal. */
function TypedLines({ text, startDelay, reducedMotion }: { text: string; startDelay: number; reducedMotion: boolean }) {
  const [count, setCount] = useState(reducedMotion ? text.length : 0);
  const done = count >= text.length;

  useEffect(() => {
    if (reducedMotion) return;
    let i = 0;
    let interval: number | undefined;
    const startTimer = window.setTimeout(() => {
      interval = window.setInterval(() => {
        i++;
        setCount(i);
        if (i >= text.length && interval) window.clearInterval(interval);
      }, 9);
    }, startDelay);
    return () => {
      window.clearTimeout(startTimer);
      if (interval) window.clearInterval(interval);
    };
  }, [text, startDelay, reducedMotion]);

  return (
    <pre className="whitespace-pre-wrap font-mono text-[11px] sm:text-xs leading-relaxed text-[var(--foreground)]">
      {text.slice(0, count)}
      {/* Solid (non-blinking) while actively "typing" — like a real terminal
          cursor mid-input — then starts blinking once the line is done. */}
      <span className={`text-[var(--accent)]${done ? " boot-caret" : ""}`} aria-hidden="true">
        ▍
      </span>
    </pre>
  );
}

/** Fills left-to-right via requestAnimationFrame rather than a discrete
 * step-per-item, so it reads as one continuous process completing — an
 * ASCII bracket-and-block bar to match the terminal log above it, instead
 * of a rounded gradient pill that could belong to any generic loading UI. */
function AsciiProgress({ durationMs, reducedMotion }: { durationMs: number; reducedMotion: boolean }) {
  const totalBlocks = 28;
  const [filled, setFilled] = useState(reducedMotion ? totalBlocks : 0);

  useEffect(() => {
    if (reducedMotion) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      setFilled(Math.round(progress * totalBlocks));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [durationMs, reducedMotion]);

  const pct = Math.round((filled / totalBlocks) * 100);
  return (
    <div className="mt-5 flex items-center gap-2 font-mono text-[11px] sm:text-xs text-[var(--accent)]">
      <span aria-hidden="true">
        [{"█".repeat(filled)}
        <span className="text-[var(--line-strong)]">{"░".repeat(totalBlocks - filled)}</span>]
      </span>
      <span className="w-9 shrink-0 text-right tabular-nums text-[var(--muted)]">{pct}%</span>
    </div>
  );
}

function BootSequence({ reducedMotion }: { reducedMotion: boolean }) {
  const bootDuration = reducedMotion ? 200 : 1500;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] pointer-events-none p-4 select-none"
      initial={{ opacity: reducedMotion ? 1 : 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0.15 : 0.4, ease: "easeInOut" }}
      aria-hidden="true"
    >
      {/* Faint scanline texture, matching the terminal/dev-shell aesthetic used elsewhere on the site */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, var(--foreground) 0px, var(--foreground) 1px, transparent 1px, transparent 3px)",
        }}
      />

      <motion.div
        className="relative w-[min(460px,90vw)] overflow-hidden rounded-2xl border border-[var(--line-strong)] bg-[var(--card-bg)] shadow-2xl backdrop-blur-md"
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: reducedMotion ? 0.15 : 0.4, ease: "easeOut" }}
      >
        {/* A slow light sweep across the chrome, like a device actually powering on */}
        {!reducedMotion && (
          <motion.div
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-[var(--accent)]/10 to-transparent"
            initial={{ x: "-120%" }}
            animate={{ x: "420%" }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
          />
        )}

        {/* Terminal chrome, matching the developer-shell header elsewhere on the site */}
        <div className="relative flex items-center gap-1.5 border-b border-[var(--line)] bg-[var(--card-hover)] px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          <span className="ml-2 font-mono text-[10px] tracking-wider text-[var(--muted)]">ANAS_OS // BOOT</span>
        </div>

        <div className="p-6 sm:p-8">
          <div className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--heading)]">
            <ScrambleText text="Anas" startDelay={reducedMotion ? 0 : 60} reducedMotion={reducedMotion} />{" "}
            <ScrambleText text="Arfeen" startDelay={reducedMotion ? 0 : 160} reducedMotion={reducedMotion} className="text-[var(--signal)]" />
          </div>

          <motion.p
            className="mt-2 font-mono text-xs sm:text-sm text-[var(--muted)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reducedMotion ? 0 : 0.4, duration: 0.3 }}
          >
            Robots, models, and a bit too much time in the terminal.
          </motion.p>

          <div className="mt-5 rounded-lg border border-[var(--line)] bg-[var(--background)]/60 px-3 py-2.5">
            <TypedLines text={BOOT_LOG} startDelay={reducedMotion ? 0 : 620} reducedMotion={reducedMotion} />
          </div>

          <AsciiProgress durationMs={bootDuration} reducedMotion={reducedMotion} />
        </div>
      </motion.div>
    </motion.div>
  );
}
