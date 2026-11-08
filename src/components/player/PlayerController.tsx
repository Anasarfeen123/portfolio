"use client";

import { useFrame } from "@react-three/fiber";
import { CapsuleCollider, RigidBody, useRapier, type RapierRigidBody } from "@react-three/rapier";
import { useEffect, useRef, useState, type MutableRefObject, type RefObject } from "react";
import * as THREE from "three";
import { WandererAvatar } from "@/components/player/WandererAvatar";

type CameraAngles = { yaw: number; pitch: number };
type Props = { bodyRef: RefObject<RapierRigidBody | null>; angles: MutableRefObject<CameraAngles>; active: boolean; onNearExhibit: (near: boolean) => void; onGlideChange: (value: boolean) => void };

const held: Record<string, boolean> = {};
const COYOTE_TIME = 0.12;
const JUMP_BUFFER = 0.14;

export function PlayerController({ bodyRef, angles, active, onNearExhibit, onGlideChange }: Props) {
  const { world, rapier } = useRapier();
  const [gliding, setGliding] = useState(false);
  const facing = useRef(0); const lastGrounded = useRef(-Infinity); const jumpBufferedAt = useRef(-Infinity); const glideRef = useRef(false);

  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => { held[event.code] = true; if (event.code === "Space" && !event.repeat) jumpBufferedAt.current = performance.now() / 1000; if (["Space", "KeyW", "KeyA", "KeyS", "KeyD"].includes(event.code) && document.pointerLockElement) event.preventDefault(); };
    const keyUp = (event: KeyboardEvent) => { held[event.code] = false; };
    window.addEventListener("keydown", keyDown); window.addEventListener("keyup", keyUp);
    return () => { window.removeEventListener("keydown", keyDown); window.removeEventListener("keyup", keyUp); };
  }, []);

  useEffect(() => {
    const mouseMove = (event: MouseEvent) => { if (document.pointerLockElement && active) { angles.current.yaw -= event.movementX * 0.0024; angles.current.pitch = THREE.MathUtils.clamp(angles.current.pitch - event.movementY * 0.0018, -0.42, 0.3); } };
    document.addEventListener("mousemove", mouseMove); return () => document.removeEventListener("mousemove", mouseMove);
  }, [active, angles]);

  useFrame((state, delta) => {
    const body = bodyRef.current; if (!body) return;
    const now = performance.now() / 1000; const position = body.translation(); const velocity = body.linvel();
    const ray = new rapier.Ray({ x: position.x, y: position.y, z: position.z }, { x: 0, y: -1, z: 0 });
    const floorHit = world.castRay(ray, 1.12, true, undefined, undefined, undefined, body);
    const grounded = Boolean(floorHit && floorHit.timeOfImpact <= 1.08 && velocity.y <= 2.1);
    if (grounded) lastGrounded.current = now;
    const canJump = now - lastGrounded.current <= COYOTE_TIME;
    const wantsJump = now - jumpBufferedAt.current <= JUMP_BUFFER;
    let vertical = velocity.y;
    if (active && wantsJump && canJump) { vertical = 7.1; jumpBufferedAt.current = -Infinity; lastGrounded.current = -Infinity; }
    const wantsGlide = active && !grounded && held.Space && now - lastGrounded.current > 0.06 && vertical < 2;
    if (wantsGlide !== glideRef.current) { glideRef.current = wantsGlide; setGliding(wantsGlide); onGlideChange(wantsGlide); }
    if (wantsGlide) vertical = THREE.MathUtils.damp(vertical, -1.15, 5.5, delta);
    if (!active) { body.setLinvel({ x: 0, y: vertical, z: 0 }, true); return; }
    const forward = new THREE.Vector3(Math.sin(angles.current.yaw), 0, Math.cos(angles.current.yaw)); const right = new THREE.Vector3(forward.z, 0, -forward.x); const direction = new THREE.Vector3();
    if (held.KeyW) direction.add(forward); if (held.KeyS) direction.sub(forward); if (held.KeyD) direction.add(right); if (held.KeyA) direction.sub(right); if (direction.lengthSq()) direction.normalize();
    const sprint = held.ShiftLeft || held.ShiftRight; const speed = sprint ? 7.2 : 4.5; const control = grounded ? 16 : wantsGlide ? 6 : 2.4;
    const horizontal = Math.min(1, control * delta); body.setLinvel({ x: THREE.MathUtils.lerp(velocity.x, direction.x * speed, horizontal), y: vertical, z: THREE.MathUtils.lerp(velocity.z, direction.z * speed, horizontal) }, true);
    if (direction.lengthSq()) facing.current = Math.atan2(direction.x, direction.z);
    onNearExhibit(position.x > 1.4 && position.x < 4.8 && position.z > -2 && position.z < 2.4);
  });
  return <RigidBody ref={bodyRef} colliders={false} position={[0, 1.3, 8]} enabledRotations={[false, false, false]} linearDamping={0.8} angularDamping={1} ccd friction={2}><CapsuleCollider args={[0.65, 0.35]} friction={2} restitution={0} /><WandererAvatar gliding={gliding} facing={facing} /></RigidBody>;
}
