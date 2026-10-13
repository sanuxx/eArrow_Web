"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { withBasePath } from "@/lib/basePath";

/*
 * Customer Success masthead.
 *
 * A bright headline that the page warms beneath, into a deep ember ground. On
 * it, a set of nested rounded tracks with the organisations we work with
 * orbiting them as bubbles, a few small icon pills for what the work delivers,
 * and at the centre the one action — with a cursor that keeps reaching for it.
 * Real client logos rather than faces: this page is about real customers, and
 * stock portraits here would imply people who are not.
 *
 * Motion (GSAP; reduced motion gets the settled frame):
 *   entrance — headline rises, tracks expand from the centre, bubbles and pills
 *              pop in, the logo row settles
 *   ambient  — a light runs round each track, bubbles float, the cursor glides
 *              to the centre button and clicks it, on a loop
 *
 * Performance: transforms, opacity and SVG stroke offsets only; nothing is
 * backdrop-blurred.
 */

const BUBBLES = [
  { logo: "infomate", x: 31, y: 10, size: 92 },
  { logo: "central-bank", x: 52, y: 23, size: 68 },
  { logo: "ibsl", x: 71, y: 6, size: 64 },
  { logo: "slithm", x: 23, y: 82, size: 90 },
  { logo: "aquinas", x: 41, y: 74, size: 58 },
  { logo: "dialog", x: 72, y: 84, size: 92 },
];

const PILLS = [
  { key: "secure", x: 14, y: 33, label: "Secure by design" },
  { key: "click", x: 86, y: 33, label: "Go live faster" },
  { key: "thumb", x: 58, y: 83, label: "Adopted by teams" },
];

const CLIENT_ROW = ["infomate", "central-bank", "ibsl", "dialog", "dimo", "sri-lanka-cricket", "slithm"];

function PillIcon({ k }: { k: string }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  if (k === "secure")
    return (
      <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden>
        <rect x="4.5" y="9" width="11" height="8" rx="2" fill="currentColor" />
        <path d="M7 9V6.5a3 3 0 0 1 6 0V9" {...p} />
      </svg>
    );
  if (k === "click")
    return (
      <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden>
        <path d="M8 8l8 3-3.5 1.5L11 16z" fill="currentColor" />
        <path d="M6.5 2.5v2M2.5 6.5h2M3.8 3.8l1.4 1.4M9.2 3.8L7.8 5.2" {...p} />
      </svg>
    );
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden>
      <path d="M3 9h3v8H3zM8 16.5V9l3.2-5.5a1.6 1.6 0 0 1 2.8 1.4L13 8h3.3a1.7 1.7 0 0 1 1.6 2.1l-1.4 5.3a1.7 1.7 0 0 1-1.6 1.1z" fill="currentColor" />
    </svg>
  );
}

/* Nested track rectangles, in the SVG's 1000×520 space. */
const TRACKS = [
  { x: 40, y: 20, w: 920, h: 480, r: 240 },
  { x: 150, y: 85, w: 700, h: 350, r: 175 },
  { x: 260, y: 150, w: 480, h: 220, r: 110 },
];

export default function CustomerSuccessHero() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const q = gsap.utils.selector(root);

    const ctx = gsap.context(() => {
      /* ── Entrance ── */
      const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
      intro
        .fromTo("[data-line]", { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.1 }, 0.1)
        .fromTo("[data-lead]", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1 }, 0.5)
        .fromTo("[data-track]", { scale: 0.4, opacity: 0, transformOrigin: "50% 50%" }, { scale: 1, opacity: 1, duration: 1.6, stagger: -0.12, ease: "power4.out" }, 0.45)
        .fromTo("[data-cta]", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: "back.out(2)" }, 0.95)
        .fromTo("[data-bubble]", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, stagger: 0.08, ease: "back.out(2.2)" }, 1.05)
        .fromTo("[data-pill]", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, stagger: 0.1, ease: "back.out(2.4)" }, 1.3)
        .fromTo("[data-proof]", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, stagger: 0.05 }, 1.5);

      /* ── A light running round each track ── */
      (Array.from(root.querySelectorAll<SVGRectElement>("[data-run]"))).forEach((el, i) => {
        const len = el.getTotalLength();
        gsap.set(el, { strokeDasharray: `${len * 0.12} ${len * 0.88}` });
        gsap.fromTo(el, { strokeDashoffset: len * (i * 0.33) }, { strokeDashoffset: -len + len * (i * 0.33), duration: 9 + i * 3, ease: "none", repeat: -1 });
      });

      /* ── Bubbles and pills float, each on its own clock ── */
      (q("[data-float]") as HTMLElement[]).forEach((el, i) => {
        gsap.to(el, { y: i % 2 ? 8 : -8, x: i % 3 ? 4 : -4, duration: 3 + (i % 4) * 0.6, ease: "sine.inOut", yoyo: true, repeat: -1, delay: i * 0.3 });
      });

      /* ── The cursor reaches for the button, clicks, drifts away, again ── */
      const cursor = q("[data-cursor]")[0];
      const cta = q("[data-cta]")[0];
      gsap
        .timeline({ repeat: -1, repeatDelay: 1.2, delay: 2.4 })
        .fromTo(cursor, { x: 120, y: 90, opacity: 0, rotation: 0 }, { opacity: 1, duration: 0.4 })
        .to(cursor, { x: 10, y: 8, duration: 1.3, ease: "power3.inOut" })
        .to(cursor, { scale: 0.82, duration: 0.12, yoyo: true, repeat: 1 })
        .fromTo(cta, { boxShadow: "0 0 0 0 rgba(255,140,40,0.7)" }, { boxShadow: "0 0 0 18px rgba(255,140,40,0)", duration: 0.8, ease: "power2.out" }, "<")
        .to(cta, { scale: 0.96, duration: 0.12, yoyo: true, repeat: 1 }, "<")
        .to(cursor, { x: 150, y: 60, opacity: 0, duration: 1.1, ease: "power2.in" }, "+=0.6");
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="cs-hero relative isolate overflow-hidden pb-14 pt-28 lg:pt-32"
      style={{
        background:
          "linear-gradient(180deg, var(--cs-a) 0%, var(--cs-b) 16%, var(--cs-c) 34%, #ff9a52 52%, #d9480b 68%, #6e1d03 84%, #1d0802 100%)",
      }}
    >
      {/* ── Type ── */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <h1 className="font-heading text-[2.3rem] font-extrabold leading-[1.04] tracking-[-0.045em] text-ink sm:text-[3.2rem] lg:text-[3.9rem]">
          <span className="block overflow-hidden pb-[0.06em]">
            <span data-line className="cs-fade block">Fragmented processes,</span>
          </span>
          <span className="block overflow-hidden pb-[0.06em]">
            <span data-line className="cs-fade block">rewired into one system.</span>
          </span>
        </h1>
        <p data-lead className="cs-fade mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-ink-muted">
          Every engagement starts as scattered manual work and ends as connected digital operations.
          These are those stories, told through what actually changed.
        </p>
      </div>

      {/* ── The orbit ── */}
      <div className="relative z-10 mx-auto mt-10 aspect-[1000/520] w-[min(900px,94vw)] lg:mt-12">
        <svg viewBox="0 0 1000 520" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          <defs>
            <linearGradient id="cs-run" x1="0" x2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="1" stopColor="#fff" stopOpacity="0.95" />
            </linearGradient>
          </defs>
          {TRACKS.map((t, i) => (
            <g key={i} data-track className="cs-fade">
              <rect x={t.x} y={t.y} width={t.w} height={t.h} rx={t.r} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
              <rect data-run x={t.x} y={t.y} width={t.w} height={t.h} rx={t.r} fill="none" stroke="#fff6ec" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
            </g>
          ))}
        </svg>

        {/* centre action */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link
            prefetch={false}
            href="/contact"
            data-cta
            className="cs-fade relative inline-flex items-center gap-2.5 whitespace-nowrap rounded-full bg-[#140802] px-6 py-3.5 text-sm font-semibold text-white ring-1 ring-white/20 sm:px-8 sm:py-4 sm:text-base"
            style={{ boxShadow: "0 0 34px -4px rgba(255,140,40,0.75)" }}
          >
            <PillIcon k="click" />
            Become the next story
          </Link>
          {/* the cursor */}
          <svg data-cursor viewBox="0 0 32 32" className="pointer-events-none absolute left-[62%] top-[70%] h-9 w-9 opacity-0 drop-shadow-[0_6px_10px_rgba(0,0,0,0.35)]" aria-hidden>
            <path d="M5 3l22 9-9.5 3.2L13.8 25z" fill="#140802" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </div>

        {/* client bubbles */}
        {BUBBLES.map((b) => (
          <div
            key={b.logo}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${b.x}%`, top: `${b.y}%`, width: `clamp(${b.size * 0.55}px, ${b.size / 9}vw, ${b.size}px)` }}
          >
            <div data-float>
              <div
                data-bubble
                className="cs-fade flex aspect-square items-center justify-center rounded-full bg-white p-[14%] shadow-[0_14px_36px_-12px_rgba(110,29,3,0.6)] ring-4 ring-white/40"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={withBasePath(`/clients/${b.logo}.webp`)} alt="" className="h-full w-full object-contain" draggable={false} />
              </div>
            </div>
          </div>
        ))}

        {/* icon pills */}
        {PILLS.map((p) => (
          <div key={p.key} className="absolute hidden -translate-x-1/2 -translate-y-1/2 sm:block" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
            <div data-float>
              <div
                data-pill
                title={p.label}
                className="cs-fade flex h-11 w-16 items-center justify-center rounded-full bg-[#140802] text-white ring-1 ring-white/25 sm:h-12 sm:w-[72px]"
                style={{ boxShadow: "0 0 26px -4px rgba(255,140,40,0.7)" }}
              >
                <PillIcon k={p.key} />
                <span className="sr-only">{p.label}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Proof ── */}
      <div className="relative z-10 mx-auto mt-12 max-w-6xl px-6 text-center lg:mt-16">
        <p data-proof className="cs-fade text-[15px] font-medium text-white/85">
          Trusted by organisations across Sri Lanka
        </p>
        {/* Logos sit on their own light chips: several ship with solid
            backgrounds, so tinting them white would turn those into blocks. */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {CLIENT_ROW.map((l) => (
            <span
              key={l}
              data-proof
              className="cs-fade flex h-14 w-[118px] items-center justify-center rounded-2xl bg-white/92 px-4 py-2.5 shadow-[0_10px_24px_-14px_rgba(0,0,0,0.6)] sm:w-[132px]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={withBasePath(`/clients/${l}.webp`)} alt="" className="h-full w-full object-contain" draggable={false} />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
