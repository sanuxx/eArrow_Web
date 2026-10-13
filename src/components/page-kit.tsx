"use client";

import { useEffect } from "react";
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
 *
 * `backdrop` is the other kind of visual: one that goes *behind* the type
 * across the full width. It is not an alternative spelling of `aside` — a
 * backdrop keeps the single-column measure, is rendered under the content, and
 * makes the section fill the viewport so it has somewhere to happen. Both slots
 * suppress the oversized brand mark, which exists only to stop an empty hero
 * reading as unfinished; a hero with either of these is not empty.
 *
 * `tone="dark"` is for a backdrop that is itself dark. It adds `on-black`
 * plus `on-field` (which lifts the secondary type to white-transparent,
 * because a mid grey vanishes over a lit gradient — see globals.css), and
 * `on-black` is the site's existing inversion: it redefines --color-canvas, --ink,
 * --border and friends on this element, so `bg-canvas`, `text-ink`,
 * `border-border` and `tech-grid` all resolve to their dark values without a
 * single one of them being restated here. `grain` comes with it, because a
 * full-bleed gradient on a dark ground bands without noise over it.
 */
export function PageHero({
  index,
  eyebrow,
  title,
  lead,
  aside,
  backdrop,
  tone = "light",
  contentY = "center",
  footer,
  children,
}: {
  index?: string;
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  aside?: React.ReactNode;
  backdrop?: React.ReactNode;
  tone?: "light" | "dark";
  /**
   * Where the type sits vertically in a viewport-tall masthead. `"top"` is for
   * a backdrop whose own composition occupies the middle and lower half of the
   * frame — the default centring would drop the headline straight onto it.
   */
  contentY?: "center" | "top";
  /**
   * Pinned to the foot of the masthead rather than following the type. Only
   * meaningful with `contentY="top"`, which is what stretches the column to
   * full height so `mt-auto` has something to push against.
   */
  footer?: React.ReactNode;
  children?: React.ReactNode;
}) {
  /*
   * A dark masthead announces itself to the fixed header.
   *
   * Nav decides whether its logo and links are white or ink from the surface
   * directly beneath it, and its rule for inner pages — "the surface is the
   * canvas" — held only because every `PageHero` was `tone="light"`. The first
   * dark one silently breaks it: ink links on a black masthead.
   *
   * Declaring it here rather than listing dark routes inside Nav keeps the
   * fact next to the thing that is true — a page that turns its hero dark gets
   * the right header without anyone remembering to update a second file. The
   * attribute is the same channel `data-hero-scrub` already uses, so Nav reads
   * it with the observer it already runs.
   */
  useEffect(() => {
    if (tone !== "dark") return;
    const root = document.documentElement;
    root.dataset.heroTone = "dark";
    return () => {
      delete root.dataset.heroTone;
    };
  }, [tone]);

  return (
    /* `pt-28` is the floor, not a preference: the header is fixed and ~80px
       tall, so anything less puts the eyebrow underneath it. */
    <section
      className={`tech-grid relative overflow-hidden bg-canvas pb-8 pt-28 lg:pb-10 lg:pt-32 ${
        /*
         * A backdrop hero fills the viewport, and it has to be `svh` rather
         * than `vh`.
         *
         * At a fixed 560px the section below it was already on screen under
         * the hero — the top of "The journey" sat in the first viewport on any
         * normal desktop, so the full-bleed background read as a band with the
         * next section leaking in beneath it rather than as a masthead.
         *
         * `100svh` is the *small* viewport height — the height with the mobile
         * browser's chrome showing, which is what a phone actually displays on
         * load. `100vh` resolves to the large viewport instead, so a vh-sized
         * hero is taller than the visible area while the address bar is up:
         * not a leak, but the hero's own bottom edge and part of its centred
         * content sit off-screen on first paint, which is the wrong first
         * impression for a masthead. `svh` makes the first screen exactly the
         * hero. Once the address bar retracts the viewport grows and a sliver
         * of the next section appears — by which point the reader is already
         * scrolling, which is when they should see it.
         *
         * There is deliberately no `min-h-screen` alongside it. It was there as
         * a fallback and it silently won: Tailwind sorts `.min-h-screen` after
         * `.min-h-[100svh]` in the emitted stylesheet, and at equal specificity
         * the later rule takes it — so the "fallback" was overriding the value
         * it was supposed to be backing up, on every phone. Verified by reading
         * the rule order out of the compiled CSS, not by reading the class
         * list. A browser too old for `svh` now falls back to auto height,
         * which is what this hero did before and is not a broken layout.
         *
         * `flex items-center` because a viewport-tall box with three lines of
         * type pinned to its top edge is not a masthead either. The padding
         * still wins on a short viewport: `pt-28` clears the fixed header, and
         * centring only starts to move the content once there is slack.
         */
        /*
         * Both kinds of visual hero fill the viewport, not just `backdrop`.
         *
         * The floor was written for the backdrop case and never extended to
         * `aside`, so the products masthead — the one page with an aside —
         * stopped at 622px and let 278px of the next section show at 1440,
         * 458px at 1920. A hero carrying a full illustration that ends
         * two-thirds of the way down the screen reads as a band, which is the
         * exact complaint the backdrop floor was added to fix.
         */
        backdrop || aside
          ? `flex min-h-[100svh] ${
              /* `items-stretch`, not `items-start`: the column has to be full
                 height for the footer's `mt-auto` to reach the bottom of the
                 hero. The type is held at the top by the column being a flex
                 column, not by the section's alignment. `pt-28` already clears
                 the fixed nav, so the extra top padding is optical — a
                 masthead pinned hard against the header reads as cramped even
                 when it technically clears it. */
              contentY === "top" ? "items-stretch lg:pt-36" : "items-center"
            }`
          : ""
      } ${tone === "dark" ? "on-black on-field grain" : ""}`}
    >
      {backdrop}

      {/* The oversized brand mark, clipped by the section — same device the
          home page uses to keep large fields from reading as empty. Dropped
          when an `aside` is supplied, since the visual now occupies that
          corner and the two would sit on top of one another. */}
      {!aside && !backdrop && (
        <QMark className="pointer-events-none absolute -right-24 -top-16 h-auto w-[520px] opacity-[0.05]" />
      )}

      <div
        className={`relative mx-auto w-full max-w-7xl px-6 lg:px-12 ${
          contentY === "top" ? "flex flex-col" : ""
        }`}
      >
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
          <div className={tone === "dark" ? "relative isolate" : undefined}>
            {/*
              A scrim sized to the type, not to the viewport.

              The backdrop's own scrims are anchored in percentages of the
              section, and once the hero became viewport-tall with the content
              centred in it, those percentages stopped lining up with where the
              text actually is. Measured across six viewports the lead fell to
              2.75:1 at 1024x768 and 4.17:1 at 1280x800 — the paragraph is
              `max-w-2xl`, so as a fraction of the width it swings from 70% of
              a 1024 screen to 35% of a 1920 one, and no single percentage
              radius covers both. A px floor cannot express it either: Chrome
              rejects `max()` inside a <radial-size> and drops the whole
              gradient silently.

              This sits inside the text column instead, so it is measured in
              the same box the text is and cannot drift away from it at any
              width. `isolate` on the parent keeps `-z-10` inside this stacking
              context — behind the type, still in front of the backdrop.
            */}
            {tone === "dark" && (
              <span
                aria-hidden
                className="pointer-events-none absolute -z-10"
                style={{
                  /*
                    Anchored left and capped, rather than inset on all four
                    sides. The text *column* is a block, so it is as wide as
                    the container (1184px at 1440) whatever the type inside it
                    measures — and a scrim stretched to that plus 8rem covered
                    the whole hero, dimming the backdrop's brightest point to
                    a neutral grey. Measured: the portal's core rendered at
                    rgb(26,25,25) with this over it.

                    The type itself is never wider than the h1's `max-w-4xl`,
                    so 60rem of scrim covers every line at every width. On a
                    narrow viewport the cap stops mattering and it covers the
                    column anyway, which is correct — there the backdrop is
                    behind the text and legibility has to win.
                  */
                  left: "-8rem",
                  right: "auto",
                  top: "-8rem",
                  bottom: "-8rem",
                  width: "min(calc(100% + 16rem), 60rem)",
                  /*
                    The ellipse is inscribed — radii 50%/50% from a centre at
                    50%/50% — so it reaches `transparent` exactly at the box's
                    own edges. That is a correctness constraint, not a style.
                    At `62% 66% at 36% 50%` the ellipse ran past the top of its
                    box, so the box clipped a gradient that was still opaque
                    and drew a hard horizontal line right across the hero.
                    Measured at y=330 as a 6.4-level step in the row average,
                    matching this element's top edge to the pixel.

                    The box is grown instead (`-inset-*-32`) to get the reach
                    the oversized radii were being used for.
                  */
                  background:
                    "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(6,6,7,0.97) 0%, rgba(6,6,7,0.94) 46%, rgba(6,6,7,0.72) 72%, rgba(6,6,7,0.28) 88%, transparent 100%)",
                }}
              />
            )}

            <SectionLabel index={index}>{eyebrow}</SectionLabel>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE_BACK }}
              className={`mt-5 font-heading font-bold leading-[1.06] tracking-[-0.038em] text-ink ${
                /*
                 * A backdrop hero is viewport-tall, and the headline never grew
                 * when it became so — it was still rendering at 51.6px in a 900px
                 * frame, the same size it had at 560px. That is most of why the
                 * masthead read as a section heading that happened to sit in a
                 * large space. At full height it can carry a display size.
                 */
                backdrop
                  ? "max-w-4xl text-[2.4rem] sm:text-[3.4rem] lg:text-[4.75rem]"
                  : aside
                    ? "text-[2.064rem] sm:text-[2.795rem] lg:text-[3.01rem]"
                    : "max-w-4xl text-[2.064rem] sm:text-[2.795rem] lg:text-[3.225rem]"
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

        {footer && <div className="mt-auto pt-12">{footer}</div>}
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
      /* `lg:py-12`, down from `lg:py-16`. Measured at 1920x900, several
         content bands cleared a screen only by their own padding — 64px top
         and bottom is 128px of a 900px viewport spent on nothing. Twelve
         still reads as a distinct band and buys back 32px on every section
         that uses this primitive. */
      className={`relative overflow-hidden py-10 lg:py-12 ${ground} ${className ?? ""}`}
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
          <h3 className="font-heading text-[1.075rem] font-bold tracking-[-0.02em] text-ink">
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
