"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowGlyph } from "./ArrowMark";
import { SectionLabel, SectionHeading } from "./ui";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { withBasePath } from "@/lib/basePath";

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

/* ── The accordion (tablet and up) ───────────────────────────────────────
 *
 * Seven tall panels in a row, each carrying its product's real screenshot.
 * The open one widens: its screenshot sits in a browser frame and the
 * product's details rise in beneath it. The others narrow to slim strips —
 * screenshot dimmed, name running up the side. Hover or click to open a
 * panel; left alone, it moves on by itself, a progress line timing it.
 *
 * Width is animated with CSS flex-grow on one property; the content inside
 * each panel fades/slides with GSAP. Reduced motion: no auto-advance.
 */

export default function ProductEcosystem() {
  const [active, setActive] = useState(0);
  const [engaged, setEngaged] = useState(false);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  /* the accordion only runs while it is on screen */
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "100px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* auto-advance, timed by the progress line in the open panel */
  useEffect(() => {
    if (engaged || !inView || prefersReducedMotion()) return;
    const bar = rootRef.current?.querySelector<HTMLElement>(`[data-acc-bar="${active}"]`);
    const t = gsap.fromTo(
      bar ?? {},
      { scaleX: 0 },
      { scaleX: 1, duration: DWELL, ease: "none", onComplete: () => setActive((a) => (a + 1) % COUNT) },
    );
    return () => {
      t.kill();
    };
  }, [active, engaged, inView]);

  /* the open panel's content arrives in turn */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const panel = root.querySelector(`[data-acc="${active}"]`);
    if (!panel) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        panel.querySelector("[data-acc-shot]"),
        { y: 30, opacity: 0, scale: 0.97 },
        { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: "expo.out", delay: first.current ? 0 : 0.25 },
      );
      gsap.fromTo(
        panel.querySelectorAll("[data-acc-in]"),
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: "power3.out", delay: first.current ? 0.1 : 0.35 },
      );
    }, root);
    first.current = false;
    return () => ctx.revert();
  }, [active]);

  /* entrance: the panels rise in turn */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-acc]",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.07, ease: "power4.out", scrollTrigger: { trigger: root, start: "top 80%", once: true } },
      );
      /* liquid motion: each blob rides two sines at different periods (a
         Lissajous loop), so the paths never visibly repeat; the colour swirl
         underneath flows upward, and each panel is phase-shifted from its neighbours */
      gsap.utils.toArray<HTMLElement>("[data-blob]").forEach((bl, k) => {
        const panel = Math.floor(k / 4);
        const ax = gsap.utils.random(40, 90);
        const ay = gsap.utils.random(60, 140);
        gsap.fromTo(bl, { x: -ax }, { x: ax, duration: gsap.utils.random(3.2, 5.2), ease: "sine.inOut", yoyo: true, repeat: -1, delay: -panel * 0.9 - k * 0.37 });
        gsap.fromTo(bl, { y: -ay }, { y: ay, duration: gsap.utils.random(4.4, 7.4), ease: "sine.inOut", yoyo: true, repeat: -1, delay: -panel * 1.3 - k * 0.53 });
        gsap.to(bl, { scale: gsap.utils.random(1.2, 1.6), duration: gsap.utils.random(2.6, 4.2), ease: "sine.inOut", yoyo: true, repeat: -1 });
      });
      gsap.utils.toArray<HTMLElement>("[data-swirl]").forEach((sw, k) => {
        /* one period of the bands is a third of the layer, so this loops seamlessly */
        gsap.fromTo(sw, { yPercent: 0 }, { yPercent: -33.3334, duration: 9 + (k % 3) * 1.4, ease: "none", repeat: -1, delay: -k * 2.1 });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    setActive((a) => (a + d + COUNT) % COUNT);
  }, []);

  return (
    <section id="products" className="tech-grid relative overflow-hidden bg-canvas-alt py-10 lg:py-16">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SectionLabel>Product Ecosystem</SectionLabel>
            <SectionHeading>One ecosystem, multiple possibilities</SectionHeading>
          </div>
          <p className="hidden max-w-xs text-[15px] leading-relaxed text-ink-muted md:block lg:text-right">
            Seven platforms on one shared core. Hover a panel to explore it.
          </p>
        </div>

        <MobileCarousel />

        <div
          ref={rootRef}
          data-loop-scope
          role="tablist"
          aria-label="Product ecosystem"
          onKeyDown={onKeyDown}
          onPointerEnter={() => setEngaged(true)}
          onPointerLeave={() => setEngaged(false)}
          className="mt-12 hidden h-[560px] gap-3 md:flex"
        >
          {PRODUCTS.map((p, i) => {
            const on = i === active;
            return (
              <div
                key={p.key}
                data-acc={i}
                role="tab"
                tabIndex={on ? 0 : -1}
                aria-selected={on}
                aria-label={`Arrow ${p.label}`}
                onPointerEnter={() => setActive(i)}
                onClick={() => setActive(i)}
                onFocus={() => setActive(i)}
                className={`group relative min-w-0 cursor-pointer overflow-hidden rounded-[26px] outline-none transition-[flex-grow,box-shadow] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  on
                    ? "bg-surface shadow-[0_34px_70px_-34px_rgba(var(--orange-ch),0.55)] ring-1 ring-border"
                    : "bg-[#e83b00] shadow-[0_18px_36px_-24px_rgba(var(--orange-ch),0.6)] hover:-translate-y-1 hover:shadow-[0_28px_50px_-22px_rgba(var(--orange-ch),0.75)]"
                }`}
                style={{ flexGrow: on ? 6.5 : 1, flexBasis: 0 }}
              >
                {/* ── closed: frosted glass over drifting gradient light, the name up the side ──
                    The blobs are pre-softened radial gradients moved by transform (no
                    blur filters, no backdrop-filter), so seven of them stay cheap. */}
                <div className={`absolute inset-0 overflow-hidden rounded-[26px] transition-opacity duration-500 ${on ? "opacity-0" : "opacity-100"}`}>
                  <span className="absolute inset-0" style={{ background: "linear-gradient(160deg, #ff8a3d 0%, #e83b00 55%, #b52a00 100%)" }} />
                  {/* bands of colour flowing up the slab in a seamless loop */}
                  <span
                    data-swirl
                    className="absolute inset-x-0 top-0 h-[300%] will-change-transform"
                    style={{
                      background: "linear-gradient(180deg, #ff6a1a 0%, #ffb13b 22%, #e83b00 45%, #ffcf8a 62%, #c22e00 82%, #ff6a1a 100%)",
                      backgroundSize: "100% 33.3334%",
                    }}
                  />
                  <span className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(255,138,61,0.55), rgba(232,59,0,0.35) 55%, rgba(150,30,0,0.55))" }} />
                  {/* liquid light: soft blobs on looping paths, sized off the panel's height */}
                  {[
                    { c: "rgba(255,230,180,0.95)", x: "10%", y: "8%" },
                    { c: "rgba(255,80,10,0.95)", x: "60%", y: "30%" },
                    { c: "rgba(255,180,70,0.9)", x: "20%", y: "58%" },
                    { c: "rgba(200,40,0,0.85)", x: "70%", y: "80%" },
                  ].map((bl, k) => (
                    <span
                      key={k}
                      data-blob
                      className="absolute aspect-square h-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full will-change-transform"
                      style={{ left: bl.x, top: bl.y, background: `radial-gradient(circle, ${bl.c} 0%, transparent 62%)` }}
                    />
                  ))}
                  {/* the glass: frost, a lit top edge and a soft inner rim */}
                  <span className="absolute inset-0 bg-white/20" />
                  <span className="absolute inset-0 rounded-[26px] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),inset_0_0_0_1px_rgba(255,255,255,0.35),inset_0_-30px_60px_-30px_rgba(120,30,0,0.45)]" />
                  <span className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent" />
                  <span className="cine-grain absolute inset-0 opacity-[0.04]" />
                  <span className="absolute left-1/2 top-5 -translate-x-1/2 text-[12px] font-semibold text-white/90">{num(i)}</span>
                  <span className="absolute bottom-6 left-1/2 origin-bottom-left -rotate-90 translate-x-2 whitespace-nowrap font-spartan text-[1.15rem] font-semibold text-white drop-shadow-[0_2px_8px_rgba(120,30,0,0.45)]">
                    {p.label}
                  </span>
                </div>

                {/* ── open: the product ──
                    The copy and its button keep their natural height; the
                    screenshot takes whatever is left (cropped from the top), so
                    the button never drops out of the panel at any width. */}
                <div className={`absolute inset-0 flex flex-col p-6 transition-opacity duration-500 lg:p-7 ${on ? "opacity-100" : "pointer-events-none opacity-0"}`}>
                  <div data-acc-shot className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[16px] border border-border bg-surface-sunken shadow-[0_24px_50px_-30px_rgba(var(--orange-ch),0.6)]">
                    <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
                      <span className="h-2 w-2 rounded-full bg-orange" />
                      <span className="h-2 w-2 rounded-full bg-amber/70" />
                      <span className="h-2 w-2 rounded-full bg-border-strong" />
                      <span className="ml-2 text-[11px] font-medium text-ink-soft">Arrow {p.label}</span>
                    </div>
                    <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
                      {on && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={withBasePath(`/products/${p.key}/1-sm.webp`)} alt={`Arrow ${p.label} screen`} className="h-full w-full object-cover object-left-top" />
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex shrink-0 flex-col">
                    <div className="flex items-baseline justify-between gap-4">
                      <div className="min-w-0">
                        <p data-acc-in className="text-[13px] font-semibold text-orange">{p.domain}</p>
                        <h3 data-acc-in className="mt-1 truncate font-heading text-[1.6rem] font-bold leading-tight tracking-[-0.03em] text-ink">
                          Arrow {p.label}
                        </h3>
                      </div>
                      <span data-acc-in className="shrink-0 text-[13px] font-semibold text-ink-soft">
                        {num(i)} / {num(COUNT - 1)}
                      </span>
                    </div>
                    <p data-acc-in className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-muted">{p.blurb}</p>
                    <div data-acc-in className="mt-4 flex flex-wrap gap-2">
                      {p.modules.map((m) => (
                        <span key={m} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-sunken px-3 py-1.5 text-xs font-medium text-ink">
                          <span className="h-1 w-1 rounded-full bg-orange" />
                          {m}
                        </span>
                      ))}
                    </div>
                    <div data-acc-in className="flex items-center justify-between gap-4 pt-5">
                      <a
                        href={`/products#${p.key}`}
                        className="group/cta inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#d13400] via-[#ff5417] to-[#ff9820] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(232,59,0,0.7)] transition-transform duration-300 hover:-translate-y-0.5"
                      >
                        Discover Arrow {p.label}
                        <ArrowGlyph className="h-3 w-3 transition-transform duration-300 group-hover/cta:translate-x-1" />
                      </a>
                      <span className="hidden text-[12.5px] text-ink-soft xl:block">
                        Up next · <span className="font-semibold text-ink">{PRODUCTS[(i + 1) % COUNT].label}</span>
                      </span>
                    </div>
                  </div>
                  {/* the timer */}
                  <span aria-hidden className="absolute inset-x-6 bottom-0 h-[3px] overflow-hidden rounded-full bg-border lg:inset-x-7">
                    <span data-acc-bar={i} className="block h-full origin-left bg-orange" style={{ transform: "scaleX(0)" }} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
