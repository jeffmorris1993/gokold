"use client";

import { useActionState } from "react";
import { joinEarlyAccess, type EarlyAccessState } from "../actions";
import Reveal from "./reveal";

const initialState: EarlyAccessState = { status: "idle" };

const labelClass =
  "mb-[10px] block font-mono text-[10px] uppercase tracking-[0.24em] text-[#8a7f6b]";
const inputClass =
  "box-border w-full border-0 border-b bg-transparent py-3 text-[16px] text-kold-ink outline-none focus:border-kold-ink";

export default function EarlyAccess() {
  const [state, formAction, pending] = useActionState(joinEarlyAccess, initialState);
  const submitted = state.status === "success";

  return (
    <section
      id="early-access"
      className="bg-kold-light text-kold-ink"
      style={{ padding: "clamp(90px, 15vh, 200px) clamp(20px, 5vw, 80px)" }}
    >
      <div className="mx-auto max-w-[900px]">
        <Reveal>
          <div className="font-mono text-[11px] tracking-[0.3em] text-[#8a7f6b]">FOUNDING ACCESS</div>
        </Reveal>
        <Reveal delay={70}>
          <h2
            className="mt-[26px] mb-0 pb-0.5 font-light"
            style={{ fontSize: "clamp(3rem, 9vw, 8rem)", lineHeight: 1.06, letterSpacing: "-0.045em" }}
          >
            Be early.
          </h2>
        </Reveal>
        <Reveal delay={140}>
          <p className="mt-[26px] mb-0 max-w-[42ch] text-[15px] leading-[1.65] text-[#4a4842]" style={{ textWrap: "pretty" }}>
            Join the KOLD early-access list for launch updates and founding-member pricing.
          </p>
        </Reveal>

        <Reveal delay={210}>
          <form
            action={formAction}
            className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] items-end gap-[18px]"
            style={{ marginTop: "clamp(40px, 6vh, 70px)" }}
          >
            <label className="block">
              <span className={labelClass}>Full Name</span>
              <input
                type="text"
                name="fullName"
                autoComplete="name"
                disabled={pending || submitted}
                aria-invalid={!!state.errors?.fullName}
                className={inputClass}
                style={{ borderBottomColor: state.errors?.fullName ? "#a03c2e" : "rgba(22,23,26,0.28)" }}
              />
              {state.errors?.fullName && (
                <span className="mt-2 block text-[12px] text-[#a03c2e]">{state.errors.fullName}</span>
              )}
            </label>
            <label className="block">
              <span className={labelClass}>Email</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                disabled={pending || submitted}
                aria-invalid={!!state.errors?.email}
                className={inputClass}
                style={{ borderBottomColor: state.errors?.email ? "#a03c2e" : "rgba(22,23,26,0.28)" }}
              />
              {state.errors?.email && (
                <span className="mt-2 block text-[12px] text-[#a03c2e]">{state.errors.email}</span>
              )}
            </label>
            <button
              type="submit"
              disabled={pending || submitted}
              className="min-h-12 cursor-pointer border-0 bg-kold-ink px-[26px] py-[19px] font-mono text-[11px] uppercase tracking-[0.22em] text-kold-light transition-colors hover:bg-kold-gold hover:text-kold-ink disabled:cursor-default disabled:hover:bg-kold-ink disabled:hover:text-kold-light max-[760px]:w-full"
            >
              {submitted ? "You’re on the list" : pending ? "Joining…" : "Get Early Access"}
            </button>
          </form>
        </Reveal>
        <p role="status" className="mt-4 mb-0 min-h-[1.2em] text-[13px] text-[#a03c2e]">
          {state.status === "error" ? state.message : ""}
        </p>
      </div>
    </section>
  );
}
