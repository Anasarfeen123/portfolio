"use client";

import Link from "next/link";
import { Code2, Lightbulb, Moon, ScrollText, Sun } from "lucide-react";
import { profile } from "@/data/portfolio";
import { GithubIcon } from "@/components/GithubIcon";
import { useTheme } from "@/hooks/useTheme";

interface SiteHeaderProps {
  active: "projects" | "blog" | "til";
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
        <Link href="/projects" className={`hud-link ${active === "projects" ? "hud-link-active" : ""}`}>
          <Code2 size={13} /> Projects
        </Link>
        <Link href="/blog" className={`hud-link ${active === "blog" ? "hud-link-active" : ""}`}>
          <ScrollText size={13} /> Blog
        </Link>
        <Link href="/til" className={`hud-link ${active === "til" ? "hud-link-active" : ""}`}>
          <Lightbulb size={13} /> TIL
        </Link>
        <button onClick={toggleTheme} className="hud-link hud-button" title="Toggle Light / Dark Theme">
          {theme === "light" ? <Moon size={13} /> : <Sun size={13} className="text-amber-400" />}
        </button>
        <a className="hud-link hud-hide-mobile" href={profile.github} target="_blank" rel="noreferrer">
          <GithubIcon size={13} /> GitHub
        </a>
      </nav>
    </header>
  );
}
