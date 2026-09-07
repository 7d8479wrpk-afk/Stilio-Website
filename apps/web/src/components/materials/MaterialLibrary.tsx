"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { AppImage } from "@/components/ui/AppImage";
import { photos, type Photo } from "@/lib/photography";
import { materialCategories, materials, type MaterialCategory } from "@/lib/materials";

function Palette({ colors, className }: { colors: string[]; className?: string }) {
  return (
    <span className={cn("flex", className)} aria-hidden>
      {colors.map((c, i) => (
        <span key={i} className="h-full flex-1" style={{ background: c }} />
      ))}
    </span>
  );
}

export function MaterialLibrary() {
  const [category, setCategory] = useState<MaterialCategory | "All">("All");

  const list =
    category === "All" ? materials : materials.filter((m) => m.category === category);

  return (
    <div className="shell">
      <h2 className="sr-only">The material library</h2>
      <div
        role="group"
        aria-label="Filter materials by category"
        className="-mx-1 flex flex-wrap gap-x-1 border-b border-[color:var(--color-line)] pb-3"
      >
        {(["All", ...materialCategories] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={cn(
              "min-h-11 px-3 font-sans text-meta uppercase tracking-[0.2em] transition-colors",
              category === c
                ? "text-[color:var(--color-ink)]"
                : "text-[color:var(--color-ink-3)] hover:text-[color:var(--color-ink)]",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="mt-10 text-[0.95rem] text-[color:var(--color-ink-3)]">
          No materials in this category yet —{" "}
          <button
            type="button"
            onClick={() => setCategory("All")}
            className="link-underline text-[color:var(--color-ink)]"
          >
            see the full library
          </button>
          .
        </p>
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((m) => {
            const p: Photo = photos[m.photo];
            return (
            <li key={m.slug}>
              <Link href={`/materials/${m.slug}`} className="group block">
                <span className="relative block aspect-[4/3] w-full overflow-hidden bg-[color:var(--color-surface-deep)] shadow-[var(--shadow-panel)]">
                  <AppImage
                    src={p.src}
                    alt={p.alt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    style={p.focus ? { objectPosition: p.focus } : undefined}
                  />
                  <span
                    className="absolute bottom-3 left-3 h-11 w-11 border border-[color:var(--color-marble)]/40 shadow-[0_2px_10px_-2px_rgba(22,20,15,0.5)]"
                    style={{ background: m.swatch }}
                    aria-hidden
                  />
                </span>

                <span className="mt-3 flex items-baseline justify-between gap-3">
                  <span className="font-display text-[1.15rem] leading-tight text-[color:var(--color-ink)]">
                    {m.name}
                  </span>
                  <span className="font-sans text-micro uppercase tracking-[0.18em] text-[color:var(--color-ink-3)]">
                    {m.category}
                    {m.previewable ? " · 3D" : ""}
                  </span>
                </span>

                <Palette
                  colors={m.palette}
                  className="mt-2 h-6 w-full border border-[color:var(--color-line)]"
                />
              </Link>
            </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
