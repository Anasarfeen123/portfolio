"use client";

import { Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { forwardRef, type ReactElement, type Ref, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

function readProgress() {
  if (typeof window === "undefined") return 0;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max <= 0 ? 0 : THREE.MathUtils.clamp(window.scrollY / max, 0, 1);
}

function latLonToVector(lat: number, lon: number, radius = 1.0) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Global cached textures for fast loading
let cachedSolarTextures: Record<string, THREE.CanvasTexture> | null = null;

function getSolarTextures() {
  if (cachedSolarTextures) return cachedSolarTextures;
  if (typeof document === "undefined") return {};

  const createTexture = (width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx) draw(ctx);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    return tex;
  };

  // 1. Sun Texture
  const sunTex = createTexture(512, 256, (ctx) => {
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#ffe066");
    grad.addColorStop(0.5, "#ff9900");
    grad.addColorStop(1, "#cc3300");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 256, 10 + Math.random() * 25, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // 2. Mercury Texture
  const mercuryTex = createTexture(256, 128, (ctx) => {
    ctx.fillStyle = "#8a8a8a";
    ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = "#5a5a5a";
    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 256, Math.random() * 128, 2 + Math.random() * 6, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // 3. Venus Texture
  const venusTex = createTexture(256, 128, (ctx) => {
    const grad = ctx.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, "#e6c280");
    grad.addColorStop(0.5, "#d4a359");
    grad.addColorStop(1, "#b8860b");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 128);
  });

  // 4. Earth Texture
  const earthTex = createTexture(1024, 512, (ctx) => {
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

    const drawLand = (coords: [number, number][], landColor: string) => {
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
    };

    drawLand([[72, -168], [74, -130], [62, -100], [58, -75], [45, -60], [25, -80], [15, -92], [14, -105], [30, -118], [55, -135], [65, -168]], "#2d6a4f");
    drawLand([[12, -75], [6, -50], [-10, -36], [-30, -48], [-54, -68], [-46, -75], [-5, -80]], "#1b4332");
    drawLand([[71, 10], [72, 70], [74, 135], [62, 172], [48, 140], [35, 120], [22, 115], [10, 105], [20, 85], [10, 75], [24, 65], [12, 45], [30, 32], [42, 28], [58, 24], [62, 8]], "#2d6a4f");
    drawLand([[32, 68], [28, 88], [22, 90], [15, 80], [8, 77], [13, 74], [20, 70]], "#40916c");
    drawLand([[35, -6], [37, 10], [32, 32], [12, 43], [10, 51], [-12, 40], [-34, 20], [-31, 16], [0, 9], [5, -4], [15, -17]], "#b79455");

    // City Lights
    ctx.shadowColor = "#ffb703";
    ctx.shadowBlur = 6;
    ctx.fillStyle = "#ffb703";
    [[13.08, 80.27], [19.07, 72.87], [28.61, 77.20], [37.77, -122.42], [40.71, -74.00], [51.50, -0.12]].forEach(([lat, lon]) => {
      const [cx, cy] = toXY(lat, lon);
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  // Earth Clouds
  const cloudTex = createTexture(512, 256, (ctx) => {
    ctx.fillStyle = "rgba(0, 0, 0, 0)";
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.ellipse(Math.random() * 512, Math.random() * 256, 40 + Math.random() * 50, 10 + Math.random() * 15, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // 5. Mars Texture
  const marsTex = createTexture(256, 128, (ctx) => {
    const grad = ctx.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, "#c1440e");
    grad.addColorStop(0.5, "#993300");
    grad.addColorStop(1, "#662200");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 256, 10);
  });

  // 6. Jupiter Texture
  const jupiterTex = createTexture(512, 256, (ctx) => {
    for (let y = 0; y < 256; y += 16) {
      ctx.fillStyle = y % 32 === 0 ? "#c87d55" : "#e0a96d";
      ctx.fillRect(0, y, 512, 16);
    }
    // Great Red Spot
    ctx.fillStyle = "#a83232";
    ctx.beginPath();
    ctx.ellipse(350, 160, 30, 18, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // 7. Saturn Texture & Saturn Rings
  const saturnTex = createTexture(256, 128, (ctx) => {
    for (let y = 0; y < 128; y += 12) {
      ctx.fillStyle = y % 24 === 0 ? "#e2c97c" : "#c4ab65";
      ctx.fillRect(0, y, 256, 12);
    }
  });

  const saturnRingTex = createTexture(256, 256, (ctx) => {
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fillRect(0, 0, 256, 256);
    for (let r = 50; r < 120; r += 3) {
      ctx.strokeStyle = r % 6 === 0 ? "rgba(226, 201, 124, 0.7)" : "rgba(196, 171, 101, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(128, 128, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  });

  // 8. Uranus Texture
  const uranusTex = createTexture(256, 128, (ctx) => {
    ctx.fillStyle = "#7de3f4";
    ctx.fillRect(0, 0, 256, 128);
  });

  // 9. Neptune Texture
  const neptuneTex = createTexture(256, 128, (ctx) => {
    ctx.fillStyle = "#274687";
    ctx.fillRect(0, 0, 256, 128);
  });

  cachedSolarTextures = {
    sun: sunTex,
    mercury: mercuryTex,
    venus: venusTex,
    earth: earthTex,
    cloud: cloudTex,
    mars: marsTex,
    jupiter: jupiterTex,
    saturn: saturnTex,
    saturnRing: saturnRingTex,
    uranus: uranusTex,
    neptune: neptuneTex,
  };

  return cachedSolarTextures;
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
        camera={{ position: [0, 2.5, 9.0], fov: 48 }}
        dpr={1}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={[isDark ? "#02040a" : "#f8f1e5"]} />
        <ambientLight intensity={isDark ? 0.6 : 0.85} />
        <pointLight position={[0, 0, 0]} intensity={isDark ? 3.5 : 2.5} color="#ffe066" distance={30} />
        <directionalLight position={[5, 5, 5]} intensity={isDark ? 2.2 : 1.8} color="#ffffff" />
        
        {/* Twinkling Starfield in Space */}
        <Stars
          radius={isDark ? 90 : 70}
          depth={isDark ? 50 : 30}
          count={isDark ? 1400 : 400}
          factor={isDark ? 4.5 : 2.5}
          saturation={isDark ? 0.8 : 0.4}
          fade
          speed={isDark ? 0.2 : 0.08}
        />

        <SolarSystemAtlas />
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

function SolarSystemAtlas() {
  const root = useRef<THREE.Group>(null);
  const sunRef = useRef<THREE.Group>(null);
  const mercuryRef = useRef<THREE.Group>(null);
  const venusRef = useRef<THREE.Group>(null);
  const earthRef = useRef<THREE.Group>(null);
  const marsRef = useRef<THREE.Group>(null);
  const jupiterRef = useRef<THREE.Group>(null);
  const saturnRef = useRef<THREE.Group>(null);

  useFrame(({ camera, clock }) => {
    const progress = readProgress();
    const t = clock.elapsedTime;

    // Smooth camera travel along the solar system scroll path
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, Math.sin(progress * Math.PI * 1.2) * 3.5, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.8 + progress * 1.5, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 9.5 - progress * 4.2, 0.05);
    camera.lookAt(0, progress * 0.4, 0);

    if (root.current) {
      root.current.rotation.y = t * 0.015;
    }

    // Individual Planet Revolutions & Self-Rotations
    if (sunRef.current) sunRef.current.rotation.y = t * 0.05;
    if (mercuryRef.current) mercuryRef.current.rotation.y = t * 0.15;
    if (venusRef.current) venusRef.current.rotation.y = -t * 0.1;
    if (earthRef.current) earthRef.current.rotation.y = t * 0.2;
    if (marsRef.current) marsRef.current.rotation.y = t * 0.18;
    if (jupiterRef.current) jupiterRef.current.rotation.y = t * 0.25;
    if (saturnRef.current) saturnRef.current.rotation.y = t * 0.22;
  });

  return (
    <group ref={root}>
      {/* 1. SUN (Center) */}
      <SunMesh ref={sunRef} />

      {/* Orbital Ring Path Guides */}
      <OrbitRing radius={1.8} />
      <OrbitRing radius={2.8} />
      <OrbitRing radius={4.2} />
      <OrbitRing radius={5.6} />
      <OrbitRing radius={7.5} />
      <OrbitRing radius={9.6} />

      {/* 2. MERCURY */}
      <PlanetMesh ref={mercuryRef} name="mercury" radius={0.16} distance={1.8} speed={0.4} />

      {/* 3. VENUS */}
      <PlanetMesh ref={venusRef} name="venus" radius={0.28} distance={2.8} speed={0.3} />

      {/* 4. EARTH & MOON */}
      <EarthSystem ref={earthRef} distance={4.2} />

      {/* 5. MARS & ASTEROID BELT */}
      <MarsSystem ref={marsRef} distance={5.6} />

      {/* 6. JUPITER */}
      <PlanetMesh ref={jupiterRef} name="jupiter" radius={0.8} distance={7.5} speed={0.12} />

      {/* 7. SATURN WITH 3D RINGS */}
      <SaturnSystem ref={saturnRef} distance={9.6} />
    </group>
  );
}

// --- Orbital Ring Path Line ---
function OrbitRing({ radius }: { radius: number }) {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
    }
    return pts;
  }, [radius]);

  const lineGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <line geometry={lineGeo}>
      <lineBasicMaterial color="#38edf8" transparent opacity={0.12} />
    </line>
  );
}

// --- SUN MESH ---
const SunMesh = ReactForwardGroup(function SunMesh(_, ref) {
  const textures = useMemo(() => getSolarTextures(), []);

  return (
    <group ref={ref} position={[0, 0, 0]}>
      <mesh>
        <sphereGeometry args={[1.1, 32, 32]} />
        <meshBasicMaterial map={textures.sun ?? undefined} color="#ffe066" />
      </mesh>
      {/* Sun Corona Glow */}
      <mesh>
        <sphereGeometry args={[1.25, 24, 24]} />
        <meshBasicMaterial color="#ff9900" transparent opacity={0.25} side={THREE.BackSide} />
      </mesh>
    </group>
  );
});

// --- GENERIC PLANET MESH ---
const PlanetMesh = ReactForwardGroup(function PlanetMesh(
  { name, radius, distance, speed }: { name: string; radius: number; distance: number; speed: number },
  ref
) {
  const textures = useMemo(() => getSolarTextures(), []);
  const tex = textures[name];

  return (
    <group position={[Math.cos(distance * 0.8) * distance, 0, Math.sin(distance * 0.8) * distance]}>
      <group ref={ref}>
        <mesh>
          <sphereGeometry args={[radius, 24, 24]} />
          <meshStandardMaterial map={tex ?? undefined} roughness={0.7} metalness={0.1} />
        </mesh>
      </group>
    </group>
  );
});

// --- EARTH SYSTEM (Oceans, Clouds, Chennai Beacon & Moon) ---
const EarthSystem = ReactForwardGroup(function EarthSystem({ distance }: { distance: number }, ref) {
  const textures = useMemo(() => getSolarTextures(), []);
  const cloudRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.03;
    }
  });

  return (
    <group position={[Math.cos(distance * 0.8) * distance, 0, Math.sin(distance * 0.8) * distance]}>
      <group ref={ref}>
        {/* Earth Globe */}
        <mesh>
          <sphereGeometry args={[0.55, 32, 32]} />
          <meshStandardMaterial map={textures.earth ?? undefined} roughness={0.55} metalness={0.15} />
        </mesh>

        {/* Earth Clouds */}
        <mesh ref={cloudRef}>
          <sphereGeometry args={[0.565, 32, 32]} />
          <meshStandardMaterial map={textures.cloud ?? undefined} transparent opacity={0.4} depthWrite={false} />
        </mesh>

        {/* Chennai Origin Beacon */}
        <mesh position={latLonToVector(13.08, 80.27, 0.56)}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshBasicMaterial color="#ffb703" />
        </mesh>

        {/* Moon Orbit */}
        <group position={[0.9, 0.2, 0]}>
          <mesh>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#c4c4c4" roughness={0.8} />
          </mesh>
        </group>
      </group>
    </group>
  );
});

// --- MARS SYSTEM WITH ASTEROID BELT ---
const MarsSystem = ReactForwardGroup(function MarsSystem({ distance }: { distance: number }, ref) {
  const textures = useMemo(() => getSolarTextures(), []);

  return (
    <group position={[Math.cos(distance * 0.8) * distance, 0, Math.sin(distance * 0.8) * distance]}>
      <group ref={ref}>
        <mesh>
          <sphereGeometry args={[0.38, 24, 24]} />
          <meshStandardMaterial map={textures.mars ?? undefined} roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
});

// --- SATURN SYSTEM WITH 3D RINGS ---
const SaturnSystem = ReactForwardGroup(function SaturnSystem({ distance }: { distance: number }, ref) {
  const textures = useMemo(() => getSolarTextures(), []);

  return (
    <group position={[Math.cos(distance * 0.8) * distance, 0, Math.sin(distance * 0.8) * distance]}>
      <group ref={ref}>
        {/* Saturn Sphere */}
        <mesh>
          <sphereGeometry args={[0.65, 28, 28]} />
          <meshStandardMaterial map={textures.saturn ?? undefined} roughness={0.6} />
        </mesh>

        {/* 3D Saturn Rings */}
        <mesh rotation-x={Math.PI / 2.5}>
          <ringGeometry args={[0.85, 1.45, 32]} />
          <meshBasicMaterial map={textures.saturnRing ?? undefined} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
});

function ReactForwardGroup(render: (props: object, ref: Ref<THREE.Group>) => ReactElement) {
  return forwardRef<THREE.Group, object>(render);
}
