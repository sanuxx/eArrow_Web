"use client";

import { motion } from "framer-motion";
import { PRODUCT_MARKS } from "./ProductMarks";
import { QMarkLight } from "./ArrowMark";

/**
 * The product ring.
 *
 * A glowing globe carrying the Q, with the seven platforms orbiting it — each
 * card counter-rotated so it always faces the viewer while it travels. The
 * near cards are large and sharp, the far ones small and hazy; that is
 * perspective and a phase-locked filter, not a hand-tuned z-index.
 *
 * The globe is the centre the ring was previously missing. With the Q as one
 * of eight cards it was just the brightest tile in a circle of tiles; at the
 * centre it is the thing the seven products are built on, which is the page's
 * actual claim.
 *
 * The animation is entirely CSS (see the `.ring-*` block in globals.css).
 * There is no rAF loop, no scroll listener and no React state, so eight cards
 * orbiting forever costs one compositor animation rather than a re-render a
 * frame — which matters because this sits in a page hero and never stops.
 *
 * The whole stage gets one framer-motion entrance. The cards do not get their
 * own: eight staggered fade-ups arriving inside a thing that is already moving
 * is two motions competing to introduce the same object.
 */

/*
 * Latitude rings, as [offset from the equator, projected half-width]. The
 * half-widths are the chord of a 48-unit circle at that height — the sphere's
 * own geometry, not eyeballed values, which is why they sit flush inside the
 * limb at every size.
 */
const LATITUDES: [number, number][] = [
  [-30, 37.5],
  [-16, 45.2],
  [0, 48],
  [16, 45.2],
  [30, 37.5],
];

export type RingItem = { key: string; label: string; href: string };

export default function ProductRing({
  items,
  fallback,
}: {
  items: RingItem[];
  /** Flat, static arrangement served to `prefers-reduced-motion` instead. */
  fallback: React.ReactNode;
}) {
  const step = 360 / items.length;

  /*
   * Phase lock. A card is nearest the viewer when the spin has carried its
   * slot angle back to zero, at progress `a / 360` through the cycle. The
   * depth keyframes start at "nearest", so the delay that puts progress 0 at
   * that moment is `(a / 360 - 1)` cycles — negative, so it applies from the
   * first frame instead of holding the card still for most of a lap.
   */
  const depthDelay = (angle: number) =>
    `calc((${angle / 360} - 1) * var(--ring-dur))`;

  /* Placed by margin rather than `translate(-50%,-50%)`: the offset has to
     leave the box centred on the ring's axis, which is also the transform
     origin — folding it into the transform would move that origin instead. */
  const slot = (angle: number): React.CSSProperties => ({
    width: "var(--ring-card)",
    height: "var(--ring-card)",
    marginLeft: "calc(var(--ring-card) / -2)",
    marginTop: "calc(var(--ring-card) / -2)",
    transform: `rotateY(${angle}deg) translateZ(var(--ring-r))`,
  });

  return (
    <div className="relative">
      <div className="ring-stage relative h-[330px] w-full sm:h-[370px] lg:h-[480px]">
        {/* orbit guides and a warm floor, flat and behind the 3D ring */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span className="absolute left-1/2 top-[56%] h-[34%] w-[104%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-border-strong" />
          <span className="absolute left-1/2 top-[56%] h-[24%] w-[76%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-dashed border-border" />
          <span
            className="absolute left-1/2 top-[60%] h-[22%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-[50%]"
            style={{
              background:
                "radial-gradient(closest-side, rgba(232,59,0,0.18), transparent)",
            }}
          />
        </div>
        {/*
          The entrance and the tilt are on two different elements on purpose.
          They were one, and framer's `scale` wrote `transform` inline over the
          stylesheet's `rotateX(-20deg)` — the ring rendered perfectly flat and
          the whole 3D effect was silently gone. One writer per property.
        */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="absolute inset-0"
        >
          <div className="ring-tilt absolute inset-0">
            {/* ── The globe ─────────────────────────────────────────────── */}
            <div className="ring-globe absolute left-1/2 top-1/2" aria-hidden>
              <span className="globe-glow" />
              <span className="globe-body" />

              <svg className="globe-grid" viewBox="0 0 100 100" fill="none">
                <g stroke="rgba(255, 232, 205, 0.34)" strokeWidth="0.7">
                  {/* Latitudes: fixed, because a sphere turning on a vertical
                      axis does not move them. */}
                  {LATITUDES.map(([dy, rx]) => (
                    <ellipse key={dy} cx="50" cy={50 + dy} rx={rx} ry="6.5" />
                  ))}

                </g>

                {/* The limb, a shade brighter than the grid inside it. */}
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  stroke="rgba(255, 236, 214, 0.5)"
                  strokeWidth="0.8"
                />
              </svg>

              {/* Meridians: three, a third of a turn apart. Each is its own svg
                  box and the box is what turns: a transform on an element
                  inside an svg repaints every frame, one on the box itself runs
                  on the compositor. */}
              {[0, 1, 2].map((i) => (
                <svg
                  key={i}
                  className="globe-grid globe-meridian"
                  viewBox="0 0 100 100"
                  fill="none"
                  style={{ animationDelay: `${(-14 / 3) * i}s` }}
                >
                  <ellipse cx="50" cy="50" rx="48" ry="48" stroke="rgba(255, 232, 205, 0.34)" strokeWidth="0.7" />
                </svg>
              ))}

              <QMarkLight className="absolute left-1/2 top-1/2 h-auto w-[38%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_2px_8px_rgba(120,24,0,0.55)]" />
            </div>

            <div className="ring-spin absolute inset-0">
              {/* ── The seven platforms ───────────────────────────────────── */}
              {items.map((item, i) => {
                const angle = step * i;
                const Mark = PRODUCT_MARKS[item.key];

                return (
                  <div
                    key={item.key}
                    className="ring-slot absolute left-1/2 top-1/2"
                    style={slot(angle)}
                  >
                    <div
                      className="ring-face h-full w-full"
                      style={{ "--a": `${angle}deg` } as React.CSSProperties}
                    >
                      {/* the card's fixed angle, kept out of the spin's keyframes */}
                      <div className="ring-offset h-full w-full">
                        <div
                          className="ring-depth h-full w-full"
                          style={{ animationDelay: depthDelay(angle) }}
                        >
                          <a
                            href={item.href}
                            className="surface-card group relative flex h-full w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-card px-1.5 shadow-[var(--shadow-lift)] transition-colors duration-300 hover:border-orange/45"
                          >
                            <span
                              aria-hidden
                              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                              style={{
                                background:
                                  "linear-gradient(to top, rgba(var(--orange-ch), 0.14), transparent 62%)",
                              }}
                            />

                            {Mark && (
                              <span className="relative flex h-[42%] w-[42%] items-center justify-center rounded-tile border border-border bg-surface-sunken transition-colors duration-300 group-hover:border-orange/30 group-hover:bg-white">
                                <Mark className="h-[55%] w-[55%] text-ink-muted transition-colors duration-300 group-hover:text-orange" />
                              </span>
                            )}

                            <span className="relative px-1 text-center text-[11px] font-semibold leading-tight text-ink transition-colors duration-300 group-hover:text-orange lg:text-[11.5px]">
                              {item.label}
                            </span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="ring-fallback">{fallback}</div>
    </div>
  );
}
