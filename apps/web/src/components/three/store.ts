"use client";

import { create } from "zustand";
import {
  DEFAULT_MATERIALS,
  type MaterialTarget,
  type PieceId,
  type QualityId,
  type StyleId,
  type TimeId,
} from "@/lib/three/config";

interface SceneState {
  style: StyleId;
  time: TimeId;
  quality: QualityId;
  autoQuality: boolean;
  materials: Record<MaterialTarget, string>;
  selected: PieceId | null;
  hovered: PieceId | null;
  /** Bumped to request a camera return-to-home. */
  cameraResetKey: number;
  /** True once the canvas has drawn its first frame. */
  ready: boolean;

  setStyle: (s: StyleId) => void;
  setTime: (t: TimeId) => void;
  setQuality: (q: QualityId) => void;
  setAutoQuality: (v: boolean) => void;
  setMaterial: (target: MaterialTarget, id: string) => void;
  select: (p: PieceId | null) => void;
  hover: (p: PieceId | null) => void;
  resetCamera: () => void;
  setReady: (v: boolean) => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  style: "warm",
  time: "day",
  quality: "high",
  autoQuality: true,
  materials: { ...DEFAULT_MATERIALS },
  selected: null,
  hovered: null,
  cameraResetKey: 0,
  ready: false,

  setStyle: (style) => set({ style }),
  setTime: (time) => set({ time }),
  setQuality: (quality) => set({ quality, autoQuality: false }),
  setAutoQuality: (autoQuality) => set({ autoQuality }),
  setMaterial: (target, id) =>
    set((s) => ({ materials: { ...s.materials, [target]: id } })),
  select: (selected) => set({ selected }),
  hover: (hovered) => set({ hovered }),
  resetCamera: () => set((s) => ({ cameraResetKey: s.cameraResetKey + 1, selected: null })),
  setReady: (ready) => set({ ready }),
}));
