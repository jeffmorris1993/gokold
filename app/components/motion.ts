// Shared scroll math, ported from the approved design comp.

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Linear ramp from 0 at `a` to 1 at `c`. */
export const ramp = (p: number, a: number, c: number) => clamp01((p - a) / (c - a));

/** Normalized sub-segment of progress `p` between `a` and `b`. */
export const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

/** Smoothstep easing. */
export const ease = (t: number) => t * t * (3 - 2 * t);

/** 1 inside [a, b], fading to 0 over `fade` on both edges. */
export function band(p: number, a: number, b: number, fade = 0.05) {
  if (p <= a - fade || p >= b + fade) return 0;
  if (p < a) return (p - (a - fade)) / fade;
  if (p > b) return 1 - (p - b) / fade;
  return 1;
}

/** Scroll progress (0–1) of a tall section with a sticky stage inside. */
export function prog(el: HTMLElement | null) {
  if (!el) return 0;
  const r = el.getBoundingClientRect();
  const span = r.height - window.innerHeight;
  if (span <= 0) return 0;
  return clamp01(-r.top / span);
}

/** Whether a section is close enough to the viewport to animate. */
export function near(el: HTMLElement | null, margin = 200) {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.bottom > -margin && r.top < window.innerHeight + margin;
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
