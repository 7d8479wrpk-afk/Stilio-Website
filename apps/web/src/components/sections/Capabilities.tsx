import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRight } from "@/components/ui/icons";
import { services } from "@/lib/services";

const LETTERS = ["A", "B", "C", "D"];

export function Capabilities() {
  return (
    <section className="section on-onyx grain relative overflow-hidden">
      <div className="shell relative">
        <Reveal>
          <Eyebrow index="02">What we do</Eyebrow>
          <h2 className="mt-6 max-w-[18ch] font-display [font-size:var(--step-3)] [line-height:1.08]">
            A full studio, working to one intention.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-px border border-[color:var(--color-onyx-surface)] bg-[color:var(--color-onyx-surface)] sm:grid-cols-2">
          {services.map((s, i) => (
            <Reveal key={s.slug} delay={i * 80} className="bg-[color:var(--color-onyx)]">
              <Link
                href={`/services/${s.slug}`}
                className="group block h-full p-8 transition-colors hover:bg-[color:var(--color-onyx-surface)] md:p-11"
              >
                <span className="font-display text-[1.3rem] text-[color:var(--color-champagne)]">
                  {LETTERS[i]}
                </span>
                <h3 className="mt-4 font-display text-[1.55rem] font-normal text-[color:var(--color-marble)]">
                  {s.name}
                </h3>
                <p className="mt-3 max-w-sm text-[0.96rem] leading-relaxed text-[color:var(--color-on-onyx-2)]">
                  {s.summary}
                </p>
                <span className="link-underline mt-4 inline-flex items-center gap-2 font-sans text-micro uppercase tracking-[0.2em] text-[color:var(--color-champagne)]">
                  Learn more <ArrowRight width={13} height={13} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
