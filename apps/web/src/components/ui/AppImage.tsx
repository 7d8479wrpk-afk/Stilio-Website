"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * next/image with a loading skeleton and a graceful failure state.
 *
 * Drop-in for `<Image fill>` inside any `position: relative` wrapper (every
 * `<figure>` / image `<span>` in this app already is one). A placeholder sits
 * on top of the frame while the photo loads and fades away once it's ready;
 * if the photo fails, the frame keeps a quiet "image unavailable" mark instead
 * of collapsing or showing the browser's broken-image glyph. The wrapped
 * `<Image>`'s own className is left untouched, so hover/scale transitions on
 * project and material cards still work.
 */
export function AppImage({ className, onLoad, onError, alt, ...props }: ImageProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  return (
    <>
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-[1] flex items-center justify-center transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          status === "loading" && "skeleton",
          status === "error" && "bg-[color:var(--color-surface-deep)]",
          status === "ready" && "opacity-0",
        )}
      >
        {status === "error" ? (
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-[color:var(--color-ink-3)]"
          >
            <rect x="3" y="4" width="18" height="16" rx="1" />
            <path d="m3 16 5-5 4 4 3-3 6 6" />
            <circle cx="9" cy="9" r="1.4" />
          </svg>
        ) : null}
      </span>
      {status === "error" ? (
        <span className="sr-only">{alt ? `${alt} (image unavailable)` : "Image unavailable"}</span>
      ) : null}
      <Image
        {...props}
        alt={alt}
        className={className}
        onLoad={(e) => {
          setStatus("ready");
          onLoad?.(e);
        }}
        onError={(e) => {
          setStatus("error");
          onError?.(e);
        }}
      />
    </>
  );
}
