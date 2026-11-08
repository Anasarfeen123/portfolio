"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type MutableRefObject } from "react";
import * as THREE from "three";

export function WandererAvatar({ gliding, facing }: { gliding: boolean; facing: MutableRefObject<number> }) {
  const cape = useRef<THREE.Mesh>(null);
  const group = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (group.current) group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, facing.current, 11, delta);
    if (cape.current) {
      const flutter = Math.sin(state.clock.elapsedTime * (gliding ? 4.4 : 2.2)) * (gliding ? 0.075 : 0.025);
      cape.current.rotation.x = THREE.MathUtils.damp(cape.current.rotation.x, (gliding ? 0.72 : 0.16) + flutter, 7, delta);
      cape.current.scale.x = THREE.MathUtils.damp(cape.current.scale.x, gliding ? 1.5 : 0.84, 7, delta);
    }
  });
  return <group ref={group}>
    <mesh castShadow position={[0, 1.12, 0]}><capsuleGeometry args={[0.28, 0.72, 8, 16]} /><meshStandardMaterial color="#27423a" roughness={0.92} /></mesh>
    <mesh castShadow position={[0, 1.82, 0]}><sphereGeometry args={[0.42, 18, 14]} /><meshStandardMaterial color="#c48d68" roughness={1} /></mesh>
    <mesh castShadow position={[0, 2.02, 0.03]}><coneGeometry args={[0.52, 0.65, 7]} /><meshStandardMaterial color="#18322d" roughness={0.88} /></mesh>
    <mesh ref={cape} castShadow position={[0, 1.3, 0.27]} rotation={[0.16, 0, 0]}><planeGeometry args={[0.86, 1.22, 4, 4]} /><meshStandardMaterial color="#b8543b" side={THREE.DoubleSide} roughness={0.84} /></mesh>
  </group>;
}
