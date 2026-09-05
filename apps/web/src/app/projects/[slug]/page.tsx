import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppImage } from "@/components/ui/AppImage";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { Compare } from "@/components/ui/Compare";
import { ArrowLeft, ArrowRight } from "@/components/ui/icons";
import { JsonLd } from "@/components/seo/JsonLd";
import { photos } from "@/lib/photography";
import { getProject, projects } from "@/lib/projects";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Project not found" };
  return pageMetadata({
    title: `${project.name} — ${project.style} Interior Design`,
    description: `${project.summary} ${project.location} · ${project.scope}.`,
    path: `/projects/${project.slug}`,
    image: photos[project.cover],
  });
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const idx = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(idx + 1) % projects.length]!;
  const gallery = project.gallery.map((k) => photos[k]);
  const [g0, g1, g2, g3] = gallery;

  return (
    <article className="bg-[color:var(--color-canvas)]">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Projects", path: "/projects" },
          { name: project.name, path: `/projects/${project.slug}` },
        ])}
      />
      <div className="shell pb-16 pt-[clamp(8rem,14vw,12rem)]">
        <Link
          href="/projects"
          className="link-underline inline-flex items-center gap-2 font-sans text-meta uppercase tracking-[0.2em] text-[color:var(--color-ink-3)] hover:text-[color:var(--color-ink)]"
        >
          <ArrowLeft width={14} height={14} /> Projects
        </Link>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <Eyebrow>{project.style}</Eyebrow>
            <h1 className="mt-5 font-display [font-size:var(--step-display)] [line-height:1.02]">
              {project.name}
            </h1>
          </div>
          <p className="lede">{project.summary}</p>
        </div>

        <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-6 border-y border-[color:var(--color-line)] py-8 sm:grid-cols-4">
          {[
            ["Location", project.location],
            ["Year", String(project.year)],
            ["Scope", project.scope],
            ["Rooms", project.rooms.join(", ")],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="font-sans text-micro uppercase tracking-[0.2em] text-[color:var(--color-ink-3)]">
                {label}
              </dt>
              <dd className="mt-1.5 text-[0.95rem] text-[color:var(--color-ink)]">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {g0 ? (
        <figure className="relative aspect-[16/10] max-h-[86vh] w-full overflow-hidden">
          <AppImage src={g0.src} alt={g0.alt} fill priority sizes="100vw" className="object-cover" />
        </figure>
      ) : null}

      <div className="shell grid gap-14 py-[clamp(4rem,8vw,7rem)] lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <Reveal>
          <h2 className="h-editorial max-w-[16ch]">The approach</h2>
        </Reveal>
        <Reveal className="measure space-y-5 text-[1.02rem] leading-relaxed text-[color:var(--color-ink-2)]" delay={80}>
          {project.story.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <ul className="!mt-8 grid grid-cols-1 gap-3 border-t border-[color:var(--color-line)] pt-6 sm:grid-cols-3">
            {project.facts.map((f) => (
              <li key={f.label}>
                <span className="block font-sans text-micro uppercase tracking-[0.2em] text-[color:var(--color-ink-3)]">
                  {f.label}
                </span>
                <span className="mt-1 block text-[0.9rem] text-[color:var(--color-ink)]">
                  {f.value}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <div className="shell grid gap-6 pb-[clamp(4rem,8vw,7rem)] md:grid-cols-2">
        {g1 ? <GalleryImage photo={g1} /> : null}
        {g2 ? <GalleryImage photo={g2} className="md:mt-16" /> : null}
      </div>

      {g1 && g3 ? (
        <div className="shell pb-[clamp(4rem,8vw,7rem)]">
          <Compare
            before={g1}
            after={g3}
            beforeLabel="Daylight"
            afterLabel="Evening"
            sizes="(max-width: 900px) 100vw, 80vw"
          />
          <p className="mt-3 font-sans text-meta uppercase tracking-[0.16em] text-[color:var(--color-ink-3)]">
            The same scheme, morning and night &middot; drag to compare
          </p>
        </div>
      ) : null}

      <Link
        href={`/projects/${next.slug}`}
        className="group block border-t border-[color:var(--color-line)] bg-[color:var(--color-surface)]"
      >
        <div className="shell flex items-center justify-between gap-6 py-11 md:py-14">
          <div>
            <p className="font-sans text-micro uppercase tracking-[0.24em] text-[color:var(--color-ink-3)]">
              Next project
            </p>
            <p className="mt-2 font-display text-[1.6rem] leading-tight text-[color:var(--color-ink)] md:text-[2rem]">
              {next.name}
            </p>
          </div>
          <ArrowRight
            width={18}
            height={18}
            className="shrink-0 text-[color:var(--color-gold-ink)] transition-transform duration-300 group-hover:translate-x-2 motion-reduce:transition-none"
          />
        </div>
      </Link>
    </article>
  );
}

function GalleryImage({
  photo,
  className = "",
}: {
  photo: (typeof photos)[keyof typeof photos];
  className?: string;
}) {
  return (
    <Reveal className={className}>
      <figure className="relative aspect-[4/5] w-full overflow-hidden bg-[color:var(--color-surface-deep)]">
        <AppImage src={photo.src} alt={photo.alt} fill sizes="(max-width: 768px) 100vw, 48vw" className="object-cover" />
      </figure>
    </Reveal>
  );
}
