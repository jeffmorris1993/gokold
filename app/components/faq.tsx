"use client";

import { useState } from "react";

const FAQS: [string, string][] = [
  [
    "What is KOLD?",
    "KOLD is a premium storage container designed to organize peptide vials and other refrigerated wellness items inside your refrigerator.",
  ],
  ["What does KOLD hold?", "Vials and small refrigerated items from your routine, held in a purpose-built insert."],
  ["How many vials fit inside?", "The insert holds 12 vial positions."],
  [
    "Is KOLD refrigerated?",
    "KOLD is designed to be placed inside a refrigerator. It is built around a refrigerated environment rather than creating one.",
  ],
  [
    "Does KOLD actively cool its contents?",
    "No. KOLD does not cool. It is a storage container intended to be kept in an appropriate refrigerated environment.",
  ],
  ["When will KOLD launch?", "Launch timing will be shared with the early-access list first."],
  [
    "How does early access work?",
    "Add your name and email. You will receive launch updates and founding-member pricing before general availability.",
  ],
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-kold" style={{ padding: "clamp(90px, 15vh, 200px) clamp(20px, 5vw, 80px)" }}>
      <div className="mx-auto max-w-[1000px]">
        <h2
          className="mt-0 font-normal text-kold-cream-2"
          style={{
            marginBottom: "clamp(40px, 7vh, 80px)",
            fontSize: "clamp(1.9rem, 4.4vw, 3.6rem)",
            lineHeight: 1,
            letterSpacing: "-0.035em",
          }}
        >
          FAQ
        </h2>
        {FAQS.map(([q, a], i) => {
          const isOpen = open === i;
          return (
            <div key={q} className="border-t border-[rgba(231,227,219,0.13)]">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-a-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full cursor-pointer items-baseline justify-between gap-6 border-0 bg-transparent p-0 py-[26px] text-left"
              >
                <span
                  className="font-normal text-kold-cream-2"
                  style={{ fontSize: "clamp(16px, 1.6vw, 21px)", letterSpacing: "-0.01em" }}
                >
                  {q}
                </span>
                <span aria-hidden className="flex-none font-mono text-[14px] text-kold-gold">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              <div
                id={`faq-a-${i}`}
                className="overflow-hidden"
                style={{
                  maxHeight: isOpen ? "220px" : "0px",
                  opacity: isOpen ? 1 : 0,
                  transition: "max-height .45s cubic-bezier(.22,.61,.36,1), opacity .35s ease",
                }}
              >
                <p className="mt-0 mb-7 max-w-[60ch] text-[15px] leading-[1.7] text-kold-muted" style={{ textWrap: "pretty" }}>
                  {a}
                </p>
              </div>
            </div>
          );
        })}
        <div className="border-t border-[rgba(231,227,219,0.13)]" />
      </div>
    </section>
  );
}
