"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
  useReducedMotion,
  useAnimationFrame,
  type MotionValue,
} from "framer-motion";

interface ParallaxAvatarProps {
  /** Full photo, used as-is when no split layers are available (or under reduced motion). */
  src: string;
  /** Softly blurred/dimmed background plate — the "far" layer, pans the least. */
  bgSrc?: string;
  /** Alpha-cutout of the subject only — the "near" layer, pans the most. */
  fgSrc?: string;
  alt: string;
  className?: string;
}

/** Adds two motion values together into one. Kept at module scope (not
 * nested in ParallaxAvatar) since it calls useTransform itself — a proper
 * standalone hook, not a plain helper function. */
function useSum(a: MotionValue<number>, b: MotionValue<number>) {
  return useTransform([a, b], ([av, bv]) => (av as number) + (bv as number));
}

/** True on touch/stylus-primary devices (no real hover, no cursor to track)
 * — the page-wide cursor parallax has nothing meaningful to respond to
 * there, and continuously ticking a spring + rAF loop on every scroll frame
 * is exactly the kind of main-thread cost a touch device can least afford. */
function useCoarsePointer() {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const compute = () => setCoarse(mq.matches);
    compute();
    mq.addEventListener("change", compute);
    return () => mq.removeEventListener("change", compute);
  }, []);
  return coarse;
}

/**
 * Hero profile photo with real depth: the photo is split into a blurred background
 * plate and a sharp foreground cutout of the subject, which drift at different
 * speeds as the cursor moves (page-wide, not just on hover) — plus a whole-card
 * tilt and a soft directional shadow that shifts opposite the cursor, like the
 * subject is a raised layer floating above the backdrop. A slow ambient drift
 * runs underneath the cursor-driven motion at all times, so the effect still
 * has life before anyone's moved the mouse. All of that is cursor-only,
 * though — touch devices get a static (but still colorized-on-tap-adjacent,
 * see the grayscale/hover treatment below) image instead, see useCoarsePointer.
 */
export function ParallaxAvatar({ src, bgSrc, fgSrc, alt, className = "" }: ParallaxAvatarProps) {
  const reduceMotion = useReducedMotion();
  const isCoarsePointer = useCoarsePointer();
  const disableMotion = Boolean(reduceMotion) || isCoarsePointer;
  const layered = Boolean(bgSrc && fgSrc);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 22, stiffness: 140, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Two different periods on x/y trace a loose figure-8 instead of a
  // perfect circle, which reads as organic rather than mechanical.
  const idlePhase = useMotionValue(0);
  useAnimationFrame((t) => {
    if (disableMotion) return;
    idlePhase.set(t / 1000);
  });
  const idleX = useTransform(idlePhase, (t) => Math.sin(t * 0.55) * 5);
  const idleY = useTransform(idlePhase, (t) => Math.sin(t * 0.35) * 4);
  const idleXStrong = useTransform(idleX, (v) => v * 1.1);
  const idleYStrong = useTransform(idleY, (v) => v * 1.1);

  // Whole-card tilt (cursor-driven only — keeping the idle drift out of the
  // tilt itself, and out of the shadow below, keeps the ambient motion
  // subtle rather than making the whole card visibly rock on its own).
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-8, 8]);

  // Inner layers pan at different rates — the core of the depth illusion.
  // Kept fairly tight (rather than a big dramatic swing) specifically so the
  // resting zoom level below can stay close to the photo's real crop.
  const bgXCursor = useTransform(smoothX, [-0.5, 0.5], [-5, 5]);
  const bgYCursor = useTransform(smoothY, [-0.5, 0.5], [-5, 5]);
  const fgXCursor = useTransform(smoothX, [-0.5, 0.5], [-10, 10]);
  const fgYCursor = useTransform(smoothY, [-0.5, 0.5], [-10, 10]);
  const bgX = useSum(bgXCursor, idleX);
  const bgY = useSum(bgYCursor, idleY);
  const fgX = useSum(fgXCursor, idleXStrong);
  const fgY = useSum(fgYCursor, idleYStrong);

  // Card drifts a touch too, so it doesn't feel pinned in place.
  const cardXCursor = useTransform(smoothX, [-0.5, 0.5], [-6, 6]);
  const cardYCursor = useTransform(smoothY, [-0.5, 0.5], [-6, 6]);
  const cardX = useSum(cardXCursor, idleX);
  const cardY = useSum(cardYCursor, idleY);

  const shadowX = useTransform(smoothX, [-0.5, 0.5], [24, -24]);
  const shadowY = useTransform(smoothY, [-0.5, 0.5], [24, -24]);
  const boxShadow = useMotionTemplate`${shadowX}px ${shadowY}px 36px -8px rgba(0,0,0,0.55), 0 14px 30px -12px rgba(0,0,0,0.4), 0 0 32px -6px var(--accent)`;

  useEffect(() => {
    if (disableMotion) return;
    const handlePointerMove = (event: PointerEvent) => {
      mouseX.set(event.clientX / window.innerWidth - 0.5);
      mouseY.set(event.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [mouseX, mouseY, disableMotion]);

  // Kept as close to the photo's real crop as the pan ranges above allow —
  // just enough overscan to cover them without empty edges showing, and
  // only applied at all once there's actual panning to cover; a static
  // photo has no reason to be zoomed in past its real crop.
  const bgScale = disableMotion ? 1 : 1.1;
  const fgScale = disableMotion ? 1 : 1.16;

  return (
    <div className={`relative shrink-0 mx-auto md:mx-0 ${className}`} style={{ perspective: 900 }}>
      <motion.div
        className="relative rounded-2xl"
        style={
          disableMotion
            ? { boxShadow: "0 14px 30px -12px rgba(0,0,0,0.4)" }
            : {
                rotateX,
                rotateY,
                x: cardX,
                y: cardY,
                boxShadow,
                transformStyle: "preserve-3d",
              }
        }
      >
        {/* `group` so the background layer below can react to a real CSS
            :hover on the photo itself — independent of the page-wide cursor
            parallax above, and a no-op (stays grayscale) on touch, which is
            the right degrade for a device with no hover concept anyway. */}
        <div
          role="img"
          aria-label={alt}
          className="group relative h-32 w-32 sm:h-44 sm:w-44 md:h-52 md:w-52 rounded-2xl border-2 border-[var(--accent)] overflow-hidden bg-[var(--card-bg)]"
        >
          {layered ? (
            <>
              {/* Far layer: blurred backdrop, pans least, and stays black-and-white
                  until the photo itself is hovered — the subject (full color, never
                  desaturated) is what's meant to hold your eye at rest.
                  Note: scale must live in the `style` object (not a Tailwind class)
                  — framer-motion writes `x`/`y` as an inline `transform`, which
                  would otherwise clobber a class-based transform entirely. `filter`
                  is a separate property, so the grayscale transition classes are
                  free to live in `className` without that conflict. */}
              <motion.img
                src={bgSrc}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover grayscale transition-[filter] duration-500 ease-out group-hover:grayscale-0"
                style={disableMotion ? { scale: bgScale } : { x: bgX, y: bgY, scale: bgScale }}
              />
              {/* Near layer: sharp subject cutout, pans most, always full color */}
              <motion.img
                src={fgSrc}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover"
                style={
                  disableMotion
                    ? { scale: fgScale, filter: "drop-shadow(0 10px 16px rgba(0,0,0,0.45))" }
                    : { x: fgX, y: fgY, scale: fgScale, filter: "drop-shadow(0 10px 16px rgba(0,0,0,0.45))" }
                }
              />
            </>
          ) : (
            <img src={src} alt="" aria-hidden="true" className="h-full w-full object-cover" />
          )}
        </div>
        <motion.span
          className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[var(--background)] bg-[var(--accent)]"
          style={disableMotion ? undefined : { translateZ: 24 }}
        />
      </motion.div>
    </div>
  );
}
