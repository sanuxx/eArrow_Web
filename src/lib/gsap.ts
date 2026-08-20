"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * The single place GSAP is registered.
 *
 * Every GSAP import in this codebase must come through this file, for two
 * reasons — one obvious, one not:
 *
 * 1. `registerPlugin` has to run exactly once. Calling it inside a component
 *    re-runs it on every remount.
 *
 * 2. Plugin *typing* depends on the bare `"gsap"` import below sitting in the
 *    same TS program. gsap's exports map resolves `gsap/ScrollTrigger`'s types
 *    to `gsap/types/ScrollTrigger.d.ts`, which does not exist — the real files
 *    are kebab-case (`scroll-trigger.d.ts`). The subpath import only
 *    type-checks because that file carries an ambient
 *    `declare module "gsap/ScrollTrigger"`, and that is pulled in by
 *    `types/index.d.ts`, which is loaded by the bare `"gsap"` import. A file
 *    importing a plugin subpath with no bare `"gsap"` anywhere in the program
 *    fails with a misleading "cannot find module or its corresponding type
 *    declarations". Do not "simplify" this file away.
 *
 * gsap 3.15 ships the whole former Club plugin set under the standard no-charge
 * licence (SplitText, DrawSVG, MorphSVG, ScrollSmoother, Flip, CustomEase are
 * all in `node_modules/gsap/`). We deliberately use only ScrollTrigger:
 *
 * - SplitText is unnecessary here. The headline is two known lines, so
 *   hand-authored mask spans are more predictable, survive SSR, and avoid
 *   SplitText rewriting innerHTML that React owns. It also sidesteps a real
 *   conflict — `background-clip: text` on line 2 clips the *parent's*
 *   background to its descendants' glyphs, so splitting that span into
 *   per-character boxes makes the gradient restart per character.
 * - ScrollSmoother would translate a `#smooth-content` wrapper inside a fixed
 *   ancestor, which breaks `body { display: flex }` and puts fifteen
 *   framer-motion IntersectionObservers on shifted geometry. Lenis writes real
 *   native scroll instead, so everything already on the page keeps working.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  // Mobile browsers fire resize when the URL bar shows/hides, which would
  // otherwise refresh every ScrollTrigger mid-scroll and jump the page.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

/**
 * GSAP writes inline styles from a rAF loop, so the global
 * `prefers-reduced-motion` block in globals.css — which only neutralises CSS
 * `animation-duration` and `transition-duration` — has no effect on it. Every
 * GSAP entry point needs this guard explicitly.
 */
export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export { gsap, ScrollTrigger };
