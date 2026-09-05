"use client";

import { useCallback, useId, useRef, useState, type CSSProperties } from "react";
import type { Photo } from "@/lib/photography";
import { cn } from "@/lib/cn";
import { AppImage } from "@/components/ui/AppImage";
import { Chevrons } from "@/components/ui/icons";

/**
 * Accessible reveal slider between two images. Not a fake "before/after" —
 * labels are caller-supplied and honest. Drag begins only on a clearly
 * horizontal gesture or on the handle, so a vertical swipe scrolls the page.
 *
 * The divider position is driven by a `--p` CSS variable set imperatively while
 * dragging, so a pointer drag doesn't re-render React on every move; state is
 * only committed on release (and on keyboard input) to keep the range input,
 * its `aria-valuetext`, and the visual in sync.
 */
export function Compare({
  before,
  after,
  beforeLabel,
  afterLabel,
  className,
  sizes = "100vw",
}: {
  before: Photo;
  after: Photo;
  beforeLabel: string;
  afterLabel: string;
  className?: string;
  sizes?: string;
}) {
  const [pos, setPos] = useState(50);
  const posRef = useRef(50);
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ active: boolean; startX: number; startY: number; decided: boolean }>({
    active: false,
    startX: 0,
    startY: 0,
    decided: false,
  });
  const labelId = useId();

  // visual-only update — no React state, no re-render
  const paint = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    posRef.current = next;
    el.style.setProperty("--p", `${next}%`);
  }, []);

  const commit = useCallback(() => {
    drag.current.active = false;
    setPos(Math.round(posRef.current));
  }, []);

  return (
    <div
      ref={ref}
      style={{ "--p": `${pos}%` } as CSSProperties}
      className={cn(
        "relative aspect-[16/10] w-full touch-pan-y select-none overflow-hidden bg-[color:var(--color-surface-deep)]",
        className,
      )}
      onPointerDown={(e) => {
        const onHandle = (e.target as HTMLElement).closest("[data-compare-handle]");
        drag.current = {
          active: true,
          startX: e.clientX,
          startY: e.clientY,
          decided: Boolean(onHandle),
        };
        if (onHandle) {
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          paint(e.clientX);
        }
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d.active) return;
        if (!d.decided) {
          const dx = Math.abs(e.clientX - d.startX);
          const dy = Math.abs(e.clientY - d.startY);
          if (dx < 6 && dy < 6) return;
          if (dy > dx) {
            drag.current.active = false; // vertical → let the page scroll
            return;
          }
          drag.current.decided = true;
          (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        }
        paint(e.clientX);
      }}
      onPointerUp={commit}
      onPointerCancel={commit}
    >
      <AppImage src={after.src} alt={after.alt} fill sizes={sizes} className="object-cover" />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: "inset(0 calc(100% - var(--p)) 0 0)" }}
      >
        <AppImage src={before.src} alt={before.alt} fill sizes={sizes} className="object-cover" />
      </div>

      <label id={labelId} className="sr-only">
        Reveal slider between {beforeLabel} and {afterLabel}
      </label>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        aria-labelledby={labelId}
        aria-valuetext={`${pos}% — ${pos > 50 ? beforeLabel : afterLabel} in view`}
        onChange={(e) => {
          const v = Number(e.target.value);
          posRef.current = v;
          ref.current?.style.setProperty("--p", `${v}%`);
          setPos(v);
        }}
        className="peer absolute inset-x-0 bottom-0 z-10 h-11 w-full cursor-ew-resize opacity-0"
      />

      <span className="pointer-events-none absolute left-4 top-4 bg-[color:var(--color-onyx)]/70 px-3 py-1.5 font-sans text-micro uppercase tracking-[0.2em] text-[color:var(--color-marble)] backdrop-blur-sm">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute right-4 top-4 bg-[color:var(--color-onyx)]/70 px-3 py-1.5 font-sans text-micro uppercase tracking-[0.2em] text-[color:var(--color-marble)] backdrop-blur-sm">
        {afterLabel}
      </span>

      <div
        className="pointer-events-none absolute inset-y-0 w-px bg-[color:var(--color-marble)]"
        style={{ left: "var(--p)" }}
        aria-hidden
      />
      <span
        data-compare-handle
        aria-hidden
        style={{ left: "var(--p)" }}
        className="pointer-events-auto absolute top-1/2 z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-[color:var(--color-marble)] bg-[color:var(--color-onyx)]/45 text-[color:var(--color-marble)] backdrop-blur-sm peer-focus-visible:ring-2 peer-focus-visible:ring-[color:var(--color-marble)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-transparent"
      >
        <Chevrons width={16} height={16} />
      </span>
    </div>
  );
}
