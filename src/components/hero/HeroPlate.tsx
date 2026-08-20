"use client";

import { PrimaryCta, StatusChip } from "../ui";
import ProductPanel from "./ProductPanel";

/**
 * Everything the hero stage shows at rest — the settled 0% composition.
 *
 * This file is markup only: no timelines, no state, no `motion.*`. Both the
 * intro and the scrub timeline target it through stable `data-l` ("layer")
 * attributes, which keeps art direction (hero-timeline.ts) separate from
 * composition (here).
 *
 * The state authored here IS the settled frame, and that is a structural
 * contract rather than a convention: the intro is built from `.from()` tweens
 * only, so it animates *into* this state, and the scrub from `.to()` tweens
 * only, so it animates *away from* it. `intro.progress(1)` and
 * `scrub.progress(0)` are therefore the same frame by construction — no
 * coordination needed between the two clocks, and under reduced motion (where
 * neither runs) this is what paints, with no second authoring of a fallback.
 *
 * The background is a field of soft overlapping washes plus a lower-right
 * swoosh — ambient rather than focal.
 */

/*
 * Four overlapping soft washes. `slab-a` / `slab-b` keep their handles because
 * hero-timeline.ts parallaxes and fades them by name in both the intro and the
 * scrub; the two unnamed washes are static.
 */
const SLABS = [
  { key: "a", className: "right-[-10%] top-[-6%] h-[520px] w-[1120px]", rotate: -14, opacity: 0.085 },
  { key: "b", className: "bottom-[-16%] left-[-12%] h-[380px] w-[900px]", rotate: 8, opacity: 0.05 },
  { key: "c", className: "left-[22%] top-[18%] h-[440px] w-[760px]", rotate: 22, opacity: 0.06 },
  { key: "d", className: "bottom-[4%] right-[16%] h-[300px] w-[680px]", rotate: -36, opacity: 0.045 },
];

export default function HeroPlate({ ref }: { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className="hero-plate grain z-0 overflow-hidden bg-canvas-alt">
      {/* ── Ambient: one drifting orb, not two. Three bloom systems was one
             too many; this one is atmosphere and nothing else. ── */}
      <div
        aria-hidden
        data-l="orb"
        className="pointer-events-none absolute right-[2%] top-[6%] h-[560px] w-[560px] rounded-full"
        style={{
          opacity: 0.15,
          filter: "blur(160px)",
          background:
            "radial-gradient(circle at 35% 35%, var(--color-amber), var(--color-orange) 70%, transparent 72%)",
          // Transform only, so the 160px blur is rasterised once and the drift
          // runs on the compositor — the same discipline the old FloatingOrbs
          // used. Animating the blur or the size instead would re-raster a
          // 620px gaussian every frame.
          animation: "orb-drift 30s ease-in-out infinite",
        }}
      />

      {/* ── The slab field ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {/*
          Two nested elements per slab, and the split matters. GSAP animates the
          outer one (x / y / scale / opacity) while the base rotation lives on
          the inner one as the standalone `rotate` property. Put both on one node
          and CSS's transform order (translate, rotate, scale, then `transform`)
          means GSAP's translate resolves inside the rotated frame — at slab B's
          8deg, a 132px parallax drift would land ~18px off course. Keeping the
          rotation on a child also means it survives reduced motion, where GSAP
          never runs at all.
        */}
        {SLABS.map((s) => (
          <div
            key={s.key}
            data-l={`slab-${s.key}`}
            className={`absolute ${s.className}`}
            style={{ opacity: s.opacity }}
          >
            <div
              className="h-full w-full rounded-[200px]"
              style={{
                rotate: `${s.rotate}deg`,
                background: "linear-gradient(135deg, var(--color-orange), var(--color-amber))",
              }}
            />
          </div>
        ))}
      </div>

      {/* ── Lower-right swoosh ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-[22%] -right-[14%] h-[760px] w-[760px] rounded-full border-[70px] border-transparent"
        style={{
          borderTopColor: "rgba(var(--orange-ch), 0.05)",
          borderRightColor: "rgba(var(--amber-ch), 0.05)",
          rotate: "38deg",
          filter: "blur(18px)",
        }}
      />

      {/* ── Drafting grid ── */}
      <div aria-hidden data-l="grid" className="tech-grid absolute inset-0" />

      {/* ── Drafting rule down the left edge with measurement ticks ── */}
      <div
        aria-hidden
        data-l="rule"
        className="pointer-events-none absolute inset-y-0 left-6 hidden w-px origin-top bg-border lg:block"
      >
        {[18, 34, 50, 66, 82].map((t) => (
          <span
            key={t}
            data-l="tick"
            className="absolute -left-1 h-px w-2 bg-border-strong"
            style={{ top: `${t}%` }}
          />
        ))}
      </div>

      {/* Vertical padding is kept at every breakpoint, not zeroed on `lg`. When
          the stage is pinned, `h-full items-center` centres within it and the
          padding barely matters — but under reduced motion the stage is static,
          and without it the eyebrow chip slides up behind the fixed nav. */}
      <div className="relative z-10 mx-auto grid h-full w-full max-w-7xl grid-cols-1 items-center gap-14 px-6 pb-24 pt-32 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:px-12 lg:py-28">
        {/* ────────────── Copy column ────────────── */}
        <div>
          <div data-l="chip" className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <StatusChip>Business Technology</StatusChip>
          </div>

          {/*
            Masked line reveal rather than a fade: each line sits in its own
            `overflow-hidden` wrapper and slides up from below its baseline, so
            the type reads as *uncovered* rather than as materialising. The
            `pb`/`-mb` pair gives descenders room inside the mask without
            changing the line box.

            Deliberately hand-authored instead of SplitText: line 2 is
            `bg-clip-text`, which clips the parent's background to its
            descendants' glyphs — a runtime splitter redistributes the text into
            new boxes and the gradient restarts or bands per box. Two known
            lines beat a splitter, and this survives SSR.
          */}
          <h1 className="mt-7 font-heading text-[1.95rem] font-extrabold leading-[1.05] tracking-[-0.04em] text-ink sm:text-6xl lg:text-[2.9rem] xl:text-[3.6rem]">
            <span
              data-l="line-mask"
              className="-mb-[0.08em] block overflow-hidden pb-[0.08em]"
            >
              <span data-l="h1a" className="block">
                Empowering People
              </span>
            </span>
            <span
              data-l="line-mask"
              className="-mb-[0.08em] block overflow-hidden pb-[0.08em]"
            >
              {/*
                The gradient is *painted onto* this line rather than faded in
                with it: the background is 220% wide and slides from `120% 0` to
                `0% 0`, so line 1 lands while line 2 is brushed across. Two
                arrival mechanisms is what makes the second line read as the
                payoff instead of as more text — and on scroll it runs the other
                way, so the colour drains out of the words as they track off.
              */}
              <span
                data-l="h1b"
                className="block bg-gradient-to-r from-orange via-[#ff7a1a] to-amber bg-clip-text text-transparent"
                style={{ backgroundSize: "220% 100%", backgroundPosition: "0% 0" }}
              >
                Enabling Growth
              </span>
            </span>
          </h1>

          <p
            data-l="sub"
            className="mt-6 max-w-md text-base leading-[1.7] text-ink-muted sm:text-[1.0625rem]"
          >
            Intelligent business solutions and technology services designed to
            help organizations work smarter, grow faster, and create lasting
            impact.
          </p>

          {/* The CTAs keep their framer-motion hover springs. GSAP tweens these
              wrappers, never the buttons themselves, so the two libraries never
              write the same transform. */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <div data-l="cta" className="w-full sm:w-auto">
              <PrimaryCta href="#solutions" className="w-full sm:w-auto">
                Explore Solutions
              </PrimaryCta>
            </div>
            <div data-l="cta" className="w-full sm:w-auto">
              <PrimaryCta href="#contact" className="w-full sm:w-auto">
                Let&apos;s Talk
              </PrimaryCta>
            </div>
          </div>

          <div className="relative mt-12 flex flex-wrap items-center gap-x-6 gap-y-2.5 pt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft">
            <span
              aria-hidden
              data-l="strip-rule"
              className="absolute inset-x-0 top-0 h-px origin-left bg-border"
            />
            {["Enterprise Software", "Managed Services", "Digital Platforms"].map(
              (c) => (
                <span key={c} data-l="strip" className="flex items-center gap-2">
                  <span data-l="strip-dot" className="h-1 w-1 rounded-full bg-orange" />
                  {c}
                </span>
              )
            )}
          </div>
        </div>

        {/* ────────────── The subject: the product ────────────── */}
        <div className="relative flex h-full items-center justify-center">
          <div
            aria-hidden
            data-l="bloom"
            className="pointer-events-none absolute left-[18%] top-[64%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(var(--amber-ch), 0.3) 0%, rgba(var(--orange-ch), 0.09) 46%, rgba(var(--orange-ch), 0) 72%)",
              filter: "blur(28px)",
            }}
          />

          <ProductPanel />
        </div>
      </div>

      {/* ── Scroll cue ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-8 mx-auto hidden max-w-7xl px-6 lg:block lg:px-12"
      >
        <div data-l="cue" className="inline-flex items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink-soft">
          Scroll
        </span>
        <span className="relative h-7 w-px overflow-hidden bg-border">
          <span
            className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-orange to-amber"
            style={{ animation: "cue-run 2.6s ease-in-out infinite" }}
          />
        </span>
        </div>
      </div>
    </div>
  );
}
