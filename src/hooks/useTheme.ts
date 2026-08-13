"use client";

import { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { applyTheme, getStoredTheme, type Theme } from "@/lib/theme";

export interface ThemeToggleOrigin {
  x: number;
  y: number;
}

/** Shared theme state — reads/writes the same `data-theme` attribute + localStorage key
 * used everywhere, so the toggle stays in sync across the homepage, /projects, and /blog.
 *
 * `toggleTheme` optionally takes a click origin (clientX/clientY) and, when the browser
 * supports it, drives a circular "wipe" transition via the View Transitions API —
 * expanding outward from wherever the user actually clicked (see the
 * ::view-transition-*(root) rules in globals.css). Falls back to an instant swap when
 * the API is unsupported or the visitor prefers reduced motion; the toggle always works
 * either way, the wipe is pure enhancement. */
export function useTheme(): [Theme, (origin?: ThemeToggleOrigin) => void] {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  const toggleTheme = useCallback((origin?: ThemeToggleOrigin) => {
    const applyNext = () => {
      // flushSync forces the icon's own re-render to land inside the same
      // synchronous window the View Transition snapshots — without it React
      // may defer the state update past the point the transition already
      // captured its "new" frame, and the icon would visibly lag a beat.
      flushSync(() => {
        setTheme((prev) => {
          const next: Theme = prev === "light" ? "dark" : "light";
          applyTheme(next);
          return next;
        });
      });
    };

    const prefersReducedMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const supportsViewTransitions = typeof document !== "undefined" && "startViewTransition" in document;

    if (!supportsViewTransitions || prefersReducedMotion) {
      applyNext();
      return;
    }

    if (origin) {
      document.documentElement.style.setProperty("--theme-toggle-x", `${origin.x}px`);
      document.documentElement.style.setProperty("--theme-toggle-y", `${origin.y}px`);
    }

    document.startViewTransition(applyNext);
  }, []);

  return [theme, toggleTheme];
}
