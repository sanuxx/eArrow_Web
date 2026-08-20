"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Lenis smooth scroll, driven by GSAP's ticker.
 *
 * Two things make this safe to drop under an existing framer-motion site.
 *
 * First, Lenis is *not* transform-based — `lenis.mjs` does
 * `wrapper.scrollTo({ top, behavior: "instant" })` each frame, so it writes the
 * real native scroll position. `window.scrollY` stays truthful, native `scroll`
 * events keep firing, and IntersectionObserver keeps seeing real geometry.
 * Nav's `scrollY > 40` listener, its framer-motion `useScroll` progress bar and
 * every section's `whileInView` therefore keep working untouched.
 *
 * Second, one clock. Lenis on its own rAF loop updates scroll *after*
 * ScrollTrigger has already read it, so every scrubbed animation lags a frame.
 * Driving `lenis.raf` from `gsap.ticker` puts both on the same clock, and
 * `lagSmoothing(0)` stops GSAP from swallowing time after a long frame, which
 * would desync the two again.
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

    const instance = new Lenis({
      autoRaf: false, // we drive it from gsap.ticker below
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

    // gsap.ticker reports seconds; lenis.raf expects milliseconds.
    const raf = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    lenisRef.current = instance;

    return () => {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33); // GSAP's documented default
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
