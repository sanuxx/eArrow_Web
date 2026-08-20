"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import type { Transition } from "framer-motion";

/**
 * Shared motion vocabulary.
 *
 * Motion is a design layer here, not decoration bolted on per component, so
 * the easings and springs live in one place. Everything below degrades under
 * `prefers-reduced-motion` — the tickers stop, the orbs hold still, and the
 * springs collapse to plain fades.
 */

/*
 * The hero no longer draws from this file — it is GSAP-driven, and mixing the
 * two libraries on one element means two writers on one transform. Its
 * equivalents live in hero-timeline.ts as GSAP eases. Everything below is still
 * used by the other twelve sections.
 */

/** Overshoot easing — the "subtle bounce" used on entrances. */
export const EASE_BACK = [0.34, 1.42, 0.64, 1] as const;

/** Springy settle for interactive elements. */
export const SPRING: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 18,
  mass: 0.7,
};

/** Softer, slower spring for large panels. */
export const SPRING_SOFT: Transition = {
  type: "spring",
  stiffness: 140,
  damping: 16,
  mass: 1,
};

/* ────────────────────────────────────────────────────────────────────────
   Infinite ticker
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Seamless infinite marquee. Children are rendered twice and the track slides
 * exactly -50%, so the second copy lands where the first started. Pauses on
 * hover; holds still entirely under reduced-motion.
 */
export function Marquee({
  children,
  duration = 40,
  reverse = false,
  fade = true,
  className,
}: {
  children: React.ReactNode;
  duration?: number;
  reverse?: boolean;
  fade?: boolean;
  className?: string;
}) {
  /*
   * One tree, server and client.
   *
   * This used to branch on `useReducedMotion()` and return different markup —
   * which fails hydration outright, because the hook reports `false` during SSR
   * and `true` on a client that prefers reduced motion, so React throws away and
   * regenerates the subtree. The stop is a CSS media query on `.marquee-track`
   * instead (see globals.css), which is both correct and free.
   */
  return (
    <div
      className={`marquee overflow-hidden ${fade ? "marquee-fade" : ""} ${className ?? ""}`}
    >
      <div
        className="marquee-track"
        style={
          {
            "--marquee-duration": `${duration}s`,
            "--marquee-direction": reverse ? "reverse" : "normal",
          } as React.CSSProperties
        }
      >
        {/* two identical copies — required for the -50% loop to be seamless */}
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Counting numerals
   ──────────────────────────────────────────────────────────────────────── */

/** Splits "150+" into 150 and "+". Non-numeric values (e.g. "Enterprise") give null. */
const NUMERIC = /^(\d+)(.*)$/;

/**
 * A figure that counts up to its value the first time it scrolls into view.
 *
 * Takes the whole authored string rather than a number so the data stays
 * readable — "20+", "150+", "Enterprise" — and anything without a leading
 * integer simply renders as written instead of being a special case at every
 * call site.
 *
 * The count starts at 0 in state on both server and client, and reduced-motion
 * is consulted in an effect rather than during render, because `useReducedMotion`
 * reports false during SSR and would otherwise hydrate a different first frame.
 */
export function CountUp({
  value,
  className,
  duration = 1.6,
}: {
  value: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();

  const match = NUMERIC.exec(value);
  const target = match ? Number(match[1]) : null;
  const suffix = match ? match[2] : "";

  const [n, setN] = useState(0);

  useEffect(() => {
    if (target === null || !inView) return;
    // Reduced motion runs the same animation at zero duration rather than
    // setting state directly: one code path, and no synchronous setState in an
    // effect body (which cascades a second render for every figure on screen).
    const controls = animate(0, target, {
      duration: reduced ? 0 : duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, target, reduced, duration]);

  return (
    <span ref={ref} className={`tnum ${className ?? ""}`}>
      {target === null ? value : `${n}${suffix}`}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Floating orbs
   ──────────────────────────────────────────────────────────────────────── */

export type Orb = {
  /** size in px */
  size: number;
  /** css position, e.g. { left: "10%", top: "20%" } */
  at: React.CSSProperties;
  /** drift distance in px */
  drift?: number;
  /** seconds for one full drift cycle */
  duration?: number;
  delay?: number;
  /** tailwind-ish colour stops */
  from?: string;
  to?: string;
  opacity?: number;
  blur?: number;
};

/**
 * Soft gradient orbs that drift continuously behind a section.
 *
 * Only `transform` is animated — never `filter` or `width` — so the blur is
 * rasterised once and the drift runs on the compositor.
 */
export function FloatingOrbs({
  orbs,
  className,
}: {
  orbs: Orb[];
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      {orbs.map((o, i) => {
        const drift = o.drift ?? 36;
        return (
          <motion.div
            key={i}
            initial={false}
            animate={
              reduced
                ? undefined
                : {
                    x: [0, drift, -drift * 0.6, 0],
                    y: [0, -drift * 0.8, drift * 0.5, 0],
                    scale: [1, 1.06, 0.97, 1],
                  }
            }
            transition={{
              duration: o.duration ?? 22,
              delay: o.delay ?? 0,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute rounded-full"
            style={{
              ...o.at,
              width: o.size,
              height: o.size,
              opacity: o.opacity ?? 0.5,
              filter: `blur(${o.blur ?? 90}px)`,
              background: `radial-gradient(circle at 35% 35%, ${
                o.from ?? "var(--color-amber)"
              }, ${o.to ?? "var(--color-orange)"} 70%, transparent 72%)`,
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * Wrapper that gives a child a slow, continuous vertical float. Used on the
 * hero's product panels so the composition breathes instead of sitting still.
 */
export function Floater({
  children,
  duration = 7,
  delay = 0,
  distance = 12,
  className,
}: {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  distance?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      animate={reduced ? undefined : { y: [0, -distance, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}
