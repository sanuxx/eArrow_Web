"use client";

import Image from "next/image";
import { withBasePath } from "@/lib/basePath";

/**
 * The hero's subject: the mark, and a trajectory leaving it.
 *
 * The eArrow Q sits at the centre of a drafted field — one dashed
 * construction circle, one ascending curve, a node where the curve crosses
 * out of the circle, an arrowhead, a baseline. Nothing is filled, nothing
 * glows, and there is exactly one accent colour on screen. The composition
 * states the brand argument as a diagram: a system, and a line leaving it and
 * climbing.
 *
 * It replaces a rendered orange sphere. That was the opposite brief —
 * saturated, decorative and heavy — and no amount of material work makes a
 * large glossy ball read as restraint.
 *
 * The mark's own arrow points up and to the right; the trajectory leaves on
 * the same heading, so the drawing reads as the logo's gesture continued out
 * into the frame rather than as a line placed near a logo.
 *
 * ── Why the node is where it is ──
 * The curve is `M 30 168 Q 104 150 178 44` and the construction circle is
 * centred (74, 88) with r = 58. Evaluating the quadratic against the circle
 * puts the outward crossing at t ≈ 0.68; projecting that onto the circle
 * gives (130.1, 102.7). The node is solved rather than eyeballed, so it sits
 * on the ring at every size. The curve's closest approach to the mark is ~50
 * units against a glyph radius of ~24, so it never crowds it.
 *
 * ── Draw-on ──
 * Every stroke carries `pathLength="1"`, so dash units are 0-1 regardless of
 * the geometry's real arc length and hero-timeline.ts can tween
 * `strokeDashoffset` from 1 to 0 without knowing anything about the shapes.
 * The settled state authored here is the finished drawing, which is the
 * file's standing contract: the intro is `.from()` tweens only, so under
 * reduced motion — where GSAP never runs — this is what paints.
 *
 * `data-l="panel-outer"` is load-bearing and must not be renamed: the Stats
 * aperture is born from this element's bounding box at scrub 0.42-0.46.
 */

const INK = "var(--color-ink)";
const ORANGE = "var(--color-orange)";

/*
 * The mark is white artwork on transparency, so its colour comes from
 * `--logo-filter` — near-black on this canvas, and already white in dark mode
 * and on the black sections, with no second asset.
 */
const MARK = withBasePath("/logos/payroll.png");

export default function HeroVector() {
  return (
    <div
      data-l="panel-outer"
      className="relative mx-auto aspect-square w-[min(430px,88%)]"
    >
      {/*
        Placed in percentages that are the SVG's own coordinates divided by
        200 — centre (74, 88) and width 60 become 37%, 44% and 30%. The two
        layers therefore stay registered to each other at every size without
        either one knowing the other's units.
      */}
      <div
        data-l="mark-logo"
        className="absolute left-[37%] top-[44%] w-[30%] -translate-x-1/2 -translate-y-1/2"
      >
        <Image
          src={MARK}
          alt="eArrow"
          width={500}
          height={403}
          sizes="(max-width: 1023px) 26vw, 130px"
          priority
          className="h-auto w-full"
          style={{ filter: "var(--logo-filter)" }}
        />
      </div>

      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full overflow-visible"
        fill="none"
        aria-hidden
      >
        {/* The baseline. */}
        <path
          data-l="mark-axis"
          d="M 24 184 L 180 184"
          stroke={INK}
          strokeOpacity="0.16"
          strokeWidth="0.9"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset="0"
        />
        {[24, 63, 102, 141, 180].map((x) => (
          <path
            key={x}
            d={`M ${x} 184 L ${x} 189`}
            stroke={INK}
            strokeOpacity="0.16"
            strokeWidth="0.9"
          />
        ))}

        {/* The construction circle — the faintest thing in the frame, and the
            reason the composition reads as drafted rather than drawn. */}
        <circle
          data-l="mark-ring"
          cx="74"
          cy="88"
          r="58"
          stroke={INK}
          strokeOpacity="0.15"
          strokeWidth="0.85"
          strokeDasharray="0.004 0.011"
          pathLength="1"
          strokeDashoffset="0"
        />

        {/* The trajectory. The one saturated stroke on the page. */}
        <path
          data-l="mark-path"
          d="M 30 168 Q 104 150 178 44"
          stroke={ORANGE}
          strokeWidth="1.9"
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset="0"
        />

        {/* Where the line leaves the system — solved, not placed. */}
        <circle
          data-l="mark-node"
          cx="130.1"
          cy="102.7"
          r="3.1"
          fill="var(--color-canvas)"
          stroke={ORANGE}
          strokeWidth="1.3"
        />

        {/*
          The arrowhead, oriented along the curve's exit tangent: the control
          point to the endpoint is (74, -106), so the head is rotated -55.1deg
          about the tip and inherits the direction the line is actually
          travelling rather than a guessed angle.
        */}
        <path
          data-l="mark-head"
          d="M 178 44 L 168.2 47.7 L 168.2 40.3 Z"
          fill={ORANGE}
          transform="rotate(-55.1 178 44)"
        />

        {/* One pulse travelling the curve, on a long cycle. The only thing
            here that moves once the drawing has settled. */}
        <circle className="hero-vector-pulse" r="2.6" fill={ORANGE} />
      </svg>

      {/* The credential, set as a drawing annotation rather than a badge. */}
      <div
        data-l="mark-cap"
        className="absolute bottom-0 right-0 flex items-center gap-2.5"
      >
        <span aria-hidden className="h-px w-7 bg-border-strong" />
        <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-muted">
          ISO 9001 Certified
        </span>
      </div>
    </div>
  );
}
