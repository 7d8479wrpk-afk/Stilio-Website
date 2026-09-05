"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useSceneStore } from "./store";
import { cn } from "@/lib/cn";
import {
  PIECES,
  STYLE_ORDER,
  STYLE_PRESETS,
  TIME_ORDER,
  TIME_PRESETS,
  type PieceId,
  type QualityId,
} from "@/lib/three/config";

const panel =
  "border border-[color:var(--color-marble)]/16 bg-[color:var(--color-onyx)]/88 backdrop-blur-md";

function Segmented<T extends string>({
  label,
  items,
  value,
  onChange,
  optionLabel,
  wrap = false,
}: {
  label: string;
  items: readonly T[];
  value: T;
  onChange: (v: T) => void;
  optionLabel: (v: T) => string;
  wrap?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        panel,
        "flex gap-0.5 p-1",
        wrap
          ? "flex-wrap md:flex-nowrap md:overflow-x-auto md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden"
          : "overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
      )}
    >
      {items.map((it) => (
        <button
          key={it}
          type="button"
          onClick={() => onChange(it)}
          aria-pressed={it === value}
          className={cn(
            "flex min-h-11 shrink-0 items-center whitespace-nowrap px-3.5 font-sans text-meta uppercase tracking-[0.16em] transition-colors",
            it === value
              ? "bg-[color:var(--color-marble)] text-[color:var(--color-onyx)]"
              : "text-[color:var(--color-marble)]/85 hover:text-[color:var(--color-marble)]",
          )}
        >
          {optionLabel(it)}
        </button>
      ))}
    </div>
  );
}

export function SceneControls() {
  const style = useSceneStore((s) => s.style);
  const setStyle = useSceneStore((s) => s.setStyle);
  const time = useSceneStore((s) => s.time);
  const setTime = useSceneStore((s) => s.setTime);
  const resetCamera = useSceneStore((s) => s.resetCamera);
  const ready = useSceneStore((s) => s.ready);

  return (
    <motion.div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-20"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 16 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
    >
      {/* Keyboard-only: hidden until a keyboard user tabs in (mouse/touch users
          just click a piece in the 3D scene directly). */}
      <div className="shell mb-2.5 sr-only focus-within:not-sr-only focus-within:pointer-events-auto">
        <PiecePicker />
      </div>
      <div className="shell flex flex-col gap-2.5 pb-4 md:flex-row md:items-end md:justify-between md:pb-7">
        <div className="pointer-events-auto min-w-0">
          <p className="mb-1.5 font-sans text-micro uppercase tracking-[0.24em] text-[color:var(--color-champagne)]">
            Design style
          </p>
          <Segmented
            label="Design style"
            items={STYLE_ORDER}
            value={style}
            onChange={setStyle}
            optionLabel={(s) => STYLE_PRESETS[s].label}
            wrap
          />
        </div>

        <div className="pointer-events-auto flex items-end gap-2">
          <div className="min-w-0">
            <p className="mb-1.5 font-sans text-micro uppercase tracking-[0.24em] text-[color:var(--color-champagne)] md:text-right">
              Light
            </p>
            <Segmented
              label="Lighting"
              items={TIME_ORDER}
              value={time}
              onChange={setTime}
              optionLabel={(t) => TIME_PRESETS[t].label}
            />
          </div>

          <button
            type="button"
            onClick={resetCamera}
            className={cn(
              panel,
              "flex h-11 shrink-0 items-center gap-2 px-3.5 font-sans text-meta uppercase tracking-[0.16em] text-[color:var(--color-marble)]/85 transition-colors hover:text-[color:var(--color-marble)]",
            )}
            aria-label="Reset the camera to the default view"
          >
            <ResetIcon />
            <span className="hidden lg:inline">Reset</span>
          </button>

          <QualityMenu />
        </div>
      </div>
    </motion.div>
  );
}

/**
 * A keyboard-operable way into per-piece material options — the canvas selects
 * pieces via a pointer raycaster, which keyboard/screen-reader users can't use.
 * Drives the same `select` store action the 3D scene does.
 */
function PiecePicker() {
  const selected = useSceneStore((s) => s.selected);
  const select = useSceneStore((s) => s.select);
  return (
    <div className="pointer-events-auto min-w-0">
      <p className="mb-1.5 font-sans text-micro uppercase tracking-[0.24em] text-[color:var(--color-champagne)]">
        Pieces
      </p>
      <div
        role="group"
        aria-label="Select a piece to see its materials"
        className={cn(
          panel,
          "flex gap-0.5 overflow-x-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {(Object.keys(PIECES) as PieceId[]).map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={selected === id}
            onClick={() => select(selected === id ? null : id)}
            className={cn(
              "flex min-h-11 shrink-0 items-center whitespace-nowrap px-3.5 font-sans text-meta uppercase tracking-[0.16em] transition-colors",
              selected === id
                ? "bg-[color:var(--color-marble)] text-[color:var(--color-onyx)]"
                : "text-[color:var(--color-marble)]/85 hover:text-[color:var(--color-marble)]",
            )}
          >
            {PIECES[id].name}
          </button>
        ))}
      </div>
    </div>
  );
}

function QualityMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const quality = useSceneStore((s) => s.quality);
  const setQuality = useSceneStore((s) => s.setQuality);
  const setAuto = useSceneStore((s) => s.setAutoQuality);
  const auto = useSceneStore((s) => s.autoQuality);
  const options: { id: QualityId | "auto"; label: string }[] = [
    { id: "auto", label: "Automatic" },
    { id: "high", label: "High" },
    { id: "medium", label: "Medium" },
    { id: "low", label: "Low" },
  ];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="quality-panel"
        aria-label="Rendering quality"
        className={cn(
          panel,
          "flex h-11 w-11 items-center justify-center text-[color:var(--color-marble)]/85 transition-colors hover:text-[color:var(--color-marble)]",
        )}
      >
        <GaugeIcon />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            id="quality-panel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className={cn(panel, "absolute bottom-[52px] right-0 w-40 p-1")}
          >
            {options.map((o) => {
              const active = o.id === "auto" ? auto : !auto && quality === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    if (o.id === "auto") setAuto(true);
                    else setQuality(o.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex min-h-11 w-full items-center px-3 font-sans text-meta uppercase tracking-[0.14em] transition-colors",
                    active
                      ? "bg-[color:var(--color-marble)] text-[color:var(--color-onyx)]"
                      : "text-[color:var(--color-marble)]/85 hover:text-[color:var(--color-marble)]",
                  )}
                >
                  {o.label}
                </button>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function ResetIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GaugeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 18a8 8 0 1 1 16 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 18l4-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
