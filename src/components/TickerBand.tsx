"use client";

import { Marquee } from "./motion-kit";
import { ArrowGlyph } from "./ArrowMark";

/**
 * Full-bleed brand ticker used as a section transition into the black band.
 *
 * Two counter-scrolling rows: the first solid, the second drawn as an outline
 * (text-stroke, transparent fill). The contrast between filled and hollow is
 * what stops a big scrolling wordmark from reading as a banner ad.
 */

const PHRASES = ["Empowering People", "Enabling Growth"];
const KEYWORDS = [
  "Software Solutions",
  "Managed Services",
  "Digital Experiences",
  "Enterprise Platforms",
];

function Item({ text, outline }: { text: string; outline?: boolean }) {
  return (
    <span className="flex shrink-0 items-center">
      <span
        className={`px-7 font-heading text-[2.5rem] font-extrabold uppercase tracking-[-0.02em] sm:text-[3.5rem] lg:text-[4.25rem] ${
          outline ? "text-transparent" : "text-ink"
        }`}
        style={
          outline
            ? {
                WebkitTextStrokeWidth: "1px",
                WebkitTextStrokeColor: "var(--color-ink)",
                opacity: 0.35,
              }
            : undefined
        }
      >
        {text}
      </span>
      <ArrowGlyph className="h-5 w-5 shrink-0 text-orange sm:h-7 sm:w-7" />
    </span>
  );
}

export default function TickerBand() {
  return (
    <section
      aria-hidden
      className="relative overflow-hidden border-y border-border bg-canvas-alt py-14 lg:py-16"
    >
      <Marquee duration={34}>
        {PHRASES.map((p) => (
          <Item key={p} text={p} />
        ))}
      </Marquee>

      <div className="mt-3">
        <Marquee duration={46} reverse>
          {KEYWORDS.map((k) => (
            <Item key={k} text={k} outline />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
