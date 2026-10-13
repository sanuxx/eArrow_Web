"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { QMarkLight } from "@/components/ArrowMark";

/**
 * The case study, told as a rewire.
 *
 * Three pairs from the brief's worked example, each laid out as one continuous
 * run: the old way on the left, a connector across the middle, the new way on
 * the right. Scrolling drives the connector across, and the destination
 * ignites as it arrives.
 *
 * ── Why this shape and not a before/after pair of cards ──
 * Two panels side by side state that a change happened. They cannot show it,
 * because nothing in the layout crosses from one to the other — the reader has
 * to do the pairing themselves, matching item 2 on the left to item 2 on the
 * right. Running each pair along a single line makes the correspondence the
 * layout's job, and leaves a path for the eye to travel.
 *
 * ── Why the motion is scrubbed rather than a one-shot reveal ──
 * A reveal happens whether or not anyone is watching. Tying the connector to
 * scroll position makes the reader the one performing the transformation, and
 * it can be run backwards, which a triggered animation cannot.
 *
 * ── Legible at any point in the scrub ──
 * The static frame is a three-row table that reads left to right: old term,
 * connector, new term. Everything the scrub adds is emphasis on a layout that
 * already says it, and every animated value is floored at a legible one — see
 * the note on the ramps — so a reader parked halfway through the section
 * reads the same content as one who has scrolled past it.
 *
 * There is no reduced-motion branch, deliberately. Nothing here moves on its
 * own clock: every value is a function of scroll position, so the only motion
 * is the reader's own, which is the case that guidance exempts.
 */

const PAIRS = [
  { before: "Multiple spreadsheets", after: "Integrated HRIS" },
  { before: "Manual approvals", after: "Automated workflows" },
  { before: "Delayed reporting", after: "Real-time dashboards" },
];

/**
 * One run. `progress` is the whole scene's 0-1, and each row consumes its own
 * slice of it, so the three rewire in sequence rather than together — the
 * stagger is what makes it read as a process being carried out.
 */
function Run({
  pair,
  index,
  progress,
}: {
  pair: (typeof PAIRS)[number];
  index: number;
  progress: MotionValue<number>;
}) {
  const start = 0.08 + index * 0.16;
  const end = start + 0.3;

  const draw = useTransform(progress, [start, end], [0, 1], { clamp: true });
  /* The destination lights only once the connector has actually reached it,
     not alongside it — arriving is the event worth marking. */
  const arrive = useTransform(progress, [end - 0.08, end], [0, 1], { clamp: true });

  /*
   * Both ends of every ramp below are floored at a legible value, and that is
   * a hard constraint rather than a taste call. These are not decorative
   * states: the dimmed left-hand term still names the system being replaced,
   * and the right-hand term names its replacement before the run reaches it.
   *
   * The first pass ran the pair between 0.28 and 1.0 effective white, and
   * measured against this ground 0.28 is 2.38:1 — under the 4.5 floor for
   * body text, on content, for as long as the reader sits above that row.
   * Held at 0.53 and 0.55 they measure 5.81:1 and 6.26:1, and the ignition
   * from 0.55 to full is still plainly an event.
   */
  const afterColor = useTransform(
    arrive,
    [0, 1],
    ["rgba(255,255,255,0.55)", "rgba(255,255,255,1)"]
  );
  const nodeScale = useTransform(arrive, [0, 1], [0.4, 1]);
  const nodeGlow = useTransform(
    arrive,
    [0, 1],
    ["0 0 0 0 rgba(232,59,0,0)", "0 0 22px 2px rgba(232,59,0,0.55)"]
  );
  const beforeOpacity = useTransform(arrive, [0, 1], [1, 0.62]);

  return (
    <div className="grid grid-cols-1 items-center gap-4 border-b border-white/10 py-7 last:border-b-0 lg:grid-cols-[1fr_auto_1fr] lg:gap-8">
      {/* ── Where it started ── */}
      <motion.div style={{ opacity: beforeOpacity }} className="flex items-center gap-4">
        <span
          aria-hidden
          className="h-2.5 w-2.5 shrink-0 border border-dashed border-white/40"
        />
        <span className="font-heading text-lg font-bold tracking-[-0.02em] text-white/85 lg:text-xl">
          {pair.before}
        </span>
      </motion.div>

      {/* ── The connector ──
          A track with the drawn line over it, so the run's full length is
          always visible and the progress reads against something. On mobile it
          becomes a short vertical link instead of a horizontal one. */}
      {/* On the stacked column the run is vertical, and it is offset to sit
          under the markers rather than centred: a link floating in the middle
          of the row does not join the two terms it is supposed to connect.
          4px is half the 8px marker, so the spine is continuous. */}
      <div className="relative ml-[4px] h-8 w-px lg:mx-auto lg:ml-0 lg:h-px lg:w-[clamp(80px,12vw,190px)]">
        <span className="absolute inset-0 bg-white/12" />
        {/*
          One element per axis rather than one element switching axis. The run
          is horizontal on desktop and vertical in the stacked column, and a
          single node would need `scaleX` at one breakpoint and `scaleY` at the
          other — which is a value framer writes inline and CSS cannot override
          per media query. Two elements, each with one job, and the breakpoint
          decides which is in the document.
        */}
        <motion.span
          className="absolute inset-0 origin-top bg-gradient-to-b from-orange to-amber lg:hidden"
          style={{ scaleY: draw }}
        />
        <motion.span
          className="absolute inset-0 hidden origin-left bg-gradient-to-r from-orange to-amber lg:block"
          style={{ scaleX: draw }}
        />
      </div>

      {/* ── Where it landed ── */}
      <div className="flex items-center gap-4">
        <motion.span
          aria-hidden
          className="h-2.5 w-2.5 shrink-0 rounded-full bg-orange"
          style={{ scale: nodeScale, boxShadow: nodeGlow }}
        />
        <motion.span
          className="font-heading text-lg font-bold tracking-[-0.02em] lg:text-xl"
          style={{ color: afterColor }}
        >
          {pair.after}
        </motion.span>
      </div>
    </div>
  );
}

export default function RewireScene() {
  const ref = useRef<HTMLDivElement>(null);
  /*
   * Measured from the section entering the viewport to it leaving the top, so
   * the rewire occupies the reader's whole pass over the section rather than
   * completing in the first few pixels.
   */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.35"],
  });

  return (
    <section
      ref={ref}
      className="on-black grain relative overflow-hidden py-14 lg:py-24"
      style={{ background: "#080808" }}
    >
      <QMarkLight className="pointer-events-none absolute -right-24 -top-12 h-auto w-[520px] opacity-[0.035]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-amber">
          Case Study
        </p>

        <h2 className="mt-5 max-w-3xl font-heading text-[1.8rem] font-extrabold leading-[1.06] tracking-[-0.038em] text-white sm:text-[2.4rem] lg:text-[2.9rem]">
          From manual HR to digital workforce management.
        </h2>

        {/* The column headers do the naming once, so the rows below carry no
            repeated "before"/"after" labels. */}
        <div className="mt-14 hidden grid-cols-[1fr_auto_1fr] gap-8 lg:grid">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/35">
            Before
          </p>
          <span className="w-[clamp(80px,12vw,190px)]" />
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-amber">
            After
          </p>
        </div>

        <div className="mt-4 border-t border-white/10 lg:mt-3">
          {PAIRS.map((pair, i) => (
            <Run key={pair.before} pair={pair} index={i} progress={scrollYProgress} />
          ))}
        </div>

        <p className="mt-12 max-w-xl text-sm leading-relaxed text-white/50">
          The figures behind this change belong to the customer, so they are not
          published here until they are verified with them.
        </p>
      </div>
    </section>
  );
}
