"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowGlyph } from "./ArrowMark";
import { SectionLabel, SectionHeading } from "./ui";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { withBasePath } from "@/lib/basePath";
import { PRODUCT_MARKS } from "./ProductMarks";

/*
 * Brief §05 — "One ecosystem, multiple possibilities"
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

/* ── Tablet and up: a bento grid ─────────────────────────────────────────
 *
 * One large tile shows the featured product in full — screenshot, what it
 * does, its modules, the way in — and six smaller tiles around it carry the
 * rest, each with its mark, name, domain and a cropped glimpse of its real
 * screen. Choosing a small tile brings that product into the large one; the
 * tiles re-flow into place (framer-motion layout). Left alone it moves on by
 * itself, a progress line timing it, and only while it is on screen.
 */
export default function ProductEcosystem() {
  const [active, setActive] = useState(0);
  const [engaged, setEngaged] = useState(false);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();

  /* runs only while on screen */
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "100px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* auto-advance, timed by the progress line in the large tile */
  useEffect(() => {
    if (engaged || !inView || prefersReducedMotion()) return;
    const t = gsap.fromTo(
      barRef.current ?? {},
      { scaleX: 0 },
      { scaleX: 1, duration: DWELL, ease: "none", onComplete: () => setActive((a) => (a + 1) % COUNT) },
    );
    return () => {
      t.kill();
    };
  }, [active, engaged, inView]);

  const p = PRODUCTS[active];
  const Mark = PRODUCT_MARKS[p.key];
  /* the six others, in their usual order */
  const others = PRODUCTS.map((q, i) => ({ q, i })).filter(({ i }) => i !== active);
  const spring = { type: "spring" as const, stiffness: 260, damping: 32, mass: 0.9 };

  return (
    <section id="products" className="tech-grid relative overflow-hidden bg-canvas-alt py-10 lg:py-16">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SectionLabel>Product Ecosystem</SectionLabel>
            <SectionHeading>One ecosystem, multiple possibilities</SectionHeading>
          </div>
          <p className="hidden max-w-xs text-[15px] leading-relaxed text-ink-muted md:block lg:text-right">
            Seven platforms on one shared core. Select a product to explore it.
          </p>
        </div>

        <MobileCarousel />

        <div
          ref={rootRef}
          onPointerEnter={() => setEngaged(true)}
          onPointerLeave={() => setEngaged(false)}
          className="mt-12 hidden gap-4 md:grid md:grid-cols-2 lg:h-[600px] lg:grid-cols-4 lg:grid-rows-3"
        >
          {/* ── the featured product ── */}
          <motion.article
            layout
            transition={spring}
            className="relative flex flex-col overflow-hidden rounded-[28px] bg-surface p-6 shadow-[0_34px_70px_-36px_rgba(var(--orange-ch),0.55)] ring-1 ring-border md:col-span-2 lg:row-span-3 lg:p-7"
          >
            {/* warm light in the corner */}
            <span
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full"
              style={{ background: "radial-gradient(closest-side, rgba(var(--orange-ch),0.18), transparent)" }}
            />
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={p.key}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex min-h-0 flex-1 flex-col"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange/10 text-orange">
                      {Mark && <Mark className="h-6 w-6" />}
                    </span>
                    <span>
                      <span className="block text-[12px] font-semibold text-orange">{p.domain}</span>
                      <span className="block font-heading text-[1.35rem] font-bold leading-tight tracking-[-0.025em] text-ink">
                        Arrow {p.label}
                      </span>
                    </span>
                  </span>
                  <span className="text-[13px] font-semibold text-ink-soft">
                    {num(active)} / {num(COUNT - 1)}
                  </span>
                </div>

                <div className="mt-5 min-h-0 flex-1 overflow-hidden rounded-[16px] border border-border bg-surface-sunken shadow-[0_24px_50px_-30px_rgba(var(--orange-ch),0.6)]">
                  <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
                    <span className="h-2 w-2 rounded-full bg-orange" />
                    <span className="h-2 w-2 rounded-full bg-amber/70" />
                    <span className="h-2 w-2 rounded-full bg-border-strong" />
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={withBasePath(`/products/${p.key}/1-sm.webp`)}
                    alt={`Arrow ${p.label} screen`}
                    className="aspect-[2.1] h-auto w-full bg-white object-cover object-left-top md:aspect-[1.9] lg:aspect-auto lg:h-full"
                  />
                </div>

                <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-muted">{p.blurb}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.modules.map((m) => (
                    <span key={m} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-sunken px-3 py-1.5 text-xs font-medium text-ink">
                      <span className="h-1 w-1 rounded-full bg-orange" />
                      {m}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between gap-4">
                  <a
                    href={`/products#${p.key}`}
                    className="group/cta inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#d13400] via-[#ff5417] to-[#ff9820] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(232,59,0,0.7)] transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    Discover Arrow {p.label}
                    <ArrowGlyph className="h-3 w-3 transition-transform duration-300 group-hover/cta:translate-x-1" />
                  </a>
                  <span className="hidden text-[12.5px] text-ink-soft xl:block">
                    Up next · <span className="font-semibold text-ink">{PRODUCTS[(active + 1) % COUNT].label}</span>
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
            {/* the timer */}
            <span aria-hidden className="absolute inset-x-7 bottom-0 h-[3px] overflow-hidden rounded-full bg-border">
              <span ref={barRef} className="block h-full origin-left bg-orange" style={{ transform: "scaleX(0)" }} />
            </span>
          </motion.article>

          {/* ── the other six ── */}
          {others.map(({ q, i }) => {
            const M = PRODUCT_MARKS[q.key];
            return (
              <motion.button
                key={q.key}
                layout
                transition={spring}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show Arrow ${q.label}`}
                className="group relative flex min-h-[150px] flex-col overflow-hidden rounded-[22px] bg-surface p-4 text-left ring-1 ring-border transition-shadow duration-300 hover:shadow-[0_24px_44px_-26px_rgba(var(--orange-ch),0.6)] hover:ring-orange/40"
              >
                {/* a glimpse of the real screen, sliding up on hover */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={withBasePath(`/products/${q.key}/1-sm.webp`)}
                  alt=""
                  loading="lazy"
                  className="pointer-events-none absolute -bottom-6 -right-8 w-[78%] rotate-[-4deg] rounded-lg border border-border object-cover object-left-top opacity-80 shadow-[0_16px_30px_-16px_rgba(0,0,0,0.35)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-2 group-hover:rotate-[-2deg]"
                  style={{ aspectRatio: "1.7" }}
                />
                <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-surface via-surface/85 to-transparent" />
                <span className="relative flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange/10 text-orange transition-colors duration-300 group-hover:bg-orange group-hover:text-white">
                    {M && <M className="h-5 w-5" />}
                  </span>
                  <span className="text-[11px] font-semibold text-ink-soft">{num(i)}</span>
                </span>
                <span className="relative mt-3 block font-heading text-[1.05rem] font-bold leading-tight tracking-[-0.02em] text-ink">{q.label}</span>
                <span className="relative mt-0.5 block text-[12px] text-ink-muted">{q.domain}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
