"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import Lenis from "lenis";
import { ScrollTrigger, isLowPower } from "@/lib/gsap";

/**
 * Lenis smooth scroll, on its own frame loop.
 *
 * Lenis is *not* transform-based — `lenis.mjs` does
 * `wrapper.scrollTo({ top, behavior: "instant" })` each frame, so it writes the
 * real native scroll position. `window.scrollY` stays truthful, native `scroll`
 * events keep firing, and IntersectionObserver keeps seeing real geometry.
 * Nav's `scrollY > 40` listener, its framer-motion `useScroll` progress bar and
 * every section's `whileInView` therefore keep working untouched.
 *
 * It used to be driven from `gsap.ticker` so scroll and ScrollTrigger shared a
 * clock. That ticker is now capped at `ANIMATION_FPS` (lib/gsap.ts) so the
 * site's animation runs at 30fps, and tying the scroll to it would have capped
 * the scrolling too. So Lenis runs its own loop (full display rate) and tells
 * ScrollTrigger about every new position via `ScrollTrigger.update` below.
 *
 * Deliberately hand-rolled rather than using `ReactLenis`: that wrapper's
 * deprecated `autoRaf` prop defaults to `true` and is applied as
 * `options?.autoRaf ?? autoRaf`, so the internal rAF silently comes back and
 * you end up with two loops.
 */

/**
 * The context carries a stable ref box rather than the instance itself, and
 * that is deliberate on two counts.
 *
 * React runs child effects before parent effects, so a consumer's effect always
 * mounts before this provider has created Lenis. Publishing the instance through
 * state would therefore hand every consumer `null` on the first pass and then
 * re-run their effects when it arrived — which, for HeroAct, means tearing down
 * and rebuilding every ScrollTrigger one tick after setting them up. A ref box
 * is stable from the first render, so consumers read `.current` at the moment
 * they actually need it (inside a handler, or a frame later) and never re-run.
 * It also sidesteps the cascading-render that `setState` in an effect causes.
 */
type LenisRef = { current: Lenis | null };

const LenisContext = createContext<LenisRef>({ current: null });

/**
 * A stable box holding the live Lenis instance, or `.current === null` under
 * reduced motion (where smooth scroll is itself motion and native scrolling is
 * the correct fallback).
 *
 * Callers that need to lock scrolling must use `lenis.current?.stop()` —
 * setting `document.body.style.overflow` does *not* stop Lenis, which reads
 * wheel and touch events off `window` and writes the scroll position regardless.
 */
export function useSmoothScroll() {
  return useContext(LenisContext);
}

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Touch scrolling is already smooth natively, and Lenis would keep a rAF
    // loop alive on every frame for nothing; budget devices skip it too.
    if (window.matchMedia("(pointer: coarse)").matches || isLowPower()) return;

    const instance = new Lenis({
      // Lenis runs its own frame loop rather than gsap.ticker: that ticker is
      // capped at ANIMATION_FPS (lib/gsap.ts), and scrolling should still follow
      // the wheel at the display's full rate.
      autoRaf: true,
      lerp: 0.1,
      // Restores hash-link smoothness now that `scroll-behavior: smooth` is
      // gone from globals.css. The offset clears the fixed nav.
      anchors: { offset: -96 },
      autoToggle: true,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
    });

    // Belt-and-braces: ScrollTrigger has its own native scroll listener, and
    // `update` is idempotent, but this guarantees it reads the new value in the
    // same frame Lenis wrote it rather than one frame later.
    instance.on("scroll", ScrollTrigger.update);

    lenisRef.current = instance;

    return () => {
      instance.destroy();
      lenisRef.current = null;
    };
  }, []);

  // No wrapper element: body is `display: flex` and an extra div would become
  // the flex item, breaking the main/Footer layout.
  return (
    <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>
  );
}
