import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Float, MeshDistortMaterial, Text } from '@react-three/drei';
import * as THREE from 'three';

const Rig = () => {
  const { camera, mouse } = useThree();
  const target = new THREE.Vector3();

  return useFrame(() => {
    camera.position.lerp(target.set(mouse.x * 0.6, mouse.y * 0.4, 5.5), 0.05);
    camera.lookAt(0, -0.5, 0);
  });
};

const Laptop = () => {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.5) * 0.08;
      group.current.position.y = Math.sin(t * 0.7) * 0.05 - 1.2;
    }
  });

  return (
    <group ref={group} scale={2.2} position={[0, -1.2, 0]} rotation={[0, -0.25, 0]}>
      {/* Base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3, 0.1, 2]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Screen */}
      <group position={[0, 0.05, -1]} rotation={[-Math.PI / 2.5, 0, 0]}>
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[3, 2, 0.08]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
        </mesh>
        {/* Glow Screen */}
        <mesh position={[0, 1, 0.05]}>
          <planeGeometry args={[2.8, 1.8]} />
          <meshBasicMaterial color="#0a0a0a" />
        </mesh>
        {/* Code Lines on Screen */}
        <group position={[-1.2, 1.7, 0.06]}>
          {[...Array(12)].map((_, i) => (
            <mesh key={i} position={[0, -i * 0.15, 0]}>
              <planeGeometry args={[Math.random() * 1.5 + 0.5, 0.07]} />
              <meshBasicMaterial color={i % 3 === 0 ? "#66d9ef" : i % 3 === 1 ? "#e7bc91" : "#a6e22e"} transparent opacity={0.8} />
            </mesh>
          ))}
        </group>
      </group>
      {/* Keyboard area dots */}
      <group position={[0, 0.06, 0]}>
        {[...Array(24)].map((_, i) => (
          <mesh key={i} position={[(i % 6) * 0.35 - 0.85, 0, Math.floor(i / 6) * 0.3 - 0.5]}>
            <boxGeometry args={[0.18, 0.02, 0.18]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        ))}
      </group>
    </group>
  );
};

const CoffeeMug = () => {
  const steamRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (steamRef.current) {
      steamRef.current.children.forEach((child, i) => {
        child.position.y = ((t * 0.4 + i * 0.4) % 1.5);
        child.scale.setScalar(1 - child.position.y / 1.5);
        (child as THREE.Mesh).material.opacity = (1 - child.position.y / 1.5) * 0.4;
        child.position.x = Math.sin(t + i) * 0.12;
      });
    }
  });

  return (
    <group position={[3.8, -1.3, 1]} scale={1.8}>
      {/* Mug Body */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.4, 0.35, 1, 32]} />
        <meshStandardMaterial color="#f5ebe0" roughness={0.2} />
      </mesh>
      {/* Handle */}
      <mesh position={[0.4, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.2, 0.06, 12, 24, Math.PI]} />
        <meshStandardMaterial color="#f5ebe0" roughness={0.2} />
      </mesh>
      {/* Coffee Surface */}
      <mesh position={[0, 0.85, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.35]} />
        <meshStandardMaterial color="#3c2a21" roughness={0.1} />
      </mesh>
      {/* Steam */}
      <group ref={steamRef} position={[0, 1, 0]}>
        {[...Array(4)].map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshBasicMaterial color="#fff" transparent opacity={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

const FloatingIcons = () => {
  const icons = useMemo(() => [
    { pos: [-5, 2.5, -1], color: '#66d9ef', label: 'C++' },
    { pos: [5, 3, -2], color: '#e7bc91', label: 'Python' },
    { pos: [-4.5, -1, 1], color: '#a6e22e', label: 'RL' },
    { pos: [4.5, -0.5, 0.5], color: '#fd971f', label: 'Linux' },
  ], []);

  return (
    <group scale={1.4}>
      {icons.map((icon, i) => (
        <Float key={i} speed={2} rotationIntensity={1} floatIntensity={2}>
          <mesh position={icon.pos as any}>
            <octahedronGeometry args={[0.25]} />
            <meshStandardMaterial color={icon.color} emissive={icon.color} emissiveIntensity={0.5} />
          </mesh>
          <Text
            position={[icon.pos[0], icon.pos[1] - 0.5, icon.pos[2]]}
            fontSize={0.25}
            color={icon.color}
          >
            {icon.label}
          </Text>
        </Float>
      ))}
    </group>
  );
};



const Scene3D: React.FC = () => {
  return (
    <div className="scene-container">
      <Canvas dpr={[1, 1.6]} gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={40} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#66d9ef" />
        <pointLight position={[5, 5, 5]} intensity={1} color="#e7bc91" />
        
        <Laptop />
        <CoffeeMug />
        <FloatingIcons />
        
        {/* Background elements */}
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
          <mesh position={[-4, 0, -4]} rotation={[0, 0.5, 0]}>
            <boxGeometry args={[0.1, 4, 6]} />
            <meshStandardMaterial color="#f5ebe0" transparent opacity={0.1} />
          </mesh>
        </Float>

        <Rig />
      </Canvas>
    </div>
  );
};

export default Scene3D;

