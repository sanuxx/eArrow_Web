"use client";

import { useId } from "react";

/**
 * The ISO 9001 seal, drawn rather than sourced.
 *
 * It replaces a stock PNG that carried "pngtree" watermarks baked across its
 * ring — visible on the hero at full size, and an unlicensed asset besides.
 * This is original artwork, so neither problem applies, and being vector it
 * stays crisp at any size instead of softening as the globe scales up.
 *
 * Colour comes from the brand rather than the stock badge's navy: an ivory
 * face with deep-ember engraving, which sits on the orange sphere as an
 * enamel-and-gold medallion. A navy disc on an orange ball reads as a sticker
 * from somewhere else.
 *
 * The centre carries no globe motif, unlike the badge it replaces. This seal
 * is mounted *on* a globe — a globe inside it was the one detail that made
 * the original read as clip art here.
 *
 * ── If the certifier's own mark turns up ──
 * Swap this component out for it. Certification bodies (SGS, Bureau Veritas,
 * TÜV and the rest) issue their own artwork, usually as vector, and that mark
 * is the one with standing. This is a faithful stand-in, not a substitute for
 * it.
 *
 * `useId` for the gradient and path references: two of these on one page with
 * hardcoded ids would have the second one reaching for the first one's defs.
 */

const EMBER = "#7d1a03";
const GOLD = "#a85c08";

export default function IsoBadge({ className }: { className?: string }) {
  const uid = useId();
  const face = `iso-face-${uid}`;
  const topArc = `iso-top-${uid}`;
  const bottomArc = `iso-bottom-${uid}`;

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="ISO 9001 certified — quality management"
    >
      <defs>
        <radialGradient id={face} cx="34%" cy="26%" r="80%">
          <stop offset="0%" stopColor="#fffdf7" />
          <stop offset="55%" stopColor="#f8ecd8" />
          <stop offset="100%" stopColor="#e6cda6" />
        </radialGradient>

        {/*
          Two arcs at the same radius, traversed in opposite directions.
          Sweep 1 from the left point runs over the top; sweep 0 from the same
          point runs under the bottom — and because a glyph's "up" is the
          path's inward normal, both come out upright rather than the bottom
          line hanging inverted, which is what a single shared arc would do.
        */}
        <path id={topArc} d="M 9,50 A 41,41 0 0 1 91,50" fill="none" />
        <path id={bottomArc} d="M 9,50 A 41,41 0 0 0 91,50" fill="none" />
      </defs>

      {/* Face and rules */}
      <circle cx="50" cy="50" r="49" fill={`url(#${face})`} />
      <circle cx="50" cy="50" r="46.2" fill="none" stroke={EMBER} strokeWidth="1.1" />
      <circle cx="50" cy="50" r="36.5" fill="none" stroke={EMBER} strokeWidth="0.7" />

      {/* Ring legend */}
      <text
        className="font-heading"
        fill={EMBER}
        fontSize="8.6"
        fontWeight="800"
        letterSpacing="2.6"
        textAnchor="middle"
      >
        <textPath href={`#${topArc}`} startOffset="50%">
          CERTIFIED
        </textPath>
      </text>
      <text
        className="font-heading"
        fill={GOLD}
        fontSize="5.1"
        fontWeight="700"
        letterSpacing="1.5"
        textAnchor="middle"
      >
        <textPath href={`#${bottomArc}`} startOffset="50%">
          QUALITY MANAGEMENT
        </textPath>
      </text>

      {/* The two flanking stars, where the arcs meet */}
      {[15.5, 84.5].map((x) => (
        <path
          key={x}
          d={`M ${x},45.4 L ${x + 1.5},49 L ${x + 5},50.5 L ${x + 1.5},52 L ${x},55.6 L ${x - 1.5},52 L ${x - 5},50.5 L ${x - 1.5},49 Z`}
          fill={GOLD}
        />
      ))}

      {/* The mark itself */}
      <text
        className="font-heading"
        x="50"
        y="45.5"
        fill={EMBER}
        fontSize="15"
        fontWeight="800"
        letterSpacing="1.4"
        textAnchor="middle"
      >
        ISO
      </text>
      <line x1="31" y1="50.5" x2="69" y2="50.5" stroke={GOLD} strokeWidth="0.8" />
      <text
        className="font-heading"
        x="50"
        y="67"
        fill={EMBER}
        fontSize="18"
        fontWeight="800"
        letterSpacing="0.4"
        textAnchor="middle"
      >
        9001
      </text>
    </svg>
  );
}
