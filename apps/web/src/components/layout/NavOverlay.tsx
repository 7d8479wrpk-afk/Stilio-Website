"use client";

import Link from "next/link";
import { useRef } from "react";
import { Logo } from "@/components/brand/Logo";
import { Close } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { brand } from "@/lib/tokens";
import { ctaNav, isNavActive, primaryNav } from "@/lib/nav";
import { useFocusTrap, useInertBackground } from "@/hooks/useFocusTrap";
import { usePresence } from "@/hooks/usePresence";

export function NavOverlay({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { mounted, shown } = usePresence(open, 400);

  // declared before useFocusTrap so its cleanup (removing `inert`) runs first —
  // otherwise the trap's opener.focus() would fire while the header is still inert
  useInertBackground(open, ["header", "#main", "footer"]);
  useFocusTrap(open, panelRef, onClose);

  if (!mounted) return null;

  return (
    <div
      ref={panelRef}
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      className={cn(
        "fixed inset-0 z-[150] flex flex-col overflow-y-auto bg-[color:var(--color-onyx)] text-[color:var(--color-marble)] transition-opacity duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none lg:hidden",
        shown ? "opacity-100" : "opacity-0",
      )}
    >
      <div className="shell flex shrink-0 items-center justify-between py-6">
        <Logo tagline={false} onDark />
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center text-[color:var(--color-marble)]"
        >
          <Close width={20} height={20} />
        </button>
      </div>

      <nav aria-label="Primary" className="shell flex min-h-0 flex-1 flex-col justify-center gap-1 py-10">
        {primaryNav.map((item, i) => {
          const active = isNavActive(item.href, pathname);
          return (
            <div
              key={item.href}
              className={cn(
                "transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
              )}
              style={{ transitionDelay: shown ? `${80 + i * 50}ms` : "0ms" }}
            >
              <Link
                href={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center justify-between border-b border-[color:var(--color-onyx-surface)] py-4 font-display font-normal tracking-tight text-[color:var(--color-marble)] [font-size:var(--step-3)]",
                  active && "text-[color:var(--color-champagne)]",
                )}
              >
                {item.label}
                {active ? (
                  <span aria-hidden className="text-meta uppercase tracking-[0.2em]">
                    Current
                  </span>
                ) : null}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="shell flex shrink-0 flex-col gap-4 pb-10">
        <Link
          href={ctaNav.href}
          onClick={onClose}
          className="inline-flex min-h-11 items-center justify-center bg-[color:var(--color-marble)] px-6 py-4 font-sans text-meta uppercase tracking-[0.24em] text-[color:var(--color-onyx)]"
        >
          {ctaNav.label}
        </Link>
        <div className="flex flex-wrap gap-x-6 gap-y-1 font-sans text-meta uppercase tracking-[0.2em] text-[color:var(--color-on-onyx-3)]">
          <a href={`mailto:${brand.email}`}>{brand.email}</a>
          <a href={`tel:${brand.phoneHref}`}>{brand.phoneDisplay}</a>
        </div>
      </div>
    </div>
  );
}
