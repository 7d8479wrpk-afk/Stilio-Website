import { cn } from "@/lib/cn";

/**
 * Stilio mark — a thin horizontal hexagon with an abstract plan subdivision,
 * echoing the studio's brand mark. Pure strokes, currentColor for the frame,
 * gold for the plan lines.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 72 44"
      fill="none"
      aria-hidden
      className={cn("h-full w-auto", className)}
    >
      <path
        d="M36 2 70 22 36 42 2 22Z"
        stroke="currentColor"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
      <g stroke="var(--color-gold)" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.9">
        <path d="M20 22 52 22" />
        <path d="M36 8 36 22" />
        <path d="M30 15 44 15" />
        <path d="M44 8 44 22" />
        <path d="M36 22 36 36" />
        <path d="M26 29 46 29" />
      </g>
    </svg>
  );
}

export function Logo({
  className,
  tagline = true,
  onDark = false,
}: {
  className?: string;
  tagline?: boolean;
  onDark?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-3",
        onDark ? "text-[color:var(--color-marble)]" : "text-[color:var(--color-ink)]",
        className,
      )}
    >
      <LogoMark className="h-6 shrink-0 md:h-7" />
      <span className="flex flex-col leading-none">
        <span
          className="font-display text-[1.4rem] font-medium tracking-[0.14em] md:text-[1.55rem]"
          style={{ fontFeatureSettings: '"case" 1' }}
        >
          STILIO
        </span>
        {tagline ? (
          <span
            className={cn(
              "mt-1 font-sans text-micro font-medium uppercase tracking-[0.34em]",
              onDark ? "text-[color:var(--color-on-onyx-3)]" : "text-[color:var(--color-ink-3)]",
            )}
          >
            Interior Design &amp; Renovation
          </span>
        ) : null}
      </span>
    </span>
  );
}
