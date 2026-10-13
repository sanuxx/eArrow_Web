"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowGlyph } from "./ArrowMark";
import { SectionLabel, SectionHeading } from "./ui";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { withBasePath } from "@/lib/basePath";

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
    id: "HE-02",
    label: "Higher Education",
    domain: "Academic Operations",
    blurb: "Admissions, student records, billing and academic workflows on one platform.",
    modules: ["Student Information", "Admissions", "Billing", "Exams"],
  },
  {
    key: "ticketing",
    id: "TK-03",
    label: "Ticketing",
    domain: "Service Desk",
    blurb: "Every request logged, routed and tracked to resolution, with SLAs that are measured.",
    modules: ["Ticket Queues", "SLA Tracking", "Escalations", "Reporting"],
  },
  {
    key: "crm",
    id: "CR-04",
    label: "CRM",
    domain: "Customer Relationships",
    blurb: "Leads, accounts and every conversation with them, in one pipeline you can trust.",
    modules: ["Leads", "Accounts", "Pipeline", "Activities"],
  },
  {
    key: "uniconnect",
    id: "UC-05",
    label: "Uni Connect",
    domain: "Student Recruitment",
    blurb: "Every enquiry tracked from first contact to enrolment, with follow-ups that escalate.",
    modules: ["Leads & Inquiries", "Pipeline", "Follow-Ups", "Agent Portal"],
  },
  {
    key: "workflow",
    id: "WM-06",
    label: "Workflow",
    domain: "Process Automation",
    blurb: "Approvals and processes mapped once and run automatically, every step on record.",
    modules: ["Process Designer", "Approvals", "Forms", "Audit Trail"],
  },
  {
    key: "school",
    id: "SS-07",
    label: "School",
    domain: "School Administration",
    blurb: "Enrolment, attendance, fees, exams and parent communication, run from one system.",
    modules: ["Enrolment", "Attendance", "Fees", "Parent Portal"],
  },
];

/** How long each product holds before the ecosystem moves on by itself. */
const DWELL = 5.5;

const COUNT = PRODUCTS.length;

const num = (i: number) => String(i + 1).padStart(2, "0");

/* ── Phones: no orbit — the products as cards you swipe sideways ──
   Native scroll-snap does the swiping (momentum, rubber-banding, no JS on the
   gesture); GSAP only brings the cards in and keeps the dots in step. */
function MobileCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setCurrent(cards.indexOf(e.target as HTMLElement))),
      { root: track, threshold: 0.6 },
    );
    cards.forEach((c) => io.observe(c));
    let tw: gsap.core.Tween | undefined;
    if (!prefersReducedMotion()) {
      tw = gsap.fromTo(
        cards,
        { x: 60, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: "expo.out", scrollTrigger: { trigger: track, start: "top 85%", once: true } },
      );
    }
    return () => {
      io.disconnect();
      tw?.scrollTrigger?.kill();
      tw?.kill();
    };
  }, []);

  const goTo = (i: number) => {
    const card = trackRef.current?.children[i] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return (
    <div className="mt-10 md:hidden">
      <div
        ref={trackRef}
        className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {PRODUCTS.map((p) => {
          return (
            <article
              key={p.key}
              className="w-[82%] shrink-0 snap-center overflow-hidden rounded-[26px] border border-border bg-surface shadow-[0_20px_44px_-26px_rgba(var(--orange-ch),0.55)]"
            >
              <div className="relative aspect-[1.6] overflow-hidden bg-surface-sunken">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={withBasePath(`/products/${p.key}/1-sm.webp`)}
                  alt={`Arrow ${p.label} screen`}
                  loading="lazy"
                  className="h-full w-full object-cover object-left-top"
                />
                <span className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent" />
              </div>
              <div className="p-5">
                <h3 className="font-heading text-[1.3rem] font-bold tracking-[-0.02em] text-ink">Arrow {p.label}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{p.blurb}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.modules.map((m) => (
                    <span key={m} className="rounded-full bg-surface-sunken px-3 py-1 text-[11.5px] font-medium text-ink">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* dots, in step with the swipe; tap to jump */}
      <div className="mt-3 flex items-center justify-center gap-1.5">
        {PRODUCTS.map((p, i) => (
          <button
            key={p.key}
            type="button"
            aria-label={`Show Arrow ${p.label}`}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-orange" : "w-1.5 bg-ink-soft/40"}`}
          />
        ))}
      </div>
      <p className="mt-3 text-center text-[12px] text-ink-soft">Swipe to explore all seven products</p>
    </div>
  );
}

/* ── The dial (tablet and up) ────────────────────────────────────────────
 *
 * A black disc with an orange aurora drifting behind a glowing ring. The
 * products are numbered round the ring; a bright arc sits over the live one
 * and fills as its countdown, with the seconds left beside it. When it is
 * full the arc swings on to the next number. The live product's name sits in
 * the dark centre. Click a number to jump; hover to hold.
 *
 * Geometry is one 100×100 SVG. The arc lives in a group GSAP rotates (always
 * forwards, so 07 → 01 carries on clockwise rather than unwinding); the
 * countdown is a dash offset; everything else is opacity and transforms.
 */

const SLOT = 360 / COUNT;
const R_TRACK = 30; // the ring band the numbers sit on
const R_ARC = 36.5; // the live arc, just outside it
const polar = (deg: number, r: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: Math.round((50 + Math.cos(a) * r) * 1e3) / 1e3, y: Math.round((50 + Math.sin(a) * r) * 1e3) / 1e3 };
};
const slotPath = (r: number) => {
  const a = polar(0, r);
  const b = polar(SLOT, r);
  return `M ${a.x} ${a.y} A ${r} ${r} 0 0 1 ${b.x} ${b.y}`;
};

export default function ProductEcosystem() {
  const [active, setActive] = useState(0);
  const [engaged, setEngaged] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(SVGGElement | null)[]>([]);
  const turned = useRef(0); // accumulated arc rotation, degrees
  const lastAnimated = useRef<number | null>(null);

  const product = PRODUCTS[active];

  /* ── Assembly ── */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    let io: IntersectionObserver | undefined;
    let failsafe: number | undefined;
    const ctx = gsap.context(() => {
      const tl = gsap
        .timeline({ paused: true, defaults: { ease: "expo.out" } })
        .from("[data-dial='disc']", { scale: 0.86, opacity: 0, duration: 1.4 })
        .from("[data-dial='aurora']", { opacity: 0, scale: 0.6, duration: 2 }, 0.2)
        .fromTo("[data-dial='track']", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, ease: "power3.inOut", onComplete: () => root.querySelector("[data-dial='track']")?.removeAttribute("stroke-dasharray") }, 0.3)
        .from("[data-dial='num']", { opacity: 0, duration: 0.5, stagger: 0.07, ease: "none" }, 0.7)
        .from("[data-dial='arc']", { opacity: 0, duration: 0.6 }, 1.0)
        .from("[data-dial='centre'] > *", { y: 16, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.8)
        .from("[data-dial='side'] > *", { x: -12, opacity: 0, duration: 0.8, stagger: 0.06 }, 1.0)
        .from("[data-eco='panel-item']", { opacity: 0, y: 18, duration: 0.6, stagger: 0.06 }, 0.9)
        .from("[data-eco='screen']", { clipPath: "inset(0% 0% 100% 0%)", duration: 1.1, ease: "power4.inOut" }, 0.9);

      /* the aurora drifts round, the glow breathes */
      gsap.to("[data-dial='aurora']", { rotation: 360, duration: 26, ease: "none", repeat: -1 });
      gsap.to("[data-dial='glow']", { opacity: 0.55, scale: 1.04, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1 });

      const play = () => {
        io?.disconnect();
        window.clearTimeout(failsafe);
        tl.play();
      };
      io = new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && play(), { threshold: 0.2 });
      io.observe(root);
      failsafe = window.setTimeout(play, 6000);
    }, root);
    return () => {
      io?.disconnect();
      window.clearTimeout(failsafe);
      ctx.revert();
    };
  }, []);

  /* ── Selection: the arc swings to the slot, the centre and panel swap ── */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const arc = root.querySelector("[data-dial='arc']");
    /* forward by the shortest clockwise distance */
    const from = turned.current;
    const target = active * SLOT;
    /* the shortest way round, so 07 → 01 carries on clockwise */
    let delta = (((target - from) % 360) + 360) % 360;
    if (delta > 180) delta -= 360;
    const next = from + delta;
    turned.current = next;

    if (lastAnimated.current === active) return;
    const first = lastAnimated.current === null;
    lastAnimated.current = active;
    if (prefersReducedMotion() || first) {
      gsap.set(arc, { rotation: next, svgOrigin: "50 50" });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.to(arc, { rotation: next, svgOrigin: "50 50", duration: 0.9, ease: "expo.inOut" });
      gsap.fromTo("[data-dial='centre'] > *", { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: "expo.out", delay: 0.2 });
      gsap.fromTo("[data-eco='panel-item']", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: "power3.out" });
      gsap.fromTo("[data-eco='screen']", { clipPath: "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "power4.inOut" });
      gsap.fromTo("[data-eco='screen'] img", { scale: 1.12 }, { scale: 1, duration: 1.4, ease: "power3.out" });
    }, root);
    return () => ctx.revert();
  }, [active]);

  /* ── Countdown: the arc fills, the seconds tick down, then the next ── */
  useEffect(() => {
    const root = rootRef.current;
    const fill = root?.querySelector<SVGPathElement>("[data-dial='fill']");
    const secs = root?.querySelector<SVGTextElement>("[data-dial='secs']");
    if (!fill || !secs) return;
    const show = (left: number) => (secs.textContent = `0:0${Math.max(0, Math.ceil(left))}`);
    if (prefersReducedMotion() || engaged) {
      gsap.set(fill, { strokeDashoffset: engaged ? 0 : 1 });
      show(DWELL);
      return;
    }
    const o = { p: 0 };
    const t = gsap.to(o, {
      p: 1,
      duration: DWELL,
      ease: "none",
      onUpdate: () => {
        fill.style.strokeDashoffset = String(1 - o.p);
        show(DWELL * (1 - o.p));
      },
      onComplete: () => setActive((a) => (a + 1) % COUNT),
    });
    return () => {
      t.kill();
    };
  }, [active, engaged]);

  /* ── The disc tilts toward the pointer ── */
  useEffect(() => {
    const dial = dialRef.current;
    if (!dial || prefersReducedMotion()) return;
    gsap.set(dial, { transformPerspective: 1400 });
    const rx = gsap.quickTo(dial, "rotationX", { duration: 1, ease: "power3.out" });
    const ry = gsap.quickTo(dial, "rotationY", { duration: 1, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = dial.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 10);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 10);
    };
    const leave = () => {
      rx(0);
      ry(0);
    };
    dial.addEventListener("pointermove", move);
    dial.addEventListener("pointerleave", leave);
    return () => {
      dial.removeEventListener("pointermove", move);
      dial.removeEventListener("pointerleave", leave);
    };
  }, []);

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    setActive((current) => {
      const next = (current + delta + COUNT) % COUNT;
      tabRefs.current[next]?.focus();
      return next;
    });
  }, []);

  const secsPos = polar(SLOT + 4, R_ARC + 6.5);

  return (
    <section id="products" className="tech-grid relative overflow-hidden bg-canvas-alt py-10 lg:py-16">
      <div ref={rootRef} className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <SectionLabel index="02">Product Ecosystem</SectionLabel>
        <SectionHeading>One ecosystem. Multiple possibilities.</SectionHeading>

        <MobileCarousel />

        <div className="mt-16 hidden grid-cols-1 items-center gap-14 md:grid lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* ── The dial ── */}
          <div
            ref={dialRef}
            onPointerEnter={() => setEngaged(true)}
            onPointerLeave={() => setEngaged(false)}
            className="relative mx-auto aspect-square w-full max-w-[560px]"
          >
            <div
              data-dial="disc"
              className="absolute inset-0 overflow-hidden rounded-full bg-[#050506] shadow-[0_50px_100px_-40px_rgba(0,0,0,0.65),0_0_0_1px_rgba(0,0,0,0.06)]"
            >
              {/* aurora: soft gradients, rotated as one layer — no blur filter */}
              <div data-dial="aurora" className="absolute inset-[6%]">
                <span className="absolute right-[2%] top-[22%] h-[44%] w-[46%] rounded-full" style={{ background: "radial-gradient(ellipse at center, rgba(255,122,26,0.75), rgba(255,122,26,0) 68%)" }} />
                <span className="absolute bottom-[14%] left-[10%] h-[34%] w-[34%] rounded-full" style={{ background: "radial-gradient(ellipse at center, rgba(255,177,59,0.55), rgba(255,177,59,0) 68%)" }} />
                <span className="absolute left-[18%] top-[30%] h-[30%] w-[30%] rounded-full" style={{ background: "radial-gradient(ellipse at center, rgba(232,59,0,0.5), rgba(232,59,0,0) 70%)" }} />
              </div>
              {/* the glow hugging the ring */}
              <span
                data-dial="glow"
                className="absolute inset-[14%] rounded-full opacity-80"
                style={{ background: "radial-gradient(circle, transparent 52%, rgba(255,150,70,0.28) 62%, transparent 74%)" }}
              />
            </div>

            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 h-full w-full overflow-visible"
              role="tablist"
              aria-label="Product ecosystem"
              onKeyDown={onKeyDown}
            >
              <defs>
                <linearGradient id="dial-arc" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#ffb98a" />
                </linearGradient>
              </defs>

              {/* the ring band */}
              <circle
                data-dial="track"
                cx="50"
                cy="50"
                r={R_TRACK}
                fill="none"
                stroke="rgba(255,255,255,0.13)"
                strokeWidth="6"
                pathLength={1}
                strokeDasharray="1"
                transform="rotate(-90 50 50)"
              />
              {/* the dark centre */}
              <circle cx="50" cy="50" r={R_TRACK - 3.4} fill="#020203" />

              {/* the live arc: a dim slot, the fill as countdown, and the seconds */}
              <g data-dial="arc">
                <path d={slotPath(R_ARC)} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="5" />
                <path
                  data-dial="fill"
                  d={slotPath(R_ARC)}
                  fill="none"
                  stroke="url(#dial-arc)"
                  strokeWidth="5"
                  pathLength={1}
                  strokeDasharray="1"
                  strokeDashoffset="1"
                />
                <text
                  data-dial="secs"
                  x={secsPos.x}
                  y={secsPos.y}
                  fill="#fff"
                  fontSize="2.6"
                  fontWeight="600"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${SLOT + 4 - 90} ${secsPos.x} ${secsPos.y})`}
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  0:0{Math.ceil(DWELL)}
                </text>
                {/* the marker over the live number */}
                <path d={`M ${polar(SLOT / 2, R_TRACK + 2.6).x - 0.9} ${polar(SLOT / 2, R_TRACK + 2.6).y} l 0.9 1.2 l 0.9 -1.2 z`} fill="#fff" transform={`rotate(${SLOT / 2} ${polar(SLOT / 2, R_TRACK + 2.6).x} ${polar(SLOT / 2, R_TRACK + 2.6).y})`} />
              </g>

              {/* the numbers, on the band */}
              {PRODUCTS.map((p, i) => {
                const a = (i + 0.5) * SLOT;
                const pos = polar(a, R_TRACK);
                const live = i === active;
                return (
                  <g
                    key={p.key}
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    data-dial="num"
                    role="tab"
                    id={`eco-tab-${p.key}`}
                    aria-selected={live}
                    aria-controls="eco-panel"
                    aria-label={`Arrow ${p.label}`}
                    tabIndex={live ? 0 : -1}
                    onClick={() => setActive(i)}
                    className="cursor-pointer outline-none"
                  >
                    <circle cx={pos.x} cy={pos.y} r="4.2" fill="transparent" />
                    <text
                      x={pos.x}
                      y={pos.y}
                      fontSize="3"
                      fontWeight={live ? 600 : 400}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={live ? "#ffffff" : "rgba(255,255,255,0.3)"}
                      transform={`rotate(${a > 90 && a < 270 ? a - 180 : a} ${pos.x} ${pos.y})`}
                      className="transition-[fill] duration-500 hover:fill-white"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {num(i)}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* the live product, in the centre */}
            <div data-dial="centre" className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[12px] font-medium tracking-[0.04em] text-white/45">Arrow</span>
              <span className="mt-1 max-w-[40%] font-heading text-[1.35rem] font-semibold leading-[1.15] tracking-[-0.02em] text-white lg:text-[1.6rem]">
                {product.label}
              </span>
              <span className="mt-2 text-[12px] text-[#ffb070]">{product.domain}</span>
            </div>

            {/* the side note */}
            <div data-dial="side" className="pointer-events-none absolute left-[9%] top-1/2 -translate-y-1/2 text-[13px] font-medium leading-[1.35] text-white/85">
              <p>{String(COUNT).padStart(2, "0")}</p>
              <p>Products</p>
              <p>One core</p>
            </div>
          </div>

          {/* ── The surrounding interface, which changes with the selection ── */}
          <div
            ref={panelRef}
            id="eco-panel"
            role="tabpanel"
            aria-labelledby={`eco-tab-${product.key}`}
            onPointerEnter={() => setEngaged(true)}
            onPointerLeave={() => setEngaged(false)}
            className="surface-card relative overflow-hidden rounded-panel px-8 py-9 lg:px-10 lg:py-11"
          >
            <div className="mb-8 overflow-hidden rounded-xl border border-border bg-surface-sunken shadow-[0_24px_50px_-30px_rgba(var(--orange-ch),0.6)]">
              <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-orange" />
                <span className="h-2 w-2 rounded-full bg-amber/70" />
                <span className="h-2 w-2 rounded-full bg-border-strong" />
                <span className="ml-2 font-mono text-[9px] tracking-[0.14em] text-ink-soft">arrow / {product.key}</span>
              </div>
              <div data-eco="screen" className="relative aspect-[1.94] overflow-hidden bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={product.key}
                  src={withBasePath(`/products/${product.key}/1-sm.webp`)}
                  alt={`Arrow ${product.label} screen`}
                  className="h-full w-full object-cover object-left-top"
                />
              </div>
            </div>
            <p data-eco="panel-item" className="font-mono text-[10px] uppercase tracking-[0.24em] text-orange">
              {product.domain}
            </p>
            <h3 data-eco="panel-item" className="mt-3 font-heading text-[1.505rem] font-bold leading-tight tracking-[-0.03em] text-ink sm:text-[1.72rem]">
              {product.label}
            </h3>
            <p data-eco="panel-item" className="mt-4 text-base leading-[1.75] text-ink-muted">
              {product.blurb}
            </p>
            <p data-eco="panel-item" className="mt-8 font-mono text-[10px] uppercase tracking-[0.24em] text-ink-soft">
              Modules
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
