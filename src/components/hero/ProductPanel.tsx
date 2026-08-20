"use client";

import Image from "next/image";
import LightSweep from "../LightSweep";
import { withBasePath } from "@/lib/basePath";

/**
 * The hero's subject: the Arrow HR & Payroll mark, animated.
 *
 * Replaces the dashboard shell that used to sit here. Note this departs from
 * brief §02, which lists "floating product UI cards" among the hero elements —
 * a deliberate override, not an oversight.
 *
 * `data-l="panel-outer"` is load-bearing and must not be renamed:
 * hero-timeline.ts arrives it at 2.856s, parallaxes it through the scrub, and
 * births the Stats aperture from its bounding box at progress 0.42-0.46. The
 * `panel`, `panel-row`, `panel-tile` and `panel-bar` handles the dashboard used
 * are gone, so those `arrive()` tweens are now no-ops.
 *
 * ── The animation ──
 * Three elements, each on its own timing, none of them continuous:
 *
 *   1. An orbit arc rotating once every 22s — slow enough to read as drift
 *      rather than as a spinner. A single hairline of orange fading to nothing,
 *      not a full stroke, so at any instant most of the ring is invisible.
 *   2. The mark breathing (~0.4px of travel), inherited from the client's own
 *      Cinematic Reveal prototype.
 *   3. A specular sweep clipped to the glyph's alpha, firing once every 9s with
 *      a long idle between passes, paired with a ring that expands out of the
 *      mark on the same cycle. The two share a period so the light and the
 *      ripple read as one event.
 *
 * Every animated property is transform or opacity, so the whole thing composites
 * without layout or paint work per frame.
 */

/* The Payroll mark. Same artwork as the corporate Q — see `Payroll logo.png`,
   whose trimmed content is pixel-identical to this file. White on transparency,
   so `--logo-filter` inverts it to near-black on the light canvas. */
const MARK = withBasePath("/logos/payroll.png");

export default function ProductPanel() {
  return (
    /* `panel-outer` is sized to the mark itself rather than to the column, so
       the Stats aperture — which is born from this element's bounding box — opens
       from the visible subject instead of from empty column width around it. */
    <div
      data-l="panel-outer"
      className="relative mx-auto aspect-square w-[min(440px,86%)]"
    >
      <div
        data-l="panel-breath"
        className="absolute inset-0"
        style={{ animation: "card-float 9s ease-in-out infinite" }}
      >
        {/* ── Static hairline ring ── */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full border border-border"
        />

        {/* ── Orbit arc: a conic sweep clipped to a 1.5px annulus ── */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, transparent 250deg, rgba(var(--orange-ch), 0.55) 330deg, rgba(var(--amber-ch), 0.9) 358deg, transparent 360deg)",
            // Annulus mask — keeps the conic fill as a ring, not a filled disc.
            mask: "radial-gradient(farthest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1.5px))",
            WebkitMask:
              "radial-gradient(farthest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1.5px))",
            animation: "orbit-spin 22s linear infinite",
          }}
        />

        {/* ── Ripple, on the sweep's cycle ── */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full border border-orange/25"
          style={{ opacity: 0, animation: "ring-pulse 9s ease-out infinite" }}
        />

        {/* ── Inner registration ring, inset from the orbit ── */}
        <span
          aria-hidden
          className="absolute inset-[13%] rounded-full border border-border/70"
        />

        {/* ── The mark ── */}
        <div className="absolute inset-[24%] flex items-center justify-center">
          <div
            className="relative h-full w-full"
            style={{ animation: "mark-breath 11s linear infinite" }}
          >
            <Image
              src={MARK}
              alt="Arrow HR &amp; Payroll"
              width={500}
              height={403}
              sizes="(max-width: 1023px) 40vw, 440px"
              priority
              className="h-full w-full object-contain"
              style={{ filter: "var(--logo-filter)" }}
            />
            {/* Clipped to the glyph's own alpha, so the light travels across the
                mark's shape rather than across a rectangle. */}
            <LightSweep mask={MARK} animation="mark-sweep 9s ease-in-out infinite" />
          </div>
        </div>
      </div>
    </div>
  );
}
