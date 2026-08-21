"use client";

import { useEffect, useRef } from "react";
import { band, clamp01, near, prog, ramp, prefersReducedMotion } from "./motion";

const FILM_START = 0.03;
const FILM_END = 0.78;

// Desktop (>760px): tall section with a sticky stage — the film stays paused
// and its currentTime is scrubbed by scroll, lerped per frame for weight.
// Mobile: scroll-scrubbing video is unreliable on phone browsers, so the hero
// is a single full-screen section where the film autoplays once (muted,
// inline), holds its final frame, and the headline fades in as it finishes.
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
    const clearNavVars = () =>
      ["--kold-nav-mark", "--kold-nav-links", "--kold-nav-events"].forEach((v) =>
        root.style.removeProperty(v)
      );

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
      clearNavVars();
      return;
    }

    const textEls = () => [eyebrowRef.current, h1Ref.current, subRef.current];

    // ---- Desktop: scroll-scrubbed film -----------------------------------
    const setupScrub = () => {
      let cur = 0.02;
      const prime = () => {
        try {
          video.currentTime = 0.02;
        } catch {}
      };
      if (video.readyState >= 1) prime();
      else video.addEventListener("loadedmetadata", prime, { once: true });

      // Some browsers ignore preload="auto" until the pipeline is nudged.
      const pump = () => {
        if (video.readyState >= 1) return;
        try {
          video.load();
        } catch {}
        const p = video.play();
        if (p) p.then(() => video.pause()).catch(() => {});
      };
      pump();

      let raf = 0;
      const setO = (el: HTMLElement | null, o: number) => {
        if (el) el.style.opacity = o.toFixed(3);
      };

      const tick = () => {
        raf = requestAnimationFrame(tick);
        if (!near(section)) {
          // A fast flick can leave the hero before the lerp finishes: once the
          // section is fully above the viewport, park the film on its end.
          const r = section.getBoundingClientRect();
          if (
            r.bottom < 200 &&
            video.readyState >= 1 &&
            isFinite(video.duration) &&
            video.currentTime < video.duration - 0.2 &&
            !video.seeking
          ) {
            try {
              cur = video.duration - 0.04;
              video.currentTime = cur;
            } catch {}
          }
          return;
        }

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
        textEls().forEach((el) => {
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
          const diff = target - cur;
          if (Math.abs(diff) > 2) cur = target;
          else cur += diff * 0.14;
          if (Math.abs(target - cur) < 0.004) cur = target;
          const delta = Math.abs(video.currentTime - cur);
          if (delta > 0.012 && !video.seeking) {
            try {
              if (delta > 0.3 && typeof video.fastSeek === "function") video.fastSeek(cur);
              else video.currentTime = cur;
            } catch {}
          }
        }
      };
      raf = requestAnimationFrame(tick);

      const onFirstTouch = () => pump();
      window.addEventListener("touchstart", onFirstTouch, { passive: true, once: true });

      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("touchstart", onFirstTouch);
      };
    };

    // ---- Mobile: the film plays itself -----------------------------------
    const setupAutoplay = () => {
      let revealed = false;

      // Nav stays hidden while the film plays; text waits below the fold.
      root.style.setProperty("--kold-nav-mark", "0");
      root.style.setProperty("--kold-nav-links", "0");
      root.style.setProperty("--kold-nav-events", "none");
      textEls().forEach((el) => {
        if (el) el.style.transform = "translateY(16px)";
      });

      const reveal = () => {
        if (revealed) return;
        revealed = true;
        root.style.setProperty("--kold-nav-mark", "1");
        root.style.setProperty("--kold-nav-links", "1");
        root.style.setProperty("--kold-nav-events", "auto");
        const scrim = scrimRef.current;
        if (scrim) {
          scrim.style.transition = "opacity 1.1s ease";
          scrim.style.opacity = "1";
        }
        const panel = panelRef.current;
        if (panel) {
          panel.style.transition = "opacity 1.1s ease";
          panel.style.opacity = "1";
          panel.style.pointerEvents = "auto";
        }
        [...textEls(), ctaRef.current].forEach((el, i) => {
          if (!el) return;
          el.style.transition = `opacity .9s ease ${i * 130}ms, transform .9s cubic-bezier(.22,.61,.36,1) ${i * 130}ms`;
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        });
        const hint = hintRef.current;
        if (hint) {
          hint.style.transition = "opacity .5s ease";
          hint.style.opacity = "0";
        }
      };

      const tryPlay = () => {
        const p = video.play();
        if (p) p.catch(() => {});
      };
      if (video.readyState >= 2) tryPlay();
      else {
        try {
          video.load();
        } catch {}
        video.addEventListener("canplay", tryPlay, { once: true });
      }

      // Reveal as the film lands on its closing shot (or when it ends).
      const onTime = () => {
        if (isFinite(video.duration) && video.currentTime >= video.duration * 0.72) reveal();
      };
      const onEnded = () => reveal();
      video.addEventListener("timeupdate", onTime);
      video.addEventListener("ended", onEnded);

      // Autoplay can be blocked (e.g. Low Power Mode): retry on first touch,
      // and never leave the hero textless.
      const onTouch = () => {
        if (video.paused && !video.ended) tryPlay();
      };
      window.addEventListener("touchstart", onTouch, { passive: true });
      const blockedFallback = window.setTimeout(() => {
        if (video.paused || video.currentTime < 0.5) reveal();
      }, 2600);
      const hardFallback = window.setTimeout(reveal, 11000);
      const onScroll = () => {
        if (window.scrollY > window.innerHeight * 0.35) reveal();
      };
      window.addEventListener("scroll", onScroll, { passive: true });

      return () => {
        video.removeEventListener("canplay", tryPlay);
        video.removeEventListener("timeupdate", onTime);
        video.removeEventListener("ended", onEnded);
        window.removeEventListener("touchstart", onTouch);
        window.removeEventListener("scroll", onScroll);
        window.clearTimeout(blockedFallback);
        window.clearTimeout(hardFallback);
        clearNavVars();
        try {
          video.pause();
        } catch {}
      };
    };

    let cleanup: (() => void) | undefined;
    const mq = window.matchMedia("(max-width: 760px)");
    const setup = () => {
      cleanup?.();
      cleanup = mq.matches ? setupAutoplay() : setupScrub();
    };
    setup();
    mq.addEventListener("change", setup);

    return () => {
      mq.removeEventListener("change", setup);
      cleanup?.();
    };
  }, []);

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative h-[520vh] max-[760px]:h-svh motion-reduce:h-svh!"
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
