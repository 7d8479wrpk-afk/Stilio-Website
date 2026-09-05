import { AppImage } from "@/components/ui/AppImage";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { photos } from "@/lib/photography";

export function StudioIntro() {
  const img = photos.livingMinimalBlackArt;
  return (
    <section id="studio" className="section relative bg-[color:var(--color-canvas)]">
      <div className="shell grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-20">
        <Reveal className="order-2 lg:order-1">
          <Eyebrow index="01">The studio</Eyebrow>
          <h2 className="mt-6 max-w-[18ch] font-display text-[color:var(--color-ink)] [font-size:var(--step-4)] [line-height:1.05]">
            One team. From the first sketch to the final light.
          </h2>
          <div className="measure mt-7 space-y-5 text-[1.02rem] leading-relaxed text-[color:var(--color-ink-2)]">
            <p>
              Stilio is a design and renovation studio. We plan how a space works,
              set its material palette, resolve the lighting, and stay on site until
              the last fixture is in.
            </p>
            <p>
              The work is quiet by intention — warm woods, honest stone, calm
              neutrals, and one considered accent. Nothing is there to impress you;
              everything is there for a reason.
            </p>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-x-4 border-t border-[color:var(--color-line)] pt-7">
            {[
              ["Plan", "Space & flow"],
              ["Specify", "Materials & light"],
              ["Deliver", "On site, to the end"],
            ].map(([v, l]) => (
              <div key={v}>
                <dt className="font-display text-[1.2rem] leading-none text-[color:var(--color-ink)] sm:text-[1.5rem]">
                  {v}
                </dt>
                <dd className="mt-2 font-sans text-micro uppercase leading-snug tracking-[0.16em] text-[color:var(--color-ink-3)] sm:text-meta sm:tracking-[0.2em]">
                  {l}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal className="order-1 lg:order-2" delay={120}>
          <figure className="relative aspect-[4/5] w-full overflow-hidden">
            <AppImage
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
