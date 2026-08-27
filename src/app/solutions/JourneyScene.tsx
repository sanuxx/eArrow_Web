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
    detail:
      "The systems of record that hold the business up — people, students, patients, production and billing, on one platform instead of five.",
    Icon: RunIcon,
  },
  {
    stage: "Optimise",
    line: "Work smarter.",
    detail:
      "Automation, analytics and AI layered onto what already runs, so the repetitive work leaves and the reporting arrives on its own.",
    Icon: OptimiseIcon,
  },
  {
    stage: "Grow",
    line: "Reach further.",
    detail:
      "Digital platforms and demand generation that open new ground — new channels, new markets, measured to the lead rather than the impression.",
    Icon: GrowIcon,
  },
];

export default function JourneyScene() {
  return (
    <section
      className="on-black grain dot-matrix relative overflow-hidden py-10 lg:py-16"
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
            <h2 className="mt-5 max-w-xl font-heading text-[1.72rem] font-bold leading-[1.08] tracking-[-0.035em] text-white sm:text-[2.064rem] lg:text-[2.365rem]">
              Run. Optimise. Grow.
            </h2>
          </div>

          <p className="max-w-sm text-sm leading-relaxed text-white/50 lg:pb-2 lg:text-right">
            Most organisations meet us at one of these three. You do not have to
            start at the first.
          </p>
        </div>

        <div className="mt-12 lg:mt-14">
          {STAGES.map((s, i) => (
            <motion.a
              key={s.stage}
              href="/contact"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ ...SPRING_SOFT, delay: i * 0.08 }}
              className="group relative block border-t border-white/10 last:border-b"
            >
              {/* The orange panel, wiping in from the left edge. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 origin-left scale-x-0 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                style={{
                  background:
                    "linear-gradient(105deg, var(--color-ember), var(--color-orange) 55%, var(--color-amber))",
                }}
              />
              {/* lit top edge on the revealed panel */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-white/40 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
              />

              <div className="relative grid grid-cols-1 items-center gap-x-8 gap-y-4 px-2 py-8 sm:px-4 lg:grid-cols-[4.5rem_15rem_1fr_auto] lg:py-9">
                {/* index + mark */}
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[10px] tracking-[0.24em] text-white/30 transition-colors duration-300 group-hover:text-white/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <s.Icon className="h-8 w-8 shrink-0 text-amber transition-colors duration-500 group-hover:text-white lg:hidden" />
                </div>

                {/* stage */}
                <div className="flex items-center gap-5">
                  <s.Icon className="hidden h-9 w-9 shrink-0 text-amber transition-colors duration-500 group-hover:text-white lg:block" />
                  <div>
                    <p className="font-heading text-[1.505rem] font-bold uppercase leading-none tracking-[-0.025em] text-white lg:text-[1.72rem]">
                      {s.stage}
                    </p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-amber transition-colors duration-500 group-hover:text-white/85">
                      {s.line}
                    </p>
                  </div>
                </div>

                {/* detail */}
                <p className="max-w-xl text-sm leading-relaxed text-white/50 transition-colors duration-500 group-hover:text-white/85">
                  {s.detail}
                </p>

                <ArrowUpRight className="hidden h-5 w-5 shrink-0 text-white/25 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white lg:block" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
