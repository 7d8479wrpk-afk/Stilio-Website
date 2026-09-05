"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { NavOverlay } from "@/components/layout/NavOverlay";
import { cn } from "@/lib/cn";
import { ctaNav, isNavActive, primaryNav } from "@/lib/nav";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[100] transition-[background-color,border-color,padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          scrolled
            ? "border-b border-[color:var(--color-line)] bg-[color:var(--color-canvas)]/96 py-3.5 backdrop-blur-sm"
            : "border-b border-transparent py-6",
        )}
      >
        <div className="shell flex items-center justify-between gap-6">
          <Link href="/" aria-label="Stilio — home" className="shrink-0 text-[color:var(--color-ink)]">
            <Logo tagline={false} />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex xl:gap-9">
            {primaryNav.map((item) => {
              const active = isNavActive(item.href, pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "link-underline whitespace-nowrap font-sans text-meta uppercase tracking-[0.22em] transition-colors",
                    active
                      ? "bg-[position:0_100%] bg-[size:100%_1px] text-[color:var(--color-ink)]"
                      : "text-[color:var(--color-ink-2)] hover:text-[color:var(--color-ink)]",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={ctaNav.href}
              className="hidden min-h-11 items-center border border-[color:var(--color-line-strong)] px-5 py-3 font-sans text-meta uppercase tracking-[0.22em] text-[color:var(--color-ink)] transition-colors hover:border-[color:var(--color-onyx)] hover:bg-[color:var(--color-onyx)] hover:text-[color:var(--color-marble)] sm:inline-flex"
            >
              {ctaNav.label}
            </Link>

            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen(true)}
              className="flex h-11 w-11 items-center justify-center text-[color:var(--color-ink)] lg:hidden"
            >
              <span className="flex flex-col gap-[5px]">
                <span className="block h-px w-6 bg-current" />
                <span className="block h-px w-6 bg-current" />
                <span className="block h-px w-6 bg-current" />
              </span>
            </button>
          </div>
        </div>
      </header>

      <NavOverlay open={open} onClose={() => setOpen(false)} pathname={pathname} />
    </>
  );
}
