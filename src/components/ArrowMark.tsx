/**
 * The arrow motif.
 *
 * The brief calls the arrow the strongest asset in the new identity and asks
 * for it beyond the logo — as CTA icons, background graphics, section
 * transitions and hover cues. Everything here is drawn with round caps and
 * joins so it sits in the same rounded-rectangle language as the cards.
 */

import Image from "next/image";

type Props = { className?: string };

/**
 * The eArrow "Q" — the O with the arrow inside, taken straight from the logo
 * artwork rather than redrawn. This is the mark the brief calls the strongest
 * asset in the identity, so it carries every large decorative placement.
 *
 * The asset is white artwork on transparency, so colour comes from
 * `--logo-filter`: it inverts to near-black on light canvases and stays white
 * in dark mode and inside the `.on-black` / `.on-orange` sections, which pin
 * that variable themselves.
 */
export function QMark({ className, style }: Props & { style?: React.CSSProperties }) {
  return (
    <Image
      src="/logos/earrow-q.png"
      alt=""
      aria-hidden
      width={500}
      height={403}
      className={className}
      style={{ filter: "var(--logo-filter)", ...style }}
    />
  );
}

/** The Q mark forced to white, for use on orange and black fields. */
export function QMarkLight({ className, style }: Props & { style?: React.CSSProperties }) {
  return (
    <Image
      src="/logos/earrow-q.png"
      alt=""
      aria-hidden
      width={500}
      height={403}
      className={className}
      style={style}
    />
  );
}

/** Bold arrow glyph, used inline at icon size. */
export function ArrowGlyph({ className }: Props) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden>
      <path
        d="M14 50h58M54 30l20 20-20 20"
        stroke="currentColor"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Stacked rounded rectangles from the logo artwork, used as a decorative
 * shape cluster in the hero and the "Why eArrow" brand panel.
 */
export function StackedRects({ className }: Props) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className} aria-hidden>
      <rect x="16" y="26" width="150" height="42" rx="21" fill="currentColor" opacity="0.35" />
      <rect x="34" y="80" width="150" height="42" rx="21" fill="currentColor" opacity="0.6" />
      <rect x="16" y="134" width="110" height="42" rx="21" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

/**
 * Small up-right arrow for links — the brief's "Discover how we help
 * businesses grow ↗" pattern.
 */
export function ArrowUpRight({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M7 17L17 7M9 7h8v8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
