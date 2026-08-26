"use client";

/**
 * Low-poly cottage garden rendered with React Three Fiber.
 * Loaded client-side only (see HeroSceneMount) and layered behind the
 * hero text. The canvas is transparent so the CSS sky shows through,
 * and fog melts the ground edge into the page.
 *
 * Day/night: toggling the theme rotates a sun/moon pivot through the
 * sky while lights, fog, water, and particles ease between palettes.
 */

import { Canvas, useFrame } from "@react-three/fiber";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import * as THREE from "three";
import { subscribeTheme, isNight, isNightServerSnapshot } from "@/lib/theme";
import { setSection, type SectionId } from "@/lib/section";

const C = {
  wall: "#f6ecd9",
  roof: "#c1704e",
  chimney: "#a05a3d",
  door: "#7a5c44",
  window: "#e9c87f",
  trunk: "#7a5c44",
  foliage: "#5a6b45",
  foliageDark: "#3f4d33",
  foliageLight: "#8a9a78",
  ground: "#9dae8a",
  hill: "#b5c2a3",
  stem: "#8a9a78",
  rose: "#d9a3a0",
  butter: "#e9c87f",
  terracotta: "#c1704e",
  smoke: "#f7f2e8",
};

// Day ↔ night endpoints for everything the controller lerps.
const DAY = {
  fog: new THREE.Color("#fbf6ec"),
  ambient: new THREE.Color("#fff6e4"),
  sun: new THREE.Color("#ffe3b0"),
  water: new THREE.Color("#9fc0c5"),
  petal: new THREE.Color("#d9a3a0"),
  glint: new THREE.Color("#ffffff"),
  window: new THREE.Color("#555a63"), // dark glass — lights off by day
  ambientIntensity: 0.75,
  dirIntensity: 1.5,
  hemiIntensity: 0.5,
  windowGlow: 0,
};
const NIGHT = {
  fog: new THREE.Color("#262a3a"),
  ambient: new THREE.Color("#8a93c4"),
  sun: new THREE.Color("#aebbe8"),
  water: new THREE.Color("#39445f"),
  petal: new THREE.Color("#ffe1a1"),
  glint: new THREE.Color("#cdd8f0"),
  window: new THREE.Color("#e9c87f"), // warm candlelight
  ambientIntensity: 0.28,
  dirIntensity: 0.55,
  hemiIntensity: 0.18,
  windowGlow: 1.8,
};

/** Deterministic PRNG so the garden is identical on every visit. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Current day→night phase (0..1), written by the controller each
 * frame and read by the lampposts to fade their lights in after dark.
 */
const phaseState = { value: 0 };

/**
 * River: a Y shape. The right stream emerges in the gap between the
 * hills and sweeps toward the viewer's right; a left branch splits
 * off at the junction and drifts off the left edge of the frame.
 */
const RIVER_START = 0.5;
const RIVER_END = 17.5;
function riverZ(x: number): number {
  const forward = Math.min(4.6, Math.max(0, (x - RIVER_START) * 0.85));
  return -8.4 + forward + Math.sin(x * 0.5) * 0.25;
}
function riverWidth(x: number): number {
  return 1.0 + Math.min(1, (x - RIVER_START) / 6) * 0.6;
}

// Left branch: joins the right stream at the junction (~x 4.5).
const JUNCTION_X = 4.5;
const LEFT_END = -17.5;
function riverZLeft(x: number): number {
  const t = JUNCTION_X - x; // 0 at the junction, grows leftward
  return -4.8 + Math.min(1.6, t * 0.18) + Math.sin(x * 0.4) * 0.2;
}
function riverWidthLeft(x: number): number {
  return 0.8 + Math.min(0.6, (JUNCTION_X - x) * 0.1);
}

/** Idle drift + mouse parallax, eased so it never feels twitchy. */
function CameraRig() {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const cam = state.camera;
    const targetX = Math.sin(t * 0.12) * 0.4 + pointer.current.x * 0.55;
    const targetY = 2.4 + Math.sin(t * 0.08) * 0.12 - pointer.current.y * 0.3;
    cam.position.x += (targetX - cam.position.x) * 0.03;
    cam.position.y += (targetY - cam.position.y) * 0.03;
    cam.lookAt(0.6, 1.0, 0);
  });
  return null;
}

function Ground() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2}>
        <circleGeometry args={[18, 48]} />
        <meshStandardMaterial color={C.ground} />
      </mesh>
      {/* two mounds with a gap between them for the river */}
      <mesh position={[-8, -0.6, -7]} scale={[5.5, 2, 3.5]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color={C.hill} flatShading />
      </mesh>
      <mesh position={[9.5, -0.8, -8.5]} scale={[6, 2.4, 4]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color={C.hill} flatShading />
      </mesh>
    </group>
  );
}

/**
 * The source: a wide body of water filling the gap between the two
 * hills, narrowing as it flows forward into the junction where the
 * left and right branches split. The left boundary reaches toward the
 * left hill but stops at x ≈ -2, leaving a strip of land by the tree
 * that serves as a walkway to the moon bridge.
 */
function MiddleStream({ material }: { material: THREE.MeshStandardMaterial }) {
  const geometry = useMemo(() => {
    const segments = 24;
    const Z_BACK = -10.5;
    const Z_FRONT = -4.3; // overlaps the branch's back bank — no gap
    const vertices: number[] = [];
    const indices: number[] = [];
    for (let i = 0; i <= segments; i++) {
      const z = Z_BACK + (i / segments) * (Z_FRONT - Z_BACK);
      const t = (z - Z_BACK) / (Z_FRONT - Z_BACK); // 0 back → 1 front
      // left edge runs straight down the walkway line; the front edge
      // overlaps the left branch's back bank, merging the two bodies
      const xL = -2.0 + Math.sin(z * 0.9) * 0.08;
      const xR = 4.3 + t * 0.75 + Math.sin(z * 0.7) * 0.1;
      vertices.push(xL, 0.015, z, xR, 0.015, z);
      if (i < segments) {
        const a = i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3),
    );
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return <mesh geometry={geometry} material={material} />;
}

/**
 * A little arched wooden moon bridge crossing the left branch behind
 * the house, connecting the lawn to the walkway strip.
 */
function MoonBridge({ position }: { position: [number, number, number] }) {
  const PLANKS = 11;
  const SPAN = 2.2;
  const RISE = 0.5;
  const half = SPAN / 2;

  const planks = Array.from({ length: PLANKS }, (_, i) => {
    const z = -half + (i / (PLANKS - 1)) * SPAN;
    const y = RISE * (1 - (z / half) ** 2); // parabolic arch
    const slope = (-2 * RISE * z) / half ** 2;
    return { z, y, tilt: -Math.atan(slope) };
  });

  // Pillars at the true ends of the deck plus three between; rails run
  // segment-to-segment between pillar tops so the guardrail terminates
  // exactly on the end pillars.
  const pillarZs = [-half, -half / 2, 0, half / 2, half];
  const deckY = (z: number) => RISE * (1 - (z / half) ** 2);
  const rails = pillarZs.slice(0, -1).map((z1, i) => {
    const z2 = pillarZs[i + 1];
    const zm = (z1 + z2) / 2;
    const slope = (-2 * RISE * zm) / half ** 2;
    return {
      zm,
      y: deckY(zm),
      tilt: -Math.atan(slope),
      length: Math.hypot(z2 - z1, deckY(z2) - deckY(z1)) + 0.04,
    };
  });

  return (
    <group position={position}>
      {planks.map((p, i) => (
        <mesh key={i} position={[0, p.y, p.z]} rotation-x={p.tilt}>
          <boxGeometry args={[0.85, 0.055, 0.24]} />
          <meshStandardMaterial color={C.door} flatShading />
        </mesh>
      ))}
      {/* pillars: one at each end of the guardrail, three between */}
      {pillarZs.map((z) => (
        <group key={z}>
          {[-0.4, 0.4].map((x) => (
            <mesh key={x} position={[x, deckY(z) + 0.17, z]}>
              <cylinderGeometry args={[0.035, 0.045, 0.34, 6]} />
              <meshStandardMaterial color="#66503c" flatShading />
            </mesh>
          ))}
        </group>
      ))}
      {/* rails spanning pillar to pillar along the arch */}
      {rails.map((r) => (
        <group key={r.zm}>
          {[-0.4, 0.4].map((x) => (
            <mesh key={x} position={[x, r.y + 0.32, r.zm]} rotation-x={r.tilt}>
              <boxGeometry args={[0.05, 0.05, r.length]} />
              <meshStandardMaterial color="#66503c" flatShading />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/**
 * Stepping stones from the bridge's far end up the hillside to the
 * tree in the back. Each stone carries its own height so the path
 * climbs the mound instead of tunneling into it.
 */
function SteppingStones() {
  const stones: [number, number, number, number][] = [
    // x, z, radius, y (rises with the hill slope toward the tree)
    [-3.05, -5.1, 0.19, 0.03],
    [-3.15, -5.55, 0.16, 0.05],
    [-3.25, -6.0, 0.18, 0.17],
    [-3.35, -6.45, 0.15, 0.33],
    [-3.4, -6.8, 0.16, 0.45],
  ];
  return (
    <>
      {stones.map(([x, z, r, y], i) => (
        <mesh key={i} position={[x, y, z]}>
          <cylinderGeometry args={[r, r * 1.1, 0.05, 7]} />
          <meshStandardMaterial color={ROCK} flatShading />
        </mesh>
      ))}
    </>
  );
}

/** Flat ribbon following a centerline, widening downstream. */
function River({
  material,
  pathZ = riverZ,
  pathWidth = riverWidth,
  xStart = RIVER_START,
  xEnd = RIVER_END,
  y = 0.03,
}: {
  material: THREE.MeshStandardMaterial;
  pathZ?: (x: number) => number;
  pathWidth?: (x: number) => number;
  xStart?: number;
  xEnd?: number;
  y?: number;
}) {
  const geometry = useMemo(() => {
    const segments = 48;
    const vertices: number[] = [];
    const indices: number[] = [];
    for (let i = 0; i <= segments; i++) {
      const x = xStart + (i / segments) * (xEnd - xStart);
      const zc = pathZ(x);
      const w = pathWidth(x);
      vertices.push(x, y, zc - w / 2, x, y, zc + w / 2);
      if (i < segments) {
        const a = i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3),
    );
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, [pathZ, pathWidth, xStart, xEnd, y]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return <mesh geometry={geometry} material={material} />;
}

/** Little sparkles drifting downstream to sell the flow. */
function RiverGlints({
  material,
  pathZ = riverZ,
  pathWidth = riverWidth,
  xStart = RIVER_START,
  xEnd = RIVER_END,
  reverse = false,
  count = 14,
}: {
  material: THREE.PointsMaterial;
  pathZ?: (x: number) => number;
  pathWidth?: (x: number) => number;
  xStart?: number;
  xEnd?: number;
  /** Flow from xEnd toward xStart instead. */
  reverse?: boolean;
  count?: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const { offsets, jitter, buffer } = useMemo(() => {
    const rand = mulberry32(11);
    const offsets = new Float32Array(count);
    const jitter = new Float32Array(count);
    const buffer = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      offsets[i] = rand() * (xEnd - xStart);
      jitter[i] = (rand() - 0.5) * 0.5;
    }
    return { offsets, jitter, buffer };
  }, [count, xStart, xEnd]);

  useFrame((state) => {
    const points = pointsRef.current;
    if (!points) return;
    const t = state.clock.elapsedTime;
    const arr = points.geometry.attributes.position.array as Float32Array;
    const span = xEnd - xStart;
    for (let i = 0; i < count; i++) {
      const travel = (offsets[i] + t * 1.1) % span;
      const x = reverse ? xEnd - travel : xStart + travel;
      arr[i * 3] = x;
      arr[i * 3 + 1] = 0.08;
      arr[i * 3 + 2] = pathZ(x) + jitter[i] * pathWidth(x) * 0.6;
    }
    points.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} material={material}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[buffer, 3]} />
      </bufferGeometry>
    </points>
  );
}

/** Puffs rising from the chimney on a loop. */
function Smoke() {
  const puffs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    puffs.current.forEach((puff, i) => {
      if (!puff) return;
      const cycle = (t * 0.3 + i / 3) % 1;
      puff.position.y = 2.55 + cycle * 1.7;
      puff.position.x = 0.85 + Math.sin((t + i * 2.1) * 0.7) * 0.1;
      puff.scale.setScalar(0.12 + cycle * 0.24);
      (puff.material as THREE.MeshStandardMaterial).opacity =
        0.55 * (1 - cycle);
    });
  });

  return (
    <>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            puffs.current[i] = el;
          }}
          position={[0.85, 2.55, -0.2]}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color={C.smoke} transparent opacity={0.5} />
        </mesh>
      ))}
    </>
  );
}

function Cottage({
  position,
  windowMaterial,
}: {
  position: [number, number, number];
  windowMaterial: THREE.MeshStandardMaterial;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[2.2, 1.4, 1.8]} />
        <meshStandardMaterial color={C.wall} flatShading />
      </mesh>
      <mesh position={[0, 1.98, 0]} rotation-y={Math.PI / 4}>
        <coneGeometry args={[1.85, 1.15, 4]} />
        <meshStandardMaterial color={C.roof} flatShading />
      </mesh>
      <mesh position={[0.85, 2.15, -0.2]}>
        <boxGeometry args={[0.3, 0.85, 0.3]} />
        <meshStandardMaterial color={C.chimney} flatShading />
      </mesh>
      <mesh position={[0, 0.48, 0.92]}>
        <boxGeometry args={[0.52, 0.96, 0.06]} />
        <meshStandardMaterial color={C.door} flatShading />
      </mesh>
      {/* little yellow doorknob */}
      <mesh position={[0.17, 0.48, 0.97]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={C.butter} />
      </mesh>
      {/* warm-lit windows — they glow brighter after dark */}
      {[-0.68, 0.68].map((x) => (
        <mesh key={x} position={[x, 0.85, 0.92]} material={windowMaterial}>
          <boxGeometry args={[0.42, 0.42, 0.05]} />
        </mesh>
      ))}
      {/* wide window on the left side of the house */}
      <mesh position={[-1.11, 0.85, 0]} material={windowMaterial}>
        <boxGeometry args={[0.05, 0.42, 1.1]} />
      </mesh>
      <Smoke />
    </group>
  );
}

function Tree({
  position,
  scale = 1,
  foliage = C.foliage,
}: {
  position: [number, number, number];
  scale?: number;
  foliage?: string;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.12, 0.18, 1, 6]} />
        <meshStandardMaterial color={C.trunk} flatShading />
      </mesh>
      <mesh position={[0, 1.35, 0]}>
        <coneGeometry args={[0.78, 1.3, 7]} />
        <meshStandardMaterial color={foliage} flatShading />
      </mesh>
      <mesh position={[0, 2.15, 0]}>
        <coneGeometry args={[0.56, 1.05, 7]} />
        <meshStandardMaterial color={foliage} flatShading />
      </mesh>
      <mesh position={[0, 2.85, 0]}>
        <coneGeometry args={[0.34, 0.8, 7]} />
        <meshStandardMaterial color={foliage} flatShading />
      </mesh>
    </group>
  );
}

function MushroomSprout({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 0.18, 6]} />
        <meshStandardMaterial color={C.wall} flatShading />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <sphereGeometry args={[0.14, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={C.terracotta} flatShading />
      </mesh>
    </group>
  );
}

/** Tree base positions, shared so flowers keep their distance. */
const TREE_SPOTS: [number, number][] = [
  [-3.6, -2],
  [4.8, -2.6],
  [-5.6, -0.6],
  [2.95, -4.2],
  [-3.4, -6.9],
];
/** Scattered low-poly blossoms, clear of the cottage, river, and trees. */
function Flowers({ count = 26 }: { count?: number }) {
  const flowers = useMemo(() => {
    const rand = mulberry32(42);
    const petalColors = [C.rose, C.butter, C.terracotta, "#fbf6ec"];
    const items: {
      position: [number, number, number];
      color: string;
      s: number;
    }[] = [];
    while (items.length < count) {
      const x = (rand() - 0.5) * 15;
      const z = -2.4 + rand() * 6.9;
      if (Math.abs(x - 1.6) < 1.9 && Math.abs(z) < 1.6) continue; // cottage
      if (x > -4.5 && x < 0.6 && z > -0.1 && z < 4.6) continue; // nav rocks lawn
      // stay out of the trees' skirts
      if (
        TREE_SPOTS.some(
          ([tx, tz]) => (x - tx) ** 2 + (z - tz) ** 2 < 0.85 ** 2,
        )
      ) {
        continue;
      }
      items.push({
        position: [x, 0, z],
        color: petalColors[Math.floor(rand() * petalColors.length)],
        s: 0.7 + rand() * 0.7,
      });
    }
    return items;
  }, [count]);

  return (
    <>
      {flowers.map((f, i) => (
        <group key={i} position={f.position} scale={f.s}>
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.32, 5]} />
            <meshStandardMaterial color={C.stem} />
          </mesh>
          <mesh position={[0, 0.36, 0]}>
            <icosahedronGeometry args={[0.09, 0]} />
            <meshStandardMaterial color={f.color} flatShading />
          </mesh>
        </group>
      ))}
    </>
  );
}

/** Petal motes by day; the controller re-colors them into fireflies at night. */
function Petals({
  material,
  count = 55,
}: {
  material: THREE.PointsMaterial;
  count?: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const { base, phases, buffer } = useMemo(() => {
    const rand = mulberry32(7);
    const base = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      base[i * 3] = (rand() - 0.5) * 16;
      base[i * 3 + 1] = 0.4 + rand() * 4.6;
      base[i * 3 + 2] = (rand() - 0.4) * 8;
      phases[i] = rand() * Math.PI * 2;
    }
    return { base, phases, buffer: base.slice() };
  }, [count]);

  useFrame((state) => {
    const points = pointsRef.current;
    if (!points) return;
    const t = state.clock.elapsedTime;
    const arr = points.geometry.attributes.position.array as Float32Array;
    const span = 4.8;
    for (let i = 0; i < count; i++) {
      const j = i * 3;
      const fall = base[j + 1] - t * 0.18 - phases[i];
      arr[j] = base[j] + Math.sin(t * 0.35 + phases[i]) * 0.45;
      arr[j + 1] = 0.3 + ((fall % span) + span) % span;
      arr[j + 2] = base[j + 2];
    }
    points.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} material={material}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[buffer, 3]} />
      </bufferGeometry>
    </points>
  );
}

/**
 * Shared materials the day/night controller mutates each frame.
 * Module-scoped (this chunk only ever loads in the browser) so the
 * React compiler's immutability rules don't apply — mutating hook
 * values inside useFrame is disallowed, mutating these is fine.
 */
const mats = {
  window: new THREE.MeshStandardMaterial({
    color: DAY.window.clone(),
    emissive: new THREE.Color(C.window),
    emissiveIntensity: DAY.windowGlow,
  }),
  water: new THREE.MeshStandardMaterial({
    color: DAY.water.clone(),
    side: THREE.DoubleSide,
  }),
  glint: new THREE.PointsMaterial({
    color: DAY.glint.clone(),
    size: 0.07,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.7,
  }),
  petal: new THREE.PointsMaterial({
    color: DAY.petal.clone(),
    size: 0.09,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85,
  }),
  stars: new THREE.PointsMaterial({
    color: "#f4f2e4",
    size: 0.12,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0,
    fog: false,
  }),
};

/**
 * Rasterize a word onto a tiny offscreen canvas and return one point
 * per filled pixel — each becomes a pebble laid on the grass.
 */
function samplePebbles(label: string) {
  const SPACING = 0.05; // world units per text pixel
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  // Higher-res rasterization + letter spacing keeps tight letters
  // (x, ri, c…) from merging into blobs.
  const font = "bold 14px Arial, sans-serif";
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(label).width) + label.length + 2;
  const h = 18;
  canvas.width = w;
  canvas.height = h;
  ctx.font = font; // canvas resize resets state
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing =
    "1px";
  ctx.fillStyle = "#000";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 1, h / 2);
  const data = ctx.getImageData(0, 0, w, h).data;
  const points: { x: number; y: number }[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 140) {
        points.push({ x: x * SPACING, y: (h - y) * SPACING });
      }
    }
  }
  return { points, width: w * SPACING, height: h * SPACING };
}

const ROCK = "#cfc8b8";
const ROCK_HOVER = "#ecd9a0";

/**
 * A word spelled out in little rocks on the grass. The whole word is
 * one InstancedMesh (single draw call) plus an invisible hit plane.
 */
function PebbleWord({
  label,
  section,
  position,
}: {
  label: string;
  section: SectionId;
  position: [number, number, number];
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const [hovered, setHovered] = useState(false);
  const { points, width, height } = useMemo(() => samplePebbles(label), [label]);

  // Lay each pebble with a seeded jitter so the word looks hand-placed.
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const rand = mulberry32(label.length * 131 + label.charCodeAt(0));
    const dummy = new THREE.Object3D();
    points.forEach((p, i) => {
      dummy.position.set(
        p.x + (rand() - 0.5) * 0.012,
        p.y + (rand() - 0.5) * 0.012,
        (rand() - 0.5) * 0.02,
      );
      dummy.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);
      dummy.scale.setScalar(0.022 + rand() * 0.012);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [points, label]);

  return (
    // Tipped up from flat so the words read at the camera's low angle
    <group position={position} rotation-x={-Math.PI / 2 + 0.45}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, points.length]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={hovered ? ROCK_HOVER : ROCK}
          flatShading
        />
      </instancedMesh>
      {/* invisible hit plane so the whole word is clickable */}
      <mesh
        position={[width / 2, height / 2, 0.01]}
        onClick={(e) => {
          e.stopPropagation();
          setSection(section);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <planeGeometry args={[width + 0.35, height + 0.3]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** The nav rocks, stacked on the lawn left of the cottage. */
function NavRocks() {
  return (
    <>
      <PebbleWord
        label="about"
        section="about"
        position={[-3.7, 0.02, 1.95]}
      />
      <PebbleWord
        label="experience"
        section="experience"
        position={[-3.45, 0.02, 2.95]}
      />
      <PebbleWord
        label="works"
        section="works"
        position={[-3.0, 0.02, 3.9]}
      />
    </>
  );
}

/**
 * A short wooden lamppost. The lantern glass shares the window
 * material (dark by day, candle glow at night) and a point light
 * fades in after dark to pool dim warm light around it.
 */
function Lamppost({
  position,
  glassMaterial,
}: {
  position: [number, number, number];
  glassMaterial: THREE.MeshStandardMaterial;
}) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.intensity = phaseState.value * 2.5;
    }
  });

  return (
    <group position={position}>
      {/* post */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.035, 0.05, 0.7, 6]} />
        <meshStandardMaterial color="#5b4a38" flatShading />
      </mesh>
      {/* lantern */}
      <mesh position={[0, 0.76, 0]} material={glassMaterial}>
        <boxGeometry args={[0.16, 0.18, 0.16]} />
      </mesh>
      {/* cap */}
      <mesh position={[0, 0.9, 0]} rotation-y={Math.PI / 4}>
        <coneGeometry args={[0.15, 0.12, 4]} />
        <meshStandardMaterial color="#5b4a38" flatShading />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[0, 0.78, 0]}
        color="#ffc36e"
        intensity={0}
        distance={4}
        decay={2}
      />
    </group>
  );
}

/** Everything inside the canvas, including the day/night controller. */
function SceneContents() {
  const night = useSyncExternalStore(
    subscribeTheme,
    isNight,
    isNightServerSnapshot,
  );

  const phase = useRef(0); // 0 = day, 1 = night, eased every frame
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const dirRef = useRef<THREE.DirectionalLight>(null);
  const fogRef = useRef<THREE.Fog>(null);

  const starBuffer = useMemo(() => {
    const rand = mulberry32(3);
    const arr = new Float32Array(90 * 3);
    for (let i = 0; i < 90; i++) {
      arr[i * 3] = (rand() - 0.5) * 44;
      arr[i * 3 + 1] = 3 + rand() * 14;
      arr[i * 3 + 2] = -15 - rand() * 4;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    const target = night ? 1 : 0;
    phase.current += (target - phase.current) * Math.min(1, delta * 1.6);
    const p = phase.current;
    phaseState.value = p;

    if (ambientRef.current) {
      ambientRef.current.intensity = lerp(
        DAY.ambientIntensity,
        NIGHT.ambientIntensity,
        p,
      );
      ambientRef.current.color.lerpColors(DAY.ambient, NIGHT.ambient, p);
    }
    if (dirRef.current) {
      dirRef.current.intensity = lerp(DAY.dirIntensity, NIGHT.dirIntensity, p);
      dirRef.current.color.lerpColors(DAY.sun, NIGHT.sun, p);
    }
    if (hemiRef.current) {
      hemiRef.current.intensity = lerp(
        DAY.hemiIntensity,
        NIGHT.hemiIntensity,
        p,
      );
    }
    if (fogRef.current) fogRef.current.color.lerpColors(DAY.fog, NIGHT.fog, p);

    mats.window.emissiveIntensity = lerp(DAY.windowGlow, NIGHT.windowGlow, p);
    mats.window.color.lerpColors(DAY.window, NIGHT.window, p);
    mats.water.color.lerpColors(DAY.water, NIGHT.water, p);
    mats.glint.color.lerpColors(DAY.glint, NIGHT.glint, p);
    mats.petal.color.lerpColors(DAY.petal, NIGHT.petal, p);
    mats.stars.opacity = p * 0.9;
  });

  return (
    <>
      <fog ref={fogRef} attach="fog" args={["#fbf6ec", 13, 26]} />
      <ambientLight ref={ambientRef} color="#fff6e4" intensity={0.75} />
      <hemisphereLight ref={hemiRef} args={["#fff7e6", C.foliageLight, 0.5]} />
      <directionalLight
        ref={dirRef}
        color="#ffe3b0"
        intensity={1.5}
        position={[5, 7, 4]}
      />

      {/* stars fade in at night */}
      <points material={mats.stars}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[starBuffer, 3]} />
        </bufferGeometry>
      </points>

      <CameraRig />
      <Ground />
      {/* wide source filling the gap between the hills */}
      <MiddleStream material={mats.water} />
      {/* right stream */}
      <River material={mats.water} />
      <RiverGlints material={mats.glint} />
      {/* left branch, joining the right stream at the junction */}
      <River
        material={mats.water}
        pathZ={riverZLeft}
        pathWidth={riverWidthLeft}
        xStart={LEFT_END}
        xEnd={JUNCTION_X}
        y={0.02}
      />
      <RiverGlints
        material={mats.glint}
        pathZ={riverZLeft}
        pathWidth={riverWidthLeft}
        xStart={LEFT_END}
        xEnd={JUNCTION_X}
        reverse
        count={10}
      />
      <Cottage position={[1.6, 0, 0]} windowMaterial={mats.window} />
      <NavRocks />
      {/* moon bridge over the left branch, behind the house */}
      <MoonBridge position={[-3.0, 0, -3.64]} />
      <SteppingStones />
      {/* lampposts: far bank at the bridge's right side + front door */}
      <Lamppost position={[-2.5, 0, -4.95]} glassMaterial={mats.window} />
      <Lamppost position={[0.95, 0, 1.5]} glassMaterial={mats.window} />

      <Tree position={[-3.6, 0, -2]} scale={1.15} />
      <Tree position={[4.8, 0, -2.6]} scale={1.35} foliage={C.foliageDark} />
      <Tree position={[-5.6, 0, -0.6]} scale={0.85} foliage={C.foliageLight} />
      <Tree position={[2.95, 0, -4.2]} scale={0.95} />
      <Tree
        position={[-3.4, 0.45, -6.9]}
        scale={1.2}
        foliage={C.foliageDark}
      />

      <MushroomSprout position={[3.2, 0, 1.3]} />
      <MushroomSprout position={[3.9, 0, 1.7]} scale={0.7} />
      <MushroomSprout position={[4.6, 0, 0.9]} scale={0.85} />

      <Flowers />
      <Petals material={mats.petal} />
    </>
  );
}

export default function HeroScene() {
  // Stop rendering entirely while the hero is scrolled out of view.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [frameloop, setFrameloop] = useState<"always" | "never">("always");

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setFrameloop(entry.isIntersecting ? "always" : "never");
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0" aria-hidden="true">
      <Canvas
        frameloop={frameloop}
        dpr={[1, 1.75]}
        camera={{ position: [0, 2.4, 8.5], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
      >
        <SceneContents />
      </Canvas>
    </div>
  );
}
