import Image, { type StaticImageData } from "next/image";
import Reveal from "./reveal";
import { fridgeReady, precisionInsert, secureClosure, smokedLid } from "@/lib/assets";

type Feature = {
  num: string;
  title: string;
  copy: string;
  image: StaticImageData;
  alt: string;
  mediaFirst: boolean;
  wideOnNarrow?: boolean;
};

const FEATURES: Feature[] = [
  {
    num: "01",
    title: "Smoked Lid",
    copy: "Provides discreet visibility into the interior while maintaining the premium exterior.",
    image: smokedLid,
    alt: "Close-up of the KOLD smoked translucent lid over rows of capped vials",
    mediaFirst: true,
  },
  {
    num: "02",
    title: "Precision Insert",
    copy: "Dedicated organization keeps each vial in its place.",
    image: precisionInsert,
    alt: "Top view of the KOLD insert holding twelve vials in two precise rows",
    mediaFirst: false,
  },
  {
    num: "03",
    title: "Secure Closure",
    copy: "A deliberate locking mechanism creates a more intentional storage experience.",
    image: secureClosure,
    alt: "The KOLD lock slider and engraved wordmark on the case front",
    mediaFirst: true,
  },
  {
    num: "04",
    title: "Refrigerator Ready",
    copy: "Designed specifically around refrigerated storage.",
    image: fridgeReady,
    alt: "The closed KOLD case sitting on a glass refrigerator shelf",
    mediaFirst: false,
    wideOnNarrow: true,
  },
];

// Below 760px the images go full-bleed (cancel the section's inline padding)
// and switch to squarer crops.
const BLEED = "max-[760px]:mx-[calc(clamp(20px,5vw,80px)*-1)]";

export default function Features() {
  return (
    <section id="design" className="bg-kold" style={{ padding: "clamp(90px, 15vh, 200px) clamp(20px, 5vw, 80px)" }}>
      <div className="mx-auto max-w-[1280px]">
        <Reveal>
          <div className="font-mono text-[11px] tracking-[0.3em] text-kold-gold">DESIGNED WITH PURPOSE</div>
        </Reveal>
        <Reveal delay={70}>
          <h2
            className="mt-7 max-w-[20ch] font-normal text-kold-cream-2"
            style={{
              marginBottom: "clamp(60px, 10vh, 130px)",
              fontSize: "clamp(2.2rem, 6vw, 5.4rem)",
              lineHeight: 0.98,
              letterSpacing: "-0.035em",
            }}
          >
            Clean by design.
            <br />
            Thoughtful in every detail.
          </h2>
        </Reveal>

        {FEATURES.map((f, i) => {
          const media = (
            <Reveal
              kind="media"
              className={`aspect-5/4 overflow-hidden bg-kold-panel max-[760px]:order-first ${BLEED} ${
                f.wideOnNarrow ? "max-[760px]:aspect-4/3" : "max-[760px]:aspect-square"
              }`}
            >
              <Image
                src={f.image}
                alt={f.alt}
                className="h-full w-full object-cover"
                sizes="(max-width: 760px) 100vw, 50vw"
              />
            </Reveal>
          );
          const text = (
            <div>
              <Reveal>
                <div className="font-mono text-[10px] tracking-[0.26em] text-kold-gold">{f.num}</div>
              </Reveal>
              <Reveal delay={70}>
                <h3
                  className="mt-3.5 mb-0 font-normal text-kold-cream-2"
                  style={{ fontSize: "clamp(1.8rem, 3.4vw, 3rem)", lineHeight: 1.04, letterSpacing: "-0.03em" }}
                >
                  {f.title}
                </h3>
              </Reveal>
              <Reveal delay={140}>
                <p
                  className="mt-[18px] mb-0 max-w-[40ch] text-[15px] leading-[1.65] text-kold-muted"
                  style={{ textWrap: "pretty" }}
                >
                  {f.copy}
                </p>
              </Reveal>
            </div>
          );
          return (
            <div
              key={f.num}
              className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] items-center max-[400px]:grid-cols-1"
              style={{
                gap: "clamp(32px, 5vw, 90px)",
                paddingBottom: i < FEATURES.length - 1 ? "clamp(60px, 10vh, 120px)" : undefined,
              }}
            >
              {f.mediaFirst ? media : text}
              {f.mediaFirst ? text : media}
            </div>
          );
        })}
      </div>
    </section>
  );
}
