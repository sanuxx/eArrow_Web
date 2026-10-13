"use client";

import { motion } from "framer-motion";
import { SectionLabel } from "@/components/ui";
import { ArrowUpRight, QMarkLight } from "@/components/ArrowMark";
import { SPRING_SOFT } from "@/components/motion-kit";

/*
 * The journey — Run / Optimise / Grow.
 *
 * This section went through four scroll-driven versions: a pinned focus pull,
 * then icons, then a re-composed folio, then a split screen with an orange
 * plate per act. Each was better made than the last and none of them worked,
 * because the problem was never the execution — it was the premise. Three
 * words and three sentences were being staged as a 340vh pinned production.
 * The presentation outweighed the content, which is what read as overwrought.
 *
 * So the scroll-jacking is gone entirely. No pin, no sticky stage, no scrubbed
 * timeline, no 340vh of travel. Three full-width rows on the black ground,
 * read top to bottom in about a screen, with the orange arriving only on the
 * row you are pointing at.
 *
 * The hover wipe is deliberately the same device as the Industries tiles — an
 * orange panel that scales in from the left edge while the type inverts to
 * white. Reusing it means this band and that one read as one system rather
 * than as two sections that happen to share a palette.
 *
 * framer-motion, not GSAP: there is no scrubbed sequence left to drive, and
 * the entrance is a plain in-view stagger. GSAP is reserved for the places
 * that genuinely need a timeline.
 *
 * ── What was added later, and what was deliberately not ─────────────────
 * A spine threading the three stages, a real destination per row, and the
 * domains each stage covers. All three are additive: the section still reads
 * top to bottom in about a screen and nothing pins, scrubs or sequences. The
 * heading claims these are three stages of *one* journey, and until the spine
 * existed the design showed three unrelated rows separated by hairlines —
 * the one idea the section is named for was the one it did not draw.
 *
 * `covers` comes in as a prop rather than being written here, so the domain
 * names are read from the same array the capability explorer renders and
 * cannot drift out of step with it.
 */

type IconProps = { className?: string };

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** Run — the systems of record, as stacked rows. */
function RunIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden {...STROKE}>
      <path d="M22 30h56M22 50h38M22 70h48" />
    </svg>
  );
}

/** Optimise — tuning, as sliders. */
function OptimiseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden {...STROKE}>
      <path d="M20 34h60M20 66h60" />
      <circle cx="64" cy="34" r="10" fill="currentColor" />
      <circle cx="38" cy="66" r="10" fill="currentColor" />
    </svg>
  );
}

/** Grow — the arrow motif, trending up and to the right. */
function GrowIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden {...STROKE}>
      <path d="M20 68l20-20 16 16 24-28M62 34h18v18" />
    </svg>
  );
}

const STAGES = [
  {
    stage: "Run",
    line: "Manage your business.",
    /*
      Each stage goes somewhere of its own. All three rows used to point at
      `/contact` — three distinct promises, one generic destination, under an
      arrow glyph that says otherwise. Measured as `["/contact","/contact",
      "/contact"]`, which is the row looking like navigation without being it.
    */
    href: "/products",
    detail:
      "People, students, patients, production and billing all depend on the same systems of record, running on one platform instead of five.",
    Icon: RunIcon,
  },
  {
    stage: "Optimise",
    line: "Work smarter.",
    href: "/technology",
    detail:
      "Automation, analytics and AI layered onto what already runs, so the repetitive work leaves and the reporting arrives on its own.",
    Icon: OptimiseIcon,
  },
  {
    stage: "Grow",
    line: "Reach further.",
    href: "/industries",
    detail:
      "New channels and new markets, opened by digital platforms and demand generation that measure to the lead rather than the impression.",
    Icon: GrowIcon,
  },
];

export default function JourneyScene({ covers }: { covers: string[][] }) {
  return (
    <section
      id="journey"
      /* `scroll-mt-24` because the header is fixed: without it an anchor jump
         lands the section's top edge underneath the nav. */
      className="on-black grain dot-matrix relative overflow-hidden py-10 scroll-mt-24 lg:py-16"
      style={{ background: "#080808" }}
    >
      <QMarkLight className="pointer-events-none absolute -left-24 -bottom-16 h-auto w-[420px] opacity-[0.035]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        {/* The heading and the framing line sit side by side, so the header is
            one band of information rather than a stack with dead air beside it. */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div>
            <SectionLabel index="03" className="!text-amber">
              The journey
            </SectionLabel>
            {/*
              Not "Run. Optimise. Grow." — that is the page's h1, sitting a few
              hundred pixels above this, and the three words are also the titles
              of the three rows immediately below. Repeating them here said the
              same thing three times in one screen. This names the structure
              instead, which is the one thing the heading can add.
            */}
            <h2 className="mt-5 max-w-xl font-heading text-[1.72rem] font-bold leading-[1.08] tracking-[-0.035em] text-white sm:text-[2.064rem] lg:text-[2.365rem]">
              Three stages of the same journey
            </h2>
          </div>

          <p className="max-w-sm text-sm leading-relaxed text-white/50 lg:pb-2 lg:text-right">
            Most organisations meet us at one of these three. You do not have to
            start at the first.
          </p>
        </div>

        {/*
          ── Three cards, each lit from its own dome ──────────────────────
          Built to a supplied reference: a tall card on a near-black ground,
          the artwork floating in a domed pool of light across the top, then
          the title, the copy, and a pager showing where you are in the set.

          The reference is pink and cyan. This is not — the palette is the
          site's own ramp, deepest on the first stage and lightest on the
          last, so the three glows differ the way the reference's do while
          the section still belongs to the page it sits on. Copying the hues
          would have put the only pink and cyan on the site in one band.

          The dome is a rectangle with a large bottom radius, not a circle:
          it has to meet the card's own edges squarely at the top and curve
          only where it dissolves into the dark, which is exactly what a
          bottom-only radius does and what a circle cannot.
        */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-7">
          {STAGES.map((s, i) => {
            /* Deepest to lightest across the three, all from the brand ramp. */
            const glow = [
              { core: "var(--color-ember)", mid: "var(--color-orange)", ch: "var(--orange-ch)" },
              { core: "var(--color-orange)", mid: "#ff7a1a", ch: "var(--orange-ch)" },
              { core: "#ff8a1f", mid: "var(--color-amber)", ch: "var(--amber-ch)" },
            ][i];

            return (
              <motion.a
                key={s.stage}
                href={s.href}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-70px" }}
                transition={{ ...SPRING_SOFT, delay: i * 0.12 }}
                className="journey-card group relative flex min-h-[30rem] flex-col overflow-hidden rounded-[1.75rem] lg:min-h-[32rem]"
              >
                {/*
                  ── The dome ──
                  The lit area has to end on a visible arc, which is the
                  reference's signature and the thing a plain top-of-card glow
                  does not give you. Two parts make it: a fill that is still
                  carrying colour when it reaches the container's bottom edge,
                  and a bottom-only radius that cuts it. A gradient that fades
                  to transparent first — which is what this had — dissolves
                  before the clip does anything, so no curve ever appears.
                */}
                <div
                  className="relative h-[46%] shrink-0 overflow-hidden"
                  style={{ borderRadius: "0 0 50% 50% / 0 0 26% 26%" }}
                >
                  {/* The pool. Opaque enough at the bottom that the cut reads. */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(105% 88% at 50% 26%, ${glow.mid} 0%, ${glow.core} 46%, rgba(${glow.ch}, 0.42) 72%, rgba(${glow.ch}, 0.2) 100%)`,
                    }}
                  />
                  {/* The hot core the mark sits in. */}
                  <div
                    className="journey-core absolute left-1/2 top-[44%] h-[210px] w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      background: "radial-gradient(circle, rgba(255,240,214,0.85) 0%, rgba(255,190,110,0.4) 40%, transparent 70%)",
                    }}
                  />
                  {/* The mark, lit from behind. */}
                  <s.Icon className="absolute left-1/2 top-[44%] h-[88px] w-[88px] -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-[0_6px_22px_rgba(90,20,0,0.65)] transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]" />
                </div>

                {/* The light the dome throws down into the card, so the arc
                    sits in a halo rather than on a hard boundary. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-[62%]"
                  style={{
                    background: `radial-gradient(70% 62% at 50% 40%, rgba(${glow.ch}, 0.3), transparent 72%)`,
                  }}
                />

                {/* ── The copy ── */}
                <div className="relative flex flex-1 flex-col px-7 pb-7 pt-8 lg:px-8">
                  <h3 className="font-heading text-[1.6rem] font-extrabold leading-[1.1] tracking-[-0.03em] text-white lg:text-[1.75rem]">
                    {s.stage === "Run"
                      ? "Run your business"
                      : s.stage === "Optimise"
                        ? "Optimise the work"
                        : "Grow beyond it"}
                  </h3>

                  <p className="mt-3.5 text-[13.5px] leading-relaxed text-white/55">
                    {s.detail}
                  </p>

                  {/*
                    The domains this stage covers, as one quiet line rather
                    than three pills. The reference's copy block is a single
                    paragraph, and a row of bordered chips under it is the one
                    thing that would stop these reading as the same object.
                  */}
                  {/* `white/50`, not `/35`. Measured on the card at 3.19:1,
                      under the 4.5 floor — and these are domain names, not
                      decoration. At /50 it reads 5.4:1 and is still plainly
                      quieter than the paragraph above it. */}
                  <p className="mt-4 font-mono text-[9.5px] uppercase leading-relaxed tracking-[0.16em] text-white/50">
                    {covers[i]?.join("  ·  ")}
                  </p>

                  <span className="mt-auto flex items-center justify-between pt-7">
                    {/* The pager: where this card sits in the set. */}
                    <span aria-hidden className="flex items-center gap-2">
                      {STAGES.map((_, d) => (
                        <span
                          key={d}
                          className={`h-1.5 rounded-full transition-colors duration-300 ${
                            d === i ? "w-5 bg-white" : "w-1.5 bg-white/25"
                          }`}
                        />
                      ))}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-white/35 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-amber" />
                  </span>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
