"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { PageCta } from "@/components/page-kit";
import { withBasePath } from "@/lib/basePath";
import { ArrowUpRight, QMarkLight } from "@/components/ArrowMark";
import { SOLUTION_ART } from "@/components/solution-art";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/*
 * About eArrow. Content from the brief's "About Us" sheet.
 *
 *   HERO        the headline beside three columns of the real team, drifting
 *               in opposite directions — the company is its people, so they
 *               are the first thing you see. Stats count up underneath.
 *   WHAT WE DO  five tall panels; the active one opens to its story and
 *               drawing. Cycles on its own, follows the pointer.
 *   VISION      the two statements light up word by word as you scroll —
 *               read out, rather than displayed.
 *   PEOPLE      directors as three large portraits, then the wider team.
 *               Duotone at rest, full colour on hover. No numbering.
 *   VALUES      the six words as a running marquee, then a card each.
 *
 * Motion is GSAP throughout, on transforms and opacity; reduced motion gets
 * every section in its settled state.
 */

const WHAT_WE_DO: { title: string; short: string; body: string; art: keyof typeof SOLUTION_ART }[] = [
  {
    title: "Digital Transformation",
    short: "Transformation",
    body: "Helping organisations replace manual and fragmented processes with connected digital solutions.",
    art: "window",
  },
  {
    title: "HR & Payroll Solutions",
    short: "HR & Payroll",
    body: "Streamlining employee management, payroll, attendance, leave, performance, and HR operations.",
    art: "workforce",
  },
  {
    title: "Education Technology",
    short: "Education",
    body: "Enabling educational institutions to manage students, academics, admissions, attendance, fees, and administration more efficiently.",
    art: "education",
  },
  {
    title: "Business Solutions",
    short: "Business",
    body: "Developing solutions that help organisations automate workflows, improve decision-making, and increase operational efficiency.",
    art: "workflow",
  },
  {
    title: "AI & Intelligent Automation",
    short: "AI & Automation",
    body: "Helping organisations use AI and automation to reduce repetitive work and turn business data into actionable insights.",
    art: "intelligence",
  },
];

const STATS = [
  { value: 20, suffix: "+", label: "Years of technology experience" },
  { value: 150, suffix: "+", label: "Customers served" },
  { value: 10, suffix: "+", label: "Enterprise products" },
];

type Person = { name: string; role: string; remit: string; photo: string };

const DIRECTORS: Person[] = [
  { name: "Adheesha Salpitikorala", role: "Director / Chief Executive Officer", remit: "Overall Strategy & Corporate Leadership", photo: "/team/adheesha.webp" },
  { name: "Dhanushka Weerasinghe", role: "Director / Chief Revenue Officer", remit: "Overall commercial performance + operations", photo: "/team/dhanushka.webp" },
  { name: "P A Nandasena", role: "Director — Strategic Business & Corporate Affairs", remit: "Strategic Relationships, Corporate Affairs & Business Development", photo: "/team/nandasena.webp" },
];

const TEAM: Person[] = [
  { name: "Malith Haschendre", role: "Technology Transformation Architect", remit: "Technology, Product & Innovation", photo: "/team/malith.webp" },
  { name: "Bihara Ranaweera", role: "Project Manager", remit: "Project Management, Operations & Delivery", photo: "/team/bihara.webp" },
  { name: "Awantha Yohan", role: "Head of Systems & Infrastructure", remit: "Infrastructure, Cloud & IT Operations", photo: "/team/awantha.webp" },
  { name: "Malinda Deshapriya", role: "Senior Tech Lead", remit: "Technology, Engineering & Technical Leadership", photo: "/team/malinda.webp" },
  { name: "Thilina Dananjaya", role: "Associate Tech Lead", remit: "Technology, Engineering & Technical Delivery", photo: "/team/thilina.webp" },
  { name: "Udara Ekanayake", role: "Senior Software Engineer", remit: "Software Engineering, Development & Technical Solutions", photo: "/team/udara.webp" },
  { name: "Ravija Salpitikorala", role: "DevOps Engineer", remit: "Cloud Infrastructure, Automation & Deployment", photo: "/team/ravija.webp" },
  { name: "Kenula Dissanayake", role: "Growth Marketing & Revenue Lead", remit: "Growth Strategy, Marketing & Revenue", photo: "/team/kenula.webp" },
  { name: "Poornima Sathsarani", role: "Senior Executive Customer Success", remit: "Customer Support, Service & Technical Assistance", photo: "/team/poornima.webp" },
];

const EVERYONE = [...DIRECTORS, ...TEAM];

const VALUES = [
  { word: "Innovate", line: "Challenge the ordinary." },
  { word: "Care", line: "Put customers first." },
  { word: "Own", line: "Take responsibility." },
  { word: "Excel", line: "Never settle for average." },
  { word: "Trust", line: "Do the right thing." },
  { word: "Grow", line: "Grow together." },
];

const STATEMENTS = [
  {
    k: "Our Vision",
    v: "To become a trusted technology partner that enables organisations to operate smarter, faster, and more efficiently.",
  },
  {
    k: "Our Mission",
    v: "To create innovative, reliable, and user-centric technology solutions that solve real-world business challenges and deliver measurable value to our customers.",
  },
];

/* ═══════════════════════════════ Hero ═══════════════════════════════ */

function Hero() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    const q = gsap.utils.selector(root);
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .fromTo("[data-a-line]", { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.09 }, 0.1)
        .fromTo("[data-a-copy]", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1, stagger: 0.1 }, 0.55)
        .fromTo("[data-col]", { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 1.6, stagger: 0.12, ease: "power4.out" }, 0.3)
        .fromTo("[data-stat]", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, stagger: 0.1 }, 0.9);

      /* the portrait columns drift, alternating direction */
      (q("[data-reel]") as HTMLElement[]).forEach((el, i) => {
        const up = i % 2 === 0;
        gsap.fromTo(el, { yPercent: up ? 0 : -50 }, { yPercent: up ? -50 : 0, duration: 38 + i * 6, ease: "none", repeat: -1 });
      });

      /* counters */
      (q("[data-count]") as HTMLElement[]).forEach((el) => {
        const o = { v: 0 };
        gsap.to(o, {
          v: Number(el.dataset.count),
          duration: 2,
          delay: 1,
          ease: "power3.out",
          onUpdate: () => (el.textContent = String(Math.round(o.v))),
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  /* three columns, each its own order of the team, doubled for a seamless loop */
  const cols = [0, 1, 2].map((c) => EVERYONE.filter((_, i) => i % 3 === c));

  return (
    <section ref={ref} className="ab-hero relative isolate overflow-hidden bg-canvas pt-28 lg:pt-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 50% 60% at 80% 40%, rgba(255,140,40,0.18), transparent 70%)" }}
      />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-12">
        <div className="flex flex-col justify-center pb-4 lg:pb-16">
          <p data-a-copy className="ab-fade text-[13px] font-medium text-orange">About eArrow</p>
          <h1 className="font-spartan mt-5 text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.03em] text-ink sm:text-[3.4rem] lg:text-[4rem]">
            {["Empowering", "organisations through", "intelligent technology."].map((l, i) => (
              <span key={l} className="block overflow-hidden pb-[0.08em]">
                <span data-a-line className={`ab-fade block ${i === 2 ? "bg-gradient-to-r from-[#d13400] via-[#e83b00] to-[#ff9820] bg-clip-text text-transparent" : ""}`}>
                  {l}
                </span>
              </span>
            ))}
          </h1>
          <p data-a-copy className="ab-fade mt-6 max-w-lg text-[15px] leading-relaxed text-ink-muted sm:text-base">
            eArrow is a technology solutions company focused on helping organisations simplify operations,
            improve efficiency, and accelerate digital transformation.
          </p>
          <p data-a-copy className="ab-fade mt-4 max-w-lg text-[14px] leading-relaxed text-ink-soft">
            From Human Resource Management and Payroll to Student Management, Business Applications, Automation, and
            Digital Solutions, our platforms connect people, processes, and data within a single digital ecosystem.
          </p>
          <div data-a-copy className="ab-fade mt-8 flex flex-wrap gap-3">
            <a
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-canvas transition-transform duration-300 hover:-translate-y-0.5"
            >
              Talk to our team
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a
              href="#people"
              className="inline-flex items-center rounded-full border border-border-strong px-7 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-orange hover:text-orange"
            >
              Meet the people
            </a>
          </div>
        </div>

        {/* the team, drifting */}
        <div
          className="relative h-[460px] overflow-hidden sm:h-[560px] lg:h-[640px]"
          style={{
            maskImage: "linear-gradient(to bottom, transparent, #000 12%, #000 88%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 12%, #000 88%, transparent)",
          }}
        >
          <div className="grid h-full grid-cols-3 gap-3 sm:gap-4">
            {cols.map((col, c) => (
              <div key={c} data-col className={`ab-fade relative ${c === 1 ? "mt-16" : ""}`}>
                <div data-reel className="flex flex-col gap-3 will-change-transform sm:gap-4">
                  {[...col, ...col].map((p, i) => (
                    <figure key={`${p.name}-${i}`} className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface-sunken">
                      <span className="duotone absolute inset-0">
                        <Image src={withBasePath(p.photo)} alt={i < col.length ? p.name : ""} fill sizes="(min-width:1024px) 15vw, 30vw" className="object-cover" />
                      </span>
                      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-2.5 text-[11px] font-semibold leading-tight text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100 sm:p-3 sm:text-[12px]">
                        {p.name}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* stats band */}
      <div className="relative mx-auto mt-6 max-w-7xl px-6 pb-16 lg:px-12 lg:pb-20">
        <div className="grid grid-cols-1 gap-6 border-t border-border pt-10 sm:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.label} data-stat className="ab-fade">
              <p className="font-spartan text-[3.4rem] font-semibold leading-none tracking-[-0.03em] text-ink lg:text-[4.2rem]">
                <span data-count={s.value}>{s.value}</span>
                <span className="text-orange">{s.suffix}</span>
              </p>
              <p className="mt-2 text-sm text-ink-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════ What we do ═══════════════════════════ */

/* ── Practice illustrations ───────────────────────────────────────────────
 *
 * One family of generated artwork: a peach ground with broad, soft-edged
 * orange sweeps, each practice composed from the same curves into its own
 * motif. Drawn as SVG with gradients — no images, crisp at any size, and
 * `preserveAspectRatio="xMidYMid slice"` so a narrow closed panel and the
 * wide open one both crop the same picture well.
 */
function PracticeArt({ v, id }: { v: number; id: string }) {
  const g = (n: string) => `${id}-${n}`;
  return (
    <svg viewBox="0 0 400 480" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={g("bg")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff6f0" />
          <stop offset="1" stopColor="#ffd9c2" />
        </linearGradient>
        <linearGradient id={g("o")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff9a6a" />
          <stop offset="0.55" stopColor="#ff6a2b" />
          <stop offset="1" stopColor="#e8470c" />
        </linearGradient>
        <linearGradient id={g("soft")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffd9c2" stopOpacity="0.4" />
        </linearGradient>
        <radialGradient id={g("glow")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ff7a3d" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ff7a3d" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="480" fill={`url(#${g("bg")})`} />

      {v === 0 && (
        /* Transformation: two broad sweeps crossing, and a wedge pointing on */
        <g data-art>
          <path d="M-40 360 C 80 300, 160 120, 330 40 L 440 40 L 440 -20 L -40 -20 Z" fill={`url(#${g("o")})`} opacity="0.9" />
          <path d="M-40 380 C 90 330, 180 170, 360 90" fill="none" stroke={`url(#${g("soft")})`} strokeWidth="46" strokeLinecap="round" />
          <path d="M160 520 C 220 400, 330 330, 460 300 L 460 520 Z" fill={`url(#${g("o")})`} opacity="0.55" />
          <path d="M300 300 L 400 250 L 400 350 Z" fill="#ff6a2b" opacity="0.85" />
        </g>
      )}
      {v === 1 && (
        /* HR & Payroll: people as overlapping rings, drawn in sweeps */
        <g data-art>
          <circle cx="140" cy="200" r="150" fill={`url(#${g("glow")})`} />
          <circle cx="150" cy="190" r="92" fill="none" stroke={`url(#${g("o")})`} strokeWidth="40" opacity="0.85" />
          <circle cx="270" cy="250" r="78" fill="none" stroke={`url(#${g("soft")})`} strokeWidth="34" />
          <circle cx="230" cy="380" r="118" fill={`url(#${g("o")})`} opacity="0.55" />
          <path d="M-20 470 C 100 410, 220 420, 420 360 L 420 500 L -20 500 Z" fill="#ffffff" opacity="0.5" />
        </g>
      )}
      {v === 2 && (
        /* Education: stacked arches, like pages rising */
        <g data-art>
          {[0, 1, 2, 3].map((k) => (
            <path
              key={k}
              d={`M${-30 + k * 26} 500 C ${-30 + k * 26} ${300 - k * 40}, ${430 - k * 26} ${300 - k * 40}, ${430 - k * 26} 500`}
              fill={k % 2 ? "#ffffff" : `url(#${g("o")})`}
              opacity={k % 2 ? 0.6 : 0.85 - k * 0.12}
            />
          ))}
          <path d="M120 120 L 200 80 L 280 120 L 200 160 Z" fill="#ff6a2b" opacity="0.85" />
        </g>
      )}
      {v === 3 && (
        /* Business: rounded blocks handing off along a curve */
        <g data-art>
          <path d="M-20 140 C 120 140, 200 330, 420 330" fill="none" stroke={`url(#${g("soft")})`} strokeWidth="50" strokeLinecap="round" />
          <rect x="40" y="70" width="120" height="120" rx="34" fill={`url(#${g("o")})`} opacity="0.9" />
          <rect x="230" y="270" width="140" height="140" rx="40" fill={`url(#${g("o")})`} opacity="0.7" />
          <rect x="250" y="40" width="80" height="80" rx="24" fill="#ffffff" opacity="0.7" />
        </g>
      )}
      {v === 4 && (
        /* AI & Automation: a core with orbits and moving nodes */
        <g data-art>
          <circle cx="200" cy="240" r="190" fill={`url(#${g("glow")})`} />
          <ellipse cx="200" cy="240" rx="170" ry="70" fill="none" stroke={`url(#${g("soft")})`} strokeWidth="18" transform="rotate(-28 200 240)" />
          <ellipse cx="200" cy="240" rx="170" ry="70" fill="none" stroke={`url(#${g("o")})`} strokeWidth="14" opacity="0.8" transform="rotate(32 200 240)" />
          <circle cx="200" cy="240" r="58" fill={`url(#${g("o")})`} />
          <circle data-node cx="352" cy="160" r="16" fill="#ffffff" />
          <circle data-node cx="70" cy="330" r="12" fill="#ff6a2b" />
        </g>
      )}
    </svg>
  );
}

function Practices() {
  const [active, setActive] = useState(0);
  const [hold, setHold] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hold || prefersReducedMotion()) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % WHAT_WE_DO.length), 4200);
    return () => clearTimeout(t);
  }, [active, hold]);

  /* the illustrations breathe; the open one's art drifts a touch more */
  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<SVGGElement>("[data-art]").forEach((g, i) =>
        gsap.to(g, { y: i % 2 ? 10 : -10, x: i % 2 ? -6 : 6, duration: 5 + i, ease: "sine.inOut", yoyo: true, repeat: -1 }),
      );
      gsap.fromTo(
        "[data-practice]",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.08, ease: "power4.out", scrollTrigger: { trigger: root, start: "top 85%", once: true } },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="relative bg-canvas-alt py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[13px] font-medium text-orange">What we do</p>
            <h2 className="font-spartan mt-3 text-[2rem] font-semibold leading-[1.05] tracking-[-0.025em] text-ink sm:text-[2.6rem]">
              Five practices, one digital ecosystem.
            </h2>
          </div>
          <a href="/solutions" className="group inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-orange">
            See the capabilities
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        <div ref={ref} className="mt-10 flex flex-col gap-4 lg:h-[520px] lg:flex-row" onMouseLeave={() => setHold(false)}>
          {WHAT_WE_DO.map((p, i) => {
            const Art = SOLUTION_ART[p.art];
            const on = i === active;
            return (
              <button
                key={p.title}
                type="button"
                data-practice
                onMouseEnter={() => {
                  setActive(i);
                  setHold(true);
                }}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                aria-expanded={on}
                /* the charcoal frame; an orange shadow wells up underneath on hover */
                className={`group relative flex flex-col rounded-[30px] bg-[#1d1d20] p-2 text-left transition-[flex-grow,box-shadow,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_36px_60px_-22px_rgba(232,59,0,0.75)] lg:min-w-0 ${
                  on ? "shadow-[0_30px_56px_-26px_rgba(232,59,0,0.6)] lg:flex-[3.4]" : "shadow-[0_18px_36px_-26px_rgba(0,0,0,0.45)] lg:flex-1"
                }`}
              >
                {/* the art window */}
                <span
                  className={`relative block overflow-hidden rounded-[24px] transition-[height] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] max-lg:h-[220px] ${
                    on ? "lg:h-[64%]" : "lg:h-full"
                  }`}
                >
                  <PracticeArt v={i} id={`pa${i}`} />
                  <span
                    className={`absolute inset-x-0 bottom-0 flex items-end gap-4 p-4 transition-opacity duration-500 sm:p-5 ${
                      on ? "opacity-100 lg:delay-200" : "lg:opacity-0"
                    }`}
                  >
                    {/* a soft light behind the type so it always reads on the art */}
                    <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-[#fff3ec]/95 via-[#fff3ec]/70 to-transparent" />
                    <span className="relative flex h-[84px] w-[84px] shrink-0 items-center justify-center rounded-[22px] bg-[#141416] shadow-[0_14px_30px_-12px_rgba(0,0,0,0.55)] sm:h-[96px] sm:w-[96px]">
                      <Art className="h-[70%] w-[70%]" />
                    </span>
                    <span className="relative min-w-0 pb-1">
                      <span className="block font-spartan text-[1.3rem] font-semibold leading-tight tracking-[-0.02em] text-[#1d1d20] sm:text-[1.6rem]">
                        {p.title}
                      </span>
                      <span className="block text-[13px] text-[#1d1d20]/55">@earrow</span>
                      <span className="mt-2.5 inline-flex rounded-full bg-[#1d1d20] px-4 py-1.5 text-[13px] font-medium text-white">Explore</span>
                    </span>
                  </span>
                  {/* closed: the name, turned on its side, dark on the peach */}
                  <span
                    className={`absolute bottom-6 left-6 hidden origin-bottom-left -rotate-90 translate-x-7 whitespace-nowrap font-spartan text-[1.35rem] font-semibold text-[#1d1d20] transition-opacity duration-300 lg:block ${
                      on ? "opacity-0" : "opacity-100 delay-300"
                    }`}
                  >
                    {p.short}
                  </span>
                </span>

                {/* open: identity row overlapping the art, then the story on charcoal */}
                <span
                  className={`relative flex flex-1 flex-col px-3 pb-3 transition-opacity duration-500 ${
                    on ? "opacity-100 lg:delay-200" : "lg:pointer-events-none lg:hidden lg:opacity-0"
                  }`}
                >
                  <span className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/85">{p.body}</span>
                  <span className="mt-auto flex items-center gap-2 pt-4 text-[14px] text-white/90">
                    <svg viewBox="0 0 16 16" className="h-4 w-4 text-[#ff7a3d]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                      <path d="M6.5 9.5l3-3M7 4.5l1-1a2.5 2.5 0 0 1 3.5 3.5l-1 1M9 11.5l-1 1A2.5 2.5 0 0 1 4.5 9l1-1" />
                    </svg>
                    earrow.lk/solutions
                  </span>
                </span>

                {/* progress line on the open panel */}
                {on && !hold && (
                  <span aria-hidden className="absolute inset-x-6 bottom-2.5 hidden h-[2px] overflow-hidden rounded-full bg-white/10 lg:block">
                    <span key={active} className="ab-progress block h-full origin-left bg-gradient-to-r from-[#e83b00] to-[#ffb13b]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════ Vision & mission ═══════════════════════════ */

function Statements() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    const q = gsap.utils.selector(root);
    const ctx = gsap.context(() => {
      (q("[data-statement]") as HTMLElement[]).forEach((p) => {
        gsap.fromTo(
          p.querySelectorAll("[data-w]"),
          { opacity: 0.14 },
          {
            opacity: 1,
            stagger: 0.08,
            ease: "none",
            scrollTrigger: { trigger: p, start: "top 82%", end: "bottom 45%", scrub: 0.4 },
          }
        );
      });
      gsap.to("[data-glow]", { xPercent: -20, yPercent: 15, duration: 14, ease: "sine.inOut", yoyo: true, repeat: -1 });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#08080a] py-20 lg:py-32">
      <span
        data-glow
        aria-hidden
        className="pointer-events-none absolute -right-[10%] top-[-20%] h-[120%] w-[65%]"
        style={{ background: "radial-gradient(circle, rgba(232,59,0,0.28), rgba(255,177,59,0.06) 48%, transparent 70%)" }}
      />
      <QMarkLight className="pointer-events-none absolute -bottom-24 -left-20 h-auto w-[460px] opacity-[0.04]" />

      <div className="relative mx-auto max-w-6xl space-y-20 px-6 lg:space-y-28 lg:px-12">
        {STATEMENTS.map((s) => (
          <div key={s.k} className="grid grid-cols-1 gap-6 lg:grid-cols-[12rem_1fr] lg:gap-12">
            <p className="flex items-center gap-3 text-[13px] font-semibold text-[#ff9a52] lg:pt-4">
              <span aria-hidden className="h-px w-8 bg-[#ff9a52]/70" />
              {s.k}
            </p>
            <p
              data-statement
              aria-label={s.v}
              className="font-spartan text-[1.7rem] font-medium leading-[1.22] tracking-[-0.02em] text-white sm:text-[2.2rem] lg:text-[2.8rem]"
            >
              {s.v.split(" ").map((w, i) => (
                <span key={i} data-w aria-hidden className="inline">
                  {w}{" "}
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════ People ═══════════════════════════════ */

function Portrait({ p, large }: { p: Person; large?: boolean }) {
  return (
    <article data-person className="ab-person group">
      <div className={`relative overflow-hidden rounded-[22px] bg-surface-sunken ${large ? "aspect-[4/5]" : "aspect-[4/5]"}`}>
        <span className="duotone absolute inset-0">
          <Image
            src={withBasePath(p.photo)}
            alt={p.name}
            fill
            sizes={large ? "(min-width:1024px) 30vw, 90vw" : "(min-width:1024px) 22vw, 45vw"}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(8,8,8,0.88) 0%, rgba(8,8,8,0.5) 28%, transparent 58%)" }}
        />
        {/* a brand edge that draws across on hover */}
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-[#e83b00] to-[#ffb13b] transition-transform duration-500 group-hover:scale-x-100" />
        <div className={`absolute inset-x-0 bottom-0 ${large ? "p-5 sm:p-7" : "p-3.5 sm:p-5"}`}>
          <h3 className={`font-spartan font-semibold leading-tight text-white ${large ? "text-[1.15rem] sm:text-[1.5rem]" : "text-[13px] sm:text-[1.05rem]"}`}>
            {p.name}
          </h3>
          <p className={`mt-1 font-medium leading-snug text-[#ffb070] ${large ? "text-[13px] sm:text-sm" : "text-[10.5px] sm:text-[13px]"}`}>
            {p.role}
          </p>
          <p className="mt-0 hidden max-h-0 overflow-hidden text-[13px] leading-relaxed text-white/70 opacity-0 transition-all duration-500 group-hover:mt-2 group-hover:max-h-24 group-hover:opacity-100 sm:block">
            {p.remit}
          </p>
        </div>
      </div>
    </article>
  );
}

function People() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-people-grid]").forEach((grid) => {
        gsap.fromTo(
          grid.querySelectorAll("[data-person]"),
          { opacity: 0, y: 60, rotation: (i) => (i % 2 ? 2 : -2) },
          {
            opacity: 1,
            y: 0,
            rotation: 0,
            duration: 1.1,
            stagger: 0.08,
            ease: "power4.out",
            scrollTrigger: { trigger: grid, start: "top 85%", once: true },
          }
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} id="people" className="relative scroll-mt-20 bg-canvas py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[13px] font-medium text-orange">Leadership</p>
            <h2 className="font-spartan mt-3 text-[2rem] font-semibold leading-[1.05] tracking-[-0.025em] text-ink sm:text-[2.6rem]">
              People powering innovation.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-ink-muted lg:text-right">
            Meet the people turning ideas into technology, and technology into business impact.
          </p>
        </div>

        <p className="mt-12 text-[12px] font-semibold uppercase tracking-[0.2em] text-ink-soft">Directors</p>
        <div data-people-grid className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
          {DIRECTORS.map((p) => (
            <Portrait key={p.name} p={p} large />
          ))}
        </div>

        <p className="mt-16 text-[12px] font-semibold uppercase tracking-[0.2em] text-ink-soft">The team</p>
        <div data-people-grid className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
          {TEAM.map((p) => (
            <Portrait key={p.name} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════ Values ═══════════════════════════════ */

function Values() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.to("[data-marquee]", { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
      gsap.fromTo(
        "[data-value]",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.07, ease: "power4.out", scrollTrigger: { trigger: "[data-values-grid]", start: "top 85%", once: true } }
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden bg-canvas-alt py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <p className="text-[13px] font-medium text-orange">What drives us</p>
        <h2 className="font-spartan mt-3 max-w-xl text-[2rem] font-semibold leading-[1.05] tracking-[-0.025em] text-ink sm:text-[2.6rem]">
          Six words we actually hold each other to.
        </h2>
      </div>

      {/* the six words, running */}
      <div className="mt-12 overflow-hidden py-2" aria-hidden>
        <div data-marquee className="flex w-max will-change-transform">
          {[0, 1].map((rep) => (
            <div key={rep} className="flex shrink-0 items-center">
              {VALUES.map((v, i) => (
                <span key={`${rep}-${v.word}`} className="flex items-center">
                  <span
                    className={`font-spartan px-6 text-[4.5rem] font-bold uppercase leading-none tracking-[-0.03em] sm:text-[6.5rem] lg:text-[8rem] ${
                      i % 2 ? "text-transparent" : "bg-gradient-to-r from-[#d13400] to-[#ff9820] bg-clip-text text-transparent"
                    }`}
                    style={i % 2 ? { WebkitTextStroke: "1.5px var(--color-ink-muted)" } : undefined}
                  >
                    {v.word}
                  </span>
                  <span className="h-3 w-3 rounded-full bg-orange/70 sm:h-4 sm:w-4" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div data-values-grid className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((v) => (
            <div
              key={v.word}
              data-value
              className="ab-value group relative overflow-hidden rounded-[22px] border border-border bg-surface p-7 transition-colors duration-500 hover:border-transparent"
            >
              <span
                aria-hidden
                className="absolute inset-0 origin-bottom scale-y-0 bg-gradient-to-br from-[#e83b00] to-[#ff9820] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100"
              />
              <p className="font-spartan relative text-[1.9rem] font-semibold uppercase leading-none tracking-[-0.02em] text-ink transition-colors duration-500 group-hover:text-white">
                {v.word}
              </p>
              <p className="relative mt-3 text-[15px] text-ink-muted transition-colors duration-500 group-hover:text-white/90">{v.line}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AboutContent() {
  return (
    <>
      <Hero />
      <Practices />
      <Statements />
      <People />
      <Values />
      <PageCta
        title="Let's build what your organisation needs next."
        body="Talk to our team about where technology can take the most weight off your operations."
        primary={{ label: "Talk to an Expert", href: "/contact" }}
        secondary={{ label: "Explore Solutions", href: "/solutions" }}
      />
    </>
  );
}
