"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { withBasePath } from "@/lib/basePath";

/*
 * Solutions masthead — a product hero.
 *
 * Centred type on an airy ground with a soft brand glow; beneath it the Arrow
 * HR mobile app in a phone rising out of the bottom edge, flanked by floating
 * cards lifted from the app's own features (leave balances, check-in).
 *
 * Motion (GSAP; reduced motion gets the settled frame):
 *   entrance — the headline line by line, copy, actions; the
 *              phone lifts and untilts into place; the cards glide in
 *   ambient  — the cards float on out-of-step sines
 *   pointer  — the phone tilts toward the cursor
 *   scroll   — the app scrolls inside the phone while the phone rises and the
 *              cards drift outward
 *
 * Performance: everything that moves every frame moves by transform or
 * opacity. The cards are opaque-ish white rather than backdrop-blurred —
 * re-blurring the scene under three moving cards every frame is what makes a
 * hero like this stutter.
 */

const ArrowRight = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

/** A leave-balance ring, as the app draws it. */
function Ring({ value, of, colour }: { value: number; of: number; colour: string }) {
  const r = 15;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 40 40" className="h-11 w-11 -rotate-90" aria-hidden>
      <circle cx="20" cy="20" r={r} fill="none" stroke="var(--color-border-strong)" strokeWidth="4" />
      <circle cx="20" cy="20" r={r} fill="none" stroke={colour} strokeWidth="4" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / of)} />
    </svg>
  );
}

export default function SolutionsHero({
  capabilities,
  domains,
}: {
  capabilities: number;
  domains: number;
}) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const q = gsap.utils.selector(root);
    const phone = q("[data-phone]")[0] as HTMLElement;
    const screen = q("[data-screen]")[0] as HTMLElement;

    const ctx = gsap.context(() => {
      /* ── Entrance ── */
      const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
      intro
        .fromTo("[data-word]", { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.06 }, 0.2)
        .fromTo("[data-copy]", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1, stagger: 0.1 }, 0.75)
        .fromTo(
          phone,
          { yPercent: 38, rotationX: 24, opacity: 0, transformPerspective: 1400 },
          { yPercent: 0, rotationX: 0, opacity: 1, duration: 1.8, ease: "power4.out" },
          0.55
        )
        .fromTo("[data-card=left]", { x: -70, opacity: 0 }, { x: 0, opacity: 1, duration: 1.4, stagger: 0.12, ease: "power3.out" }, 1.1)
        .fromTo("[data-card=right]", { x: 70, opacity: 0 }, { x: 0, opacity: 1, duration: 1.4, ease: "power3.out" }, 1.25);

      /* ── Ambient: the cards float, each on its own clock ── */
      (q("[data-float]") as HTMLElement[]).forEach((el, i) => {
        gsap.to(el, { y: i % 2 ? 10 : -10, duration: 3.4 + i * 0.7, ease: "sine.inOut", yoyo: true, repeat: -1, delay: i * 0.4 });
      });

      /* ── Pointer: the phone leans toward the cursor ── */
      const tiltY = gsap.quickTo(phone, "rotationY", { duration: 1, ease: "power3.out" });
      const tiltX = gsap.quickTo(phone, "rotationX", { duration: 1, ease: "power3.out" });
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse" || intro.isActive()) return;
        tiltY((e.clientX / window.innerWidth - 0.5) * 12);
        tiltX(-(e.clientY / window.innerHeight - 0.5) * 6);
      };
      const onLeave = () => {
        tiltY(0);
        tiltX(0);
      };
      root.addEventListener("pointermove", onMove);
      root.addEventListener("pointerleave", onLeave);

      /* ── Scroll: the app scrolls inside the phone as the phone rises ──
             built after the entrance, so it records the settled frame */
      intro.eventCallback("onComplete", () => {
        ctx.add(() => {
          gsap
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: 0.4 },
            })
            .to(screen, { yPercent: -38 }, 0)
            .to("[data-phone-lift]", { y: -120 }, 0)
            .to("[data-card-wrap=left]", { x: -90, y: -40 }, 0)
            .to("[data-card-wrap=right]", { x: 90, y: -60 }, 0)
            .to("[data-type]", { y: -60, opacity: 0.25 }, 0);
        });
      });

      return () => {
        root.removeEventListener("pointermove", onMove);
        root.removeEventListener("pointerleave", onLeave);
      };
    }, root);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="sol-hero relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-canvas pt-24 lg:pt-28">
      {/* ── The glow: static gradients, painted once ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-[58%] h-[110vh] w-[150vw] -translate-x-1/2 -translate-y-1/2"
          style={{ background: "radial-gradient(ellipse at center, rgba(255,152,32,0.30) 0%, rgba(255,122,26,0.16) 30%, transparent 62%)" }}
        />
        <div
          className="absolute -left-[10%] top-[10%] h-[60vh] w-[45vw]"
          style={{ background: "radial-gradient(ellipse at center, rgba(255,177,59,0.18), transparent 65%)" }}
        />
        <div
          className="absolute -right-[10%] top-[30%] h-[60vh] w-[45vw]"
          style={{ background: "radial-gradient(ellipse at center, rgba(232,59,0,0.12), transparent 65%)" }}
        />
        {/* a floor of light under the phone */}
        <div
          className="absolute bottom-0 left-1/2 h-[38vh] w-[70vw] -translate-x-1/2"
          style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(255,140,40,0.35), transparent 70%)" }}
        />
      </div>

      {/* ── Type ── */}
      <div data-type className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center">

        <h1 className="font-spartan text-[2.05rem] font-medium leading-[1.06] tracking-[-0.03em] text-ink-muted sm:text-[3.4rem] lg:text-[4.1rem]">
          <span className="block overflow-hidden pb-[0.08em]">
            <span data-word className="sol-fade inline-block">
              <span className="bg-gradient-to-r from-[#d13400] via-[#e83b00] to-[#ff9820] bg-clip-text font-semibold text-transparent max-sm:block">
                Business Solutions
              </span>{" "}
              by eArrow
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.08em]">
            <span data-word className="sol-fade inline-block">
              Run, Optimise &amp; <span className="font-bold text-ink">Grow</span>
            </span>
          </span>
        </h1>

        <p data-copy className="sol-fade mt-6 max-w-xl text-[15px] leading-relaxed text-ink-muted sm:text-base">
          {capabilities} capabilities across {domains} domains — from HR and education systems to CRM,
          intelligent automation, managed IT and digital growth — delivered by one technology partner.
        </p>

        {/* phones: two equal, full-width buttons, stacked */}
        <div data-copy className="sol-fade mt-8 flex flex-wrap items-center justify-center gap-3 max-sm:w-full max-sm:max-w-[320px] max-sm:flex-col max-sm:items-stretch">
          <a
            href="/contact"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#ff7a1a] to-[#e83b00] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_-8px_rgba(232,59,0,0.75),inset_0_1px_0_rgba(255,255,255,0.45)] transition-transform duration-300 hover:-translate-y-0.5"
          >
            Request a consultation
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </a>
          <a
            href="#capabilities"
            className="group inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold text-ink shadow-[0_6px_18px_-10px_rgba(120,40,0,0.35)] transition-transform duration-300 hover:-translate-y-0.5"
          >
            See what we cover
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>

      {/* ── The phone and its cards ── */}
      <div className="relative z-10 mx-auto mt-10 min-h-[260px] w-full max-w-6xl flex-1 px-6 lg:mt-12">
        {/* left cards */}
        <div data-card-wrap="left" className="absolute left-6 top-[8%] hidden gap-3 md:flex lg:left-10">
          {[
            { label: "Annual leave", value: 14, of: 14, colour: "#3b6fe0" },
            { label: "Medical leave", value: 7, of: 7, colour: "#e8a23a" },
          ].map((c) => (
            <div
              key={c.label}
              data-card="left"
              data-float
              className="sol-fade w-[176px] rounded-2xl border border-border bg-surface/90 p-3.5 shadow-[0_18px_40px_-18px_rgba(120,40,0,0.35)]"
            >
              <p className="text-[11px] font-medium text-ink-muted">{c.label}</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="font-spartan text-[1.6rem] font-semibold leading-none text-ink">
                  {c.value}
                  <span className="ml-0.5 text-[0.55em] font-medium text-ink-soft">/{c.of}</span>
                </p>
                <Ring value={c.value} of={c.of} colour={c.colour} />
              </div>
              <p className="mt-2 text-[10px] text-ink-soft">
                Days remaining · <span className="font-semibold text-[#16a34a]">On track</span>
              </p>
            </div>
          ))}
        </div>

        {/* right card */}
        <div data-card-wrap="right" className="absolute right-6 top-[6%] hidden md:block lg:right-10">
          <div
            data-card="right"
            data-float
            className="sol-fade flex w-[270px] items-center gap-3 rounded-2xl border border-border bg-surface/90 p-3 shadow-[0_18px_40px_-18px_rgba(120,40,0,0.35)]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#16a34a]/15 text-[#16a34a]">
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="10" cy="10" r="7.5" />
                <path d="M6.6 10.2l2.3 2.3 4.6-4.8" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">Check in</p>
              <p className="text-[11px] leading-snug text-ink-muted">Mark today&apos;s attendance from your phone</p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-canvas">
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M8 4h7v12H8M3 10h9M9 7l3 3-3 3" />
              </svg>
            </span>
          </div>
        </div>

        {/* the phone, rising out of the bottom edge */}
        <div data-phone-lift className="absolute inset-x-0 top-0 flex justify-center">
          <div
            data-phone
            className="sol-fade relative w-[min(300px,70vw)] rounded-[48px] bg-[#16161a] p-[11px] shadow-[0_50px_90px_-30px_rgba(120,35,0,0.55),inset_0_0_0_1.5px_rgba(255,255,255,0.12)]"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* side buttons */}
            <span aria-hidden className="absolute -left-[3px] top-[110px] h-12 w-[3px] rounded-l bg-[#2a2a30]" />
            <span aria-hidden className="absolute -left-[3px] top-[170px] h-12 w-[3px] rounded-l bg-[#2a2a30]" />
            <span aria-hidden className="absolute -right-[3px] top-[140px] h-16 w-[3px] rounded-r bg-[#2a2a30]" />

            <div className="relative aspect-[9/19.5] overflow-hidden rounded-[38px] bg-[#f3f6fd]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                data-screen
                src={withBasePath("/products/mobile/hr-app.webp")}
                alt="Arrow HR mobile app home screen showing today's attendance, check-in and remaining leave"
                className="block w-full select-none will-change-transform"
                draggable={false}
              />
              {/* dynamic island */}
              <span aria-hidden className="absolute left-1/2 top-[10px] h-[26px] w-[92px] -translate-x-1/2 rounded-full bg-black" />
              {/* glass */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ background: "linear-gradient(125deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 30%)" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
