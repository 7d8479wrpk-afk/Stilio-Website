"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { AppImage } from "@/components/ui/AppImage";
import { Close } from "@/components/ui/icons";
import { photos, type Photo } from "@/lib/photography";
import {
  materialCategories,
  materials,
  type Material,
  type MaterialCategory,
} from "@/lib/materials";
import { useFocusTrap, useInertBackground } from "@/hooks/useFocusTrap";
import { usePresence } from "@/hooks/usePresence";

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
  const [active, setActive] = useState<Material | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const headingId = useId();

  const list =
    category === "All" ? materials : materials.filter((m) => m.category === category);

  const open = (mat: Material) => setActive(mat);
  // focus restoration on close is handled by useFocusTrap below
  const close = () => setActive(null);

  const lastActive = useRef<Material | null>(null);
  if (active) lastActive.current = active;
  const { mounted, shown } = usePresence(Boolean(active), 350);
  const drawer = active ?? lastActive.current; // keep content through the exit transition

  // screen-reader virtual cursors ignore Tab order, so hide the page behind
  // the drawer too — declared before useFocusTrap so its cleanup (removing
  // `inert`) runs before the trap tries to refocus the opener
  useInertBackground(Boolean(active), ["header", "footer", "#material-grid"]);
  useFocusTrap(Boolean(active), drawerRef, close);

  return (
    <div className="shell">
      <div id="material-grid">
      <div
        role="group"
        aria-label="Filter materials by category"
        className="-mx-1 flex flex-wrap border-b border-[color:var(--color-line)] pb-3"
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
              <button
                type="button"
                onClick={() => open(m)}
                className="group w-full text-left"
              >
                <span className="relative block aspect-[4/3] w-full overflow-hidden bg-[color:var(--color-surface-deep)] shadow-[var(--shadow-panel)]">
                  <AppImage
                    src={p.src}
                    alt={p.alt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    style={p.focus ? { objectPosition: p.focus } : undefined}
                  />
                  {/* the material's own colour, sampled onto the image */}
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
              </button>
            </li>
          );
        })}
      </ul>
      )}
      </div>

      {mounted && drawer ? (
        <div
          className={cn(
            "fixed inset-0 z-[160] flex justify-end bg-[color:var(--color-onyx)]/45 backdrop-blur-sm transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            shown ? "opacity-100" : "opacity-0",
          )}
          onClick={close}
        >
          <aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            className={cn(
              "h-full w-[min(32rem,94vw)] overflow-y-auto bg-[color:var(--color-canvas)] shadow-[var(--shadow-float)] transition-transform duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
              shown ? "translate-x-0" : "translate-x-full",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[5/4] w-full bg-[color:var(--color-surface-deep)]">
              {(() => {
                const ap: Photo = photos[drawer.photo];
                return (
                  <AppImage
                    src={ap.src}
                    alt={ap.alt}
                    fill
                    sizes="32rem"
                    className="object-cover"
                    style={ap.focus ? { objectPosition: ap.focus } : undefined}
                  />
                );
              })()}
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close material details"
                className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center border border-[color:var(--color-marble)]/25 bg-[color:var(--color-onyx)]/55 text-[color:var(--color-marble)] backdrop-blur-sm hover:bg-[color:var(--color-onyx)]/75"
              >
                <Close width={16} height={16} />
              </button>
              <Palette colors={drawer.palette} className="absolute inset-x-0 bottom-0 z-10 h-2.5" />
            </div>

            <div className="p-8 md:p-10">
              <p className="font-sans text-micro uppercase tracking-[0.24em] text-[color:var(--color-gold-ink)]">
                {drawer.category}
              </p>
              <h2
                id={headingId}
                className="mt-2 font-display text-[2rem] font-normal text-[color:var(--color-ink)]"
              >
                {drawer.name}
              </h2>

              <div className="mt-6">
                <p className="font-sans text-micro uppercase tracking-[0.2em] text-[color:var(--color-ink-3)]">
                  Coordinated palette
                </p>
                <ul className="mt-3 grid grid-cols-4 gap-2">
                  {drawer.palette.map((c) => (
                    <li key={c} className="flex flex-col gap-1.5">
                      <span
                        className="block aspect-square w-full border border-[color:var(--color-line-strong)]"
                        style={{ background: c }}
                        aria-hidden
                      />
                      <span className="font-sans text-micro uppercase tracking-[0.08em] text-[color:var(--color-ink-3)]">
                        {c}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <dl className="mt-7 space-y-4">
                {[
                  ["Type", drawer.type],
                  ["Texture", drawer.texture],
                  ["Where we use it", drawer.usage],
                ].map(([label, value]) => (
                  <div key={label} className="border-t border-[color:var(--color-line)] pt-3">
                    <dt className="font-sans text-micro uppercase tracking-[0.2em] text-[color:var(--color-ink-3)]">
                      {label}
                    </dt>
                    <dd className="mt-1.5 text-[0.95rem] leading-relaxed text-[color:var(--color-ink-2)]">
                      {value}
                    </dd>
                  </div>
                ))}
                <div className="border-t border-[color:var(--color-line)] pt-3">
                  <dt className="font-sans text-micro uppercase tracking-[0.2em] text-[color:var(--color-ink-3)]">
                    Compatible styles
                  </dt>
                  <dd className="mt-2 flex flex-wrap gap-1.5">
                    {drawer.styles.map((s) => (
                      <span
                        key={s}
                        className="border border-[color:var(--color-line-strong)] px-2.5 py-1 text-meta text-[color:var(--color-ink-2)]"
                      >
                        {s}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>

              {drawer.previewable ? (
                <Link
                  href="/#experience"
                  className="mt-8 inline-flex min-h-11 w-full items-center justify-center bg-[color:var(--color-onyx)] px-6 py-3.5 font-sans text-meta uppercase tracking-[0.2em] text-[color:var(--color-marble)] hover:bg-[color:var(--color-espresso)]"
                >
                  See it in the room
                </Link>
              ) : (
                <p className="mt-8 text-caption leading-relaxed text-[color:var(--color-ink-3)]">
                  Available as a physical sample during design development.
                </p>
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
