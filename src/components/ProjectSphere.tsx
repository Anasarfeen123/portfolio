"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Project } from "@/data/portfolio";

interface ProjectSphereProps {
  projects: Project[];
  onOpenDetails: (project: Project) => void;
}

// translateZ distance (px) from the sphere's center to every card — the
// main knob for "no overlap": bigger radius means more chord distance
// between neighbouring cards for the same card size (see
// sphereGridPoints). Card footprint itself is set in CSS
// (.project-sphere-card and .project-sphere-card-blank: both 112x92px,
// same shape) — the two are tuned together, so changing one without the
// other reopens the overlap problem this exists to solve. This radius was
// scaled down from 350 in the same ~0.75 ratio as the card shrink, which
// keeps the chord-to-diagonal safety margin the same proportion it was at
// the bigger size instead of just shrinking the cards and leaving the
// sphere's existing radius to make them float with way more empty gap
// between neighbours than before.
const SPHERE_RADIUS = 270;
const AUTO_ROTATE_DEG_PER_SEC = 7;
const RESUME_AUTO_ROTATE_MS = 2200;

// Blank, non-interactive filler cards, same full size and shape as a real
// one — occupying the slots real project cards don't. Purely texture:
// without them the sphere is only as dense as the project count, which
// reads as sparse once most of it fades to the "facing away" floor. This
// is a target, not the final count — sphereGridPoints snaps to whichever
// ring count's total is the closest achievable match, so the actual blank
// count that comes out the other end of the split below can land a bit
// off from `projects.length * BLANK_CARD_RATIO`.
const BLANK_CARD_RATIO = 0.6;

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// Static great-circle rings — equator + two meridians 60° apart — purely
// decorative children of `.project-sphere-world`. They need no per-frame
// JS at all: sitting in the same preserve-3d group as the cards, they
// inherit the world's rotateX/rotateY every frame for free. What they buy
// is legibility of the *shape*: a scatter of cards that happens to be
// sphere-distributed doesn't read as "a sphere" on sight the way the same
// scatter does once a faint wire cage is visibly wrapped around it.
const GLOBE_RING_TRANSFORMS = ["rotateX(90deg)", "rotateY(60deg)", "rotateY(120deg)"];

interface SpherePoint {
  /** Unit-sphere position — kept alongside theta/phi so the drag/auto-rotate
   * loop can recompute each card's exact on-screen facing every frame
   * (see ProjectSphereScene) without re-deriving it from the CSS angles. */
  x: number;
  y: number;
  z: number;
  /** theta/phi reproduce this exact (x, y, z) through the CSS transform
   * `rotateY(theta) rotateX(phi) translateZ(R)`. Derivation: that transform
   * chain, applied to a point at local (0,0,R), composes to
   * (R·cos(phi)·sin(theta), −R·sin(phi), R·cos(phi)·cos(theta)). Matching
   * that against (x, y, z) gives phi = asin(y) and theta = atan2(x, z) —
   * and cos(phi) falls out to exactly `radiusAtY` below, so no extra trig
   * is needed to solve for theta. */
  theta: number;
  phi: number;
}

/** Distributes points across the *whole* sphere surface as a proper
 * latitude/longitude grid — evenly spaced rings from pole to pole, each
 * ring holding however many points keep its point-to-point spacing close
 * to the spacing *between* rings (so grid cells read as roughly square,
 * not stretched). This replaced a golden-angle spiral, which spaces points
 * evenly too but traces a loose organic scatter rather than a grid a
 * viewer can actually read as rows wrapped around a ball — "uniform" here
 * meant "looks like an ordered grid," not just "evenly spread."
 *
 * `rows` is picked by brute-force search for whichever ring count's total
 * point count lands closest to the requested one — cheap (count ≤ a few
 * hundred) and exact enough that callers don't need to special-case an
 * off-by-a-few actual total, though they should still tolerate one (see
 * ProjectSphereScene). Alternate rings are longitude-offset by half a
 * slot so cards brick-pattern instead of lining up in a seam pole-to-pole.
 *
 * This is still what makes "no overlap" a property of the layout instead
 * of something bolted on after: ring spacing and in-ring spacing are both
 * derived from the same target angle, so as long as SPHERE_RADIUS is
 * generous relative to a card's footprint, no two cards' boxes can occupy
 * the same screen space. */
function sphereGridPoints(count: number): SpherePoint[] {
  if (count <= 0) return [];

  const countAtRows = (rows: number) => {
    let total = 0;
    for (let r = 0; r < rows; r++) {
      const y = 1 - (2 * (r + 0.5)) / rows;
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      // Longitude spacing at this ring ≈ ring spacing (π / rows) when
      // cols ≈ 2 · rows · radiusAtY — the standard square-cell UV-sphere
      // tessellation.
      total += Math.max(1, Math.round(2 * rows * radiusAtY));
    }
    return total;
  };

  let bestRows = 1;
  let bestDiff = Infinity;
  for (let rows = 1; rows <= Math.max(1, count); rows++) {
    const diff = Math.abs(countAtRows(rows) - count);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestRows = rows;
    }
  }

  const points: SpherePoint[] = [];
  for (let r = 0; r < bestRows; r++) {
    const y = 1 - (2 * (r + 0.5)) / bestRows;
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const cols = Math.max(1, Math.round(2 * bestRows * radiusAtY));
    const rowOffset = (r % 2) * (Math.PI / cols);
    for (let c = 0; c < cols; c++) {
      const lon = (c / cols) * Math.PI * 2 + rowOffset;
      const x = Math.cos(lon) * radiusAtY;
      const z = Math.sin(lon) * radiusAtY;
      const theta = Math.atan2(x, z);
      const phi = Math.asin(Math.max(-1, Math.min(1, y)));
      points.push({ x, y, z, theta, phi });
    }
  }
  return points;
}

/** The card's actual content — identical whether it's sitting on the
 * rotating sphere or, on narrow screens / reduced motion, laid out flat.
 * Kept as one function so the two render paths can't drift apart.
 *
 * Deliberately minimal: category, title, and a "there's more" hint — every
 * other detail (description, tech stack, stars/forks, the GitHub link)
 * already lives one click away in ProjectDetailsModal. A face this small,
 * curved, and often mid-rotation was never a good place to read a
 * paragraph and three tag pills off of; packing all of that in was also
 * most of why the text read as cluttered/blurry at this size in the first
 * place. Fewer, bigger words is what actually stays legible here. */
function ProjectCardFace({ project }: { project: Project }) {
  return (
    <>
      {project.image && (
        <div className="project-sphere-card-image">
          <img src={project.image} alt="" />
        </div>
      )}
      <div className="project-sphere-card-body">
        <span className="project-sphere-card-category">{project.category}</span>
        <h3>{project.title}</h3>
        <span className="project-sphere-card-hint">
          View details <ChevronRight size={9} />
        </span>
      </div>
    </>
  );
}

/** One card, permanently stuck to its point on the sphere's surface —
 * `rotateY(theta) rotateX(phi) translateZ(R)` both places it and, because
 * that's a rotate-then-translate chain rather than a plain offset, orients
 * it tangent to the sphere at that point (its local Z axis points straight
 * out along the radius), the way a sticker applied to a ball's surface
 * would sit — which combined with the barrel-curved border-radius in CSS
 * is what sells "wrapped over a sphere" instead of "flat cards floating in
 * a ball shape". This transform is set once and never touched again —
 * earlier this also had a per-frame `scale(...)` layered on top for a
 * depth cue, but re-writing `transform` on a GPU-composited 3D layer every
 * single frame is exactly what was making the card's own text look soft:
 * the browser was re-rasterizing/resampling it continuously instead of
 * settling on one crisp bitmap. Real perspective (`.project-sphere-canvas`
 * already has one) gives the same "farther = smaller" cue for free, purely
 * from the transform math, with nothing to re-touch — only opacity and
 * pointer-events change per frame now (see ProjectSphereScene). */
function SphereCard({
  project,
  point,
  cardRef,
  onOpenDetails,
}: {
  project: Project;
  point: SpherePoint;
  cardRef: (el: HTMLElement | null) => void;
  onOpenDetails: (project: Project) => void;
}) {
  const transform = `rotateY(${point.theta}rad) rotateX(${point.phi}rad) translateZ(${SPHERE_RADIUS}px)`;
  return (
    <article
      ref={cardRef}
      className={`project-sphere-card ${project.image ? "project-sphere-card-has-image" : "project-sphere-card-no-image"}`}
      style={{ transform }}
      onClick={() => onOpenDetails(project)}
    >
      <ProjectCardFace project={project} />
    </article>
  );
}

/** Decorative, non-interactive filler — same sphere, same static-transform
 * approach as SphereCard, just smaller/dimmer and with no content to open.
 * Exists purely to make the sphere read as populated everywhere, not just
 * at the 25 slots that happen to hold real projects. */
function BlankSphereCard({ point, cardRef }: { point: SpherePoint; cardRef: (el: HTMLElement | null) => void }) {
  const transform = `rotateY(${point.theta}rad) rotateX(${point.phi}rad) translateZ(${SPHERE_RADIUS}px)`;
  return <div ref={cardRef} className="project-sphere-card-blank" style={{ transform }} aria-hidden="true" />;
}

/** The interactive sphere: auto-rotates, drag (mouse or touch) takes over
 * and hands back after a short idle delay — same interaction model the
 * WebGL version used (OrbitControls' autoRotate + onStart/onEnd), just
 * driven by hand since there's no r3f scene underneath it any more. */
function ProjectSphereScene({ projects, onOpenDetails }: ProjectSphereProps) {
  // One grid sized for real + blank cards combined, then split by index
  // parity — not two separately-generated grids — so both groups land on
  // *every* ring instead of the real projects specifically clustering in
  // whichever rings a separate, smaller grid happened to lay out. Row-major
  // order means consecutive indices share a ring (same latitude), so
  // alternating even/odd interleaves real and blank within each ring too,
  // not just across the whole sphere.
  const { points, blankPoints } = useMemo(() => {
    const blankCount = Math.round(projects.length * BLANK_CARD_RATIO);
    const all = sphereGridPoints(projects.length + blankCount);
    const points = all.filter((_, i) => i % 2 === 0);
    const blankPoints = all.filter((_, i) => i % 2 === 1);
    // sphereGridPoints' actual total is "closest match," not exact, so
    // `points` can land a couple off from projects.length — every SphereCard
    // below indexes into `points` by project index, so that length has to
    // match exactly. Shuffle the surplus/shortfall to or from blankPoints
    // rather than trimming (which would silently drop a project's card).
    while (points.length > projects.length) blankPoints.push(points.pop()!);
    while (points.length < projects.length && blankPoints.length > 0) points.push(blankPoints.pop()!);
    return { points, blankPoints };
  }, [projects.length]);
  const worldRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const blankCardRefs = useRef<(HTMLElement | null)[]>([]);

  // Rotation state lives in refs, not React state — this updates every
  // animation frame during auto-rotate/drag, and re-rendering 25 cards'
  // worth of React tree at 60fps for what's ultimately two numbers would be
  // wasteful. Styles are written straight to the DOM nodes instead.
  const yawRef = useRef(-24);
  const pitchRef = useRef(-10);
  const draggingRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const autoRotateRef = useRef(true);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // One rotation matrix (rotateX(pitch) · rotateY(yaw), the same
    // composition order as the world's own CSS transform below) applied to
    // every card's rest-position normal gives its *exact* current facing —
    // not an approximation — so the fade/click-through-disable for
    // back-of-sphere cards lines up with what's actually on screen.
    const applyRotation = () => {
      const world = worldRef.current;
      if (!world) return;
      const yawDeg = yawRef.current;
      const pitchDeg = pitchRef.current;
      world.style.transform = `rotateX(${pitchDeg}deg) rotateY(${yawDeg}deg)`;

      const yaw = (yawDeg * Math.PI) / 180;
      const pitch = (pitchDeg * Math.PI) / 180;
      const cosYaw = Math.cos(yaw);
      const sinYaw = Math.sin(yaw);
      const cosPitch = Math.cos(pitch);
      const sinPitch = Math.sin(pitch);

      // `backface-visibility: hidden` (CSS) already makes anything with
      // facing < 0 fully invisible on its own — a card's own back-facing
      // half of the sphere just isn't painted, full stop. So this ramp only
      // has one job: suppress the narrow *rim* band right around facing ≈ 0,
      // where a card is still technically front-facing but turned edge-on
      // enough to project to a thin sliver instead of its real face.
      // Everything past that rim — most of the visible hemisphere — stays
      // at full opacity. No `scale(...)` here any more (see SphereCard) —
      // only opacity/pointer-events/z-index change per frame now.
      for (let i = 0; i < points.length; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const p = points[i];
        const z1 = -p.x * sinYaw + p.z * cosYaw;
        const facing = p.y * sinPitch + z1 * cosPitch; // -1 fully back .. 1 fully front
        const t = smoothstep(-0.05, 0.25, facing);
        el.style.opacity = (0.12 + t * 0.88).toFixed(3);
        // Faded, mostly-back-facing cards stop accepting clicks so they
        // can't silently intercept a click meant for the card visually in
        // front of them.
        el.style.pointerEvents = facing > 0.08 ? "auto" : "none";
        el.style.zIndex = String(Math.round(t * 1000));
      }

      // Blank filler cards use the same ramp but capped much dimmer — they're
      // texture, not content, and should never out-compete a real card for
      // attention even at dead-center facing. Never clickable.
      for (let i = 0; i < blankPoints.length; i++) {
        const el = blankCardRefs.current[i];
        if (!el) continue;
        const p = blankPoints[i];
        const z1 = -p.x * sinYaw + p.z * cosYaw;
        const facing = p.y * sinPitch + z1 * cosPitch;
        const t = smoothstep(-0.05, 0.25, facing);
        el.style.opacity = (0.05 + t * 0.3).toFixed(3);
        el.style.zIndex = String(Math.round(t * 400));
      }
    };

    applyRotation();

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (autoRotateRef.current && !draggingRef.current) {
        yawRef.current += AUTO_ROTATE_DEG_PER_SEC * dt;
        applyRotation();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current || !lastPointerRef.current) return;
      const dx = e.clientX - lastPointerRef.current.x;
      const dy = e.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      yawRef.current += dx * 0.35;
      pitchRef.current = Math.max(-60, Math.min(60, pitchRef.current - dy * 0.35));
      applyRotation();
    };
    const endDrag = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      lastPointerRef.current = null;
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = setTimeout(() => {
        autoRotateRef.current = true;
      }, RESUME_AUTO_ROTATE_MS);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [points, blankPoints]);

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    autoRotateRef.current = false;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
  };

  return (
    // The drag handler lives on the canvas, not the world — `.project-sphere-world`
    // is a 0×0 positioning anchor (see its CSS), so it only has an actual
    // hit-testable box where a real card sits on top of it. A drag starting
    // on genuinely empty canvas background, or on a blank filler card
    // (`pointer-events: none`, so hits fall through to whatever's behind
    // it), would land on `.project-sphere-canvas` — an ancestor of the
    // world, not a descendant — and never bubble up to a listener on the
    // world at all. Real cards keep working the same way regardless, since
    // bubbling from a card up through both world *and* canvas reaches this
    // listener either way.
    <div
      className="project-sphere-canvas"
      aria-label={`${projects.length} project cards arranged on a rotating sphere — drag to look around`}
      onPointerDown={onPointerDown}
    >
      <div className="project-sphere-world" ref={worldRef}>
        {GLOBE_RING_TRANSFORMS.map((transform) => (
          <div key={transform} className="project-sphere-globe-ring" style={{ transform }} aria-hidden="true" />
        ))}
        {blankPoints.map((point, i) => (
          <BlankSphereCard
            key={`blank-${i}`}
            point={point}
            cardRef={(el) => {
              blankCardRefs.current[i] = el;
            }}
          />
        ))}
        {projects.map((project, i) => (
          <SphereCard
            key={project.id}
            project={project}
            point={points[i]}
            cardRef={(el) => {
              cardRefs.current[i] = el;
            }}
            onOpenDetails={onOpenDetails}
          />
        ))}
      </div>
      <span className="project-sphere-hint">Drag to look around — every project is up there</span>
    </div>
  );
}

/** Static fallback for narrow screens and `prefers-reduced-motion`: same
 * cards, same curved-card look, laid out in a plain wrapping grid instead
 * of rotating in 3D. All projects, still no overlap — just none of the
 * drag/auto-rotate motion. */
function ProjectSphereFlat({ projects, onOpenDetails }: ProjectSphereProps) {
  return (
    <div className="project-sphere-canvas project-sphere-canvas-flat" aria-label={`${projects.length} project cards`}>
      <div className="project-sphere-flat-grid">
        {projects.map((project) => (
          <article
            key={project.id}
            className={`project-sphere-card project-sphere-card-flat ${project.image ? "project-sphere-card-has-image" : "project-sphere-card-no-image"}`}
            onClick={() => onOpenDetails(project)}
          >
            <ProjectCardFace project={project} />
          </article>
        ))}
      </div>
    </div>
  );
}

export function ProjectSphere({ projects, onOpenDetails }: ProjectSphereProps) {
  // null while unknown (first paint, before we can check matchMedia) —
  // resolved one effect later so the choice never causes a hydration
  // mismatch between server and client.
  const [wantsSphere, setWantsSphere] = useState<boolean | null>(null);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Two separate signals for "this is a mobile view, skip the heavy 3D
    // scene": viewport width (catches phones regardless of pointer type —
    // a phone reporting a fine pointer via some peripheral shouldn't get
    // 50 continuously-animated 3D cards) and coarse-pointer (catches
    // tablets that may report a wide-enough viewport but are still
    // touch-primary, weaker-GPU devices prone to the same lag). Either one
    // is enough to fall back to the plain grid.
    const mobileWidthQuery = window.matchMedia("(max-width: 900px)");
    const coarsePointerQuery = window.matchMedia("(pointer: coarse)");
    const compute = () =>
      setWantsSphere(!reducedMotionQuery.matches && !mobileWidthQuery.matches && !coarsePointerQuery.matches);
    compute();
    reducedMotionQuery.addEventListener("change", compute);
    mobileWidthQuery.addEventListener("change", compute);
    coarsePointerQuery.addEventListener("change", compute);
    return () => {
      reducedMotionQuery.removeEventListener("change", compute);
      mobileWidthQuery.removeEventListener("change", compute);
      coarsePointerQuery.removeEventListener("change", compute);
    };
  }, []);

  if (wantsSphere === null) {
    return <div className="project-sphere-canvas project-sphere-loading" aria-hidden="true" />;
  }

  if (!wantsSphere) {
    return <ProjectSphereFlat projects={projects} onOpenDetails={onOpenDetails} />;
  }

  return <ProjectSphereScene projects={projects} onOpenDetails={onOpenDetails} />;
}
