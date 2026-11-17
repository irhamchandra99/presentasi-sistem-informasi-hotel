"use client";

import { ContactShadows } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { SceneMode } from "@/lib/scene";
import { PALETTE } from "@/lib/theme";
import { ArchitecturalGeometry, FloatingRings, Particles } from "./Decor";
import HotelModel from "./HotelModel";

/** World anchors: each composition lives in its own spot so the camera can fly between them. */
const RINGS_ORIGIN = new THREE.Vector3(40, 6, 0);
const GEOMETRY_ORIGIN = new THREE.Vector3(-40, 5, 0);

type Shot = {
  position: THREE.Vector3;
  target: THREE.Vector3;
  orbit: number; // radians of slow orbit swing
  ambient: number;
  key: number;
};

const SHOTS: Record<Exclude<SceneMode, "none">, Shot> = {
  "hotel-cover": {
    position: new THREE.Vector3(13.5, 5.6, 18.5),
    target: new THREE.Vector3(-7.6, 4.9, 0),
    orbit: 0.22,
    ambient: 0.9,
    key: 1.5,
  },
  "hotel-close": {
    position: new THREE.Vector3(-12, 3.4, 18),
    target: new THREE.Vector3(6.2, 4.8, 0),
    orbit: 0.12,
    ambient: 0.8,
    key: 1.4,
  },
  rings: {
    position: RINGS_ORIGIN.clone().add(new THREE.Vector3(0, 0.5, 13)),
    target: RINGS_ORIGIN.clone().add(new THREE.Vector3(-5.2, 0.6, 0)),
    orbit: 0.1,
    ambient: 0.9,
    key: 1.6,
  },
  "rings-alt": {
    position: RINGS_ORIGIN.clone().add(new THREE.Vector3(-1, -1, 24)),
    target: RINGS_ORIGIN.clone().add(new THREE.Vector3(-10.5, -6.2, 0)),
    orbit: 0.08,
    ambient: 0.9,
    key: 1.5,
  },
  geometry: {
    position: GEOMETRY_ORIGIN.clone().add(new THREE.Vector3(1, 0.8, 12)),
    target: GEOMETRY_ORIGIN.clone().add(new THREE.Vector3(-4.6, 0.2, 0)),
    orbit: 0.1,
    ambient: 0.9,
    key: 1.5,
  },
};

function CameraRig({
  mode,
  animate,
  groups,
}: {
  mode: Exclude<SceneMode, "none">;
  animate: boolean;
  groups: {
    hotel: React.RefObject<THREE.Group | null>;
    rings: React.RefObject<THREE.Group | null>;
    geometry: React.RefObject<THREE.Group | null>;
  };
}) {
  const { camera, invalidate } = useThree();
  const target = useRef(SHOTS[mode].target.clone());
  const ambient = useRef<THREE.AmbientLight>(null);
  const keyLight = useRef<THREE.DirectionalLight>(null);
  const first = useRef(true);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  // Reduced motion / first frame: snap directly to the shot.
  useEffect(() => {
    const shot = SHOTS[mode];
    if (!animate || first.current) {
      camera.position.copy(shot.position);
      target.current.copy(shot.target);
      camera.lookAt(target.current);
      first.current = false;
    }
    invalidate();
    const id = requestAnimationFrame(() => invalidate());
    return () => cancelAnimationFrame(id);
  }, [mode, animate, camera, invalidate]);

  useFrame((state, delta) => {
    const shot = SHOTS[mode];
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    // Desired position with a slow orbit around the target's vertical axis.
    tmp.copy(shot.position);
    if (animate && shot.orbit > 0) {
      const pivot = mode.startsWith("hotel")
        ? new THREE.Vector3(0, shot.position.y, 0)
        : new THREE.Vector3(
            mode === "geometry" ? GEOMETRY_ORIGIN.x : RINGS_ORIGIN.x,
            shot.position.y,
            0,
          );
      const angle = Math.sin(t * 0.12) * shot.orbit;
      tmp.sub(pivot).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle).add(pivot);
    }

    if (animate) {
      // Critically damped easing: smooth, never abrupt.
      const lambda = 1.6;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, tmp.x, lambda, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, tmp.y, lambda, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, tmp.z, lambda, dt);
      target.current.x = THREE.MathUtils.damp(target.current.x, shot.target.x, lambda, dt);
      target.current.y = THREE.MathUtils.damp(target.current.y, shot.target.y, lambda, dt);
      target.current.z = THREE.MathUtils.damp(target.current.z, shot.target.z, lambda, dt);
    } else {
      camera.position.copy(tmp);
      target.current.copy(shot.target);
    }
    camera.lookAt(target.current);

    // Eased lighting changes between shots.
    if (ambient.current) {
      ambient.current.intensity = animate
        ? THREE.MathUtils.damp(ambient.current.intensity, shot.ambient, 2, dt)
        : shot.ambient;
    }
    if (keyLight.current) {
      keyLight.current.intensity = animate
        ? THREE.MathUtils.damp(keyLight.current.intensity, shot.key, 2, dt)
        : shot.key;
    }

    // Skip drawing compositions the camera is far away from.
    const cam = camera.position;
    if (groups.hotel.current) groups.hotel.current.visible = cam.distanceTo(new THREE.Vector3(0, 4, 0)) < 34;
    if (groups.rings.current) groups.rings.current.visible = cam.distanceTo(RINGS_ORIGIN) < 34;
    if (groups.geometry.current) groups.geometry.current.visible = cam.distanceTo(GEOMETRY_ORIGIN) < 34;
  });

  return (
    <>
      {/* Neutral, soft lighting: no coloured light at all */}
      <ambientLight ref={ambient} intensity={SHOTS[mode].ambient} color={PALETTE.white} />
      <hemisphereLight args={[PALETTE.white, PALETTE.line, 0.55]} />
      <directionalLight ref={keyLight} position={[10, 16, 12]} intensity={SHOTS[mode].key} color={PALETTE.white} />
      <directionalLight position={[-12, 6, -8]} intensity={0.35} color={PALETTE.white} />
    </>
  );
}

/** Eases a group's scale/position in when its composition becomes active. */
function Entrance({
  active,
  animate,
  children,
  groupRef,
  position,
}: {
  active: boolean;
  animate: boolean;
  children: React.ReactNode;
  groupRef: React.RefObject<THREE.Group | null>;
  position?: THREE.Vector3;
}) {
  const inner = useRef<THREE.Group>(null);
  const progress = useRef(active ? 0 : 0);

  useFrame((_, delta) => {
    if (!inner.current) return;
    const goal = active ? 1 : 0.0001;
    progress.current = animate
      ? THREE.MathUtils.damp(progress.current, goal, 1.8, Math.min(delta, 0.05))
      : goal;
    const p = Math.max(progress.current, 0.0001);
    inner.current.scale.set(1, p, 1);
    inner.current.position.y = (1 - p) * -0.6;
  });

  return (
    <group ref={groupRef} position={position}>
      <group ref={inner}>{children}</group>
    </group>
  );
}

export default function Experience({ mode, animate }: { mode: Exclude<SceneMode, "none">; animate: boolean }) {
  const hotel = useRef<THREE.Group>(null);
  const rings = useRef<THREE.Group>(null);
  const geometry = useRef<THREE.Group>(null);
  const groups = useMemo(() => ({ hotel, rings, geometry }), []);

  const hotelActive = mode === "hotel-cover" || mode === "hotel-close";
  const ringsActive = mode === "rings" || mode === "rings-alt";
  const geometryActive = mode === "geometry";

  return (
    <>
      <fog attach="fog" args={[PALETTE.soft, 22, 60]} />
      <CameraRig mode={mode} animate={animate} groups={groups} />

      <Entrance active={hotelActive} animate={animate} groupRef={hotel}>
        <HotelModel animate={animate && hotelActive} />
        <ContactShadows position={[0, 0.02, 0]} opacity={0.35} scale={18} blur={2.8} far={10} frames={1} color={PALETTE.ink} />
        <Particles animate={animate && hotelActive} count={320} spread={[26, 12, 20]} />
        <pointLight position={[0, 1.6, 4.2]} intensity={3} distance={9} color={PALETTE.white} />
      </Entrance>

      <group ref={rings} position={RINGS_ORIGIN}>
        <FloatingRings animate={animate && ringsActive} />
        <group position={[0, -6, 0]}>
          <Particles animate={animate && ringsActive} count={220} spread={[20, 12, 10]} />
        </group>
      </group>

      <group ref={geometry} position={GEOMETRY_ORIGIN}>
        <ArchitecturalGeometry animate={animate && geometryActive} />
        <group position={[0, -5, 0]}>
          <Particles animate={animate && geometryActive} count={200} spread={[18, 10, 12]} />
        </group>
      </group>
    </>
  );
}
