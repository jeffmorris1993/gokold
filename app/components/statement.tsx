import Image from "next/image";
import Reveal from "./reveal";
import { statement } from "@/lib/assets";

export default function Statement() {
  return (
    <section className="bg-black" style={{ padding: "clamp(90px, 16vh, 220px) clamp(20px, 5vw, 80px)" }}>
      <div className="mx-auto max-w-[1280px] text-center">
        <Reveal>
          <h2
            className="mx-auto my-0 max-w-[22ch] font-light text-kold-cream-2"
            style={{ fontSize: "clamp(2.2rem, 6.4vw, 6rem)", lineHeight: 0.96, letterSpacing: "-0.04em" }}
          >
            Storage didn&rsquo;t have to look clinical.
          </h2>
        </Reveal>
        <Reveal kind="media" className="aspect-16/10 overflow-hidden bg-black" style={{ marginTop: "clamp(56px, 9vh, 120px)" }}>
          <Image
            src={statement}
            alt="The KOLD case with smoked lid photographed on black"
            className="h-full w-full object-cover"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
        </Reveal>
      </div>
    </section>
  );
}
