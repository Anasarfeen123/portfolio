"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Project } from "@/data/portfolio";

interface ProjectSphereProps {
  projects: Project[];
  onOpenDetails: (project: Project) => void;
}

// Reference translateZ distance (px) from the sphere's center to every
// card — the main knob for "no overlap": bigger radius means more chord
// distance between neighbouring cards for the same card size (see
// sphereGridPoints). Card footprint itself is CARD_WIDTH/HEIGHT_REFERENCE
// below — the two are tuned together, so changing one without the other
// reopens the overlap problem this exists to solve. This value was tuned
// by eye against a 25-project catalog: the radius at which 25 cards'
// chord-to-card-size ratio reads as one continuous shell — no gap big
// enough to see the wireframe rings through, no chord tight enough to risk
// overlap. The actual radius used (ProjectSphereScene) scales this
// reference by project count rather than staying fixed, so the shell stays
// equally "full" whether the catalog has 10 projects or 60 — a fixed
// radius would go visibly sparse as more points spread across the same
// surface, or crowd toward overlap as fewer points bunch up.
// (.project-sphere-canvas's min-height is sized against this same value —
// see its CSS comment — so a change here needs a matching one there.)
const SPHERE_RADIUS_REFERENCE = 290;
const SPHERE_RADIUS_REFERENCE_COUNT = 25;
const AUTO_ROTATE_DEG_PER_SEC = 7;
const RESUME_AUTO_ROTATE_MS = 2200;
// How much of the card shell's yaw the planet's terrain-scroll borrows —
// see the comment in ProjectSphereScene's applyRotation. 1 would spin it in
// exact lockstep with the cards; well under 1 reads as its own, heavier
// motion instead of a texture glued to the shell's rotation.
const PLANET_SPIN_RATIO = 0.4;

// The card footprint SPHERE_RADIUS_REFERENCE was tuned against (see that
// constant's comment). Pulled back down from 150x122 — full-size (or close
// to it, on a tall enough screen that computeViewportScale barely shrinks
// anything) still read as too large once there were 25 of them on screen
// together, crowding out the "sphere made of many cards" read in favor of
// "a handful of big cards." 124x101 keeps the same aspect ratio and the
// same tuned chord-to-card ratio (via the matching SPHERE_RADIUS_REFERENCE
// drop above), just smaller throughout.
const CARD_WIDTH_REFERENCE = 124;
const CARD_HEIGHT_REFERENCE = 101;
// .project-sphere-canvas's own CSS clamps its height to this same
// [floor, ratio, ceiling] against the viewport — the two have to move
// together, or this scale computation targets a height the canvas isn't
// actually rendering at, which reopens the clipping problem this exists to
// close. PADDING mirrors that CSS rule's own padding.
//
// Tuned so the common laptop range (900px+ of actual browser viewport,
// i.e. most 13"+ screens once OS chrome/browser tabs are subtracted) lands
// at or near full scale, and only genuinely short windows (a 1366x768
// display, a laptop with dev tools docked, etc.) pull the floor in — a
// first pass here targeted a tighter zero-scroll fit at every height, which
// meant even ordinary laptops landed around 0.83x scale and the card
// shrink from CARD_WIDTH_REFERENCE compounded with the viewport shrink on
// top of it, pushing text down toward illegible before either one alone
// would have.
const CANVAS_HEIGHT_FLOOR = 700;
const CANVAS_HEIGHT_VIEWPORT_RATIO = 0.86;
const CANVAS_HEIGHT_CEILING = 820;
const CANVAS_PADDING = 24;
// Leaves a little headroom below the canvas's own height beyond the pure
// geometric footprint (radius + half a card's height, doubled) — pitch
// tilting and perspective foreshortening both push a card's *rendered*
// extent slightly past that idealized flat-on estimate.
const VIEWPORT_FIT_SAFETY = 0.94;
// However short the screen, cards never shrink past this fraction of their
// full size — a hard floor trades a little scroll-past-the-fold on very
// short viewports for cards that stay legible rather than sliding back
// toward the "too small to read" size this was tuned to fix in the first
// place.
const VIEWPORT_SCALE_FLOOR = 0.8;

/** How much to shrink the whole shell (radius *and* card footprint,
 * together — see the callers) so it fits within one screen's height
 * instead of requiring a scroll past the fold to see the top/bottom of the
 * sphere. `idealRadius` is this catalog's radius *before* this scaling —
 * i.e. SPHERE_RADIUS_REFERENCE already adjusted for project count, so a
 * shorter screen and a smaller catalog don't fight each other's math. */
function computeViewportScale(idealRadius: number, innerHeight: number): number {
  const canvasHeight = Math.min(
    CANVAS_HEIGHT_CEILING,
    Math.max(CANVAS_HEIGHT_FLOOR, innerHeight * CANVAS_HEIGHT_VIEWPORT_RATIO)
  );
  const idealFootprint = 2 * (idealRadius + CARD_HEIGHT_REFERENCE / 2);
  const availableFootprint = canvasHeight * VIEWPORT_FIT_SAFETY - CANVAS_PADDING * 2;
  const scale = availableFootprint / idealFootprint;
  return Math.min(1, Math.max(VIEWPORT_SCALE_FLOOR, scale));
}

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
 * point count is the *smallest total that's still ≥ the request* — every
 * project needs a real point (there's no blank-card pool to borrow from or
 * dump surplus into any more), so this can only ever hand back too many
 * points, never too few. The caller (ProjectSphereScene) slices off the
 * exact count it needs; the trimmed handful always comes off the last ring,
 * so the only visible cost of a mismatch is that one ring near a pole
 * running a few cards short of the brick pattern elsewhere — never an
 * unfilled project. Alternate rings are longitude-offset by half a slot so
 * cards brick-pattern instead of lining up in a seam pole-to-pole.
 *
 * This is still what makes "no overlap" a property of the layout instead
 * of something bolted on after: ring spacing and in-ring spacing are both
 * derived from the same target angle, so as long as the radius is generous
 * relative to a card's footprint, no two cards' boxes can occupy the same
 * screen space. */
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
  let bestTotal = Infinity;
  for (let rows = 1; rows <= Math.max(1, count); rows++) {
    const total = countAtRows(rows);
    if (total >= count && total < bestTotal) {
      bestTotal = total;
      bestRows = rows;
    }
  }
  // Rows' total grows roughly quadratically, so the loop above always finds
  // a satisfying total well before its upper bound in practice — this is
  // just a defensive fallback for the never-observed case it doesn't.
  if (bestTotal === Infinity) bestRows = Math.max(1, count);

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

  // Trim the surplus (bestTotal - count) evenly across the whole index
  // range rather than lopping it off the end — that would concentrate every
  // dropped point in the last ring alone. Spreading them out means each
  // affected ring loses at most one point, which reads as normal packing
  // noise instead of a visible bald patch near a pole.
  const surplus = points.length - count;
  if (surplus <= 0) return points;
  const stride = points.length / surplus;
  const trimmed: SpherePoint[] = [];
  let dropped = 0;
  let nextDropAt = stride;
  for (let i = 0; i < points.length; i++) {
    if (dropped < surplus && i + 1 >= nextDropAt) {
      dropped++;
      nextDropAt += stride;
      continue;
    }
    trimmed.push(points[i]);
  }
  return trimmed;
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
          {/* Own span around the label (not just bare text) so the mobile
              list layout (globals.css, <640px) can hide the label and keep
              only the chevron — a compact list row reads "tap to open" off
              the chevron alone; "View details" spelled out on every one of
              25 rows is redundant there in a way it isn't when a card is
              seen mostly one at a time on the sphere. */}
          <span className="project-sphere-card-hint-label">View details</span> <ChevronRight size={11} />
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
  radius,
  cardWidth,
  cardHeight,
  cardRef,
  onOpenDetails,
  onHoverChange,
}: {
  project: Project;
  point: SpherePoint;
  radius: number;
  cardWidth: number;
  cardHeight: number;
  cardRef: (el: HTMLElement | null) => void;
  onOpenDetails: (project: Project) => void;
  onHoverChange: (hovering: boolean) => void;
}) {
  const transform = `rotateY(${point.theta}rad) rotateX(${point.phi}rad) translateZ(${radius}px)`;
  return (
    <article
      ref={cardRef}
      className={`project-sphere-card ${project.image ? "project-sphere-card-has-image" : "project-sphere-card-no-image"}`}
      // Custom properties, not the width/height/margin themselves — every
      // size derived from a card's footprint (font sizes, image strip
      // height, body padding) reads off these in CSS via calc(), so a
      // screen-height-driven resize stays proportional everywhere at once
      // instead of needing a matching JS update per property.
      style={{ transform, "--card-w": `${cardWidth}px`, "--card-h": `${cardHeight}px` } as React.CSSProperties}
      tabIndex={0}
      role="button"
      aria-label={`${project.title} — view details`}
      onClick={() => onOpenDetails(project)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenDetails(project);
        }
      }}
      // Hovering a card is the one moment someone's actually trying to read
      // it — auto-rotate sliding it away mid-read undoes the point of
      // hovering at all. Keyboard focus gets the same treatment for the
      // same reason (see onHoverChange's caller): a sighted keyboard user
      // tabbing through cards shouldn't have the shell drift under them
      // either.
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      onFocus={() => onHoverChange(true)}
      onBlur={() => onHoverChange(false)}
    >
      <ProjectCardFace project={project} />
    </article>
  );
}

/** The interactive sphere: auto-rotates, drag (mouse or touch) takes over
 * and hands back after a short idle delay — same interaction model the
 * WebGL version used (OrbitControls' autoRotate + onStart/onEnd), just
 * driven by hand since there's no r3f scene underneath it any more. */
function ProjectSphereScene({ projects, onOpenDetails }: ProjectSphereProps) {
  const points = useMemo(() => sphereGridPoints(projects.length), [projects.length]);
  // Chord distance between neighbouring points scales with radius × angular
  // spacing, and angular spacing shrinks as 1/√(point count) — so holding
  // radius fixed while the catalog grows or shrinks would make the shell
  // visibly gappier (few projects) or crowd toward overlap (many). Scaling
  // by √(reference count / actual count) keeps that chord-to-card-size ratio
  // — and therefore the "one continuous shell" look — the same regardless of
  // how many projects there are.
  const idealRadius = useMemo(
    () => SPHERE_RADIUS_REFERENCE * Math.sqrt(SPHERE_RADIUS_REFERENCE_COUNT / Math.max(1, projects.length)),
    [projects.length]
  );

  // Re-derived on resize, not just on mount — someone rotating a tablet or
  // resizing a browser window should see the shell settle to the new
  // height, not stay sized for whatever the viewport happened to be on
  // first paint. This mounts only once `wantsSphere` is already true (see
  // ProjectSphere below), so `window` is always safe to read here — no
  // SSR/hydration guard needed the way that state itself needed one.
  const [viewportScale, setViewportScale] = useState(() => computeViewportScale(idealRadius, window.innerHeight));
  useEffect(() => {
    const onResize = () => setViewportScale(computeViewportScale(idealRadius, window.innerHeight));
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [idealRadius]);

  const radius = idealRadius * viewportScale;
  const cardWidth = CARD_WIDTH_REFERENCE * viewportScale;
  const cardHeight = CARD_HEIGHT_REFERENCE * viewportScale;

  const worldRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const planetSurfaceRef = useRef<HTMLDivElement>(null);

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
  // Separate from autoRotateRef/draggingRef on purpose: a drag "commits" to
  // manual control until the user's done and a beat has passed, but hover
  // is transient — the instant the pointer (or keyboard focus) leaves, the
  // shell should feel free to pick back up, no exclusivity with dragging
  // to reason about. hoverCountRef, not a boolean, because a fast mouse
  // move can fire the next card's onMouseEnter before the previous card's
  // onMouseLeave — a plain boolean would read "not hovering" for one frame
  // in between and let auto-rotate flicker back on.
  const hoverCountRef = useRef(0);
  const hoverPausedRef = useRef(false);
  const hoverResumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

      // The planet can't literally share the world's 3D transform (see the
      // CSS comment on .project-sphere-planet), so it fakes turning "with"
      // the shell by scrolling its terrain layer sideways by an amount
      // driven off this same yaw — slower than 1:1 (PLANET_SPIN_RATIO < 1)
      // so it reads as a heavier body turning underneath the lighter cards
      // orbiting it, not glued 1:1 to them. Sign matches world's rotateY so
      // dragging right turns the globe the same way the cards visibly turn.
      //
      // Written as a custom property, not a direct backgroundPositionX
      // assignment — CSS custom properties (unlike inline styles) inherit
      // down to pseudo-elements of the same node, which is what lets the
      // ::after "data node" overlay (globals.css) ride along at the exact
      // same rotation as the crater texture it's a child of, using nothing
      // but CSS, with no second ref/RAF write needed for it here.
      if (planetSurfaceRef.current) {
        planetSurfaceRef.current.style.setProperty("--planet-scroll", `${-yawDeg * PLANET_SPIN_RATIO}%`);
      }

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
    };

    applyRotation();

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (autoRotateRef.current && !draggingRef.current && !hoverPausedRef.current) {
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
      if (hoverResumeTimerRef.current) clearTimeout(hoverResumeTimerRef.current);
    };
  }, [points]);

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    autoRotateRef.current = false;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
  };

  // Pauses the instant any card gains a hoverer (mouse or keyboard focus —
  // see SphereCard's onFocus/onBlur), resumes a beat after the *last* one
  // loses it. No drag-style exclusivity check needed here: hovering during
  // a drag is already a no-op in practice (the pointer's busy dragging, not
  // sitting still over one card), and once the drag ends the existing
  // resumeTimerRef flow takes back over on its own schedule.
  const handleHoverChange = (hovering: boolean) => {
    if (hoverResumeTimerRef.current) {
      clearTimeout(hoverResumeTimerRef.current);
      hoverResumeTimerRef.current = null;
    }
    if (hovering) {
      hoverCountRef.current += 1;
      hoverPausedRef.current = true;
      return;
    }
    hoverCountRef.current = Math.max(0, hoverCountRef.current - 1);
    if (hoverCountRef.current === 0) {
      hoverResumeTimerRef.current = setTimeout(() => {
        hoverPausedRef.current = false;
      }, 400);
    }
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
      {/* The planet at the center of the card shell — a flat disc (a
          sibling of `.project-sphere-world`, not a child of it: a child
          would inherit the world's rotateX/rotateY and view-foreshorten
          into an ellipse as it turned, like a coin being tipped, instead of
          reading as a solid ball). It still turns *with* the shell rather
          than sitting inert: the terrain layer's background-position is
          driven off the same yaw as the cards, every frame, in
          applyRotation below. Kept well under the card shell's own radius
          (see the CSS comment on .project-sphere-planet for why a bigger,
          brighter first pass didn't work) — a glimpse of a planet through
          the gaps between cards, not a bright ball the cards are stuck to. */}
      <div
        className="project-sphere-planet"
        style={{ width: radius * 1.1, height: radius * 1.1 }}
        aria-hidden="true"
      >
        <div className="project-sphere-planet-surface" ref={planetSurfaceRef} />
        {/* A fixed lat/long wireframe, deliberately NOT wired to the same
            rotation as the surface below it — it reads as a scanner/sensor
            grid laid over the rock from the viewer's side, not markings
            painted on the rock itself, which is what actually sells
            "instrumented" rather than just "a globe with lines on it". */}
        <div className="project-sphere-planet-grid" aria-hidden="true" />
        <div className="project-sphere-planet-shade" />
      </div>
      <div className="project-sphere-world" ref={worldRef}>
        {GLOBE_RING_TRANSFORMS.map((transform) => (
          <div
            key={transform}
            className="project-sphere-globe-ring"
            style={{
              transform,
              width: radius * 2,
              height: radius * 2,
              marginTop: -radius,
              marginLeft: -radius,
            }}
            aria-hidden="true"
          />
        ))}
        {projects.map((project, i) => (
          <SphereCard
            key={project.id}
            project={project}
            point={points[i]}
            radius={radius}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            cardRef={(el) => {
              cardRefs.current[i] = el;
            }}
            onOpenDetails={onOpenDetails}
            onHoverChange={handleHoverChange}
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
