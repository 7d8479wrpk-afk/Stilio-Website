import Link from "next/link";
import { AppImage } from "@/components/ui/AppImage";
import { photos, type Orientation, type Photo } from "@/lib/photography";
import type { Project } from "@/lib/projects";
import { cn } from "@/lib/cn";

const RATIO: Record<Orientation, string> = {
  portrait: "aspect-[3/4]",
  square: "aspect-square",
  landscape: "aspect-[4/3]",
};

export function ProjectFigure({
  project,
  priority = false,
  className,
  sizes = "(max-width: 768px) 100vw, 50vw",
}: {
  project: Project;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  const cover: Photo = photos[project.cover];
  return (
    <Link href={`/projects/${project.slug}`} className={cn("group block", className)}>
      <figure
        className={cn(
          "relative w-full overflow-hidden bg-[color:var(--color-surface-deep)]",
          RATIO[cover.orientation],
        )}
      >
        <AppImage
          src={cover.src}
          alt={cover.alt}
          fill
          priority={priority}
          sizes={sizes}
          style={cover.focus ? { objectPosition: cover.focus } : undefined}
          className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035] motion-reduce:transition-none"
        />
        <span
          aria-hidden
          className="absolute inset-0 bg-[color:var(--color-onyx)]/0 transition-colors duration-500 group-hover:bg-[color:var(--color-onyx)]/8"
        />
      </figure>
      <div className="mt-5 flex items-baseline justify-between gap-6">
        <div>
          <h3 className="font-display text-[1.5rem] font-normal leading-tight text-[color:var(--color-ink)]">
            {project.name}
          </h3>
          <p className="mt-1 font-sans text-meta uppercase tracking-[0.2em] text-[color:var(--color-ink-3)]">
            {project.location} &middot; {project.year}
          </p>
        </div>
        <span className="shrink-0 font-sans text-meta uppercase tracking-[0.18em] text-[color:var(--color-gold-ink)]">
          {project.style}
        </span>
      </div>
    </Link>
  );
}
