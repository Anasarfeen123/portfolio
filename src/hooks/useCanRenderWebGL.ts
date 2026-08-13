"use client";

import { useEffect, useState } from "react";

/** Feature-detects WebGL support + `prefers-reduced-motion`, deferred one
 * animation frame so it never blocks first paint. Returns `null` while still
 * checking, then `true`/`false`. Extracted from SceneCanvas.tsx's original
 * inline check — both it and ArchitectureDiagram.tsx use the same logic, so
 * it lives in one place instead of two. A visitor with WebGL disabled or
 * `prefers-reduced-motion` set gets the same "no 3D" outcome either way:
 * plain content, no error, no broken canvas. */
export function useCanRenderWebGL(): boolean | null {
  const [canRender, setCanRender] = useState<boolean | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setCanRender(Boolean(context) && !reducedMotion);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return canRender;
}
