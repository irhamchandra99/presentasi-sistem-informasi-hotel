"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { PALETTE } from "@/lib/theme";

/** Satin, non-neon materials in the editorial palette. */
const RING_COLORS = [PALETTE.forest, PALETTE.ink, PALETTE.olive, PALETTE.forest, PALETTE.olive];

/** Floating satin rings (forest, olive, ink) that slowly rotate and bob. */
export function FloatingRings({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const rings = useMemo(
    () => [
      { r: 2.6, t: 0.05, pos: [0, 0, 0], rot: [1.1, 0.2, 0], speed: 0.12 },
      { r: 1.8, t: 0.035, pos: [0.4, 0.2, 0.3], rot: [0.4, 1.0, 0.3], speed: -0.18 },
      { r: 3.4, t: 0.02, pos: [-0.2, -0.1, -0.4], rot: [1.4, -0.5, 0.6], speed: 0.08 },
      { r: 1.1, t: 0.05, pos: [2.8, 1.6, -1.2], rot: [0.3, 0.7, 0], speed: 0.25 },
      { r: 0.7, t: 0.04, pos: [-3.0, -1.8, 0.6], rot: [1.2, 0.2, 0.9], speed: -0.3 },
    ],
    [],
  );
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state, delta) => {
    if (!animate) return;
    const t = state.clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (!m) return;
      m.rotation.x += rings[i].speed * delta;
      m.rotation.y += rings[i].speed * 0.6 * delta;
    });
    if (group.current) group.current.position.y = Math.sin(t * 0.5) * 0.15;
  });

  return (
    <group ref={group}>
      {rings.map((r, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={r.pos as [number, number, number]}
          rotation={r.rot as [number, number, number]}
        >
          <torusGeometry args={[r.r, r.t, 16, 120]} />
          <meshStandardMaterial color={RING_COLORS[i]} metalness={0.05} roughness={0.55} />
        </mesh>
      ))}
      <mesh>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshStandardMaterial color={PALETTE.white} roughness={0.6} />
      </mesh>
    </group>
  );
}

/** Abstract architecture: arches, columns and a wire polyhedron. */
export function ArchitecturalGeometry({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const poly = useRef<THREE.Mesh>(null);

  const frames = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        z: -i * 1.6,
        scale: 1 - i * 0.07,
      })),
    [],
  );

  useFrame((state, delta) => {
    if (!animate) return;
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.25 - 0.35;
    }
    if (poly.current) {
      poly.current.rotation.x += delta * 0.15;
      poly.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={group}>
      {frames.map((f, i) => (
        <group key={i} position={[0, 0, f.z]} scale={f.scale}>
          {/* Arch: two columns + top beam + arc */}
          {[-1.7, 1.7].map((x) => (
            <mesh key={x} position={[x, -0.6, 0]}>
              <boxGeometry args={[0.12, 3.2, 0.12]} />
              <meshStandardMaterial color={i === 0 ? PALETTE.forest : PALETTE.ink} roughness={0.6} />
            </mesh>
          ))}
          <mesh position={[0, 1.0, 0]}>
            <torusGeometry args={[1.7, 0.045, 8, 48, Math.PI]} />
            <meshStandardMaterial color={i % 2 === 0 ? PALETTE.forest : PALETTE.olive} roughness={0.55} />
          </mesh>
        </group>
      ))}
      <mesh ref={poly} position={[0, 0.2, 1.6]}>
        <icosahedronGeometry args={[0.85, 0]} />
        <meshBasicMaterial color={PALETTE.ink} wireframe />
      </mesh>
      {/* Floor grid line */}
      <mesh position={[0, -2.2, -4]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[10, 14, 10, 14]} />
        <meshBasicMaterial color={PALETTE.olive} wireframe transparent opacity={0.45} />
      </mesh>
    </group>
  );
}

/** Lightweight drifting particle field (single draw call). */
export function Particles({
  count = 380,
  spread = [26, 14, 18],
  animate,
}: {
  count?: number;
  spread?: [number, number, number];
  animate: boolean;
}) {
  const points = useRef<THREE.Points>(null);
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread[0];
      positions[i * 3 + 1] = Math.random() * spread[1];
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread[2];
      speeds[i] = 0.05 + Math.random() * 0.15;
    }
    return { positions, speeds };
  }, [count, spread]);

  useFrame((_, delta) => {
    if (!animate || !points.current) return;
    const attr = points.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const dt = Math.min(delta, 0.05);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * dt;
      if (arr[i * 3 + 1] > spread[1]) arr[i * 3 + 1] = 0;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={PALETTE.olive} size={0.05} sizeAttenuation transparent opacity={0.45} depthWrite={false} />
    </points>
  );
}
