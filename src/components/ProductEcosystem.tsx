"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { ArrowGlyph, QMarkLight } from "./ArrowMark";
import { PRODUCT_MARKS } from "./ProductMarks";
import { SectionLabel, SectionHeading } from "./ui";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/*
 * Brief §05 — "One ecosystem. Multiple possibilities."
 *
 *   "Instead of showing every product as a traditional list, create an
 *    interactive product ecosystem. The center could use the new eArrow
 *    arrow/Q symbol. When the user selects a product, the surrounding
 *    interface changes. This would make the rebrand feel much more
 *    sophisticated."
 *
 * This section previously rendered as an editorial index — seven numbered
 * full-width rules stacked like a contents page, each opening into a drawer.
 * It was a handsome layout and it was the one thing the brief rules out: a
 * traditional list. The ecosystem existed only *inside* a drawer, so the
 * organising idea was subordinate to the list rather than being the section.
 *
 * So the arrangement is now radial and the three clauses are load-bearing:
 *
 *   CENTRE      the eArrow Q carries the middle of the system, as asked. The
 *               product's own mark orbits rather than displacing the identity.
 *   ORBIT       seven products ring the mark. Selecting one rotates the whole
 *               ring so that product swings to twelve o'clock — the surrounding
 *               interface visibly re-arranges around the choice.
 *   PANEL       the detail beside it swaps with the selection, so "the
 *               surrounding interface changes" is literal, not implied.
 *
 * Rounded rectangles throughout, per the brief's visual language: the nodes are
 * rounded tiles, the core is a superellipse, the panel is a rounded card.
 *
 * TRANSFORM OWNERSHIP. Two writers on one element's transform is the classic
 * way to get something that jitters or sticks, and this section has both CSS
 * transitions and GSAP running. They are kept apart structurally rather than by
 * convention: the ring and each node's *position* are CSS-only, and GSAP is
 * given its own inner element to scale. Nothing is written by both.
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

const COUNT = PRODUCTS.length;
const STEP = 360 / COUNT;

/** Orbit radius, in the stage's 0-100 coordinate space. */
const RADIUS = 36;

/*
 * Every polar coordinate is rounded before it reaches the DOM.
 *
 * `Math.sin`/`Math.cos` are implementation-defined past a couple of ulps and
 * Node and the browser disagree on the last digit, which React reports as a
 * hydration mismatch on server-rendered SVG. Four decimals is far below a
 * subpixel at any size this renders, and it makes both sides emit one string.
 */
const round = (n: number) => Math.round(n * 1e4) / 1e4;

/** Polar -> stage coordinates for product `i`, starting at twelve o'clock. */
function orbitPos(i: number, radius = RADIUS) {
  const angle = (i / COUNT) * Math.PI * 2 - Math.PI / 2;
  return {
    x: round(50 + Math.cos(angle) * radius),
    y: round(50 + Math.sin(angle) * radius),
  };
}

/** Ticks around the stage rim — the instrument bezel. */
const TICKS = Array.from({ length: 56 }, (_, i) => {
  const a = (i / 56) * Math.PI * 2;
  const long = i % 4 === 0;
  const inner = long ? 44 : 46;
  return {
    x1: round(50 + Math.cos(a) * 48),
    y1: round(50 + Math.sin(a) * 48),
    x2: round(50 + Math.cos(a) * inner),
    y2: round(50 + Math.sin(a) * inner),
    long,
  };
});

const num = (i: number) => String(i + 1).padStart(2, "0");

export default function ProductEcosystem() {
  const [active, setActive] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

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

  const product = PRODUCTS[active];
  const ActiveMark = PRODUCT_MARKS[product.key];

  /*
   * The ring carries the selection: rotating it by -active*STEP swings the
   * chosen product to twelve o'clock. Each node counter-rotates by the same
   * amount so its tile and label stay upright while the ring turns.
   */
  const ringRotation = round(-active * STEP);

  /* ── Assembly ────────────────────────────────────────────────────────── */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    /*
     * GSAP writes inline styles from its own rAF loop, so the global
     * reduced-motion CSS block cannot reach it — the guard has to be explicit.
     * The fallback is not "no animation" but "the finished frame": everything
     * below is authored from an invisible start state, so skipping the timeline
     * without setting the end state would leave the ecosystem blank.
     */
    if (prefersReducedMotion()) {
      gsap.set(root.querySelectorAll("[data-eco]"), { opacity: 1, scale: 1, x: 0, y: 0 });
      gsap.set(root.querySelectorAll("[data-spoke]"), { strokeDashoffset: 0 });
      return;
    }

    /*
     * Triggered by IntersectionObserver rather than ScrollTrigger.
     *
     * ScrollTrigger resolves "top 72%" to a pixel offset when the timeline is
     * built, and this section's geometry settles *after* that — the product
     * marks and logo are images, and the panel's height depends on which
     * product is selected. The computed start went stale, the trigger never
     * fired, and because `.from()` renders its start state immediately the
     * seven product tiles were left permanently at opacity 0. An observer has
     * no cached coordinates to go stale, so it cannot fail that way.
     *
     * The failsafe matters more than the effect: a decorative entrance must
     * never be able to hide content for good, so the timeline is played
     * unconditionally after 6s even if the observer never reports.
     */
    let io: IntersectionObserver | undefined;
    let failsafe: number | undefined;

    const ctx = gsap.context(() => {
      const tl = gsap
        .timeline({ paused: true, defaults: { ease: "power3.out" } })
        .from("[data-eco='bezel']", { opacity: 0, scale: 0.9, duration: 0.9 })
        .from("[data-eco='core']", { opacity: 0, scale: 0.4, duration: 0.8 }, "-=0.6")
        .from(
          "[data-eco='node']",
          { opacity: 0, scale: 0.3, duration: 0.6, stagger: 0.06 },
          "-=0.45",
        )
        .fromTo(
          "[data-spoke]",
          { strokeDashoffset: RADIUS },
          { strokeDashoffset: 0, duration: 0.7, stagger: 0.05 },
          "-=0.5",
        )
        .from("[data-eco='panel-item']", { opacity: 0, y: 18, duration: 0.5, stagger: 0.06 }, "-=0.4");

      const play = () => {
        io?.disconnect();
        window.clearTimeout(failsafe);
        tl.play();
      };

      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) play();
        },
        { threshold: 0.15 },
      );
      io.observe(root);
      failsafe = window.setTimeout(play, 6000);
    }, root);

    return () => {
      io?.disconnect();
      window.clearTimeout(failsafe);
      ctx.revert();
    };
  }, []);

  /* ── Selection: the panel re-enters as the ring turns ────────────────── */
  useLayoutEffect(() => {
    if (lastAnimated.current === active) return;
    const first = lastAnimated.current === null;
    lastAnimated.current = active;
    if (first || prefersReducedMotion()) return;

    const panel = panelRef.current;
    if (!panel) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-eco='panel-item']",
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: "power3.out" },
      );
      /* The spokes redraw so the geometry rebuilds rather than merely relights. */
      gsap.fromTo(
        rootRef.current?.querySelectorAll("[data-spoke]") ?? [],
        { strokeDashoffset: RADIUS * 0.6 },
        { strokeDashoffset: 0, duration: 0.55, stagger: 0.03, ease: "power2.out" },
      );
    }, panel);

    return () => ctx.revert();
  }, [active]);

  /* Roving-tabindex keyboard support, the expected behaviour for a tablist. */
  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    const delta =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (!delta) return;
    event.preventDefault();
    setActive((current) => {
      const next = (current + delta + COUNT) % COUNT;
      tabRefs.current[next]?.focus();
      return next;
    });
  }, []);

  return (
    <section
      id="products"
      className="tech-grid relative overflow-hidden bg-canvas-alt py-10 lg:py-16"
    >
      <div ref={rootRef} className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <SectionLabel index="02">Product Ecosystem</SectionLabel>
        <SectionHeading>One ecosystem. Multiple possibilities.</SectionHeading>

        <div className="mt-16 grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* ── The orbit ──────────────────────────────────────────────── */}
          <div
            role="tablist"
            aria-label="Product ecosystem"
            aria-orientation="horizontal"
            onKeyDown={onKeyDown}
            className="relative mx-auto aspect-square w-full max-w-[540px]"
          >
            {/* Bezel — static, so the rim reads as an instrument the ring
                turns inside rather than as part of the rotating assembly. */}
            <svg
              data-eco="bezel"
              viewBox="0 0 100 100"
              className="absolute inset-0 h-full w-full"
              aria-hidden
            >
              {TICKS.map((t, ti) => (
                <line
                  key={ti}
                  x1={t.x1}
                  y1={t.y1}
                  x2={t.x2}
                  y2={t.y2}
                  stroke={t.long ? "var(--color-border-strong)" : "var(--color-border)"}
                  strokeWidth={t.long ? 0.4 : 0.25}
                />
              ))}
              <circle
                cx="50"
                cy="50"
                r={RADIUS}
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="0.25"
                strokeDasharray="1.4 2.2"
              />
            </svg>

            {/* Rotating layer. CSS owns this transform; GSAP never selects it. */}
            <div
              className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
              style={{ transform: `rotate(${ringRotation}deg)` }}
            >
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
                <defs>
                  <linearGradient id="eco-spoke-live" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" style={{ stopColor: "var(--color-orange)" }} />
                    <stop offset="100%" style={{ stopColor: "var(--color-amber)" }} />
                  </linearGradient>
                </defs>

                {PRODUCTS.map((p, i) => {
                  const { x, y } = orbitPos(i);
                  const live = i === active;
                  return (
                    <line
                      key={p.key}
                      data-spoke={i}
                      x1="50"
                      y1="50"
                      x2={x}
                      y2={y}
                      stroke={live ? "url(#eco-spoke-live)" : "var(--color-border-strong)"}
                      strokeWidth={live ? 0.7 : 0.3}
                      strokeDasharray={RADIUS}
                      className="transition-[stroke-width] duration-500"
                    />
                  );
                })}
              </svg>

              {PRODUCTS.map((p, i) => {
                const { x, y } = orbitPos(i);
                const live = i === active;
                const Mark = PRODUCT_MARKS[p.key];

                return (
                  <div
                    key={p.key}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      /* Counter-rotation keeps the tile upright as the ring turns. */
                      transform: `translate(-50%, -50%) rotate(${-ringRotation}deg)`,
                    }}
                    className="absolute transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
                  >
                    <button
                      ref={(el) => {
                        tabRefs.current[i] = el;
                      }}
                      type="button"
                      role="tab"
                      id={`eco-tab-${p.key}`}
                      aria-selected={live}
                      aria-controls="eco-panel"
                      tabIndex={live ? 0 : -1}
                      onClick={() => setActive(i)}
                      className="group flex flex-col items-center gap-2.5 outline-none"
                    >
                      {/*
                        Three elements, three owners of `transform`, none
                        shared: the grandparent holds position and
                        counter-rotation (CSS), this span is GSAP's alone for
                        the entrance, and the tile inside scales on selection
                        (CSS). Collapsing the last two into one element is what
                        broke the active state before — GSAP finished its
                        entrance by writing `scale: 1` inline, which outranks
                        Tailwind's `scale-110` and killed the selected tile's
                        lift for the rest of the session.
                      */}
                      <span data-eco="node" className="block">
                        <span
                          className={`relative flex h-14 w-14 items-center justify-center rounded-tile border transition-all duration-500 sm:h-16 sm:w-16 lg:h-[4.5rem] lg:w-[4.5rem] ${
                            live
                              ? "scale-110 border-transparent text-white shadow-[0_16px_40px_-12px_rgba(var(--orange-ch),0.75)]"
                              : "border-border bg-surface text-ink-muted shadow-[var(--shadow-sm)] group-hover:scale-105 group-hover:border-orange/45 group-hover:text-orange group-focus-visible:border-orange"
                          }`}
                          style={
                            live
                              ? {
                                  background:
                                    "linear-gradient(135deg, var(--color-orange), var(--color-amber))",
                                }
                              : undefined
                          }
                        >
                          {live && (
                            <span className="absolute inset-0 rounded-tile bg-gradient-to-b from-white/25 to-transparent" />
                          )}
                          {Mark && <Mark className="relative h-[52%] w-[52%]" />}
                        </span>
                      </span>

                      <span
                        className={`hidden font-mono text-[9px] uppercase tracking-[0.16em] transition-colors duration-300 sm:block ${
                          live ? "text-orange" : "text-ink-soft group-hover:text-ink"
                        }`}
                      >
                        {p.label}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/*
             * The centre carries the eArrow Q, as the brief asks. It does not
             * rotate: the identity is the fixed point the products orbit, which
             * is the whole claim the section is making.
             */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[27%] w-[27%] -translate-x-1/2 -translate-y-1/2">
              <div
                data-eco="core"
                className="relative flex h-full w-full items-center justify-center rounded-[30%] shadow-[0_18px_46px_-12px_rgba(var(--orange-ch),0.8)]"
                style={{
                  background: "linear-gradient(135deg, var(--color-ember), var(--color-orange) 55%, var(--color-amber))",
                }}
              >
                <span className="absolute inset-0 rounded-[30%] bg-gradient-to-b from-white/25 to-transparent" />
                <span className="absolute inset-[7%] rounded-[26%] border border-white/25" />
                <QMarkLight className="relative h-auto w-[46%]" />
              </div>

              {/* A soft halo so the centre reads as the system's source. */}
              <span
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[240%] w-[240%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(var(--orange-ch), 0.22), transparent 68%)",
                }}
              />
            </div>
          </div>

          {/* ── The surrounding interface, which changes with the selection ── */}
          <div
            ref={panelRef}
            id="eco-panel"
            role="tabpanel"
            aria-labelledby={`eco-tab-${product.key}`}
            className="surface-card relative overflow-hidden rounded-panel px-8 py-9 lg:px-10 lg:py-11"
          >
            <div className="flex items-center justify-between gap-4">
              <span
                data-eco="panel-item"
                className="flex h-12 w-12 items-center justify-center rounded-tile text-white shadow-[0_12px_30px_-10px_rgba(var(--orange-ch),0.7)]"
                style={{
                  background: "linear-gradient(135deg, var(--color-orange), var(--color-amber))",
                }}
              >
                {ActiveMark && <ActiveMark className="h-[54%] w-[54%]" />}
              </span>

              <span
                data-eco="panel-item"
                className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-soft"
              >
                {num(active)} / {num(COUNT - 1)}
              </span>
            </div>

            <p
              data-eco="panel-item"
              className="mt-7 font-mono text-[10px] uppercase tracking-[0.24em] text-orange"
            >
              {product.id} · {product.domain}
            </p>

            <h3
              data-eco="panel-item"
              className="mt-3 font-heading text-[1.505rem] font-bold leading-tight tracking-[-0.03em] text-ink sm:text-[1.72rem]"
            >
              {product.label}
            </h3>

            <p
              data-eco="panel-item"
              className="mt-4 text-base leading-[1.75] text-ink-muted"
            >
              {product.blurb}
            </p>

            <p
              data-eco="panel-item"
              className="mt-8 font-mono text-[10px] uppercase tracking-[0.24em] text-ink-soft"
            >
              Modules · {String(product.modules.length).padStart(2, "0")}
            </p>

            <ul className="mt-4 flex flex-wrap gap-2">
              {product.modules.map((m) => (
                <li
                  key={m}
                  data-eco="panel-item"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-sunken px-3.5 py-2 text-xs font-medium text-ink"
                >
                  <span className="h-1 w-1 rounded-full bg-gradient-to-br from-orange to-amber" />
                  {m}
                </li>
              ))}
            </ul>

            <a
              data-eco="panel-item"
              href="/contact"
              className="group/cta mt-9 inline-flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-orange"
            >
              Discover {product.label}
              <ArrowGlyph className="h-3 w-3 transition-transform duration-300 group-hover/cta:translate-x-1.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
