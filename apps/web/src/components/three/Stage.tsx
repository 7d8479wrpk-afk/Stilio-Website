"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { StageFallback } from "./StageFallback";
import { SceneControls } from "./SceneControls";
import { ObjectInspector } from "./ObjectInspector";
import { useSceneStore } from "./store";
import { Loader } from "@/components/ui/Loader";

const SceneCanvas = dynamic(() => import("./SceneCanvas").then((m) => m.SceneCanvas), {
  ssr: false,
  loading: () => <StageLoader />,
});

const HINT_KEY = "stilio.stage-explored";

function StageLoader() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[color:#e9e6dd]">
      <div className="flex flex-col items-center gap-4">
        <span className="font-display text-[1.4rem] tracking-[0.3em] text-[color:var(--color-ink-2)]">
          STILIO
        </span>
        <Loader label="Loading the interactive room" />
      </div>
    </div>
  );
}

export function Stage() {
  const [failed, setFailed] = useState(false);
  const ready = useSceneStore((s) => s.ready);
  const hovered = useSceneStore((s) => s.hovered);
  const selected = useSceneStore((s) => s.selected);
  const hover = useSceneStore((s) => s.hover);
  const [hintGone, setHintGone] = useState(false);

  const onFallback = useCallback(() => setFailed(true), []);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(HINT_KEY)) setHintGone(true);
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    if (hovered || selected) {
      setHintGone(true);
      try {
        sessionStorage.setItem(HINT_KEY, "1");
      } catch {
        /* noop */
      }
    }
  }, [hovered, selected]);

  useEffect(() => {
    const t = setTimeout(() => setHintGone(true), 12000);
    return () => clearTimeout(t);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="absolute inset-0 overflow-hidden"
        onPointerLeave={() => {
          hover(null);
          if (typeof document !== "undefined") document.body.style.cursor = "";
        }}
      >
        {failed ? (
          <StageFallback />
        ) : (
          <>
            <SceneCanvas onFallback={onFallback} />
            <SceneControls />
            <ObjectInspector />

            <AnimatePresence>
              {ready && !hintGone ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, delay: 1.1 }}
                  className="pointer-events-none absolute bottom-[5.5rem] left-[var(--page-x)] z-10 border border-[color:var(--color-marble)]/16 bg-[color:var(--color-onyx)]/62 px-3 py-2 font-sans text-micro uppercase tracking-[0.22em] text-[color:var(--color-marble)]/85 backdrop-blur-sm md:bottom-24 md:left-auto md:right-[var(--page-x)]"
                >
                  Drag to look around &nbsp;·&nbsp; tap a piece, or use the controls
                </motion.p>
              ) : null}
            </AnimatePresence>
          </>
        )}
      </div>
    </MotionConfig>
  );
}
