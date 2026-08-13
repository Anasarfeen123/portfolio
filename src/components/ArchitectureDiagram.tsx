"use client";

import { Html, Line, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import type { Line2, LineSegments2 } from "three-stdlib";
import type { ArchitectureLayer, Project } from "@/data/portfolio";
import { getTechIcon } from "@/lib/tech-icons";

// ProjectDetailsModal is always rendered dark regardless of the site theme
// (its own deliberate "terminal" aesthetic) — --accent/--signal happen to be
// identical in both light and dark globals.css anyway, so these are plain
// constants rather than a runtime theme read.
const ACCENT = "#00e6a8";
const SIGNAL = "#f59e0b";
const PANEL_BG = "rgba(13, 21, 39, 0.94)";
const PANEL_BORDER = "rgba(30, 41, 59, 0.95)";
const LAYER_SPACING = 3.4;

interface ResolvedLayer extends ArchitectureLayer {
  target: THREE.Vector3;
}

/** architectureLayers when set; otherwise one generic layer per `architecture`
 * bullet (every project has this today) — the diagram always has something
 * to show. Technologies already claimed by a specific layer are excluded
 * from the ambient cloud so nothing orbits twice. */
function deriveLayers(project: Project): { layers: ResolvedLayer[]; ambientTech: string[] } {
  const raw: ArchitectureLayer[] =
    project.architectureLayers && project.architectureLayers.length > 0
      ? project.architectureLayers
      : project.architecture.map((bullet, i) => ({ label: `Layer 0${i + 1}`, description: bullet }));

  const mid = (raw.length - 1) / 2;
  const layers: ResolvedLayer[] = raw.map((layer, i) => {
    const offset = i - mid;
    const wave = (i % 2 === 0 ? 1 : -1) * 0.35;
    return { ...layer, target: new THREE.Vector3(offset * LAYER_SPACING, wave, 0) };
  });

  const scoped = new Set(layers.flatMap((l) => l.technologies ?? []));
  const ambientTech = project.technologies.filter((t) => !scoped.has(t));

  return { layers, ambientTech };
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/** 0 -> 1 ease-out over ~1.2s from first frame, or pinned at 1 immediately
 * under reduced motion (no animation at all, just the final layout). */
function useExplodeProgress(paused: boolean): RefObject<number> {
  const progressRef = useRef(paused ? 1 : 0);
  const startRef = useRef<number | null>(null);

  useFrame(({ clock }) => {
    if (paused) return;
    if (startRef.current === null) startRef.current = clock.elapsedTime;
    const elapsed = clock.elapsedTime - startRef.current;
    progressRef.current = THREE.MathUtils.clamp(1 - Math.exp(-elapsed * 2.1), 0, 1);
  });

  return progressRef;
}

// ---- Tech chip texture: real brand icon (simple-icons path + hex) when
// known, a wrapped text label otherwise. Drawn fresh per diagram mount
// rather than cached across mounts — R3F disposes textures on unmount, so a
// module-level cache would hand back a disposed texture on the next open.

function createTechTexture(tech: string): THREE.CanvasTexture {
  const size = 160;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const icon = getTechIcon(tech);

  ctx.fillStyle = PANEL_BG;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PANEL_BORDER;
  ctx.lineWidth = 3;
  ctx.stroke();

  if (icon) {
    const scale = (size * 0.5) / 24; // simple-icons paths use a 24x24 viewBox
    ctx.save();
    ctx.translate(size / 2 - 12 * scale, size / 2 - 12 * scale);
    ctx.scale(scale, scale);
    ctx.fillStyle = icon.hex;
    ctx.fill(new Path2D(icon.path));
    ctx.restore();
  } else {
    ctx.fillStyle = ACCENT;
    ctx.font = "700 15px ui-monospace, SFMono-Regular, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const words = tech.split(" ");
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(test).width > size - 28) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    const shown = lines.slice(0, 3);
    const lineHeight = 17;
    const startY = size / 2 - ((shown.length - 1) * lineHeight) / 2;
    shown.forEach((l, i) => ctx.fillText(l, size / 2, startY + i * lineHeight));
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function TechSprite({
  tech,
  anchor,
  anchorStart,
  progressRef,
  orbitIndex,
  orbitCount,
}: {
  tech: string;
  anchor: THREE.Vector3;
  anchorStart: THREE.Vector3;
  progressRef: RefObject<number>;
  orbitIndex: number;
  orbitCount: number;
}) {
  const texture = useMemo(() => createTechTexture(tech), [tech]);
  const spriteRef = useRef<THREE.Sprite>(null);
  const mountRef = useRef<number | null>(null);
  const baseAngle = (orbitIndex / Math.max(orbitCount, 1)) * Math.PI * 2;
  const orbitRadius = 1.3 + (orbitIndex % 3) * 0.2;

  useFrame(({ clock }) => {
    if (!spriteRef.current) return;
    const progress = progressRef.current;
    const pos = new THREE.Vector3().lerpVectors(anchorStart, anchor, progress);

    if (mountRef.current === null) mountRef.current = clock.elapsedTime;
    const spin = smoothstep(0.75, 1, progress) * (clock.elapsedTime - mountRef.current) * 0.55;
    const angle = baseAngle + spin;
    pos.x += Math.cos(angle) * orbitRadius;
    pos.z += Math.sin(angle) * orbitRadius;
    pos.y += Math.sin(angle * 1.3) * 0.22;

    spriteRef.current.position.copy(pos);
    spriteRef.current.scale.setScalar(0.42 * smoothstep(0.35, 0.7, progress));
  });

  return (
    <sprite ref={spriteRef}>
      <spriteMaterial map={texture} transparent depthWrite={false} />
    </sprite>
  );
}

function LayerPanel({ layer, start, progressRef }: { layer: ResolvedLayer; start: THREE.Vector3; progressRef: RefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.lerpVectors(start, layer.target, progressRef.current);
    groupRef.current.scale.setScalar(0.6 + 0.4 * smoothstep(0.2, 0.6, progressRef.current));
  });

  const technologies = layer.technologies ?? [];

  return (
    <group ref={groupRef}>
      <Html center transform distanceFactor={6} occlude={false} pointerEvents="none">
        <div className="arch-diagram-panel">
          <div className="arch-diagram-panel-label">{layer.label}</div>
          <div className="arch-diagram-panel-desc">{layer.description}</div>
        </div>
      </Html>
      {technologies.map((tech, i) => (
        <TechSprite key={tech} tech={tech} anchor={layer.target} anchorStart={start} progressRef={progressRef} orbitIndex={i} orbitCount={technologies.length} />
      ))}
    </group>
  );
}

function ConnectorLine({ a, b, progressRef }: { a: THREE.Vector3; b: THREE.Vector3; progressRef: RefObject<number> }) {
  const lineRef = useRef<Line2 | LineSegments2>(null);

  useFrame(() => {
    const material = lineRef.current?.material;
    if (!material) return;
    material.opacity = smoothstep(0.65, 1, progressRef.current) * 0.55;
  });

  return <Line ref={lineRef} points={[a, b]} color={ACCENT} lineWidth={1.4} transparent opacity={0} />;
}

function DiagramScene({ project, reducedMotion }: { project: Project; reducedMotion: boolean }) {
  const { layers, ambientTech } = useMemo(() => deriveLayers(project), [project]);
  const progressRef = useExplodeProgress(reducedMotion);
  const collapsedStart = useMemo(() => new THREE.Vector3(0, 0, 1.6), []);
  const ambientAnchor = useMemo(() => new THREE.Vector3(0, -1.7, 0.4), []);
  const { camera } = useThree();

  const [autoRotate, setAutoRotate] = useState(!reducedMotion);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); }, []);

  const distance = useMemo(() => {
    const width = (layers.length - 1) * LAYER_SPACING;
    return THREE.MathUtils.clamp(width * 0.85 + 4.5, 5.5, 13);
  }, [layers.length]);

  useEffect(() => {
    camera.position.set(0, 2, distance);
    camera.lookAt(0, 0, 0);
  }, [camera, distance]);

  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[4, 6, 6]} intensity={1.1} color={ACCENT} />
      <pointLight position={[-4, -3, 4]} intensity={0.5} color={SIGNAL} />

      {layers.map((layer) => (
        <LayerPanel key={layer.label + layer.description} layer={layer} start={collapsedStart} progressRef={progressRef} />
      ))}

      {layers.slice(0, -1).map((layer, i) => (
        <ConnectorLine key={`line-${i}`} a={layer.target} b={layers[i + 1].target} progressRef={progressRef} />
      ))}

      {ambientTech.map((tech, i) => (
        <TechSprite key={tech} tech={tech} anchor={ambientAnchor} anchorStart={collapsedStart} progressRef={progressRef} orbitIndex={i} orbitCount={ambientTech.length} />
      ))}

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={Math.max(3, distance * 0.5)}
        maxDistance={distance * 2}
        maxPolarAngle={Math.PI * 0.85}
        minPolarAngle={Math.PI * 0.15}
        autoRotate={autoRotate}
        autoRotateSpeed={0.6}
        onStart={() => {
          setAutoRotate(false);
          if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        }}
        onEnd={() => {
          if (reducedMotion) return;
          idleTimerRef.current = setTimeout(() => setAutoRotate(true), 2500);
        }}
      />
    </>
  );
}

/** The 3D "exploded" architecture diagram — layer panels connected by lines,
 * tech-stack icons orbiting each layer, mounted by ProjectDetailsModal in
 * place of the old flat text list. Dynamically imported (ssr:false) by the
 * caller; this file assumes it's always running client-side. */
export function ArchitectureDiagram({ project }: { project: Project }) {
  const reducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  return (
    <div className="arch-diagram-canvas">
      <Canvas dpr={1} camera={{ fov: 45 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
        <DiagramScene project={project} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
