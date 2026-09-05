import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";

const services = [
  {
    n: "A",
    title: "Interior Design",
    body:
      "Concept, spatial planning, joinery detailing, furniture and styling. A complete scheme, drawn and documented.",
  },
  {
    n: "B",
    title: "Renovation",
    body:
      "Structural changes, services, finishes and site management. We hold the drawings and the programme together.",
  },
  {
    n: "C",
    title: "Material & Lighting",
    body:
      "A resolved palette of stone, timber and textile, and a four-layer lighting design tuned scene by scene.",
  },
  {
    n: "D",
    title: "3D Visualisation",
    body:
      "Every scheme is modelled before a wall moves — so you walk the room, in the right light, before you commit.",
  },
];

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
            <Reveal
              key={s.title}
              delay={i * 80}
              className="bg-[color:var(--color-onyx)] p-8 md:p-11"
            >
              <span className="font-display text-[1.3rem] text-[color:var(--color-champagne)]">
                {s.n}
              </span>
              <h3 className="mt-4 font-display text-[1.55rem] font-normal text-[color:var(--color-marble)]">
                {s.title}
              </h3>
              <p className="mt-3 max-w-sm text-[0.96rem] leading-relaxed text-[color:var(--color-on-onyx-2)]">
                {s.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
