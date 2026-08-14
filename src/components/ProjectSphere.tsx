"use client";

import { Html } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { ExternalLink, GitFork, Star } from "lucide-react";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import type { Project } from "@/data/portfolio";
import { GithubIcon } from "@/components/GithubIcon";
import { Revolving3DCarousel } from "@/components/Revolving3DCarousel";
import { useCanRenderWebGL } from "@/hooks/useCanRenderWebGL";
import { useGitHubRepo } from "@/hooks/useGitHubRepo";

const ACCENT = "#e08214";
const SIGNAL = "#5a9c5e";

// Three concentric shells, not one — the featured projects sit on their own
// forward-facing arc; the other two are full-sphere, blank, decorative,
// non-interactive nodes that make the composition read as a rich, populated
// 3D space rather than "N cards floating in a row."
const CORE_RADIUS = 1.35;
const PROJECT_RADIUS = 2.7;
const OUTER_RADIUS = 3.9;

interface ProjectSphereProps {
  projects: Project[];
  onOpenDetails: (project: Project) => void;
}

/** Evenly distributes `count` points across a *forward-facing dome*, not a
 * full enclosing sphere — every point stays within roughly +/-70 degrees of
 * dead-center, so nothing ever needs to hide on "the back" the way a full
 * 360-degree distribution would require. This is deliberate: with only a
 * handful of featured projects, the goal is every card visible and legible
 * at once, not a carousel that reveals one at a time. A slight vertical
 * stagger (alternating up/down) keeps it from reading as one flat row. */
function domePoints(count: number, radius: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const spread = THREE.MathUtils.degToRad(count > 1 ? 130 : 0);
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const angle = (t - 0.5) * spread;
    const vertical = (i % 2 === 0 ? 1 : -1) * radius * 0.16;
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;
    points.push(new THREE.Vector3(x, vertical, z));
  }
  return points;
}

/** Evenly distributes `count` points on a full unit sphere (golden-angle
 * spiral — the standard technique for even coverage at any count, no
 * clustering at the poles the way a naive lat/long grid gets). Used for the
 * decorative shells only, which have no legibility requirement either way. */
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

  // Static depth cue (nearer cards read slightly bolder than the ones set
  // further back in the dome) — never drops below a floor, since the whole
  // point is that every card stays clearly legible, not that some fade out.
  const depthFactor = THREE.MathUtils.clamp(point.z / PROJECT_RADIUS, 0, 1);
  const baseOpacity = 0.8 + depthFactor * 0.2;
  const baseScale = 0.88 + depthFactor * 0.12;

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
    <group position={point}>
      <Html center transform={false} distanceFactor={7.5} occlude={false} pointerEvents="none">
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

function SphereScene({
  projects,
  points,
  scrollTiltRef,
  onOpenDetails,
}: {
  projects: Project[];
  points: THREE.Vector3[];
  scrollTiltRef: RefObject<number>;
  onOpenDetails: (project: Project) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  // Sized to match the project dome exactly, so the cards visibly sit on its
  // surface (this is "the sphere") rather than floating separately from a
  // smaller decorative ball.
  const wireframeGeo = useMemo(() => new THREE.IcosahedronGeometry(PROJECT_RADIUS, 2), []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    // A slow continuous idle spin (always some motion, even without
    // scrolling) plus a scroll-linked tilt offset layered on top — turning
    // the page becomes part of the animation instead of a hard snap between
    // discrete "active" states.
    groupRef.current.rotation.y += delta * 0.05;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, scrollTiltRef.current, 0.06);
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[4, 4, 6]} intensity={1.2} color={ACCENT} />
      <pointLight position={[-4, -2, 4]} intensity={0.4} color={SIGNAL} />

      {/* Structural wireframe cage — sized to match the project dome
          exactly, so the cards visibly sit on its surface. Also ties
          visually to the orbit-ring language already used in the
          homepage's solar system. */}
      <mesh geometry={wireframeGeo}>
        <meshBasicMaterial color={ACCENT} wireframe transparent opacity={0.22} />
      </mesh>

      {/* Dense, warm, fast-spinning core — the innermost layer of texture. */}
      <DecorativeShell count={12} radius={CORE_RADIUS} color={ACCENT} size={0.05} speed={0.16} opacity={0.55} />

      {/* Sparse, cool, slow-spinning outer shell, turning the opposite
          direction from the core for parallax contrast. */}
      <DecorativeShell count={16} radius={OUTER_RADIUS} color={SIGNAL} size={0.045} speed={-0.06} opacity={0.35} />

      {/* The real featured-project cards, all visible at once on their own
          forward-facing dome. */}
      <group ref={groupRef}>
        {projects.map((project, i) => (
          <SphereCard key={project.id} project={project} point={points[i]} index={i} onOpenDetails={onOpenDetails} />
        ))}
      </group>
    </>
  );
}

export function ProjectSphere({ projects, onOpenDetails }: ProjectSphereProps) {
  const canRenderWebGL = useCanRenderWebGL();
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTiltRef = useRef(0);
  const points = useMemo(() => domePoints(projects.length, PROJECT_RADIUS), [projects.length]);

  // Scroll no longer snaps to a specific "active" card — every card is
  // visible and directly clickable now, so there's no discrete state to
  // snap between. Instead, how far the section has scrolled through the
  // viewport drives a gentle tilt on the whole dome (see SphereScene),
  // read via a plain ref rather than React state so scrolling never
  // triggers a re-render here at all.
  //
  // rAF-throttled regardless: the homepage's own wheel-driven "magnetic"
  // section paging (ScrollExperience) animates scroll with ~60
  // window.scrollTo() calls/second during a jump, each firing a native
  // scroll event, and reacting to every single one of those (uncapped) was
  // the actual trigger for "THREE.WebGLRenderer: Context Lost" crashes
  // reproduced live earlier — enough simultaneous main-thread work to blow
  // through the GPU process's watchdog.
  useEffect(() => {
    let ticking = false;

    const updateTilt = () => {
      if (!containerRef.current) {
        ticking = false;
        return;
      }
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalDist = windowHeight + rect.height;
      const currentDist = windowHeight - rect.top;
      const scrollRatio = Math.max(0, Math.min(1, currentDist / totalDist));
      scrollTiltRef.current = (scrollRatio - 0.5) * 0.35;
      ticking = false;
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateTilt);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateTilt();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <div ref={containerRef} className="relative w-full flex flex-col items-center select-none">
      <div className="project-sphere-canvas">
        <Canvas
          camera={{ position: [0, 0.8, 8.2], fov: 42 }}
          dpr={1}
          gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
        >
          <SphereScene projects={projects} points={points} scrollTiltRef={scrollTiltRef} onOpenDetails={onOpenDetails} />
        </Canvas>
      </div>
    </div>
  );
}
