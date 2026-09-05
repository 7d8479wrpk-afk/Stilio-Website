"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import {
  Bloom,
  BrightnessContrast,
  EffectComposer,
  HueSaturation,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { ROOM, SceneContents } from "./scene";
import { useSceneStore } from "./store";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import type { QualityId } from "@/lib/three/config";

type OrbitControlsImpl = React.ComponentRef<typeof OrbitControls>;

const HOME = {
  position: new THREE.Vector3(2.9, 1.5, 7.7),
  target: new THREE.Vector3(-0.25, 0.86, 0.9),
};

function detectWebGL(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") ||
      canvas.getContext("webgl")) as WebGLRenderingContext | null;
    const ok = Boolean(gl);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return ok;
  } catch {
    return false;
  }
}

function detectQuality(): QualityId {
  if (typeof navigator === "undefined") return "high";
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  if (coarse && (cores <= 6 || mem <= 4)) return "low";
  if (coarse || cores <= 4 || mem <= 4) return "medium";
  return "high";
}

/**
 * frameloop is "demand": the scene only re-renders on request. This pumps a
 * short burst of frames whenever the design changes so the eased transitions
 * play out, then goes quiet. OrbitControls pumps its own frames while dragging.
 */
function Invalidator() {
  const { invalidate } = useThree();
  const style = useSceneStore((s) => s.style);
  const time = useSceneStore((s) => s.time);
  const materials = useSceneStore((s) => s.materials);
  const selected = useSceneStore((s) => s.selected);
  const hovered = useSceneStore((s) => s.hovered);
  const resetKey = useSceneStore((s) => s.cameraResetKey);

  useEffect(() => {
    let raf = 0;
    const until = performance.now() + 1500;
    const pump = () => {
      invalidate();
      if (performance.now() < until) raf = requestAnimationFrame(pump);
    };
    pump();
    return () => cancelAnimationFrame(raf);
  }, [invalidate, style, time, materials, selected, hovered, resetKey]);

  // one gentle intro settle
  useEffect(() => {
    let raf = 0;
    const until = performance.now() + 1200;
    const pump = () => {
      invalidate();
      if (performance.now() < until) raf = requestAnimationFrame(pump);
    };
    raf = requestAnimationFrame(pump);
    return () => cancelAnimationFrame(raf);
  }, [invalidate]);

  return null;
}

function CameraRig() {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera, invalidate } = useThree();
  const resetKey = useSceneStore((s) => s.cameraResetKey);
  const anim = useRef({ active: false, t: 0, from: new THREE.Vector3(), fromT: new THREE.Vector3() });

  useEffect(() => {
    camera.position.copy(HOME.position);
  }, [camera]);

  useEffect(() => {
    if (resetKey === 0) return;
    const c = controls.current;
    if (!c) return;
    anim.current = { active: true, t: 0, from: camera.position.clone(), fromT: c.target.clone() };
    invalidate();
  }, [resetKey, camera, invalidate]);

  useFrame((_, dt) => {
    const c = controls.current;
    if (!c) return;
    const a = anim.current;
    if (a.active) {
      a.t = Math.min(1, a.t + dt / 1.1);
      const e = 1 - Math.pow(1 - a.t, 3);
      camera.position.lerpVectors(a.from, HOME.position, e);
      c.target.lerpVectors(a.fromT, HOME.target, e);
      if (a.t >= 1) a.active = false;
      else invalidate();
    }
    c.update();
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      target={HOME.target}
      enablePan={false}
      /* wheel-zoom traps page scroll over the canvas — rotate-only keeps the
         page scrollable while still letting people look around */
      enableZoom={false}
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={0.42}
      minDistance={5}
      maxDistance={11}
      minPolarAngle={Math.PI * 0.32}
      maxPolarAngle={Math.PI * 0.5}
      minAzimuthAngle={-Math.PI * 0.26}
      maxAzimuthAngle={Math.PI * 0.26}
    />
  );
}

function ShadowRefresher() {
  const { gl, invalidate } = useThree();
  const style = useSceneStore((s) => s.style);
  const time = useSceneStore((s) => s.time);
  const materials = useSceneStore((s) => s.materials);
  useEffect(() => {
    gl.shadowMap.needsUpdate = true;
    invalidate();
  }, [gl, invalidate, style, time, materials]);
  return null;
}

function ReadySignal() {
  const setReady = useSceneStore((s) => s.setReady);
  const done = useRef(false);
  useFrame(() => {
    if (!done.current) {
      done.current = true;
      setReady(true);
    }
  });
  return null;
}

function Post({ quality }: { quality: QualityId }) {
  const reduced = usePrefersReducedMotion();
  if (quality === "low") return null;
  if (quality === "medium") {
    return (
      <EffectComposer multisampling={0}>
        <BrightnessContrast brightness={-0.03} contrast={0.07} />
        <Vignette eskil={false} offset={0.28} darkness={0.5} blendFunction={BlendFunction.NORMAL} />
      </EffectComposer>
    );
  }
  return (
    <EffectComposer multisampling={4}>
      <Bloom luminanceThreshold={0.9} luminanceSmoothing={0.2} intensity={0.22} kernelSize={2} />
      <HueSaturation saturation={-0.05} />
      <BrightnessContrast brightness={-0.03} contrast={0.08} />
      <Vignette
        eskil={false}
        offset={0.26}
        darkness={reduced ? 0.5 : 0.6}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}

export function SceneCanvas({ onFallback }: { onFallback: () => void }) {
  const quality = useSceneStore((s) => s.quality);
  const autoQuality = useSceneStore((s) => s.autoQuality);
  const [supported] = useState(detectWebGL);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    if (!supported) onFallback();
  }, [supported, onFallback]);

  useEffect(() => {
    if (autoQuality) useSceneStore.setState({ quality: detectQuality() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setInView(Boolean(e?.isIntersecting)), {
      threshold: 0.01,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!supported) return null;

  const dpr: [number, number] =
    quality === "low" ? [1, 1] : quality === "medium" ? [1, 1.3] : [1, 1.6];

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0"
      role="img"
      aria-label="3D model of a contemporary living room. Use the Pieces, Design style, Light and Quality controls below to change the room and its materials."
    >
      <Canvas
        frameloop={inView ? "demand" : "never"}
        shadows={quality !== "low"}
        dpr={dpr}
        gl={{
          antialias: quality === "low",
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.72,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor("#ddd8cc", 1);
          gl.shadowMap.autoUpdate = false;
          gl.shadowMap.needsUpdate = true;
        }}
        /* pan-y lets a vertical swipe scroll the page; a horizontal drag rotates */
        style={{ touchAction: "pan-y" }}
      >
        <PerspectiveCamera
          makeDefault
          fov={30}
          position={[HOME.position.x, HOME.position.y, HOME.position.z]}
          near={0.1}
          far={45}
        />
        <CameraRig />
        <Invalidator />
        <ShadowRefresher />
        <ReadySignal />
        <Suspense fallback={null}>
          <SceneContents />
        </Suspense>
        <Post quality={quality} />
      </Canvas>
    </div>
  );
}

export { ROOM };
