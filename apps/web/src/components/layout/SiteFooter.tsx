import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ArrowRight } from "@/components/ui/icons";
import { addressInline, brand } from "@/lib/tokens";
import { footerNav, primaryNav } from "@/lib/nav";
import { services } from "@/lib/services";

const year = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="on-onyx grain relative overflow-hidden">
      <div className="shell relative grid gap-14 py-[clamp(4rem,7vw,6.5rem)] md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
        <div className="max-w-sm">
          <Logo onDark />
          <p className="mt-6 text-[0.95rem] leading-relaxed text-[color:var(--color-on-onyx-2)]">
            An interior design and renovation studio in {brand.address.city}. We plan
            the space, set the material palette, and see the build through — the same
            team from the first sketch to the last light.
          </p>
          <Link
            href="/contact"
            className="mt-7 inline-flex items-center gap-2 font-sans text-meta uppercase tracking-[0.24em] text-[color:var(--color-champagne)] hover:text-[color:var(--color-marble)]"
          >
            Start a project <ArrowRight width={14} height={14} />
          </Link>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-3">
          <Eyebrow className="mb-2">Explore</Eyebrow>
          {[...primaryNav, ...footerNav].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="link-underline w-fit text-[0.95rem] text-[color:var(--color-on-onyx-2)] hover:text-[color:var(--color-marble)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <nav aria-label="Services" className="flex flex-col gap-3">
          <Eyebrow className="mb-2">Services</Eyebrow>
          {services.map((s) => (
            <Link
              key={s.slug}
              href={`/services/${s.slug}`}
              className="link-underline w-fit text-[0.95rem] text-[color:var(--color-on-onyx-2)] hover:text-[color:var(--color-marble)]"
            >
              {s.name}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-3">
          <Eyebrow className="mb-2">Studio</Eyebrow>
          <a
            href={`mailto:${brand.email}`}
            className="link-underline w-fit text-[0.95rem] text-[color:var(--color-on-onyx-2)] hover:text-[color:var(--color-marble)]"
          >
            {brand.email}
          </a>
          <a
            href={`tel:${brand.phoneHref}`}
            className="link-underline w-fit text-[0.95rem] text-[color:var(--color-on-onyx-2)] hover:text-[color:var(--color-marble)]"
          >
            {brand.phoneDisplay}
          </a>
          <address className="mt-2 not-italic text-[0.9rem] leading-relaxed text-[color:var(--color-on-onyx-3)]">
            {addressInline}
          </address>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
            {brand.social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-11 items-center font-sans text-meta uppercase tracking-[0.2em] text-[color:var(--color-on-onyx-3)] hover:text-[color:var(--color-champagne)]"
              >
                {s.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="shell relative flex flex-col gap-2 border-t border-[color:var(--color-onyx-surface)] py-7 text-meta uppercase tracking-[0.2em] text-[color:var(--color-on-onyx-3)] sm:flex-row sm:items-center sm:justify-between">
        <span>
          &copy; {year} {brand.legalName}
        </span>
        <span>Interiors and interface by Stilio</span>
      </div>
    </footer>
  );
}
