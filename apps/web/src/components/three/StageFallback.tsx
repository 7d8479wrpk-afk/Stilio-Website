"use client";

import { AppImage } from "@/components/ui/AppImage";
import { useState } from "react";
import { photos } from "@/lib/photography";
import { STYLE_PRESETS, STYLE_ORDER, type StyleId } from "@/lib/three/config";
import { cn } from "@/lib/cn";

/**
 * Shown when WebGL is unavailable or the device can't run the scene. Still lets
 * the visitor understand the studio's range by stepping through real photography
 * that matches each style.
 */
const STYLE_PHOTO: Record<StyleId, keyof typeof photos> = {
  warm: "livingPenthouseWarm",
  japandi: "livingScandiCalm",
  minimal: "livingMinimalBlackArt",
  organic: "livingWarmMinimal",
  contemporary: "livingMediaWallCity",
  luxury: "livingOpenplanFireplace",
};

export function StageFallback() {
  const [style, setStyle] = useState<StyleId>("warm");
  const p = photos[STYLE_PHOTO[style]];

  return (
    <div className="absolute inset-0">
      <AppImage
        src={p.src}
        alt={p.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: "center" }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[color:var(--color-onyx)]/55 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-[color:#e9e6dd]/80 to-transparent"
      />

      <div className="shell absolute inset-x-0 bottom-5 flex flex-col items-start gap-3 md:bottom-7">
        <p className="font-sans text-micro uppercase tracking-[0.24em] text-[color:var(--color-marble)]/80">
          Interactive 3D unavailable here — showing photography
        </p>
        <div
          role="group"
          aria-label="Design style"
          className="flex flex-wrap gap-0.5 border border-[color:var(--color-marble)]/16 bg-[color:var(--color-onyx)]/88 p-1 backdrop-blur-md"
        >
          {STYLE_ORDER.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStyle(s)}
              aria-pressed={s === style}
              className={cn(
                "flex min-h-11 items-center px-3.5 font-sans text-meta uppercase tracking-[0.16em] transition-colors",
                s === style
                  ? "bg-[color:var(--color-marble)] text-[color:var(--color-onyx)]"
                  : "text-[color:var(--color-marble)]/85 hover:text-[color:var(--color-marble)]",
              )}
            >
              {STYLE_PRESETS[s].label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
