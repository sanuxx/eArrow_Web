"use client";

import { motion } from "framer-motion";
import type { MouseEvent } from "react";
import { ArrowGlyph } from "./ArrowMark";
import { SectionLabel, SectionHeading } from "./ui";
import { SPRING_SOFT } from "./motion-kit";

/*
 * Brief: "Don't make them ordinary rectangular cards."
 *
 * So this is not a row of three equal tiles. It is an asymmetric bento — one
 * lead card carrying twice the height, two supporting cards stacked beside it —
 * which gives the section a reading order instead of three things competing at
 * the same volume.
 *
 * Every card is white + black type + an orange-gradient illustration drawn from
 * the same stacked rounded-rectangle vocabulary as the logo. The material comes
 * from `.surface-card` (lit top edge, layered shadow) and `.edge-sweep` (a
 * gradient hairline that draws across the top on hover); on top of that each
 * card carries a cursor-tracked spotlight, an ember bloom in the far corner,
 * and an illustration whose parts move independently while the card is hovered.
 */

type IllustrationProps = { className?: string };

/*
 * The illustrations sit in a sunken well, so they are authored against
 * `--color-surface-sunken` and need no per-theme variants. Each moving part is
 * its own `<g>` because a transform on the `<rect>` itself is measured in user
 * units, not CSS pixels, and would scale with the viewBox.
 */

function SoftwareIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 140" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="sol-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--color-orange)" }} />
          <stop offset="100%" style={{ stopColor: "var(--color-amber)" }} />
        </linearGradient>
      </defs>
      {/* Three stacked pills that fan apart on hover — the logo mark, unpacked. */}
      <g className="transition-transform duration-700 ease-out group-hover:-translate-x-2">
        <rect x="18" y="16" width="128" height="30" rx="15" fill="url(#sol-a)" opacity="0.22" />
      </g>
      <g className="transition-transform duration-700 ease-out group-hover:translate-x-3">
        <rect x="38" y="55" width="128" height="30" rx="15" fill="url(#sol-a)" opacity="0.5" />
      </g>
      <g className="transition-transform duration-700 ease-out group-hover:-translate-x-1">
        <rect x="18" y="94" width="96" height="30" rx="15" fill="url(#sol-a)" />
        <circle cx="132" cy="109" r="5" fill="url(#sol-a)" opacity="0.55" />
        <circle cx="148" cy="109" r="5" fill="url(#sol-a)" opacity="0.3" />
      </g>
    </svg>
  );
}

function ServicesIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 140" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="sol-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--color-orange)" }} />
          <stop offset="100%" style={{ stopColor: "var(--color-amber)" }} />
        </linearGradient>
      </defs>
      {/* Concentric shells around a solid core: infrastructure wrapped in support. */}
      <g
        className="origin-center transition-transform duration-700 ease-out group-hover:scale-105"
        style={{ transformBox: "fill-box" }}
      >
        <rect x="26" y="16" width="148" height="108" rx="40" stroke="url(#sol-b)" strokeWidth="7" opacity="0.18" />
      </g>
      <g
        className="origin-center transition-transform duration-700 ease-out group-hover:scale-[1.08]"
        style={{ transformBox: "fill-box" }}
      >
        <rect x="50" y="34" width="100" height="72" rx="30" stroke="url(#sol-b)" strokeWidth="7" opacity="0.45" />
      </g>
      <g
        className="origin-center transition-transform duration-700 ease-out group-hover:scale-90"
        style={{ transformBox: "fill-box" }}
      >
        <rect x="76" y="52" width="48" height="36" rx="18" fill="url(#sol-b)" />
      </g>
    </svg>
  );
}

const DIGITAL_BARS = [
  { x: 20, y: 88, h: 36, opacity: 0.28, lift: "group-hover:-translate-y-1" },
  { x: 64, y: 62, h: 62, opacity: 0.5, lift: "group-hover:-translate-y-2" },
  { x: 108, y: 34, h: 90, opacity: 0.75, lift: "group-hover:-translate-y-3" },
  { x: 152, y: 14, h: 110, opacity: 1, lift: "group-hover:-translate-y-4" },
];

function DigitalIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 140" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="sol-c" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" style={{ stopColor: "var(--color-orange)" }} />
          <stop offset="100%" style={{ stopColor: "var(--color-amber)" }} />
        </linearGradient>
      </defs>
      {/* A growth curve told in the logo's pill shape — each column lifts further,
          and staggering the delays turns four tweens into one gesture. */}
      {DIGITAL_BARS.map((b, i) => (
        <g
          key={b.x}
          className={`transition-transform duration-700 ease-out ${b.lift}`}
          style={{ transitionDelay: `${i * 70}ms` }}
        >
          <rect x={b.x} y={b.y} width="34" height={b.h} rx="17" fill="url(#sol-c)" opacity={b.opacity} />
        </g>
      ))}
    </svg>
  );
}

type Solution = {
  n: string;
  id: string;
  title: string;
  body: string;
  chips: string[];
  cta: string;
  href: string;
  Illustration: (props: IllustrationProps) => React.ReactElement;
};

const SOLUTIONS: Solution[] = [
  {
    n: "01",
    id: "SW",
    title: "Software Solutions",
    body: "Powerful software built around your operations — HR and payroll, education, healthcare, production and billing platforms already running on the ground in Sri Lanka.",
    chips: ["HR & Payroll", "Education", "Hospital", "Production", "E-Billing"],
    cta: "Explore Software",
    href: "#products",
    Illustration: SoftwareIllustration,
  },
  {
    n: "02",
    id: "MS",
    title: "Managed Services",
    body: "Reliable technology infrastructure, support and expertise.",
    chips: ["Infrastructure", "Support", "Access Control"],
    cta: "Explore Services",
    href: "#contact",
    Illustration: ServicesIllustration,
  },
  {
    n: "03",
    id: "DX",
    title: "Digital Experiences",
    body: "Websites, platforms and digital experiences built for growth.",
    chips: ["Web Platforms", "E-Commerce", "Portals"],
    cta: "Explore Digital",
    href: "#contact",
    Illustration: DigitalIllustration,
  },
];

/** Tracks the cursor inside a card so the spotlight can follow it. */
function trackPointer(e: MouseEvent<HTMLAnchorElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
}

/** Capability tag — the specifics that stop a card being three adjectives. */
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border bg-surface-sunken px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted transition-colors duration-500 group-hover:border-orange/25 group-hover:text-ink">
      {children}
    </span>
  );
}

/**
 * The sunken illustration well: its own fine grid, a ghost index numeral behind
 * the artwork, and the two-letter code in the corner like a drawing number.
 */
function Well({
  s,
  className,
  svgClassName,
  showIndex = true,
}: {
  s: Solution;
  className?: string;
  svgClassName?: string;
  /** The ghost numeral only reads at the lead card's size; it is noise in a 128px well. */
  showIndex?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-card border border-border bg-surface-sunken ${className ?? ""}`}
    >
      <span
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-line) 1px, transparent 1px), linear-gradient(to bottom, var(--color-line) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      {showIndex && (
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-6 -left-2 font-heading text-[7rem] font-bold leading-none tracking-[-0.05em] text-ink opacity-[0.04]"
        >
          {s.n}
        </span>
      )}
      <span className="absolute right-4 top-4 font-mono text-[10px] tracking-[0.2em] text-ink-soft">
        {s.id}
      </span>
      <s.Illustration className={`relative h-full w-full ${svgClassName ?? ""}`} />
    </div>
  );
}

/** The affordance, since the whole card is the link: label plus a disc that fills. */
function CtaRow({ label, pin = false }: { label: string; pin?: boolean }) {
  return (
    <span
      className={`relative flex items-center justify-between gap-4 ${
        pin ? "mt-auto pt-8" : "mt-8"
      }`}
    >
      <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-orange">
        {label}
      </span>
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border-strong text-ink transition-colors duration-500 group-hover:border-transparent group-hover:text-white">
        <span className="absolute inset-0 scale-0 rounded-full bg-gradient-to-br from-ember to-orange transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-100" />
        <ArrowGlyph className="relative h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-0.5" />
      </span>
    </span>
  );
}

/** Shared shell: the material, the spotlight, and the corner ember bloom. */
function Card({
  s,
  i,
  className,
  children,
}: {
  s: Solution;
  i: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.a
      href={s.href}
      onMouseMove={trackPointer}
      initial={{ opacity: 0, y: 34, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -10, scale: 1.01 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ ...SPRING_SOFT, delay: i * 0.1 }}
      style={{ "--mx": "50%", "--my": "50%" } as React.CSSProperties}
      className={`surface-card edge-sweep group flex flex-col overflow-hidden rounded-panel transition-[box-shadow,border-color] duration-500 hover:border-orange/30 hover:shadow-[var(--shadow-lift)] ${className ?? ""}`}
    >
      {/* cursor-tracked spotlight */}
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(420px circle at var(--mx) var(--my), rgba(var(--orange-ch), 0.07), transparent 70%)",
        }}
      />
      {/* Ember bloom in the far corner — warmth without adding an orange field,
          which the 65/20/15 colour budget does not have room for here. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
        style={{ background: "radial-gradient(circle, rgba(var(--amber-ch), 0.28), transparent 70%)" }}
      />
      {children}
    </motion.a>
  );
}

export default function Solutions() {
  const [lead, ...rest] = SOLUTIONS;

  return (
    <section id="solutions" className="tech-grid relative bg-canvas py-24 lg:py-32">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <SectionLabel index="01">Solutions</SectionLabel>
        <SectionHeading>Technology designed around your business.</SectionHeading>

        {/*
         * Asymmetric bento: one column on mobile; on `lg` a 12-column grid two
         * rows tall, where the lead card takes 7 columns and both rows while the
         * two supporting cards stack in the remaining 5.
         */}
        <div className="mt-16 grid grid-cols-1 gap-5 lg:grid-cols-12 lg:grid-rows-2">
          <Card s={lead} i={0} className="p-8 lg:col-span-7 lg:row-span-2 lg:p-10">
            <h3 className="relative font-heading text-3xl font-bold tracking-[-0.025em] text-ink lg:text-[2.5rem] lg:leading-[1.1]">
              {lead.title}
            </h3>
            <p className="relative mt-4 max-w-md text-[0.98rem] leading-[1.75] text-ink-muted">
              {lead.body}
            </p>
            <div className="relative mt-6 flex flex-wrap gap-2">
              {lead.chips.map((c) => (
                <Chip key={c}>{c}</Chip>
              ))}
            </div>

            <Well
              s={lead}
              className="relative mt-10 min-h-[220px] flex-1 p-8"
              svgClassName="transition-transform duration-700 group-hover:scale-[1.03]"
            />

            <CtaRow label={lead.cta} pin />
          </Card>

          {rest.map((s, i) => (
            <Card key={s.title} s={s} i={i + 1} className="justify-center p-8 lg:col-span-5 lg:p-9">
              {/*
                Icon-beside-text at every width used to squeeze the text column
                to ~110px on a 375px phone once the 128px icon and its gap were
                subtracted — a single unbreakable word ("Experiences") then
                overflowed past the card's own edge and was clipped by it.
                Stacking below `sm` gives the heading the full card width; the
                row returns once there is room for both.
              */}
              <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:gap-6">
                <Well s={s} className="h-32 w-32 shrink-0 p-5" showIndex={false} />
                <div className="min-w-0">
                  <h3 className="font-heading text-2xl font-bold tracking-[-0.02em] text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-2.5 text-[0.95rem] leading-[1.7] text-ink-muted">{s.body}</p>
                </div>
              </div>

              <div className="relative mt-6 flex flex-wrap gap-2">
                {s.chips.map((c) => (
                  <Chip key={c}>{c}</Chip>
                ))}
              </div>

              <CtaRow label={s.cta} />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
