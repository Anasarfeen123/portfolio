"use client";

import Link from "next/link";
import { Clock, Code2, Home, Lightbulb, Moon, ScrollText, Sun } from "lucide-react";
import { profile } from "@/data/portfolio";
import { GithubIcon } from "@/components/GithubIcon";
import { HudMobileMenu } from "@/components/HudMobileMenu";
import { useTheme } from "@/hooks/useTheme";

interface SiteHeaderProps {
  active: "projects" | "blog" | "til" | "changelog";
}

/** Persistent header for standalone pages (/projects, /blog, /blog/[slug], /til).
 * The homepage keeps its own richer header (terminal, sound, resume) inline in ScrollExperience,
 * but shares the same .hud visual language and the same Home / Projects / Blog / TIL links. */
export function SiteHeader({ active }: SiteHeaderProps) {
  const [theme, toggleTheme] = useTheme();

  return (
    <header className="hud">
      <Link className="hud-mark" href="/" aria-label="Anas Arfeen portfolio home">
        <span className="hud-status-dot" />
        Anas Arfeen
      </Link>
      <nav className="hud-actions" aria-label="Primary links">
        <Link href="/" className="hud-link hud-hide-mobile">
          Home
        </Link>
        <Link href="/projects" className={`hud-link hud-hide-mobile ${active === "projects" ? "hud-link-active" : ""}`}>
          <Code2 size={13} /> Projects
        </Link>
        <Link href="/blog" className={`hud-link hud-hide-mobile ${active === "blog" ? "hud-link-active" : ""}`}>
          <ScrollText size={13} /> Blog
        </Link>
        <Link href="/til" className={`hud-link hud-hide-mobile ${active === "til" ? "hud-link-active" : ""}`}>
          <Lightbulb size={13} /> TIL
        </Link>
        <Link href="/changelog" className={`hud-link hud-hide-mobile ${active === "changelog" ? "hud-link-active" : ""}`}>
          <Clock size={13} /> Changelog
        </Link>
        <button
          onClick={(e) => toggleTheme({ x: e.clientX, y: e.clientY })}
          className="hud-link hud-button"
          title="Toggle Light / Dark Theme"
        >
          {theme === "light" ? <Moon size={13} /> : <Sun size={13} className="text-amber-400" />}
        </button>
        <a className="hud-link hud-hide-mobile" href={profile.github} target="_blank" rel="noreferrer">
          <GithubIcon size={13} /> GitHub
        </a>
        <HudMobileMenu
          items={[
            { key: "home", label: "Home", href: "/", icon: <Home size={15} /> },
            { key: "projects", label: "Projects", href: "/projects", icon: <Code2 size={15} />, active: active === "projects" },
            { key: "blog", label: "Blog", href: "/blog", icon: <ScrollText size={15} />, active: active === "blog" },
            { key: "til", label: "TIL", href: "/til", icon: <Lightbulb size={15} />, active: active === "til" },
            { key: "changelog", label: "Changelog", href: "/changelog", icon: <Clock size={15} />, active: active === "changelog" },
            { key: "github", label: "GitHub", href: profile.github, external: true, icon: <GithubIcon size={15} /> },
          ]}
        />
      </nav>
    </header>
  );
}
