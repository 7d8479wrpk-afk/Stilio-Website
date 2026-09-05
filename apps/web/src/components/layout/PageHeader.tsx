import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function PageHeader({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="shell pb-[clamp(2.5rem,5vw,4.5rem)] pt-[clamp(6.5rem,16vw,12rem)]">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="mt-5 max-w-[18ch] font-display [font-size:var(--step-display)] [line-height:1.02] md:mt-6">
        {title}
      </h1>
      {lede ? <p className="lede measure mt-5 md:mt-7">{lede}</p> : null}
      {children}
    </header>
  );
}
