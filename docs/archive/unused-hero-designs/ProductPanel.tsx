"use client";

import Image from "next/image";
import { withBasePath } from "@/lib/basePath";
import IsoBadge from "./IsoBadge";

/**
 * The hero's subject: a rotating globe carrying two marks on opposite faces —
 * the Arrow HR & Payroll mark and the ISO 9001 certification badge.
 *
 * Replaces the earlier static composition (a single mark inside a hairline
 * ring). The sphere is built from its own layers rather than the shared
 * `.globe-body` / `.globe-glow` the Products ring uses — see the material
 * note in globals.css for what each layer does and why this one does not
 * share. It carries no wireframe grid: latitude and meridian lines are what
 * make a sphere read as a clip-art globe icon, and the marks orbiting the
 * surface show the rotation more clearly than the lines did.
 *
 * `data-l="panel-outer"` is load-bearing and must not be renamed:
 * hero-timeline.ts arrives it at 2.856s, parallaxes it through the scrub, and
 * births the Stats aperture from its bounding box at progress 0.42-0.46.
 *
 * ── Why no `translateZ` ──
 * The two faces sit at the same z (0), each rotated 180deg from the other,
 * both spinning together with the sphere on one `rotateY` animation. That is
 * the classic double-sided flip card, run continuously instead of discrete —
 * `backface-visibility: hidden` means only one face is ever front-on at a
 * time, and because both occupy the same box there is no radius to compute
 * per breakpoint. A real globe would map each mark onto a curved surface;
 * this is deliberately the simpler read — a badge stamped on each side of a
 * turning sphere — and it holds up because the emboss treatment (blend mode
 * + drop-shadow) sells "surface," not the geometry.
 */

const PAYROLL_MARK = withBasePath("/logos/payroll.png");

export default function ProductPanel() {
  return (
    <div
      data-l="panel-outer"
      /* `hero-globe-frame` declares the container the marks' orbit radius is
         measured against — see the note on `--globe-r` in globals.css. It
         belongs out here, outside the 3D chain. */
      className="hero-globe-frame relative mx-auto aspect-square w-[min(440px,86%)]"
    >
      <div
        data-l="panel-breath"
        className="hero-globe-stage absolute inset-0"
        style={{ animation: "card-float 9s ease-in-out infinite" }}
      >
        {/* Grounds the sphere — see the comment on `.hero-globe-shadow`. */}
        <span aria-hidden className="hero-globe-shadow" />

        {/* ── The sphere ──
               Layer order is the material, bottom to top: light thrown
               outward, the body, the fresnel rim, dither, then the hot spot
               and the glass sweep over everything. See globals.css. */}
        <div className="hero-globe absolute inset-0">
          <span aria-hidden className="hero-globe-halo" />
          <span aria-hidden className="hero-globe-body" />
          <span aria-hidden className="hero-globe-rim" />
          <span aria-hidden className="hero-globe-grain" />
          <span aria-hidden className="hero-globe-specular" />
          <span aria-hidden className="hero-globe-sheen" />

          {/* ── The two faces, spinning together — the sphere itself
                 does not turn with them; see the comment on `.hero-globe`
                 in globals.css for why. ── */}
          <div className="hero-globe-spin">
            {/* ── Front: Arrow HR & Payroll ──
                `.hero-globe-plate` gives the mark a struck-medallion bezel —
                a fine ring plus an inset shadow — instead of the flat image
                floating in front of the sphere on its own. */}
            <div className="hero-globe-face hero-globe-face--front">
              {/* 42%, not the 50% this was at z = 0: the orbit carries the
                  mark 0.8 R toward the viewer, and the perspective renders it
                  ~17% larger head-on. This lands it back at the size it read
                  at before. */}
              <div className="hero-globe-plate h-[42%] w-[42%]">
                <Image
                  src={PAYROLL_MARK}
                  alt="Arrow HR &amp; Payroll"
                  width={500}
                  height={403}
                  sizes="(max-width: 1023px) 26vw, 220px"
                  priority
                  className="hero-emboss h-[64%] w-[64%] object-contain"
                />
              </div>
            </div>

            {/* ── Back: ISO 9001 ──
                Drawn, not sourced — see IsoBadge. It is opaque rather than
                blended into the sphere like the Q: a seal is an applied mark,
                and the ivory face is what makes it legible against the
                orange. The bezel's gold rings frame it. */}
            <div className="hero-globe-face hero-globe-face--back">
              <div className="hero-globe-plate h-[48%] w-[48%]">
                <IsoBadge className="hero-globe-seal h-full w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
