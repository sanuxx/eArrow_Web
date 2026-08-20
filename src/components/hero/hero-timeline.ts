"use client";

import { gsap } from "@/lib/gsap";

/**
 * The hero's choreography, kept apart from its plumbing.
 *
 * Two timelines over one composition:
 *
 *   buildIntro — a 4.2s autonomous clock that plays on load, on the hero's own
 *   canvas (never an overlay, so the <h1> paints on the first frame and LCP is
 *   not held hostage to it). Uses `.from()` tweens for everything it shares with
 *   the scrub.
 *
 *   buildScrub — a normalised 0..1 timeline driven by scroll position. Uses
 *   `.to()` / `.fromTo()` tweens only.
 *
 * That split enforces the handoff invariant structurally rather than by
 * convention: the state authored in HeroPlate/StatsPlane is the settled frame,
 * the intro animates *into* it, the scrub animates *away from* it, so
 * `intro.progress(1)` and `scrub.progress(0)` are the same frame with no
 * coordination between the two clocks.
 *
 * Property discipline for the scrub: transforms and opacity only. No
 * `letter-spacing` (the obvious way to "track the headline out", and it reflows
 * the whole text run every frame — scale does the same job on the compositor),
 * no `width`/`height`/`top`/`left`, no SVG geometry. `clip-path` is the one
 * exception and it is deliberate: it is a single property on a single element,
 * and the alternative — animating a `mask-size` on raster artwork — repaints a
 * full-viewport layer every frame and would look soft besides.
 */

export type HeroRefs = {
  root: HTMLElement;
  stage: HTMLElement;
  plate: HTMLElement;
  iris: HTMLElement;
};

/** The four phases, derived from scroll progress. Exposed as `data-phase`. */
export function phaseFor(p: number) {
  if (p < 0.18) return "depth";
  if (p < 0.46) return "separate";
  if (p < 0.78) return "iris";
  return "land";
}

/**
 * Blur is the one non-compositor property worth spending, but not on every
 * device: a full-viewport `filter: blur()` repaints per frame. Skip the crossing
 * blurs on touch devices and very wide/high-DPR canvases, and substitute a
 * slightly deeper opacity+scale fall so the beat still lands.
 */
function blurIsAffordable() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(hover: none)").matches) return false;
  return window.devicePixelRatio * window.innerWidth <= 3000;
}

/* ────────────────────────────────────────────────────────────────────────
   The intro — 4.2s, autonomous
   ──────────────────────────────────────────────────────────────────────── */

/** Where the brand beats end and the composition begins. Beats 5-6 are written
    against the full-timeline clock, so dropping the brand half means shifting
    everything after this point back by exactly this much. */
const BRAND_END = 2.856;

export type IntroOptions = {
  /**
   * Whether this timeline opens with the brand reveal — the flare and the
   * wordmark racking into focus, beats 0 to 4.
   *
   * False when BrandIntro is playing the same gesture full-screen in front of
   * the site. Two logo reveals in a row is not twice the impact, it is a
   * stutter: the mark resolves, dissolves, and immediately resolves again 40%
   * smaller. So the curtain keeps the brand half and the hero keeps the half
   * only it can do — its own composition assembling out of the same light.
   */
  brand?: boolean;
};

export function buildIntro(
  refs: HeroRefs,
  { brand = true }: IntroOptions = {}
): gsap.core.Timeline {
  const q = gsap.utils.selector(refs.root);
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });

  /*
   * How long the composition waits behind the curtain before it starts.
   *
   * The lift is announced when the fade *begins*, not when it ends, so the two
   * shots overlap — but the overlap has to be the right half. Light reads
   * through a fading black; type does not. At 0.35 the flare and the plate's
   * resolve carry the join, and the headline, sub and CTAs all land in the
   * clear rather than under 50% grey.
   */
  const LEAD = 0.35;

  /* Beats 5-6 keep their authored positions when the brand half is present and
     slide to the front when it is not. Written as an offset rather than as two
     sets of numbers so the choreography below has one source of truth. */
  const shift = brand ? 0 : -BRAND_END + LEAD;

  const flare = q("[data-l='intro-flare']");
  const wordmark = q("[data-l='intro-wordmark']");
  const sweep = q("[data-l='intro-wordmark'] [data-sweep]");

  /*
   * Blur scaled to the subject, not fixed.
   *
   * The prototype's 9px rack was tuned for a 760px wordmark. Ours is
   * `min(760px, 78vw)`, so on a 390px phone it is 304px wide — and a fixed 12px
   * blur on a 304px logo obliterates it rather than softening it. A blur only
   * reads as a lens finding focus when its radius is proportional to what it is
   * blurring, so the ratio is what's constant here (0.0158 of the subject's
   * width), giving 12px at full size and ~4.8px at phone size.
   */
  const markWidth = (wordmark[0] as HTMLElement | undefined)?.offsetWidth ?? 760;
  const rackBlur = Math.max(4, Math.round(markWidth * 0.0158));
  const exitBlur = Math.round(rackBlur * 1.25);

  /* ── Beats 0-4: the brand half. Skipped when the curtain owns it. ── */
  if (brand) {
    /*
     * Beat 0 — HELD, 0 to 0.42s.
     *
     * Nothing animates, and that is the beat. The client's own prototype opens on
     * half a second of dead frame; it is what makes everything after it read as a
     * reveal rather than as a page finishing loading. The empty tween just holds
     * the playhead.
     */
    tl.to({}, { duration: 0.42 });
  
    /*
     * Beat 1 — THE FLARE, 0.42 to 0.525s.
     *
     * 105ms. The light source arrives before the thing it lights: the wordmark
     * does not fade in, it is lit. Linear, because at this duration easing is
     * theoretical.
     */
    tl.fromTo(
      flare,
      { opacity: 0, scale: 0.94 },
      { opacity: 1, scale: 1, duration: 0.105, ease: "none" },
      0.42
    );
  
    /*
     * Beat 2 — THE RESOLVE, 0.525 to 1.68s.
     *
     * The blur rack is the whole trick, inherited from the prototype: 12px to 0
     * alongside a 0.982 to 1 scale reads as a lens finding focus, where a plain
     * opacity fade reads as CSS. The flare decays to a 0.14 ember across the same
     * window, so the light burns off exactly as the mark reaches full sharpness.
     */
    tl.fromTo(
      wordmark,
      { opacity: 0, filter: `blur(${rackBlur}px)`, scale: 0.982 },
      { opacity: 1, duration: 0.775, ease: "power2.out" },
      0.525
    )
      .to(wordmark, { filter: "blur(0px)", duration: 1.155, ease: "power3.out" }, 0.525)
      .to(wordmark, { scale: 1, duration: 1.155, ease: "power2.out" }, 0.525)
      .to(flare, { opacity: 0.14, duration: 1.155, ease: "power2.out" }, 0.525);
  
    /*
     * Beat 3 — BREATH + SPECULAR, 1.68 to 2.76s.
     *
     * The prototype's four micro-scale ticks, verbatim in ratio: 1.0018 / 1.0012
     * on a 760px subject is about 1.4px of travel. Invisible as motion, felt as
     * life — it stops the held frame reading as a flat image. Linear timing with
     * the easing encoded positionally in the key spacing, which is how the
     * prototype avoids composing easings across a shared clock.
     */
    tl.to(
      wordmark,
      {
        keyframes: {
          scale: [1, 1.0018, 1, 1.0012, 1],
          ease: "none",
        },
        duration: 0.924,
        ease: "none",
      },
      1.68
    ).fromTo(
      sweep,
      { xPercent: -140, opacity: 1 },
      { xPercent: 320, duration: 1.06, ease: "power2.inOut" },
      1.7
    );
  
    /*
     * Beat 4 — PUSH-THROUGH, 2.604 to 3.36s.
     *
     * The camera pushes through the wordmark rather than cutting away from it:
     * scale past 1 while blurring and fading, with the flare punching back up to
     * 0.62 at the moment of dissolve. The hero composition then resolves out of
     * that second flash, so one gesture (light) links the brand to the page.
     */
    tl.to(
      wordmark,
      { scale: 1.285, filter: `blur(${exitBlur}px)`, opacity: 0, duration: 0.546, ease: "power2.in" },
      2.604
    )
      .to(flare, { opacity: 0.62, scale: 1.08, duration: 0.168, ease: "power1.out" }, 2.604)
      .to(flare, { opacity: 0, scale: 1.22, duration: 0.588, ease: "power2.out" }, 2.772)
      .set(sweep, { opacity: 0 }, 2.604);
  }

  /* ── Beat 4b — THE HANDOVER. Only exists behind the curtain. ───────────────
     Without this the hero simply started, and started *early*: the composition
     began the instant the curtain announced its lift, so roughly 40% of the
     assembly played out under black that was still fading. Measured, the chip
     and the first headline line were both finished before the overlay had gone.

     Two things fix it, and they are the same thing. The composition now waits
     out most of the fade (see LEAD below), and the gap is filled by the gesture
     that ties the two shots together: the curtain pushed *through* the logo and
     left light behind, and the hero resolves out of that light rather than
     appearing once it has gone. The flare is free here — nothing else in this
     path uses it, because the wordmark beats it belongs to are the ones the
     curtain took over. */
  if (!brand) {
    tl.fromTo(
      flare,
      { opacity: 0, scale: 0.86 },
      { opacity: 0.55, scale: 1, duration: 0.34, ease: "power2.out" },
      0
    ).to(flare, { opacity: 0, scale: 1.24, duration: 1.0, ease: "power2.out" }, 0.34);

    /*
     * The plate resolves as one object before its parts assemble — a single
     * camera move rather than eleven elements each fading in on their own. The
     * blur is spent only where it is affordable; elsewhere the scale carries
     * the beat alone, which is the same trade the scrub makes.
     */
    tl.fromTo(
      refs.plate,
      blurIsAffordable()
        ? { scale: 1.055, filter: "blur(12px)" }
        : { scale: 1.075 },
      blurIsAffordable()
        ? { scale: 1, filter: "blur(0px)", duration: 1.25, ease: "power3.out" }
        : { scale: 1, duration: 1.25, ease: "power3.out" },
      0
    );
  }

  /*
   * Beat 5 — THE COMPOSITION ASSEMBLES, 2.856 to 3.6s.
   *
   * `.from()` only, so every element's authored state is its settled state and
   * this beat merely animates into it. Elements arrive *out of light*, which is
   * why each carries a small blur component and none of them bounce — an
   * overshoot is saved for the CTAs, where it belongs, on the thing you click.
   */
  const arrive = (
    target: Element[] | Element,
    at: number,
    vars: gsap.TweenVars
  ) => {
    tl.from(target, { duration: 0.6, ...vars }, at + shift);
  };

  arrive(q("[data-l='bloom']"), 2.856, {
    opacity: 0,
    scale: 0.72,
    duration: 1.3,
    ease: "power2.out",
  });
  // The subject arrives first and out of the light, like everything else — but
  // it assembles in parts, because a product that builds itself reads as
  // software where a panel that fades in reads as an image.
  arrive(q("[data-l='panel-outer']"), 2.856, {
    opacity: 0,
    y: 26,
    scale: 0.965,
    filter: "blur(9px)",
    duration: 0.86,
  });
  arrive(q("[data-l='panel-row']"), 3.16, {
    opacity: 0,
    x: -10,
    duration: 0.4,
    stagger: 0.045,
  });
  arrive(q("[data-l='panel-tile']"), 3.24, {
    opacity: 0,
    y: 14,
    scale: 0.96,
    duration: 0.5,
    stagger: 0.08,
  });
  arrive(q("[data-l='panel-bar']"), 3.36, {
    scaleY: 0,
    duration: 0.44,
    stagger: 0.035,
    ease: "power2.out",
  });
  arrive(q("[data-l='slab-a']"), 2.928, { opacity: 0, scale: 1.06, duration: 1.1 });
  arrive(q("[data-l='slab-b']"), 2.988, { opacity: 0, scale: 1.05, duration: 1.1 });
  arrive(q("[data-l='grid']"), 3.0, { opacity: 0, duration: 0.9, ease: "power1.out" });
  arrive(q("[data-l='rule']"), 3.06, { scaleY: 0, duration: 0.86 });
  arrive(q("[data-l='tick']"), 3.1, { scaleX: 0, duration: 0.4, stagger: 0.05 });
  arrive(q("[data-l='chip']"), 3.12, { opacity: 0, y: 14, filter: "blur(5px)", duration: 0.56 });
  arrive(q("[data-l='h1a']"), 3.192, { yPercent: 108, duration: 0.68 });
  arrive(q("[data-l='h1b']"), 3.264, { yPercent: 108, duration: 0.68 });
  // The gradient is brushed across line 2 as it lands — one property, and it is
  // what makes the second line read as the payoff rather than as more text.
  tl.from(
    q("[data-l='h1b']"),
    { backgroundPosition: "120% 0", duration: 0.9, ease: "power2.out" },
    3.264 + shift
  );
  arrive(q("[data-l='sub']"), 3.336, { opacity: 0, y: 16, filter: "blur(5px)" });
  arrive(q("[data-l='cta']"), 3.408, {
    opacity: 0,
    y: 14,
    scale: 0.97,
    duration: 0.56,
    stagger: 0.07,
    ease: "back.out(1.6)",
  });
  arrive(q("[data-l='strip-rule']"), 3.48, { scaleX: 0, duration: 0.7 });
  arrive(q("[data-l='strip']"), 3.48, { opacity: 0, y: 12, duration: 0.52, stagger: 0.05 });
  arrive(q("[data-l='strip-dot']"), 3.54, {
    scale: 0,
    duration: 0.3,
    stagger: 0.06,
    ease: "back.out(2.2)",
  });

  /* Beat 6 — the cue is the last thing in, because it is an instruction and it
     should not appear until there is something to obey it with. */
  arrive(q("[data-l='cue']"), 3.864, { opacity: 0, duration: 0.336, ease: "power1.out" });

  return tl;
}

/* ────────────────────────────────────────────────────────────────────────
   The scrub — normalised to a total duration of 1
   ──────────────────────────────────────────────────────────────────────── */

export function buildScrub(refs: HeroRefs): gsap.core.Timeline {
  const q = gsap.utils.selector(refs.root);
  const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
  const softFocus = blurIsAffordable();

  /* ── ACT I — DEPTH, 0.00 to 0.18 ──────────────────────────────────────
     The reward for the first scroll is *more* composition, not less. Nothing
     exits yet; the layers spread across a 3.4x depth range and the second UI
     card is earned. A hero that starts destroying itself on the first wheel
     click reads as impatient. */
  tl.to(q("[data-l='slab-a']"), { y: -14, scale: 1.055, duration: 0.18 }, 0)
    .to(q("[data-l='slab-b']"), { y: -34, x: 18, duration: 0.18 }, 0)
    .to(q("[data-l='grid']"), { y: -22, duration: 0.18 }, 0)
    // The subject moves least and comes *toward* the viewer — everything else
    // drifts past it, which is what reads as depth.
    .to(q("[data-l='panel-outer']"), { y: -12, scale: 1.035, duration: 0.18 }, 0)
    .to(q("[data-l='bloom']"), { scale: 1.1, duration: 0.18 }, 0)
    .to(q("[data-l='cue']"), { opacity: 0, duration: 0.14, ease: "power2.in" }, 0);

  /* ── ACT II — SEPARATE, 0.18 to 0.46 ──────────────────────────────────
     Depth spread reaches 70 : 132 : 196 : 230 : 300px — a 4.3x range. The
     headline moves least of anything on screen (34px); everything evacuating
     around a near-stationary headline is what makes it read as the anchor
     rather than as one more layer. */
  tl.to(q("[data-l='slab-a']"), { y: -70, scale: 1.14, opacity: 0.07, duration: 0.28 }, 0.18)
    .to(q("[data-l='slab-b']"), { y: -150, x: 60, opacity: 0.02, duration: 0.28 }, 0.18)
    .to(q("[data-l='grid']"), { y: -60, opacity: 0.35, duration: 0.28 }, 0.18)
    .to(q("[data-l='h1a'], [data-l='h1b']"), { y: -34, duration: 0.28 }, 0.18)
    // The type column evacuates from the bottom up: strip, chip, rule, sub,
    // CTAs. Reading order in reverse, so the headline is left alone longest.
    .to(
      q("[data-l='strip'], [data-l='strip-rule']"),
      { y: -54, opacity: 0, duration: 0.24, ease: "power2.in" },
      0.18
    )
    .to(
      q("[data-l='chip']"),
      { y: -44, opacity: 0, scale: 0.94, duration: 0.24, ease: "power2.in" },
      0.2
    )
    .to(
      q("[data-l='rule']"),
      { scaleY: 0, opacity: 0, duration: 0.24, ease: "power2.in" },
      0.22
    )
    .to(q("[data-l='sub']"), { y: -70, opacity: 0, duration: 0.22, ease: "power2.in" }, 0.24)
    .to(
      q("[data-l='cta']"),
      { y: -58, opacity: 0, scale: 0.95, duration: 0.2, ease: "power2.in" },
      0.26
    )
    // The panel starts growing toward the aperture it is about to become.
    .to(
      q("[data-l='panel-outer']"),
      { scale: 1.14, y: -22, duration: 0.16, ease: "power1.in" },
      0.3
    )
    .to(q("[data-l='bloom']"), { scale: 1.42, duration: 0.16, ease: "power1.out" }, 0.3);

  /* ── ACT III — IRIS, 0.44 to 0.78 ─────────────────────────────────────
     The mark blooms out and the aperture opens from exactly where it was. The
     aperture itself is not tweened here — it is derived from progress in
     `renderDerived` at the foot of this file, where each edge gets its own
     range and easing so the box grows off-centre: the right edge lands at 0.66
     and the left not until 0.78, so the headline side of the frame is swallowed
     last. The promise is the final thing you see before the proof. */
  tl.to(
    q("[data-l='panel-outer']"),
    { scale: 1.5, opacity: 0, filter: "blur(16px)", duration: 0.08, ease: "power2.in" },
    0.44
  )
    .fromTo(
      q("[data-l='intro-flare']"),
      { opacity: 0, scale: 0.9 },
      { opacity: 0.55, scale: 1.15, duration: 0.06, ease: "power1.out" },
      0.44
    )
    .to(q("[data-l='intro-flare']"), { opacity: 0, duration: 0.16, ease: "power2.out" }, 0.5)
    /* The aperture itself is not tweened here — see `renderDerived` below. */
    .fromTo(
      q("[data-l='iris-edge']"),
      { opacity: 0 },
      { opacity: 1, duration: 0.06, ease: "power1.out" },
      0.46
    )
    .to(q("[data-l='iris-edge']"), { opacity: 0, duration: 0.12, ease: "power2.in" }, 0.7)
    // Tracking out via scale, never letter-spacing: same read, no reflow.
    .to(
      q("[data-l='h1a']"),
      { y: -120, scale: 1.14, duration: 0.18, ease: "power2.in" },
      0.44
    )
    .to(q("[data-l='h1a']"), { opacity: 0, duration: 0.08, ease: "power2.in" }, 0.54)
    .to(
      q("[data-l='h1b']"),
      {
        y: -150,
        scale: 1.22,
        // The gradient drains back out of the words as they leave.
        backgroundPosition: "-90% 0",
        duration: 0.2,
        ease: "power2.in",
      },
      0.46
    )
    .to(q("[data-l='h1b']"), { opacity: 0, duration: 0.1, ease: "power2.in" }, 0.56)
    .to(q("[data-l='slab-a'], [data-l='slab-b']"), {
      opacity: 0,
      duration: 0.16,
      ease: "power1.in",
    }, 0.52)
    /*
     * The two blurs cross. The hero plate racks out (0 -> 8px) from 0.44 while
     * the stats plane racks in (6px -> 0) from 0.62, leaving a deliberate
     * 0.62–0.70 window where both are soft. That overlap is the entire reason
     * this reads as a lens change rather than a crossfade; run sequentially it
     * would read as two separate events.
     */
    .to(
      refs.plate,
      softFocus
        ? { scale: 1.08, opacity: 0.55, filter: "blur(8px)", duration: 0.26, ease: "power1.in" }
        : { scale: 1.08, opacity: 0.4, duration: 0.26, ease: "power1.in" },
      0.44
    );

  /* ── ACT IV — LAND, 0.62 to 1.00 ──────────────────────────────────────
     Zero-jump invariant: at progress 1 every animated property here is at its
     identity value — `inset(0 0 0 0 round 0)` is a no-op, scale 1, blur 0, no
     residual offset. Releasing the sticky stage therefore changes nothing
     visually, by construction rather than by tuning. */
  tl.fromTo(
    q("[data-l='stats-row']"),
    softFocus ? { scale: 1.1, filter: "blur(6px)" } : { scale: 1.1 },
    softFocus
      ? { scale: 1, filter: "blur(0px)", duration: 0.16, ease: "power2.out" }
      : { scale: 1, duration: 0.16, ease: "power2.out" },
    0.62
  )
    .fromTo(
      q("[data-l='metric']"),
      { opacity: 0, y: 34 },
      { opacity: 1, y: 0, duration: 0.2, stagger: 0.04, ease: "power3.out" },
      0.66
    )
    .fromTo(
      q("[data-l='metric-rule']"),
      { scaleY: 0 },
      { scaleY: 1, duration: 0.24, stagger: 0.04, ease: "power3.out" },
      0.7
    );

  /*
   * The counters as an instrument, not a cutscene. Driven off scroll rather
   * than a one-shot rAF, so scrolling back up un-counts them, and written
   * straight to `textContent` so a scrubbed frame costs no React render.
   */
  /*
   * ── Values derived from progress rather than tweened ──
   *
   * Two things here resisted being expressed as tweens, for different reasons,
   * and both are better as a pure function of progress anyway.
   *
   * The aperture: GSAP cannot reliably animate CSS custom properties. It reads a
   * tween's start value through `getComputedStyle`, which does not resolve
   * custom properties usefully, so `--iris-*` was written straight to its end
   * value on the first render — spelling out both endpoints with `fromTo` did
   * not help either. Composing the `clip-path` string ourselves sidesteps the
   * whole problem and costs one string write per frame.
   *
   * The counters: the markup renders its final value (so the server response and
   * the reduced-motion frame are both correct), which means anything short of an
   * explicit write leaves "150" on screen from progress 0. Deriving the number
   * makes it correct at every progress in both directions for free.
   *
   * Each edge keeps its own range and easing, which is what opens the aperture
   * off-centre: the right edge lands at 0.66 and the left not until 0.78.
   */
  const ease = {
    out2: gsap.parseEase("power2.out"),
    inOut2: gsap.parseEase("power2.inOut"),
    inOut3: gsap.parseEase("power3.inOut"),
    in1: gsap.parseEase("power1.in"),
    out4: gsap.parseEase("power4.out"),
  };

  /** Progress within [a,b], eased, clamped to 0..1. */
  const seg = (p: number, a: number, b: number, fn: (v: number) => number) =>
    fn(Math.min(1, Math.max(0, (p - a) / (b - a))));

  const counters = q("[data-count-to]").map((el) => ({
    el,
    target: Number(el.getAttribute("data-count-to") ?? 0),
  }));

  const renderDerived = () => {
    const p = tl.progress();

    /*
     * Each edge runs in two stages: born, then opened.
     *
     * At rest the box has to be *empty*, not merely small — an inset whose
     * opposing edges sum to 100% clips to nothing. Sizing it to the subject from
     * the start instead left a visible rectangle parked on the composition for
     * the whole first half of the scroll, which read as a rendering bug rather
     * than as a closed aperture.
     *
     * So: hold at zero area until 0.42, grow to the product panel's own bounding
     * box by 0.46 — the aperture is *born* from the product, under cover of the
     * flare, carrying the panel's own 24px corner radius — then open to the full
     * frame on each edge's schedule. Right edge lands at 0.66, left not until
     * 0.78, so the headline side of the frame is swallowed last.
     */
    const born = seg(p, 0.42, 0.46, ease.out2);

    const t = 50 - 21 * born - 29 * seg(p, 0.46, 0.74, ease.inOut2);
    const r = 29 - 20 * born - 9 * seg(p, 0.46, 0.66, ease.out2);
    const b = 50 - 21 * born - 29 * seg(p, 0.46, 0.74, ease.inOut2);
    const l = 71 - 19 * born - 52 * seg(p, 0.46, 0.78, ease.inOut3);
    // 24px = the panel's `rounded-card`, so the opening inherits its shape.
    const round = 24 * (1 - seg(p, 0.62, 0.78, ease.in1));

    refs.iris.style.clipPath = `inset(${t.toFixed(2)}% ${r.toFixed(2)}% ${b.toFixed(
      2
    )}% ${l.toFixed(2)}% round ${round.toFixed(1)}px)`;

    const c = seg(p, 0.68, 0.98, ease.out4);
    for (const { el, target } of counters) {
      el.textContent = String(Math.round(target * c));
    }
  };

  tl.eventCallback("onUpdate", renderDerived);
  renderDerived();

  return tl;
}

/* ────────────────────────────────────────────────────────────────────────
   The calm intro — 1.2s, reduced motion
   ──────────────────────────────────────────────────────────────────────── */

/**
 * What a visitor with `prefers-reduced-motion: reduce` gets instead of the 4.2s
 * cinema.
 *
 * The old behaviour was to run nothing at all, which is the textbook answer and
 * the wrong one here: the pre-paint hold in layout.tsx and the reveal are one
 * mechanism, so "no reveal" meant the hero simply appeared — and to anyone whose
 * OS has animation effects switched off (the Windows 11 default on some
 * machines) the site looked broken rather than considerate.
 *
 * Reduced motion is a request to stop *moving* things, not to stop
 * communicating. So this keeps the beat and drops everything that moves:
 *
 *   · opacity only — no blur rack, no scale, no travel, no aperture
 *   · 1.2s, not 4.2 — it announces the page, it does not perform for it
 *   · the composition and the proof arrive together, lightly offset, so the
 *     eye is still led from one to the other
 *
 * Nothing here is a `.from()` off an authored transform, so the settled frame
 * is reached by fading to opacity 1 and there is no state left behind.
 */
export function buildCalmIntro(refs: HeroRefs): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power1.out" } });

  tl.fromTo(refs.plate, { opacity: 0 }, { opacity: 1, duration: 0.9 }, 0);
  tl.fromTo(refs.iris, { opacity: 0 }, { opacity: 1, duration: 0.9 }, 0.3);

  return tl;
}
