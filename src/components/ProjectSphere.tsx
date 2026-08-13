"use client";

import { Html } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { ExternalLink, GitFork, Star } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import type { Project } from "@/data/portfolio";
import { GithubIcon } from "@/components/GithubIcon";
import { Revolving3DCarousel } from "@/components/Revolving3DCarousel";
import { useCanRenderWebGL } from "@/hooks/useCanRenderWebGL";
import { useGitHubRepo } from "@/hooks/useGitHubRepo";

const ACCENT = "#e08214";
const SPHERE_RADIUS = 2.4;

interface ProjectSphereProps {
  projects: Project[];
  onOpenDetails: (project: Project) => void;
}

/** Evenly distributes `count` points on a unit sphere (golden-angle spiral —
 * the standard technique for even coverage at any count, no clustering at
 * the poles the way a naive lat/long grid gets). Works well specifically
 * *because* this only ever holds the featured subset (5-8 projects, not all
 * 25) — with that few points, most or all stay visible/legible as the
 * sphere turns, which wouldn't hold at a much larger count. */
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

function angleTo(point: THREE.Vector3) {
  return Math.atan2(point.x, point.z);
}

function shortestAngleDelta(from: number, to: number) {
  let delta = (to - from) % (Math.PI * 2);
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function SphereCard({
  project,
  point,
  index,
  activeIndex,
  setActiveIndex,
  groupRotationRef,
  onOpenDetails,
}: {
  project: Project;
  point: THREE.Vector3;
  index: number;
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  groupRotationRef: RefObject<number>;
  onOpenDetails: (project: Project) => void;
}) {
  const ghStats = useGitHubRepo(project.repoName);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const facingRef = useRef(0);

  useFrame(() => {
    const rot = groupRotationRef.current;
    // Points only ever rotate around Y, so a plain 2D rotation of (x, z) is
    // enough — no quaternion math needed for a single-axis spin.
    const worldZ = -point.x * Math.sin(rot) + point.z * Math.cos(rot);
    const facing = worldZ / SPHERE_RADIUS; // -1 (back of sphere) .. 1 (front, facing camera)
    facingRef.current = facing;

    if (!wrapperRef.current) return;
    const opacity = smoothstep(-0.05, 0.55, facing);
    wrapperRef.current.style.opacity = opacity.toFixed(3);
    wrapperRef.current.style.pointerEvents = facing > 0.15 ? "auto" : "none";
    wrapperRef.current.style.zIndex = String(Math.round(facing * 100));
  });

  const isActive = index === activeIndex;

  return (
    <group position={point}>
      <Html center transform={false} distanceFactor={8} occlude={false} pointerEvents="none">
        <div
          ref={wrapperRef}
          className={`project-sphere-card${isActive ? " project-sphere-card-active" : ""}`}
          style={{ pointerEvents: "none", opacity: 0 }}
          onClick={() => {
            if (isActive) onOpenDetails(project);
            else setActiveIndex(index);
          }}
        >
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
            {isActive ? (
              <span className="project-sphere-card-cta">
                Full details <ExternalLink size={11} />
              </span>
            ) : (
              <span className="project-sphere-card-cta project-sphere-card-cta-muted">Bring to front</span>
            )}
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
      </Html>
    </group>
  );
}

function SphereScene({
  projects,
  points,
  activeIndex,
  setActiveIndex,
  onOpenDetails,
}: {
  projects: Project[];
  points: THREE.Vector3[];
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  onOpenDetails: (project: Project) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const groupRotationRef = useRef(0);
  const wireframeGeo = useMemo(() => new THREE.IcosahedronGeometry(SPHERE_RADIUS * 0.72, 2), []);

  useFrame(() => {
    if (!groupRef.current) return;
    const target = -angleTo(points[activeIndex] ?? points[0]);
    const current = groupRef.current.rotation.y;
    const next = current + shortestAngleDelta(current, target) * 0.08;
    groupRef.current.rotation.y = next;
    groupRotationRef.current = next;
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[4, 4, 6]} intensity={1.2} color={ACCENT} />
      <pointLight position={[-4, -2, 4]} intensity={0.4} color="#5a9c5e" />

      {/* Faint wireframe globe the cards orbit — ties visually to the
          orbit-ring language already used in the homepage's solar system,
          and gives the arrangement a "surface" to read even while cards
          fade in/out at the edges. */}
      <mesh geometry={wireframeGeo}>
        <meshBasicMaterial color={ACCENT} wireframe transparent opacity={0.08} />
      </mesh>

      <group ref={groupRef}>
        {projects.map((project, i) => (
          <SphereCard
            key={project.id}
            project={project}
            point={points[i]}
            index={i}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            groupRotationRef={groupRotationRef}
            onOpenDetails={onOpenDetails}
          />
        ))}
      </group>
    </>
  );
}

export function ProjectSphere({ projects, onOpenDetails }: ProjectSphereProps) {
  const canRenderWebGL = useCanRenderWebGL();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const points = useMemo(() => fibonacciSpherePoints(projects.length, SPHERE_RADIUS), [projects.length]);

  // Same scroll-linked index as the CSS carousel this replaces — scrolling
  // through the section turns the sphere. No free drag-to-rotate on top of
  // that: this page already had one hard-won scroll-conflict bug this
  // session (Lenis vs. native scroll-snap), and a second pointer-capturing
  // surface competing with page scroll isn't worth the risk for a feature
  // that doesn't need it — buttons + scroll cover the interaction fine.
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalDist = windowHeight + rect.height;
      const currentDist = windowHeight - rect.top;
      const scrollRatio = Math.max(0, Math.min(1, currentDist / totalDist));
      const targetIndex = Math.min(projects.length - 1, Math.floor(scrollRatio * projects.length));
      setActiveIndex(targetIndex);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
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
    <div ref={containerRef} className="relative w-full flex flex-col items-center select-none">
      <div className="project-sphere-canvas">
        <Canvas camera={{ position: [0, 0.6, 6.4], fov: 42 }} dpr={1} gl={{ antialias: true, alpha: true }}>
          <SphereScene
            projects={projects}
            points={points}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            onOpenDetails={onOpenDetails}
          />
        </Canvas>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {projects.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`project-sphere-dot${i === activeIndex ? " project-sphere-dot-active" : ""}`}
            aria-label={`Bring project ${i + 1} to front`}
          />
        ))}
      </div>
    </div>
  );
}
