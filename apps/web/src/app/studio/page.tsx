import { AppImage } from "@/components/ui/AppImage";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRight } from "@/components/ui/icons";
import { photos } from "@/lib/photography";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Our Interior Design Process — Brief to Build",
  description:
    "How Stilio works: one design and renovation team plans the space, specifies materials and lighting, and stays on site to the final fixture.",
  path: "/studio",
  image: photos.entryGardenStair,
});

const steps = [
  {
    n: "01",
    title: "Brief & survey",
    body:
      "We measure the space, understand how you live or work in it, and agree the scope, the programme and the budget before anything is drawn.",
  },
  {
    n: "02",
    title: "Concept & plan",
    body:
      "Spatial planning first — circulation, sightlines, storage — then the visual direction: palette, materials, the one accent. You see it in 3D before a wall moves.",
  },
  {
    n: "03",
    title: "Design development",
    body:
      "Joinery details, lighting layers scene by scene, furniture and finishes fully specified and priced. Every decision is documented and consistent.",
  },
  {
    n: "04",
    title: "Delivery",
    body:
      "We hold the drawings and the site together — trades, samples, snags — so the room that gets built is the room that was designed.",
  },
  {
    n: "05",
    title: "Styling & handover",
    body:
      "The last layer: art, objects, textiles, plants. We hand over a finished room, not a building site with furniture in it.",
  },
];

const principles = [
  "Function before appearance — always, and without apology.",
  "Warm materials that age well: rift oak, honed stone, natural linen, brushed brass.",
  "One accent per room. Gold is a seasoning, never the dish.",
  "Light in four layers, tuned for morning, evening and night.",
  "No gradients, no gloss, no pure black or white.",
  "The specification is the deliverable — the 3D model is how you read it.",
];

export default function StudioPage() {
  return (
    <div className="bg-[color:var(--color-canvas)]">
      <PageHeader
        eyebrow="The studio"
        title={<>One team, from the first sketch to the final light.</>}
        lede="Stilio is a design and renovation studio. We don't hand your project between a designer, a decorator and a contractor — the same people carry it the whole way."
      />

      <figure className="relative aspect-[16/9] max-h-[86vh] w-full overflow-hidden">
        <AppImage
          src={photos.entryGardenStair.src}
          alt={photos.entryGardenStair.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </figure>

      <section className="section">
        <div className="shell">
          <Reveal>
            <Eyebrow index="01">How we work</Eyebrow>
            <h2 className="sr-only">How we work</h2>
          </Reveal>
          <div className="mt-12 divide-y divide-[color:var(--color-line)] border-y border-[color:var(--color-line)]">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 40}>
                <div className="grid gap-4 py-10 md:grid-cols-[6rem_18rem_1fr] md:items-baseline md:gap-8">
                  <span className="font-display text-[1.4rem] text-[color:var(--color-gold-ink)]">
                    {s.n}
                  </span>
                  <h3 className="font-display text-[1.6rem] font-normal text-[color:var(--color-ink)]">
                    {s.title}
                  </h3>
                  <p className="max-w-xl text-[0.98rem] leading-relaxed text-[color:var(--color-ink-2)]">
                    {s.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section on-onyx grain relative overflow-hidden">
        <div className="shell relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal>
            <Eyebrow index="02">Principles</Eyebrow>
            <h2 className="mt-6 font-display [font-size:var(--step-3)] [line-height:1.1]">
              The rules we design against.
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <ul className="space-y-5">
              {principles.map((p) => (
                <li
                  key={p}
                  className="flex gap-4 border-b border-[color:var(--color-onyx-surface)] pb-5 text-[1.02rem] leading-relaxed text-[color:var(--color-on-onyx-2)]"
                >
                  <span aria-hidden className="mt-2.5 h-px w-5 shrink-0 bg-[color:var(--color-champagne)]" />
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="shell grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20">
          <Reveal>
            <Eyebrow index="03">The team</Eyebrow>
            <h2 className="mt-6 font-display [font-size:var(--step-3)] [line-height:1.08]">
              The same people, from the studio to the site.
            </h2>
            <p className="measure mt-6 text-[1.02rem] leading-relaxed text-[color:var(--color-ink-2)]">
              Every scheme passes through the same hands: space planning, the
              visual direction, furniture and materials, a lighting design tuned
              scene by scene, and a final review before it reaches you. Nothing
              is handed off and diluted along the way.
            </p>
            <Link
              href="/contact"
              className="link-underline mt-8 inline-flex items-center gap-2 font-sans text-meta uppercase tracking-[0.22em] text-[color:var(--color-ink-2)] hover:text-[color:var(--color-ink)]"
            >
              Start a conversation <ArrowRight width={14} height={14} />
            </Link>
          </Reveal>
          <Reveal delay={100}>
            <figure className="relative aspect-[4/5] w-full overflow-hidden">
              <AppImage
                src={photos.officeExecutive.src}
                alt={photos.officeExecutive.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </figure>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
