"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/*
 * Technology masthead — a glass lens on black, shot as a film opening.
 *
 * The scene: one large glass shape sweeping up from the left to a tight
 * shoulder on the right, its thick rim in the brand's cream → orange → amber,
 * warm light pooled inside. Copy top-left and top-right, the headline and one
 * pill action inside the lens.
 *
 * THE OPEN
 *   letterbox bars part · the rim ignites, a hot point running along it from
 *   the left and leaving the lit rim behind · a flare blooms at the shoulder
 *   as it arrives · the light inside warms up · the headline resolves out of
 *   a blur letter by letter · the corners and the action settle.
 * AMBIENT
 *   a slow camera breath (push in, ease out) · the glint travels the rim ·
 *   the inner light drifts · the lens leans with the pointer.
 * SCROLL
 *   the camera pushes into the lens, the rim brightens, the copy falls away.
 *
 * Smoothness: every moving layer is transform/opacity only on a promoted
 * layer; nothing is blurred live (the halo is a wide soft gradient border, not
 * a filter); the letter blur runs once on small glyphs and is then cleared;
 * each transform has exactly one writer (breath, pointer, scroll and entrance
 * each own their own wrapper). Reduced motion gets the settled frame.
 */

const SHAPE = "62% 20% 0 0 / 74% 32% 0 0";
const RIM =
  "linear-gradient(120deg, rgba(255,177,59,0.55) 0%, #ffe6d2 22%, #ffb07a 40%, #e83b00 58%, #fff0e4 74%, #ff9a52 88%, rgba(255,255,255,0.9) 100%)";
const BORDER_ONLY: React.CSSProperties = {
  WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  WebkitMaskComposite: "xor",
  mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
};

const LINE_1 = "Built for today";
const LINE_2A = "Ready for ";
const LINE_2B = "what's next";

function Chars({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) {
  return (
    <>
      {[...text].map((c, i) => (
        <span key={i} data-char className={`th-fade inline-block whitespace-pre will-change-transform ${className ?? ""}`} style={style}>
          {c}
        </span>
      ))}
    </>
  );
}

export default function TechnologyHero() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const html = document.documentElement;
    html.dataset.heroTone = "dark";
    if (prefersReducedMotion()) return () => void delete html.dataset.heroTone;

    const ctx = gsap.context(() => {
      const chars = gsap.utils.toArray<HTMLElement>("[data-char]", root);

      /* ── THE OPEN ── */
      const open = gsap.timeline({ defaults: { ease: "expo.out" } });
      open
        .fromTo("[data-bar=top]", { yPercent: 0 }, { yPercent: -100, duration: 1.6, ease: "expo.inOut" }, 0)
        .fromTo("[data-bar=bottom]", { yPercent: 0 }, { yPercent: 100, duration: 1.6, ease: "expo.inOut" }, 0)
        .fromTo("[data-lens]", { yPercent: 22, rotation: -9, opacity: 0 }, { yPercent: 0, rotation: -4, opacity: 1, duration: 2.6 }, 0.2)
        /* the rim ignites, left to right, a hot point at its head */
        .fromTo("[data-rim]", { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 2, ease: "power2.inOut" }, 0.6)
        .fromTo("[data-spark]", { left: "0%", opacity: 0 }, { left: "100%", opacity: 1, duration: 2, ease: "power2.inOut" }, 0.6)
        .to("[data-spark]", { opacity: 0, duration: 0.4 }, 2.5)
        /* flare at the shoulder as the ignition arrives */
        .fromTo("[data-flare]", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }, 2.1)
        .to("[data-flare]", { opacity: 0, scale: 1.6, duration: 1.6, ease: "power2.out" }, 2.6)
        .fromTo("[data-light]", { opacity: 0 }, { opacity: 1, duration: 2.6, ease: "power2.out" }, 1.4)
        /* the headline resolves out of a blur */
        .fromTo(
          chars,
          { yPercent: 70, opacity: 0, filter: "blur(10px)" },
          { yPercent: 0, opacity: 1, filter: "blur(0px)", duration: 1.3, stagger: 0.025, clearProps: "filter" },
          1.5,
        )
        .fromTo("[data-fade]", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.1 }, 2.1);

      /* ── AMBIENT ── */
      gsap.to("[data-breath]", { scale: 1.035, duration: 14, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 3 });
      gsap.fromTo("[data-glint]", { xPercent: -120 }, { xPercent: 480, duration: 6, ease: "sine.inOut", repeat: -1, repeatDelay: 1.5, delay: 3.2 });
      gsap.to("[data-light]", { xPercent: 5, yPercent: -4, duration: 9, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 3 });

      const lx = gsap.quickTo("[data-lens-wrap]", "x", { duration: 1.8, ease: "power3.out" });
      const ly = gsap.quickTo("[data-lens-wrap]", "y", { duration: 1.8, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        lx((e.clientX / window.innerWidth - 0.5) * 30);
        ly((e.clientY / window.innerHeight - 0.5) * 20);
      };
      root.addEventListener("pointermove", move);

      /* ── SCROLL: the camera pushes into the lens ── */
      gsap
        .timeline({ scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: 1 }, defaults: { ease: "none" } })
        .to("[data-lens-scroll]", { scale: 1.3, yPercent: -10 }, 0)
        .to("[data-copy]", { yPercent: -16, opacity: 0 }, 0);

      return () => root.removeEventListener("pointermove", move);
    }, root);

    return () => {
      ctx.revert();
      delete html.dataset.heroTone;
    };
  }, []);

  return (
    <section ref={ref} className="tech-hero relative isolate min-h-[100svh] overflow-hidden bg-black text-white">
      {/* ── The lens ── each wrapper has one transform writer */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div data-lens-scroll className="absolute inset-0 will-change-transform" style={{ transformOrigin: "60% 70%" }}>
          <div data-breath className="absolute inset-0 will-change-transform" style={{ transformOrigin: "55% 60%" }}>
            <div data-lens-wrap className="absolute inset-0 will-change-transform">
              <div
                data-lens
                className="th-fade absolute left-[-70%] top-[46%] h-[90%] w-[160%] will-change-transform sm:left-[-40%] sm:top-[38%] sm:w-[128%] lg:left-[-30%] lg:top-[26%] lg:h-[110%] lg:w-[110%]"
                style={{ transform: "rotate(-4deg)", transformOrigin: "80% 0%" }}
              >
                {/* body */}
                <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: SHAPE, background: "linear-gradient(170deg, #1a110c 0%, #0d0907 45%, #060505 100%)" }}>
                  <div
                    data-light
                    className="absolute inset-[-10%] will-change-transform"
                    style={{
                      background:
                        "radial-gradient(ellipse 30% 26% at 48% 58%, rgba(232,59,0,0.6), transparent 70%), radial-gradient(ellipse 28% 24% at 32% 54%, rgba(255,177,59,0.45), transparent 70%), radial-gradient(ellipse 26% 30% at 70% 42%, rgba(255,122,26,0.16), transparent 70%)",
                    }}
                  />
                  <div className="absolute inset-0" style={{ borderRadius: SHAPE, boxShadow: "inset 0 26px 50px -26px rgba(255,215,185,0.45), inset -18px 0 40px -24px rgba(255,215,185,0.35)" }} />
                </div>
                {/* rim + its thin inner edge, revealed by the ignition */}
                <div data-rim className="absolute inset-0">
                  <div className="absolute inset-0 p-[6px] sm:p-[9px]" style={{ borderRadius: SHAPE, background: RIM, ...BORDER_ONLY }} />
                  <div className="absolute inset-[9px] p-[1.5px] opacity-70" style={{ borderRadius: SHAPE, background: "rgba(40,14,4,0.9)", ...BORDER_ONLY }} />
                </div>
                {/* the hot point that runs along the top while it ignites */}
                <span
                  data-spark
                  className="absolute top-[3%] h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
                  style={{ background: "radial-gradient(circle, rgba(255,255,255,0.95), rgba(255,180,110,0.5) 28%, transparent 65%)" }}
                />
                {/* flare at the shoulder */}
                <span
                  data-flare
                  className="absolute right-[18%] top-[2%] h-[40vh] w-[40vh] -translate-y-1/2 translate-x-1/2 rounded-full opacity-0"
                  style={{ background: "radial-gradient(circle, rgba(255,240,225,0.75), rgba(255,150,70,0.25) 30%, transparent 65%)" }}
                />
                {/* the glint: a light band sliding (by transform only) inside a rim-shaped mask */}
                <div className="absolute inset-0 overflow-hidden p-[6px] sm:p-[9px]" style={{ borderRadius: SHAPE, ...BORDER_ONLY }}>
                  <span
                    data-glint
                    className="absolute inset-y-0 left-0 w-[22%] will-change-transform"
                    style={{ background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.95) 50%, transparent)" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* film: grain and vignette */}
      <div aria-hidden className="cine-grain pointer-events-none absolute inset-0 z-[5] opacity-[0.06] mix-blend-overlay" />
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[5]" style={{ background: "radial-gradient(ellipse at 50% 55%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />

      {/* ── Copy ── */}
      <div data-copy className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col px-6 pb-16 pt-28 will-change-transform lg:px-12">
        <div className="flex items-start justify-between gap-10">
          <p data-fade className="th-fade max-w-[20rem] text-[15px] leading-[1.6] text-white/75">
            The engineering foundations under every eArrow platform, chosen so the systems you adopt now still fit how
            you&apos;ll work in five years.
          </p>
          <p data-fade className="th-fade hidden text-right text-[15px] text-white/90 md:block">
            8 technology pillars. One architecture.
          </p>
        </div>

        <div className="mt-auto sm:pl-[18%] lg:pl-[24%] lg:pb-[6vh]">
          <p data-fade className="th-fade text-[11.5px] font-medium uppercase tracking-[0.04em] text-white/70">
            Technology &amp; Innovation
          </p>
          <h1
            className="mt-5 text-[2.9rem] font-medium leading-[1.02] tracking-[-0.045em] sm:text-[4.2rem] lg:text-[5.2rem]"
            aria-label={`${LINE_1} ${LINE_2A}${LINE_2B}`}
          >
            <span aria-hidden className="block pb-[0.06em]">
              <Chars text={LINE_1} />
            </span>
            <span aria-hidden className="block pb-[0.1em]">
              <Chars text={LINE_2A} />
              {/* per-letter gradient, each glyph taking its slice of one band */}
              {[...LINE_2B].map((c, i, a) => (
                <span
                  key={i}
                  data-char
                  className="th-fade inline-block whitespace-pre bg-clip-text text-transparent will-change-transform"
                  style={{
                    backgroundImage: "linear-gradient(90deg, #ffe0bf, #ffb13b, #ff6a1a)",
                    backgroundSize: `${a.length * 100}% 100%`,
                    backgroundPosition: `${(i / Math.max(1, a.length - 1)) * 100}% 0`,
                  }}
                >
                  {c}
                </span>
              ))}
            </span>
          </h1>
          <a
            data-fade
            href="#stack"
            className="th-fade group mt-9 inline-flex items-center gap-4 rounded-full bg-black px-7 py-3.5 text-[15px] font-medium text-white ring-1 ring-white/10 transition-[box-shadow,transform] duration-500 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_-12px_rgba(232,59,0,0.7)] hover:ring-white/30"
          >
            Explore the stack
            <svg viewBox="0 0 16 16" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </a>
          <p data-fade className="th-fade mt-8 text-[14px] text-white/75 md:hidden">
            8 technology pillars. One architecture.
          </p>
        </div>
      </div>

      {/* letterbox */}
      <div data-bar="top" aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-20 h-1/2 bg-black motion-reduce:hidden" />
      <div data-bar="bottom" aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1/2 bg-black motion-reduce:hidden" />
    </section>
  );
}
