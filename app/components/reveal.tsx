"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { prefersReducedMotion } from "./motion";

type RevealProps = {
  kind?: "text" | "media";
  /** Stagger delay in ms (applied to the reveal transition). */
  delay?: number;
  /** Media gets a subtle viewport-centered parallax; opt out with false. */
  parallax?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export default function Reveal({
  kind = "text",
  delay = 0,
  parallax = kind === "media",
  className,
  style,
  children,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.dataset.shown = "true";
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.dataset.shown = "true";
          io.disconnect();
        }
      },
      { rootMargin: "0% 0% -10% 0%" }
    );
    io.observe(el);

    let raf = 0;
    let onScroll: (() => void) | null = null;
    if (parallax) {
      const narrowQuery = window.matchMedia("(max-width: 760px)");
      onScroll = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          if (narrowQuery.matches) {
            el.style.transform = "";
            return;
          }
          const r = el.getBoundingClientRect();
          const h = window.innerHeight;
          if (r.bottom < -100 || r.top > h + 100) return;
          const c = (r.top + r.height / 2 - h / 2) / h;
          el.style.transform = `translate3d(0, ${(-c * 22).toFixed(2)}px, 0)`;
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      onScroll();
    }

    return () => {
      io.disconnect();
      if (onScroll) {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        cancelAnimationFrame(raf);
      }
    };
  }, [parallax]);

  return (
    <div
      ref={ref}
      data-reveal={kind}
      className={className}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined, ...style }}
    >
      {children}
    </div>
  );
}
