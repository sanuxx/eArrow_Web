"use client";

/**
 * The Customer Success masthead: a field of signals resolving from noise into
 * order, left to right.
 *
 * It is the page's own sentence drawn rather than written. Every case study
 * here is the same shape — scattered manual process on one side, one connected
 * system on the other — so the backdrop runs that transition across the full
 * width of the frame and lets the headline sit inside it.
 *
 * ── How the resolve is drawn ──
 * Each line is one path. Its left end carries vertical displacement that
 * decays to nothing by the time it reaches the right, so the same stroke is
 * both the noise and the order — there is no crossfade between two states and
 * nothing to keep in sync. The stroke is painted with a horizontal gradient
 * that runs from near-invisible grey at the left edge to brand orange at the
 * right, so colour tells the same story as geometry.
 *
 * ── Determinism ──
 * The displacements come from a hash of the line index, not `Math.random()`,
 * and every emitted number is rounded to two places. Both halves matter: a
 * random field renders differently on the server and the client, and raw
 * floats can serialise with different precision on each side. Either one is a
 * hydration mismatch, and this project has produced both before.
 */

const LINES = 15;
const VB_W = 1440;
const VB_H = 900;

/** Deterministic hash in [-1, 1], stable across server and client. */
function wobble(seed: number) {
  const v = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return Math.round((v - Math.floor(v) - 0.5) * 200) / 100;
}

/**
 * One signal. It starts off the left edge displaced and arrives dead straight
 * at its own latitude — the amplitude is scaled down at each control point, so
 * the settling is progressive rather than a sudden snap at one x.
 */
function signalPath(i: number) {
  const y = Math.round(((i + 0.5) * (VB_H / LINES)) * 100) / 100;
  /*
   * Amplitude has to exceed the gap between latitudes or the lines never
   * actually cross, and lines that merely ripple in their own lanes read as a
   * texture rather than as disorder. At 60 units against a 60-unit spacing
   * they interleave; alternating the sign guarantees neighbours travel in
   * opposite directions, which is what produces the crossings.
   */
  const amp = 92 * (i % 2 === 0 ? 1 : -1);
  const a = (n: number, scale: number) =>
    Math.round((y + wobble(i * 7 + n) * amp * scale) * 100) / 100;

  return [
    `M -120,${a(1, 1)}`,
    `C 90,${a(2, 0.95)} 210,${a(3, 0.85)} 380,${a(4, 0.7)}`,
    `C 540,${a(5, 0.5)} 640,${a(6, 0.28)} 820,${a(7, 0.1)}`,
    `C 940,${y} 1010,${y} 1120,${y}`,
    `L ${VB_W + 120},${y}`,
  ].join(" ");
}

export default function SignalWeave() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          {/*
            Noise to order, in colour. The left two-thirds stay barely present
            so the chaotic ends read as interference rather than as drawing;
            the orange only arrives once the lines are already straight.
          */}
          <linearGradient id="weave-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="28%" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="58%" stopColor="var(--color-amber)" stopOpacity="0.3" />
            <stop offset="78%" stopColor="var(--color-orange)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--color-amber)" stopOpacity="0.8" />
          </linearGradient>

          {/*
            The headline sits on the left of this frame, so the field is faded
            back exactly where the type lands. Doing it with a mask rather than
            by lowering every stroke's opacity keeps the resolved right-hand
            side at full strength, which is the half worth looking at.
          */}
          <linearGradient id="weave-fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="42%" stopColor="#fff" stopOpacity="0.72" />
            <stop offset="72%" stopColor="#fff" stopOpacity="1" />
            <stop offset="100%" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          <mask id="weave-mask">
            <rect width={VB_W} height={VB_H} fill="url(#weave-fade)" />
          </mask>
        </defs>

        <g mask="url(#weave-mask)">
          {Array.from({ length: LINES }, (_, i) => (
            <path
              key={i}
              className="weave-line"
              d={signalPath(i)}
              stroke="url(#weave-stroke)"
              strokeWidth={i % 4 === 0 ? 1.6 : 1}
              /* Negative delays so every line is already mid-drift on the
                 first frame — otherwise the whole field starts in lockstep and
                 the eye reads fifteen lines moving as one object. */
              style={{ animationDelay: `${-i * 1.7}s` }}
            />
          ))}

          {/* The node each resolved signal arrives at. */}
          {Array.from({ length: LINES }, (_, i) => {
            const y = Math.round(((i + 0.5) * (VB_H / LINES)) * 100) / 100;
            return (
              <circle
                key={`n-${i}`}
                className="weave-node"
                cx={1268}
                cy={y}
                r={i % 4 === 0 ? 3.4 : 2.2}
                fill="var(--color-amber)"
                style={{ animationDelay: `${-i * 0.55}s` }}
              />
            );
          })}
        </g>
      </svg>

      {/* Warmth behind the resolved side, so the right of the frame reads as
          lit rather than merely more orange. */}
      <div
        className="absolute -right-[10%] top-1/2 h-[820px] w-[820px] -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(var(--orange-ch), 0.3), rgba(var(--amber-ch), 0.1) 45%, transparent 70%)",
        }}
      />
    </div>
  );
}
