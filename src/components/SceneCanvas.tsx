"use client";

import { Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { forwardRef, type ReactElement, type Ref, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const palette = {
  teal: "#38edf8",
  amber: "#ffb703",
  coral: "#ef6f6c",
  grass: "#7fb069",
  plum: "#a855f7",
  cyanGlow: "#38edf8",
  cityGold: "#ffb703",
};

function readProgress() {
  if (typeof window === "undefined") return 0;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max <= 0 ? 0 : THREE.MathUtils.clamp(window.scrollY / max, 0, 1);
}

function latLonToVector(lat: number, lon: number, radius = 1.5) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

let cachedEarthMap: THREE.CanvasTexture | null = null;
let cachedCloudMap: THREE.CanvasTexture | null = null;

function getEarthTextures() {
  if (cachedEarthMap && cachedCloudMap) {
    return { earthMap: cachedEarthMap, cloudMap: cachedCloudMap };
  }
  if (typeof document === "undefined") {
    return { earthMap: null, cloudMap: null };
  }

  // Earth Map Canvas
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { earthMap: null, cloudMap: null };

  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
  oceanGrad.addColorStop(0, "#061224");
  oceanGrad.addColorStop(0.5, "#0b2847");
  oceanGrad.addColorStop(1, "#040b18");
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 1024, 512);

  const toXY = (lat: number, lon: number): [number, number] => [
    ((lon + 180) / 360) * 1024,
    ((90 - lat) / 180) * 512,
  ];

  const drawLand = (coords: [number, number][], landColor: string, coastColor: string) => {
    if (coords.length === 0) return;
    ctx.beginPath();
    const [startX, startY] = toXY(coords[0][0], coords[0][1]);
    ctx.moveTo(startX, startY);
    for (let i = 1; i < coords.length; i++) {
      const [px, py] = toXY(coords[i][0], coords[i][1]);
      ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = landColor;
    ctx.fill();
    ctx.strokeStyle = coastColor;
    ctx.lineWidth = 2.0;
    ctx.stroke();
  };

  drawLand([[72, -168], [74, -130], [62, -100], [58, -75], [45, -60], [25, -80], [15, -92], [14, -105], [30, -118], [55, -135], [65, -168]], "#2d6a4f", "#52b788");
  drawLand([[12, -75], [6, -50], [-10, -36], [-30, -48], [-54, -68], [-46, -75], [-5, -80]], "#1b4332", "#40916c");
  drawLand([[71, 10], [72, 70], [74, 135], [62, 172], [48, 140], [35, 120], [22, 115], [10, 105], [20, 85], [10, 75], [24, 65], [12, 45], [30, 32], [42, 28], [58, 24], [62, 8]], "#2d6a4f", "#74c69d");
  drawLand([[32, 68], [28, 88], [22, 90], [15, 80], [8, 77], [13, 74], [20, 70]], "#40916c", "#95d5b2");
  drawLand([[35, -6], [37, 10], [32, 32], [12, 43], [10, 51], [-12, 40], [-34, 20], [-31, 16], [0, 9], [5, -4], [15, -17]], "#b79455", "#d4a373");
  drawLand([[-12, 131], [-14, 142], [-25, 153], [-38, 145], [-32, 115], [-20, 114]], "#d4a373", "#faedcd");
  drawLand([[82, -42], [80, -18], [68, -24], [60, -45], [70, -55]], "#e0f2fe", "#ffffff");
  drawLand([[-72, -180], [-68, -120], [-70, -60], [-68, 0], [-66, 60], [-65, 120], [-72, 180]], "#f8fafc", "#ffffff");

  // Golden City Lights
  ctx.shadowColor = "#ffb703";
  ctx.shadowBlur = 8;
  ctx.fillStyle = "#ffb703";
  [[13.08, 80.27], [19.07, 72.87], [28.61, 77.20], [37.77, -122.42], [40.71, -74.00], [51.50, -0.12], [35.68, 139.69], [1.35, 103.82]].forEach(([lat, lon]) => {
    const [cx, cy] = toXY(lat, lon);
    ctx.beginPath();
    ctx.arc(cx, cy, 3.8, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;

  cachedEarthMap = new THREE.CanvasTexture(canvas);
  cachedEarthMap.wrapS = THREE.RepeatWrapping;

  // Cloud Map Canvas
  const cloudCanvas = document.createElement("canvas");
  cloudCanvas.width = 512;
  cloudCanvas.height = 256;
  const cloudCtx = cloudCanvas.getContext("2d");
  if (cloudCtx) {
    cloudCtx.fillStyle = "rgba(0, 0, 0, 0)";
    cloudCtx.fillRect(0, 0, 512, 256);
    cloudCtx.fillStyle = "rgba(255, 255, 255, 0.45)";
    cloudCtx.shadowColor = "rgba(255, 255, 255, 0.8)";
    cloudCtx.shadowBlur = 6;
    for (let i = 0; i < 28; i++) {
      const y = 30 + Math.random() * 196;
      const x = Math.random() * 512;
      cloudCtx.beginPath();
      cloudCtx.ellipse(x, y, 40 + Math.random() * 60, 10 + Math.random() * 15, 0, 0, Math.PI * 2);
      cloudCtx.fill();
    }
  }
  cachedCloudMap = new THREE.CanvasTexture(cloudCanvas);
  cachedCloudMap.wrapS = THREE.RepeatWrapping;

  return { earthMap: cachedEarthMap, cloudMap: cachedCloudMap };
}

export function SceneCanvas() {
  const [canRenderWebGL, setCanRenderWebGL] = useState<boolean | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setCanRenderWebGL(Boolean(context) && !reducedMotion);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  // Listen to theme changes on <html> attribute
  useEffect(() => {
    const checkTheme = () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      setIsDark(currentTheme === "dark");
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => observer.disconnect();
  }, []);

  if (!canRenderWebGL) {
    return <FallbackScene />;
  }

  return (
    <div className="scene-canvas">
      <Canvas
        camera={{ position: [0, 0.25, 7.5], fov: 46 }}
        dpr={1}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={[isDark ? "#02040a" : "#f8f1e5"]} />
        <ambientLight intensity={isDark ? 0.65 : 0.9} />
        <directionalLight position={[4, 4, 4]} intensity={isDark ? 2.8 : 2.4} color={isDark ? "#e2e8f0" : "#ffffff"} />
        <directionalLight position={[-3, -2, -2]} intensity={isDark ? 1.2 : 0.7} color="#38edf8" />
        
        {/* Rich Twinkling Starfield in Dark Mode */}
        <Stars
          radius={isDark ? 80 : 60}
          depth={isDark ? 40 : 20}
          count={isDark ? 1200 : 300}
          factor={isDark ? 4.5 : 2.5}
          saturation={isDark ? 0.8 : 0.4}
          fade
          speed={isDark ? 0.2 : 0.08}
        />

        <EvolutionAtlas />
      </Canvas>
    </div>
  );
}

function FallbackScene() {
  return (
    <div className="scene-canvas fallback-scene" aria-hidden="true">
      <div className="fallback-globe">
        <span className="fallback-land fallback-land-eurasia" />
        <span className="fallback-land fallback-land-americas" />
      </div>
    </div>
  );
}

function EvolutionAtlas() {
  const root = useRef<THREE.Group>(null);
  const core = useRef<THREE.Group>(null);
  const origin = useRef<THREE.Group>(null);
  const skills = useRef<THREE.Group>(null);
  const projects = useRef<THREE.Group>(null);

  useFrame(({ camera, clock }) => {
    const progress = readProgress();
    const t = clock.elapsedTime;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, Math.sin(progress * Math.PI * 1.1) * 2.0, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.2 + progress * 1.1, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 7.5 - progress * 2.8, 0.05);
    camera.lookAt(-0.1, progress * 0.25, 0);

    if (root.current) {
      root.current.rotation.y = t * 0.02 + progress * Math.PI * 0.5;
    }

    if (core.current) {
      const settle = THREE.MathUtils.smoothstep(progress, 0.0, 0.3);
      core.current.position.x = THREE.MathUtils.lerp(1.6, -1.3, settle);
      core.current.scale.setScalar(THREE.MathUtils.lerp(1.1, 0.65, settle));
      core.current.rotation.y = t * 0.12;
    }

    if (origin.current) {
      const stage = THREE.MathUtils.smoothstep(progress, 0.15, 0.4);
      origin.current.scale.setScalar(0.4 + stage * 0.8);
      origin.current.position.x = THREE.MathUtils.lerp(2.2, 0.7, stage);
    }

    if (skills.current) {
      const stage = THREE.MathUtils.smoothstep(progress, 0.35, 0.65);
      skills.current.scale.setScalar(0.3 + stage * 0.9);
      skills.current.position.x = THREE.MathUtils.lerp(-3.0, 1.1, stage);
      skills.current.rotation.y = t * 0.06;
    }

    if (projects.current) {
      const stage = THREE.MathUtils.smoothstep(progress, 0.6, 0.95);
      projects.current.scale.setScalar(0.3 + stage * 0.85);
      projects.current.position.x = THREE.MathUtils.lerp(3.0, -0.9, stage);
      projects.current.rotation.y = t * 0.08;
    }
  });

  return (
    <group ref={root}>
      <WorldCore ref={core} />
      <KnowledgeHelix ref={origin} />
      <NeuralCore ref={skills} />
      <ProjectConsole ref={projects} />
    </group>
  );
}

// 1. Realistic Earth Globe
const WorldCore = ReactForwardGroup(function WorldCore(_, ref) {
  const cloudRef = useRef<THREE.Mesh>(null);
  const textures = useMemo(() => getEarthTextures(), []);

  useFrame((_, delta) => {
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.025;
    }
  });

  return (
    <group ref={ref} position={[1.6, 0, 0]}>
      {/* Earth Sphere */}
      <mesh>
        <sphereGeometry args={[1.5, 36, 36]} />
        <meshStandardMaterial
          map={textures.earthMap ?? undefined}
          roughness={0.55}
          metalness={0.15}
        />
      </mesh>

      {/* Cloud Layer */}
      <mesh ref={cloudRef}>
        <sphereGeometry args={[1.525, 36, 36]} />
        <meshStandardMaterial
          map={textures.cloudMap ?? undefined}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>

      {/* Atmospheric Rim Glow */}
      <mesh>
        <sphereGeometry args={[1.55, 24, 24]} />
        <meshBasicMaterial
          color={palette.cyanGlow}
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Chennai Origin Beacon */}
      <mesh position={latLonToVector(13.08, 80.27, 1.52)}>
        <sphereGeometry args={[0.045, 10, 10]} />
        <meshBasicMaterial color={palette.cityGold} />
      </mesh>
    </group>
  );
});

// 2. Knowledge Milestone Helix
const KnowledgeHelix = ReactForwardGroup(function KnowledgeHelix(_, ref) {
  const milestones = [
    { label: "Foundations", pos: [0, -0.9, 0] as const, color: palette.teal },
    { label: "Systems Entry", pos: [0.6, -0.3, 0.4] as const, color: palette.amber },
    { label: "AI Practice", pos: [-0.6, 0.3, -0.3] as const, color: palette.coral },
    { label: "Leadership", pos: [0, 0.9, 0] as const, color: palette.grass },
  ];

  return (
    <group ref={ref} position={[2.2, 0, 0]} scale={0.4}>
      {milestones.map((m, idx) => (
        <group key={idx} position={m.pos}>
          <mesh>
            <octahedronGeometry args={[0.24, 0]} />
            <meshStandardMaterial color={m.color} emissive={m.color} emissiveIntensity={0.4} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
});

// 3. Neural Skill Core
const NeuralCore = ReactForwardGroup(function NeuralCore(_, ref) {
  return (
    <group ref={ref} position={[-3.0, 0, 0]} scale={0.4}>
      <mesh>
        <icosahedronGeometry args={[0.45, 1]} />
        <meshStandardMaterial color={palette.teal} emissive={palette.cyanGlow} emissiveIntensity={0.5} wireframe />
      </mesh>
    </group>
  );
});

// 4. Sleek Project 3D Hologram Console
const ProjectConsole = ReactForwardGroup(function ProjectConsole(_, ref) {
  return (
    <group ref={ref} position={[3.0, 0, 0]} scale={0.4}>
      <mesh>
        <boxGeometry args={[0.9, 0.6, 0.08]} />
        <meshStandardMaterial color="#fff5df" emissive={palette.amber} emissiveIntensity={0.3} transparent opacity={0.8} />
      </mesh>
      <mesh scale={[1.02, 1.02, 1.02]}>
        <boxGeometry args={[0.9, 0.6, 0.08]} />
        <meshBasicMaterial color={palette.amber} wireframe transparent opacity={0.4} />
      </mesh>
    </group>
  );
});

function ReactForwardGroup(render: (props: object, ref: Ref<THREE.Group>) => ReactElement) {
  return forwardRef<THREE.Group, object>(render);
}
