import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ArrowRight } from "@/components/ui/icons";

type Variant = "solid" | "outline" | "quiet" | "contrast";
type Size = "md" | "lg";

const base =
  "group inline-flex min-h-11 select-none items-center justify-center gap-2.5 font-sans uppercase tracking-[0.24em] " +
  "transition-[background-color,color,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] " +
  "focus-visible:outline-2 focus-visible:outline-offset-4 disabled:pointer-events-none disabled:opacity-45";

const sizes: Record<Size, string> = {
  md: "text-meta px-7 py-3.5",
  lg: "text-meta px-9 py-4",
};

const variants: Record<Variant, string> = {
  solid:
    "bg-[color:var(--color-onyx)] text-[color:var(--color-marble)] shadow-[0_1px_2px_rgba(22,20,15,0.1)] hover:bg-[color:var(--color-espresso)]",
  outline:
    "border border-[color:var(--color-line-strong)] text-[color:var(--color-ink)] hover:border-[color:var(--color-onyx)] hover:bg-[color:var(--color-onyx)] hover:text-[color:var(--color-marble)]",
  // min-h-11 keeps the tap target at 44px; the matching negative margin keeps
  // the *visible* text sitting at its original baseline in a gap/stack layout
  quiet:
    "-my-3.5 min-h-11 px-0 py-3.5 text-[color:var(--color-ink-2)] tracking-[0.22em] hover:text-[color:var(--color-ink)] link-underline",
  contrast:
    "bg-[color:var(--color-marble)] text-[color:var(--color-onyx)] hover:bg-[color:var(--color-champagne)]",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  withArrow?: boolean;
}

type ButtonAsButton = CommonProps &
  Omit<ComponentPropsWithoutRef<"button">, "className" | "children"> & { href?: undefined };

type ButtonAsLink = CommonProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, "className" | "children" | "href"> & { href: string };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "solid", size = "md", className, children, withArrow, ...rest } = props;
  const classes = cn(base, sizes[size], variants[variant], className);

  const inner = (
    <>
      <span>{children}</span>
      {withArrow ? (
        <ArrowRight
          width={14}
          height={14}
          className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 motion-reduce:transition-none"
        />
      ) : null}
    </>
  );

  if ("href" in props && props.href) {
    const { href, ...linkRest } = rest as ButtonAsLink;
    return (
      <Link href={href} className={classes} {...linkRest}>
        {inner}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonAsButton)}>
      {inner}
    </button>
  );
}
