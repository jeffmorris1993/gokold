import Reveal from "./reveal";

const STATS = [
  { value: "12", label: "Vial positions" },
  { value: "01", label: "Purpose-built insert" },
  { value: "Secure", label: "Closure system" },
  { value: "Cold", label: "Refrigerator-ready storage" },
];

export default function Stats() {
  return (
    <section className="bg-kold-light text-kold-ink" style={{ padding: "clamp(80px, 13vh, 170px) clamp(20px, 5vw, 80px)" }}>
      <div
        className="mx-auto grid max-w-[1280px] grid-cols-[repeat(auto-fit,minmax(200px,1fr))] max-[760px]:grid-cols-2"
        style={{ gap: "clamp(28px, 4vw, 60px)" }}
      >
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 70} className="border-t border-[rgba(22,23,26,0.16)] pt-[22px]">
            <div className="font-light" style={{ fontSize: "clamp(3rem, 5.4vw, 5rem)", lineHeight: 1, letterSpacing: "-0.04em" }}>
              {s.value}
            </div>
            <div className="mt-3.5 font-mono text-[10px] uppercase tracking-[0.24em] text-[#7d766a]">{s.label}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
