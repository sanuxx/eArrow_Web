"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useSmoothScroll } from "../SmoothScrollProvider";
import LightSweep from "../LightSweep";
import HeroPlate from "./HeroPlate";
import StatsPlane from "./StatsPlane";
import { curtainActive, onCurtainLift } from "../brand-curtain";
import {
  buildCalmIntro,
  buildIntro,
  buildScrub,
  phaseFor,
  type HeroRefs,
} from "./hero-timeline";

/**
 * The hero act: a cinematic on-load reveal that hands off to a scroll-scrubbed
 * sequence, with the Stats section composed *inside* it so the aperture opens
 * onto real content rather than a copy of it.
 *
 * Pinned with CSS `position: sticky`, not ScrollTrigger's `pin` — see the
 * `.hero-track` block in globals.css for why (`main` is `display: flex`, and
 * ScrollTrigger silently drops `pinSpacing` in that case). Sticky also means the
 * page height comes from CSS, so a restored scroll position is correct on the
 * first paint with no refresh race.
 */

type IntroState = "pending" | "playing" | "skipped" | "done";

export default function HeroAct() {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const irisRef = useRef<HTMLDivElement>(null);
  const lenisRef = useSmoothScroll();

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const plate = plateRef.current;
    const iris = irisRef.current;
    if (!track || !stage || !plate || !iris) return;

    const refs: HeroRefs = { root: track, stage, plate, iris };

    /*
     * `gsap.matchMedia` rather than hand-rolled matchMedia listeners: it reverts
     * every tween created inside a branch when that branch stops matching —
     * including a live OS reduced-motion toggle — and re-runs whichever branch
     * now applies. Reduced motion gets its own branch at the bottom of this
     * effect rather than getting nothing: see `buildCalmIntro`.
     */
    const mm = gsap.matchMedia();

    /** Shared by both motion branches: the intro plus its gate. */
    const startIntro = () => {
      /*
       * Building the timeline applies every `.from()` start state immediately,
       * so the composition is now held by GSAP rather than by CSS. Releasing
       * the pre-paint hold on the very next line hands over with no gap — one
       * frame where both hold it is invisible, one where neither does is a
       * flash of the finished hero.
       */
      /*
       * When the brand curtain is running, it owns the logo and the hero opens
       * on its own composition instead — otherwise the mark resolves on black,
       * dissolves, and immediately resolves again inside the hero at 40% the
       * size, which reads as a stutter rather than as emphasis.
       */
      const curtain = curtainActive();
      const intro = buildIntro(refs, { brand: !curtain });
      document.documentElement.removeAttribute("data-intro-pending");
      let state: IntroState = "pending";

      /*
       * The reveal is not a once-per-visit flourish: it plays on every load.
       *
       * The bar is opening anywhere other than the top of the document, where
       * the hero is already scrubbed past and an intro would fight the scroll
       * timeline. Two things make that rare: layout.tsx sets
       * `history.scrollRestoration = "manual"`, so a reload no longer arrives
       * mid-page, and a hash deep-link sets its own position.
       *
       * The answer is read from the flag layout.tsx recorded before first
       * paint, not measured here. This effect does not run until hydration
       * completes — seconds, on a cold dev load — and checking live meant any
       * scroll during that wait counted as "the visitor is already down the
       * page" and cancelled the reveal before it ever appeared. The live check
       * survives only as the fallback for the case where the flag is missing.
       */
      const eligible = (window as Window & { __earrowIntroEligible?: boolean })
        .__earrowIntroEligible;
      const canPlay =
        eligible ?? (window.scrollY === 0 && !window.location.hash);

      const settle = (next: "skipped" | "done") => {
        if (state === "skipped" || state === "done") return;
        state = next;
        track.dataset.intro = next;
        lenisRef.current?.start();

        /*
         * Release the headline masks. They exist so the intro can slide each
         * line up from behind its own baseline, but they are `overflow: hidden`
         * — and the scrub then lifts the same lines 120-150px, so they were
         * being sliced in half on the way out. The mask has done its job by
         * now; from here the type has to be free to leave the frame.
         */
        gsap.set(track.querySelectorAll("[data-l='line-mask']"), {
          overflow: "visible",
        });
      };

      /*
       * Skip on any intent to move. Lenis is stopped during the intro so it
       * emits no scroll events — listening for `scroll` would never fire. The
       * intro accelerates to its end rather than cutting, so a visitor who
       * scrolls immediately still sees the gesture, just faster.
       */
      const skip = () => {
        if (state !== "playing") return;
        gsap.to(intro, { progress: 1, duration: 0.35, ease: "power2.in", overwrite: true });
        settle("skipped");
      };

      const KEYS = new Set([
        " ",
        "ArrowDown",
        "ArrowUp",
        "PageDown",
        "PageUp",
        "Home",
        "End",
      ]);

      const onKey = (e: KeyboardEvent) => {
        if (!KEYS.has(e.key)) return;
        // Suppress the native scroll the key would cause, then bail out.
        if (state === "playing") e.preventDefault();
        skip();
      };

      const listeners: Array<[string, EventListener, AddEventListenerOptions?]> = [
        ["wheel", skip as EventListener, { once: true, passive: true }],
        ["touchmove", skip as EventListener, { once: true, passive: true }],
        ["pointerdown", skip as EventListener, { once: true, passive: true }],
        ["keydown", onKey as EventListener, {}],
      ];

      if (!canPlay) {
        // Landed mid-page or on a hash. Jump to the settled
        // frame and never scroll programmatically — forcing the page back to
        // the top fights the browser's own restoration and reads as a jump.
        intro.progress(1).pause();
        settle("skipped");
        return () => intro.kill();
      }

      state = "playing";
      track.dataset.intro = "playing";
      listeners.forEach(([type, fn, opts]) => window.addEventListener(type, fn, opts));
      intro.eventCallback("onComplete", () => settle("done"));

      /*
       * Behind a curtain, the composition must not start until the black
       * begins to lift — otherwise it assembles unseen and is finished by the
       * time anyone can look at it. `onCurtainLift` fires as the lift *starts*,
       * not when it ends, so the hero resolves through the last of the fade and
       * the two read as one continuous shot.
       */
      const release = curtain ? onCurtainLift(() => intro.play()) : (intro.play(), () => {});

      /*
       * Deferred by one frame, not stylistic: React runs this (child) effect
       * before SmoothScrollProvider's (parent) effect, so Lenis does not exist
       * yet at this point in the mount. One frame later it does. The intro opens
       * on 420ms of held black anyway, so nothing is lost.
       */
      const lockFrame = requestAnimationFrame(() => {
        if (state === "playing") lenisRef.current?.stop();
      });

      return () => {
        cancelAnimationFrame(lockFrame);
        release();
        listeners.forEach(([type, fn]) => window.removeEventListener(type, fn));
        lenisRef.current?.start();
        intro.kill();
      };
    };

    /*
     * Marks the range where the hero is pinned and scrubbing, so Nav can drop
     * its backdrop-blur (see the note in Nav.tsx). Written only on change: this
     * runs on every scrubbed frame, and a redundant attribute write would
     * invalidate style on the whole document each time.
     */
    const setScrubFlag = (active: boolean) => {
      const next = active ? "1" : "0";
      if (document.documentElement.dataset.heroScrub !== next) {
        document.documentElement.dataset.heroScrub = next;
      }
    };

    /* ── Desktop: the full pinned, scrubbed showpiece ──────────────────── */
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      /*
       * The scrub timeline stays paused for its whole life — ScrollTrigger owns
       * it and drives `.progress()` directly. Do not "release" it when the intro
       * ends: an unpaused GSAP timeline plays itself, so it would run straight
       * to progress 1 on the first frame and every scroll assertion would read
       * the final state.
       *
       * It needs no gate anyway. The intro stops Lenis and suppresses the scroll
       * keys, so the page cannot move while it plays, which holds the scrub at 0
       * far more robustly than a flag would.
       */
      const scrub = buildScrub(refs);

      const st = ScrollTrigger.create({
        id: "hero",
        trigger: track,
        start: "top top",
        // Exactly the track's own travel: 280vh of height, 180vh of scroll.
        end: "bottom bottom",
        // `scrub: true`, not a number. Lenis already smooths the scroll input;
        // a numeric scrub adds a second lerp chasing a target that is itself
        // chasing a target, which feels mushy and detached.
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          stage.dataset.phase = phaseFor(self.progress);
          setScrubFlag(self.isActive);
        },
        // Also on toggle and refresh, so the flag is right at the boundaries and
        // after a resize — `onUpdate` alone does not fire once scrolling stops.
        onToggle: (self) => setScrubFlag(self.isActive),
        onRefresh: (self) => setScrubFlag(self.isActive),
        animation: scrub,
      });

      stage.dataset.phase = phaseFor(0);
      const teardown = startIntro();

      return () => {
        teardown?.();
        st.kill();
        scrub.kill();
        delete document.documentElement.dataset.heroScrub;
      };
    });

    /* ── Mobile: the intro travels, the pin does not ───────────────────────
       A 280vh sticky stage with a scrubbed composite is where iOS
       rubber-banding, smooth scroll and touch momentum turn into a bug report,
       and the hero's two columns cannot both fit a 100svh frame anyway. Keep
       the reveal, drop the pin, and do parallax only. */
    mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
      const parallax = gsap.timeline({ paused: true, defaults: { ease: "none" } });
      const q = gsap.utils.selector(track);

      parallax
        .to(q("[data-l='slab-a']"), { y: -110, duration: 1 }, 0)
        .to(q("[data-l='mark-outer']"), { y: -40, duration: 1 }, 0)
        .to(q("[data-l='grid']"), { opacity: 0, duration: 1 }, 0)
        .to(
          q("[data-l='chip'], [data-l='h1a'], [data-l='h1b'], [data-l='sub'], [data-l='cta']"),
          { y: -60, duration: 1 },
          0
        )
        .to(
          q("[data-l='chip'], [data-l='h1a'], [data-l='h1b'], [data-l='sub'], [data-l='cta']"),
          { opacity: 0.15, duration: 0.4 },
          0.6
        );

      const st = ScrollTrigger.create({
        id: "hero-mobile",
        trigger: plate,
        start: "top top",
        end: "bottom top",
        scrub: 0.6,
        animation: parallax,
      });

      // The counters still get to count, just off their own trigger.
      const counters = ScrollTrigger.create({
        trigger: iris,
        start: "top 80%",
        once: true,
        onEnter: () => {
          q("[data-count-to]").forEach((el) => {
            const target = Number(el.getAttribute("data-count-to") ?? 0);
            const proxy = { n: 0 };
            gsap.to(proxy, {
              n: target,
              duration: 1.6,
              ease: "power4.out",
              onUpdate: () => {
                el.textContent = String(Math.round(proxy.n));
              },
            });
          });
        },
      });

      const teardown = startIntro();

      return () => {
        teardown?.();
        st.kill();
        counters.kill();
        parallax.kill();
      };
    });

    /* ── Reduced motion: the same beat, without the movement ───────────────
       Not "no animation". The pre-paint hold in layout.tsx and the reveal are
       one mechanism, so returning nothing here means the hero is held and then
       simply switched on — and the visitor's report is that the site's opening
       is broken, not that it is restrained.

       Everything that could provoke is gone: no pin, no scrub, no scroll lock,
       no skip listeners (there is nothing to skip past — it is over in 1.2s and
       the page stays free the whole time), and no travel, scale or blur. What
       is left is a cross-fade, which is what reduced motion asks for. */
    mm.add("(prefers-reduced-motion: reduce)", () => {
      const calm = buildCalmIntro(refs);

      // Same hand-off as the full intro: the timeline's start state is applied
      // on build, so the CSS hold is released only once GSAP is holding it.
      document.documentElement.removeAttribute("data-intro-pending");

      const eligible = (window as Window & { __earrowIntroEligible?: boolean })
        .__earrowIntroEligible;
      const canPlay = eligible ?? (window.scrollY === 0 && !window.location.hash);

      if (canPlay) {
        track.dataset.intro = "playing";
        calm.eventCallback("onComplete", () => {
          track.dataset.intro = "done";
        });
        // Same deferral as the full path: the curtain's calm variant is still
        // an opaque screen, so fading in behind it would show nobody anything.
        const release = curtainActive()
          ? onCurtainLift(() => calm.play())
          : (calm.play(), () => {});
        return () => {
          release();
          calm.kill();
        };
      }

      calm.progress(1).pause();
      track.dataset.intro = "skipped";
      return () => calm.kill();
    });

    return () => {
      mm.revert();
    };
    // `lenisRef` is a stable ref box, so this effect runs exactly once. It must:
    // when Lenis was published through state instead, this dep changed on the
    // provider's first effect pass, tearing down and rebuilding every
    // ScrollTrigger — and, worse, re-entering the intro gate after the first
    // pass had already set the once-per-session flag, so the reveal was created,
    // played for a fraction of a frame, killed, and jumped to its end state on
    // every load.
  }, [lenisRef]);

  return (
    <section ref={trackRef} id="home" className="hero-track">
      <div ref={stageRef} className="hero-stage">
        {/*
          ── The hero composition ──
          The refs land on the real `.hero-plate` / `.hero-iris` elements rather
          than on wrapper divs. A wrapper would need `display: contents` on
          desktop to let the child position against the stage, and an element
          with `display: contents` generates no box — so GSAP's scale, opacity
          and blur on the plate would silently do nothing.
        */}
        <HeroPlate ref={plateRef} />

        {/*
          ── The intro layer ──
          The flare and the wordmark, above the composition and below the
          aperture. Both are intro-only, so their authored state is invisible and
          they sit outside the settled-frame contract; the flare is then reused
          at 0.44 as the flash the aperture opens out of, which is what links the
          brand reveal to the section transition as one gesture rather than two
          effects.
        */}
        {/*
          z-40 — above the aperture, not below it. The flare's second job is to
          cover the moment the aperture is born at the mark; underneath the
          Stats plane it covered nothing, and the aperture appeared as a white
          rectangle growing out of nowhere. It has fully decayed by progress
          0.66, before the metrics arrive at 0.66+, so it never veils the
          content it is handing over to.
        */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center overflow-hidden"
        >
          <div
            data-l="intro-flare"
            className="absolute left-1/2 top-[44%] aspect-square w-[min(1180px,150vw)] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              opacity: 0,
              background:
                "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,222,170,0.92) 30%, rgba(var(--orange-ch), 0.26) 58%, rgba(255,255,255,0) 78%)",
            }}
          />
          <div
            data-l="intro-wordmark"
            className="absolute left-1/2 top-[46%] w-[min(760px,78vw)] -translate-x-1/2 -translate-y-1/2"
            style={{ opacity: 0 }}
          >
            <div className="relative">
              {/*
                Declared at 1520x626, not Nav's 220x91. next/image builds its
                srcset from the declared width, so copying Nav's numbers would
                serve a ~220-440px asset into a 760px box — a 3.5x upscale on a
                2x display, on the one element the whole reveal racks *into*
                focus. The source is 4500x1854, so the resolution is there;
                only the declaration was throwing it away.
              */}
              <Image
                src="/earrow-logo-white.png"
                alt=""
                width={1520}
                height={626}
                sizes="(max-width: 1023px) 78vw, 760px"
                priority
                className="h-auto w-full"
                style={{ filter: "var(--logo-filter)" }}
              />
              <LightSweep mask="/earrow-logo-white.png" />
            </div>
          </div>
        </div>

        {/* ── The proof, revealed through the aperture ── */}
        <StatsPlane ref={irisRef} />
      </div>
    </section>
  );
}
