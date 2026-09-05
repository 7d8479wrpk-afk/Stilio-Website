import Link from "next/link";
import { AppImage } from "@/components/ui/AppImage";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { ProjectFigure } from "@/components/projects/ProjectFigure";
import { ArrowRight } from "@/components/ui/icons";
import { photos } from "@/lib/photography";
import { getProject, type Project } from "@/lib/projects";

const FEATURED = ["maison-archives", "north-light-house", "stone-stair-villa"];

export function FeaturedProjects() {
  const [a, b, wide] = FEATURED.map((slug) => getProject(slug)).filter(
    (p): p is Project => Boolean(p),
  );

  return (
    <section id="projects" className="section bg-[color:var(--color-canvas)]">
      <div className="shell">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow index="03">Selected work</Eyebrow>
            <h2 className="mt-6 max-w-[16ch] font-display [font-size:var(--step-4)] [line-height:1.04]">
              Rooms that hold still.
            </h2>
          </div>
          <Link
            href="/projects"
            className="link-underline inline-flex items-center gap-2 font-sans text-meta uppercase tracking-[0.22em] text-[color:var(--color-ink-2)] hover:text-[color:var(--color-ink)]"
          >
            All projects <ArrowRight width={14} height={14} />
          </Link>
        </Reveal>

        <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2">
          {a ? (
            <Reveal>
              <ProjectFigure project={a} sizes="(max-width: 640px) 100vw, 44vw" />
            </Reveal>
          ) : null}
          {b ? (
            <Reveal className="sm:mt-16" delay={90}>
              <ProjectFigure project={b} sizes="(max-width: 640px) 100vw, 44vw" />
            </Reveal>
          ) : null}
        </div>

        {wide ? (
          <Reveal className="mt-14">
            <Link href={`/projects/${wide.slug}`} className="group block">
              <figure className="relative aspect-[16/9] w-full overflow-hidden bg-[color:var(--color-surface-deep)]">
                <AppImage
                  src={photos[wide.cover].src}
                  alt={photos[wide.cover].alt}
                  fill
                  sizes="(max-width: 900px) 100vw, 88vw"
                  className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transition-none"
                />
              </figure>
              <div className="mt-5 flex flex-wrap items-baseline justify-between gap-4">
                <h3 className="font-display text-[1.7rem] font-normal text-[color:var(--color-ink)]">
                  {wide.name}
                </h3>
                <p className="font-sans text-meta uppercase tracking-[0.2em] text-[color:var(--color-ink-3)]">
                  {wide.location} &middot; {wide.style}
                </p>
              </div>
              <p className="mt-2 max-w-xl text-[0.94rem] leading-relaxed text-[color:var(--color-ink-2)]">
                {wide.summary}
              </p>
            </Link>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
