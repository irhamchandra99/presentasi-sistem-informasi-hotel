"use client";

import { Edges } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { PALETTE } from "@/lib/theme";

const INK = new THREE.Color(PALETTE.ink);
const FOREST = new THREE.Color(PALETTE.forest);
const OLIVE = new THREE.Color(PALETTE.olive);
/** Glass: dark forest when unlit, neutral soft white when the room light is on. */
const GLASS_OFF = new THREE.Color(PALETTE.forest);
const GLASS_ON = new THREE.Color(PALETTE.soft);

/** Builds a canvas texture for the hotel sign so no external font file is needed. */
function useSignTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, []);

  useEffect(() => {
    const draw = () => {
      const canvas = texture.image as HTMLCanvasElement;
      const ctx = canvas.getContext("2d")!;
      const family =
        getComputedStyle(document.documentElement).getPropertyValue("--font-barlow").trim() ||
        '"Barlow Condensed", "Arial Narrow", sans-serif';
      ctx.fillStyle = PALETTE.forest;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = PALETTE.white;
      ctx.lineWidth = 4;
      ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);
      ctx.fillStyle = PALETTE.white;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `700 150px ${family}`;
      ctx.fillText("HOTEL", canvas.width / 2, canvas.height / 2 + 10);
      // olive ornaments either side
      ctx.fillStyle = PALETTE.olive;
      [150, canvas.width - 150].forEach((x) => {
        ctx.beginPath();
        ctx.moveTo(x, 98);
        ctx.lineTo(x + 26, 128);
        ctx.lineTo(x, 158);
        ctx.lineTo(x - 26, 128);
        ctx.closePath();
        ctx.fill();
      });
      texture.needsUpdate = true;
    };
    draw();
    // Redraw once the webfont is ready so the sign uses Barlow Condensed.
    document.fonts?.ready.then(draw).catch(() => {});
  }, [texture]);

  return texture;
}

type WindowSpec = { position: THREE.Vector3; rotationY: number };

/** Procedural window grid for the tower faces. */
function useWindowLayout() {
  return useMemo(() => {
    const list: WindowSpec[] = [];
    const floors = 12;
    const floorH = 0.62;
    const baseY = 1.75;
    for (let f = 0; f < floors; f++) {
      for (let c = 0; c < 7; c++) {
        list.push({ position: new THREE.Vector3(-1.62 + c * 0.54, baseY + f * floorH, 1.53), rotationY: 0 });
      }
    }
    for (let f = 0; f < floors; f++) {
      for (let c = 0; c < 5; c++) {
        list.push({ position: new THREE.Vector3(2.03, baseY + f * floorH, -1.1 + c * 0.55), rotationY: Math.PI / 2 });
      }
    }
    for (let f = 0; f < floors; f++) {
      for (let c = 0; c < 5; c++) {
        list.push({ position: new THREE.Vector3(-2.03, baseY + f * floorH, -1.1 + c * 0.55), rotationY: -Math.PI / 2 });
      }
    }
    return list;
  }, []);
}

function Windows({ animate }: { animate: boolean }) {
  const glassRef = useRef<THREE.InstancedMesh>(null);
  const frameRef = useRef<THREE.InstancedMesh>(null);
  const layout = useWindowLayout();
  const count = layout.length;

  const state = useMemo(() => {
    const lit = new Float32Array(count);
    const cur = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      lit[i] = Math.random() < 0.5 ? 1 : 0;
      cur[i] = 0;
    }
    return { lit, cur, timer: 0, intro: 0 };
  }, [count]);

  const tmpColor = useMemo(() => new THREE.Color(), []);

  useEffect(() => {
    const glass = glassRef.current;
    const frame = frameRef.current;
    if (!glass || !frame) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3(1, 1, 1);
    const up = new THREE.Vector3(0, 1, 0);
    layout.forEach((w, i) => {
      q.setFromAxisAngle(up, w.rotationY);
      // Ink frame sits just behind the glass along the face normal.
      const normal = new THREE.Vector3(Math.sin(w.rotationY), 0, Math.cos(w.rotationY));
      m.compose(w.position.clone().addScaledVector(normal, -0.012), q, s);
      frame.setMatrixAt(i, m);
      m.compose(w.position, q, s);
      glass.setMatrixAt(i, m);
      glass.setColorAt(i, GLASS_OFF);
    });
    frame.instanceMatrix.needsUpdate = true;
    glass.instanceMatrix.needsUpdate = true;
    if (glass.instanceColor) glass.instanceColor.needsUpdate = true;
  }, [layout]);

  useFrame((_, delta) => {
    const mesh = glassRef.current;
    if (!mesh) return;
    const dt = Math.min(delta, 0.05);
    if (animate) {
      state.timer += dt;
      if (state.timer > 0.25) {
        state.timer = 0;
        for (let k = 0; k < 2; k++) {
          const i = Math.floor(Math.random() * count);
          state.lit[i] = state.lit[i] > 0.5 ? 0 : 1;
        }
      }
    }
    state.intro = Math.min(1, state.intro + dt * (animate ? 0.45 : 10));
    let dirty = false;
    for (let i = 0; i < count; i++) {
      const floorRatio = (layout[i].position.y - 1.75) / (12 * 0.62);
      const gate = state.intro > floorRatio ? 1 : 0;
      const target = state.lit[i] * gate;
      const next = animate ? THREE.MathUtils.damp(state.cur[i], target, 3, dt) : target;
      if (Math.abs(next - state.cur[i]) > 0.002) {
        state.cur[i] = next;
        tmpColor.copy(GLASS_OFF).lerp(GLASS_ON, next);
        mesh.setColorAt(i, tmpColor);
        dirty = true;
      }
    }
    if (dirty && mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={frameRef} args={[undefined, undefined, count]} frustumCulled={false}>
        <planeGeometry args={[0.42, 0.48]} />
        <meshBasicMaterial color={INK} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={glassRef} args={[undefined, undefined, count]} frustumCulled={false}>
        <planeGeometry args={[0.34, 0.4]} />
        <meshBasicMaterial transparent opacity={0.92} toneMapped={false} />
      </instancedMesh>
    </>
  );
}

/** Low-poly trees placed around the plaza (olive ornaments). */
function Trees() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const positions = useMemo(
    () => [
      [-6.2, 0, 3.2],
      [-7.4, 0, 0.4],
      [-6.6, 0, -2.8],
      [6.2, 0, 3.4],
      [7.3, 0, 0.2],
      [6.7, 0, -3],
      [-4.4, 0, 6.6],
      [4.6, 0, 6.4],
    ],
    [],
  );
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    positions.forEach((p, i) => {
      const s = 0.8 + ((i * 37) % 10) / 25;
      m.compose(new THREE.Vector3(p[0], 1.1 * s, p[2]), new THREE.Quaternion(), new THREE.Vector3(s, s, s));
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [positions]);
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, positions.length]}>
      <coneGeometry args={[0.65, 2.2, 6]} />
      <meshStandardMaterial color={OLIVE} roughness={0.85} flatShading />
    </instancedMesh>
  );
}

/** Lamp posts along the entrance walkway: ink posts, neutral white bulbs. */
function Lamps() {
  const xs = [-2.6, 2.6];
  const zs = [3.6, 5.4, 7.2];
  return (
    <group>
      {xs.flatMap((x) =>
        zs.map((z) => (
          <group key={`${x}-${z}`} position={[x, 0, z]}>
            <mesh position={[0, 0.55, 0]}>
              <cylinderGeometry args={[0.03, 0.04, 1.1, 6]} />
              <meshStandardMaterial color={INK} roughness={0.6} />
            </mesh>
            <mesh position={[0, 1.15, 0]}>
              <sphereGeometry args={[0.09, 12, 12]} />
              <meshBasicMaterial color={PALETTE.white} toneMapped={false} />
            </mesh>
          </group>
        )),
      )}
    </group>
  );
}

/** Box with an ink technical outline (editorial line-drawing look). */
function OutlinedBox({
  args,
  position,
  color,
  roughness = 0.75,
  edge = PALETTE.ink,
}: {
  args: [number, number, number];
  position: [number, number, number];
  color: string;
  roughness?: number;
  edge?: string;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={0} />
      <Edges color={edge} threshold={15} />
    </mesh>
  );
}

export default function HotelModel({ animate }: { animate: boolean }) {
  const signTexture = useSignTexture();

  return (
    <group>
      {/* Plaza ground */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[16, 64]} />
        <meshStandardMaterial color={PALETTE.soft} roughness={0.95} />
      </mesh>
      {/* Walkway */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.005, 5.2]}>
        <planeGeometry args={[3.6, 7]} />
        <meshStandardMaterial color={PALETTE.line} roughness={0.9} />
      </mesh>
      {/* Technical rings on the plaza */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
        <ringGeometry args={[7.9, 7.96, 96]} />
        <meshBasicMaterial color={FOREST} toneMapped={false} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
        <ringGeometry args={[11.4, 11.43, 96]} />
        <meshBasicMaterial color={INK} transparent opacity={0.35} toneMapped={false} />
      </mesh>

      {/* Podium / lobby */}
      <OutlinedBox args={[6.2, 1.4, 4.2]} position={[0, 0.7, 0.3]} color={PALETTE.white} />
      {/* Lobby glass band */}
      <mesh position={[0, 0.65, 2.41]}>
        <planeGeometry args={[5.6, 0.95]} />
        <meshStandardMaterial color={FOREST} roughness={0.25} transparent opacity={0.85} />
      </mesh>
      {/* Entrance door: neutral light */}
      <mesh position={[0, 0.55, 2.43]}>
        <planeGeometry args={[1.1, 1.0]} />
        <meshBasicMaterial color={PALETTE.soft} toneMapped={false} />
      </mesh>
      {/* Canopy (forest detail) */}
      <OutlinedBox args={[2.6, 0.08, 1.4]} position={[0, 1.22, 3.05]} color={PALETTE.forest} roughness={0.5} />
      {[-1.15, 1.15].map((x) => (
        <mesh key={x} position={[x, 0.6, 3.65]}>
          <cylinderGeometry args={[0.035, 0.035, 1.2, 8]} />
          <meshStandardMaterial color={INK} roughness={0.5} />
        </mesh>
      ))}

      {/* Tower */}
      <OutlinedBox args={[4, 7.8, 3]} position={[0, 5.3, 0]} color={PALETTE.white} />
      {/* Vertical forest fins */}
      {[-2.02, -0.67, 0.67, 2.02].map((x) => (
        <mesh key={x} position={[x, 5.3, 1.56]}>
          <boxGeometry args={[0.06, 7.8, 0.08]} />
          <meshStandardMaterial color={FOREST} roughness={0.5} />
        </mesh>
      ))}
      <Windows animate={animate} />

      {/* Crown */}
      <OutlinedBox args={[4.3, 0.3, 3.3]} position={[0, 9.35, 0]} color={PALETTE.forest} roughness={0.5} />
      <mesh position={[0, 9.52, 0]}>
        <boxGeometry args={[4.36, 0.05, 3.36]} />
        <meshStandardMaterial color={INK} roughness={0.5} />
      </mesh>
      <OutlinedBox args={[1.8, 0.9, 1.4]} position={[0, 10.0, -0.3]} color={PALETTE.line} />
      <mesh position={[0, 10.75, -0.3]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.5, 0.03, 8, 48]} />
        <meshStandardMaterial color={OLIVE} roughness={0.5} />
      </mesh>

      {/* Hotel sign */}
      <mesh position={[0, 1.65, 2.44]}>
        <planeGeometry args={[3.2, 0.8]} />
        <meshBasicMaterial map={signTexture} toneMapped={false} />
      </mesh>

      <Lamps />
      <Trees />
    </group>
  );
}
