"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { clamp01, ease, near, prog, seg, prefersReducedMotion } from "./motion";
import { defaultFridge, inItsPlace } from "@/lib/assets";

// Desktop (>760px): 380vh sticky stage; three 100vw scenes slide horizontally
// with piecewise pacing (exit 1 → dwell on 2 → reveal 3 → hold), veils and
// parallax. Narrow: 300vh stage; the scenes stack absolutely and CROSSFADE by
// scroll, each drifting up 14px as it fades in. Reduced motion: plain stacked
// scenes, no stage.
export default function HorizontalStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const s1TextRef = useRef<HTMLDivElement>(null);
  const s1MediaRef = useRef<HTMLDivElement>(null);
  const s2TextRef = useRef<HTMLHeadingElement>(null);
  const s2VeilRef = useRef<HTMLDivElement>(null);
  const s3MediaRef = useRef<HTMLDivElement>(null);
  const s3TextRef = useRef<HTMLDivElement>(null);
  const s3VeilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || prefersReducedMotion()) return;
    const root = document.documentElement;
    const narrowQuery = window.matchMedia("(max-width: 760px)");

    let raf = 0;
    const set = (el: HTMLElement | null, prop: "transform" | "opacity", val: string) => {
      if (el) el.style[prop] = val;
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!near(section)) return;

      const p = prog(section);
      const W = window.innerWidth;
      const scenes = Array.from(track.children) as HTMLElement[];

      if (narrowQuery.matches) {
        track.style.transform = "none";
        track.style.display = "block";
        track.style.position = "relative";
        const fades = [
          1 - ease(seg(p, 0.06, 0.3)),
          Math.min(ease(seg(p, 0.14, 0.34)), 1 - ease(seg(p, 0.52, 0.74))),
          ease(seg(p, 0.58, 0.8)),
        ];
        scenes.forEach((el, i) => {
          const f = clamp01(fades[i]);
          el.style.position = "absolute";
          el.style.inset = "0";
          el.style.width = "100%";
          el.style.opacity = f.toFixed(3);
          el.style.transform = `translate3d(0, ${((1 - f) * 14).toFixed(1)}px, 0)`;
          el.style.pointerEvents = f > 0.5 ? "auto" : "none";
        });
        // Neutralize the desktop-only choreography.
        set(s2VeilRef.current, "opacity", "0");
        set(s3VeilRef.current, "opacity", "0");
        set(s3TextRef.current, "opacity", "1");
        set(s3MediaRef.current, "transform", "none");
        set(s1TextRef.current, "transform", "none");
        set(s1MediaRef.current, "transform", "none");
        set(s2TextRef.current, "transform", "none");
      } else {
        if (track.style.display === "block") {
          track.style.display = "";
          track.style.position = "";
          scenes.forEach((el) => {
            el.style.position = "";
            el.style.inset = "";
            el.style.width = "";
            el.style.opacity = "";
            el.style.transform = "";
            el.style.pointerEvents = "";
          });
        }
        const t1 = ease(seg(p, 0, 0.3));
        const t2 = ease(seg(p, 0.52, 0.79));
        track.style.transform = `translate3d(${(-(t1 + t2) * W).toFixed(1)}px, 0, 0)`;
        set(s1TextRef.current, "transform", `translate3d(${(t1 * W * 0.22).toFixed(1)}px, 0, 0)`);
        set(s1MediaRef.current, "transform", `translate3d(${(-t1 * W * 0.06).toFixed(1)}px, 0, 0)`);
        set(s2TextRef.current, "transform", `translate3d(${(-t2 * W * 0.18).toFixed(1)}px, 0, 0)`);
        set(s2VeilRef.current, "opacity", (1 - ease(seg(p, 0.06, 0.28))).toFixed(3));
        set(s3VeilRef.current, "opacity", (1 - ease(seg(p, 0.62, 0.8))).toFixed(3));
        set(s3MediaRef.current, "transform", `scale(${(1.14 - 0.14 * ease(seg(p, 0.56, 0.86))).toFixed(3)})`);
        set(s3TextRef.current, "opacity", ease(seg(p, 0.7, 0.84)).toFixed(3));
      }

      root.style.setProperty("--kold-nav-dim", p > 0.02 && p < 0.99 ? "0.45" : "1");
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      root.style.removeProperty("--kold-nav-dim");
    };
  }, []);

  const eyebrow = "font-mono text-[10px] tracking-[0.3em]";
  const scene =
    "relative box-border flex-none overflow-hidden h-svh w-screen max-[760px]:motion-safe:absolute max-[760px]:motion-safe:inset-0 max-[760px]:motion-safe:w-full motion-reduce:h-[82svh] motion-reduce:w-full";

  return (
    <section
      id="hstory"
      ref={sectionRef}
      className="relative h-[380vh] bg-kold-light max-[760px]:h-[300vh] motion-reduce:h-auto!"
    >
      <div className="sticky top-0 h-svh overflow-hidden motion-reduce:static motion-reduce:h-auto">
        <div
          id="htrack"
          ref={trackRef}
          className="flex h-full will-change-transform max-[760px]:motion-safe:relative max-[760px]:motion-safe:block motion-reduce:flex-col"
        >
          {/* Scene 1 — the status quo. Narrow: full-bleed photo, text as dark overlay. */}
          <div
            className={`${scene} grid grid-cols-[0.36fr_0.64fr] items-center bg-kold-light text-kold-ink max-[760px]:grid-cols-1 max-[760px]:motion-reduce:grid-rows-[auto_1fr]`}
          >
            <div
              ref={s1TextRef}
              className="z-2 p-[clamp(28px,6vh,110px)_clamp(24px,3.5vw,52px)_clamp(34px,7vh,110px)_clamp(20px,5vw,72px)] max-[760px]:pb-[max(72px,11svh)] max-[760px]:motion-safe:absolute max-[760px]:motion-safe:inset-0 max-[760px]:motion-safe:flex max-[760px]:motion-safe:flex-col max-[760px]:motion-safe:justify-end max-[760px]:motion-safe:bg-[linear-gradient(0deg,rgba(12,12,13,0.86)_0%,rgba(12,12,13,0.5)_42%,rgba(12,12,13,0.05)_75%)]"
            >
              <div
                className={`${eyebrow} text-[#8a7f6b] max-[760px]:motion-safe:text-kold-gold`}
              >
                THE DEFAULT
              </div>
              <h2
                className="mt-[18px] mb-0 text-[length:clamp(2rem,4.8vw,4.4rem)] font-normal max-[760px]:text-[length:clamp(1.9rem,7.4vw,2.7rem)] max-[760px]:motion-safe:text-kold-cream"
                style={{ lineHeight: 0.98, letterSpacing: "-0.04em" }}
              >
                Everything got more intentional. Except this.
              </h2>
              <p className="mt-5 mb-0 max-w-[26ch] font-mono text-xs leading-[1.7] tracking-[0.04em] text-[#7d766a] max-[760px]:motion-safe:text-kold-soft">
                Loose vials. Extra boxes. Whatever fits.
              </p>
            </div>
            <div
              ref={s1MediaRef}
              className="h-full overflow-hidden bg-[#e6e2d8] max-[760px]:motion-safe:absolute max-[760px]:motion-safe:inset-0"
            >
              <Image
                src={defaultFridge}
                alt="Loose medication vials and boxes scattered on a refrigerator shelf"
                className="h-full w-full object-cover object-[52%_center] max-[760px]:object-[58%_center]"
                sizes="(max-width: 760px) 100vw, 64vw"
              />
            </div>
          </div>

          {/* Scene 2 — the turn */}
          <div
            className={`${scene} flex items-center justify-center bg-kold-light-2 text-kold-ink max-[760px]:motion-safe:opacity-0`}
            style={{ padding: "clamp(60px, 10vh, 130px) clamp(20px, 5vw, 72px)" }}
          >
            <h2
              ref={s2TextRef}
              className="relative z-2 m-0 max-w-[13ch] text-center font-light"
              style={{ fontSize: "clamp(3rem, 8.4vw, 8rem)", lineHeight: 0.92, letterSpacing: "-0.05em" }}
            >
              So we redesigned it.
            </h2>
            <div ref={s2VeilRef} className="pointer-events-none absolute inset-0 bg-kold-light-2 opacity-0" />
          </div>

          {/* Scene 3 — KOLD */}
          <div className={`${scene} bg-[#0d0e11] text-kold-light max-[760px]:motion-safe:opacity-0`}>
            <div ref={s3MediaRef} className="absolute inset-0">
              <Image
                src={inItsPlace}
                alt="The KOLD case open on a refrigerator shelf, twelve capped vials seated in its insert"
                fill
                className="object-cover object-[center_58%] max-[760px]:object-[47%_center]"
                sizes="100vw"
              />
            </div>
            <div
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(10,11,13,0.88)_0%,rgba(10,11,13,0.5)_42%,rgba(10,11,13,0.12)_72%,rgba(10,11,13,0.35)_100%)] max-[760px]:bg-[linear-gradient(0deg,rgba(10,11,13,0.9)_0%,rgba(10,11,13,0.5)_44%,rgba(10,11,13,0.08)_76%)]"
            />
            <div
              ref={s3TextRef}
              className="relative z-2 box-border flex h-full max-w-[46%] flex-col justify-end p-[clamp(48px,8vh,96px)_clamp(20px,5vw,72px)] max-[760px]:max-w-full max-[760px]:pb-[max(64px,10svh)]"
            >
              <div className={`${eyebrow} text-kold-gold`}>KOLD</div>
              <h2
                className="mt-5 mb-0 text-[length:clamp(2.4rem,5.4vw,5rem)] font-normal text-kold-cream max-[760px]:text-[length:clamp(2.1rem,8.6vw,3rem)]"
                style={{ lineHeight: 0.94, letterSpacing: "-0.04em" }}
              >
                Everything.
                <br />
                In its place.
              </h2>
              <p className="mt-[22px] mb-0 max-w-[26ch] text-[15px] leading-[1.6] text-kold-soft">
                Purpose-built refrigerated storage.
              </p>
              <a
                href="#design"
                className="mt-[30px] flex min-h-11 items-center self-start border-b border-[rgba(231,227,219,0.32)] font-mono text-[11px] uppercase tracking-[0.24em] text-kold-text hover:text-kold-gold"
              >
                Explore the design →
              </a>
            </div>
            <div ref={s3VeilRef} className="pointer-events-none absolute inset-0 bg-[#0d0e11] opacity-0" />
          </div>
        </div>
      </div>
    </section>
  );
}
