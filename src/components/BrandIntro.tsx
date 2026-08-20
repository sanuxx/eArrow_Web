"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { curtainActive, resetCurtain, signalCurtainLift } from "./brand-curtain";

/**
 * The brand curtain — the logo, alone on black, before the site.
 *
 * This is the client's own `eArrow Cinematic Reveal.html` prototype, rebuilt:
 * a held black frame, a bloom of warm light, the wordmark racking out of a
 * 9px blur into focus, four micro-scale breaths, then a push through the mark
 * as the curtain lifts. The prototype's proportions are kept; its 5s loop is
 * not. A looping demo can afford dead frames at either end — a site's front
 * door cannot, so the same beats are compressed into 2.5s.
 *
 * WHAT THIS COSTS, stated plainly because it is a real trade: an opaque
 * interstitial is the thing LCP punishes hardest. It is mitigated rather than
 * ignored — the curtain paints a single `priority` image on a flat colour, it
 * is out of the way in 2.5s, any input skips it instantly, and it never runs
 * for a visitor who arrived deep-linked or mid-page. But a site with a splash
 * will always measure slower than the same site without one. That is the deal
 * a brand reveal makes, and it is the client's call to make.
 *
 * ── The handoff ───────────────────────────────────────────────────────────
 * The hero's own intro opens with the same gesture (flare, then wordmark). Two
 * logo reveals back to back is not twice the impact, it is a stutter — so when
 * this curtain runs, the hero drops its brand beat and starts at the beat where
 * its composition assembles, timed to the lift. See `brand-curtain.ts` and the
 * `brand: false` path in `buildIntro`.
 */

/* Beat map, in seconds. Named because the lift and the hero's entrance are
   scheduled off the same numbers and must not drift apart. */
const T = {
  hold: 0.18,
  bloom: 0.3,
  rack: 0.42,
  breath: 1.34,
  push: 1.96,
  end: 2.5,
} as const;

/** The calm variant: a straight cross-fade, no blur, no scale, no bloom. */
const CALM = { in: 0.5, hold: 0.45, out: 0.5 } as const;

const NEVER_CHANGES = () => () => {};
const SERVER_FALSE = () => false;

export default function BrandIntro() {
  /*
   * Eligibility is a client-only fact, so it is read through
   * useSyncExternalStore rather than set from an effect: the server snapshot is
   * `false`, which means the rendered HTML never contains an opaque black
   * overlay — that markup is what a crawler and a JS-disabled visitor would
   * otherwise be served as the entire page. The subscribe function is a no-op
   * because the answer is fixed before first paint and never changes again.
   */
  const armed = useSyncExternalStore(NEVER_CHANGES, curtainActive, SERVER_FALSE);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    resetCurtain();
    /*
     * `curtainActive()` directly, NOT the `armed` value above.
     *
     * useSyncExternalStore serves the *server* snapshot on the hydration pass,
     * so `armed` is false for one commit even when a curtain is about to run.
     * Branching on it here released the hero the instant it mounted: measured,
     * the whole composition assembled and finished at 2.5s behind a curtain
     * that was still fully opaque until 3.3s, so the black lifted on a hero
     * that had already played. Inside an effect we are unambiguously on the
     * client, where the window flag is the truth.
     */
    if (!curtainActive()) signalCurtainLift();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!armed || !root) return;

    const q = gsap.utils.selector(root);
    const logo = q("[data-c='logo']");
    const bloom = q("[data-c='bloom']");
    const glow = q("[data-c='glow']");
    const reduced = prefersReducedMotion();

    /*
     * The scroll lock is deliberately NOT taken here. HeroAct already stops
     * Lenis for the whole length of its intro — which now includes the wait for
     * this curtain — and releases it in one place when the hero settles. Taking
     * it in both components meant this timeline's `start()` fired while the
     * hero was still assembling and handed scrolling back mid-sequence.
     *
     * The attribute is still published so anything that needs to know the
     * screen is covered can branch on it.
     */
    document.documentElement.setAttribute("data-curtain", "");

    /*
     * Take over the boot script's black (see `data-curtain-boot` in
     * globals.css). This element is opaque and covering the viewport right now,
     * so dropping the CSS layer underneath is invisible — and it has to happen
     * here rather than at the end, because that layer does not fade and would
     * otherwise be exactly what the curtain fades out to reveal.
     */
    document.documentElement.removeAttribute("data-curtain-boot");

    const done = () => {
      document.documentElement.removeAttribute("data-curtain");
      root.style.display = "none";
    };

    const tl = gsap.timeline({
      onComplete: done,
      // The lift is announced from inside the timeline, not from onComplete:
      // the hero must be assembling while the black is still fading, so the two
      // read as one shot rather than as a handover.
      onUpdate: () => {
        if (tl.time() >= (reduced ? CALM.in + CALM.hold : T.push)) signalCurtainLift();
      },
    });

    if (reduced) {
      /* Same introduction, no motion in it. The logo is presented and taken
         away; nothing racks, scales, blooms or travels. */
      tl.fromTo(logo, { opacity: 0 }, { opacity: 1, duration: CALM.in, ease: "power1.out" })
        .to({}, { duration: CALM.hold })
        .to(root, { opacity: 0, duration: CALM.out, ease: "power1.inOut" });
    } else {
      /* Beat 1 — BLOOM. The light arrives before the thing it lights, so the
         wordmark is lit rather than faded in. */
      tl.fromTo(
        bloom,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.12, ease: "none" },
        T.bloom
      );

      /* Beat 2 — THE RACK. 9px to 0 alongside 0.98 to 1 reads as a lens finding
         focus; a plain fade reads as CSS. The bloom burns off across the same
         window, so the light is spent exactly as the mark reaches sharpness. */
      tl.fromTo(
        logo,
        { opacity: 0, filter: "blur(9px)", scale: 0.98 },
        { opacity: 1, duration: 0.62, ease: "power2.out" },
        T.rack
      )
        .to(logo, { filter: "blur(0px)", duration: 0.92, ease: "power3.out" }, T.rack)
        .to(logo, { scale: 1, duration: 0.92, ease: "power2.out" }, T.rack)
        .to(bloom, { opacity: 0, duration: 0.86, ease: "power2.out" }, T.rack + 0.1);

      /* Beat 3 — BREATH. The prototype's four micro-ticks, verbatim in ratio:
         1.0018 / 1.0012 on a 760px subject is about 1.4px of travel. Invisible
         as motion, felt as life — it stops the held frame reading as a still. */
      tl.to(
        logo,
        {
          keyframes: { scale: [1, 1.0018, 1, 1.0012, 1], ease: "none" },
          duration: 0.62,
          ease: "none",
        },
        T.breath
      );

      /* The warm ground rises late, exactly as in the prototype: the black is
         not a backdrop being lit, it is the room the logo is standing in. */
      tl.fromTo(glow, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: "power1.inOut" }, T.breath);

      /* Beat 4 — PUSH-THROUGH. The camera goes through the mark rather than
         cutting away from it, and the curtain leaves on the same move. */
      tl.to(
        logo,
        { scale: 1.06, filter: "blur(11px)", opacity: 0, duration: 0.44, ease: "power2.in" },
        T.push
      )
        .to(glow, { opacity: 0, duration: 0.42, ease: "power2.in" }, T.push + 0.08)
        .to(root, { opacity: 0, duration: 0.5, ease: "power2.inOut" }, T.push + 0.04);

      tl.set({}, {}, T.end);
    }

    /*
     * Any input skips. A brand reveal that cannot be dismissed is an obstacle,
     * and the second visit is the one where it stops being a reveal at all. It
     * accelerates rather than cutting, so the gesture still resolves.
     */
    const skip = () => {
      if (!tl.isActive()) return;
      signalCurtainLift();
      gsap.to(tl, { progress: 1, duration: 0.3, ease: "power2.in", overwrite: true });
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") return; // let a keyboard visitor reach the page
      skip();
    };

    const opts: AddEventListenerOptions = { once: true, passive: true };
    window.addEventListener("wheel", skip, opts);
    window.addEventListener("touchmove", skip, opts);
    window.addEventListener("pointerdown", skip, opts);
    window.addEventListener("keydown", onKey);

    /*
     * The failsafe outranks the effect. If anything above throws, or a tab is
     * backgrounded long enough for rAF to stall, this overlay would otherwise
     * be an opaque black screen over the entire site forever.
     */
    const bail = window.setTimeout(() => {
      signalCurtainLift();
      done();
    }, 6000);

    return () => {
      window.clearTimeout(bail);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", onKey);
      tl.kill();
      document.documentElement.removeAttribute("data-curtain");
      document.documentElement.removeAttribute("data-curtain-boot");
    };
  }, [armed]);

  if (!armed) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden
      /*
       * `pointer-events-none` even though it covers the page: the curtain is
       * decoration, and a visitor who clicks a nav item they can see coming
       * should hit the nav item, not a black rectangle. The skip listeners are
       * on the window, so dismissal still works.
       */
      className="pointer-events-none fixed inset-0 z-[120] overflow-hidden"
      style={{ background: "#050505" }}
    >
      {/* The warm ground, rising late. */}
      <div
        data-c="glow"
        className="absolute inset-0"
        style={{
          opacity: 0,
          background:
            "radial-gradient(circle at 50% 50%, rgba(var(--orange-ch), 0.3) 0%, rgba(var(--orange-ch), 0.09) 55%, rgba(5,5,5,0) 85%)",
        }}
      />

      {/* The bloom the wordmark is lit by. */}
      <div
        data-c="bloom"
        className="absolute left-1/2 top-1/2 aspect-square w-[min(520px,86vw)] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          opacity: 0,
          background:
            "radial-gradient(circle, rgba(var(--amber-ch), 0.5) 0%, rgba(var(--orange-ch), 0.34) 42%, rgba(242,106,33,0) 70%)",
        }}
      />

      <div
        data-c="logo"
        className="absolute left-1/2 top-1/2 w-[min(760px,74vw)] -translate-x-1/2 -translate-y-1/2"
        style={{ opacity: 0 }}
      >
        {/*
          `filter: none`, explicitly. The asset is white artwork on
          transparency and every other placement inverts it via --logo-filter
          for the light theme — here it sits on #050505, where inverting it
          would produce a black logo on a black screen.
        */}
        <Image
          src="/earrow-logo-white.png"
          alt=""
          width={1520}
          height={626}
          sizes="(max-width: 1023px) 74vw, 760px"
          priority
          className="h-auto w-full"
          style={{ filter: "none" }}
        />
      </div>
    </div>
  );
}
