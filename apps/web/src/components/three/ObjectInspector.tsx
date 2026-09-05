"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useSceneStore } from "./store";
import { cn } from "@/lib/cn";
import { Close } from "@/components/ui/icons";
import { MATERIAL_OPTIONS, PIECES } from "@/lib/three/config";

export function ObjectInspector() {
  const selected = useSceneStore((s) => s.selected);
  const select = useSceneStore((s) => s.select);
  const materials = useSceneStore((s) => s.materials);
  const setMaterial = useSceneStore((s) => s.setMaterial);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const piece = selected ? PIECES[selected] : null;
  const target = piece?.materialTarget;
  const options = target ? MATERIAL_OPTIONS[target] : [];

  useEffect(() => {
    if (piece) headingRef.current?.focus();
  }, [piece]);

  useEffect(() => {
    if (!piece) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && select(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [piece, select]);

  return (
    <AnimatePresence>
      {piece ? (
        <>
          {/* mobile-only dismiss backdrop */}
          <motion.button
            type="button"
            aria-label="Close details"
            onClick={() => select(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto absolute inset-0 z-20 bg-[color:var(--color-onyx)]/30 md:hidden"
          />
          <motion.aside
            key={piece.id}
            role="region"
            aria-label={`${piece.name} details`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "pointer-events-auto absolute z-20 border border-[color:var(--color-marble)]/16 bg-[color:var(--color-onyx)]/92 backdrop-blur-lg",
              "inset-x-0 bottom-0 max-h-[76svh] overflow-y-auto",
              "md:inset-x-auto md:bottom-auto md:right-[var(--page-x)] md:top-1/2 md:max-h-none md:w-[min(20rem,80vw)] md:-translate-y-1/2 md:overflow-visible",
            )}
          >
            <div className="sticky top-0 flex items-start justify-between gap-4 bg-[color:var(--color-onyx)]/92 px-6 pb-3 pt-6 backdrop-blur-lg">
              <div>
                <p className="font-sans text-micro uppercase tracking-[0.28em] text-[color:var(--color-champagne)]">
                  {piece.collection}
                </p>
                <h3
                  ref={headingRef}
                  tabIndex={-1}
                  className="mt-2 font-display text-[1.7rem] font-normal text-[color:var(--color-marble)] outline-none"
                >
                  {piece.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => select(null)}
                aria-label="Close details"
                className="-m-2.5 flex h-11 w-11 items-center justify-center text-[color:var(--color-marble)]/70 hover:text-[color:var(--color-marble)]"
              >
                <Close width={16} height={16} />
              </button>
            </div>

            <div className="px-6 pb-6">
              <p className="text-[0.9rem] leading-relaxed text-[color:var(--color-marble)]/85">
                {piece.detail}
              </p>
              <p className="mt-3 font-sans text-meta uppercase tracking-[0.18em] text-[color:var(--color-marble)]/60">
                {piece.dimension}
              </p>

              {target ? (
                <div
                  role="group"
                  aria-label={`${piece.name} material`}
                  className="mt-6 border-t border-[color:var(--color-marble)]/14 pt-5"
                >
                  <p className="mb-3 font-sans text-micro uppercase tracking-[0.26em] text-[color:var(--color-champagne)]">
                    Material
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {options.map((o) => {
                      const active = materials[target] === o.id;
                      return (
                        <button
                          key={o.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setMaterial(target, o.id)}
                          className={cn(
                            "flex min-h-11 items-center gap-3 border px-3 py-2.5 text-left transition-colors",
                            active
                              ? "border-[color:var(--color-champagne)] bg-[color:var(--color-marble)]/10"
                              : "border-[color:var(--color-marble)]/14 hover:border-[color:var(--color-marble)]/40",
                          )}
                        >
                          <span
                            aria-hidden
                            className="h-6 w-6 shrink-0 border border-[color:var(--color-marble)]/25"
                            style={{ background: o.color }}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block font-sans text-caption uppercase tracking-[0.12em] text-[color:var(--color-marble)]">
                              {o.label}
                            </span>
                            <span className="block truncate text-meta text-[color:var(--color-marble)]/60">
                              {o.sub}
                            </span>
                          </span>
                          {active ? (
                            <span
                              aria-hidden
                              className="shrink-0 text-meta uppercase tracking-[0.12em] text-[color:var(--color-champagne)]"
                            >
                              On
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
