import { AppImage } from "@/components/ui/AppImage";
import { PageHeader } from "@/components/layout/PageHeader";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { photos } from "@/lib/photography";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About Stilio — Amman Interior Design & Renovation Studio",
  description:
    "Stilio is a small interior design studio based in Amman, Jordan, working across Europe and North America — restraint, warm materials, one team throughout.",
  path: "/about",
  image: photos.brandHero,
});

export default function AboutPage() {
  return (
    <div className="bg-[color:var(--color-canvas)]">
      <PageHeader
        eyebrow="About"
        title={<>A studio built around restraint.</>}
        lede="Stilio was founded on a simple idea: a room is finished when there is nothing left to remove, not when there is nothing left to add."
      />

      <figure className="relative aspect-[16/9] max-h-[86vh] w-full overflow-hidden">
        <AppImage
          src={photos.brandHero.src}
          alt={photos.brandHero.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </figure>

      <section className="section">
        <div className="shell grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <Reveal>
            <Eyebrow index="01">The practice</Eyebrow>
            <h2 className="sr-only">The practice</h2>
          </Reveal>
          <Reveal delay={80} className="measure space-y-5 text-[1.05rem] leading-relaxed text-[color:var(--color-ink-2)]">
            <p>
              We are a small team of interior designers and architects. We work on
              homes and workplaces where the client cares about how a space feels
              to live in over years, not how it photographs on day one.
            </p>
            <p>
              Every project runs through the same people — the person who plans
              the space specifies its materials and stands on site while it is
              built. Nothing is handed off and diluted.
            </p>
            <p>
              The work is warm and quiet: honest timber, real stone, natural
              textiles, and one considered accent. We don&apos;t chase trends, and
              we don&apos;t use ten materials where three will do.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section on-onyx grain relative overflow-hidden">
        <h2 className="sr-only">Working with Stilio</h2>
        <div className="shell relative grid gap-10 md:grid-cols-3">
          {[
            ["Where we work", "Residential and workplace projects across Europe and North America, from single rooms to full renovations."],
            ["How we start", "A survey, a conversation about how you live, and an agreed scope and budget before any design work begins."],
            ["What you receive", "A fully documented scheme, a 3D model you can walk through, and a team that stays until the last light is hung."],
          ].map(([t, b]) => (
            <Reveal key={t}>
              <h3 className="font-display text-[1.4rem] font-normal text-[color:var(--color-marble)]">{t}</h3>
              <p className="mt-3 text-[0.96rem] leading-relaxed text-[color:var(--color-on-onyx-2)]">{b}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="shell flex flex-col items-start gap-6">
          <Eyebrow index="02">Next</Eyebrow>
          <h2 className="max-w-[16ch] font-display [font-size:var(--step-4)] [line-height:1.04]">
            Start with a conversation.
          </h2>
          <Button href="/contact" size="lg" withArrow className="mt-2">
            Enquire
          </Button>
        </div>
      </section>
    </div>
  );
}
