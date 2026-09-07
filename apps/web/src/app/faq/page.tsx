import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { ArrowRight } from "@/components/ui/icons";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqs } from "@/lib/faq";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Interior Design FAQ — Process, Fees & Getting Started",
  description:
    "Common questions about working with Stilio — how a project runs, how fees are structured, timelines, and how to start with an Amman interior design and renovation studio.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <div className="bg-[color:var(--color-canvas)] pb-[var(--section-y)]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />

      <PageHeader
        eyebrow="Questions"
        title={<>How working with the studio works.</>}
        lede="The things people ask before they get in touch."
      />

      <div className="shell">
        <dl className="divide-y divide-[color:var(--color-line)] border-y border-[color:var(--color-line)]">
          {faqs.map((f) => (
            <div key={f.q} className="grid gap-3 py-8 md:grid-cols-[16rem_1fr] md:gap-10">
              <dt className="font-display text-[1.35rem] font-normal leading-snug text-[color:var(--color-ink)]">
                {f.q}
              </dt>
              <dd className="max-w-xl text-[1rem] leading-relaxed text-[color:var(--color-ink-2)]">
                {f.a}
              </dd>
            </div>
          ))}
        </dl>

        <Link
          href="/contact"
          className="mt-12 inline-flex min-h-11 items-center gap-2.5 bg-[color:var(--color-onyx)] px-7 py-3.5 font-sans text-meta uppercase tracking-[0.22em] text-[color:var(--color-marble)] hover:bg-[color:var(--color-espresso)]"
        >
          Start a project <ArrowRight width={14} height={14} />
        </Link>
      </div>
    </div>
  );
}
