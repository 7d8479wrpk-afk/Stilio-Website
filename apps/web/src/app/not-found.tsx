import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ArrowRight } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <div className="grid min-h-[70svh] place-items-center bg-[color:var(--color-canvas)] px-6 pt-24">
      <div className="max-w-md text-center">
        <Eyebrow>Page not found</Eyebrow>
        <h1 className="mt-6 font-display [font-size:var(--step-4)] [line-height:1.05]">
          This room doesn&apos;t exist.
        </h1>
        <p className="mt-4 text-[1rem] leading-relaxed text-[color:var(--color-ink-2)]">
          The page you were looking for has moved or was never here.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-11 items-center gap-2.5 bg-[color:var(--color-onyx)] px-7 py-3.5 font-sans text-meta uppercase tracking-[0.22em] text-[color:var(--color-marble)] hover:bg-[color:var(--color-espresso)]"
        >
          Back to the homepage <ArrowRight width={14} height={14} />
        </Link>
      </div>
    </div>
  );
}
