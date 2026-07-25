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

  const sunTex = createTexture(512, 256, (ctx) => {
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#ffe066");
    grad.addColorStop(0.5, "#ff9900");
    grad.addColorStop(1, "#cc3300");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    for (let i = 0; i < 25; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 256, 8 + Math.random() * 20, 0, Math.PI * 2);
      ctx.fill();
    }
  });

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

  const venusTex = createTexture(256, 128, (ctx) => {
    const grad = ctx.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, "#e6c280");
    grad.addColorStop(0.5, "#d4a359");
    grad.addColorStop(1, "#b8860b");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 128);
  });

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

  const jupiterTex = createTexture(512, 256, (ctx) => {
    for (let y = 0; y < 256; y += 16) {
      ctx.fillStyle = y % 32 === 0 ? "#c87d55" : "#e0a96d";
      ctx.fillRect(0, y, 512, 16);
    }
    ctx.fillStyle = "#a83232";
    ctx.beginPath();
    ctx.ellipse(350, 160, 30, 18, 0, 0, Math.PI * 2);
    ctx.fill();
  });

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
      ctx.strokeStyle = r % 6 === 0 ? "rgba(226, 201, 124, 0.75)" : "rgba(196, 171, 101, 0.45)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(128, 128, r, 0, Math.PI * 2);
      ctx.stroke();
    }
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
    <div className="scene-canvas relative">
      <Canvas
        camera={{ position: [0, 2.5, 9.0], fov: 48 }}
        dpr={1}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={[isDark ? "#02040a" : "#fbf7ee"]} />
        <ambientLight intensity={isDark ? 0.65 : 1.15} />
        <pointLight position={[0, 0, 0]} intensity={isDark ? 4.2 : 3.5} color="#d97706" distance={40} />
        <directionalLight position={[6, 6, 6]} intensity={isDark ? 2.5 : 2.2} color="#fffdfa" />
        
        {/* Celestial Starfield / Golden Dust */}
        <Stars
          radius={isDark ? 90 : 75}
          depth={isDark ? 50 : 35}
          count={isDark ? 1500 : 700}
          factor={isDark ? 4.8 : 3.2}
          saturation={isDark ? 0.85 : 0.6}
          fade
          speed={isDark ? 0.35 : 0.15}
        />

        <SolarSystemAtlas isDark={isDark} />
      </Canvas>

      {/* Developer HUD Telemetry Overlay on Canvas */}
      <CanvasHUDTelemetry />
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

function CanvasHUDTelemetry() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 font-mono text-[10px] text-[#38edf8]/40 select-none">
      <div className="flex justify-between items-center">
        <span>SYS_INIT // 0x7FFF</span>
        <span>LAT: 13.08°N LON: 80.27°E</span>
      </div>
      <div className="flex justify-between items-center">
        <span>FRAME_LATENCY: 1.8ms</span>
        <span>NODE: CHENNAI_SOLAR_V2</span>
      </div>
    </div>
  );
}

function SolarSystemAtlas({ isDark }: { isDark: boolean }) {
  const root = useRef<THREE.Group>(null);
  const sunRef = useRef<THREE.Group>(null);
  const mercuryRef = useRef<THREE.Group>(null);
  const venusRef = useRef<THREE.Group>(null);
  const earthRef = useRef<THREE.Group>(null);
  const marsRef = useRef<THREE.Group>(null);
  const jupiterRef = useRef<THREE.Group>(null);
  const saturnRef = useRef<THREE.Group>(null);
  const cometRef = useRef<THREE.Group>(null);

  useFrame(({ camera, clock }) => {
    const progress = readProgress();
    const t = clock.elapsedTime;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, Math.sin(progress * Math.PI * 1.3) * 3.8, 0.06);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.8 + progress * 1.5, 0.06);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 9.5 - progress * 4.5, 0.06);
    camera.lookAt(0, progress * 0.4, 0);

    if (root.current) {
      root.current.rotation.y = t * 0.04;
    }

    if (sunRef.current) sunRef.current.rotation.y = t * 0.12;
    if (mercuryRef.current) mercuryRef.current.rotation.y = t * 0.45;
    if (venusRef.current) venusRef.current.rotation.y = -t * 0.35;
    if (earthRef.current) earthRef.current.rotation.y = t * 0.5;
    if (marsRef.current) marsRef.current.rotation.y = t * 0.45;
    if (jupiterRef.current) jupiterRef.current.rotation.y = t * 0.6;
    if (saturnRef.current) saturnRef.current.rotation.y = t * 0.55;

    if (cometRef.current) {
      const cTime = t * 0.6;
      cometRef.current.position.x = Math.sin(cTime) * 6.5;
      cometRef.current.position.z = Math.cos(cTime * 0.8) * 6.5;
      cometRef.current.position.y = Math.sin(cTime * 1.5) * 1.8;
      cometRef.current.rotation.y = cTime;
    }
  });

  return (
    <group ref={root}>
      {/* 3D Cyber Wireframe Grid Floor */}
      <mesh position={[0, -2.5, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[40, 40, 30, 30]} />
        <meshBasicMaterial color={isDark ? "#38edf8" : "#d97706"} wireframe transparent opacity={isDark ? 0.06 : 0.04} />
      </mesh>

      {/* 1. SUN */}
      <SunMesh ref={sunRef} />

      {/* Orbital Ring Lines */}
      <OrbitRing radius={1.8} />
      <OrbitRing radius={2.8} />
      <OrbitRing radius={4.2} />
      <OrbitRing radius={5.6} />
      <OrbitRing radius={6.5} color="#d97706" />
      <OrbitRing radius={7.6} />
      <OrbitRing radius={9.6} />

      {/* Interplanetary Data Packet Streams */}
      <DataStreamLine from={[0, 0, 0]} to={[4.2, 0, 0]} />
      <DataStreamLine from={[4.2, 0, 0]} to={[5.6, 0, 0]} />
      <DataStreamLine from={[5.6, 0, 0]} to={[9.6, 0, 0]} />

      {/* 2. MERCURY */}
      <PlanetMesh ref={mercuryRef} name="mercury" radius={0.16} distance={1.8} />

      {/* 3. VENUS */}
      <PlanetMesh ref={venusRef} name="venus" radius={0.28} distance={2.8} />

      {/* 4. EARTH & MOON & DEV SATELLITES (CRT Computer & Laptop) */}
      <EarthSystem ref={earthRef} distance={4.2} />

      {/* 5. MARS & MICROCONTROLLER SATELLITE */}
      <MarsSystem ref={marsRef} distance={5.6} />

      {/* 6. 3D ASTEROID BELT */}
      <AsteroidBelt radius={6.5} count={60} />

      {/* 7. JUPITER */}
      <PlanetMesh ref={jupiterRef} name="jupiter" radius={0.82} distance={7.6} />

      {/* 8. SATURN WITH 3D RINGS & PROBE */}
      <SaturnSystem ref={saturnRef} distance={9.6} />

      {/* 9. FAST COMET */}
      <CometMesh ref={cometRef} />
    </group>
  );
}

function DataStreamLine({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const packetRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (packetRef.current) {
      const progress = (clock.elapsedTime * 0.4) % 1;
      packetRef.current.position.x = THREE.MathUtils.lerp(from[0], to[0], progress);
      packetRef.current.position.y = THREE.MathUtils.lerp(from[1], to[1], progress);
      packetRef.current.position.z = THREE.MathUtils.lerp(from[2], to[2], progress);
    }
  });

  return (
    <group>
      <mesh ref={packetRef}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial color="#38edf8" />
      </mesh>
    </group>
  );
}

function OrbitRing({ radius, color = "#38edf8" }: { radius: number; color?: string }) {
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
      <lineBasicMaterial color={color} transparent opacity={0.15} />
    </line>
  );
}

const SunMesh = ReactForwardGroup(function SunMesh(_, ref) {
  const textures = useMemo(() => getSolarTextures(), []);

  return (
    <group ref={ref} position={[0, 0, 0]}>
      <mesh>
        <sphereGeometry args={[1.15, 32, 32]} />
        <meshBasicMaterial map={textures.sun ?? undefined} color="#ffe066" />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.32, 24, 24]} />
        <meshBasicMaterial color="#ff9900" transparent opacity={0.3} side={THREE.BackSide} />
      </mesh>
    </group>
  );
});

const PlanetMesh = ReactForwardGroup(function PlanetMesh(
  { name, radius, distance }: { name: string; radius: number; distance: number },
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

// --- EARTH WITH RETRO CRT COMPUTER & SATELLITES ---
const EarthSystem = ReactForwardGroup(function EarthSystem({ distance }: { distance: number }, ref) {
  const textures = useMemo(() => getSolarTextures(), []);
  const cloudRef = useRef<THREE.Mesh>(null);
  const crtRef = useRef<THREE.Group>(null);
  const laptopRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (cloudRef.current) cloudRef.current.rotation.y += delta * 0.12;
    if (crtRef.current) crtRef.current.rotation.y += delta * 0.7;
    if (laptopRef.current) laptopRef.current.rotation.z += delta * 0.5;
  });

  return (
    <group position={[Math.cos(distance * 0.8) * distance, 0, Math.sin(distance * 0.8) * distance]}>
      <group ref={ref}>
        {/* Earth Globe */}
        <mesh>
          <sphereGeometry args={[0.58, 32, 32]} />
          <meshStandardMaterial map={textures.earth ?? undefined} roughness={0.55} metalness={0.15} />
        </mesh>

        {/* Earth Clouds */}
        <mesh ref={cloudRef}>
          <sphereGeometry args={[0.595, 32, 32]} />
          <meshStandardMaterial map={textures.cloud ?? undefined} transparent opacity={0.45} depthWrite={false} />
        </mesh>

        {/* Chennai Origin Beacon */}
        <mesh position={latLonToVector(13.08, 80.27, 0.59)}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color="#ffb703" />
        </mesh>

        {/* 💻 ORBITING 3D RETRO CRT COMPUTER MONITOR */}
        <group ref={crtRef}>
          <group position={[0.88, 0.2, 0]}>
            {/* Monitor Chassis */}
            <mesh>
              <boxGeometry args={[0.1, 0.08, 0.08]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
            </mesh>
            {/* Glowing Green Terminal Screen */}
            <mesh position={[0, 0, 0.041]}>
              <planeGeometry args={[0.08, 0.06]} />
              <meshBasicMaterial color="#38edf8" />
            </mesh>
            {/* Base Stand */}
            <mesh position={[0, -0.05, 0]}>
              <boxGeometry args={[0.05, 0.02, 0.05]} />
              <meshStandardMaterial color="#94a3b8" />
            </mesh>
          </group>
        </group>

        {/* 💻 ORBITING 3D LAPTOP SATELLITE */}
        <group ref={laptopRef}>
          <group position={[-0.85, -0.2, 0]}>
            {/* Base Keyboard */}
            <mesh>
              <boxGeometry args={[0.09, 0.01, 0.07]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            {/* Screen Lid */}
            <mesh position={[0, 0.04, -0.03]} rotation-x={-0.3}>
              <boxGeometry args={[0.09, 0.07, 0.008]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            {/* Glowing Code Screen */}
            <mesh position={[0, 0.04, -0.025]} rotation-x={-0.3}>
              <planeGeometry args={[0.08, 0.055]} />
              <meshBasicMaterial color="#ffb703" />
            </mesh>
          </group>
        </group>

        {/* Moon */}
        <group position={[1.15, 0.25, 0]}>
          <mesh>
            <sphereGeometry args={[0.14, 16, 16]} />
            <meshStandardMaterial color="#d1d5db" roughness={0.8} />
          </mesh>
        </group>
      </group>
    </group>
  );
});

// --- MARS SYSTEM WITH CIRCUIT BOARD SATELLITE ---
const MarsSystem = ReactForwardGroup(function MarsSystem({ distance }: { distance: number }, ref) {
  const textures = useMemo(() => getSolarTextures(), []);
  const pcbRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (pcbRef.current) pcbRef.current.rotation.y += delta * 0.8;
  });

  return (
    <group position={[Math.cos(distance * 0.8) * distance, 0, Math.sin(distance * 0.8) * distance]}>
      <group ref={ref}>
        {/* Mars Sphere */}
        <mesh>
          <sphereGeometry args={[0.38, 24, 24]} />
          <meshStandardMaterial map={textures.mars ?? undefined} roughness={0.8} />
        </mesh>

        {/* 🤖 ORBITING 3D MICROCONTROLLER / CIRCUIT BOARD */}
        <group ref={pcbRef}>
          <group position={[0.65, 0.15, 0]}>
            {/* Green PCB Board */}
            <mesh>
              <boxGeometry args={[0.12, 0.015, 0.08]} />
              <meshStandardMaterial color="#1b4332" roughness={0.4} />
            </mesh>
            {/* Microchip Processor */}
            <mesh position={[0, 0.01, 0]}>
              <boxGeometry args={[0.04, 0.01, 0.04]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} />
            </mesh>
            {/* Glowing LED Pin */}
            <mesh position={[0.04, 0.012, 0.02]}>
              <sphereGeometry args={[0.012, 6, 6]} />
              <meshBasicMaterial color="#ef6f6c" />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
});

const SaturnSystem = ReactForwardGroup(function SaturnSystem({ distance }: { distance: number }, ref) {
  const textures = useMemo(() => getSolarTextures(), []);
  const probeRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (probeRef.current) {
      probeRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group position={[Math.cos(distance * 0.8) * distance, 0, Math.sin(distance * 0.8) * distance]}>
      <group ref={ref}>
        <mesh>
          <sphereGeometry args={[0.68, 28, 28]} />
          <meshStandardMaterial map={textures.saturn ?? undefined} roughness={0.6} />
        </mesh>

        <mesh rotation-x={Math.PI / 2.5}>
          <ringGeometry args={[0.88, 1.52, 36]} />
          <meshBasicMaterial map={textures.saturnRing ?? undefined} transparent opacity={0.75} side={THREE.DoubleSide} />
        </mesh>

        <group ref={probeRef} position={[1.4, 0.5, 0]}>
          <mesh>
            <coneGeometry args={[0.06, 0.08, 8]} />
            <meshStandardMaterial color="#ffffff" metalness={0.7} />
          </mesh>
        </group>
      </group>
    </group>
  );
});

function AsteroidBelt({ radius, count }: { radius: number; count: number }) {
  const asteroids = useMemo(() => {
    const rocks = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
      const r = radius + (Math.random() - 0.5) * 0.6;
      const y = (Math.random() - 0.5) * 0.3;
      const scale = 0.02 + Math.random() * 0.04;
      rocks.push({ x: Math.cos(angle) * r, y, z: Math.sin(angle) * r, scale });
    }
    return rocks;
  }, [radius, count]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.06;
    }
  });

  return (
    <group ref={groupRef}>
      {asteroids.map((rock, idx) => (
        <mesh key={idx} position={[rock.x, rock.y, rock.z]} scale={rock.scale}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#78716c" roughness={0.9} flatShading />
        </mesh>
      ))}
    </group>
  );
}

const CometMesh = ReactForwardGroup(function CometMesh(_, ref) {
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshBasicMaterial color="#38edf8" />
      </mesh>

      <mesh position={[-0.25, 0, 0]} rotation-z={Math.PI / 2}>
        <coneGeometry args={[0.08, 0.5, 12]} />
        <meshBasicMaterial color="#38edf8" transparent opacity={0.4} />
      </mesh>
    </group>
  );
});

function ReactForwardGroup(render: (props: object, ref: Ref<THREE.Group>) => ReactElement) {
  return forwardRef<THREE.Group, object>(render);
}
