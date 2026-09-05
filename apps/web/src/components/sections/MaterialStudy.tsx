import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { Compare } from "@/components/ui/Compare";
import { ArrowRight } from "@/components/ui/icons";
import { photos } from "@/lib/photography";
import { materials } from "@/lib/materials";

const swatches = materials.filter((m) => m.previewable).slice(0, 7);

export function MaterialStudy() {
  return (
    <section id="materials" className="section bg-[color:var(--color-surface-deep)]">
      <div className="shell">
        <Reveal className="grid gap-10 lg:grid-cols-[0.8fr_1fr] lg:items-center lg:gap-16">
          <div>
            <Eyebrow index="04">Material</Eyebrow>
            <h2 className="mt-6 font-display [font-size:var(--step-3)] [line-height:1.08]">
              The palette is the design.
            </h2>
            <p className="measure mt-6 text-[1.02rem] leading-relaxed text-[color:var(--color-ink-2)]">
              Every scheme is built from a short list of honest materials —
              rift-sawn oak, honed stone, natural linen, brushed brass — chosen for
              how they age as much as how they look on day one.
            </p>
            <ul className="mt-8 flex flex-wrap gap-1.5">
              {swatches.map((m) => (
                <li
                  key={m.slug}
                  title={`${m.name} — ${m.category}`}
                  className="h-14 w-10 border border-[color:var(--color-line-strong)] shadow-[inset_0_0_0_1px_rgba(22,20,15,0.05),inset_0_-18px_28px_-18px_rgba(22,20,15,0.4)]"
                  style={{ background: m.swatch }}
                >
                  <span className="sr-only">{m.name}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/materials"
              className="link-underline mt-8 inline-flex items-center gap-2 font-sans text-meta uppercase tracking-[0.22em] text-[color:var(--color-ink-2)] hover:text-[color:var(--color-ink)]"
            >
              Open the material library <ArrowRight width={14} height={14} />
            </Link>
          </div>

          <div>
            <Compare
              before={photos.livingScandiCalm}
              after={photos.livingPenthouseWarm}
              beforeLabel="Pale direction"
              afterLabel="Warm direction"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
            <p className="mt-3 font-sans text-meta uppercase tracking-[0.16em] text-[color:var(--color-ink-3)]">
              Palette study &middot; drag to compare
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
