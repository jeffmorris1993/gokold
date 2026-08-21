"use client";

import { useEffect, useRef } from "react";
import { band, clamp01, near, prog, ramp, prefersReducedMotion } from "./motion";

const FILM_START = 0.03;
const FILM_END = 0.78;

// Tall section with a sticky 100vh stage: the film stays paused and its
// currentTime is scrubbed by scroll progress, lerped per frame for weight.
// Desktop overlays the hero panel on the film; below 760px the stage stacks —
// film on top (capped at 64vh), panel below it in flow.
export default function HeroScrub() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;
    const root = document.documentElement;

    if (prefersReducedMotion()) {
      // Static hero: park the film on its closing frame; CSS shows the panel.
      const park = () => {
        try {
          video.pause();
          if (isFinite(video.duration)) video.currentTime = Math.max(0, video.duration - 0.05);
        } catch {}
      };
      if (video.readyState >= 1) park();
      else video.addEventListener("loadedmetadata", park, { once: true });
      ["--kold-nav-mark", "--kold-nav-links", "--kold-nav-events"].forEach((v) =>
        root.style.removeProperty(v)
      );
      return;
    }

    // Prime the first frame so the stage isn't black before any scroll.
    let cur = 0.02;
    const prime = () => {
      try {
        video.currentTime = 0.02;
      } catch {}
    };
    if (video.readyState >= 1) prime();
    else video.addEventListener("loadedmetadata", prime, { once: true });

    // iOS Safari ignores preload="auto": without a nudge the video never
    // reaches readyState 1 and scrubbing is a no-op. A muted playsinline
    // play()+pause() is allowed without a gesture and starts the pipeline;
    // Low Power Mode rejects it, so retry on the first touch as a fallback.
    const pump = () => {
      if (video.readyState >= 1) return;
      try {
        video.load();
      } catch {}
      const p = video.play();
      if (p) p.then(() => video.pause()).catch(() => {});
    };
    pump();
    const onFirstTouch = () => pump();
    window.addEventListener("touchstart", onFirstTouch, { passive: true, once: true });

    let raf = 0;
    const setO = (el: HTMLElement | null, o: number) => {
      if (el) el.style.opacity = o.toFixed(3);
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!near(section)) return;

      const p = prog(section);
      const markO = ramp(p, 0.79, 0.815);
      const navO = ramp(p, 0.805, 0.83);
      const heroO = ramp(p, 0.825, 0.855);
      const ctaO = ramp(p, 0.855, 0.885);

      setO(scrimRef.current, Math.max(markO, ramp(p, 0.78, 0.83)));
      const panel = panelRef.current;
      if (panel) {
        panel.style.opacity = ramp(p, 0.785, 0.83).toFixed(3);
        panel.style.pointerEvents = ctaO > 0.5 ? "auto" : "none";
      }
      [eyebrowRef.current, h1Ref.current, subRef.current].forEach((el) => {
        if (!el) return;
        el.style.opacity = heroO.toFixed(3);
        el.style.transform = `translateY(${((1 - heroO) * 16).toFixed(2)}px)`;
      });
      setO(ctaRef.current, ctaO);
      setO(hintRef.current, band(p, 0, 0.04, 0.03));

      root.style.setProperty("--kold-nav-mark", markO.toFixed(3));
      root.style.setProperty("--kold-nav-links", navO.toFixed(3));
      root.style.setProperty("--kold-nav-events", navO > 0.5 ? "auto" : "none");

      if (video.readyState >= 1 && isFinite(video.duration)) {
        if (!video.paused) video.pause();
        const scrub = clamp01((p - FILM_START) / (FILM_END - FILM_START));
        const target = scrub * (video.duration - 0.04);
        cur += (target - cur) * 0.14;
        if (Math.abs(target - cur) < 0.004) cur = target;
        if (Math.abs(video.currentTime - cur) > 0.012 && !video.seeking) {
          try {
            video.currentTime = cur;
          } catch {}
        }
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("touchstart", onFirstTouch);
    };
  }, []);

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative h-[520vh] max-[760px]:h-[390vh] motion-reduce:h-svh!"
    >
      <div className="sticky top-0 flex h-svh w-full flex-col overflow-hidden bg-black">
        <div className="relative h-full min-h-0 w-full flex-none overflow-hidden">
          <video
            ref={videoRef}
            src="/kold-scroll.mp4"
            muted
            playsInline
            preload="auto"
            aria-label="Cinematic film of the KOLD case: a locked, smoked-lid vial case opening on a marble pedestal"
            className="absolute inset-0 h-full w-full object-cover object-center max-[760px]:object-[58%_center]"
          />
          <div
            ref={scrimRef}
            className="pointer-events-none absolute inset-0 opacity-0 motion-reduce:opacity-100!"
            style={{
              background:
                "linear-gradient(180deg, rgba(10,10,11,0.55) 0%, rgba(10,10,11,0) 32%, rgba(10,10,11,0) 62%, rgba(10,10,11,0.6) 100%)",
            }}
          />
        </div>

        <div
          ref={panelRef}
          className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-none flex-col items-start justify-end p-[clamp(28px,7vh,72px)_clamp(20px,5vw,72px)] text-left opacity-0 max-[760px]:p-[26px_20px_40px] motion-reduce:pointer-events-auto! motion-reduce:opacity-100!"
          style={{
            background:
              "linear-gradient(0deg, rgba(8,8,9,0.82) 0%, rgba(8,8,9,0.5) 55%, rgba(8,8,9,0) 100%)",
          }}
        >
          <div
            ref={eyebrowRef}
            className="mb-[18px] font-mono text-[11px] tracking-[0.34em] text-kold-gold opacity-0 motion-reduce:opacity-100!"
          >
            INTRODUCING KOLD
          </div>
          <h1
            ref={h1Ref}
            className="m-0 text-[length:clamp(2.3rem,5.4vw,5rem)] font-normal text-kold-cream opacity-0 max-[760px]:text-[length:2rem] motion-reduce:opacity-100!"
            style={{ lineHeight: 0.96, letterSpacing: "-0.035em" }}
          >
            Cold storage.
            <br />
            Reconsidered.
          </h1>
          <p
            ref={subRef}
            className="mt-5 mb-0 max-w-[34ch] text-kold-soft opacity-0 motion-reduce:opacity-100!"
            style={{ fontSize: "clamp(13px, 1.05vw, 16px)", lineHeight: 1.6, textWrap: "pretty" }}
          >
            A better home for the part of your routine nobody redesigned.
          </p>
          <a
            ref={ctaRef}
            href="#early-access"
            className="mt-[30px] inline-block min-h-12 bg-kold-text px-[30px] py-[17px] font-mono text-[11px] uppercase tracking-[0.22em] text-kold opacity-0 transition-colors hover:bg-kold-gold motion-reduce:opacity-100!"
          >
            Join Early Access →
          </a>
        </div>

        <div
          ref={hintRef}
          className="pointer-events-none absolute bottom-[34px] left-1/2 flex -translate-x-1/2 flex-col items-center gap-[10px] motion-reduce:hidden"
        >
          <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#7d7a74]">Scroll</div>
          <div
            className="h-[38px] w-px"
            style={{ background: "linear-gradient(180deg, rgba(201,178,140,0.7), rgba(201,178,140,0))" }}
          />
        </div>
      </div>
    </section>
  );
}
