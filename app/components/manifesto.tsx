"use client";

import { useEffect, useRef } from "react";
import { band, near, prog, prefersReducedMotion } from "./motion";

// 320vh sticky stage; each line fades in over its own scroll band.
const LINES: { text: string; band: [number, number, number]; major?: boolean }[] = [
  { text: "You upgraded the routine.", band: [0.04, 0.95, 0.05], major: true },
  { text: "The training.", band: [0.16, 0.95, 0.05] },
  { text: "The recovery.", band: [0.26, 0.95, 0.05] },
  { text: "The nutrition.", band: [0.36, 0.95, 0.05] },
  { text: "The details.", band: [0.46, 0.95, 0.05] },
];

export default function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!near(section)) return;
      const mp = prog(section);
      const bands: [number, number, number][] = [...LINES.map((l) => l.band), [0.64, 1.0, 0.06], [0.76, 1.0, 0.06]];
      bands.forEach((b, i) => {
        const el = lineRefs.current[i];
        if (el) el.style.opacity = band(mp, b[0], b[1], b[2]).toFixed(3);
      });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const setRef = (i: number) => (el: HTMLDivElement | null) => {
    lineRefs.current[i] = el;
  };

  return (
    <section id="manifesto" ref={sectionRef} className="relative h-[320vh] bg-kold motion-reduce:h-screen">
      <div
        className="sticky top-0 flex h-screen flex-col items-center justify-center px-6 text-center"
        style={{ gap: "clamp(10px, 1.4vh, 18px)" }}
      >
        {LINES.map((l, i) => (
          <div
            key={l.text}
            ref={setRef(i)}
            className={`font-light opacity-0 motion-reduce:opacity-100! ${l.major ? "text-kold-cream-2" : "text-kold-muted"}`}
            style={{
              fontSize: l.major ? "clamp(1.6rem, 3.6vw, 3.4rem)" : "clamp(1.4rem, 3vw, 2.8rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {l.text}
          </div>
        ))}
        <div
          ref={setRef(LINES.length)}
          className="font-light text-kold-cream-2 opacity-0 motion-reduce:opacity-100!"
          style={{
            marginTop: "clamp(28px, 5vh, 60px)",
            fontSize: "clamp(1.6rem, 3.6vw, 3.4rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
          }}
        >
          We redesigned one more.
        </div>
        <div
          ref={setRef(LINES.length + 1)}
          className="font-normal text-kold-cream-2 opacity-0 motion-reduce:opacity-100!"
          style={{
            marginTop: "clamp(18px, 3vh, 40px)",
            fontSize: "clamp(3.4rem, 11vw, 10rem)",
            lineHeight: 0.9,
            letterSpacing: "0.06em",
          }}
        >
          KOLD
        </div>
      </div>
    </section>
  );
}
