"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * The solutions hero backdrop — a ribbon delta.
 *
 * Seven curved ribbons converge to a single point and fan out to the right,
 * widening as they go. One source, many flows: the page's own claim ("one
 * technology partner", nine capability domains, seven platforms) drawn rather
 * than written.
 *
 * ── How a ribbon is built ───────────────────────────────────────────────
 * Each one is a single closed path made of exactly two cubics that *start and
 * end at the same point*. From the origin, one curve runs to the top of the
 * ribbon's far edge and the other to the bottom; the far edge closes them with
 * a straight line. That gives a true cusp at the origin — a point, not a
 * rounded stub — so the convergence is exact by construction rather than by
 * tapering a stroke down and hoping.
 *
 * The two curves carry different control offsets (`bowT` against `bowB`), which
 * is what keeps the ribbons organic and asymmetric instead of reading as a
 * mathematical fan. A ribbon with matched bows looks like a pie slice.
 *
 * The control reaches matter as much as the bows. `k1` is deliberately about
 * half the width: the ribbons leave the origin travelling almost horizontally
 * and only turn late, which is what makes a delta rather than a starburst. A
 * first attempt used k1 around 300 against a far edge spread over 1000 units,
 * and the curvature was swamped by the sheer diagonal distance — every ribbon
 * rendered as a straight wedge. Holding them together near the source and
 * bending them late is the whole shape.
 *
 * ── Why the bands do not show their edges ───────────────────────────────
 * Three things have to agree, and adjusting only one of them does not work.
 *
 *   · The blur has to be wide enough that a ribbon's edge is softer than the
 *     colour step across it. At 9 units against a fan 900px tall the edges
 *     were sharper than the tonal jump and every boundary showed as a line.
 *   · The steps between neighbouring colours have to be small. An early ramp
 *     jumped #e83b00 to #ff7a1a, which no amount of blur reconciles: the eye
 *     finds the transition because there genuinely is one. Sampling the brand
 *     gradient at even intervals gives small steps by construction.
 *   · The fills have to be transparent enough that overlaps *sum* rather than
 *     one covering the other. An opaque ribbon crossing its neighbour draws a
 *     hard edge however soft its own outline is.
 *
 * ── Depth without shadows ───────────────────────────────────────────────
 * The ribbons are wide enough to overlap their neighbours and are filled at
 * partial opacity, so the layering comes from the overlaps themselves. No
 * blur filter and no shadow: a filter over an animated layer re-rasterises
 * every frame for the life of the page, and this needs to cost nothing.
 *
 * ── The motion ─────────────────────────────────────────────────────────
 * Each ribbon pivots by about a degree around the shared origin, on its own
 * long period. Because the pivot is the convergence point, the source stays
 * pinned while the far ends sweep — the delta breathes without the geometry
 * ever coming apart. `svgOrigin` is what makes that exact: it sets the pivot
 * in viewBox units, so it does not have to be re-derived when the SVG is
 * scaled to a different viewport.
 */

/* Origin, and the far edge, in viewBox units. The origin sits on the left edge
   of the box; the wrapper is what places that edge on the page. */
const OX = 0;
const OY = 320;
const EX = 1000;
/*
 * Wide and flat, and the ratio is doing real work.
 *
 * It has been both. When the delta only crossed the right-hand half, a *tall*
 * box was right: the run was short, so the ribbons had to spread hard to open
 * at all within it. Now that it crosses the whole masthead the run is nearly
 * the full width, and the same proportions flooded the hero — a box 1.5x as
 * tall as it is wide, stretched over 102% of the width, is 150% of the hero
 * high, so the fan filled the frame and the composition disappeared.
 *
 * At 1000x640 the graphic is roughly as tall as the hero when it is as wide as
 * the hero. The ribbons still open completely, but they open into a band that
 * crosses the frame rather than a wall that fills it.
 */
const VIEW = { w: 1000, h: 640 };

type Ribbon = {
  /** Centre and half-height of the far edge. */
  ec: number;
  eh: number;
  /** Control-point reach from the origin and from the far edge. */
  k1: number;
  k2: number;
  /** Separate bows for the two edges — this is where the asymmetry lives. */
  bowT: number;
  bowB: number;
};

const RIBBONS: Ribbon[] = [
  { ec: 66, eh: 154, k1: 470, k2: 830, bowT: -27, bowB: 13 },
  { ec: 170, eh: 142, k1: 496, k2: 852, bowT: -19, bowB: 9 },
  { ec: 262, eh: 133, k1: 520, k2: 872, bowT: -11, bowB: 5 },
  { ec: 350, eh: 130, k1: 540, k2: 886, bowT: -3, bowB: 2 },
  { ec: 440, eh: 133, k1: 520, k2: 872, bowT: 10, bowB: -5 },
  { ec: 532, eh: 142, k1: 496, k2: 852, bowT: 18, bowB: -8 },
  { ec: 636, eh: 154, k1: 470, k2: 830, bowT: 26, bowB: -12 },
];

/* ── Colour ───────────────────────────────────────────────────────────────
 * Every ribbon is a point on the brand gradient, and nothing here is a hex
 * value.
 *
 * That gradient is defined once in globals.css and written the same way in
 * four other components — `--color-ember` to `--color-orange` at 55% to
 * `--color-amber`. The ribbons used to carry hand-mixed approximations of it
 * (#8f2400, #ac2c00, #c73300 …), which meant the hero's largest element was
 * the one place on the site quoting the brand from memory. Reading the tokens
 * instead has three consequences worth having: the fan is exactly the site's
 * orange, it follows the dark theme's lifted values without a second palette,
 * and a change to the brand reaches it for free.
 *
 * The 55% midpoint is the real one from the shared gradient, not a rounded
 * half — the ramp is deliberately weighted toward the ember end.
 *
 * Mixed in oklab rather than sRGB. sRGB interpolation across a warm ramp dips
 * through a muddier, darker middle, which is exactly the banding this fan
 * spent three passes removing; oklab keeps the steps perceptually even.
 */
const EMBER = "var(--color-ember)";
const ORANGE = "var(--color-orange)";
const AMBER = "var(--color-amber)";
const MID = 0.55;

function mix(from: string, to: string, k: number) {
  if (k <= 0.001) return from;
  if (k >= 0.999) return to;
  return `color-mix(in oklab, ${from} ${Math.round((1 - k) * 100)}%, ${to} ${Math.round(k * 100)}%)`;
}

/** Where ribbon `i` sits on the brand ramp, 0 at ember and 1 at amber. */
function rampColour(i: number) {
  const t = i / (RIBBONS.length - 1);
  return t <= MID
    ? mix(EMBER, ORANGE, t / MID)
    : mix(ORANGE, AMBER, (t - MID) / (1 - MID));
}

/** The lighter value each ribbon carries where it leaves the source. */
function tintColour(i: number) {
  return `color-mix(in oklab, ${rampColour(i)} 70%, #ffffff 30%)`;
}

/*
 * A fallback ramp for browsers without `color-mix`.
 *
 * This matters more than it looks. An unsupported value in `stop-color` is not
 * ignored in favour of something sensible — the declaration is dropped and the
 * stop falls back to its initial value, which is *black*. A browser two
 * versions behind would render the hero as seven black ribbons rather than a
 * slightly coarser orange one.
 *
 * So each stop carries a plain token as its presentation attribute and the
 * mixed value as an inline style. Inline style wins wherever `color-mix`
 * parses; where it does not, the attribute is already sitting underneath it.
 * The result is a three-step ramp off the same tokens: on-brand, just without
 * the intermediate values.
 */
function fallbackColour(i: number) {
  const t = i / (RIBBONS.length - 1);
  return t < MID * 0.6 ? EMBER : t > MID + (1 - MID) * 0.5 ? AMBER : ORANGE;
}

/*
 * Two blurred groups, alternating. Every odd ribbon goes in one and every even
 * ribbon in the other, so the two sheets can drift against each other.
 *
 * The sweeps are small and they are small for a reason. Because the ribbons
 * alternate between the sheets, counter-rotating the sheets shears the
 * interleaving — every ribbon pulls away from both of its neighbours at once,
 * and past about a degree the fan opens pale wedges along its length. Under a
 * degree the drift reads as the sheet breathing and the overlaps never break.
 */
const GROUPS = [
  { key: "a", indices: [0, 2, 4, 6], blur: 26, opacity: 0.82, sweep: 0.8, secs: 41 },
  { key: "b", indices: [1, 3, 5], blur: 18, opacity: 0.88, sweep: -0.6, secs: 29 },
];

function path(r: Ribbon) {
  const top = r.ec - r.eh;
  const bot = r.ec + r.eh;
  return [
    `M ${OX} ${OY}`,
    `C ${r.k1} ${OY + r.bowT}, ${r.k2} ${top + r.bowT * 0.5}, ${EX} ${top}`,
    `L ${EX} ${bot}`,
    `C ${r.k2} ${bot + r.bowB * 0.5}, ${r.k1} ${OY + r.bowB}, ${OX} ${OY}`,
    "Z",
  ].join(" ");
}

export default function RibbonDelta() {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;

    /*
     * Reduced motion keeps the delta exactly as drawn. It is a composition
     * that works standing still, so there is nothing to substitute.
     */
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      /*
       * The two sheets drift against each other, and the transform is on the
       * *filtered group*, never on a path inside it.
       *
       * That distinction is the whole performance story here. A blur is a
       * filter, and a filter over a subtree has to be recomputed whenever
       * anything inside that subtree changes — so animating each ribbon
       * individually, as this did before the blur existed, would re-run a
       * 40-unit Gaussian over the full hero on every frame for the life of the
       * page. Transforming the filtered element itself instead lets the
       * browser filter once and then composite the result, which is the same
       * cost as moving an image.
       *
       * The price is that ribbons within a sheet can no longer move
       * independently. Splitting them across two sheets on different periods
       * buys most of that back: the fan still shifts and re-layers, it just
       * does it in two parts rather than seven.
       */
      GROUPS.forEach((group) => {
        gsap.fromTo(
          `[data-sheet="${group.key}"]`,
          { rotation: -group.sweep / 2 },
          {
            rotation: group.sweep / 2,
            svgOrigin: `${OX} ${OY}`,
            duration: group.secs,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          },
        );
      });

      gsap.fromTo(
        "[data-source]",
        { scale: 0.92, opacity: 0.7 },
        {
          scale: 1.08,
          opacity: 1,
          transformOrigin: "50% 50%",
          duration: 7.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        },
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} aria-hidden className="absolute inset-0 overflow-hidden">
      {/*
        The wrapper places the *origin* — the left edge, vertically centred —
        rather than the graphic's middle. That is the point the composition is
        built around, so it is the point worth pinning.

        Sized by its *width* — the source just inside the left edge, the far
        end running off the right — with the height following from the aspect
        ratio. The delta crosses the whole masthead: a point where it starts,
        widest where it leaves the frame.

        Its centre line sits low, at 72%, which is what leaves the top-left
        clear for the type. The two decisions are one decision: a fan that
        spans the full width has no clear right-hand side to put a headline in,
        so the only space left is above the narrow end.

        The source sits at 6% rather than hard against the edge. Its glow has a
        radius of its own, and at 2% half of it was cut off by the section —
        the one part of the drawing that is supposed to read as a point looked
        like it had been trimmed. Every
        other backdrop in this project was sized from the hero's height,
        because a viewport-tall hero has a stable height and a width that
        varies fivefold. This one is the exception: what has to fit here is the
        horizontal run in which the ribbons open, and if that is wrong the fan
        is cut off mid-sweep no matter how tall the graphic is. The height
        overflowing the hero is the intended result, not a side effect.

        Below `lg` the origin drops well past the bottom edge, so only the
        upper ribbons are in frame and the fan reads as sweeping up out of the
        foot of the hero. That is not a nicety: at that width the type is
        centred across the full column, and with the delta anywhere near the
        middle the headline sits directly on it — measured at 3.13:1 for the
        heading and 1.14:1 for the lead, both far under the floor. There is no
        scrim to fall back on here because this is the light masthead.
      */}
      <div
        className="absolute -right-[40%] left-[4%] top-[88%] -translate-y-1/2 lg:-right-[4%] lg:left-[6%] lg:top-[72%]"
        style={{ aspectRatio: `${VIEW.w} / ${VIEW.h}` }}
      >
        <svg
          viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
          className="absolute inset-0 h-full w-full overflow-visible"
        >
          <defs>
            <radialGradient id="delta-source">
              <stop
                offset="0"
                stopColor={AMBER}
                style={{ stopColor: tintColour(6) }}
                stopOpacity="0.92"
              />
              <stop offset="0.4" stopColor={AMBER} stopOpacity="0.42" />
              <stop offset="1" stopColor={ORANGE} stopOpacity="0" />
            </radialGradient>

            {/*
              One gradient per ribbon, laid along its own length in user space:
              a light tint where it leaves the source, its base colour where it
              runs off the edge, and falling alpha the whole way.

              This is what turns a flat wedge into aurora. A single flat fill
              gives every ribbon one value from end to end, so the fan reads as
              cut paper however much it is blurred — the softness has to be in
              the colour as well as the edge.

              The alpha falls, but only to 0.66. A first pass took it to 0.34
              and the ribbons dissolved exactly where they are widest, which
              inverts the whole idea: the fan is meant to gain presence as it
              spreads, not lose it.
            */}
            {RIBBONS.map((r, i) => (
              <linearGradient
                key={i}
                id={`delta-r${i}`}
                gradientUnits="userSpaceOnUse"
                x1={OX}
                y1={OY}
                x2={EX}
                y2={r.ec}
              >
                <stop
                  offset="0"
                  stopColor={fallbackColour(i)}
                  style={{ stopColor: tintColour(i) }}
                  stopOpacity="0.8"
                />
                <stop
                  offset="0.45"
                  stopColor={fallbackColour(i)}
                  style={{ stopColor: rampColour(i) }}
                  stopOpacity="0.7"
                />
                <stop
                  offset="1"
                  stopColor={fallbackColour(i)}
                  style={{ stopColor: rampColour(i) }}
                  stopOpacity="0.58"
                />
              </linearGradient>
            ))}

            {GROUPS.map((g) => (
              /*
                A generous filter region. The default is -10%/120% of the
                bounding box, which on a blur this size crops the glow into a
                straight edge exactly where it should be softest.
              */
              <filter
                key={g.key}
                id={`delta-blur-${g.key}`}
                x="-35%"
                y="-35%"
                width="170%"
                height="170%"
              >
                <feGaussianBlur stdDeviation={g.blur} />
              </filter>
            ))}
          </defs>

          {/*
            Two sheets, the softer one behind. Splitting alternate ribbons
            across the pair is what lets them drift apart and re-layer; keeping
            each sheet's blur on the group rather than on its paths is what
            makes that affordable.

            The heavier blur goes on the sheet holding the outer ribbons and
            the lighter one on the inner sheet, so the fan dissolves toward its
            edges while the convergence at the source stays a point rather than
            a smudge — blur the middle equally hard and the one piece of the
            drawing that has to stay sharp is the first thing lost.
          */}
          {GROUPS.map((g) => (
            <g
              key={g.key}
              data-sheet={g.key}
              filter={`url(#delta-blur-${g.key})`}
              opacity={g.opacity}
            >
              {g.indices.map((i) => (
                <path key={i} data-ribbon d={path(RIBBONS[i])} fill={`url(#delta-r${i})`} />
              ))}
            </g>
          ))}

          {/*
            The source, and the only thing outside the blurred groups — it is
            what the convergence is converging on, so it keeps its own edge.
          */}
          <ellipse
            data-source
            cx={OX}
            cy={OY}
            rx="46"
            ry="40"
            fill="url(#delta-source)"
          />
        </svg>
      </div>
    </div>
  );
}
