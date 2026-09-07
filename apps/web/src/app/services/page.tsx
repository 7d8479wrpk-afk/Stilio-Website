import Link from "next/link";
import { AppImage } from "@/components/ui/AppImage";
import { PageHeader } from "@/components/layout/PageHeader";
import { ArrowRight } from "@/components/ui/icons";
import { photos } from "@/lib/photography";
import { services } from "@/lib/services";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Interior Design & Renovation Services",
  description:
    "What Stilio does: interior design, renovation, material and lighting design, and 3D visualisation — one team from the first sketch to the final fixture.",
  path: "/services",
  image: photos.livingPenthouseWarm,
});

export default function ServicesPage() {
  return (
    <div className="bg-[color:var(--color-canvas)] pb-[var(--section-y)]">
      <PageHeader
        eyebrow="Services"
        title={<>What we do, end to end.</>}
        lede="Four services that usually run together — but each can be commissioned on its own. The same people carry the work the whole way."
      />

      <ul className="shell grid gap-x-8 gap-y-14 md:grid-cols-2">
        {services.map((s, i) => (
          <li key={s.slug}>
            <Link href={`/services/${s.slug}`} className="group block">
              <span className="relative block aspect-[4/3] w-full overflow-hidden bg-[color:var(--color-surface-deep)]">
                <AppImage
                  src={photos[s.photo].src}
                  alt={photos[s.photo].alt}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 768px) 100vw, 45vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]"
                />
              </span>
              <h2 className="mt-5 font-display text-[1.6rem] font-normal text-[color:var(--color-ink)]">
                {s.name}
              </h2>
              <p className="mt-2 max-w-md text-[0.95rem] leading-relaxed text-[color:var(--color-ink-2)]">
                {s.summary}
              </p>
              <span className="link-underline mt-3 inline-flex items-center gap-2 font-sans text-meta uppercase tracking-[0.2em] text-[color:var(--color-ink-2)] group-hover:text-[color:var(--color-ink)]">
                Learn more <ArrowRight width={14} height={14} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
