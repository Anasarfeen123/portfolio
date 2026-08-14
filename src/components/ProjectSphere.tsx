"use client";

import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { ExternalLink, GitFork, Star } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Project } from "@/data/portfolio";
import { GithubIcon } from "@/components/GithubIcon";
import { Revolving3DCarousel } from "@/components/Revolving3DCarousel";
import { useCanRenderWebGL } from "@/hooks/useCanRenderWebGL";
import { useGitHubRepo } from "@/hooks/useGitHubRepo";

const ACCENT = "#e08214";
const SIGNAL = "#5a9c5e";

// Two concentric decorative shells (small glowing points, no cards) sit
// inside and outside the project shell itself, which is now the *whole*
// sphere's surface tiled with cards — real featured projects claim the
// slots facing the camera on load, everything else renders as blank filler
// all the way around, revealed as you drag.
const CORE_RADIUS = 1.35;
// Bumped up from 2.7 so the same TOTAL_SLOTS count spreads across more
// surface area — more breathing room between neighbouring cards — without
// having to thin out how many slots tile the sphere.
const PROJECT_RADIUS = 3.3;
const OUTER_RADIUS = 4.6;

// Total card slots tiling the sphere's surface — filled with real featured
// projects first (the currently best-facing positions), the rest rendered
// as blank placeholder cards. Featuring another project later just lights
// up the next-best slot instead of the sphere needing to reach this count
// before it stops looking sparse.
const TOTAL_SLOTS = 42;

/** Rotates the +Z axis to point along `point`'s direction from the origin
 * — used so a card at a given dome position faces straight outward, the
 * way a sticker applied to a ball's surface would, rather than always
 * facing the camera regardless of where it sits. */
function outwardQuaternion(point: THREE.Vector3): THREE.Quaternion {
  const normal = point.clone().normalize();
  return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
}

interface ProjectSphereProps {
  projects: Project[];
  onOpenDetails: (project: Project) => void;
}

/** Evenly distributes `count` points across the *whole* sphere surface
 * (golden-angle spiral — the standard technique for even coverage at any
 * count, no clustering at the poles the way a naive lat/long grid gets).
 * Used both for the decorative shells and, now, the card slots themselves —
 * the entire sphere is meant to read as tiled with cards, not just a
 * forward-facing patch, since dragging can bring any part of it into view. */
function fibonacciSpherePoints(count: number, radius: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = count === 1 ? 0 : 1 - (i / (count - 1)) * 2;
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;
    points.push(new THREE.Vector3(Math.cos(theta) * radiusAtY, y, Math.sin(theta) * radiusAtY).multiplyScalar(radius));
  }
  return points;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

// Soft radial dot — drawn fresh per mount rather than cached at module
// scope, same reasoning as ArchitectureDiagram.tsx's tech-icon textures:
// R3F disposes textures on unmount, so a shared cache would eventually hand
// back a disposed one. Cheap enough (one small canvas draw) not to matter.
function createDotTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.5, "rgba(255,255,255,0.5)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/** Blank, non-interactive shell of glowing points — a THREE.Points cloud
 * (one draw call for the whole shell) rather than individual DOM/Html
 * elements per node, since these are purely decorative and there can be
 * 15-20+ of them; Html per node would mean that many extra DOM elements
 * doing nothing but sitting there, which Points does for effectively free. */
function DecorativeShell({
  count,
  radius,
  color,
  size,
  speed,
  opacity,
}: {
  count: number;
  radius: number;
  color: string;
  size: number;
  speed: number;
  opacity: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useMemo(() => createDotTexture(), []);
  const positions = useMemo(() => {
    const pts = fibonacciSpherePoints(count, radius);
    const arr = new Float32Array(count * 3);
    pts.forEach((p, i) => {
      arr[i * 3] = p.x;
      arr[i * 3 + 1] = p.y;
      arr[i * 3 + 2] = p.z;
    });
    return arr;
  }, [count, radius]);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * speed;
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial map={texture} color={color} size={size} transparent opacity={opacity} depthWrite={false} sizeAttenuation />
      </points>
    </group>
  );
}

function SphereCard({ project, point, index, onOpenDetails }: { project: Project; point: THREE.Vector3; index: number; onOpenDetails: (project: Project) => void }) {
  const ghStats = useGitHubRepo(project.repoName);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mountTimeRef = useRef<number | null>(null);
  const quaternion = useMemo(() => outwardQuaternion(point), [point]);

  // Static depth cue (nearer cards read slightly bolder than the ones set
  // further back in the dome) — never drops below a floor, since the whole
  // point is that every card stays clearly legible, not that some fade out.
  // Kept to a narrow band so cards read as a uniform, consistent size across
  // the sphere rather than visibly ballooning toward the camera.
  const depthFactor = THREE.MathUtils.clamp(point.z / PROJECT_RADIUS, 0, 1);
  const baseOpacity = 0.85 + depthFactor * 0.15;
  const baseScale = 0.94 + depthFactor * 0.06;

  useFrame(({ clock }) => {
    if (!wrapperRef.current) return;
    if (mountTimeRef.current === null) mountTimeRef.current = clock.elapsedTime;
    // Staggered entrance — each card grows in slightly after the last,
    // instead of the whole dome popping in at once.
    const elapsed = clock.elapsedTime - mountTimeRef.current;
    const delay = index * 0.12;
    const progress = smoothstep(delay, delay + 0.55, elapsed);

    wrapperRef.current.style.opacity = (progress * baseOpacity).toFixed(3);
    wrapperRef.current.style.transform = `scale(${(0.55 + progress * (baseScale - 0.55)).toFixed(3)})`;
    wrapperRef.current.style.pointerEvents = progress > 0.6 ? "auto" : "none";
  });

  return (
    // quaternion faces the card outward from the sphere's center, like a
    // sticker applied to its surface — position() alone would have every
    // card facing the same default (0,0,1) direction regardless of where
    // it sits on the dome. Combined with `transform` (true 3D, not
    // billboarded) on the Html below, the card now rotates rigidly with
    // the sphere instead of always flattening back to face the camera.
    <group position={point} quaternion={quaternion}>
      <Html center transform distanceFactor={7} occlude={false} pointerEvents="none">
        <div
          ref={wrapperRef}
          className="project-sphere-card"
          style={{ pointerEvents: "none", opacity: 0, transform: "scale(0.55)" }}
          onClick={() => onOpenDetails(project)}
        >
          {project.image && (
            <div className="project-sphere-card-image">
              <img src={project.image} alt="" />
            </div>
          )}
          <div className="project-sphere-card-body">
            <div className="project-sphere-card-top">
              <span className="project-sphere-card-category">{project.category}</span>
              {!ghStats.loading && ghStats.stars > 0 && (
                <span className="project-sphere-card-stars">
                  <Star size={10} /> {ghStats.stars}
                </span>
              )}
            </div>
            <h3>{project.title}</h3>
            <p>{project.signal}</p>
            <div className="project-sphere-card-tech">
              {project.technologies.slice(0, 3).map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <div className="project-sphere-card-bottom">
              <span className="project-sphere-card-cta">
                Full details <ExternalLink size={11} />
              </span>
              <span className="project-sphere-card-bottom-right">
                {ghStats.forks > 0 && (
                  <span className="project-sphere-card-forks">
                    <GitFork size={10} /> {ghStats.forks}
                  </span>
                )}
                <a
                  href={project.github}
                  target="_blank"
                  rel="noreferrer"
                  className="project-sphere-card-gh"
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`${project.title} on GitHub`}
                >
                  <GithubIcon size={12} />
                </a>
              </span>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

/** An empty slot on the dome — reserved space for a project that isn't
 * featured yet. Featuring another one just fills the next of these in,
 * rather than the sphere staying visibly sparse until there happen to be
 * DOME_ROWS x DOME_COLS real projects. */
function BlankSlotCard({ point, index }: { point: THREE.Vector3; index: number }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mountTimeRef = useRef<number | null>(null);
  const quaternion = useMemo(() => outwardQuaternion(point), [point]);

  useFrame(({ clock }) => {
    if (!wrapperRef.current) return;
    if (mountTimeRef.current === null) mountTimeRef.current = clock.elapsedTime;
    const elapsed = clock.elapsedTime - mountTimeRef.current;
    // Shorter per-card stagger than the real cards use (there are 30+ of
    // these, not a handful — index * 0.12 would take ~5s to finish revealing).
    const delay = index * 0.04;
    const progress = smoothstep(delay, delay + 0.4, elapsed);
    wrapperRef.current.style.opacity = (progress * 0.7).toFixed(3);
    wrapperRef.current.style.transform = `scale(${(0.5 + progress * 0.5).toFixed(3)})`;
  });

  return (
    <group position={point} quaternion={quaternion}>
      <Html center transform distanceFactor={7} occlude={false} pointerEvents="none">
        <div ref={wrapperRef} className="project-sphere-card project-sphere-card-blank" style={{ opacity: 0, transform: "scale(0.5)" }} aria-hidden="true">
          <span>+</span>
        </div>
      </Html>
    </group>
  );
}

function SphereScene({
  projects,
  realPoints,
  blankPoints,
  onOpenDetails,
}: {
  projects: Project[];
  realPoints: THREE.Vector3[];
  blankPoints: THREE.Vector3[];
  onOpenDetails: (project: Project) => void;
}) {
  // Sized to match the project dome exactly, so the cards visibly sit on its
  // surface (this is "the sphere") rather than floating separately from a
  // smaller decorative ball.
  const wireframeGeo = useMemo(() => new THREE.IcosahedronGeometry(PROJECT_RADIUS, 2), []);

  // Rotation now has exactly one source: OrbitControls, auto-rotating the
  // camera when idle and handing full control to a drag the moment one
  // starts (see the OrbitControls props below) — not a second, independent
  // animation on the object itself running at the same time. Two systems
  // both trying to own "how the sphere is oriented right now" is exactly
  // the class of bug this session already hit once with Lenis vs. native
  // scroll-snap; not repeating it here over something as simple as a spin.
  const [autoRotate, setAutoRotate] = useState(true);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); }, []);

  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[4, 4, 6]} intensity={1.2} color={ACCENT} />
      <pointLight position={[-4, -2, 4]} intensity={0.4} color={SIGNAL} />

      {/* Dense, warm, fast-spinning core — the innermost layer of texture. */}
      <DecorativeShell count={12} radius={CORE_RADIUS} color={ACCENT} size={0.05} speed={0.16} opacity={0.55} />

      {/* Sparse, cool, slow-spinning outer shell, turning the opposite
          direction from the core for parallax contrast. */}
      <DecorativeShell count={16} radius={OUTER_RADIUS} color={SIGNAL} size={0.045} speed={-0.06} opacity={0.35} />

      {/* The wireframe cage and the cards — one group, so they read as one
          draggable object (cards on the sphere's surface), not a static
          card layer sitting in front of a sphere that moves on its own. */}
      <group>
        <mesh geometry={wireframeGeo}>
          <meshBasicMaterial color={ACCENT} wireframe transparent opacity={0.22} />
        </mesh>
        {projects.map((project, i) => (
          <SphereCard key={project.id} project={project} point={realPoints[i]} index={i} onOpenDetails={onOpenDetails} />
        ))}
        {blankPoints.map((point, i) => (
          <BlankSlotCard key={`blank-${i}`} point={point} index={projects.length + i} />
        ))}
      </group>

      <OrbitControls
        makeDefault
        enablePan={false}
        // Zoom on this element would mean scroll-wheel-over-the-sphere
        // fights the page's own scroll instead of turning the sphere —
        // disabled on purpose, drag-to-rotate only.
        enableZoom={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        autoRotate={autoRotate}
        autoRotateSpeed={0.9}
        onStart={() => {
          setAutoRotate(false);
          if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        }}
        onEnd={() => {
          idleTimerRef.current = setTimeout(() => setAutoRotate(true), 2500);
        }}
      />
    </>
  );
}

// Real project cards get a purpose-built layout instead of being picked out
// of the same coarse 42-slot lattice the blanks use — trying to greedily
// filter well-separated points out of a fixed, low-resolution lattice kept
// bottoming out at whatever sparse points happened to survive, which still
// overlapped on screen once you account for how big a card actually
// projects to up close.
//
// For a small handful of cards (today: 4, comfortably up to 8) this places
// them all on a single ring around dead-center, evenly spaced by angle —
// for a *fixed* count, one ring maximizes the minimum pairwise separation
// between any two cards, which is exactly the thing that was overlapping.
// A golden-angle spiral across multiple theta bands (used for the whole
// sphere, where the count is much larger) doesn't give that guarantee:
// two points can land in different bands but similar phi and end up close
// together anyway. Past ring capacity this spills onto additional, wider
// rings within the same cap rather than crowding the first one.
function capPoints(count: number, capAngleDeg: number, radius: number): THREE.Vector3[] {
  if (count <= 0) return [];
  if (count === 1) return [new THREE.Vector3(0, 0, radius)];

  const RING_CAPACITY = 8;
  const ringCount = Math.ceil(count / RING_CAPACITY);
  const points: THREE.Vector3[] = [];
  let remaining = count;
  for (let ring = 0; ring < ringCount; ring++) {
    const onThisRing = Math.min(remaining, Math.ceil(count / ringCount));
    const theta = THREE.MathUtils.degToRad((capAngleDeg * (ring + 1)) / ringCount);
    for (let i = 0; i < onThisRing; i++) {
      const phi = (i / onThisRing) * Math.PI * 2 + ring * (Math.PI / RING_CAPACITY);
      points.push(new THREE.Vector3(Math.sin(theta) * Math.cos(phi), Math.sin(theta) * Math.sin(phi), Math.cos(theta)).multiplyScalar(radius));
    }
    remaining -= onThisRing;
  }
  return points;
}

export function ProjectSphere({ projects, onOpenDetails }: ProjectSphereProps) {
  const canRenderWebGL = useCanRenderWebGL();
  // Real projects claim whichever well-spaced slots face the camera on load
  // (highest z — least angled, most legible without having to drag first);
  // everything else, including the rest of the back and sides, renders as
  // blank filler. Computed once, not re-derived as the sphere later rotates
  // from drag/auto-rotate — which slots are "real" vs. "blank" is fixed for
  // the component's lifetime, only their on-screen position moves.
  const { realPoints, blankPoints } = useMemo(() => {
    // Wider cap for more featured projects (each one needs its own share of
    // room), narrower — so every card stays close to dead-center and
    // legible — when there are only a few, as there are today.
    const capAngleDeg = THREE.MathUtils.clamp(28 + projects.length * 5, 30, 70);
    const real = capPoints(projects.length, capAngleDeg, PROJECT_RADIUS);

    // Blank filler comes from the usual whole-sphere lattice, minus any
    // slot that landed too close to a real card's now-fixed position —
    // without this a blank could sit directly behind/beside a featured
    // card instead of visibly filling the *rest* of the sphere.
    const MIN_BLANK_CLEARANCE = THREE.MathUtils.degToRad(16);
    const blankPoints = fibonacciSpherePoints(TOTAL_SLOTS, PROJECT_RADIUS).filter((p) =>
      real.every((r) => p.angleTo(r) >= MIN_BLANK_CLEARANCE)
    );

    return { realPoints: real, blankPoints };
  }, [projects.length]);

  if (canRenderWebGL === null) {
    return <div className="project-sphere-canvas project-sphere-loading" aria-hidden="true" />;
  }

  if (!canRenderWebGL) {
    // No WebGL, or prefers-reduced-motion (useCanRenderWebGL folds both into
    // one check) — the proven CSS carousel this component replaces is a
    // perfectly good fallback rather than a from-scratch third UI.
    return <Revolving3DCarousel projects={projects} onOpenDetails={onOpenDetails} />;
  }

  return (
    <div className="relative w-full flex flex-col items-center select-none">
      <div className="project-sphere-canvas">
        <Canvas
          camera={{ position: [0, 1, 10.2], fov: 42 }}
          dpr={1}
          gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
        >
          <SphereScene projects={projects} realPoints={realPoints} blankPoints={blankPoints} onOpenDetails={onOpenDetails} />
        </Canvas>
      </div>
    </div>
  );
}
