"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-[70svh] place-items-center bg-[color:var(--color-canvas)] px-6 pt-24">
      <div className="max-w-md text-center">
        <Eyebrow>Something went wrong</Eyebrow>
        <h1 className="mt-6 font-display [font-size:var(--step-4)] [line-height:1.05]">
          That didn&apos;t load as it should.
        </h1>
        <p className="mt-4 text-[1rem] leading-relaxed text-[color:var(--color-ink-2)]">
          A hiccup on our end. Try again, or head back to the studio.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="min-h-11 bg-[color:var(--color-onyx)] px-7 py-3.5 font-sans text-meta uppercase tracking-[0.22em] text-[color:var(--color-marble)] hover:bg-[color:var(--color-espresso)]"
          >
            Try again
          </button>
          <Link
            href="/"
            className="link-underline inline-flex min-h-11 items-center font-sans text-meta uppercase tracking-[0.22em] text-[color:var(--color-ink-2)]"
          >
            Back to the homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
