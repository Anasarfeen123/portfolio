"use client";

import { useCallback, useEffect, useState } from "react";
import { applyTheme, getStoredTheme, type Theme } from "@/lib/theme";

/** Shared theme state — reads/writes the same `data-theme` attribute + localStorage key
 * used everywhere, so the toggle stays in sync across the homepage, /projects, and /blog. */
export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "light" ? "dark" : "light";
      applyTheme(next);
      return next;
    });
  }, []);

  return [theme, toggleTheme];
}
