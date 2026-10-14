"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowUpRight } from "./ArrowMark";

/*
 * The copy side of a product showcase, told as a short story:
 *
 *   index + identity  →  name and tagline  →  before / with Arrow  →  what's inside  →  CTA
 *
 * The before/after card is the centre of it. "The problem it solves" used to
 * sit alone in a grey box; pairing it with the outcome, joined by the
 * identity's arrow, says what the product changes rather than only what is
 * wrong without it.
 *
 * Each block rises in turn as the section scrolls into view.
 */

type Props = {
  index: number;
  total: number;
  id: string;
  domain: string;
  label: string;
  /** Short name for the secondary link, where the full one runs long. */
  short: string;
  tagline: string;
  blurb: string;
  problem: string;
  modules: string[];
  moduleGroups?: { title: string; items: string[] }[];
  Mark?: (props: { className?: string }) => React.ReactElement;
};

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 90, damping: 18 },
  },
};

const BRAND_GRADIENT =
  "linear-gradient(135deg, var(--color-ember), var(--color-orange) 50%, var(--color-amber))";

function Check({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 8.4l2.8 2.8 6.2-6.4" />
    </svg>
  );
}

function Cross({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
    </svg>
  );
}

export default function ProductStory({
  domain,
  label,
  short,
  tagline,
  blurb,
  problem,
  modules,
  moduleGroups,
}: Props) {
  const reduce = useReducedMotion();
  const name = label.replace(/^Arrow\s+/, "");

  return (
    <motion.div
      variants={container}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="relative"
    >
      {/* ── Identity row ── */}
      <motion.div variants={item} className="relative flex items-center gap-4">
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-orange">
            {domain}
          </span>
        </div>
      </motion.div>

      {/* ── Name + tagline ── */}
      <motion.h2
        variants={item}
        className="relative mt-7 font-heading text-[1.9rem] font-bold leading-[1.05] tracking-[-0.04em] text-ink sm:text-[2.4rem]"
      >
        <span
          className="bg-clip-text text-transparent"
          style={{ backgroundImage: BRAND_GRADIENT }}
        >
          Arrow
        </span>{" "}
        {name}
      </motion.h2>

      <motion.p
        variants={item}
        className="relative mt-3 font-heading text-lg font-medium tracking-[-0.015em] text-ink-muted sm:text-xl"
      >
        {tagline}
      </motion.p>

      {/* ── Before → With Arrow ── */}
      <motion.div
        variants={item}
        className="relative mt-8 grid grid-cols-1 overflow-hidden rounded-card border border-border bg-surface shadow-[0_22px_50px_-26px_rgba(var(--orange-ch),0.45)] sm:grid-cols-[1fr_auto_1.25fr]"
      >
        <div className="p-5">
          <p className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-ink-muted">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-ink-soft/15 text-ink-soft">
              <Cross className="h-2.5 w-2.5" />
            </span>
            Before
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">
            {problem}
          </p>
        </div>

        {/* the hand-off: a divider carrying the identity's arrow */}
        <div className="relative flex items-center justify-center">
          <span
            aria-hidden
            className="absolute inset-x-5 top-1/2 h-px bg-border sm:inset-x-auto sm:inset-y-4 sm:left-1/2 sm:top-auto sm:h-auto sm:w-px"
          />
          <span
            className="relative z-10 flex h-9 w-9 rotate-90 items-center justify-center rounded-full text-white shadow-[0_8px_20px_-6px_rgba(var(--orange-ch),0.8)] sm:rotate-0"
            style={{ background: BRAND_GRADIENT }}
          >
            <svg
              viewBox="0 0 16 16"
              className="h-3.5 w-3.5"
              aria-hidden
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 8h9.5M8.5 4l4 4-4 4" />
            </svg>
          </span>
        </div>

        <div
          className="relative p-5"
          style={{
            background:
              "linear-gradient(135deg, rgba(var(--orange-ch),0.09), rgba(var(--orange-ch),0.02) 70%)",
          }}
        >
          <p className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-orange">
            <span
              className="flex h-4 w-4 items-center justify-center rounded-full text-white"
              style={{ background: BRAND_GRADIENT }}
            >
              <Check className="h-2.5 w-2.5" />
            </span>
            With Arrow
          </p>
          <p className="mt-3 text-[13.5px] leading-relaxed text-ink">{blurb}</p>
        </div>
      </motion.div>

      {/* ── What's inside: the full catalogue, grouped, where one is given ── */}
      {moduleGroups ? (
        <motion.div variants={item} className="relative mt-8 space-y-6">
          {moduleGroups.map((group) => (
            <div key={group.title}>
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink-soft">
                {group.title}{" "}
                <span className="text-orange">· {group.items.length}</span>
              </p>
              <ol className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {group.items.map((m, k) => (
                  <li
                    key={m}
                    className="group flex items-center gap-3 rounded-tile border border-border bg-surface px-3.5 py-2.5 shadow-[0_8px_20px_-16px_rgba(var(--orange-ch),0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:border-orange/40"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-orange/10 font-mono text-[10px] font-semibold text-orange transition-colors duration-300 group-hover:bg-orange group-hover:text-white">
                      {String(k + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[13px] font-medium leading-snug text-ink">
                      {m}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={item} className="relative mt-8">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink-soft">
            What&apos;s inside{" "}
            <span className="text-orange">· {modules.length} modules</span>
          </p>
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {modules.map((m, k) => (
              <motion.li
                key={m}
                initial={reduce ? false : { opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.35 + k * 0.06,
                  duration: 0.45,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group flex items-center gap-3 rounded-tile border border-border bg-surface px-3.5 py-2.5 shadow-[0_8px_20px_-16px_rgba(var(--orange-ch),0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:border-orange/40 hover:shadow-[0_10px_24px_-14px_rgba(var(--orange-ch),0.6)]"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-orange/10 text-orange transition-colors duration-300 group-hover:bg-orange group-hover:text-white">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-[13px] font-medium text-ink">{m}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* ── CTA ── */}
      <motion.div
        variants={item}
        className="relative mt-9 flex flex-wrap items-center gap-x-6 gap-y-3"
      >
        <a
          href="/contact"
          className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_-12px_rgba(var(--orange-ch),0.85)] transition-transform duration-300 hover:-translate-y-0.5"
          style={{ background: BRAND_GRADIENT }}
        >
          {/* sheen that sweeps across on hover */}
          <span
            aria-hidden
            className="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-white/25 opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100"
          />
          <span className="relative">Book a walkthrough</span>
          <ArrowUpRight className="relative h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
        <a
          href="/contact"
          className="group inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-orange"
        >
          Ask about {short}
          <span
            aria-hidden
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </a>
      </motion.div>
    </motion.div>
  );
}
