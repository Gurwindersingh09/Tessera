import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

interface Scene3DProps {
  progress: number; // 0 to 100
}

// Terracotta tonal palette
const PALETTE = {
  deepRust: '#8C3D1A',
  midTerracotta: '#C4622D',
  amber: '#D9822B',
  softPeach: '#E8B896',
  coreGlow: '#FF6B2B',
  glassTint: '#FFF4EB',
  attenuation: '#C4622D',
};

// 4 Satellite Cube configurations with distinct 3D orbital planes
const SATELLITES = [
  {
    id: 'deep-rust',
    color: PALETTE.deepRust,
    size: 0.62,
    radius: 1.85,
    speed: 0.75,
    phase: 0,
    tiltX: 0.35,
    tiltZ: 0.2,
    spinSpeed: [0.9, 0.7, 0.4] as [number, number, number],
  },
  {
    id: 'mid-terracotta',
    color: PALETTE.midTerracotta,
    size: 0.54,
    radius: 2.15,
    speed: -0.85,
    phase: Math.PI * 0.5,
    tiltX: -0.4,
    tiltZ: -0.3,
    spinSpeed: [-0.6, 1.1, 0.7] as [number, number, number],
  },
  {
    id: 'amber',
    color: PALETTE.amber,
    size: 0.48,
    radius: 1.95,
    speed: 0.95,
    phase: Math.PI * 1.05,
    tiltX: 0.75,
    tiltZ: -0.5,
    spinSpeed: [0.8, -0.5, 1.0] as [number, number, number],
  },
  {
    id: 'soft-peach',
    color: PALETTE.softPeach,
    size: 0.42,
    radius: 2.3,
    speed: -0.7,
    phase: Math.PI * 1.55,
    tiltX: -0.65,
    tiltZ: 0.6,
    spinSpeed: [-0.7, 0.8, -0.6] as [number, number, number],
  },
];

// Inner Glowing Core (Polyhedron inside glass)
const InnerCore: React.FC<{ progress: number }> = ({ progress }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowIntensity = useMemo(() => 1.0 + (progress / 100) * 2.2, [progress]);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      const speedMult = 1 + (progress / 100) * 0.8;
      meshRef.current.rotation.x = t * 0.8 * speedMult;
      meshRef.current.rotation.y = t * 1.2 * speedMult;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial
          color={PALETTE.coreGlow}
          emissive={PALETTE.coreGlow}
          emissiveIntensity={glowIntensity}
          roughness={0.15}
          metalness={0.85}
        />
      </mesh>
      <mesh scale={1.1}>
        <octahedronGeometry args={[0.45, 0]} />
        <meshBasicMaterial
          color="#FFE8D9"
          wireframe
          transparent
          opacity={0.35 + (progress / 100) * 0.45}
        />
      </mesh>
    </group>
  );
};

// Central Translucent / Physical Glass Cube (High-performance 60fps glass transmission)
const CentralGlassCube: React.FC<{ progress: number }> = ({ progress }) => {
  const cubeRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (cubeRef.current) {
      const t = state.clock.getElapsedTime();
      const speedMult = 1 + (progress / 100) * 0.6;
      cubeRef.current.rotation.y = t * 0.22 * speedMult;
      cubeRef.current.rotation.x = Math.sin(t * 0.3) * 0.12 * speedMult;
    }
  });

  return (
    <group ref={cubeRef}>
      {/* Physical Glass Material with high-efficiency transmission & refraction */}
      <RoundedBox args={[1.5, 1.5, 1.5]} radius={0.06} smoothness={4}>
        <meshPhysicalMaterial
          color={PALETTE.glassTint}
          transmission={0.93}
          opacity={1}
          transparent
          roughness={0.04}
          ior={1.5}
          thickness={1.25}
          specularIntensity={1.0}
          specularColor="#FFFFFF"
          clearcoat={1.0}
          clearcoatRoughness={0.04}
          attenuationColor={PALETTE.attenuation}
          attenuationDistance={1.2}
          reflectivity={0.9}
        />
      </RoundedBox>

      {/* Glass bevel wireframe highlight */}
      <RoundedBox args={[1.505, 1.505, 1.505]} radius={0.06} smoothness={4}>
        <meshBasicMaterial
          color="#E8B896"
          wireframe
          transparent
          opacity={0.15 + (progress / 100) * 0.2}
        />
      </RoundedBox>

      {/* Inner Glowing Crystal Core */}
      <InnerCore progress={progress} />
    </group>
  );
};

// Individual Orbiting Satellite Cube
const OrbitingCube: React.FC<{
  config: typeof SATELLITES[0];
  progress: number;
}> = ({ config, progress }) => {
  const meshRef = useRef<THREE.Group>(null);
  const emissiveFactor = useMemo(() => 0.45 + (progress / 100) * 1.2, [progress]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const t = state.clock.getElapsedTime();
    // Speed multiplier scales up smoothly as progress advances toward 100%
    const speedMult = 1 + (progress / 100) * 0.75;
    const currentT = t * config.speed * speedMult + config.phase;

    // Slight radius contraction at high progress to show data convergence
    const convergenceFactor = THREE.MathUtils.lerp(1.0, 0.88, progress / 100);
    const effectiveRadius = config.radius * convergenceFactor;

    // 3D Orbital Trajectory
    const x = Math.cos(currentT) * effectiveRadius;
    const z = Math.sin(currentT) * effectiveRadius;
    const y = Math.sin(currentT * 1.5) * (0.42 * effectiveRadius);

    // Apply tilt matrix rotation
    const pos = new THREE.Vector3(x, y, z);
    pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), config.tiltX);
    pos.applyAxisAngle(new THREE.Vector3(0, 0, 1), config.tiltZ);

    meshRef.current.position.copy(pos);

    // Independent axial spin
    meshRef.current.rotation.x = t * config.spinSpeed[0] * speedMult;
    meshRef.current.rotation.y = t * config.spinSpeed[1] * speedMult;
    meshRef.current.rotation.z = t * config.spinSpeed[2] * speedMult;
  });

  return (
    <group ref={meshRef}>
      <RoundedBox args={[config.size, config.size, config.size]} radius={0.04} smoothness={4}>
        <meshPhysicalMaterial
          color={config.color}
          emissive={config.color}
          emissiveIntensity={emissiveFactor}
          metalness={0.82}
          roughness={0.16}
          clearcoat={1.0}
          clearcoatRoughness={0.06}
          reflectivity={0.95}
        />
      </RoundedBox>

      {/* Delicate luminous edge highlight */}
      <RoundedBox args={[config.size * 1.015, config.size * 1.015, config.size * 1.015]} radius={0.04} smoothness={4}>
        <meshBasicMaterial
          color="#FFF0E5"
          wireframe
          transparent
          opacity={0.18 + (progress / 100) * 0.28}
        />
      </RoundedBox>
    </group>
  );
};

// Cube Cluster with Global Synchronized Time and Smooth Rotation
const CubeCluster: React.FC<{ progress: number }> = ({ progress }) => {
  const clusterRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const speedMult = 1 + (progress / 100) * 0.65;

    if (clusterRef.current) {
      clusterRef.current.rotation.y = t * 0.32 * speedMult;
      clusterRef.current.rotation.x = Math.sin(t * 0.35) * 0.14;
      clusterRef.current.rotation.z = Math.cos(t * 0.25) * 0.09;
    }
  });

  return (
    <group ref={clusterRef}>
      {/* Central Glass Core */}
      <CentralGlassCube progress={progress} />

      {/* 4 Orbiting & Interlocking Terracotta Satellite Cubes */}
      {SATELLITES.map((config) => (
        <OrbitingCube
          key={config.id}
          config={config}
          progress={progress}
        />
      ))}
    </group>
  );
};

export const Scene3D: React.FC<Scene3DProps> = ({ progress }) => {
  const pointLightIntensity = 2.4 + (progress / 100) * 3.8;
  const bloomIntensity = 1.25 + (progress / 100) * 0.85;

  return (
    <>
      {/* Scene Lighting Setup */}
      <color attach="background" args={['#0A0705']} />

      <ambientLight color="#2E180E" intensity={1.3} />

      {/* Internal warm core point light */}
      <pointLight
        position={[0, 0, 0]}
        color={PALETTE.coreGlow}
        intensity={pointLightIntensity}
        distance={7}
        decay={2}
      />

      {/* Key Directional Light (Warm White / Peach) */}
      <directionalLight
        position={[5, 6, 6]}
        color="#FFF2E8"
        intensity={2.5}
      />

      {/* Terracotta Fill Light from opposite side */}
      <directionalLight
        position={[-6, -4, -5]}
        color="#C4622D"
        intensity={2.8}
      />

      {/* Subtle Top Accent Light */}
      <directionalLight
        position={[0, 8, -2]}
        color="#D9822B"
        intensity={1.6}
      />

      {/* Main 3D Cluster */}
      <CubeCluster progress={progress} />

      {/* Floating Terracotta Forensic Data Embers */}
      <Sparkles
        count={35}
        scale={6.5}
        size={2.0}
        speed={0.5 + (progress / 100) * 0.5}
        color="#E8B896"
        opacity={0.4 + (progress / 100) * 0.3}
      />
      <Sparkles
        count={25}
        scale={5.0}
        size={2.8}
        speed={0.6 + (progress / 100) * 0.6}
        color="#C4622D"
        opacity={0.5 + (progress / 100) * 0.35}
      />

      {/* Bloom Post-Processing Pass for Luminous Terracotta Glow */}
      <EffectComposer multisampling={0}>
        <Bloom
          luminanceThreshold={0.22}
          luminanceSmoothing={0.9}
          intensity={bloomIntensity}
          radius={0.65}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
};

export default Scene3D;
