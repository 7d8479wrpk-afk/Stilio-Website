"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger delay in ms. */
  delay?: number;
}

/**
 * Scroll-reveal that never hides content from crawlers or no-JS users.
 *
 * Content renders visible. On mount, if the element sits below the fold and the
 * user hasn't asked for reduced motion, it's hidden and then revealed when it
 * scrolls into view. Elements already on screen are left untouched.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<"static" | "hidden" | "shown">("static");

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const rect = node.getBoundingClientRect();
    const belowFold = rect.top > window.innerHeight * 0.9;
    if (!belowFold) return;

    setState("hidden");
    const show = () => {
      setState("shown");
      observer.disconnect();
      node.removeEventListener("focusin", show);
      window.clearTimeout(safety);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) show();
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    observer.observe(node);
    // reveal immediately if a keyboard user tabs into hidden content
    node.addEventListener("focusin", show);
    const safety = window.setTimeout(show, 3000);
    return () => {
      window.clearTimeout(safety);
      observer.disconnect();
      node.removeEventListener("focusin", show);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        state !== "static" &&
          "transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
        state === "hidden" && "translate-y-4 opacity-0 will-change-[opacity,transform]",
        className,
      )}
      style={delay && state !== "static" ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
