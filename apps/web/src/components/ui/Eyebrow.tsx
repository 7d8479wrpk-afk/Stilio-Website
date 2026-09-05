import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Eyebrow({
  children,
  className,
  index,
}: {
  children: ReactNode;
  className?: string;
  /** Optional two-digit section index, rendered before the label. */
  index?: string;
}) {
  return (
    <span className={cn("eyebrow inline-flex items-center gap-3", className)}>
      {index ? (
        <>
          <span aria-hidden className="text-[color:var(--color-ink-3)]">
            {index}
          </span>
          <span aria-hidden className="h-px w-6 bg-[color:var(--color-line-strong)]" />
        </>
      ) : null}
      {children}
    </span>
  );
}
