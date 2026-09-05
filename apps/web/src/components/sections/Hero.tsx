"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Pause, Play } from "@/components/ui/icons";
import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/useMediaQuery";

// The whole 3D stage (controls, inspector and the three.js canvas) is a desktop
// concern — keep it out of the bundle phones ever download.
const Stage = dynamic(() => import("@/components/three/Stage").then((m) => m.Stage), {
  ssr: false,
});

export function Hero() {
  // The interactive 3D room is a desktop experience. Phones and small tablets
  // get the studio intro film instead — lighter on the CPU and the battery.
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section
      id="experience"
      aria-label="Interactive interior"
      className="relative flex min-h-[100svh] flex-col bg-[color:#e9e6dd] md:block"
    >
      {/* Visual: film block on top on mobile, full-bleed layer on desktop */}
      <div className="relative order-1 h-[54svh] min-h-[22rem] w-full overflow-hidden md:absolute md:inset-0 md:order-none md:h-auto md:min-h-0">
        {!mounted ? <HeroPoster /> : isDesktop ? <Stage /> : <HeroFilm />}
        {/* desktop-only scrims for overlaid copy */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-10 hidden h-56 bg-gradient-to-b from-[color:#e9e6dd]/85 to-transparent md:block"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-[56%] bg-gradient-to-r from-[color:#e9e6dd]/92 via-[color:#e9e6dd]/45 to-transparent md:block"
        />
      </div>

      {/* Copy: below the film on mobile, overlaid left on desktop */}
      <div className="relative order-2 z-20 flex flex-1 flex-col justify-center pt-9 pb-14 md:pointer-events-none md:absolute md:inset-0 md:order-none md:justify-center md:pt-0 md:pb-0">
        <div className="shell md:pt-24">
          <p className="eyebrow anim-fade-up [animation-delay:0.15s]">
            Interior Design &amp; Renovation
          </p>

          <h1 className="display anim-fade-up mt-3 max-w-[14ch] text-[color:var(--color-ink)] [animation-delay:0.25s] md:mt-5">
            Design your <em>space</em>.
          </h1>

          <p className="lede anim-fade-up mt-4 max-w-[42ch] [animation-delay:0.4s] md:mt-6 md:max-w-[38ch]">
            Turn your ideas into beautifully considered interiors. Explore the room,
            change the light, try a material — then hand it to the studio.
          </p>

          <div className="anim-fade-up mt-7 flex flex-col items-start gap-4 [animation-delay:0.55s] sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-3 md:pointer-events-auto md:mt-9">
            <Button href="/contact" withArrow>
              Start a project
            </Button>
            <Button href="#studio" variant="quiet">
              See how we work
            </Button>
          </div>
        </div>
      </div>

      <ScrollCue />
    </section>
  );
}

function HeroPoster() {
  return (
    <div className="absolute inset-0 bg-[color:#e9e6dd]">
      <Image
        src="/brand/brand-hero-living-room.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
    </div>
  );
}

function HeroFilm() {
  const reduced = usePrefersReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(!reduced);

  // don't start an autoplaying loop for anyone who's asked for reduced motion —
  // show the same poster frame the video would otherwise open on
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !reduced) return;
    v.pause();
    setPlaying(false);
  }, [reduced]);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) {
      v.pause();
      setPlaying(false);
    } else {
      void v.play();
      setPlaying(true);
    }
  };

  return (
    <div className="absolute inset-0 bg-[color:#e9e6dd]">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        autoPlay={!reduced}
        muted
        loop
        playsInline
        preload="metadata"
        poster="/brand/brand-hero-living-room.jpg"
        aria-hidden
      >
        <source src="/stilio-intro.mp4" type="video/mp4" />
      </video>
      {/* keep the dark header marks legible over the film */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[color:#e9e6dd]/80 to-transparent"
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause background film" : "Play background film"}
        className="absolute bottom-4 right-4 z-10 flex h-11 w-11 items-center justify-center border border-[color:var(--color-marble)]/30 bg-[color:var(--color-onyx)]/55 text-[color:var(--color-marble)] backdrop-blur-sm hover:bg-[color:var(--color-onyx)]/75"
      >
        {playing ? <Pause width={14} height={14} /> : <Play width={14} height={14} />}
      </button>
    </div>
  );
}

function ScrollCue() {
  return (
    <div
      className="pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex"
      aria-hidden
    >
      <span className="font-sans text-micro uppercase tracking-[0.3em] text-[color:var(--color-ink-3)]">
        Scroll
      </span>
      <span className="scroll-cue block h-8 w-px bg-[color:var(--color-line-strong)]" />
    </div>
  );
}
