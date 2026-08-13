"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { BuildInfo } from "@/data/build-info";

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface BuildBadgeProps {
  buildInfo: BuildInfo | null;
  /** "hud" (default): small, muted, trails the logo, hidden on mobile.
   * "page": a bigger, standalone status line — used once, at the top of
   * /changelog, right above the history it's summarizing. */
  variant?: "hud" | "page";
}

/** The relative-time string is computed client-side, after mount, on
 * purpose: this data is baked into a static page at build time, so "Xh ago"
 * measured against the actual current clock (not the build's clock) is the
 * only way it stays accurate for a visitor loading the page days after the
 * last deploy. Rendering nothing until mounted avoids a server/client
 * mismatch warning, since server-render time and hydration time are never
 * the same instant. */
export function BuildBadge({ buildInfo, variant = "hud" }: BuildBadgeProps) {
  const [relative, setRelative] = useState<string | null>(null);

  useEffect(() => {
    if (!buildInfo) return;
    setRelative(formatRelativeTime(buildInfo.date));
  }, [buildInfo]);

  if (!buildInfo || !relative) return null;

  if (variant === "page") {
    return (
      <a
        href={`https://github.com/Anasarfeen123/portfolio/commit/${buildInfo.hash}`}
        target="_blank"
        rel="noreferrer"
        className="build-badge-page"
        title={`Commit ${buildInfo.hash}`}
      >
        <span className="build-badge-page-dot" />
        Currently live: <strong>{buildInfo.shortHash}</strong>, deployed {relative}
      </a>
    );
  }

  return (
    <Link href="/changelog" className="hud-build-badge hud-hide-mobile" title={`Commit ${buildInfo.hash}`}>
      {buildInfo.shortHash} · deployed {relative}
    </Link>
  );
}
