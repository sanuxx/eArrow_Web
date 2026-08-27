"use client";

import { motion } from "framer-motion";
import { QMark, ArrowUpRight } from "./ArrowMark";
import { SectionLabel } from "./ui";
import { EASE_BACK, SPRING_SOFT } from "./motion-kit";

/**
 * Primitives for the inner pages.
 *
 * The home page is a single scrolled composition and owns its own section
 * chrome. Every other page in the brief is a conventional document — a masthead
 * and a stack of content blocks — so that shape is defined once here rather than
 * re-derived nine times with slightly different padding.
 *
 * The nav is fixed, so `PageHero` carries the top offset for the whole page;
 * nothing below it needs to know the header exists.
 */

/**
 * Masthead for an inner page. Eyebrow, display heading, optional lead.
 *
 * `aside` is an optional visual for the right-hand half. Supplying it splits
 * the masthead into two columns; without it the hero keeps its original
 * single-column measure, so the pages that don't pass one are untouched.
 */
export function PageHero({
  index,
  eyebrow,
  title,
  lead,
  aside,
  children,
}: {
  index?: string;
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  aside?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    /* `pt-28` is the floor, not a preference: the header is fixed and ~80px
       tall, so anything less puts the eyebrow underneath it. */
    <section className="tech-grid relative overflow-hidden bg-canvas pb-8 pt-28 lg:pb-10 lg:pt-32">
      {/* The oversized brand mark, clipped by the section — same device the
          home page uses to keep large fields from reading as empty. Dropped
          when an `aside` is supplied, since the visual now occupies that
          corner and the two would sit on top of one another. */}
      {!aside && (
        <QMark className="pointer-events-none absolute -right-24 -top-16 h-auto w-[520px] opacity-[0.05]" />
      )}

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <div
          className={
            /* `items-start`, not `items-center`: the aside is usually the
               taller column, and centring it made it overhang the eyebrow at
               the top and the lead at the bottom, so the two halves read as
               unaligned. Sharing a top edge gives the masthead one clean
               horizon. */
            aside
              ? "grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16"
              : undefined
          }
        >
          <div>
            <SectionLabel index={index}>{eyebrow}</SectionLabel>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE_BACK }}
              className={`mt-5 font-heading text-[2.064rem] font-bold leading-[1.06] tracking-[-0.038em] text-ink sm:text-[2.795rem] ${
                aside ? "lg:text-[3.01rem]" : "max-w-4xl lg:text-[3.225rem]"
              }`}
            >
              {title}
            </motion.h1>

            {lead && (
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted"
              >
                {lead}
              </motion.p>
            )}
          </div>

          {aside && <div className="lg:pl-4">{aside}</div>}
        </div>

        {children}
      </div>
    </section>
  );
}

/**
 * A content band. `tone` picks the ground: the default alternates with the
 * page canvas, `black` is the brief's high-contrast band, and `sunken` is the
 * subtle grey used to separate two adjacent light sections.
 */
export function PageSection({
  id,
  tone = "canvas",
  label,
  index,
  title,
  lead,
  children,
  className,
}: {
  id?: string;
  tone?: "canvas" | "sunken" | "black";
  label?: string;
  index?: string;
  title?: React.ReactNode;
  lead?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  const ground =
    tone === "black"
      ? "on-black grain dot-matrix"
      : tone === "sunken"
        ? "bg-canvas-alt"
        : "bg-canvas";

  return (
    <section
      id={id}
      className={`relative overflow-hidden py-10 lg:py-16 ${ground} ${className ?? ""}`}
      style={tone === "black" ? { background: "#080808" } : undefined}
    >
      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        {label && (
          <SectionLabel index={index} className={tone === "black" ? "!text-amber" : ""}>
            {label}
          </SectionLabel>
        )}

        {title && (
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`mt-6 max-w-3xl font-heading text-[1.806rem] font-bold leading-[1.08] tracking-[-0.035em] sm:text-[2.365rem] lg:text-[2.58rem] ${
              tone === "black" ? "text-white" : "text-ink"
            }`}
          >
            {title}
          </motion.h2>
        )}

        {lead && (
          <p
            className={`mt-6 max-w-2xl text-base leading-relaxed ${
              tone === "black" ? "text-white/65" : "text-ink-muted"
            }`}
          >
            {lead}
          </p>
        )}

        {children}
      </div>
    </section>
  );
}

/**
 * The numbered "01 — Title / description" list the brief uses for What We Do
 * and the case-study stages. Indices are derived, never authored, so inserting
 * an item can't leave the numbering wrong.
 */
export function NumberedBlocks({
  items,
  className,
}: {
  items: { title: string; body: string }[];
  className?: string;
}) {
  return (
    <div className={`mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-2 ${className ?? ""}`}>
      {items.map((item, i) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ ...SPRING_SOFT, delay: (i % 2) * 0.06 + Math.floor(i / 2) * 0.05 }}
          className="edge-sweep group relative bg-surface px-7 py-9 transition-colors duration-500 hover:bg-surface-sunken lg:px-9"
        >
          <span className="font-mono text-[10px] font-medium tracking-[0.24em] text-orange">
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-4 font-heading text-[1.075rem] font-bold tracking-[-0.02em] text-ink">
            {item.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">{item.body}</p>
        </motion.div>
      ))}
    </div>
  );
}

/** A card of grouped capability chips — the shape the Solutions sheet describes. */
export function CapabilityGroup({
  name,
  items,
  index,
}: {
  name: string;
  items: string[];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ ...SPRING_SOFT, delay: (index % 3) * 0.06 }}
      className="surface-card edge-sweep group relative overflow-hidden rounded-card px-7 py-8 transition-colors duration-400 hover:border-orange/30"
    >
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-[10px] tracking-[0.22em] text-ink-soft">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="font-heading text-base font-bold tracking-[-0.02em] text-ink">
          {name}
        </h3>
      </div>

      <ul className="mt-6 flex flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-full border border-border bg-surface-sunken px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted transition-colors duration-500 group-hover:border-orange/25 group-hover:text-ink"
          >
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

/** Closing band — the orange gradient CTA that ends every page in the brief. */
export function PageCta({
  title,
  body,
  primary,
  secondary,
}: {
  title: string;
  body: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <section className="on-orange grain relative overflow-hidden py-10 lg:py-16">
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(115deg, var(--color-ember), var(--color-orange) 55%, var(--color-amber))" }}
      />
      <div className="relative mx-auto max-w-7xl px-6 text-center lg:px-12">
        <h2 className="mx-auto max-w-3xl font-heading text-[1.806rem] font-bold leading-[1.08] tracking-[-0.035em] text-white sm:text-[2.236rem] lg:text-[2.58rem]">
          {title}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/80">
          {body}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href={primary.href}
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-white px-9 py-4 text-sm font-bold text-[#080808] shadow-[0_20px_50px_-16px_rgba(80,18,0,0.65)] transition-transform duration-300 hover:scale-[1.04]"
          >
            {primary.label}
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          {secondary && (
            <a
              href={secondary.href}
              className="group inline-flex items-center gap-3 rounded-full border border-white/35 px-9 py-4 text-sm font-semibold text-white transition-colors duration-300 hover:border-white hover:bg-white/10"
            >
              {secondary.label}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
