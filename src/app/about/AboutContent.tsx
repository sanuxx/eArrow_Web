"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { PageHero, PageCta } from "@/components/page-kit";
import { withBasePath } from "@/lib/basePath";
import { SectionLabel } from "@/components/ui";
import { ArrowUpRight, QMark, QMarkLight, StackedRects } from "@/components/ArrowMark";
import { SOLUTION_ART } from "@/components/solution-art";
import { CountUp, SPRING_SOFT } from "@/components/motion-kit";

/* Marks for the vision and mission statements, in the site's stroke language. */

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** Vision — a scope trained on a point. */
function ScopeMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden {...STROKE}>
      <circle cx="50" cy="50" r="30" />
      <circle cx="50" cy="50" r="11" />
      <path d="M50 8v10M50 82v10M8 50h10M82 50h10" />
    </svg>
  );
}

/** Mission — a flag planted on the ground taken. */
function FlagMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden {...STROKE}>
      <path d="M30 88V16" />
      <path d="M30 20h44l-12 16 12 16H30" />
    </svg>
  );
}

/*
 * About eArrow. Content transcribed from the brief's "About Us" sheet.
 *
 * The page had the right words in the wrong shapes — a numbered-block grid, a
 * card per director, a row of tiles — which are the same devices Solutions,
 * Products and Industries already use. So the three sections that carry this
 * page each got a form of their own:
 *
 *   WHAT WE DO   a sticky editorial spread: the heading holds its position in
 *                the left column while the five practices scroll past it. The
 *                magazine convention, and nothing else on the site uses it.
 *   LEADERSHIP   portrait-ratio panels with the monogram set large in the
 *                brand gradient. No photographs were supplied; this is a real
 *                team layout with the plate standing in for one, so dropping
 *                images in later is a swap rather than a redesign.
 *   VALUES       the six words at display size, outlined rather than filled,
 *                each filling with the gradient as you point at it. Six short
 *                words are the one piece of content on this page that can carry
 *                type that large.
 *
 * NOTE for anyone editing the What We Do section: it must not gain an
 * `overflow-hidden` ancestor. Any non-`visible` overflow above a sticky element
 * makes that ancestor its scroll container and the stickiness silently dies —
 * which is why the decorative mark there is clipped by its own wrapper instead.
 */

const WHAT_WE_DO: {
  title: string;
  body: string;
  art: keyof typeof SOLUTION_ART;
}[] = [
  {
    title: "Digital Transformation",
    body: "Helping organisations replace manual and fragmented processes with connected digital solutions.",
    art: "window",
  },
  {
    title: "HR & Payroll Solutions",
    body: "Streamlining employee management, payroll, attendance, leave, performance, and HR operations.",
    art: "workforce",
  },
  {
    title: "Education Technology",
    body: "Enabling educational institutions to manage students, academics, admissions, attendance, fees, and administration more efficiently.",
    art: "education",
  },
  {
    title: "Business Solutions",
    body: "Developing solutions that help organisations automate workflows, improve decision-making, and increase operational efficiency.",
    art: "workflow",
  },
  {
    title: "AI & Intelligent Automation",
    body: "Helping organisations use AI and automation to reduce repetitive work and turn business data into actionable insights.",
    art: "intelligence",
  },
];

const STATS = [
  { value: "20+", label: "Years" },
  { value: "150+", label: "Customers" },
  { value: "10+", label: "Products" },
];

/*
 * `photo` is the file in /public/team, matched to the person by first name
 * against the supplied Images folder and re-encoded to a 4:5 webp (the source
 * files were up to 2MB each, and `images.unoptimized` is set for the static
 * export, so nothing would have compressed them at build time).
 *
 * P A Nandasena has no photograph in that folder. His plate keeps the monogram
 * rather than borrowing someone else's face — drop `nandasena.webp` into
 * /public/team and add the `photo` key here and it will appear.
 */
const LEADERSHIP: {
  name: string;
  role: string;
  remit: string;
  photo?: string;
}[] = [
  {
    name: "Adheesha Salpitikorala",
    role: "Director / Chief Executive Officer",
    remit: "Overall Strategy & Corporate Leadership",
    photo: "/team/adheesha.webp",
  },
  {
    name: "Dhanushka Weerasinghe",
    role: "Director / Chief Revenue Officer",
    remit: "Overall commercial performance + operations",
    photo: "/team/dhanushka.webp",
  },
  {
    name: "Shihari Wattarachchi",
    role: "Chief Manager — Operations, HR & Compliance",
    remit: "People, Operations & Governance",
    photo: "/team/shihari.webp",
  },
  {
    name: "P A Nandasena",
    role: "Director — Strategic Business & Corporate Affairs",
    remit: "Strategic Relationships, Corporate Affairs & Business Development",
  },
  {
    name: "Malith Haschendre",
    role: "Technology Transformation Architect",
    remit: "Technology, Product & Innovation",
    photo: "/team/malith.webp",
  },
  {
    name: "Awantha Yohan",
    role: "Head of Systems & Infrastructure",
    remit: "Infrastructure, Cloud & IT Operations",
    photo: "/team/awantha.webp",
  },
];

const VALUES = [
  { word: "Innovate", line: "Challenge the ordinary." },
  { word: "Care", line: "Put customers first." },
  { word: "Own", line: "Take responsibility." },
  { word: "Excel", line: "Never settle for average." },
  { word: "Trust", line: "Do the right thing." },
  { word: "Grow", line: "Grow together." },
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

export default function AboutContent() {
  return (
    <>
      <PageHero
        index="01"
        eyebrow="About eArrow"
        title="Empowering organisations through intelligent technology."
        lead="eArrow is a technology solutions company focused on helping organisations simplify operations, improve efficiency, and accelerate digital transformation."
      >
        <div className="mt-8 grid grid-cols-1 gap-8 border-t border-border pt-7 lg:grid-cols-[1fr_auto] lg:gap-16">
          <div className="grid max-w-3xl grid-cols-1 gap-8 sm:grid-cols-2">
            <p className="text-sm leading-relaxed text-ink-muted">
              We combine innovative technology, industry expertise, and a
              customer-focused approach to deliver practical solutions that
              address real business challenges.
            </p>
            <p className="text-sm leading-relaxed text-ink-muted">
              From Human Resource Management and Payroll to Student Management,
              Business Applications, Automation, and Digital Solutions, our
              platforms are designed to connect people, processes, and data
              within a single digital ecosystem.
            </p>
          </div>

          <div className="flex gap-10 lg:shrink-0">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="font-heading text-[1.935rem] font-extrabold leading-none tracking-[-0.04em]">
                  <span className="bg-gradient-to-br from-orange to-amber bg-clip-text text-transparent">
                    <CountUp value={s.value} />
                  </span>
                </p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </PageHero>

      {/* ── What we do: sticky editorial spread ──────────────────────────
          No `overflow-hidden` on this section — see the note at the top. */}
      <section className="relative bg-canvas-alt py-10 lg:py-16">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <QMark className="absolute -right-24 top-10 h-auto w-[420px] opacity-[0.04]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[20rem_1fr] lg:gap-16">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <SectionLabel index="02">What we do</SectionLabel>
              <h2 className="mt-5 font-heading text-[1.72rem] font-bold leading-[1.08] tracking-[-0.035em] text-ink sm:text-[2.064rem]">
                Five practices, one digital ecosystem.
              </h2>
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-muted">
                Each one stands on its own. Together they connect people,
                processes and data in a single place.
              </p>
              <a
                href="/solutions"
                className="group mt-7 inline-flex items-center gap-2.5 text-sm font-semibold text-ink transition-colors hover:text-orange"
              >
                See the capabilities
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>

            <div>
              {WHAT_WE_DO.map((item, i) => (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ ...SPRING_SOFT, delay: (i % 3) * 0.05 }}
                  className="group grid grid-cols-1 items-center gap-x-8 gap-y-4 border-t border-border py-8 last:border-b sm:grid-cols-[3.5rem_1fr_7rem] lg:py-9"
                >
                  <span className="font-heading text-[1.505rem] font-extrabold leading-none tracking-[-0.04em] text-ink-soft/40 transition-colors duration-500 group-hover:text-orange">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-heading text-[1.075rem] font-bold tracking-[-0.02em] text-ink sm:text-[1.182rem]">
                      {item.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
                      {item.body}
                    </p>
                  </div>

                  {/*
                    A drawing per practice, pulled from the same illustration
                    family the Solutions page uses rather than a new set — these
                    five practices ARE those capability domains described from
                    the company's side, so they should look like them.
                  */}
                  <div className="relative hidden h-[4.5rem] w-[7rem] shrink-0 items-center justify-center overflow-hidden rounded-card border border-border bg-surface-sunken transition-colors duration-500 group-hover:border-orange/30 sm:flex">
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      style={{
                        background:
                          "radial-gradient(circle at 50% 50%, rgba(var(--orange-ch), 0.14), transparent 70%)",
                      }}
                    />
                    {(() => {
                      const Art = SOLUTION_ART[item.art];
                      return <Art className="relative h-[78%] w-[78%]" />;
                    })()}
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Vision & mission ─────────────────────────────────────────────── */}
      <section
        className="on-black grain dot-matrix relative overflow-hidden py-10 lg:py-16"
        style={{ background: "#080808" }}
      >
        <StackedRects className="pointer-events-none absolute -left-20 bottom-0 h-auto w-[420px] opacity-[0.04]" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
          <SectionLabel index="03" className="!text-amber">
            Vision & mission
          </SectionLabel>

          <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            {[
              {
                k: "Our Vision",
                v: "To become a trusted technology partner that enables organisations to operate smarter, faster, and more efficiently.",
                Icon: ScopeMark,
              },
              {
                k: "Our Mission",
                v: "To create innovative, reliable, and user-centric technology solutions that solve real-world business challenges and deliver measurable value to our customers.",
                Icon: FlagMark,
              },
            ].map((item, i) => (
              <motion.div
                key={item.k}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ ...SPRING_SOFT, delay: i * 0.1 }}
                className="relative border-t border-white/15 pt-8"
              >
                <span
                  aria-hidden
                  className="absolute left-0 top-0 h-px w-16 bg-gradient-to-r from-orange to-amber"
                />

                {/* An oversized ghost of the mark, bled off the column's own
                    edge, so the statement sits on something rather than on
                    bare black. Clipped by its own wrapper — the section's
                    overflow already handles the rest. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-6 -top-4 hidden text-white/[0.045] lg:block"
                >
                  <item.Icon className="h-40 w-40" />
                </span>

                <div className="relative flex items-center gap-4">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-tile text-white shadow-[0_12px_30px_-10px_rgba(var(--orange-ch),0.7)]"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--color-orange), var(--color-amber))",
                    }}
                  >
                    <item.Icon className="h-[52%] w-[52%]" />
                  </span>
                  <p className="font-mono text-[10px] font-medium uppercase tracking-[0.26em] text-amber">
                    {item.k}
                  </p>
                </div>
                <p className="mt-6 font-heading text-[1.29rem] font-bold leading-[1.3] tracking-[-0.025em] text-white lg:text-[1.505rem]">
                  {item.v}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Leadership ───────────────────────────────────────────────────── */}
      <section className="tech-grid relative overflow-hidden bg-canvas py-10 lg:py-16">
        <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <div>
              <SectionLabel index="04">Leadership</SectionLabel>
              <h2 className="mt-5 max-w-xl font-heading text-[1.72rem] font-bold leading-[1.08] tracking-[-0.035em] text-ink sm:text-[2.064rem]">
                People powering innovation.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-ink-muted lg:pb-2 lg:text-right">
              Meet the people turning ideas into technology, and technology into
              business impact.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
            {LEADERSHIP.map((person, i) => (
              <motion.article
                key={person.name}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ ...SPRING_SOFT, delay: (i % 3) * 0.07 }}
                className="group"
              >
                {/*
                  Portrait plate, 4:5. The photograph fills it when there is
                  one; otherwise the gradient plate and monogram stand in, which
                  is why the frame was built at this ratio in the first place.
                */}
                <div
                  className="relative aspect-[4/5] overflow-hidden rounded-panel shadow-[0_28px_70px_-30px_rgba(var(--orange-ch),0.55)]"
                  style={
                    person.photo
                      ? { background: "var(--color-surface-sunken)" }
                      : {
                          background:
                            "linear-gradient(150deg, var(--color-ember), var(--color-orange) 55%, var(--color-amber))",
                        }
                  }
                >
                  {person.photo ? (
                    <>
                      <Image
                        src={withBasePath(person.photo)}
                        alt={`${person.name}, ${person.role}`}
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                      {/* A low scrim at the foot so the index stays legible
                          whatever the photograph does down there. */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(8,8,8,0.55) 0%, rgba(8,8,8,0.12) 26%, transparent 52%)",
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-[0.14]"
                        style={{
                          backgroundImage:
                            "linear-gradient(to right, rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.7) 1px, transparent 1px)",
                          backgroundSize: "34px 34px",
                        }}
                      />
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0"
                        style={{
                          background:
                            "radial-gradient(120% 90% at 30% 15%, transparent 40%, rgba(78,18,0,0.5) 100%)",
                        }}
                      />
                      <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-white/45" />

                      <QMarkLight className="pointer-events-none absolute -bottom-8 -right-6 h-auto w-36 opacity-[0.16]" />

                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="font-heading text-[3.01rem] font-extrabold leading-none tracking-[-0.05em] text-white/95 transition-transform duration-700 ease-out group-hover:scale-105">
                          {initials(person.name)}
                        </span>
                      </span>
                    </>
                  )}

                  <span className="absolute bottom-4 left-5 font-mono text-[9px] uppercase tracking-[0.22em] text-white/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="mt-5 font-heading text-base font-bold tracking-[-0.02em] text-ink">
                  {person.name}
                </h3>
                <p className="mt-1.5 text-sm font-medium text-orange">{person.role}</p>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">
                  {person.remit}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-canvas-alt py-10 lg:py-16">
        <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
          <SectionLabel index="05">What drives us</SectionLabel>
          <h2 className="mt-5 max-w-xl font-heading text-[1.72rem] font-bold leading-[1.08] tracking-[-0.035em] text-ink sm:text-[2.064rem]">
            Six words we actually hold each other to.
          </h2>

          <div className="mt-12 grid grid-cols-1 border-t border-border sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
            {VALUES.map((value, i) => (
              <motion.div
                key={value.word}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ ...SPRING_SOFT, delay: (i % 3) * 0.06 }}
                className="group relative border-b border-border py-9 sm:[&:nth-child(odd)]:pr-8 lg:[&:nth-child(3n+1)]:pr-8 lg:[&:nth-child(3n+2)]:px-8 lg:[&:nth-child(3n)]:pl-8"
              >
                {/* The word twice, stacked: outlined at rest, gradient-filled
                    on hover. Cross-fading two copies is far steadier than
                    trying to animate `-webkit-text-stroke` into a fill. */}
                <span className="relative block">
                  <span
                    className="block font-heading text-[2.365rem] font-extrabold uppercase leading-none tracking-[-0.04em] text-transparent lg:text-[2.795rem]"
                    /* Stroked in `ink-muted`, not `border-strong`. These six
                       words are content, and a 16%-alpha outline on a light
                       ground is around 1.7:1 — unreadable, and it fails contrast
                       even at display size. `ink-muted` clears the large-text
                       threshold comfortably and is defined per theme, so the
                       outline holds up in dark mode too. */
                    style={{ WebkitTextStroke: "1.5px var(--color-ink-muted)" }}
                  >
                    {value.word}
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-0 block bg-gradient-to-r from-orange to-amber bg-clip-text font-heading text-[2.365rem] font-extrabold uppercase leading-none tracking-[-0.04em] text-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 lg:text-[2.795rem]"
                  >
                    {value.word}
                  </span>
                </span>

                <p className="mt-4 text-sm leading-relaxed text-ink-muted transition-colors duration-500 group-hover:text-ink">
                  {value.line}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <PageCta
        title="Let's build what your organisation needs next."
        body="Talk to our team about where technology can take the most weight off your operations."
        primary={{ label: "Talk to an Expert", href: "/contact" }}
        secondary={{ label: "Explore Solutions", href: "/solutions" }}
      />
    </>
  );
}
