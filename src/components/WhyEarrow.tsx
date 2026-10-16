"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { SectionLabel, SectionHeading, GhostCta } from "./ui";
import { withBasePath } from "@/lib/basePath";
import { SPRING_SOFT, CountUp } from "./motion-kit";

/*
 * Brief §05 — the section that has to feel earned rather than claimed.
 *
 * It is built as a scene, not a layout: three depth planes moving at different
 * rates against the scroll (aurora behind, type in the middle, the orange plate
 * in front), figures that count up as they arrive, and a plate carrying its own
 * light — a slow specular sweep, a rotating sheen and a vignette. Parallax is
 * what makes a flat page read as a camera move; the differing rates are the
 * whole effect, so they are set here in one place rather than scattered.
 *
 * Still white-first. The colour budget has exactly one large orange field on
 * the page (the final CTA) and one black section (Industries), so the cinema
 * here is made of light and motion rather than another dark band.
 */

const PROOF = [
  { value: "150+", label: "Customers" },
  { value: "10+", label: "Products" },
  { value: "20+", label: "Years" },
  { value: "Enterprise", label: "Expertise" },
];

const FOUNDED = 2005;

/*
 * The left column animates as one orchestrated group rather than as a set of
 * independently observed elements — see the note on the numeral's mask below
 * for why self-triggering does not work there.
 */
const COLUMN = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
} as const;

const NUMERAL = {
  hidden: { y: "110%" },
  show: { y: "0%", transition: { duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.05 } },
} as const;

export default function WhyEarrow() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  /*
   * Progress across the section's own travel through the viewport, 0 as its top
   * meets the bottom edge and 1 as its bottom leaves the top. Spring-smoothed
   * because Lenis already lerps the scroll position and a raw mapping of a
   * lerped value shows its steps on the trailing frames.
   */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.6 });

  /* Three planes, three rates. Depth is the ratio between them, not the size. */
  const yAurora = useTransform(p, [0, 1], ["-8%", "12%"]);
  const yType = useTransform(p, [0, 1], [26, -26]);
  /*
   * Kept to ±54px, not more. The plate is vertically centred in its column and
   * the proof row sits directly beneath it, so a larger throw walks the plate
   * into the cards at the extremes — parallax reads as depth only while nothing
   * appears to collide.
   */
  const yPlate = useTransform(p, [0, 1], [54, -54]);
  const railFill = useTransform(p, [0.15, 0.7], ["0%", "100%"]);

  /* Under reduced motion every plane sits still and the rail is simply full. */
  const still = reduced ? {} : { y: yType };
  const stillPlate = reduced ? {} : { y: yPlate };

  return (
    <section
      id="why"
      ref={sectionRef}
      className="tech-grid relative overflow-hidden bg-canvas py-8 lg:py-6"
    >
      {/* ── Plane 1: the aurora, furthest back and slowest ──────────────── */}
      <motion.div
        aria-hidden
        style={reduced ? undefined : { y: yAurora }}
        className="pointer-events-none absolute inset-x-0 -top-32 -bottom-32"
      >
        <span
          className="absolute left-[-10%] top-[8%] h-[560px] w-[560px] rounded-full opacity-60"
          style={{ background: "radial-gradient(circle, rgba(var(--amber-ch), 0.22), transparent 68%)" }}
        />
        <span
          className="absolute right-[-12%] bottom-[6%] h-[620px] w-[620px] rounded-full opacity-50"
          style={{ background: "radial-gradient(circle, rgba(var(--orange-ch), 0.18), transparent 70%)" }}
        />
      </motion.div>

      {/* Letterbox rules — the frame edge of the shot, hairline not black bars. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border-strong to-transparent"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border-strong to-transparent"
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <SectionLabel index="05">Why eArrow</SectionLabel>
        <SectionHeading>Experience that creates impact</SectionHeading>

        <div className="mt-6 grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14">
          {/* ── Plane 2: the headline figure ─────────────────────────────── */}
          <motion.div style={still}>
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              variants={COLUMN}
            >
            {/*
             * The numeral rises from behind its own baseline rather than fading
             * in place — the same reveal the hero uses on its headline, and what
             * makes the entrance read as a camera move rather than a tween.
             *
             * It is driven by a variant inherited from the parent, not by its own
             * `whileInView`. That is not a style choice: the mask is
             * `overflow: hidden`, and IntersectionObserver clips its intersection
             * rect to overflow ancestors — so an element parked outside its own
             * mask never reports as visible, and a self-triggered reveal would
             * deadlock, permanently hidden.
             */}
            <span className="block overflow-hidden pb-2">
              <motion.span
                variants={NUMERAL}
                className="block font-heading text-[5.59rem] font-extrabold leading-[0.82] tracking-[-0.06em] sm:text-[7.31rem]"
              >
                <span className="bg-gradient-to-br from-orange to-amber bg-clip-text text-transparent">
                  <CountUp value="20+" duration={2} />
                </span>
              </motion.span>
            </span>

            <p className="mt-5 font-mono text-[11px] font-medium uppercase tracking-[0.34em] text-ink">
              Years
            </p>
            <p className="mt-6 max-w-sm text-base leading-[1.75] text-ink-muted">
              Building technology that helps organizations move forward.
            </p>

            <GhostCta href="/contact" className="mt-8">
              Talk to our team
            </GhostCta>
            </motion.div>
          </motion.div>

          {/* ── Plane 3: the orange plate, nearest and fastest ────────────── */}
          <motion.div style={stillPlate}>
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={SPRING_SOFT}
              /* `5/4`, not `aspect-square`. At 1920 the column is ~564px wide, so a
                 square panel was a 564px-tall box — on its own more than half a
                 900px viewport, and the single reason this section could not fit
                 one screen. It also overhung its grid cell far enough that the
                 stat row below collided with it. A slightly landscape panel holds
                 the same composition and gives back ~110px. */
              className="group relative aspect-[5/4] w-full overflow-hidden rounded-panel shadow-[var(--shadow-lift)] "
            >
              {/* growth, as one photograph — public/Home/whyearrow/growth.webp;
                  framed on the rising arrow and the hand that follows it */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={withBasePath("/Home/whyearrow/growth.webp")}
                alt="A hand tracing a glowing arrow rising above a bar chart"
                width={1000}
                height={1250}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover object-[55%_28%] transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
              />
              {/* a little shade at the foot, so the slate line reads */}
              <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 to-transparent" />

              {/* Slate line, bottom of frame. */}
              <span className="absolute bottom-6 left-7 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
                eArrow · est. {FOUNDED}
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Proof points ─────────────────────────────────────────────────
            The figures count up as they arrive, which turns four static labels
            into the moment the claim is actually made. */}
        <div className="relative z-10 mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {PROOF.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 26, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ y: -8, scale: 1.03 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ ...SPRING_SOFT, delay: i * 0.08 }}
              className="surface-card edge-sweep group relative overflow-hidden rounded-card px-5 py-7 transition-colors duration-400 hover:border-orange/30 sm:px-7 sm:py-8"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100"
                style={{ background: "radial-gradient(circle, rgba(var(--amber-ch), 0.35), transparent 70%)" }}
              />
              {/*
                Sized down on narrow screens because one of these figures is a
                word, not a number: "Enterprise" needs 143px at 1.75rem and the
                card only offers ~107px on a phone, so it was being cut off by
                the card's own `overflow-hidden`. The numerals never came close
                to the edge, which is why it only showed on that one tile.
              */}
              <p className="relative font-heading text-[1.161rem] font-extrabold leading-none tracking-[-0.03em] text-ink sm:text-[1.505rem]">
                <CountUp value={item.value} />
              </p>
              <p className="relative mt-3 font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-ink-soft">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ── The years rail ───────────────────────────────────────────────
            A timeline that fills as the section passes: the span from founding
            to now, drawn rather than asserted. */}
        <div className="mt-9 flex items-center gap-5">
          <span className="font-mono text-[10px] tracking-[0.22em] text-ink-soft">{FOUNDED}</span>
          <span className="relative h-px flex-1 overflow-hidden bg-border">
            <motion.span
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange to-amber"
              style={{ width: reduced ? "100%" : railFill }}
            />
          </span>
          <span className="font-mono text-[10px] tracking-[0.22em] text-ink">Today</span>
        </div>
      </div>
    </section>
  );
}
