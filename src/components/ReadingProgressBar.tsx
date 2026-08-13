"use client";

import { useEffect, useState } from "react";

/** Thin fixed bar across the very top of the viewport tracking overall page
 * scroll progress (0 → 1) — the standard "reading progress" convention on
 * long-form posts. rAF-throttled so it doesn't add a state update per raw
 * scroll event, and driven by a CSS transform (not width) so the browser
 * never has to re-layout on scroll, just repaint a GPU-composited layer. */
export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const next = scrollable > 0 ? window.scrollY / scrollable : 0;
      setProgress(Math.min(1, Math.max(0, next)));
      ticking = false;
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div className="reading-progress-track" aria-hidden="true">
      <div className="reading-progress-fill" style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}
