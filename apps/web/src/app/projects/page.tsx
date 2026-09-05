import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { ProjectFigure } from "@/components/projects/ProjectFigure";
import { photos } from "@/lib/photography";
import { projects } from "@/lib/projects";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Interior Design Portfolio — Selected Projects",
  description:
    "Selected interior design and renovation projects by Stilio — residences and workplaces in Paris, Copenhagen, Milan, New York, Lisbon, Brussels and Geneva.",
  path: "/projects",
  image: photos.livingScandiCalm,
});

export default function ProjectsPage() {
  return (
    <div className="bg-[color:var(--color-canvas)] pb-[var(--section-y)]">
      <PageHeader
        eyebrow="Selected work"
        title={<>Rooms that hold&nbsp;still.</>}
        lede="A small, consistent body of work. Warm materials, quiet palettes, and the same team from first sketch to final light."
      />

      <div className="shell grid gap-x-8 gap-y-16 md:grid-cols-12">
        {projects.map((project, i) => {
          const span = i % 3 === 0 ? "md:col-span-7" : "md:col-span-5";
          const offset = i % 3 === 1 ? "md:mt-20" : i % 3 === 2 ? "md:col-start-4 md:mt-4" : "";
          return (
            <Reveal key={project.slug} className={`${span} ${offset}`} delay={(i % 3) * 60}>
              <ProjectFigure
                project={project}
                priority={i === 0}
                sizes="(max-width: 768px) 100vw, 55vw"
              />
              <p className="mt-3 max-w-md text-[0.92rem] leading-relaxed text-[color:var(--color-ink-2)]">
                {project.summary}
              </p>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
