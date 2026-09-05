import { AppImage } from "@/components/ui/AppImage";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { photos } from "@/lib/photography";
import { brand } from "@/lib/tokens";

export function ContactCta() {
  return (
    <section id="contact" className="on-onyx relative overflow-hidden bg-transparent">
      <div className="absolute inset-0">
        <AppImage src={photos.entryBronzePortal.src} alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[color:var(--color-onyx)]/80" />
      </div>

      <div className="shell relative py-[clamp(5rem,10vw,10rem)]">
        <Reveal className="max-w-2xl text-[color:var(--color-marble)]">
          <p className="eyebrow">Start a project</p>
          <h2 className="mt-6 max-w-[16ch] font-display [font-size:var(--step-4)] [line-height:1.03] text-[color:var(--color-marble)]">
            Tell us about the space you want to change.
          </h2>
          <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-[color:var(--color-on-onyx-2)]">
            We take on a small number of residential and workplace projects each
            year, from single rooms to whole-home renovations.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Button href="/contact" variant="contrast" size="lg" withArrow>
              Enquire
            </Button>
            <a
              href={`mailto:${brand.email}`}
              className="link-underline inline-flex min-h-11 items-center font-sans text-meta uppercase tracking-[0.22em] text-[color:var(--color-marble)]/85 hover:text-[color:var(--color-marble)]"
            >
              {brand.email}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
