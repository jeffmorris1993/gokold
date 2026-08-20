import Image from "next/image";
import Reveal from "./reveal";
import { atHome } from "@/lib/assets";

export default function Details() {
  return (
    <section id="details" className="bg-kold" style={{ padding: "clamp(90px, 15vh, 200px) clamp(20px, 5vw, 80px)" }}>
      <div
        className="mx-auto grid max-w-[1280px] grid-cols-[repeat(auto-fit,minmax(320px,1fr))] items-end max-[400px]:grid-cols-1"
        style={{ gap: "clamp(36px, 5vw, 80px)" }}
      >
        <div>
          <Reveal>
            <div className="font-mono text-[11px] tracking-[0.3em] text-kold-gold">MADE FOR REAL LIFE</div>
          </Reveal>
          <Reveal delay={70}>
            <h2
              className="mt-7 mb-0 font-normal text-kold-cream-2"
              style={{ fontSize: "clamp(2.2rem, 5.4vw, 4.8rem)", lineHeight: 0.98, letterSpacing: "-0.035em" }}
            >
              At home where it belongs.
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p
              className="mt-[26px] mb-0 max-w-[38ch] text-[15px] leading-[1.65] text-kold-muted"
              style={{ textWrap: "pretty" }}
            >
              Premium enough to stand alone. Designed to live inside your refrigerator.
            </p>
          </Reveal>
        </div>
        <Reveal
          kind="media"
          className="aspect-4/5 overflow-hidden bg-kold-panel max-[760px]:mx-[calc(clamp(20px,5vw,80px)*-1)]"
        >
          <Image
            src={atHome}
            alt="A stocked refrigerator with the KOLD case centered on its own shelf"
            className="h-full w-full object-cover object-[center_40%]"
            sizes="(max-width: 760px) 100vw, 50vw"
          />
        </Reveal>
      </div>
    </section>
  );
}
