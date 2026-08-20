"use client";

import { useEffect, useState, type CSSProperties } from "react";

const MENU_LINKS: [string, string][] = [
  ["#design", "Design"],
  ["#details", "Details"],
  ["#faq", "FAQ"],
];

// Wordmark/link opacity and pointer-events are driven per-frame by HeroScrub
// (and dimmed by HorizontalStory) through CSS variables on <html>, so the nav
// never re-renders during scroll. Below 760px the links collapse into a
// hamburger that opens a full-screen menu.
export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const top = document.getElementById("top");
      if (!top) return;
      setScrolled(top.getBoundingClientRect().bottom <= window.innerHeight * 0.6);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  const line = "block h-px w-[22px] bg-kold-cream-2";

  return (
    <>
      <nav
        className="fixed inset-x-0 top-0 z-60 flex items-center justify-between transition-[background-color,border-color] duration-300"
        style={{
          padding: "22px clamp(20px, 4vw, 56px)",
          opacity: "var(--kold-nav-dim, 1)" as CSSProperties["opacity"],
          pointerEvents: "var(--kold-nav-events, auto)" as CSSProperties["pointerEvents"],
          background: scrolled ? "rgba(10,10,11,0.78)" : "rgba(10,10,11,0)",
          backdropFilter: scrolled ? "blur(14px)" : undefined,
          borderBottom: `1px solid ${scrolled ? "rgba(231,227,219,0.1)" : "transparent"}`,
        }}
      >
        <a
          href="#top"
          className="text-[15px] font-medium tracking-[0.42em] text-kold-cream-2"
          style={{ opacity: "var(--kold-nav-mark, 1)" as CSSProperties["opacity"] }}
        >
          KOLD
        </a>
        <div
          className="flex items-center font-mono text-[11px] uppercase tracking-[0.18em] max-[760px]:hidden"
          style={{
            gap: "clamp(18px, 3vw, 40px)",
            opacity: "var(--kold-nav-links, 1)" as CSSProperties["opacity"],
          }}
        >
          {MENU_LINKS.map(([href, label]) => (
            <a key={href} href={href} className="text-[#a5a19a] hover:text-kold-gold">
              {label}
            </a>
          ))}
          <a
            href="#early-access"
            className="border border-kold-gold/50 px-4 py-[9px] text-kold-cream-2 hover:text-kold-gold"
          >
            Early Access
          </a>
        </div>
        <button
          type="button"
          aria-label="Menu"
          aria-expanded={menu}
          onClick={() => setMenu((m) => !m)}
          className="-mr-2.5 hidden h-11 w-11 cursor-pointer flex-col items-center justify-center gap-[5px] border-0 bg-transparent p-0 max-[760px]:flex"
          style={{ opacity: "var(--kold-nav-links, 1)" as CSSProperties["opacity"] }}
        >
          <span
            className={`${line} transition-transform duration-300`}
            style={{ transform: menu ? "translateY(6px) rotate(45deg)" : "none" }}
          />
          <span className={`${line} transition-opacity duration-200`} style={{ opacity: menu ? 0 : 1 }} />
          <span
            className={`${line} transition-transform duration-300`}
            style={{ transform: menu ? "translateY(-6px) rotate(-45deg)" : "none" }}
          />
        </button>
      </nav>

      <div
        className="fixed inset-0 z-55 flex flex-col justify-center gap-1.5"
        style={{
          background: "rgba(8,8,9,0.97)",
          backdropFilter: "blur(20px)",
          padding: "0 clamp(20px, 7vw, 48px)",
          opacity: menu ? 1 : 0,
          visibility: menu ? "visible" : "hidden",
          pointerEvents: menu ? "auto" : "none",
          transition: "opacity .38s ease, visibility .38s",
        }}
      >
        {MENU_LINKS.map(([href, label]) => (
          <a
            key={href}
            href={href}
            onClick={() => setMenu(false)}
            className="py-4 font-light text-kold-cream-2"
            style={{ fontSize: "clamp(1.9rem, 9vw, 2.8rem)", letterSpacing: "-0.03em" }}
          >
            {label}
          </a>
        ))}
        <a
          href="#early-access"
          onClick={() => setMenu(false)}
          className="mt-7 flex min-h-12 items-center self-start bg-kold-text px-7 font-mono text-[11px] uppercase tracking-[0.24em] text-kold"
        >
          Early Access
        </a>
      </div>
    </>
  );
}
