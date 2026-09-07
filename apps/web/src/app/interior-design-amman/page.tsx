import Link from "next/link";
import { AppImage } from "@/components/ui/AppImage";
import { PageHeader } from "@/components/layout/PageHeader";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRight } from "@/components/ui/icons";
import { JsonLd } from "@/components/seo/JsonLd";
import { photos } from "@/lib/photography";
import { services } from "@/lib/services";
import { getProject } from "@/lib/projects";
import { brand } from "@/lib/tokens";
import { breadcrumbJsonLd, pageMetadata, SITE_URL } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Interior Design Studio in Amman, Jordan | Stilio",
  description:
    "Stilio is an interior design and renovation studio in Amman, Jordan. Residential and workplace interiors — planned, specified and built by one team. See the work and start a project.",
  path: "/interior-design-amman",
  image: photos.livingPenthouseWarm,
});

const featured = ["maison-archives", "bronze-hall-residence", "gallery-apartment"]
  .map(getProject)
  .filter((p): p is NonNullable<typeof p> => Boolean(p));

export default function AmmanPage() {
  return (
    <div className="bg-[color:var(--color-canvas)] pb-[var(--section-y)]">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Interior design in Amman", path: "/interior-design-amman" },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Interior Design Studio in Amman, Jordan",
          url: `${SITE_URL}/interior-design-amman`,
          about: { "@type": "Organization", "@id": `${SITE_URL}/#organization` },
        }}
      />

      <PageHeader
        eyebrow="Amman · Jordan"
        title={<>Interior design and renovation, based in Amman.</>}
        lede="Stilio is a small studio in Amman working on homes and workplaces where the client cares how a space feels to live in over years — not how it photographs on day one."
      >
        <Link
          href="/contact"
          className="mt-7 inline-flex min-h-11 items-center gap-2.5 bg-[color:var(--color-onyx)] px-7 py-3.5 font-sans text-meta uppercase tracking-[0.22em] text-[color:var(--color-marble)] hover:bg-[color:var(--color-espresso)]"
        >
          Start a project <ArrowRight width={14} height={14} />
        </Link>
      </PageHeader>

      <figure className="relative aspect-[16/9] max-h-[80vh] w-full overflow-hidden">
        <AppImage
          src={photos.livingPenthouseWarm.src}
          alt={photos.livingPenthouseWarm.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </figure>

      <section className="section">
        <div className="shell grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal>
            <Eyebrow>How we work</Eyebrow>
            <h2 className="mt-6 font-display [font-size:var(--step-3)] [line-height:1.1]">
              One team, from the first sketch to the final light.
            </h2>
          </Reveal>
          <Reveal delay={80} className="measure space-y-5 text-[1.02rem] leading-relaxed text-[color:var(--color-ink-2)]">
            <p>
              We don&apos;t hand your project between a designer, a decorator and a
              contractor. The same people plan the space, set its material palette,
              and stand on site while it is built — so nothing is diluted along the way.
            </p>
            <p>
              Every scheme is planned around how the space works before how it looks:
              circulation, sightlines, storage, then the palette and the one considered
              accent. You walk it in an interactive 3D model, in the right light, before
              anything is committed.
            </p>
            <p>
              A survey, a conversation about how you live or work, and an agreed scope
              and budget come first. Then the design begins.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section on-onyx grain relative overflow-hidden">
        <div className="shell relative">
          <Eyebrow>What we do</Eyebrow>
          <ul className="mt-8 grid gap-px border border-[color:var(--color-onyx-surface)] bg-[color:var(--color-onyx-surface)] sm:grid-cols-2">
            {services.map((s) => (
              <li key={s.slug} className="bg-[color:var(--color-onyx)] p-8 md:p-10">
                <h3 className="font-display text-[1.4rem] font-normal text-[color:var(--color-marble)]">
                  <Link href={`/services/${s.slug}`} className="link-underline">
                    {s.name}
                  </Link>
                </h3>
                <p className="mt-3 max-w-sm text-[0.95rem] leading-relaxed text-[color:var(--color-on-onyx-2)]">
                  {s.summary}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <Eyebrow>Selected work</Eyebrow>
          <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-3">
            {featured.map((p) => (
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
                    {p.style}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/projects"
            className="link-underline mt-10 inline-flex items-center gap-2 font-sans text-meta uppercase tracking-[0.22em] text-[color:var(--color-ink-2)] hover:text-[color:var(--color-ink)]"
          >
            All projects <ArrowRight width={14} height={14} />
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="shell grid gap-10 border-t border-[color:var(--color-line)] pt-10 sm:grid-cols-2">
          <div>
            <Eyebrow>The studio</Eyebrow>
            <p className="mt-3 text-[0.98rem] leading-relaxed text-[color:var(--color-ink-2)]">
              {brand.legalName}
              <br />
              {brand.address.city}, {brand.address.country}
            </p>
          </div>
          <div>
            <Eyebrow>Contact</Eyebrow>
            <p className="mt-3 text-[0.98rem] leading-relaxed">
              <a href={`mailto:${brand.email}`} className="link-underline block text-[color:var(--color-ink)]">
                {brand.email}
              </a>
              <a href={`tel:${brand.phoneHref}`} className="link-underline mt-1 block text-[color:var(--color-ink)]">
                {brand.phoneDisplay}
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
