import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AppImage } from "@/components/ui/AppImage";
import { PageHeader } from "@/components/layout/PageHeader";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ArrowRight } from "@/components/ui/icons";
import { JsonLd } from "@/components/seo/JsonLd";
import { photos } from "@/lib/photography";
import { getMaterial, materialProject, materials } from "@/lib/materials";
import { breadcrumbJsonLd, pageMetadata, SITE_URL } from "@/lib/seo";

export function generateStaticParams() {
  return materials.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const m = getMaterial(slug);
  if (!m) return { title: "Material not found", robots: { index: false } };
  return pageMetadata({
    title: `${m.name} — ${m.category} for Interior Design`,
    description: `${m.type}. ${m.texture}. Where Stilio uses it: ${m.usage.toLowerCase()}.`,
    path: `/materials/${m.slug}`,
    image: photos[m.photo],
  });
}

export default async function MaterialDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const m = getMaterial(slug);
  if (!m) notFound();

  const photo = photos[m.photo];
  const project = materialProject(m);
  const related = materials
    .filter((x) => x.category === m.category && x.slug !== m.slug)
    .slice(0, 3);

  const facts: [string, string][] = [
    ["Type", m.type],
    ["Texture", m.texture],
    ["Where we use it", m.usage],
    ["Works with", m.styles.join(", ")],
  ];

  return (
    <div className="bg-[color:var(--color-canvas)] pb-[var(--section-y)]">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Materials", path: "/materials" },
          { name: m.name, path: `/materials/${m.slug}` },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: m.name,
          category: m.category,
          description: `${m.type}. ${m.texture}.`,
          image: `${SITE_URL}${photo.src}`,
          brand: { "@type": "Organization", "@id": `${SITE_URL}/#organization` },
        }}
      />

      <PageHeader
        eyebrow={m.category}
        title={<>{m.name}</>}
        lede={m.type}
      >
        <Link
          href="/materials"
          className="link-underline mt-6 inline-flex items-center gap-2 font-sans text-meta uppercase tracking-[0.2em] text-[color:var(--color-ink-3)] hover:text-[color:var(--color-ink)]"
        >
          All materials
        </Link>
      </PageHeader>

      <div className="shell grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <figure className="relative aspect-[4/3] w-full overflow-hidden bg-[color:var(--color-surface-deep)]">
          <AppImage
            src={photo.src}
            alt={photo.alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover"
          />
        </figure>

        <div>
          <Eyebrow>Coordinated palette</Eyebrow>
          <ul className="mt-4 grid grid-cols-4 gap-2">
            {m.palette.map((c) => (
              <li key={c} className="flex flex-col gap-1.5">
                <span
                  className="block aspect-square w-full border border-[color:var(--color-line-strong)]"
                  style={{ background: c }}
                  aria-hidden
                />
                <span className="font-sans text-micro uppercase tracking-[0.08em] text-[color:var(--color-ink-3)]">
                  {c}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-8 space-y-4">
            {facts.map(([label, value]) => (
              <div key={label} className="border-t border-[color:var(--color-line)] pt-3">
                <dt className="font-sans text-micro uppercase tracking-[0.2em] text-[color:var(--color-ink-3)]">
                  {label}
                </dt>
                <dd className="mt-1.5 text-[0.95rem] leading-relaxed text-[color:var(--color-ink-2)]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          {project ? (
            <p className="mt-8 text-[0.95rem] leading-relaxed text-[color:var(--color-ink-2)]">
              Seen in{" "}
              <Link
                href={`/projects/${project.slug}`}
                className="link-underline text-[color:var(--color-gold-ink)]"
              >
                {project.name}
              </Link>
              , {project.location}.
            </p>
          ) : null}

          {m.previewable ? (
            <Link
              href="/#experience"
              className="mt-8 inline-flex min-h-11 items-center justify-center bg-[color:var(--color-onyx)] px-6 py-3.5 font-sans text-meta uppercase tracking-[0.2em] text-[color:var(--color-marble)] hover:bg-[color:var(--color-espresso)]"
            >
              See it in the room
            </Link>
          ) : (
            <p className="mt-8 text-[0.82rem] leading-relaxed text-[color:var(--color-ink-3)]">
              Available as a physical sample during design development.
            </p>
          )}
        </div>
      </div>

      {related.length > 0 ? (
        <div className="shell mt-[clamp(4rem,8vw,7rem)]">
          <Eyebrow>More {m.category.toLowerCase()}</Eyebrow>
          <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/materials/${r.slug}`} className="group block">
                  <span className="relative block aspect-[4/3] w-full overflow-hidden bg-[color:var(--color-surface-deep)]">
                    <AppImage
                      src={photos[r.photo].src}
                      alt={photos[r.photo].alt}
                      fill
                      sizes="(min-width: 640px) 33vw, 50vw"
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    />
                  </span>
                  <span className="mt-3 block font-display text-[1.1rem] leading-tight text-[color:var(--color-ink)]">
                    {r.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="shell mt-[clamp(4rem,8vw,7rem)] border-t border-[color:var(--color-line)] pt-10">
        <Link
          href="/contact"
          className="link-underline inline-flex items-center gap-2 font-sans text-meta uppercase tracking-[0.22em] text-[color:var(--color-ink-2)] hover:text-[color:var(--color-ink)]"
        >
          Start a project with these materials <ArrowRight width={14} height={14} />
        </Link>
      </div>
    </div>
  );
}
