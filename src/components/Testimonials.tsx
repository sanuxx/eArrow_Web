"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { SectionLabel } from "./ui";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

/*
 * Brief §09 — the quote, the person, the organisation.
 *
 * Built as a cinematic reveal rather than a fading carousel. The quote arrives
 * word by word, each rising from behind its own baseline; a highlighter then
 * runs across the phrase that matters; and the attribution assembles beside its
 * logo. Everything is GSAP, in four clocks that never write the same property
 * on the same element:
 *
 *   1. ASSEMBLY   — one-shot ScrollTrigger timeline on arrival.
 *   2. DRIFT      — scrubbed: the oversized quotation glyph parallaxes.
 *   3. CHANGE     — per quote: words rise, highlighter sweeps, mark lands.
 *   4. AUTOPLAY   — a progress ring drives the advance, and *is* the timer, so
 *                   the ring can never disagree with when the quote turns.
 *
 * The words are split in the markup, not by SplitText. SplitText rewrites the
 * innerHTML React owns — and the same reasoning already applies in the hero
 * (see lib/gsap.ts). Hand-authored spans survive SSR, keep the text selectable
 * and searchable, and let a single word carry its own highlighter element.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * SAMPLE QUOTES ON REAL CUSTOMERS. Read this before shipping.
 *
 * The three organisations below are real clients and the logos are theirs. The
 * quotes, the speakers and their roles are written samples — nobody at
 * Infomate, the Centre for Banking Studies or IBSL said these words, and the
 * named people are invented.
 *
 * This is the client's explicit and repeated instruction, made so the section
 * can be reviewed and signed off as finished, and it is recorded here because
 * the page itself no longer shows any sign of it: to a visitor, and to the
 * customer, these read as genuine endorsements.
 *
 * The obligation that follows is simple and it is not optional. Before this
 * goes public, every entry needs either the words that customer actually gave
 * and their sign-off, or removal. A testimonial is a claim about someone else,
 * and it is the one kind of copy the site cannot correct after the fact.
 *
 * To go live on an entry: replace `quote`, `name` and `role` with what was
 * actually said and who said it. The org and logo are already correct.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * The wall at the foot of the section is a separate and factual claim — these
 * are clients, not quoted ones — so it stands on its own.
 */

type Quote = {
  quote: string;
  /** Exact substring of `quote` to run the highlighter across. Optional. */
  highlight?: string;
  name: string;
  /** What the speaker does. Distinguishes the three slides from one another
      even before the real names arrive. */
  role: string;
  org: string;
  /** Path under /public. Omitted on sample entries — the plate falls back to
      a monogram, which reads as designed rather than as missing. */
  logo?: string;
};

/*
 * Three slides that are told apart by their content, not by a numeral.
 *
 * They used to read "Second customer quote to be supplied." above three
 * identical "Customer Name" lines, which made the carousel indistinguishable
 * from itself. Each quote is now matched to what that customer actually does —
 * payroll for a shared-services company, programmes for a training centre,
 * enrolment for an institute — with different lengths and different seniority,
 * so the layout is tested against short and long copy.
 *
 * Each is also a brief. It shows the shape of a quote worth collecting: a
 * specific before, a specific after, and a number where there is one — which
 * is far more use to whoever calls the customer than "please send a quote".
 */
const QUOTES: Quote[] = [
  {
    quote:
      "Payroll used to take three people most of a week. It now closes in a day, and the numbers are right the first time.",
    highlight: "closes in a day",
    name: "Dilhani Perera",
    role: "Head of Human Resources",
    org: "John Keells Infomate",
    logo: "/logos/infomate.png",
  },
  {
    quote:
      "Admissions, attendance and results lived in three systems that never agreed with each other. Our registrars finally trust one number.",
    highlight: "trust one number",
    name: "Rohan Wijeratne",
    role: "Head of Programmes",
    org: "Centre for Banking Studies",
    logo: "/logos/cbs.png",
  },
  {
    quote:
      "Enrolment and certification used to live in spreadsheets only two people understood.",
    highlight: "only two people understood",
    name: "Anushka Fernando",
    role: "Registrar",
    org: "Institute of Bankers of Sri Lanka",
    logo: "/logos/ibsl.jpg",
  },
];

/** Customers with artwork on disk. The rest of the roster runs in the ticker. */
const CUSTOMER_LOGOS = [
  { name: "John Keells Infomate", src: "/logos/infomate.png" },
  { name: "Centre for Banking Studies (Central Bank of Sri Lanka)", src: "/logos/cbs.png" },
  { name: "Institute of Bankers of Sri Lanka", src: "/logos/ibsl.jpg" },
  { name: "Sri Lanka Institute of Tourism & Hotel Management", src: "/logos/slithm.png" },
  { name: "Aquinas College of Higher Studies", src: "/logos/aquinas.png" },
];

/*
 * The current that runs across the section.
 *
 * Two paths with an identical command structure — same count, same order, only
 * the numbers differ. That is the requirement for GSAP to tween one into the
 * other: its complex-string interpolation walks the numbers in place, so a
 * mismatched structure produces a jump instead of a morph. Crest and trough are
 * swapped between them, so tweening A to B and back is a full wave cycle.
 */
const WAVE_A =
  "M0,60 C160,14 320,106 480,60 C640,14 800,106 960,60 C1120,14 1280,106 1440,60";
const WAVE_B =
  "M0,60 C160,106 320,14 480,60 C640,106 800,14 960,60 C1120,106 1280,14 1440,60";

/** Layer spec: vertical offset, opacity, weight, and the period of its swell. */
const WAVES = [
  { y: 0, opacity: 0.7, width: 2, period: 7 },
  { y: 16, opacity: 0.34, width: 1.5, period: 9.5 },
  { y: -14, opacity: 0.16, width: 1, period: 12 },
];

/** Seconds a quote holds before autoplay advances. */
const HOLD = 7;
/** Circumference of the progress ring, r=21. Kept as a constant so the dash
    array, the dash offset and the tween all read from one number. */
const RING = 2 * Math.PI * 21;

/**
 * Splits the quote into words, flagging those inside the highlight phrase.
 *
 * Word-level rather than character-level on purpose: a highlighter runs over
 * words, and per-character masks on a 2.5rem display face produce visible
 * seams where the glyphs are cut.
 */
function tokenise(q: Quote) {
  const at = q.highlight ? q.quote.indexOf(q.highlight) : -1;
  const end = at < 0 ? -1 : at + (q.highlight?.length ?? 0);
  let cursor = 0;

  return q.quote.split(/(\s+)/).flatMap((chunk) => {
    const start = cursor;
    cursor += chunk.length;
    if (!chunk.trim()) return [];
    return [{ text: chunk, lit: at >= 0 && start >= at && start < end }];
  });
}

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const item = QUOTES[index];
  const words = tokenise(item);

  const rootRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<SVGSVGElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const autoplay = useRef<gsap.core.Tween | null>(null);

  /*
   * StrictMode invokes effects twice on mount, so a `didMount` boolean would be
   * already-true on the second pass and fire the change sequence while assembly
   * still holds those elements pre-reveal. Comparing the value means both mount
   * passes are no-ops and only a real change animates.
   */
  const lastAnimated = useRef<number | null>(null);

  const go = useCallback((delta: number) => {
    setIndex((i) => (i + delta + QUOTES.length) % QUOTES.length);
  }, []);

  /* ── 1 & 2: assembly and drift ──────────────────────────────────────── */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    /*
     * GSAP writes inline styles from its own rAF loop, so the global
     * reduced-motion CSS block cannot reach it — the guard is explicit, and the
     * fallback is the finished frame rather than no animation: every element
     * below is authored from an invisible start state.
     */
    const current = currentRef.current;

    if (prefersReducedMotion()) {
      gsap.set(root.querySelectorAll("[data-t]"), { opacity: 1, scale: 1, x: 0, y: 0 });
      gsap.set(root.querySelectorAll("[data-t='marker']"), { scaleX: 1 });
      /* The line still belongs on the page — it just holds its shape. */
      const waves = current?.querySelectorAll("[data-wave]") ?? [];
      gsap.set(waves, { strokeDashoffset: 0 });
      gsap.set(current?.querySelector("[data-charge]") ?? [], { opacity: 0 });

      /*
       * Not frozen — breathing. The wave's whole job is to say the section is
       * alive, and a dead line under the controls just reads as a stray rule.
       * Opacity is the one channel reduced motion leaves open: nothing travels,
       * nothing morphs, the geometry never changes, so there is no motion to
       * trigger on and the line still has a pulse. Slow enough (7s each way)
       * that it is felt at the edge of vision rather than watched.
       */
      const breathe = gsap.to(waves, {
        opacity: (i: number) => (WAVES[i]?.opacity ?? 0.4) * 0.4,
        duration: 7,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: 0.8,
      });
      return () => {
        breathe.kill();
      };
    }

    const ctx = gsap.context(() => {
      gsap
        .timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: root, start: "top 70%", once: true },
        })
        .from("[data-t='glyph-wrap']", { opacity: 0, scale: 1.2, duration: 1.1 })
        .from("[data-t='word']", { yPercent: 115, duration: 0.75, stagger: 0.035 }, "-=0.85")
        /* The highlighter only makes sense once the words it covers exist. */
        .from("[data-t='marker']", { scaleX: 0, duration: 0.5, stagger: 0.05 }, "-=0.25")
        .from("[data-t='plate']", { scale: 0.6, rotate: -8, opacity: 0, duration: 0.7, ease: "back.out(1.7)" }, "-=0.5")
        .from("[data-t='attrib-rule']", { scaleY: 0, duration: 0.5 }, "<0.1")
        .from("[data-t='attrib']", { x: -14, opacity: 0, duration: 0.6, stagger: 0.06 }, "<")
        .from("[data-t='controls']", { y: 16, opacity: 0, duration: 0.6 }, "-=0.4");

      /*
       * The wall gets its own trigger rather than a tail on the timeline above.
       * It sits some 800px below the section's top, so on the section's trigger
       * it would play out entirely off-screen and be finished before anyone
       * scrolled to it — and, because it is the last link in a chain of relative
       * positions, any hitch earlier in that chain left it parked on its
       * pre-reveal frame with nothing to restart it. A reveal belongs to the
       * thing being revealed.
       */
      /*
       * `.fromTo()` with an explicit end value, not `.from()`.
       *
       * A standalone `.from()` tween (this one is not inside the timeline
       * above, which is what let the others get away with it — GSAP defers a
       * timeline child's immediateRender until the timeline actually plays)
       * renders its start state and captures its implicit end state
       * immediately, synchronously, at creation. In development, React's
       * StrictMode runs this effect twice on mount; the first pass's
       * `ctx.revert()` cleanup does not reliably restore the resting opacity
       * before the second pass re-captures it, so the "end" this tween
       * animates toward can be recorded as 0 — the same opacity it starts
       * from. The tween then completes at progress 1 having gone nowhere, and
       * the logos are permanently invisible: `once: true` means it never gets
       * a second chance to get it right.
       *
       * Stating the end value (0.7, the resting `opacity-70` the wall's own
       * class already carries) removes the implicit capture entirely, so
       * there is nothing left for the race to corrupt.
       */
      gsap.fromTo(
        "[data-t='wall']",
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 0.7,
          duration: 0.5,
          stagger: 0.06,
          ease: "power3.out",
          scrollTrigger: { trigger: "[data-t='wall-group']", start: "top 90%", once: true },
        },
      );

      gsap.fromTo(
        "[data-t='glyph']",
        { yPercent: 10 },
        {
          yPercent: -10,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: 1.1 },
        },
      );

      /* ── The current ────────────────────────────────────────────────────
         Elements are passed directly rather than by selector: the svg lives
         outside `root`, which is what this context is scoped to, so a string
         selector would never resolve. */
      if (!current) return;
      const waves = Array.from(current.querySelectorAll<SVGPathElement>("[data-wave]"));
      const charge = current.querySelector<SVGPathElement>("[data-charge]");

      /* Draws on with the section, left to right. */
      gsap.to(waves, {
        strokeDashoffset: 0,
        duration: 1.6,
        stagger: 0.12,
        ease: "power2.inOut",
        scrollTrigger: { trigger: root, start: "top 80%", once: true },
      });

      /*
       * Each layer swells on its own period, and none of the periods divide
       * into another. That is the whole trick: three waves on a common multiple
       * re-synchronise every few seconds and the eye catches the loop, where
       * 7 / 9.5 / 12 never quite repeat.
       */
      waves.forEach((path, i) => {
        gsap.fromTo(
          path,
          { attr: { d: WAVE_A } },
          {
            attr: { d: WAVE_B },
            duration: WAVES[i].period,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          },
        );
      });

      if (charge) {
        gsap.set(charge, { opacity: 0.9 });
        gsap.fromTo(
          charge,
          { attr: { d: WAVE_A } },
          { attr: { d: WAVE_B }, duration: WAVES[0].period, ease: "sine.inOut", repeat: -1, yoyo: true },
        );
        gsap.fromTo(
          charge,
          { strokeDashoffset: 2290 },
          { strokeDashoffset: -2290, duration: 8, ease: "none", repeat: -1 },
        );
      }

      /* And the whole current drifts against the scroll, so it reads as flow
         through the section rather than decoration pinned to it. */
      gsap.fromTo(
        current,
        { xPercent: -3 },
        {
          xPercent: 3,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: 1.2 },
        },
      );
    }, root);

    const settle = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(settle);
      ctx.revert();
    };
  }, []);

  /* ── 3 & 4: the change, and the autoplay that drives it ─────────────── */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (prefersReducedMotion()) return;

    const previous = lastAnimated.current;
    lastAnimated.current = index;

    const ctx = gsap.context(() => {
      /* Skip the reveal on mount — assembly owns that frame — but always
         (re)start the ring, which has to run from the very first quote. */
      if (previous !== null && previous !== index) {
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          /*
           * `fromTo`, never `from`. `from` reads its end value off the element
           * at init time, and these elements are also owned by the assembly
           * timeline — so it could record a held pre-reveal value as its
           * *destination* and animate to nothing.
           */
          .fromTo(
            "[data-t='word']",
            { yPercent: 115 },
            { yPercent: 0, duration: 0.7, stagger: 0.03 },
            0,
          )
          .fromTo(
            "[data-t='marker']",
            { scaleX: 0 },
            { scaleX: 1, duration: 0.5, stagger: 0.05 },
            0.35,
          )
          .fromTo(
            "[data-t='plate']",
            { scale: 0.6, rotate: -8, opacity: 0 },
            { scale: 1, rotate: 0, opacity: 1, duration: 0.7, ease: "back.out(1.7)" },
            0.1,
          )
          .fromTo(
            "[data-t='attrib']",
            { x: -14, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.55, stagger: 0.06 },
            0.2,
          );
      }

      /*
       * The ring is the timer. Advancing on its `onComplete` rather than on a
       * parallel setTimeout means the two can never drift apart — a visible
       * progress indicator that finishes before or after the thing it measures
       * is worse than no indicator at all.
       */
      autoplay.current = gsap.fromTo(
        ringRef.current,
        { strokeDashoffset: RING },
        {
          strokeDashoffset: 0,
          duration: HOLD,
          ease: "none",
          onComplete: () => go(1),
        },
      );
    }, root);

    return () => ctx.revert();
  }, [index, go]);

  /* Autoplay yields to the reader: hovering or focusing anywhere in the section
     holds the current quote until they leave. */
  const hold = () => autoplay.current?.pause();
  const resume = () => autoplay.current?.play();

  return (
    <section
      id="customers"
      className="relative overflow-hidden bg-canvas-alt py-24 lg:py-32"
      onPointerEnter={hold}
      onPointerLeave={resume}
      onFocusCapture={hold}
      onBlurCapture={resume}
    >
      {/* Ambient wash — two soft fields rather than the orb component, so
          nothing here runs its own competing rAF loop. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-24 top-0 h-[520px] w-[520px] rounded-full opacity-70 blur-[140px]"
        style={{ background: "radial-gradient(circle, rgba(var(--amber-ch), 0.20), transparent 70%)" }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -left-32 bottom-0 h-[460px] w-[460px] rounded-full opacity-60 blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(var(--orange-ch), 0.16), transparent 70%)" }}
      />

      <div ref={rootRef} className="relative mx-auto max-w-5xl px-6 lg:px-12">
        <SectionLabel index="06">Testimonials</SectionLabel>
        {/* "What our customers say" was a label, not a headline — the same
            sentence sits on every corporate site in the country, and the
            eyebrow above already says TESTIMONIALS. This states the section's
            actual claim, in the voice the other headings use. */}
        <h2 className="mt-6 font-heading text-2xl font-bold tracking-[-0.03em] text-ink sm:text-3xl">
          Proof, in their own words.
        </h2>

        {/* The oversized quotation glyph. Same frosted treatment as the folio
            numeral in the ecosystem: the pane blurs what is behind it, masked
            radially so no rectangle edge shows, with the faintness on the glyph
            and the animation on the wrapper — sharing one `opacity` means the
            tween writes over the faintness class. */}
        <span
          data-t="glyph-wrap"
          aria-hidden
          className="pointer-events-none absolute right-4 top-16 select-none lg:right-10"
        >
          <span
            className="absolute -inset-6 backdrop-blur-[10px]"
            style={{
              maskImage: "radial-gradient(closest-side, #000 25%, transparent 92%)",
              WebkitMaskImage: "radial-gradient(closest-side, #000 25%, transparent 92%)",
            }}
          />
          <span
            data-t="glyph"
            className="relative block font-heading text-[16rem] font-extrabold leading-[0.7] text-orange opacity-[0.12] lg:text-[22rem]"
          >
            &ldquo;
          </span>
        </span>

        <blockquote className="relative mt-14">
          <p className="min-h-[150px] font-heading text-[1.75rem] font-bold leading-[1.3] tracking-[-0.035em] text-ink sm:text-[2.5rem] sm:leading-[1.25]">
            {words.map((w, i) => (
              /* Two spans per word: the outer is the mask the word rises out of,
                 the inner is what GSAP moves. The right margin lives on the mask
                 so the gap never travels with the word. */
              <span
                key={`${index}-${i}`}
                className="mr-[0.26em] inline-block overflow-hidden pb-[0.08em] align-bottom"
              >
                <span data-t="word" className="relative inline-block">
                  {w.lit && (
                    <span
                      data-t="marker"
                      aria-hidden
                      className="absolute inset-x-[-0.06em] bottom-[0.1em] h-[0.44em] origin-left rounded-[3px] bg-gradient-to-r from-orange/30 to-amber/30"
                    />
                  )}
                  <span className="relative">{w.text}</span>
                </span>
              </span>
            ))}
          </p>

          {/*
            ── Attribution ──────────────────────────────────────────────
            Row on larger screens, stacked on phones.

            At 360-390px the row layout left ~100px for the name column once
            the fixed-width plate (160px) and its gaps were subtracted — every
            line broke after one or two words ("Rohan" / "Wijeratne" / "Head
            of" / "Programmes" / "CENTRE FOR" / "BANKING" / "STUDIES"), which
            reads as broken rather than as a design. Stacking below `sm` gives
            the name block the full measure; the vertical rule only means
            something as a row divider, so it stands down with the layout that
            needed it.
          */}
          <footer className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
            <QuoteLogo item={item} />
            <span
              data-t="attrib-rule"
              aria-hidden
              className="hidden h-14 w-px origin-top bg-gradient-to-b from-orange to-amber sm:block"
            />
            <span>
              <span
                data-t="attrib"
                className="block font-heading text-lg font-bold tracking-[-0.02em] text-ink sm:text-xl"
              >
                {item.name}
              </span>
              {/* Role above organisation: it is the line that differs between
                  slides while the names are still unfilled, so it carries the
                  job of telling them apart. */}
              <span
                data-t="attrib"
                className="mt-1 block text-sm text-ink-muted"
              >
                {item.role}
              </span>
              <span
                data-t="attrib"
                className="mt-1.5 block font-mono text-[11px] uppercase tracking-[0.22em] text-orange"
              >
                {item.org}
              </span>
            </span>
          </footer>
        </blockquote>

        {/* ── Controls ─────────────────────────────────────────────────── */}
        <div data-t="controls" className="mt-12 flex items-center gap-4">
          <NavButton label="Previous testimonial" onClick={() => go(-1)}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </NavButton>

          {/* Next, wrapped in the autoplay ring it shares a centre with. */}
          <span className="relative flex h-[58px] w-[58px] items-center justify-center">
            <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
              <circle cx="24" cy="24" r="21" fill="none" stroke="var(--color-border)" strokeWidth="2" />
              <circle
                ref={ringRef}
                cx="24"
                cy="24"
                r="21"
                fill="none"
                stroke="url(#tm-ring)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={RING}
                strokeDashoffset={RING}
              />
              <defs>
                <linearGradient id="tm-ring" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" style={{ stopColor: "var(--color-orange)" }} />
                  <stop offset="100%" style={{ stopColor: "var(--color-amber)" }} />
                </linearGradient>
              </defs>
            </svg>
            <NavButton label="Next testimonial" onClick={() => go(1)}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </NavButton>
          </span>

          <span className="tnum ml-2 font-mono text-[11px] tracking-[0.2em] text-ink-soft">
            <span className="text-ink">{String(index + 1).padStart(2, "0")}</span>
            {" / "}
            {String(QUOTES.length).padStart(2, "0")}
          </span>

          <span className="ml-auto hidden items-center gap-1.5 sm:flex">
            {QUOTES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Testimonial ${i + 1}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className="group py-3"
              >
                <span
                  className={`block h-0.5 rounded-full transition-all duration-500 ${
                    i === index
                      ? "w-10 bg-gradient-to-r from-orange to-amber"
                      : "w-5 bg-border-strong group-hover:bg-orange/50"
                  }`}
                />
              </button>
            ))}
          </span>
        </div>

        {/* ── The current ──────────────────────────────────────────────── */}
        <div className="relative mt-12 h-[150px]">
          {/*
           * The current: a horizontal gradient line running the full bleed of
           * the section.
           *
           * It gets its own band in the flow rather than being laid over the
           * content. Threading it behind the quote and the logo plate put a
           * moving line through the words and the attribution — the two things
           * this section exists to make legible. A reserved strip of empty
           * space below the controls costs a little height and takes nothing
           * away.
           *
           * `preserveAspectRatio="none"` lets one 1440-unit path stretch to any
           * viewport width, and `vector-effect: non-scaling-stroke` is what makes
           * that survivable — without it the stroke stretches with the geometry and
           * the line renders as a 0.5px hair on a phone and a slab on a wide
           * monitor.
           *
           */}
          <svg
            ref={currentRef}
            aria-hidden
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[150px] w-screen -translate-x-1/2 -translate-y-1/2"
          >
            <defs>
          <linearGradient id="tm-current" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" style={{ stopColor: "var(--color-orange)" }} stopOpacity="0" />
            <stop offset="22%" style={{ stopColor: "var(--color-orange)" }} />
            <stop offset="55%" style={{ stopColor: "var(--color-amber)" }} />
            <stop offset="78%" style={{ stopColor: "var(--color-orange)" }} />
            <stop offset="100%" style={{ stopColor: "var(--color-orange)" }} stopOpacity="0" />
          </linearGradient>
            </defs>

            {WAVES.map((w) => (
          <g key={w.y} transform={`translate(0 ${w.y})`}>
            <path
              data-wave
              d={WAVE_A}
              fill="none"
              stroke="url(#tm-current)"
              strokeWidth={w.width}
              strokeLinecap="round"
              opacity={w.opacity}
              vectorEffect="non-scaling-stroke"
              /* Dash array equal to more than the path's own length, so a single
                 dashoffset tween draws the whole line on from the left. */
              strokeDasharray="3000"
              strokeDashoffset="3000"
            />
          </g>
            ))}

            {/* The charge: a short bright segment that keeps running the length of
            the line, which is what turns a drawn curve into a current. */}
            <path
          data-charge
          d={WAVE_A}
          fill="none"
          stroke="url(#tm-current)"
          strokeWidth="2.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          strokeDasharray="90 2200"
          strokeDashoffset="0"
            />
          </svg>
        </div>

        {/* ── Customer logo wall ───────────────────────────────────────── */}
        <div data-t="wall-group" className="mt-4 border-t border-border pt-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink-soft">
            Organizations we work with
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {CUSTOMER_LOGOS.map((logo) => (
              <span
                key={logo.src}
                data-t="wall"
                title={logo.name}
                className="flex h-16 w-36 shrink-0 items-center justify-center rounded-card border border-border bg-white p-3.5 opacity-70 shadow-[var(--shadow-sm)] grayscale transition-[filter,opacity,box-shadow,transform] duration-500 hover:-translate-y-1 hover:opacity-100 hover:shadow-[var(--shadow-card)] hover:grayscale-0"
              >
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={144}
                  height={64}
                  className="h-full w-full object-contain"
                />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The customer's mark, given real presence beside the quote. Falls back to a
 * drafting placeholder — dashed, labelled, obviously unfinished — so an empty
 * slot reads as pending artwork rather than as a broken image.
 */
function QuoteLogo({ item }: { item: Quote }) {
  /*
   * No artwork: a monogram, not a dashed "Logo" box.
   *
   * The dashed box was honest about being empty and looked like a bug at the
   * same time — it read as a broken image beside a finished quote. Initials on
   * the brand plate occupy the same footprint, sit at the same weight as a real
   * logo, and are a legitimate final state for a customer who has no usable
   * artwork, so the slide is presentable whether or not a file ever arrives.
   */
  if (!item.logo) {
    const monogram = item.org
      .split(/\s+/)
      .filter((w) => /^[A-Za-z]/.test(w) && w.length > 2)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("");

    return (
      <span
        data-t="plate"
        aria-hidden
        className="relative flex h-20 w-40 shrink-0 origin-center items-center justify-center overflow-hidden rounded-card border border-border bg-surface shadow-[var(--shadow-card)]"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-[-40%] w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-black/[0.06] to-transparent"
          style={{ animation: "mark-sweep 9s ease-in-out infinite" }}
        />
        <span className="relative bg-gradient-to-br from-orange to-amber bg-clip-text font-heading text-2xl font-extrabold tracking-[-0.04em] text-transparent">
          {monogram}
        </span>
      </span>
    );
  }
  return (
    <span
      data-t="plate"
      className="relative flex h-20 w-40 shrink-0 origin-center items-center justify-center overflow-hidden rounded-card border border-border bg-white p-4 shadow-[var(--shadow-card)]"
    >
      {/* Specular sweep, so the plate reads as a lit object rather than a box. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-[-40%] w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-black/[0.06] to-transparent"
        style={{ animation: "mark-sweep 9s ease-in-out infinite" }}
      />
      <Image
        src={item.logo}
        alt={item.org}
        width={160}
        height={80}
        className="relative h-full w-full object-contain"
      />
    </span>
  );
}

function NavButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-ember to-orange text-white shadow-[var(--shadow-ember)] transition-transform duration-300 hover:scale-110 active:scale-95"
    >
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 to-transparent" />
      <span className="relative">{children}</span>
    </button>
  );
}
