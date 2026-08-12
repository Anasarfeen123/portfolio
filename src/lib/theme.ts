export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "anas-portfolio-theme";

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return (document.documentElement.getAttribute("data-theme") as Theme) || "dark";
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // localStorage unavailable (private mode, etc.) — theme still applies for this session.
  }
}

/** Inlined into <head> so the correct theme is set before first paint, on every route. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`;
