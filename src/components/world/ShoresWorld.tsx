"use client";

import Link from "next/link";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Float, Html, Sky } from "@react-three/drei";
import { Physics, RigidBody, useRapier, type RapierRigidBody } from "@react-three/rapier";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { ArrowLeft, Compass, Expand, MousePointer2, Pause, Settings2, X } from "lucide-react";
import { shoresExhibitProject } from "@/game/data/world-content";
import { useWorldUiStore } from "@/game/state/world-store";
import { PlayerController } from "@/components/player/PlayerController";

function FollowCamera({ bodyRef, angles, active }: { bodyRef: RefObject<RapierRigidBody | null>; angles: RefObject<{ yaw: number; pitch: number }>; active: boolean }) {
  const { camera } = useThree(); const { rapier, world } = useRapier(); const target = useMemo(() => new THREE.Vector3(), []); const desired = useMemo(() => new THREE.Vector3(), []); const direction = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, delta) => { const p = bodyRef.current?.translation(); if (!p) return; const yaw = angles.current?.yaw ?? 0; const pitch = angles.current?.pitch ?? 0; target.set(p.x, p.y + 1.05, p.z); desired.set(p.x - Math.sin(yaw) * 6.8, p.y + 2.85 + pitch * 4.2, p.z - Math.cos(yaw) * 6.8); direction.copy(desired).sub(target); const length = direction.length(); direction.normalize(); const hit = world.castRay(new rapier.Ray(target, direction), length, true, undefined, undefined, undefined, bodyRef.current ?? undefined); if (hit) desired.copy(target).addScaledVector(direction, Math.max(1.45, hit.timeOfImpact - 0.38)); const smoothing = active ? 9 : 5; camera.position.lerp(desired, 1 - Math.exp(-delta * smoothing)); camera.lookAt(target); });
  return null;
}

function ShoresEnvironment() {
  const grass = useMemo(() => Array.from({ length: 130 }, (_, i) => ({ x: ((i * 37) % 240) / 10 - 12, z: ((i * 71) % 220) / 10 - 11, s: 0.15 + (i % 4) * 0.05 })), []);
  return <>
    <color attach="background" args={["#9fcbd2"]} /><fog attach="fog" args={["#9fcbd2", 22, 64]} /><Sky sunPosition={[-8, 12, -10]} turbidity={7} rayleigh={2.2} mieCoefficient={0.007} />
    <ambientLight intensity={1.2} color="#d9eef2" /><directionalLight castShadow position={[-12, 16, -10]} intensity={2.1} color="#fff1cc" shadow-mapSize={[1024, 1024]} />
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, 0]}><planeGeometry args={[90, 90]} /><meshStandardMaterial color="#3f9eaa" roughness={0.35} metalness={0.08} /></mesh>
    <Terrain />
    <mesh receiveShadow position={[-7, -0.1, 7]} rotation={[-Math.PI / 2, 0.28, 0]}><circleGeometry args={[7.4, 32]} /><meshStandardMaterial color="#d8bf8e" roughness={1} /></mesh>
    <mesh receiveShadow position={[1.8, 0.08, 3.2]} rotation={[-Math.PI / 2, -0.42, 0]}><planeGeometry args={[2.1, 18]} /><meshStandardMaterial color="#b79b6a" roughness={1} /></mesh>
    {grass.map((blade, index) => <mesh key={index} position={[blade.x, blade.s * .5, blade.z]} rotation={[0, (index * 1.7) % 3, 0]}><coneGeometry args={[blade.s, blade.s * 3, 4]} /><meshStandardMaterial color={index % 3 ? "#5c884b" : "#759b57"} /></mesh>)}
    {[[-4, 0, -4, 1.2], [-10, 0, 1, .8], [8, 0, 5, .9], [7, 0, -7, 1.5]].map(([x, y, z, scale], i) => <mesh castShadow key={i} position={[x, y + scale / 2, z]} rotation={[0.2, i, 0.1]}><dodecahedronGeometry args={[scale, 1]} /><meshStandardMaterial color="#697467" roughness={1} /></mesh>)}
    <Dock /> <Archive /> <SanctuarySilhouette /> <Exhibit /> <ContactShadows position={[0, -0.32, 0]} opacity={0.25} scale={55} blur={2.5} far={12} />
  </>;
}
function Terrain() {
  const geometry = useMemo(() => {
    const terrain = new THREE.PlaneGeometry(34, 30, 28, 24); terrain.rotateX(-Math.PI / 2); const positions = terrain.attributes.position;
    for (let index = 0; index < positions.count; index++) { const x = positions.getX(index); const z = positions.getZ(index); const inland = Math.max(0, -z - 1) * 0.075; const undulation = Math.sin(x * .42 + z * .16) * .09 + Math.cos(z * .55) * .05; positions.setY(index, inland + undulation); }
    positions.needsUpdate = true; terrain.computeVertexNormals(); return terrain;
  }, []);
  return <RigidBody type="fixed" colliders="trimesh" friction={2}><mesh receiveShadow geometry={geometry}><meshStandardMaterial color="#557c4a" roughness={1} flatShading /></mesh></RigidBody>;
}
function Dock() { return <RigidBody type="fixed" colliders="cuboid" position={[-6, .25, 6]}><group>{[0,1,2,3,4].map((i) => <mesh castShadow key={i} position={[0, 0, -i * 1.1]}><boxGeometry args={[2.1, .25, .85]} /><meshStandardMaterial color="#765237" roughness={1} /></mesh>)}{[-.85,.85].flatMap((x) => [0,4].map((z) => <mesh key={`${x}-${z}`} position={[x, -.45, -z * 1.1]}><cylinderGeometry args={[.12,.16,1.2,7]} /><meshStandardMaterial color="#4d382c" /></mesh>))}</group></RigidBody> }
function Archive() { return <RigidBody type="fixed" colliders="cuboid" position={[4, 1.15, 3]}><group><mesh castShadow><boxGeometry args={[4.5,2.3,3.5]} /><meshStandardMaterial color="#a99270" roughness={.95} /></mesh><mesh castShadow position={[0,1.7,0]} rotation={[0,Math.PI/4,0]}><coneGeometry args={[3.2,2.3,4]} /><meshStandardMaterial color="#5b6756" roughness={.95} /></mesh><mesh position={[0,-.35,1.78]}><boxGeometry args={[1.1,1.5,.08]} /><meshStandardMaterial color="#46392f" /></mesh></group></RigidBody> }
function SanctuarySilhouette() { return <group position={[-12, 3, -18]}><Float speed={.35} rotationIntensity={0} floatIntensity={.1}><mesh castShadow><cylinderGeometry args={[3.2,4.7,7,7]} /><meshStandardMaterial color="#6f766d" roughness={1} /></mesh><mesh position={[0,5.6,0]}><coneGeometry args={[3.8,5,7]} /><meshStandardMaterial color="#59635c" roughness={1} /></mesh><mesh position={[0,9,0]}><coneGeometry args={[1.2,3,6]} /><meshStandardMaterial color="#4e5b55" roughness={1} /></mesh></Float></group> }
function Exhibit() { return <group position={[2.8,.25,.1]}><mesh castShadow><cylinderGeometry args={[.85,.98,.5,10]} /><meshStandardMaterial color="#4e625b" roughness={.9} /></mesh><mesh position={[0,.52,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[1.3,.85]} /><meshStandardMaterial color="#d7a34e" emissive="#b76f21" emissiveIntensity={.5} /></mesh><Html position={[0,1.5,0]} center distanceFactor={12}><span className="exhibit-beacon">ROVER</span></Html></group> }

export function ShoresWorld() {
  const bodyRef = useRef<RapierRigidBody>(null); const angles = useRef({ yaw: 0, pitch: 0 }); const [started, setStarted] = useState(false); const [locked, setLocked] = useState(false); const [near, setNear] = useState(false); const [panel, setPanel] = useState(false); const [gliding, setGliding] = useState(false);
  const paused = useWorldUiStore((state) => state.paused); const setPaused = useWorldUiStore((state) => state.setPaused); const highContrast = useWorldUiStore((state) => state.highContrast); const toggleHighContrast = useWorldUiStore((state) => state.toggleHighContrast);
  useEffect(() => { const onLockChange = () => { const isLocked = document.pointerLockElement === document.querySelector("#world-canvas canvas"); setLocked(isLocked); if (started && !isLocked) setPaused(true); }; document.addEventListener("pointerlockchange", onLockChange); return () => document.removeEventListener("pointerlockchange", onLockChange); }, [started, setPaused]);
  useEffect(() => { const interact = (event: KeyboardEvent) => { if (event.code === "KeyE" && near) { document.exitPointerLock(); setPanel(true); } if (event.code === "Escape") { document.exitPointerLock(); setPaused(true); } }; window.addEventListener("keydown", interact); return () => window.removeEventListener("keydown", interact); }, [near, setPaused]);
  const begin = () => { setStarted(true); setPaused(false); document.querySelector<HTMLCanvasElement>("#world-canvas canvas")?.requestPointerLock(); };
  const openExhibit = () => { document.exitPointerLock(); setPanel(true); };
  return <main id="world-canvas" className={`world-root${highContrast ? " world-high-contrast" : ""}`}><Canvas shadows dpr={[1, 1.5]} camera={{ fov: 47, position: [0, 4, 14] }} gl={{ antialias: true, powerPreference: "high-performance" }} onPointerDown={() => started && !paused && document.querySelector<HTMLCanvasElement>("#world-canvas canvas")?.requestPointerLock()}><Physics gravity={[0,-18,0]}><ShoresEnvironment /><PlayerController bodyRef={bodyRef} angles={angles} active={started && !paused && locked} onNearExhibit={setNear} onGlideChange={setGliding} /><FollowCamera bodyRef={bodyRef} angles={angles} active={started && !paused} /></Physics></Canvas>
    <div className="world-vignette" /><header className="world-hud"><div><span className="world-location"><Compass size={15} /> THE SHORES</span><small>South coast · first landing</small></div><Link href="/classic" className="world-exit"><ArrowLeft size={15} /> Classic</Link></header>
    {!started && <section className="world-intro"><p>THE SHORES</p><h1>Follow the tide inland.</h1><span>A compact playable portfolio prototype.</span><button onClick={begin}><MousePointer2 size={17} /> Enter the shore</button><small>WASD move · Shift sprint · Space jump / glide · E interact · Esc release mouse</small></section>}
    {started && !paused && <><div className="world-controls"><span>WASD <b>MOVE</b></span><span>SHIFT <b>SPRINT</b></span><span>SPACE <b>{gliding ? "GLIDING" : "JUMP / GLIDE"}</b></span></div>{near && <button className="world-interact" onClick={openExhibit}><kbd>E</kbd> Inspect the rover workshop</button>}<button className="world-pause" onClick={() => { document.exitPointerLock(); setPaused(true); }} aria-label="Pause exploration"><Pause size={16} /></button></>}
    {paused && started && <section className="world-pause-menu"><p>PAUSED</p><h2>The tide can wait.</h2><button onClick={begin}><Expand size={16} /> Continue exploring</button><Link href="/classic">Open Classic Portfolio</Link><button className="quiet" onClick={toggleHighContrast}><Settings2 size={15} /> {highContrast ? "Standard contrast" : "High contrast"}</button></section>}
    {panel && <section className="project-exhibit-panel" role="dialog" aria-modal="true" aria-label={`${shoresExhibitProject.title} project details`}><button onClick={() => setPanel(false)} aria-label="Close project details"><X size={17} /></button><p>WORKSHOP EXHIBIT</p><h2>{shoresExhibitProject.title}</h2><p>{shoresExhibitProject.problem}</p><div className="exhibit-tech">{shoresExhibitProject.technologies.map((tech) => <span key={tech}>{tech}</span>)}</div>{shoresExhibitProject.image && <img src={shoresExhibitProject.image} alt={`${shoresExhibitProject.title} screenshot`} />}<div className="exhibit-links"><a href={shoresExhibitProject.github} target="_blank" rel="noreferrer">GitHub</a>{shoresExhibitProject.demo && <a href={shoresExhibitProject.demo} target="_blank" rel="noreferrer">Live demo</a>}</div></section>}
  </main>;
}
