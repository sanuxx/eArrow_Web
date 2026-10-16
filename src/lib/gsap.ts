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
/** Frame rate cap for all GSAP-driven animation. Change here to retune the site. */
export const ANIMATION_FPS = 30;

/**
 * Frame rate for endless decorative loops (`repeat: -1`): drifting clouds and
 * glows, breathing lights, shimmer sweeps. They are slow, ambient and never the
 * thing being looked at, so they advance at half the rate of everything else.
 * Applied automatically to every endless GSAP loop — see `slowLoop` below.
 */
export const AMBIENT_FPS = 15;

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  // Mobile browsers fire resize when the URL bar shows/hides, which would
  // otherwise refresh every ScrollTrigger mid-scroll and jump the page.
  ScrollTrigger.config({ ignoreMobileResize: true });

  // Every GSAP animation (hero scrub, timelines, reveals, ambient loops) ticks
  // at 30fps instead of the display rate: half the main-thread and paint work.
  // Scrolling itself is NOT capped — Lenis runs on its own frame loop (see
  // SmoothScrollProvider), so the page still follows the wheel at full rate.
  gsap.ticker.fps(ANIMATION_FPS);

  pauseEndlessLoopsOffscreen();
  // CSS can hold its decorative loops on budget devices too (globals.css)
  document.documentElement.classList.toggle("low-power", isLowPower());
}

/**
 * Endless loops (`repeat: -1`) only run while their part of the page is on
 * screen.
 *
 * The site has a few dozen ambient loops — drifting glows, marquees, breathing
 * lights — and every one of them, on screen or not, costs a style write, a
 * layer update and a composite each frame. On a low-end phone that alone kept
 * the main thread busy while the page sat idle. Rather than wire visibility
 * into every component, the three GSAP entry points that create loops are
 * wrapped once here: a loop's targets are mapped to their scope (the nearest
 * `[data-loop-scope]`, else the enclosing section/header/footer), one shared
 * IntersectionObserver watches those scopes, and the loop is paused while all
 * of them are off screen. Only loops this code paused are resumed by it, so a
 * component that pauses its own loop keeps control of it. Loops created
 * `paused: true` are left alone entirely.
 */
function pauseEndlessLoopsOffscreen() {
  type Anim = gsap.core.Animation;
  const scopeOf = (el: Element) => el.closest("[data-loop-scope]") ?? el.closest("section, header, footer") ?? el;
  const loopsByScope = new Map<Element, Set<Anim>>();
  const scopesByLoop = new WeakMap<Anim, Element[]>();
  const shown = new WeakMap<Element, boolean>();
  const pausedHere = new WeakSet<Anim>();

  /* Endless loops run at AMBIENT_FPS rather than the ticker's rate. GSAP's
     ticker is global, so a loop is held paused from GSAP's point of view and
     stepped by hand from one shared tick instead. `held` is what a component
     asked for through `loop.paused()` (that method is routed here so each
     component keeps control of its own loop); `on` is whether any of its
     scopes is on screen. It only advances while it is on screen and not held. */
  const slowLoops = new WeakMap<Anim, { on: boolean; held: boolean }>();
  const STEP_MS = 1000 / AMBIENT_FPS;
  const slowLoop = (loop: Anim, startHeld: boolean) => {
    const st = { on: true, held: startHeld };
    slowLoops.set(loop, st);
    loop.paused(true);
    (loop as unknown as { paused: (v?: boolean) => unknown }).paused = (v?: boolean) => {
      if (v === undefined) return st.held;
      st.held = v;
      return loop;
    };
    let acc = 0;
    const tick = (_time: number, deltaMs: number) => {
      if (!loop.parent) return void gsap.ticker.remove(tick); // killed or reverted
      acc += deltaMs;
      // a little under one step: ticks arrive at 30fps, so 2 ticks = 66ms must fire
      if (acc < STEP_MS - 8) return;
      const dt = acc / 1000;
      acc = 0;
      if (st.held || !st.on) return;
      loop.totalTime(loop.totalTime() + dt, false);
    };
    gsap.ticker.add(tick);
  };

  const apply = (loop: Anim) => {
    const scopes = scopesByLoop.get(loop);
    if (!scopes) return;
    const on = scopes.some((s) => shown.get(s) !== false);
    const slow = slowLoops.get(loop);
    if (slow) {
      slow.on = on;
      return;
    }
    if (!on && !loop.paused()) {
      loop.paused(true);
      pausedHere.add(loop);
    } else if (on && pausedHere.has(loop)) {
      pausedHere.delete(loop);
      loop.paused(false);
    }
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.target.isConnected) {
          io.unobserve(e.target);
          loopsByScope.delete(e.target);
          continue;
        }
        shown.set(e.target, e.isIntersecting);
        loopsByScope.get(e.target)?.forEach(apply);
      }
    },
    { rootMargin: "150px 0px" },
  );

  const targetsOf = (loop: Anim): unknown[] =>
    "getChildren" in loop
      ? (loop as gsap.core.Timeline).getChildren(true, true, false).flatMap((c) => (c as gsap.core.Tween).targets())
      : (loop as gsap.core.Tween).targets();

  const watch = (loop: Anim) => {
    const scopes = [...new Set(targetsOf(loop).filter((t): t is Element => t instanceof Element).map(scopeOf))];
    if (!scopes.length) return;
    scopesByLoop.set(loop, scopes);
    for (const s of scopes) {
      let set = loopsByScope.get(s);
      if (!set) {
        set = new Set();
        loopsByScope.set(s, set);
        io.observe(s);
      }
      set.add(loop);
    }
    apply(loop);
  };

  type Vars = gsap.TweenVars | gsap.TimelineVars | undefined;
  const endless = (v: Vars) => !!v && v.repeat === -1;
  /* On a budget device the ambient loops do not run at all: they hold their
     first frame, which every loop here is designed to look right in. Loops a
     component creates paused are its own to run, so those are left still. */
  const still = isLowPower();
  const watchOrHold = (t: Anim, v: Vars) => {
    if (still) {
      if (!v?.paused) t.progress(0).pause();
      return;
    }
    slowLoop(t, !!v?.paused);
    watch(t);
  };
  const g = gsap as unknown as Record<string, (...a: unknown[]) => Anim>;
  const to = g.to.bind(gsap);
  const fromTo = g.fromTo.bind(gsap);
  const timeline = g.timeline.bind(gsap);
  g.to = (targets, vars) => {
    const t = to(targets, vars);
    if (endless(vars as Vars)) watchOrHold(t, vars as Vars);
    return t;
  };
  g.fromTo = (targets, from, vars) => {
    const t = fromTo(targets, from, vars);
    if (endless(vars as Vars)) watchOrHold(t, vars as Vars);
    return t;
  };
  g.timeline = (vars) => {
    const t = timeline(vars);
    // a timeline's children are added after it is created
    if (endless(vars as Vars)) setTimeout(() => watchOrHold(t, vars as Vars), 0);
    return t;
  };
}

/**
 * A device that should be spared optional effects: few cores or little memory
 * (typical of budget phones), or the user asked to save data. Components use
 * it to drop decorative extras — never content.
 */
export function isLowPower() {
  if (typeof navigator === "undefined") return false;
  const n = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return (n.hardwareConcurrency ?? 8) <= 4 || (n.deviceMemory ?? 8) <= 4 || !!n.connection?.saveData;
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
