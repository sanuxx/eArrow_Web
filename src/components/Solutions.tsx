"use client";

import { motion } from "framer-motion";
import { useState, type MouseEvent } from "react";
import { ArrowGlyph } from "./ArrowMark";
import { SectionLabel, SectionHeading } from "./ui";
import { SPRING_SOFT } from "./motion-kit";
import { withBasePath } from "@/lib/basePath";

/*
 * Brief: "Don't make them ordinary rectangular cards."
 *
 * So this is not a row of three equal tiles. It is an asymmetric bento — one
 * lead card carrying twice the height, two supporting cards stacked beside it —
 * which gives the section a reading order instead of three things competing at
 * the same volume.
 *
 * Every card is white + black type + its own artwork. The material comes
 * from `.surface-card` (lit top edge, layered shadow) and `.edge-sweep` (a
 * gradient hairline that draws across the top on hover); on top of that each
 * card carries a cursor-tracked spotlight, an ember bloom in the far corner,
 * and artwork that eases forward while the card is hovered.
 */

/* Each solution is shown by its own artwork (public/Home/solutions), served as
   compressed WebP sized for the card. */

type Solution = {
  n: string;
  id: string;
  title: string;
  body: string;
  chips: string[];
  cta: string;
  href: string;
  image: string;
  alt: string;
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
    image: "/Home/solutions/software-solutions.webp",
    alt: "A laptop, tablet and phone running business software",
  },
  {
    n: "02",
    id: "MS",
    title: "Managed Services",
    body: "Reliable technology infrastructure, support and expertise.",
    chips: ["Infrastructure", "Support", "Access Control"],
    cta: "Explore Services",
    href: "#contact",
    image: "/Home/solutions/managed-services.webp",
    alt: "Server racks connected to a glowing cloud",
  },
  {
    n: "03",
    id: "DX",
    title: "Digital Experiences",
    body: "Websites, platforms and digital experiences built for growth.",
    chips: ["Web Platforms", "E-Commerce", "Portals"],
    cta: "Explore Digital",
    href: "#contact",
    image: "/Home/solutions/digital-experiences.webp",
    alt: "A person relaxing beside a phone showing a designed digital experience",
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
          className="pointer-events-none absolute -bottom-6 -left-2 font-heading text-[6.02rem] font-bold leading-none tracking-[-0.05em] text-ink opacity-[0.04]"
        >
          {s.n}
        </span>
      )}
      <span className="absolute right-4 top-4 font-mono text-[10px] tracking-[0.2em] text-ink-soft">
        {s.id}
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={withBasePath(s.image)}
        alt={s.alt}
        loading="lazy"
        draggable={false}
        className={`relative h-full w-full object-contain drop-shadow-[0_18px_30px_rgba(120,40,0,0.22)] ${svgClassName ?? ""}`}
      />
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

/*
 * ─────────────────────────────────────────────────────────────────────────
 * The section, redesigned: three panels that open.
 *
 * It was an asymmetric bento — one tall card beside two stacked ones. That
 * satisfied the brief's "don't make them ordinary rectangular cards", but it
 * was still three boxes sitting still, and the lead card's height was dictated
 * by its neighbours rather than by anything it had to say.
 *
 * These are shutters instead. All three stand side by side; the one you point
 * at opens to full width and shows its illustration, its copy and its chips,
 * while the other two fall back to a spine carrying just an index and the name
 * set vertically. One thing is open at a time, so the section holds a single
 * focal point instead of asking the eye to choose between three.
 *
 * WHY IT IS NOT HOVER-ONLY. `onMouseEnter` alone would leave this inert on a
 * phone and unusable from a keyboard. Focus opens a panel too, so tabbing
 * through walks the three open states in order, and below `lg` the whole
 * mechanism is dropped: every panel renders open and stacked, which is the only
 * sensible shape in a single column.
 *
 * WHY `flex-grow` AND NOT `width`. The panels share one row, so animating grow
 * lets the three settle against each other without any of them being told a
 * pixel value — the row stays exactly the container's width at every frame of
 * the transition, with no rounding gap opening at the right edge.
 * ─────────────────────────────────────────────────────────────────────────
 */
export default function Solutions() {
  const [active, setActive] = useState(0);

  return (
    <section id="solutions" className="tech-grid relative overflow-hidden bg-canvas py-10 lg:py-16">
      {/*
        The light the panels are made of.

        These are not background decoration that could be dropped. The panels
        below are frosted glass, and `backdrop-filter` blurs whatever is
        painted underneath it — over a flat white section that is flat white,
        so the glass would render as a faintly grey rectangle and read as
        nothing at all. Colour behind the panes is what gives the blur
        something to carry, and it is why the effect looks like glass rather
        than like opacity.

        Placed to sit under the row rather than around it, and soft enough that
        the type on top never loses contrast — measured, not assumed.
      */}
      {/* Clipped to the band the panels occupy. Unclipped, the sharp shapes
          rose above the row and read as stray blobs floating over the heading
          rather than as light sitting behind glass. They still show crisp in
          the margins to the left and right of the row, which is where the
          contrast with the blurred version is visible. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[23%] h-[60%] overflow-hidden"
      >
        {/*
          What the glass is made of — and it has to be *sharp*.
          
          Two earlier attempts failed for the same reason from opposite ends.
          The first put soft washes at the section margins, where they passed
          behind almost none of the panes. The second moved them under the row
          but left them blurred at 90-100px, and a pre-blurred gradient gives
          `backdrop-filter` nothing to do: blurring a soft gradient returns the
          same soft gradient, so the panes still read as warm white cards.

          Frosted glass is legible only when something with structure is behind
          it — edges the pane can diffuse. So these are near-hard-edged now,
          and the blur that matters is the one in `.frost-card`. The tell is the
          gaps between the panels: the same shapes read crisp there and soft
          through the glass, which is the whole effect.
        */}
        <div
          className="absolute left-[14%] top-[6%] h-[290px] w-[290px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(var(--amber-ch), 0.85), rgba(var(--orange-ch), 0.5) 62%, transparent 74%)",
            filter: "blur(6px)",
          }}
        />
        <div
          className="absolute left-[40%] top-[38%] h-[230px] w-[230px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(var(--orange-ch), 0.7), rgba(var(--ember-ch, 194,46,0), 0.3) 60%, transparent 74%)",
            filter: "blur(5px)",
          }}
        />
        <div
          className="absolute right-[13%] top-[2%] h-[270px] w-[270px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(var(--amber-ch), 0.8), rgba(var(--orange-ch), 0.42) 60%, transparent 74%)",
            filter: "blur(6px)",
          }}
        />

        {/* Rings, for edges rather than mass. A gradient blob has no contour
            once blurred; a stroke does, and it is contours that make a pane
            look like it is standing in front of something. */}
        <div
          className="absolute left-[24%] top-[18%] h-[330px] w-[330px] rounded-full border-[14px]"
          style={{ borderColor: "rgba(var(--orange-ch), 0.28)", filter: "blur(3px)" }}
        />
        <div
          className="absolute right-[24%] top-[10%] h-[300px] w-[300px] rounded-full border-[12px]"
          style={{ borderColor: "rgba(var(--amber-ch), 0.42)", filter: "blur(3px)" }}
        />

        {/* A soft floor under all of it, so the sharp shapes sit in warmth
            rather than on bare white. */}
        <div
          className="absolute inset-x-0 top-0 h-full"
          style={{
            background:
              "radial-gradient(60% 70% at 50% 50%, rgba(var(--amber-ch), 0.16), transparent 72%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <SectionLabel index="01">Solutions</SectionLabel>
        <SectionHeading>Technology designed around your business</SectionHeading>

        <div className="mt-12 flex flex-col gap-4 lg:mt-14 lg:h-[27rem] lg:flex-row">
          {SOLUTIONS.map((s, i) => {
            const live = i === active;
            return (
              <motion.a
                key={s.title}
                href={s.href}
                onMouseMove={trackPointer}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                aria-current={live ? "true" : undefined}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ ...SPRING_SOFT, delay: i * 0.1 }}
                style={{ "--mx": "50%", "--my": "50%" } as React.CSSProperties}
                className={`frost-card edge-sweep group relative overflow-hidden rounded-panel transition-[flex-grow,box-shadow,border-color] duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)] lg:basis-0 ${
                  live
                    ? "lg:grow-[2.7] lg:border-orange/25 lg:shadow-[var(--shadow-lift)]"
                    : "lg:grow-[0.72]"
                }`}
              >
                {/* cursor-tracked spotlight */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(420px circle at var(--mx) var(--my), rgba(var(--orange-ch), 0.07), transparent 70%)",
                  }}
                />
                {/* ember bloom in the far corner, on the open panel only */}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl transition-opacity duration-700 ${
                    live ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ background: "radial-gradient(circle, rgba(var(--amber-ch), 0.28), transparent 70%)" }}
                />

                {/*
                  The spine, for a closed panel. Desktop only — below `lg` there
                  is no closed state to draw. `pointer-events-none` so it never
                  intercepts the hover that would open the panel underneath it.
                */}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute inset-0 hidden flex-col items-center justify-between py-8 transition-opacity duration-500 lg:flex ${
                    live ? "opacity-0" : "opacity-100 delay-150"
                  }`}
                >
                  <span />
                  <span
                    className="font-heading text-[1.15rem] font-bold tracking-[-0.02em] text-ink"
                    style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                  >
                    {s.title}
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border-strong text-ink-soft">
                    <ArrowGlyph className="h-3 w-3" />
                  </span>
                </span>

                {/*
                  The open panel. Held at `opacity-0` while closed rather than
                  unmounted, so the text never reflows into a 90px column on the
                  way in or out — the panel's own `overflow-hidden` clips it.
                */}
                <span
                  className={`relative flex h-full flex-col p-8 transition-opacity duration-500 lg:p-9 ${
                    live ? "opacity-100 delay-100" : "lg:opacity-0"
                  }`}
                >
                  {/*
                    Copy and drawing side by side once the panel is open.

                    Stacked, the well inherited the panel's full open width and
                    only ~180px of height. The drawing keeps its aspect ratio, so
                    it scaled to that height and sat marooned in the middle of a
                    680px box. Beside the copy it gets a column roughly as tall
                    as it is wide, which is the proportion it was drawn for.
                  */}
                  <span className="flex h-full flex-col gap-7 lg:flex-row lg:items-stretch lg:gap-9">
                    <span className="flex min-w-0 flex-1 flex-col">
                      <h3 className="font-heading text-[1.45rem] font-bold tracking-[-0.025em] text-ink lg:text-[1.75rem]">
                        {s.title}
                      </h3>

                      <p className="mt-3 max-w-md text-[0.95rem] leading-[1.7] text-ink-muted">
                        {s.body}
                      </p>

                      <span className="mt-5 flex flex-wrap gap-2">
                        {s.chips.map((c) => (
                          <Chip key={c}>{c}</Chip>
                        ))}
                      </span>

                      <CtaRow label={s.cta} pin />
                    </span>

                    <Well
                      s={s}
                      className="min-h-[150px] p-6 lg:h-full lg:w-[15rem] lg:shrink-0"
                      svgClassName="transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </span>
                </span>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
