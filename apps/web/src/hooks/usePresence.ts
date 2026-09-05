"use client";

import { useEffect, useState } from "react";

/**
 * Keeps a component mounted long enough to play an exit transition after
 * `open` flips to false — the small piece of `AnimatePresence` we actually
 * used. Returns `mounted` (render it at all?) and `shown` (add the "open"
 * classes?). Toggle CSS transitions off `shown`; unmount happens `durationMs`
 * after close.
 */
export function usePresence(open: boolean, durationMs = 300) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // next frame, so the browser sees the "closed" styles first and transitions in
      const raf = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(raf);
    }
    setShown(false);
    const t = setTimeout(() => setMounted(false), durationMs);
    return () => clearTimeout(t);
  }, [open, durationMs]);

  return { mounted, shown };
}
