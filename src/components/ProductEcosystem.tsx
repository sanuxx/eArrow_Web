"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { ArrowGlyph, QMarkLight } from "./ArrowMark";
import { PRODUCT_MARKS } from "./ProductMarks";
import { SectionLabel, SectionHeading } from "./ui";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

/*
 * Brief §05 — "Instead of showing every product as a traditional list, create
 * an interactive product ecosystem. The center could use the new eArrow arrow
 * symbol. When the user selects a product, the surrounding interface changes."
 *
 * Structure: an editorial index. Seven numbered full-width rules stacked like
 * the contents page of a journal; the selected one opens *in place* into a
 * drawer carrying its copy, its modules and the mark, pushing the rest of the
 * index down. No tabs, no widget, no diagram to decode — the page reads as
 * type first and reveals the system on demand.
 *
 * The brief's centre mark lives inside the open drawer, carrying one spoke per
 * module of that product. So the geometry genuinely rebuilds per selection
 * rather than relighting: three spokes for E-Billing, five for HR & Payroll.
 *
 * GSAP drives this in three clocks that never touch the same property on the
 * same element:
 *
 *   1. ASSEMBLY — one-shot ScrollTrigger timeline. The rules draw left to
 *      right and the rows rise behind them.
 *   2. DRIFT — scrubbed across the section's travel: the oversized folio
 *      numeral inside the open drawer parallaxes against the type.
 *   3. SELECTION — the outgoing drawer collapses, the incoming one opens to
 *      measured height, its contents stagger in, the spokes draw out of the
 *      mark and a charge runs along each one.
 *
 * framer-motion is deliberately absent: both libraries write inline
 * `transform`, and two writers on one element is the classic way to get
 * something that jitters or sticks. Hover and press stay CSS, on elements GSAP
 * never selects, so the two never meet.
 */

const PRODUCTS = [
  {
    key: "workforce",
    id: "WF-01",
    label: "HR & Payroll",
    domain: "Workforce",
    blurb: "One employee record from hiring through payroll, attendance and appraisals.",
    modules: ["Payroll", "Attendance", "Self-Service", "Performance", "Reporting"],
  },
  {
    key: "education",
    id: "ED-02",
    label: "Education",
    domain: "Academic Operations",
    blurb: "Admissions, student records, billing and academic workflows on one platform.",
    modules: ["Student Information", "Admissions", "Billing", "Academic Ops"],
  },
  {
    key: "healthcare",
    id: "HC-03",
    label: "Hospital",
    domain: "Patient Care",
    blurb: "Unified patient records and billing across every department.",
    modules: ["Patient Records", "Billing", "Insurance", "Departments"],
  },
  {
    key: "manufacturing",
    id: "MF-04",
    label: "Production",
    domain: "Operations",
    blurb: "Live visibility into production runs, inventory levels and quality checks.",
    modules: ["Production", "Inventory", "Quality Control", "Reporting"],
  },
  {
    key: "billing",
    id: "FN-05",
    label: "E-Billing",
    domain: "Finance",
    blurb: "Automated billing cycles and bulk distribution at enterprise scale.",
    modules: ["E-Billing", "Bulk E-mail", "Reconciliation"],
  },
  {
    key: "visitor",
    id: "SC-06",
    label: "Visitors",
    domain: "Security",
    blurb: "Controlled, auditable access across sites and facilities.",
    modules: ["Visitor Management", "Access Control", "Audit Trail"],
  },
  {
    key: "digital",
    id: "DX-07",
    label: "Digital",
    domain: "Experience",
    blurb: "Websites, portals and commerce platforms built for growth.",
    modules: ["Web Platforms", "E-Commerce", "Portals"],
  },
];

/** Spoke length, in the schematic's 0-100 viewBox units. */
const SPOKE = 30;

/*
 * Every polar coordinate is rounded before it reaches the DOM.
 *
 * `Math.sin`/`Math.cos` are implementation-defined past a couple of ulps and
 * Node and the browser disagree on the last digit, which React reports as a
 * hydration mismatch on server-rendered SVG. Four decimals is far below a
 * subpixel at any size this renders, and it makes both sides emit one string.
 */
const round = (n: number) => Math.round(n * 1e4) / 1e4;

/** Polar -> viewBox coordinates for module `i` of `n`, starting at twelve o'clock. */
function modPos(i: number, n: number, radius = SPOKE) {
  const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
  return {
    x: round(50 + Math.cos(angle) * radius),
    y: round(50 + Math.sin(angle) * radius),
  };
}

/** Ticks around the schematic's rim — the instrument bezel. */
const TICKS = Array.from({ length: 48 }, (_, i) => {
  const a = (i / 48) * Math.PI * 2;
  const long = i % 4 === 0;
  const inner = long ? 42 : 44;
  return {
    x1: round(50 + Math.cos(a) * 46),
    y1: round(50 + Math.sin(a) * 46),
    x2: round(50 + Math.cos(a) * inner),
    y2: round(50 + Math.sin(a) * inner),
    long,
  };
});

const num = (i: number) => String(i + 1).padStart(2, "0");

export default function ProductEcosystem() {
  const [active, setActive] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const drawerRefs = useRef<(HTMLDivElement | null)[]>([]);

  /*
   * The index the selection timeline last ran for.
   *
   * A plain `didMount` boolean is not enough: React StrictMode invokes effects
   * twice on mount (run, clean up, run again), so the second pass would find
   * the flag already set and fire the whole selection sequence at mount, while
   * the assembly timeline still holds those elements pre-reveal. Comparing the
   * *value* means both mount passes are no-ops and only a real change animates.
   */
  const lastAnimated = useRef<number | null>(null);

  /** Opens drawer `i` to its measured height and collapses every other one. */
  const setDrawers = useCallback((i: number, animate: boolean) => {
    drawerRefs.current.forEach((el, j) => {
      if (!el) return;
      const open = j === i;
      if (!animate || prefersReducedMotion()) {
        gsap.set(el, { height: open ? "auto" : 0 });
        return;
      }
      gsap.to(el, {
        /*
         * GSAP measures `auto` itself, which is the whole reason the drawer can
         * hold arbitrary content without a hard-coded height. The refresh
         * afterwards is not optional: this section changes height on every
         * toggle, so every ScrollTrigger start/end below it on the page is
         * stale until it is recalculated.
         */
        height: open ? "auto" : 0,
        duration: 0.6,
        ease: "power3.inOut",
        onComplete: () => ScrollTrigger.refresh(),
      });
    });
  }, []);

  /* ── 1 & 2: assembly and drift ──────────────────────────────────────── */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    setDrawers(0, false);

    /*
     * GSAP writes inline styles from its own rAF loop, so the global
     * reduced-motion CSS block cannot reach it — the guard has to be explicit.
     * The fallback is not "no animation" but "the finished frame": everything
     * below is authored from an invisible start state, so skipping the timeline
     * without setting the end state would leave the index blank.
     */
    if (prefersReducedMotion()) {
      gsap.set(root.querySelectorAll("[data-eco]"), { opacity: 1, scaleX: 1, x: 0, y: 0 });
      gsap.set(root.querySelectorAll("[data-spoke]"), { strokeDashoffset: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      /* ── Assembly: the rules draw, the rows rise behind them ────────── */
      gsap
        .timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: root, start: "top 72%", once: true },
        })
        .from("[data-eco='rule']", {
          scaleX: 0,
          duration: 0.7,
          stagger: 0.07,
          ease: "power2.inOut",
        })
        .from(
          "[data-eco='row']",
          { y: 26, opacity: 0, duration: 0.6, stagger: 0.07 },
          "-=0.75",
        )
        .from("[data-eco='folio-wrap']", { opacity: 0, scale: 1.12, duration: 1.1 }, "-=0.9");

      /* ── Drift: the folio numerals run against the type ─────────────── */
      gsap.fromTo(
        "[data-eco='folio']",
        { yPercent: 9 },
        {
          yPercent: -9,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.1,
          },
        },
      );
    }, root);

    const settle = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(settle);
      ctx.revert();
    };
  }, [setDrawers]);

  /* ── 3: selection ───────────────────────────────────────────────────── */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const previous = lastAnimated.current;
    lastAnimated.current = active;
    if (previous === null || previous === active) return;

    setDrawers(active, true);

    if (prefersReducedMotion()) return;

    const drawer = drawerRefs.current[active];
    if (!drawer) return;
    const count = PRODUCTS[active].modules.length;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      /*
       * `fromTo`, not `from`, throughout.
       *
       * `from` reads its end value off the element at init time, and these
       * elements are also touched by the assembly timeline — so a `from` could
       * record whatever was being held (opacity 0) as its *destination* and
       * animate 0 -> 0, leaving the drawer blank. Stating the end value removes
       * the dependency on who wrote last.
       */
      tl.fromTo(
        drawer.querySelectorAll("[data-eco='drawer-item']"),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.05 },
        0.15,
      )
        .fromTo(
          drawer.querySelectorAll("[data-spoke]"),
          { strokeDashoffset: SPOKE },
          { strokeDashoffset: 0, duration: 0.5, stagger: 0.05, ease: "power2.inOut" },
          0.2,
        )
        .fromTo(
          drawer.querySelectorAll("[data-eco='mod']"),
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.45, stagger: 0.05, ease: "back.out(2)" },
          0.4,
        )
        .fromTo(
          drawer.querySelectorAll("[data-eco='core']"),
          { scale: 0.5, rotate: -30, opacity: 0 },
          { scale: 1, rotate: 0, opacity: 1, duration: 0.7, ease: "back.out(1.7)" },
          0.2,
        )
        .fromTo(
          drawer.querySelectorAll("[data-eco='halo']"),
          { scale: 0.9, opacity: 0.5 },
          { scale: 1.4, opacity: 0, duration: 0.9, ease: "power2.out" },
          0.3,
        )
        /* One charge per spoke, running out from the mark to its tile. Added as
           a callback because each charge has a different destination, which a
           single staggered tween cannot express. */
        .add(() => {
          drawer.querySelectorAll("[data-charge]").forEach((el, i) => {
            const { x, y } = modPos(i, count);
            gsap.fromTo(
              el,
              { attr: { cx: 50, cy: 50 }, opacity: 1 },
              {
                attr: { cx: x, cy: y },
                duration: 0.5,
                delay: i * 0.05,
                ease: "power2.inOut",
                onComplete: () => gsap.to(el, { opacity: 0, duration: 0.2 }),
              },
            );
          });
        }, 0.35);

      /* The folio numeral arrives with the drawer it belongs to. */
      gsap.fromTo(
        drawer.querySelectorAll("[data-eco='folio-wrap']"),
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
      );
    }, root);

    /*
     * `kill`, not `revert`. Revert restores the inline styles this context
     * snapshotted when it was created — which, for elements the assembly
     * timeline also owns, means writing a stale pre-reveal state back over a
     * finished one. Killing stops the tweens and leaves the DOM where it is.
     */
    return () => ctx.kill();
  }, [active, setDrawers]);

  return (
    <section
      id="products"
      className="tech-grid relative overflow-hidden bg-canvas-alt py-24 lg:py-32"
    >
      <div ref={rootRef} className="relative mx-auto max-w-7xl px-6 lg:px-12">
        {/* The oversized index numeral, set in the outer margin like a folio
            and parallaxed against the type. Anchored to the *foot* of the
            index, where the closed rows leave open space — level with the open
            drawer it sat behind the mark and muddied it. Decorative: the real
            numeral is on the row itself, so this one is hidden from assistive
            tech. */}
        <SectionLabel index="02">Product Ecosystem</SectionLabel>
        <SectionHeading>One ecosystem. Multiple possibilities.</SectionHeading>

        <div className="relative mt-16">
          {PRODUCTS.map((p, i) => {
            const isOpen = i === active;
            const n = p.modules.length;
            const Mark = PRODUCT_MARKS[p.key];

            return (
              <div key={p.key} className="relative">
                {/* The rule is its own element rather than a border, so the
                    assembly timeline can draw it left to right. */}
                <span
                  data-eco="rule"
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px origin-left bg-border"
                />

                <h3 data-eco="row">
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-expanded={isOpen}
                    aria-controls={`eco-drawer-${p.key}`}
                    className="group relative flex w-full items-center gap-5 py-7 text-left sm:gap-8"
                  >
                    {/* Hover fill, wiping in from the left edge. */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-[-1.5rem] inset-y-0 origin-left scale-x-0 bg-gradient-to-r from-orange/[0.06] to-transparent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                    />

                    <span
                      className={`relative shrink-0 font-mono text-[11px] tracking-[0.2em] transition-colors duration-300 ${
                        isOpen ? "text-orange" : "text-ink-soft"
                      }`}
                    >
                      {num(i)}
                    </span>

                    <span
                      aria-hidden
                      className={`relative hidden h-px shrink-0 transition-all duration-500 sm:block ${
                        isOpen
                          ? "w-16 bg-gradient-to-r from-orange to-amber"
                          : "w-10 bg-border-strong group-hover:w-14"
                      }`}
                    />

                    <span
                      className={`relative flex-1 font-heading text-[1.5rem] font-bold leading-tight tracking-[-0.03em] transition-colors duration-300 sm:text-[2rem] ${
                        isOpen ? "text-ink" : "text-ink-muted group-hover:text-ink"
                      }`}
                    >
                      {p.label}
                    </span>

                    <span className="relative hidden font-mono text-[10px] uppercase tracking-[0.24em] text-ink-soft md:block">
                      {p.domain}
                    </span>

                    {/* Rotates a quarter turn when its row is the open one. */}
                    <span
                      aria-hidden
                      className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ${
                        isOpen
                          ? "rotate-90 border-transparent bg-gradient-to-br from-ember to-orange text-white"
                          : "border-border-strong text-ink group-hover:border-orange/50 group-hover:text-orange"
                      }`}
                    >
                      <ArrowGlyph className="h-3 w-3" />
                    </span>
                  </button>
                </h3>

                {/* The drawer. Always rendered and height-animated, so its
                    content is in the DOM for search and assistive tech even
                    while collapsed — and GSAP has something to measure. */}
                <div
                  id={`eco-drawer-${p.key}`}
                  ref={(el) => {
                    drawerRefs.current[i] = el;
                  }}
                  className="h-0 overflow-hidden"
                >
                                    {/*
                   * The schematic track is a fixed 280px, not `auto`. In an
                   * `auto` track a child sized `w-full` resolves its width
                   * against a track whose width is itself derived from that
                   * child — so it overflowed the grid and got clipped by the
                   * section. The left indent aligns the drawer under the row's
                   * title rather than its numeral, which is what makes the
                   * block read as an index entry instead of a new section.
                   */}
                  <div className="relative grid grid-cols-1 gap-10 pb-12 lg:grid-cols-[1fr_280px] lg:items-center lg:gap-16 lg:pl-[7.5rem]">
                    {/*
                     * The folio numeral belongs to the open product, so it lives
                     * in that product's own content rather than floating in the
                     * section's corner: it opens, drifts and leaves with the
                     * drawer, and the drawer's `overflow: hidden` crops it to
                     * exactly the field it describes.
                     *
                     * Painted first and given no z-index, so it sits *behind*
                     * the copy. That ordering is what keeps the text crisp — the
                     * frosted pane below blurs only what is behind it, which
                     * here is the section's grid, never anything you have to
                     * read.
                     */}
                    <span
                      data-eco="folio-wrap"
                      aria-hidden
                      className="pointer-events-none absolute bottom-4 left-0 hidden select-none lg:block"
                    >
                      <span
                        className="absolute -inset-4 backdrop-blur-[10px]"
                        style={{
                          maskImage: "radial-gradient(closest-side, #000 28%, transparent 94%)",
                          WebkitMaskImage:
                            "radial-gradient(closest-side, #000 28%, transparent 94%)",
                        }}
                      />
                      {/*
                       * Opacity lives on the glyphs, never on the wrapper: GSAP
                       * animates the wrapper, and sharing one property meant the
                       * tween wrote `opacity: 1` inline over the faintness class
                       * — the numeral slammed to full strength, a white slab in
                       * dark mode.
                       *
                       * The leading is 0.95 rather than the tighter value the
                       * type would take elsewhere: the drawer is
                       * `overflow: hidden` for the height animation, and a line
                       * box shorter than the glyphs lets their bottoms fall
                       * outside it and be cropped flat by the drawer edge.
                       */}
                      <span
                        data-eco="folio"
                        className="relative block font-heading text-[11rem] font-extrabold leading-[0.95] tracking-[-0.06em] text-ink opacity-[0.07]"
                      >
                        {num(i)}
                      </span>
                    </span>

                    <div className="relative max-w-xl">
                      <p
                        data-eco="drawer-item"
                        className="font-mono text-[10px] uppercase tracking-[0.24em] text-orange"
                      >
                        {p.id}
                      </p>
                      <p
                        data-eco="drawer-item"
                        className="mt-4 text-[1.0625rem] leading-[1.75] text-ink-muted"
                      >
                        {p.blurb}
                      </p>

                      <p
                        data-eco="drawer-item"
                        className="mt-8 font-mono text-[10px] uppercase tracking-[0.24em] text-ink-soft"
                      >
                        Modules · {String(n).padStart(2, "0")}
                      </p>
                      <ul className="mt-4 flex flex-wrap gap-2">
                        {p.modules.map((m) => (
                          <li
                            key={m}
                            data-eco="drawer-item"
                            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 text-xs font-medium text-ink"
                          >
                            <span className="h-1 w-1 rounded-full bg-orange" />
                            {m}
                          </li>
                        ))}
                      </ul>

                      <a
                        data-eco="drawer-item"
                        href="#contact"
                        className="group/cta mt-9 inline-flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-orange"
                      >
                        Discover {p.label}
                        <ArrowGlyph className="h-3 w-3 transition-transform duration-300 group-hover/cta:translate-x-1.5" />
                      </a>
                    </div>

                    {/* The mark, carrying one spoke per module. Unlabelled by
                        design — the names are chips on the left, and set around
                        a circle this size they would collide at every radius
                        that still reads as a circle. */}
                    <div
                      data-eco="drawer-item"
                      className="relative mx-auto aspect-square w-full max-w-[280px]"
                    >
                      <svg
                        viewBox="0 0 100 100"
                        className="absolute inset-0 h-full w-full"
                        aria-hidden
                      >
                        <defs>
                          <linearGradient id={`eco-spoke-${p.key}`} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" style={{ stopColor: "var(--color-orange)" }} />
                            <stop offset="100%" style={{ stopColor: "var(--color-amber)" }} />
                          </linearGradient>
                        </defs>

                        {TICKS.map((t, ti) => (
                          <line
                            key={ti}
                            x1={t.x1}
                            y1={t.y1}
                            x2={t.x2}
                            y2={t.y2}
                            stroke={t.long ? "var(--color-border-strong)" : "var(--color-border)"}
                            strokeWidth={t.long ? 0.45 : 0.3}
                          />
                        ))}

                        {p.modules.map((m, mi) => {
                          const { x, y } = modPos(mi, n);
                          return (
                            <line
                              key={m}
                              data-spoke={mi}
                              x1="50"
                              y1="50"
                              x2={x}
                              y2={y}
                              stroke={`url(#eco-spoke-${p.key})`}
                              strokeWidth="0.55"
                              strokeDasharray={SPOKE}
                              strokeDashoffset={isOpen ? 0 : SPOKE}
                            />
                          );
                        })}

                        {p.modules.map((m) => (
                          <circle
                            key={m}
                            data-charge
                            cx="50"
                            cy="50"
                            r="1.3"
                            fill={`url(#eco-spoke-${p.key})`}
                            opacity="0"
                          />
                        ))}
                      </svg>

                      {p.modules.map((m, mi) => {
                        const { x, y } = modPos(mi, n);
                        return (
                          <span
                            key={m}
                            title={m}
                            style={{ left: `${x}%`, top: `${y}%` }}
                            className="absolute -translate-x-1/2 -translate-y-1/2"
                          >
                            <span
                              data-eco="mod"
                              className="flex h-9 w-9 origin-center items-center justify-center rounded-tile border border-border bg-surface shadow-[var(--shadow-sm)]"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-orange to-amber" />
                            </span>
                          </span>
                        );
                      })}

                      <span
                        data-eco="halo"
                        aria-hidden
                        className="pointer-events-none absolute left-1/2 top-1/2 h-[52%] w-[52%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                        style={{
                          background:
                            "radial-gradient(circle, rgba(var(--orange-ch), 0.35), transparent 68%)",
                          opacity: 0,
                        }}
                      />

                      {/*
                       * The core carries the *product's* mark, not the corporate
                       * one. Every product used to show the same reused artwork,
                       * which said nothing about any of them and was a soft
                       * raster besides; these are vectors on a shared grid. See
                       * ProductMarks.tsx.
                       */}
                      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[32%] w-[32%] -translate-x-1/2 -translate-y-1/2">
                        <div
                          data-eco="core"
                          className="relative flex h-full w-full origin-center items-center justify-center rounded-[30%] bg-gradient-to-br from-orange to-amber shadow-[0_16px_40px_-12px_rgba(var(--orange-ch),0.75)]"
                        >
                          <span className="absolute inset-0 rounded-[30%] bg-gradient-to-b from-white/25 to-transparent" />
                          <span className="absolute inset-[7%] rounded-[26%] border border-white/25" />
                          <Mark className="relative h-[58%] w-[58%] text-white" />
                        </div>
                      </div>

                      {/*
                       * The corporate Q stays on the rim as a system badge. The
                       * brief asks for the eArrow symbol at the centre of the
                       * ecosystem; with the core now belonging to the product,
                       * this is where the identity signs the system instead.
                       */}
                      <span className="pointer-events-none absolute bottom-[-2%] left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 shadow-[var(--shadow-sm)]">
                        <QMarkLight
                          className="h-auto w-3.5"
                          style={{ filter: "var(--logo-filter)" }}
                        />
                        <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-ink-soft">
                          eArrow
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Closing rule, so the index reads as a bounded block. */}
          <span data-eco="rule" aria-hidden className="block h-px w-full origin-left bg-border" />
        </div>
      </div>
    </section>
  );
}
