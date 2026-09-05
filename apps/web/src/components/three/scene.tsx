"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { RectAreaLightUniformsLib } from "three-stdlib";
import { useSceneStore } from "./store";
import {
  MATERIAL_OPTIONS,
  type MaterialTarget,
  type PieceId,
  STYLE_PRESETS,
  TIME_PRESETS,
} from "@/lib/three/config";

RectAreaLightUniformsLib.init();

const ROOM = { w: 7.4, d: 6.6, h: 3.1 };

/* ------------------------------------------------------------------ *
 * Eased physical material — glides between presets, no per-frame work once settled
 * ------------------------------------------------------------------ */

type SurfaceKind = "matte" | "wood" | "stone" | "fabric" | "metal" | "plaster";

// Plain MeshStandardMaterial params — MeshPhysicalMaterial (clearcoat/sheen) was
// the biggest per-frame cost with ~50 material instances in the room.
const KIND_PROPS: Record<SurfaceKind, { roughness: number; metalness: number; envMapIntensity: number }> = {
  matte: { roughness: 0.9, metalness: 0, envMapIntensity: 0.4 },
  plaster: { roughness: 1, metalness: 0, envMapIntensity: 0.28 },
  wood: { roughness: 0.55, metalness: 0, envMapIntensity: 0.6 },
  stone: { roughness: 0.4, metalness: 0, envMapIntensity: 0.85 },
  fabric: { roughness: 1, metalness: 0, envMapIntensity: 0.25 },
  metal: { roughness: 0.4, metalness: 0.85, envMapIntensity: 1 },
};

function Surface({
  color,
  kind = "matte",
  emissive = "#000000",
  emissiveIntensity = 0,
  speed = 3,
  ...rest
}: {
  color: string;
  kind?: SurfaceKind;
  emissive?: string;
  emissiveIntensity?: number;
  speed?: number;
} & Record<string, unknown>) {
  const ref = useRef<THREE.MeshStandardMaterial>(null);
  const target = useMemo(() => new THREE.Color(color), [color]);
  const emTarget = useMemo(() => new THREE.Color(emissive), [emissive]);
  useEffect(() => void target.set(color), [color, target]);
  useEffect(() => void emTarget.set(emissive), [emissive, emTarget]);

  useClampedFrame((_, dt) => {
    const m = ref.current;
    if (!m) return;
    const cd =
      Math.abs(m.color.r - target.r) + Math.abs(m.color.g - target.g) + Math.abs(m.color.b - target.b);
    const ed = Math.abs(m.emissiveIntensity - emissiveIntensity);
    if (cd < 0.002 && ed < 0.002) return;
    const t = 1 - Math.pow(0.002, dt * (speed / 3));
    m.color.lerp(target, t);
    m.emissive.lerp(emTarget, t);
    m.emissiveIntensity += (emissiveIntensity - m.emissiveIntensity) * t;
  });

  return (
    <meshStandardMaterial
      ref={ref}
      color={color}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
      {...KIND_PROPS[kind]}
      {...rest}
    />
  );
}

function useClampedFrame(cb: (state: unknown, dt: number) => void) {
  useFrame((state, dt) => cb(state, Math.min(dt, 0.05)));
}

function matOption(target: MaterialTarget, id: string) {
  const list = MATERIAL_OPTIONS[target];
  return list.find((o) => o.id === id) ?? list[0]!;
}

const KIND_FOR: Record<string, SurfaceKind> = {
  linen: "fabric",
  boucle: "fabric",
  velvet: "fabric",
  leather: "fabric",
  "rift-oak": "wood",
  walnut: "wood",
  oak: "wood",
  limestone: "stone",
  travertine: "stone",
  calacatta: "stone",
  basalt: "stone",
  almond: "plaster",
  espresso: "plaster",
};

/* ------------------------------------------------------------------ *
 * Selectable — subtle hover/selection lift
 * ------------------------------------------------------------------ */

function Selectable({
  id,
  children,
  position,
}: {
  id: PieceId;
  children: React.ReactNode;
  position?: [number, number, number];
}) {
  const select = useSceneStore((s) => s.select);
  const hover = useSceneStore((s) => s.hover);
  const selected = useSceneStore((s) => s.selected === id);
  const hovered = useSceneStore((s) => s.hovered === id);
  const group = useRef<THREE.Group>(null);

  useEffect(
    () => () => {
      if (typeof document !== "undefined") document.body.style.cursor = "";
    },
    [],
  );

  useClampedFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const lift = selected ? 0.03 : hovered ? 0.012 : 0;
    const base = position?.[1] ?? 0;
    g.position.y += (base + lift - g.position.y) * (1 - Math.pow(0.002, dt));
  });

  return (
    <group
      ref={group}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        hover(id);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        hover(null);
        document.body.style.cursor = "";
      }}
      onClick={(e) => {
        e.stopPropagation();
        select(selected ? null : id);
      }}
    >
      {children}
    </group>
  );
}

/* ------------------------------------------------------------------ *
 * Shell
 * ------------------------------------------------------------------ */

function Room() {
  const style = useSceneStore((s) => STYLE_PRESETS[s.style]);
  const floorMat = matOption("floor", useSceneStore((s) => s.materials.floor));
  const wallMat = matOption("wall", useSceneStore((s) => s.materials.wall));

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM.w + 0.4, ROOM.d + 0.4]} />
        <Surface color={floorMat.color} kind={KIND_FOR[floorMat.id] ?? "wood"} />
      </mesh>

      {/* back wall — the media joinery sits against this */}
      <mesh position={[0, ROOM.h / 2, -ROOM.d / 2 - 0.02]} receiveShadow>
        <planeGeometry args={[ROOM.w + 0.4, ROOM.h + 0.3]} />
        <Surface color={wallMat.color} kind={KIND_FOR[wallMat.id] ?? "plaster"} />
      </mesh>

      {/* left wall with the window */}
      <group position={[-ROOM.w / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        {(
          [
            [0, ROOM.h - 0.42, ROOM.d, 0.84],
            [0, 0.42, ROOM.d, 0.84],
            [-ROOM.d / 2 + 0.42, ROOM.h / 2, 0.84, ROOM.h],
            [ROOM.d / 2 - 0.42, ROOM.h / 2, 0.84, ROOM.h],
          ] as [number, number, number, number][]
        ).map(([x, y, w, h], i) => (
          <mesh key={i} position={[x, y, 0]} receiveShadow>
            <planeGeometry args={[w, h]} />
            <Surface color={style.colors.wall} kind="plaster" />
          </mesh>
        ))}
        <Window />
      </group>

      <mesh position={[ROOM.w / 2 + 0.02, ROOM.h / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM.d + 0.4, ROOM.h + 0.3]} />
        <Surface color={style.colors.wall} kind="plaster" />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM.h + 0.01, 0]} receiveShadow>
        <planeGeometry args={[ROOM.w + 0.4, ROOM.d + 0.4]} />
        <Surface color={style.colors.ceiling} kind="plaster" />
      </mesh>

      {/* recessed ceiling raft — reads as architecture, hides the fixtures */}
      <mesh position={[0, ROOM.h - 0.09, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM.w - 1.6, ROOM.d - 1.6]} />
        <Surface color={style.colors.ceiling} kind="plaster" />
      </mesh>

      {/* skirting */}
      <mesh position={[0, 0.055, -ROOM.d / 2 + 0.02]}>
        <boxGeometry args={[ROOM.w, 0.11, 0.02]} />
        <Surface color={style.colors.ceiling} kind="wood" />
      </mesh>
    </group>
  );
}

/** A soft daylight view, drawn once to a canvas — no blown-out white plane. */
function useSkyView() {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 176;
    const g = c.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 0, 176);
    grad.addColorStop(0, "#a7c3d6");
    grad.addColorStop(0.4, "#c7dae2");
    grad.addColorStop(0.62, "#e6ebe6");
    grad.addColorStop(0.78, "#f2ede0");
    grad.addColorStop(1, "#e4dcc9");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 176);
    // bright hazy horizon
    g.globalAlpha = 0.7;
    g.fillStyle = "#fffdf6";
    g.fillRect(0, 116, 256, 20);
    // distant low skyline, soft
    g.globalAlpha = 1;
    g.fillStyle = "rgba(122,132,140,0.18)";
    for (const [x, w, h] of [
      [4, 44, 24],
      [54, 24, 12],
      [92, 58, 34],
      [162, 20, 10],
      [196, 46, 26],
      [236, 18, 8],
    ] as [number, number, number][]) {
      g.fillRect(x, 126 - h, w, h);
    }
    // tree mass on the horizon
    g.fillStyle = "rgba(84,102,78,0.16)";
    g.beginPath();
    g.ellipse(126, 128, 48, 18, 0, 0, Math.PI * 2);
    g.fill();
    // faint grain
    const img = g.getImageData(0, 0, 256, 176);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * 8;
      d[i] = (d[i] ?? 0) + n;
      d[i + 1] = (d[i + 1] ?? 0) + n;
      d[i + 2] = (d[i + 2] ?? 0) + n;
    }
    g.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

/** A pleated drape sheet — one mesh, deep folds baked into the geometry. */
function useDrapeGeometry(width: number, height: number, folds: number, depth: number) {
  return useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, height, folds * 6, 8);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const u = x / width + 0.5;
      const vTop = y / height + 0.5; // 0 hem .. 1 heading
      // pinched at the heading, opening up toward the hem
      const gather = 0.45 + 0.55 * Math.min(1, 1.1 - vTop);
      const wave =
        Math.sin(u * folds * Math.PI * 2) + 0.3 * Math.sin(u * folds * Math.PI * 4 + 0.7);
      pos.setZ(i, wave * depth * gather);
      // let the hem drift a little into the room
      if (vTop < 0.12) pos.setZ(i, pos.getZ(i) + (0.12 - vTop) * 0.9 * depth);
    }
    geo.computeVertexNormals();
    return geo;
  }, [width, height, folds, depth]);
}

function CurtainPanel({
  x,
  z,
  width,
  height,
  color,
}: {
  x: number;
  z: number;
  width: number;
  height: number;
  color: string;
}) {
  const geo = useDrapeGeometry(width, height, Math.max(5, Math.round(width / 0.17)), 0.16);
  return (
    <group position={[x, 0, z]}>
      <mesh geometry={geo} position={[0, height / 2 + 0.02, 0]} castShadow receiveShadow>
        {/* emissive stands in for daylight glowing through the linen — the room
            side is otherwise backlit and would read as a flat dark panel */}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.07}
          roughness={0.98}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* tailored heading — hides the gathered top of the sheet */}
      <mesh position={[0, height - 0.05, 0.03]} castShadow>
        <boxGeometry args={[width + 0.05, 0.14, 0.11]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.07} roughness={0.98} />
      </mesh>
    </group>
  );
}

function Window() {
  const time = useSceneStore((s) => TIME_PRESETS[s.time]);
  const style = useSceneStore((s) => STYLE_PRESETS[s.style]);
  const view = useSkyView();

  const glassRef = useRef<THREE.MeshBasicMaterial>(null);
  const tint = useMemo(() => new THREE.Color(), []);
  useClampedFrame((_, dt) => {
    const m = glassRef.current;
    if (!m) return;
    // brighter than the raw preset so a daylit window reads as light, not grey
    tint.set(time.windowColor).multiplyScalar(Math.min(1.18, 0.82 + time.windowIntensity * 0.42));
    const d =
      Math.abs(m.color.r - tint.r) + Math.abs(m.color.g - tint.g) + Math.abs(m.color.b - tint.b);
    if (d < 0.002) return;
    m.color.lerp(tint, 1 - Math.pow(0.004, dt));
  });

  const gw = ROOM.d - 1.7; // opening width  (~4.9)
  const gh = ROOM.h - 1.7; // opening height (~1.4)
  const cy = ROOM.h / 2; // opening centre height
  const bronze = "#1c1813";
  const mullX = [-gw / 4, 0, gw / 4];
  const transomY = cy + gh / 2 - gh / 3;
  const fm = 0.055; // frame member thickness

  // drapery — a warm greige linen, deliberately mid-toned so the columns of
  // fabric read against the pale plaster even while backlit by the window
  const drape = new THREE.Color(style.colors.sofa).offsetHSL(0.012, 0.06, -0.17).getStyle();

  const curtainZ = 0.46;
  const rodY = ROOM.h - 0.14;
  const panelW = 1.5;
  // panels held open at the jambs — inner edge just laps onto the glass
  const panelX = gw / 2 - 0.3 + panelW / 2;
  const rodLen = gw + 1.1;

  return (
    <group>
      {/* jamb lining — set back into the wall so the opening reads as thick */}
      {(
        [
          [0, cy + gh / 2, gw + 0.12, 0.14],
          [0, cy - gh / 2, gw + 0.12, 0.14],
          [-gw / 2, cy, 0.14, gh],
          [gw / 2, cy, 0.14, gh],
        ] as [number, number, number, number][]
      ).map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, -0.16]}>
          <boxGeometry args={[w, h, 0.32]} />
          <meshStandardMaterial color={style.colors.wall} roughness={1} />
        </mesh>
      ))}

      {/* the view outside */}
      <mesh position={[0, cy, -0.06]}>
        <planeGeometry args={[gw, gh]} />
        <meshBasicMaterial ref={glassRef} map={view} color={time.windowColor} toneMapped={false} />
      </mesh>

      {/* glass — a whisper of reflection over the view */}
      <mesh position={[0, cy, 0.01]}>
        <planeGeometry args={[gw, gh]} />
        <meshStandardMaterial
          color="#dfe7e6"
          roughness={0.04}
          metalness={0}
          transparent
          opacity={0.07}
          depthWrite={false}
        />
      </mesh>

      {/* steel frame — chunky casing + mullion grid + transom */}
      <mesh position={[0, cy + gh / 2 + fm / 2, 0.05]}>
        <boxGeometry args={[gw + fm * 2, fm, 0.11]} />
        <meshStandardMaterial color={bronze} roughness={0.4} metalness={0.45} />
      </mesh>
      <mesh position={[0, cy - gh / 2 - fm / 2, 0.05]}>
        <boxGeometry args={[gw + fm * 2, fm, 0.11]} />
        <meshStandardMaterial color={bronze} roughness={0.4} metalness={0.45} />
      </mesh>
      <mesh position={[-gw / 2 - fm / 2, cy, 0.05]}>
        <boxGeometry args={[fm, gh + fm * 2, 0.11]} />
        <meshStandardMaterial color={bronze} roughness={0.4} metalness={0.45} />
      </mesh>
      <mesh position={[gw / 2 + fm / 2, cy, 0.05]}>
        <boxGeometry args={[fm, gh + fm * 2, 0.11]} />
        <meshStandardMaterial color={bronze} roughness={0.4} metalness={0.45} />
      </mesh>
      {mullX.map((x, i) => (
        <mesh key={i} position={[x, cy, 0.045]}>
          <boxGeometry args={[fm * 0.8, gh, 0.08]} />
          <meshStandardMaterial color={bronze} roughness={0.4} metalness={0.45} />
        </mesh>
      ))}
      <mesh position={[0, transomY, 0.045]}>
        <boxGeometry args={[gw, fm * 0.8, 0.08]} />
        <meshStandardMaterial color={bronze} roughness={0.4} metalness={0.45} />
      </mesh>

      {/* stone sill projecting into the room */}
      <mesh position={[0, cy - gh / 2 - fm - 0.03, 0.13]} castShadow receiveShadow>
        <boxGeometry args={[gw + 0.5, 0.07, 0.38]} />
        <meshStandardMaterial color={style.colors.stone} roughness={0.34} metalness={0} />
      </mesh>

      {/* curtain rod + finials */}
      <mesh position={[0, rodY, curtainZ - 0.05]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, rodLen, 20]} />
        <meshStandardMaterial color={bronze} roughness={0.35} metalness={0.55} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * rodLen) / 2, rodY, curtainZ - 0.05]}>
          <sphereGeometry args={[0.038, 18, 14]} />
          <meshStandardMaterial color={bronze} roughness={0.3} metalness={0.6} />
        </mesh>
      ))}

      {/* drapery — gathered at each jamb, floor length */}
      {[-1, 1].map((s) => (
        <CurtainPanel
          key={s}
          x={s * panelX}
          z={curtainZ}
          width={panelW}
          height={ROOM.h - 0.17}
          color={drape}
        />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ *
 * Furniture — refined proportions, tapered legs, fuller cushions
 * ------------------------------------------------------------------ */

/**
 * Three-seat sofa, built with real anatomy and facing +Z (toward the camera):
 * a continuous apron, bracketing arms, a leaning back, seat cushions that
 * overhang the apron, and back cushions that fill the seat-to-back junction.
 */
function Sofa() {
  const style = useSceneStore((s) => STYLE_PRESETS[s.style]);
  const mat = matOption("sofa", useSceneStore((s) => s.materials.sofa));
  const kind = KIND_FOR[mat.id] ?? "fabric";
  const frameColor = new THREE.Color(mat.color).offsetHSL(0, 0.015, -0.055).getStyle();
  // tailored, not pillowy — small radii on the frame, moderate on cushions
  const fr = 0.028 + style.softness * 0.03;
  const cr = 0.05 + style.softness * 0.08;

  const W = 2.98;
  const D = 1.04;
  const armW = 0.24;
  const innerW = W - armW * 2;
  const plinthTop = 0.11;
  const seatTop = 0.4; // apron top / seat platform

  return (
    <Selectable id="sofa" position={[0, 0, 0.15]}>
      <group>
        {/* recessed dark plinth */}
        <mesh position={[0, plinthTop / 2, 0]} castShadow>
          <boxGeometry args={[W - 0.24, plinthTop, D - 0.18]} />
          <Surface color="#2b2620" kind="wood" />
        </mesh>

        {/* continuous apron — the visible body of the sofa */}
        <RoundedBox
          args={[W, seatTop - plinthTop + 0.02, D]}
          radius={fr}
          smoothness={2}
          position={[0, plinthTop + (seatTop - plinthTop) / 2, 0]}
          castShadow
          receiveShadow
        >
          <Surface color={frameColor} kind={kind} />
        </RoundedBox>

        {/* arms — bracket the apron, rounded tops, inner faces flush to the seat */}
        {[-1, 1].map((s) => (
          <RoundedBox
            key={s}
            args={[armW, 0.66, D]}
            radius={fr + 0.02}
            smoothness={2}
            position={[s * (W / 2 - armW / 2), plinthTop + 0.33, 0]}
            castShadow
          >
            <Surface color={frameColor} kind={kind} />
          </RoundedBox>
        ))}

        {/* back — a leaning panel between the arms, a touch below the arm tops */}
        <RoundedBox
          args={[innerW + 0.04, 0.86, 0.16]}
          radius={fr}
          smoothness={2}
          position={[0, plinthTop + 0.46, -D / 2 + 0.1]}
          rotation={[0.06, 0, 0]}
          castShadow
        >
          <Surface color={frameColor} kind={kind} />
        </RoundedBox>

        {/* seat cushions — sit on the apron, overhang the front, tucked to the back */}
        {[-0.84, 0, 0.84].map((x) => (
          <RoundedBox
            key={x}
            args={[0.88, 0.22, 0.92]}
            radius={cr}
            smoothness={2}
            position={[x, seatTop + 0.1, 0.08]}
            castShadow
          >
            <Surface color={mat.color} kind={kind} />
          </RoundedBox>
        ))}

        {/* back cushions — filling the seat-to-back corner, tops just under the arms */}
        {[-0.84, 0, 0.84].map((x) => (
          <RoundedBox
            key={x}
            args={[0.88, 0.46, 0.26]}
            radius={cr}
            smoothness={2}
            position={[x, seatTop + 0.28, -0.27]}
            rotation={[0.2, 0, 0]}
            castShadow
          >
            <Surface color={mat.color} kind={kind} />
          </RoundedBox>
        ))}

        {/* two accent cushions leaning in the corners */}
        {(
          [
            [-0.9, style.colors.cushion, 0.16],
            [0.92, style.colors.stone, -0.12],
          ] as [number, string, number][]
        ).map(([x, c, rot], i) => (
          <RoundedBox
            key={i}
            args={[0.42, 0.42, 0.16]}
            radius={0.07}
            smoothness={2}
            position={[x, seatTop + 0.22, -0.05]}
            rotation={[0.5, 0, rot]}
            castShadow
          >
            <Surface color={c} kind="fabric" />
          </RoundedBox>
        ))}
      </group>
    </Selectable>
  );
}

/**
 * Curved tub lounge chair: a low upholstered shell (back + arms as one wraparound
 * sweep) on a seat cushion, carried by four splayed timber legs.
 */
function LoungeChair() {
  const style = useSceneStore((s) => STYLE_PRESETS[s.style]);
  if (!style.showLoungeChair) return null;
  const c = style.colors.chair;
  const seatH = 0.42;
  const legH = 0.44;
  // shell built from a back panel + two arm panels toed in toward the front
  return (
    <Selectable id="loungeChair" position={[-2.35, 0, 1.5]}>
      <group rotation={[0, 0.85, 0]}>
        {/* splayed legs */}
        {(
          [
            [-0.3, 0.32, 0.12, 0.1],
            [0.3, 0.32, -0.12, 0.1],
            [-0.3, -0.28, 0.12, -0.1],
            [0.3, -0.28, -0.12, -0.1],
          ] as [number, number, number, number][]
        ).map(([x, z, rz, rx], i) => (
          <mesh key={i} position={[x, legH / 2, z]} rotation={[rx, 0, rz]} castShadow>
            <cylinderGeometry args={[0.02, 0.03, legH, 14]} />
            <Surface color={style.colors.wood} kind="wood" />
          </mesh>
        ))}

        {/* seat frame + cushion */}
        <RoundedBox args={[0.78, 0.16, 0.74]} radius={0.04} smoothness={2} position={[0, seatH, 0]} castShadow receiveShadow>
          <Surface color={new THREE.Color(c).offsetHSL(0, 0.01, -0.05).getStyle()} kind="fabric" />
        </RoundedBox>
        <RoundedBox args={[0.7, 0.16, 0.66]} radius={0.09} smoothness={2} position={[0, seatH + 0.13, 0.02]} castShadow>
          <Surface color={c} kind="fabric" />
        </RoundedBox>

        {/* wraparound shell — back */}
        <RoundedBox
          args={[0.82, 0.62, 0.16]}
          radius={0.1}
          smoothness={2}
          position={[0, seatH + 0.28, -0.32]}
          rotation={[-0.14, 0, 0]}
          castShadow
        >
          <Surface color={c} kind="fabric" />
        </RoundedBox>
        {/* shell — arms sweeping forward, toed in */}
        {[-1, 1].map((s) => (
          <RoundedBox
            key={s}
            args={[0.16, 0.4, 0.6]}
            radius={0.09}
            smoothness={2}
            position={[s * 0.36, seatH + 0.14, -0.02]}
            rotation={[0, s * -0.14, 0]}
            castShadow
          >
            <Surface color={c} kind="fabric" />
          </RoundedBox>
        ))}

        {/* loose back cushion */}
        <RoundedBox
          args={[0.62, 0.42, 0.18]}
          radius={0.1}
          smoothness={2}
          position={[0, seatH + 0.28, -0.2]}
          rotation={[0.2, 0, 0]}
          castShadow
        >
          <Surface color={new THREE.Color(c).offsetHSL(0, -0.02, 0.03).getStyle()} kind="fabric" />
        </RoundedBox>
      </group>
    </Selectable>
  );
}

function CoffeeTable() {
  const style = useSceneStore((s) => STYLE_PRESETS[s.style]);
  const mat = matOption("table", useSceneStore((s) => s.materials.table));
  const kind = KIND_FOR[mat.id] ?? "stone";
  return (
    <Selectable id="coffeeTable" position={[0, 0, 1.75]}>
      <group>
        <RoundedBox args={[1.15, 0.08, 0.62]} radius={0.02} smoothness={2} position={[0, 0.36, 0]} castShadow receiveShadow>
          <Surface color={mat.color} kind={kind} />
        </RoundedBox>
        {/* recessed plinth */}
        <RoundedBox args={[0.82, 0.32, 0.4]} radius={0.015} smoothness={2} position={[0, 0.17, 0]} castShadow>
          <Surface color={style.colors.wood} kind="wood" />
        </RoundedBox>
        {/* one considered object */}
        <mesh position={[0.28, 0.45, 0.04]} castShadow>
          <cylinderGeometry args={[0.09, 0.055, 0.16, 24]} />
          <Surface color={style.colors.stone} kind="stone" />
        </mesh>
        <mesh position={[-0.22, 0.395, -0.02]}>
          <boxGeometry args={[0.3, 0.03, 0.22]} />
          <Surface color={style.colors.cushion} kind="matte" />
        </mesh>
      </group>
    </Selectable>
  );
}

function Rug() {
  const style = useSceneStore((s) => STYLE_PRESETS[s.style]);
  const border = new THREE.Color(style.colors.rug).offsetHSL(0, 0, -0.06).getStyle();
  return (
    <Selectable id="rug" position={[0, 0, 0.9]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.011, 0]} receiveShadow>
        <planeGeometry args={[3.5, 2.5]} />
        <Surface color={border} kind="fabric" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.013, 0]} receiveShadow>
        <planeGeometry args={[3.24, 2.24]} />
        <Surface color={style.colors.rug} kind="fabric" />
      </mesh>
    </Selectable>
  );
}

function FloorLamp() {
  const style = useSceneStore((s) => STYLE_PRESETS[s.style]);
  const time = useSceneStore((s) => TIME_PRESETS[s.time]);
  return (
    <Selectable id="floorLamp" position={[2.25, 0, -0.35]}>
      <group>
        <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.17, 0.04, 28]} />
          <Surface color={style.colors.metal} kind="metal" />
        </mesh>
        <mesh position={[0, 0.9, 0]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 1.78, 12]} />
          <Surface color={style.colors.metal} kind="metal" />
        </mesh>
        <mesh position={[0, 1.68, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.2, 0.3, 28, 1, true]} />
          <meshStandardMaterial
            color="#f2e9d8"
            emissive="#ffdca6"
            emissiveIntensity={0.18 + time.lamp * 1.4}
            roughness={0.9}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
        <pointLight position={[0, 1.6, 0]} distance={4.6} decay={2} intensity={time.lamp * 7} color="#ffd6a0" />
      </group>
    </Selectable>
  );
}

function MediaWall() {
  const style = useSceneStore((s) => STYLE_PRESETS[s.style]);
  return (
    <Selectable id="console" position={[0, 0, -ROOM.d / 2 + 0.22]}>
      <group>
        {/* full-height oak joinery */}
        <RoundedBox
          args={[3.0, ROOM.h - 0.06, 0.32]}
          radius={0.015}
          smoothness={2}
          position={[0, (ROOM.h - 0.06) / 2, 0]}
          castShadow
          receiveShadow
        >
          <Surface color={style.colors.wood} kind="wood" />
        </RoundedBox>
        {/* honed-stone inset behind the screen */}
        <mesh position={[0, 1.62, 0.155]}>
          <planeGeometry args={[2.5, 1.6]} />
          <Surface color={style.colors.stone} kind="stone" />
        </mesh>
        {/* recessed shelf reveal — a thin warm glow line, not a fireplace */}
        <mesh position={[0, 0.66, 0.16]}>
          <planeGeometry args={[2.2, 0.02]} />
          <meshStandardMaterial color="#1c1712" emissive="#ffca86" emissiveIntensity={0.35} toneMapped={false} />
        </mesh>
        {/* low bench */}
        <RoundedBox args={[2.5, 0.3, 0.48]} radius={0.015} smoothness={2} position={[0, 0.15, 0.3]} castShadow>
          <Surface color={style.colors.wood} kind="wood" />
        </RoundedBox>
        {/* screen */}
        <mesh position={[0, 1.62, 0.185]}>
          <planeGeometry args={[1.7, 0.96]} />
          <meshStandardMaterial color="#0e0f10" roughness={0.28} metalness={0.1} />
        </mesh>
      </group>
    </Selectable>
  );
}

/** Painterly abstract on canvas — reads like real art, not a logo. */
function useArtTexture(a: string, b: string, accent: string) {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 384;
    const g = c.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 0, 384);
    grad.addColorStop(0, a);
    grad.addColorStop(0.55, b);
    grad.addColorStop(1, a);
    g.fillStyle = grad;
    g.fillRect(0, 0, 512, 384);
    // soft horizon band
    g.globalAlpha = 0.5;
    g.fillStyle = accent;
    for (let i = 0; i < 40; i++) {
      g.globalAlpha = 0.03 + Math.random() * 0.04;
      g.fillRect(0, 150 + Math.random() * 90, 512, 2 + Math.random() * 8);
    }
    // grain
    g.globalAlpha = 1;
    const img = g.getImageData(0, 0, 512, 384);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * 14;
      d[i] = (d[i] ?? 0) + n;
      d[i + 1] = (d[i + 1] ?? 0) + n;
      d[i + 2] = (d[i + 2] ?? 0) + n;
    }
    g.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [a, b, accent]);
}

function Artwork() {
  const style = useSceneStore((s) => STYLE_PRESETS[s.style]);
  const [a, b, accent] =
    style.artwork === "gilt-branch"
      ? ["#221e17", "#2c2620", style.colors.metal]
      : style.artwork === "triptych-stone"
        ? ["#d8cdba", "#c9bda6", "#8f8577"]
        : ["#171512", "#20201d", "#e9e2d3"];
  const tex = useArtTexture(a, b, accent);
  if (style.artwork === "none") return null;
  return (
    <Selectable id="artwork" position={[ROOM.w / 2 - 0.04, 1.62, -0.5]}>
      <group rotation={[0, -Math.PI / 2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.5, 1.12, 0.04]} />
          <Surface color={style.colors.metal} kind="metal" />
        </mesh>
        <mesh position={[0, 0, 0.025]}>
          <planeGeometry args={[1.4, 1.02]} />
          {tex ? (
            <meshBasicMaterial map={tex} toneMapped={false} />
          ) : (
            <meshStandardMaterial color={b} roughness={0.9} />
          )}
        </mesh>
      </group>
    </Selectable>
  );
}

/** A turned ceramic floor vase holding a few tall, gently curved branches. */
function FloorVase() {
  const style = useSceneStore((s) => STYLE_PRESETS[s.style]);

  // vase silhouette: small foot → belly → narrow neck → slight flare
  const profile = useMemo(
    () =>
      [
        [0.03, 0],
        [0.14, 0.04],
        [0.2, 0.2],
        [0.19, 0.36],
        [0.11, 0.56],
        [0.1, 0.64],
        [0.12, 0.7],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
    [],
  );

  // each branch = 3 stacked segments leaning progressively, with a couple of forks
  const branches = useMemo(
    () => [
      { base: [0.02, 0.02] as const, lean: 0.16, twist: 0.3, len: 1.5 },
      { base: [-0.03, -0.03] as const, lean: 0.26, twist: 2.4, len: 1.24 },
      { base: [0.04, -0.04] as const, lean: 0.1, twist: 4.3, len: 1.62 },
    ],
    [],
  );

  if (!style.showPlant) return null;

  return (
    <Selectable id="planter" position={[2.88, 0, -ROOM.d / 2 + 0.95]}>
      <group>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <latheGeometry args={[profile, 48]} />
          <Surface color={style.colors.plantPot} kind="stone" />
        </mesh>

        {branches.map((b, i) => {
          const segs = [0, 1, 2];
          return (
            <group key={i} position={[b.base[0], 0.62, b.base[1]]} rotation={[0, b.twist, 0]}>
              {segs.map((s) => {
                const lean = b.lean * (0.4 + s * 0.5);
                const segLen = b.len / 3;
                const y = segLen / 2 + s * segLen * 0.96;
                return (
                  <mesh key={s} position={[Math.sin(lean) * s * 0.14, y, 0]} rotation={[0, 0, -lean]} castShadow>
                    <cylinderGeometry args={[0.006 + (2 - s) * 0.004, 0.01 + (2 - s) * 0.004, segLen, 7]} />
                    <meshStandardMaterial color="#8d7c63" roughness={0.95} />
                  </mesh>
                );
              })}
              {/* two small forks near the top */}
              {[0.5, -0.7].map((f, k) => (
                <mesh
                  key={k}
                  position={[Math.sin(b.lean) * 0.3, b.len * 0.72, 0]}
                  rotation={[0, 0, f]}
                  castShadow
                >
                  <cylinderGeometry args={[0.004, 0.007, b.len * 0.3, 6]} />
                  <meshStandardMaterial color="#8d7c63" roughness={0.95} />
                </mesh>
              ))}
            </group>
          );
        })}
      </group>
    </Selectable>
  );
}

function Pendant() {
  const time = useSceneStore((s) => TIME_PRESETS[s.time]);
  const style = useSceneStore((s) => STYLE_PRESETS[s.style]);
  return (
    <group position={[0, ROOM.h, 1.75]}>
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 1.1, 8]} />
        <Surface color={style.colors.metal} kind="metal" />
      </mesh>
      <mesh position={[0, -1.16, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.28, 0.3, 32, 1, true]} />
        <meshStandardMaterial
          color="#f3ead6"
          emissive="#ffdfb0"
          emissiveIntensity={0.12 + time.lamp * 1.3}
          roughness={0.85}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[0, -1.28, 0]} distance={5} decay={2} intensity={0.35 + time.lamp * 5.5} color="#ffd6a2" />
    </group>
  );
}

/* ------------------------------------------------------------------ *
 * Lighting + environment
 * ------------------------------------------------------------------ */

function LightingRig() {
  const time = useSceneStore((s) => s.time);
  const preset = TIME_PRESETS[time];
  const quality = useSceneStore((s) => s.quality);
  const sun = useRef<THREE.DirectionalLight>(null);
  const amb = useRef<THREE.AmbientLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const { gl, scene } = useThree();

  const sunTargetPos = useMemo(() => new THREE.Vector3(...preset.sun.position), [preset]);
  const sunColor = useMemo(() => new THREE.Color(preset.sun.color), [preset]);
  const ambColor = useMemo(() => new THREE.Color(preset.ambient.color), [preset]);
  const fogColor = useMemo(() => new THREE.Color(preset.fog), [preset]);

  useEffect(() => {
    scene.fog = new THREE.Fog(preset.fog, 13, 30);
    return () => void (scene.fog = null);
  }, [scene, preset.fog]);

  useClampedFrame((_, dt) => {
    const t = 1 - Math.pow(0.02, dt);
    if (sun.current) {
      sun.current.position.lerp(sunTargetPos, t);
      sun.current.color.lerp(sunColor, t);
      sun.current.intensity += (preset.sun.intensity - sun.current.intensity) * t;
    }
    if (amb.current) {
      amb.current.color.lerp(ambColor, t);
      amb.current.intensity += (preset.ambient.intensity - amb.current.intensity) * t;
    }
    if (hemi.current) hemi.current.intensity += (preset.hemi.intensity - hemi.current.intensity) * t;
    gl.toneMappingExposure += (preset.exposure - gl.toneMappingExposure) * t;
    if (scene.fog && "color" in scene.fog) (scene.fog.color as THREE.Color).lerp(fogColor, t);
  });

  const shadowMap = quality === "high" ? 1536 : quality === "medium" ? 1024 : 512;

  return (
    <>
      <ambientLight ref={amb} intensity={preset.ambient.intensity} color={preset.ambient.color} />
      <hemisphereLight
        ref={hemi}
        intensity={preset.hemi.intensity}
        color={preset.hemi.sky}
        groundColor={preset.hemi.ground}
      />
      <directionalLight
        ref={sun}
        position={preset.sun.position}
        intensity={preset.sun.intensity}
        color={preset.sun.color}
        castShadow={quality !== "low"}
        shadow-mapSize-width={shadowMap}
        shadow-mapSize-height={shadowMap}
        shadow-camera-near={0.5}
        shadow-camera-far={22}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0004}
        shadow-normalBias={0.025}
      />
      <rectAreaLight
        position={[-ROOM.w / 2 + 0.12, ROOM.h / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        width={ROOM.d - 1.7}
        height={ROOM.h - 1.7}
        intensity={preset.windowIntensity * 1.3}
        color={preset.windowColor}
      />
      {/* one warm grazing wash down the media wall */}
      <spotLight
        position={[0, ROOM.h - 0.2, -ROOM.d / 2 + 1.1]}
        angle={0.7}
        penumbra={0.9}
        distance={5}
        decay={2}
        intensity={2.4 + preset.lamp * 2}
        color="#ffe6c4"
      />
    </>
  );
}

function LocalEnvironment() {
  return (
    <Environment resolution={64} frames={1}>
      <Lightformer intensity={1.7} position={[-5, 2.2, 0]} scale={[4, 6, 1]} color="#f7efdd" />
      <Lightformer intensity={0.8} position={[4, 3, 3]} scale={[4, 4, 1]} color="#efe6d5" />
      <Lightformer intensity={0.5} position={[0, 5, -4]} scale={[8, 3, 1]} color="#fff8ec" />
    </Environment>
  );
}

function Composition() {
  return (
    <group>
      <Room />
      <Rug />
      <Sofa />
      <LoungeChair />
      <CoffeeTable />
      <FloorLamp />
      <MediaWall />
      <Artwork />
      <FloorVase />
      <Pendant />
      <ContactShadows
        position={[0, 0.012, 0.8]}
        scale={10.5}
        blur={2.6}
        opacity={0.5}
        far={4.5}
        frames={40}
        resolution={384}
        color="#241d13"
      />
    </group>
  );
}

export function SceneContents() {
  const clearSel = useSceneStore((s) => s.select);
  return (
    <group onPointerMissed={() => clearSel(null)}>
      <LocalEnvironment />
      <LightingRig />
      <Composition />
    </group>
  );
}

export { ROOM };
