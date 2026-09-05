"use client";

import { useEffect, type RefObject } from "react";

/**
 * Focus trap for a modal-style panel: moves focus into the panel on open,
 * wraps Tab/Shift+Tab so focus never escapes it, closes on Escape, locks
 * page scroll, and restores focus to whatever triggered the panel on close.
 *
 * Shared by NavOverlay and MaterialLibrary, which previously reimplemented
 * this by hand — kept in one place so a future fix (e.g. widening the
 * focusable-element query) only has to happen once.
 */
export function useFocusTrap(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    if (!active) return;
    const opener = document.activeElement as HTMLElement | null;
    const container = containerRef.current;
    const focusables = () =>
      container
        ? Array.from(container.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'))
        : [];

    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const f = focusables();
        if (f.length === 0) return;
        const first = f[0]!;
        const last = f[f.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      opener?.focus();
    };
    // containerRef/onClose intentionally excluded — this should only re-run
    // when the panel opens/closes, not on every render of the caller.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}

/**
 * Hides everything outside a modal-style panel from the accessibility tree
 * (screen-reader virtual cursors ignore Tab order, so the focus trap above
 * isn't enough on its own). Pass the landmark elements that sit behind the
 * panel; they're restored when the panel closes or the component unmounts.
 */
export function useInertBackground(active: boolean, selectors: string[]) {
  useEffect(() => {
    if (!active) return;
    const els = selectors
      .map((s) => document.querySelector<HTMLElement>(s))
      .filter((el): el is HTMLElement => Boolean(el));
    els.forEach((el) => el.setAttribute("inert", ""));
    return () => els.forEach((el) => el.removeAttribute("inert"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}
