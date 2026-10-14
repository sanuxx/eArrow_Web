"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { PageCta } from "@/components/page-kit";
import { withBasePath } from "@/lib/basePath";
import { ArrowUpRight, QMarkLight } from "@/components/ArrowMark";
import { SOLUTION_ART } from "@/components/solution-art";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

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

      /* the portrait columns drift, alternating direction — a CSS loop on
         [data-reel] (.about-reel), so it runs on the compositor */

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
            {["Empowering", "organisations through", "intelligent technology"].map((l, i) => (
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
                <div
                  data-reel
                  className={`about-reel flex flex-col gap-3 sm:gap-4 ${c % 2 ? "about-reel--down" : ""}`}
                  style={{ animationDuration: `${38 + c * 6}s` }}
                >
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

/* each card's light falls from a different place, so the five read as a set
   rather than as copies */
/* the liquid light: soft colour pools that drift, swell and merge (CSS
   loops — compositor-only, paused off screen, held on budget devices) */
const LIQUID = [
  { c: "rgba(255,214,170,0.95)", x: "-12%", y: "-30%", s: "78%", a: "liq-a", d: 13 },
  { c: "rgba(255,98,26,0.95)", x: "38%", y: "-6%", s: "86%", a: "liq-b", d: 16 },
  { c: "rgba(194,30,0,0.95)", x: "-28%", y: "34%", s: "92%", a: "liq-c", d: 18 },
  { c: "rgba(255,150,60,0.9)", x: "50%", y: "40%", s: "70%", a: "liq-a", d: 15 },
  { c: "rgba(90,8,0,0.9)", x: "10%", y: "70%", s: "80%", a: "liq-b", d: 20 },
];

const PRACTICE_LIGHT = [
  "radial-gradient(120% 95% at 85% 12%, #ffd8a8 0%, #ff8a2a 20%, #e83b00 46%, #8f1800 74%, #1a0400 100%)",
  "radial-gradient(120% 95% at 15% 18%, #ffd8a8 0%, #ff8a2a 20%, #e83b00 46%, #8f1800 74%, #1a0400 100%)",
  "radial-gradient(120% 95% at 70% 85%, #ffd8a8 0%, #ff8a2a 22%, #e83b00 48%, #8f1800 76%, #1a0400 100%)",
  "radial-gradient(120% 95% at 28% 78%, #ffd8a8 0%, #ff8a2a 22%, #e83b00 48%, #8f1800 76%, #1a0400 100%)",
  "radial-gradient(120% 95% at 50% 6%, #ffd8a8 0%, #ff8a2a 20%, #e83b00 46%, #8f1800 74%, #1a0400 100%)",
];

/*
 * The five practices as cards: a black bezel; up top, a liquid red-orange
 * light that keeps moving, the practice's name in the corner; below, a
 * dark folder-tab panel with the title, what it does, its mark and the way in.
 * Five across on desktop, a swipeable row on phones and tablets.
 */
function Practices() {
  const ref = useRef<HTMLDivElement>(null);

  /* the cards rise in as the section arrives */
  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
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
              Five practices, one digital ecosystem
            </h2>
          </div>
          <a href="/solutions" className="group inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-orange">
            See the capabilities
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        <div
          ref={ref}
          /* one row: five across on desktop, a swipeable row below that */
          className="-mx-6 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-6 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
        >
          {WHAT_WE_DO.map((p, i) => {
            const Art = SOLUTION_ART[p.art];
            return (
              <article
                key={p.title}
                data-practice
                className="group w-[84%] shrink-0 snap-center rounded-[34px] bg-black p-[9px] shadow-[0_30px_60px_-34px_rgba(0,0,0,0.6)] lg:rounded-[28px] lg:p-[7px] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:shadow-[0_40px_70px_-30px_rgba(232,59,0,0.55)] sm:w-[46%] lg:w-auto"
              >
                <div className="relative aspect-[0.9] overflow-hidden rounded-[26px] bg-[#1f1f1f] lg:aspect-[0.6] lg:rounded-[22px]">
                  {/* ── the light: liquid colour, always moving ── */}
                  <div aria-hidden className="absolute inset-x-0 top-0 h-[37%] overflow-hidden">
                    <span className="absolute inset-0" style={{ background: PRACTICE_LIGHT[i] }} />
                    {LIQUID.map((b, k) => (
                      <span
                        key={k}
                        className={`liq ${b.a} absolute aspect-square rounded-full`}
                        style={{
                          left: b.x,
                          top: b.y,
                          width: b.s,
                          background: `radial-gradient(closest-side, ${b.c}, transparent)`,
                          animationDuration: `${b.d + i * 1.5}s`,
                          animationDelay: `${-(i * 3.7 + k * 2.3)}s`,
                        }}
                      />
                    ))}
                    {/* light streaks, like a long exposure through glass */}
                    <span
                      className="liq-streak absolute -left-[20%] top-[18%] h-[22%] w-[140%] rounded-[50%]"
                      style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(255,240,225,0.55), transparent)", animationDelay: `${-i * 2.9}s` }}
                    />
                    <span
                      className="liq-streak liq-streak--slow absolute -left-[30%] top-[48%] h-[14%] w-[160%] rounded-[50%]"
                      style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(255,200,150,0.4), transparent)", animationDelay: `${-i * 4.1}s` }}
                    />
                    {/* depth: darker toward the folder, and a fine grain */}
                    <span className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/35" />
                    <span className="cine-grain absolute inset-0 opacity-[0.07]" />
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-[37%]">
                    <p className="absolute right-5 top-4 max-w-[70%] text-right font-heading text-[1rem] font-semibold leading-tight text-white drop-shadow-[0_2px_10px_rgba(70,10,0,0.55)] lg:right-4 lg:top-3.5 lg:text-[0.85rem]">
                      {p.short}
                    </p>
                  </div>

                  {/* ── the folder: a raised tab on the left, stepping down to the right ── */}
                  <div className="absolute inset-x-0 bottom-0 top-[30%]">
                    <span aria-hidden className="absolute left-0 top-0 h-12 w-[48%] rounded-tl-[22px] bg-[#1f1f1f]" />
                    <svg aria-hidden viewBox="0 0 60 30" preserveAspectRatio="none" className="absolute top-0 h-[30px] w-[60px]" style={{ left: "calc(48% - 1px)" }}>
                      <path d="M0 0 C 26 0, 32 30, 60 30 L 0 30 Z" fill="#1f1f1f" />
                    </svg>
                    <span aria-hidden className="absolute inset-x-0 bottom-0 top-[29px] rounded-tr-[22px] bg-[#1f1f1f]" />

                    <div className="relative flex h-full flex-col px-5 pb-5 pt-[44px] sm:px-6 lg:px-4 lg:pb-4">
                      <h3 className="font-heading text-[1.12rem] font-semibold leading-tight tracking-[-0.01em] text-white lg:text-[0.98rem]">{p.title}</h3>
                      <p className="mt-1.5 line-clamp-3 text-[13.5px] leading-snug text-white/55 lg:line-clamp-6 lg:text-[12.5px]">{p.body}</p>
                      <div className="mt-auto flex items-end justify-between gap-4 pt-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10 lg:h-9 lg:w-9 lg:rounded-xl">
                          <Art className="h-7 w-7" />
                        </span>
                        <a
                          href="/solutions"
                          className="group/x inline-flex items-center gap-1.5 text-[14px] font-semibold text-white transition-colors hover:text-[#ffb070] lg:text-[13px]"
                        >
                          Explore
                          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/x:-translate-y-0.5 group-hover/x:translate-x-0.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
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
              People powering innovation
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

/* ═══════════════════════════════ Values ═══════════════════════════════
 *
 * Light and restrained, on the page's own tokens (so it follows the theme):
 * a two-row marquee of the six words in ink and outline — orange only on the
 * small separators — that speeds up and leans with scroll, then six compact
 * cards. Hover: a lift, a soft orange shadow and an orange rule drawing in.
 * Phones: a swipe row with dots.
 */

function Values() {
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray<HTMLElement>("[data-mrow]");
      const tweens = rows.map((r, i) =>
        gsap.fromTo(r, { xPercent: i ? -25 : 0 }, { xPercent: i ? 0 : -25, duration: 34, ease: "none", repeat: -1 }),
      );
      const lean = gsap.quickTo(rows, "skewX", { duration: 0.6, ease: "power3.out" });
      const settle = gsap.delayedCall(0.15, () => lean(0)).pause();
      ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const v = gsap.utils.clamp(-1, 1, self.getVelocity() / 2500);
          tweens.forEach((t) => t.timeScale(1 + Math.abs(v) * 5));
          lean(-v * 6);
          settle.restart(true);
          gsap.to(tweens, { timeScale: 1, duration: 1.2, ease: "power2.out", overwrite: true, delay: 0.1 });
        },
      });
      gsap.fromTo(
        "[data-value]",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.06, ease: "power3.out", scrollTrigger: { trigger: "[data-values-grid]", start: "top 88%", once: true } },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setCurrent(cards.indexOf(e.target as HTMLElement))), {
      root: track,
      threshold: 0.6,
    });
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden bg-canvas-alt py-12 lg:py-16">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <p className="text-[13px] font-medium text-orange">What drives us</p>
        <h2 className="font-spartan mt-3 max-w-xl text-[2rem] font-semibold leading-[1.05] tracking-[-0.025em] text-ink sm:text-[2.6rem]">
          Six words we actually hold each other to
        </h2>
      </div>

      <div className="relative mt-8 space-y-1 overflow-hidden py-1 lg:mt-10" aria-hidden>
        {[0, 1].map((row) => (
          <div key={row} data-mrow className="flex w-max will-change-transform">
            {[0, 1, 2, 3].map((rep) => (
              <div key={rep} className="flex shrink-0 items-center">
                {(row ? [...VALUES].reverse() : VALUES).map((v, i) => (
                  <span key={`${rep}-${v.word}`} className="flex items-center">
                    <span
                      className={`font-spartan px-4 text-[2.2rem] font-bold uppercase leading-none tracking-[-0.03em] sm:text-[3rem] lg:text-[3.6rem] ${
                        (i + row) % 2 ? "text-transparent" : "text-ink"
                      }`}
                      style={(i + row) % 2 ? { WebkitTextStroke: "1.2px var(--color-border-strong)" } : undefined}
                    >
                      {v.word}
                    </span>
                    <span className="h-1.5 w-1.5 rotate-45 bg-orange" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl lg:px-12">
        <div
          ref={trackRef}
          data-values-grid
          className="mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-4 [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 lg:mt-10 lg:grid-cols-6 lg:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {VALUES.map((v) => (
            <article
              key={v.word}
              data-value
              className="group relative w-[62%] shrink-0 snap-center overflow-hidden rounded-[18px] border border-border bg-surface p-5 transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-orange/30 hover:shadow-[0_24px_44px_-24px_rgba(var(--orange-ch),0.55)] sm:w-auto"
            >
              <p className="font-spartan text-[1.35rem] font-semibold uppercase leading-none tracking-[-0.02em] text-ink lg:text-[1.25rem]">{v.word}</p>
              <p className="mt-2 text-[13px] leading-snug text-ink-muted">{v.line}</p>
              <span aria-hidden className="absolute inset-x-5 bottom-0 h-[2px] origin-left scale-x-0 bg-orange transition-transform duration-500 group-hover:scale-x-100" />
            </article>
          ))}
        </div>
        <div className="mt-4 flex justify-center gap-1.5 sm:hidden" aria-hidden>
          {VALUES.map((v, i) => (
            <span key={v.word} className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-orange" : "w-1.5 bg-ink-soft/40"}`} />
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
        title="Let's build what your organisation needs next"
        body="Talk to our team about where technology can take the most weight off your operations."
        primary={{ label: "Talk to an Expert", href: "/contact" }}
        secondary={{ label: "Explore Solutions", href: "/solutions" }}
      />
    </>
  );
}
