import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { EnquiryForm } from "@/components/contact/EnquiryForm";
import { addressLines, brand } from "@/lib/tokens";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact — Start an Interior Design Project",
  description: `Enquire about a residential or workplace project with ${brand.legalName}, based in ${brand.address.city}. We take on a small number of projects each year.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="bg-[color:var(--color-canvas)] pb-[var(--section-y)]">
      <PageHeader
        eyebrow="Start a project"
        title={<>Tell us about the space.</>}
        lede="We take on a small number of projects each year. The more you can tell us about the space and how you use it, the better."
      />

      <div className="shell grid gap-14 lg:grid-cols-[1.3fr_0.8fr] lg:gap-20">
        <EnquiryForm />

        <aside className="space-y-8 border-t border-[color:var(--color-line)] pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
          <div>
            <Eyebrow>Studio</Eyebrow>
            <a
              href={`mailto:${brand.email}`}
              className="link-underline mt-2 block text-[1rem] text-[color:var(--color-ink)]"
            >
              {brand.email}
            </a>
            <a
              href={`tel:${brand.phoneHref}`}
              className="link-underline mt-1 block text-[1rem] text-[color:var(--color-ink)]"
            >
              {brand.phoneDisplay}
            </a>
          </div>
          <div>
            <Eyebrow>Address</Eyebrow>
            <address className="mt-2 not-italic text-[0.98rem] leading-relaxed text-[color:var(--color-ink-2)]">
              {addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </div>
          <div>
            <Eyebrow>First step</Eyebrow>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-[color:var(--color-ink-2)]">
              Not sure what you need yet? Walk through the{" "}
              <Link href="/#experience" className="link-underline text-[color:var(--color-gold-ink)]">
                room
              </Link>{" "}
              first — it&apos;s a good way to see the range of what we do.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
