"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

/*
 * Industries landing — a dark studio-style hero (after the agreed reference),
 * in the brand's orange instead of the reference's blue.
 *
 *   · a left-aligned headline with one word framed in a design-tool selection
 *     box (corner handles and a small orange cursor badge)
 *   · lead copy, an outline pill and a solid orange pill
 *   · a diagonal band of orange light sweeping across the dark ground
 *   · a footer strip of the sectors we cover
 *
 * Motion (GSAP): the light band drifts and breathes; the headline rises line
 * by line; the selection box draws itself round the word and the cursor
 * badge pops in; Reduced motion: settled frame.
 */

const TAGS = ["Corporate", "Education", "Healthcare", "Finance", "Government"];

export default function IndustriesLanding() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const html = document.documentElement;
    html.dataset.heroTone = "dark";
    if (prefersReducedMotion()) return () => void delete html.dataset.heroTone;

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .fromTo("[data-l-badge]", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.9 }, 0.1)
        .fromTo("[data-l-line]", { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.1 }, 0.2)
        /* the selection box draws, then its handles and the cursor badge */
        .fromTo("[data-l-box]", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "power3.inOut" }, 0.9)
        .fromTo("[data-l-handle]", { scale: 0 }, { scale: 1, duration: 0.4, stagger: 0.05, ease: "back.out(3)" }, 1.6)
        .fromTo("[data-l-cursor]", { scale: 0, rotation: -30 }, { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(2.6)" }, 1.75)
        .fromTo("[data-l-copy]", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1, stagger: 0.1 }, 0.7);

      /* the light band drifts and breathes */
      const loops = [
        gsap.to("[data-l-band]", { xPercent: 6, yPercent: -4, rotation: 2, duration: 9, ease: "sine.inOut", yoyo: true, repeat: -1 }),
        gsap.to("[data-l-band2]", { xPercent: -5, yPercent: 5, duration: 11, ease: "sine.inOut", yoyo: true, repeat: -1 }),
        /* the cursor nudges at the word now and then */
        gsap.to("[data-l-cursor]", { x: 4, y: -3, duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2.5 }),
      ];
      /* nothing loops while the hero is off screen */
      ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => loops.forEach((t) => (self.isActive ? t.resume() : t.pause())),
      });
    }, root);

    return () => {
      ctx.revert();
      delete html.dataset.heroTone;
    };
  }, []);

  return (
    <section ref={ref} className="ind-landing relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[#060507] text-white">
      {/* ── light: a diagonal band of brand orange across the dark ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          data-l-band
          className="absolute -bottom-[30%] -right-[20%] h-[110%] w-[120%] will-change-transform"
          style={{
            background:
              "radial-gradient(ellipse 55% 38% at 62% 72%, rgba(255,106,26,0.85) 0%, rgba(232,59,0,0.55) 35%, rgba(150,30,0,0.25) 60%, transparent 78%)",
            transform: "rotate(-18deg)",
          }}
        />
        <div
          data-l-band2
          className="absolute -bottom-[20%] left-[10%] h-[70%] w-[70%] will-change-transform"
          style={{ background: "radial-gradient(ellipse 50% 40% at 50% 60%, rgba(255,177,59,0.28), transparent 70%)" }}
        />
        {/* sheen lines in the band, like light through glass */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "repeating-linear-gradient(115deg, transparent 0 140px, rgba(255,200,160,0.05) 140px 142px, transparent 142px 260px)",
            maskImage: "radial-gradient(ellipse 70% 60% at 70% 75%, #000, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 70% 75%, #000, transparent 70%)",
          }}
        />
        <div className="cine-grain absolute inset-0 opacity-[0.04]" />
        {/* the light sinks into the dark at the bottom, so the tunnel below picks it up seamlessly */}
        <div className="absolute inset-x-0 bottom-0 h-[28%] bg-gradient-to-b from-transparent to-[#060507]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 pb-8 pt-32 lg:px-12 lg:pt-36">
        {/* badge */}
        <p data-l-badge className="lnd-fade inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80">
          <svg viewBox="0 0 16 16" className="h-3 w-3 text-[#ff9a52]" fill="currentColor" aria-hidden>
            <path d="M8 1l1.6 4.4L14 7l-4.4 1.6L8 13l-1.6-4.4L2 7l4.4-1.6z" />
          </svg>
          Industries we serve
        </p>

        {/* headline with the framed word */}
        <h1 className="mt-6 max-w-5xl text-[2.7rem] font-semibold leading-[1.05] tracking-[-0.04em] sm:text-[4rem] lg:text-[5.2rem]">
          {/* extra room above the first line so the cursor badge is not clipped by the reveal mask */}
          <span className="-mt-[0.45em] block overflow-hidden pb-[0.08em] pt-[0.45em]">
            <span data-l-line className="block">
              Built for every{" "}
              <span className="relative inline-block px-[0.12em]">
                <span data-l-box aria-hidden className="absolute inset-0 rounded-[2px] border border-white/45 bg-white/[0.05]">
                  {[
                    "-left-[4px] -top-[4px]",
                    "-right-[4px] -top-[4px]",
                    "-left-[4px] -bottom-[4px]",
                    "-right-[4px] -bottom-[4px]",
                  ].map((pos) => (
                    <span key={pos} data-l-handle className={`absolute h-[7px] w-[7px] border border-white/80 bg-[#060507] ${pos}`} />
                  ))}
                </span>
                <span className="relative">industry</span>
                {/* the cursor badge */}
                <span
                  data-l-cursor
                  aria-hidden
                  className="absolute -right-[0.36em] -top-[0.4em] hidden h-[0.5em] w-[0.5em] min-h-[22px] min-w-[22px] items-center sm:flex justify-center rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#e83b00] text-white shadow-[0_6px_18px_-4px_rgba(232,59,0,0.8)]"
                >
                  <svg viewBox="0 0 16 16" className="h-[55%] w-[55%]" fill="currentColor">
                    <path d="M3 2l10 5-4.2 1.3L7.4 13z" />
                  </svg>
                </span>
              </span>
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.1em]">
            <span data-l-line className="block">
              and the people <span className="text-white/55">who run it</span>
            </span>
          </span>
        </h1>

        <p data-l-copy className="lnd-fade mt-7 max-w-lg text-[16px] leading-relaxed text-white/70 sm:text-[17px]">
          The same connected ecosystem, configured for the way each sector actually works — from campuses and hospitals to
          finance houses and government offices.
        </p>

        <div data-l-copy className="lnd-fade mt-9 flex flex-wrap items-center gap-3">
          <a
            href="#ind-0"
            className="inline-flex items-center rounded-full border border-white/40 px-6 py-3 text-[15px] font-medium text-white transition-colors hover:border-white hover:bg-white/5"
          >
            Explore the sectors
          </a>
          <a
            href="/contact"
            className="inline-flex items-center rounded-full bg-gradient-to-r from-[#e83b00] via-[#ff5417] to-[#ff9820] px-6 py-3 text-[15px] font-semibold text-white shadow-[0_12px_30px_-10px_rgba(232,59,0,0.8)] transition-transform duration-300 hover:-translate-y-0.5"
          >
            Talk to an expert
          </a>
        </div>

        {/* footer strip */}
        <div data-l-copy className="lnd-fade mt-auto flex flex-col gap-4 pt-16 text-[13px] text-white/75 md:flex-row md:items-center md:justify-between">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {TAGS.map((t, i) => (
              <span key={t} className="flex items-center gap-3">
                {i > 0 && <span className="h-1 w-1 rounded-full bg-white/40" />}
                {t}
              </span>
            ))}
          </p>
        </div>
      </div>

    </section>
  );
}
