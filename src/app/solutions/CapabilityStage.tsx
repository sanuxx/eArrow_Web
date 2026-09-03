"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SectionLabel } from "@/components/ui";
import { SOLUTION_ART } from "@/components/solution-art";
import { ArrowUpRight, QMarkLight } from "@/components/ArrowMark";
import { prefersReducedMotion } from "@/lib/gsap";
import type { Group } from "./capabilities";

/**
 * Capabilities, as a stage.
 *
 * A dark full-bleed band where the open domain is set at display scale over a
 * moving field of light and — until the reader takes hold of it — the nine
 * domains advance on their own.
 *
 * Two other treatments of this data were built and discarded: a tabbed
 * explorer with a wall of all sixty-eight capabilities, and a ruled
 * specification matrix. Both are in the history if the register ever needs to
 * come back down; the notes below on cycling, on the numeral and on lifting
 * the artwork are what carried over.
 *
 * ── Why it auto-advances ────────────────────────────────────────────────
 * A tabbed section shows one ninth of itself to anyone who does not interact,
 * which on a marketing page is most people. Cycling means a reader who does
 * nothing still sees the whole range, and the movement is what makes the
 * section catch the eye in the first place. It stops the moment it is
 * touched — hover, focus or click — and once clicked it never restarts,
 * because at that point the reader is driving and having the page take the
 * wheel back would be hostile.
 *
 * ── The giant numeral ───────────────────────────────────────────────────
 * The domain's index is set enormous behind the type and clipped by the stage.
 * It is the section's one piece of pure scale, and it does the work that a
 * photograph would do in an editorial layout: it gives a block of list content
 * a focal point and a sense of place in a sequence.
 */

const CYCLE_MS = 5200;

export default function CapabilityStage({ groups }: { groups: Group[] }) {
  const [active, setActive] = useState(0);
  /* Once the reader picks a domain the carousel is theirs, permanently. */
  const [taken, setTaken] = useState(false);
  const [paused, setPaused] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const group = groups[active];
  const Art = SOLUTION_ART[group.art];
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  /*
   * One timeout per step, keyed on the step — not a single interval.
   *
   * As an interval this compounded: the effect re-runs whenever `paused`
   * toggles, and any run that failed to tear its predecessor down left two
   * timers advancing the same state. Observed directly — the stage cycled
   * roughly twice as fast as CYCLE_MS and was regularly caught mid-transition
   * with the incoming domain still at `initial` (opacity 0), which is why it
   * screenshotted as an empty stage.
   *
   * Scheduling from `active` makes each step responsible for exactly one
   * successor, so a duplicated effect run replaces the pending timer instead
   * of racing it. It is also self-correcting: whatever the state, there is at
   * most one timeout outstanding.
   */
  useEffect(() => {
    if (taken || paused || prefersReducedMotion()) return;
    const id = window.setTimeout(
      () => setActive((i) => (i + 1) % groups.length),
      CYCLE_MS,
    );
    return () => window.clearTimeout(id);
  }, [active, taken, paused, groups.length]);

  const choose = useCallback((i: number) => {
    setActive(i);
    setTaken(true);
  }, []);

  /* Roving tabindex, as the other treatments have. Arrow keys also count as
     taking hold of it. */
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const delta =
        event.key === "ArrowRight" || event.key === "ArrowDown"
          ? 1
          : event.key === "ArrowLeft" || event.key === "ArrowUp"
            ? -1
            : 0;
      if (!delta) return;
      event.preventDefault();
      setTaken(true);
      setActive((current) => {
        const next = (current + delta + groups.length) % groups.length;
        tabRefs.current[next]?.focus();
        return next;
      });
    },
    [groups.length],
  );

  return (
    <section
      id="capabilities"
      className="on-black grain relative overflow-hidden py-12 scroll-mt-24 lg:py-20"
      style={{ background: "#080808" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/*
        The light the stage stands in. It moves with the selection — a slow
        drift rather than a cut, so changing domain reads as the light swinging
        across rather than a new picture being pasted in.
      */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute h-[70%] w-[62%] rounded-full blur-[140px]"
        animate={{
          left: `${28 + (active / (groups.length - 1)) * 44}%`,
          top: `${18 + (active % 3) * 16}%`,
        }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background:
            "radial-gradient(circle, rgba(var(--orange-ch), 0.55), rgba(var(--amber-ch), 0.2) 44%, transparent 70%)",
        }}
      />
      <QMarkLight className="pointer-events-none absolute -bottom-24 -left-20 h-auto w-[420px] opacity-[0.035]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div>
            <SectionLabel index="04" className="!text-amber">
              Capabilities
            </SectionLabel>
            <h2 className="mt-5 max-w-xl font-heading text-[1.72rem] font-bold leading-[1.08] tracking-[-0.035em] text-white sm:text-[2.064rem] lg:text-[2.365rem]">
              Technology designed around your business.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-white/50 lg:pb-2 lg:text-right">
            Nine domains, {total} capabilities, one platform.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:mt-16 lg:grid-cols-[17rem_1fr] lg:gap-14">
          {/* ── The index ─────────────────────────────────────────────── */}
          <div
            role="tablist"
            aria-label="Capability domains"
            aria-orientation="vertical"
            onKeyDown={onKeyDown}
            className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:flex lg:flex-col lg:gap-0"
          >
            {groups.map((g, i) => {
              const live = i === active;
              return (
                <button
                  key={g.name}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`cap-tab-${i}`}
                  aria-selected={live}
                  aria-controls="cap-stage"
                  tabIndex={live ? 0 : -1}
                  onClick={() => choose(i)}
                  className="group relative overflow-hidden rounded-tile px-3 py-2.5 text-left lg:rounded-none lg:border-b lg:border-white/10 lg:px-0 lg:py-3.5"
                >
                  {/*
                    The progress bar is the tell that this is moving on its own.
                    It runs only on the live row and only while the carousel is
                    actually running, so it never promises a change that is not
                    coming.
                  */}
                  {live && !taken && !paused && (
                    <motion.span
                      aria-hidden
                      key={active}
                      className="absolute bottom-0 left-0 h-px w-full origin-left bg-amber/70"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: CYCLE_MS / 1000, ease: "linear" }}
                    />
                  )}

                  <span className="flex items-center gap-2.5">
                    <span
                      className={`font-mono text-[10px] tracking-[0.2em] transition-colors duration-300 ${
                        live ? "text-amber" : "text-white/25"
                      }`}
                    >
                      {g.code}
                    </span>
                    <span
                      className={`text-[13px] font-semibold leading-tight transition-colors duration-300 ${
                        live ? "text-white" : "text-white/45 group-hover:text-white/80"
                      }`}
                    >
                      {g.name}
                    </span>
                    <span
                      className={`ml-auto font-mono text-[10px] tabular-nums transition-colors duration-300 ${
                        live ? "text-amber" : "text-white/25"
                      }`}
                    >
                      {String(g.items.length).padStart(2, "0")}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── The stage ─────────────────────────────────────────────── */}
          <div
            id="cap-stage"
            role="tabpanel"
            aria-labelledby={`cap-tab-${active}`}
            className="relative min-h-[26rem] lg:min-h-[24rem]"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={group.name}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
              >
                {/*
                  The numeral, set at display scale and cropped by the stage.
                  `select-none` because it is decoration a reader should never
                  end up dragging a selection across.
                */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-10 right-0 select-none font-heading text-[9rem] font-extrabold leading-none tracking-[-0.06em] text-white/[0.05] sm:text-[13rem] lg:-top-16 lg:text-[16rem]"
                >
                  {group.code.replace(/\D/g, "")}
                </span>

                <div className="relative flex items-start gap-5">
                  {/*
                    The nine drawings are built in the brand orange for a white
                    page, and on this ground they went nearly black-on-black —
                    the tile read as an empty square. Lifting them is a static
                    one-element filter rather than a second set of artwork:
                    brightness opens them up against the dark and the small
                    saturation bump keeps them from going pastel as they lift.
                  */}
                  <span
                    className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-tile border border-white/20 bg-white/[0.07] lg:h-14 lg:w-14"
                    /* The filter goes on the wrapper, not the drawing:
                       SOLUTION_ART takes a className and nothing else, and
                       widening its props for one caller would push a
                       dark-ground concern into a component that has nine
                       other, light-ground users. */
                    style={{ filter: "brightness(1.45) saturate(1.15)" }}
                  >
                    <Art className="h-8 w-8 lg:h-9 lg:w-9" />
                  </span>
                  <div>
                    <h3 className="font-heading text-[2rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-white sm:text-[2.6rem] lg:text-[3.1rem]">
                      {group.name}
                    </h3>
                    <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/60">
                      {group.lead}
                    </p>
                  </div>
                </div>

                <ul className="relative mt-9 grid grid-cols-1 gap-x-10 sm:grid-cols-2">
                  {group.items.map((item, i) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.34, delay: 0.06 + i * 0.045 }}
                      className="flex items-center gap-3 border-b border-white/10 py-2.5 last:border-b-0 sm:[&:nth-last-child(2):nth-child(odd)]:border-b-0"
                    >
                      <span className="h-1 w-1 shrink-0 rounded-full bg-amber" />
                      <span className="text-[15px] text-white/85">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <p className="mt-12 font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
          Not sure where you sit?{" "}
          <a
            href="/contact"
            className="group ml-1 inline-flex items-center gap-1.5 font-medium text-amber"
          >
            Talk it through with us
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </p>
      </div>
    </section>
  );
}
