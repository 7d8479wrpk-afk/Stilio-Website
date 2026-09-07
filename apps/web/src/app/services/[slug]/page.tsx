import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AppImage } from "@/components/ui/AppImage";
import { PageHeader } from "@/components/layout/PageHeader";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRight } from "@/components/ui/icons";
import { JsonLd } from "@/components/seo/JsonLd";
import { photos } from "@/lib/photography";
import { getService, services } from "@/lib/services";
import { getProject } from "@/lib/projects";
import { breadcrumbJsonLd, pageMetadata, SITE_URL } from "@/lib/seo";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) return { title: "Service not found", robots: { index: false } };
  return pageMetadata({
    title: s.title,
    description: s.summary,
    path: `/services/${s.slug}`,
    image: photos[s.photo],
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) notFound();

  const related = s.projects.map(getProject).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const others = services.filter((x) => x.slug !== s.slug);

  return (
    <div className="bg-[color:var(--color-canvas)] pb-[var(--section-y)]">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: s.name, path: `/services/${s.slug}` },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: s.name,
          serviceType: s.name,
          description: s.summary,
          url: `${SITE_URL}/services/${s.slug}`,
          provider: { "@type": "Organization", "@id": `${SITE_URL}/#organization` },
          areaServed: [
            { "@type": "City", name: "Amman" },
            { "@type": "Country", name: "Jordan" },
          ],
        }}
      />

      <PageHeader eyebrow="Services" title={<>{s.heading}</>} lede={s.summary}>
        <Link
          href="/services"
          className="link-underline mt-6 inline-flex items-center gap-2 font-sans text-meta uppercase tracking-[0.2em] text-[color:var(--color-ink-3)] hover:text-[color:var(--color-ink)]"
        >
          All services
        </Link>
      </PageHeader>

      <figure className="relative aspect-[16/9] max-h-[80vh] w-full overflow-hidden">
        <AppImage
          src={photos[s.photo].src}
          alt={photos[s.photo].alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </figure>

      <section className="section">
        <div className="shell grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <Reveal className="measure space-y-5 text-[1.02rem] leading-relaxed text-[color:var(--color-ink-2)]">
            {s.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </Reveal>
          <Reveal delay={80}>
            <Eyebrow>What it covers</Eyebrow>
            <ul className="mt-4 space-y-3">
              {s.includes.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 border-b border-[color:var(--color-line)] pb-3 text-[0.95rem] leading-relaxed text-[color:var(--color-ink-2)]"
                >
                  <span aria-hidden className="mt-2.5 h-px w-4 shrink-0 bg-[color:var(--color-gold-ink)]" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="shell">
          <Eyebrow>Selected work</Eyebrow>
          <ul className="mt-6 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-3">
            {related.map((p) => (
              <li key={p.slug}>
                <Link href={`/projects/${p.slug}`} className="group block">
                  <span className="relative block aspect-[4/3] w-full overflow-hidden bg-[color:var(--color-surface-deep)]">
                    <AppImage
                      src={photos[p.cover].src}
                      alt={photos[p.cover].alt}
                      fill
                      sizes="(min-width: 640px) 33vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    />
                  </span>
                  <span className="mt-3 block font-display text-[1.15rem] leading-tight text-[color:var(--color-ink)]">
                    {p.name}
                  </span>
                  <span className="mt-1 block font-sans text-micro uppercase tracking-[0.2em] text-[color:var(--color-ink-3)]">
                    {p.location} &middot; {p.year}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="shell mt-[clamp(4rem,8vw,7rem)] border-t border-[color:var(--color-line)] pt-10">
        <Eyebrow>The rest of what we do</Eyebrow>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          {others.map((o) => (
            <li key={o.slug}>
              <Link
                href={`/services/${o.slug}`}
                className="link-underline font-sans text-meta uppercase tracking-[0.2em] text-[color:var(--color-ink-2)] hover:text-[color:var(--color-ink)]"
              >
                {o.name}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/contact"
          className="mt-8 inline-flex min-h-11 items-center gap-2.5 bg-[color:var(--color-onyx)] px-7 py-3.5 font-sans text-meta uppercase tracking-[0.22em] text-[color:var(--color-marble)] hover:bg-[color:var(--color-espresso)]"
        >
          Start a project <ArrowRight width={14} height={14} />
        </Link>
      </section>
    </div>
  );
}
