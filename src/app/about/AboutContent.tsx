"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { PageHero, PageCta } from "@/components/page-kit";
import { withBasePath } from "@/lib/basePath";
import { SectionLabel } from "@/components/ui";
import { ArrowUpRight, QMark, QMarkLight, StackedRects } from "@/components/ArrowMark";
import { SOLUTION_ART } from "@/components/solution-art";
import { CountUp, SPRING_SOFT } from "@/components/motion-kit";

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
    name: "P A Nandasena",
    role: "Director — Strategic Business & Corporate Affairs",
    remit: "Strategic Relationships, Corporate Affairs & Business Development",
    photo: "/team/nandasena.webp",
  },
  {
    name: "Shihari Wattarachchi",
    role: "Chief Manager — Operations, HR & Compliance",
    remit: "People, Operations & Governance",
    photo: "/team/shihari.webp",
  },
  {
    name: "Malith Haschendre",
    role: "Technology Transformation Architect",
    remit: "Technology, Product & Innovation",
    photo: "/team/malith.webp",
  },
  {
    name: "Bihara Ranaweera",
    role: "Project Manager",
    remit: "Project Management, Operations & Delivery",
    photo: "/team/bihara.webp",
  },
  {
    name: "Awantha Yohan",
    role: "Head of Systems & Infrastructure",
    remit: "Infrastructure, Cloud & IT Operations",
    photo: "/team/awantha.webp",
  },
  {
    name: "Malinda Deshapriya",
    role: "Senior Tech Lead",
    remit: "Technology, Engineering & Technical Leadership",
    photo: "/team/malinda.webp",
  },
  {
    name: "Thilina Dananjaya",
    role: "Associate Tech Lead",
    remit: "Technology, Engineering & Technical Delivery",
    photo: "/team/thilina.webp",
  },
  {
    name: "Udara Ekanayake",
    role: "Senior Software Engineer",
    remit: "Software Engineering, Development & Technical Solutions",
    photo: "/team/udara.webp",
  },
  {
    name: "Ravija Salpitikorala",
    role: "DevOps Engineer",
    remit: "Cloud Infrastructure, Automation & Deployment",
    photo: "/team/ravija.webp",
  },
  {
    name: "Kenula Dissanayake",
    role: "Growth Marketing & Revenue Lead",
    remit: "Growth Strategy, Marketing & Revenue",
    photo: "/team/kenula.webp",
  },
  {
    name: "Poornima Sathsarani",
    role: "Senior Executive Customer Success",
    remit: "Customer Support, Service & Technical Assistance",
    photo: "/team/poornima.webp",
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

/*
 * First initial and surname initial, not the first two words.
 *
 * Taking the first two gave "P A Nandasena" the monogram "PA" — two given
 * initials and nothing of the name anyone would recognise. First-and-last is
 * identical for every two-word name in the roster and correct for the ones
 * that carry a middle initial.
 */
const initials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * A statement that arrives a word at a time from behind a mask.
 *
 * The device is a film title: each word sits in its own `overflow-hidden` box
 * and slides up into it, so the line assembles rather than fading in. At
 * display size that reads as something being *said*, which is the right
 * register for a vision and a mission — they are the only two sentences on
 * this page the company is actually committing to.
 *
 * Words, not lines. Splitting by rendered line means measuring the wrap, which
 * changes with viewport, font loading and the length of the sentence; splitting
 * on spaces is exact and needs no measurement. The stagger is small enough
 * (28ms) that a twenty-word sentence still lands in well under a second.
 *
 * The mask box carries `pb`/`-mb` of a fifth of an em. Without it the
 * `overflow-hidden` crops the descenders of g, p and y — the clipping that is
 * doing the reveal does not know the difference between a word that has not
 * arrived and the tail of one that has.
 */
function RevealWords({ text, className }: { text: string; className?: string }) {
  const still = useReducedMotion();

  /*
   * One observer on the paragraph, not thirty-six on the words.
   *
   * Each word used to carry its own `whileInView`. Measured after scrolling the
   * whole section past on a phone, three of them were still parked inside
   * their masks at an identical 34px offset — they had never animated, because
   * thirty-six separate IntersectionObservers on inline-block boxes is
   * thirty-six chances for one not to fire. Invisible words in a company's
   * mission statement is the worst version of that bug.
   *
   * Variants fix it structurally: the paragraph is the only thing being
   * observed, and it propagates `shown` to its children with a stagger. One
   * observer, and the children cannot be missed individually.
   *
   * Reduced motion changes the transition's duration and the stagger, never
   * the markup — two earlier attempts branched on the markup instead and both
   * broke. A plain <p> was a hydration mismatch, and `initial={false}` left
   * the server's inline `translateY(108%)` in place, so reduced-motion readers
   * got two empty statements.
   */
  return (
    <motion.p
      className={className}
      aria-label={text}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        shown: { transition: { staggerChildren: still ? 0 : 0.028 } },
      }}
    >
      {text.split(" ").map((word, i) => (
        <span
          key={`${word}-${i}`}
          aria-hidden
          /* `pb`/`-mb` of a fifth of an em: without it the `overflow-hidden`
             doing the reveal also crops the descenders of g, p and y. */
          className="inline-block overflow-hidden pb-[0.2em] -mb-[0.2em] align-bottom"
        >
          <motion.span
            className="inline-block"
            variants={{ hidden: { y: "108%" }, shown: { y: 0 } }}
            transition={{ duration: still ? 0 : 0.62, ease: [0.16, 1, 0.3, 1] }}
          >
            {word}
            {" "}
          </motion.span>
        </span>
      ))}
    </motion.p>
  );
}

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
                {/* Flat orange, not gradient-clipped — the gradient-text
                    treatment is reserved for the hero and the closing CTA;
                    used on every number on the site it stops meaning
                    anything. */}
                <p className="font-heading text-[1.935rem] font-extrabold leading-none tracking-[-0.04em] text-orange">
                  <CountUp value={s.value} />
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
      <section className="relative bg-canvas-alt py-10 lg:py-12">
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
      {/*
        Two statements, staged rather than boxed.

        This was a pair of bordered panels side by side, which is the shape the
        rest of the page already uses for cards and made the company's two
        commitments look like two more tiles. They are the only sentences on
        this page eArrow is actually promising anything in, so they are set at
        display scale, stacked so neither is the junior of the other, and given
        a word-by-word reveal — the section performs the statements instead of
        displaying them.

        Scaled back from a first pass that set the statements at 2.9rem over a
        1,129px band: at that size a twenty-word sentence filled most of a
        laptop screen on its own and the section stopped being a section. The
        reveal is the thing carrying the drama; the type only has to be large
        enough to read as a statement rather than as body copy.

        The giant ghosted word behind each is the section's one piece of pure
        scale. It is `select-none` and `aria-hidden`: it repeats the kicker
        beside it, so to a screen reader it is noise, and to a cursor it is a
        200px word that should never be draggable.
      */}
      <section
        className="on-black grain dot-matrix relative overflow-hidden py-10 lg:py-16"
        style={{ background: "#080808" }}
      >
        <StackedRects className="pointer-events-none absolute -left-20 bottom-0 h-auto w-[420px] opacity-[0.04]" />

        {/* The light the statements stand in — it drifts, so the band is never
            a flat black rectangle behind two blocks of type. */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute right-[-10%] top-[-25%] h-[120%] w-[60%] rounded-full blur-[150px]"
          animate={{ x: [0, -70, 0], y: [0, 50, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background:
              "radial-gradient(circle, rgba(var(--orange-ch), 0.26), rgba(var(--amber-ch), 0.08) 48%, transparent 72%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <SectionLabel index="03" className="!text-amber">
              Vision & mission
            </SectionLabel>
            <p className="max-w-sm text-sm leading-relaxed text-white/45 lg:pb-1 lg:text-right">
              Where the company is going, and what it does every day to get
              there.
            </p>
          </div>

          <div className="mt-10 lg:mt-12">
            {[
              {
                k: "Our Vision",
                ghost: "VISION",
                v: "To become a trusted technology partner that enables organisations to operate smarter, faster, and more efficiently.",
              },
              {
                k: "Our Mission",
                ghost: "MISSION",
                v: "To create innovative, reliable, and user-centric technology solutions that solve real-world business challenges and deliver measurable value to our customers.",
              },
            ].map((item, i) => (
              /*
                No rules between the statements and no icon tile beside the
                kicker.

                Both were doing the job the type already does. The hairlines
                boxed two sentences that are separated perfectly well by the
                space around them, and the gradient tile put a small loud
                object next to a 10px label — the brightest thing in the band
                was the decoration rather than the words. What is left is the
                kicker, the numeral and the statement, which is all the section
                has ever actually been saying.

                The rules went with the borders, so the separation is now
                purely spatial: a wide gap between the two blocks, and enough
                of it that they cannot be misread as one run of type.
              */
              <div key={item.k} className="relative first:mb-16 lg:first:mb-24">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-4 right-0 select-none font-heading text-[3.4rem] font-extrabold leading-none tracking-[-0.06em] text-white/[0.04] sm:text-[5rem] lg:-top-6 lg:text-[6.5rem]"
                >
                  {item.ghost}
                </span>

                <div className="relative flex items-center gap-4">
                  {/* A short amber rule instead of the tile — it marks the
                      kicker without competing with it. */}
                  <span aria-hidden className="h-px w-8 shrink-0 bg-amber/70" />
                  <p className="font-mono text-[10px] font-medium uppercase tracking-[0.26em] text-amber">
                    {item.k}
                  </p>
                  <span className="ml-auto font-mono text-[10px] tracking-[0.24em] text-white/25">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <RevealWords
                  text={item.v}
                  className="relative mt-6 max-w-3xl font-heading text-[1.25rem] font-bold leading-[1.3] tracking-[-0.025em] text-white sm:text-[1.5rem] lg:text-[1.9rem]"
                />
              </div>
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
            <div className="flex items-end gap-8 lg:pb-1">
              <p className="max-w-sm text-sm leading-relaxed text-ink-muted lg:text-right">
                Meet the people turning ideas into technology, and technology
                into business impact.
              </p>
              {/* Counted from the roster, never typed, so it cannot drift as
                  people join. */}
              <div className="shrink-0 text-right">
                <p className="font-heading text-[2.15rem] font-extrabold leading-none tracking-[-0.04em] text-orange">
                  {LEADERSHIP.length}
                </p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft">
                  People
                </p>
              </div>
            </div>
          </div>

          {/*
            Two columns on a phone, not one.

            The roster is thirteen people now rather than six. At one card per
            row a 4:5 plate plus its type runs the section past 6,000px on a
            390px screen — a scroll nobody finishes. Two-up halves it and the
            plates are still large enough to read a face in.
          */}
          <div className="ensemble mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:mt-14 lg:grid-cols-3">
            {LEADERSHIP.map((person, i) => (
              <motion.article
                key={person.name}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ ...SPRING_SOFT, delay: (i % 3) * 0.07 }}
                /*
                  The middle column rides low.

                  Thirteen plates on a strict three-column baseline read as a
                  staff directory — every card starting at the same y is what
                  makes a grid feel administrative. Dropping the centre column
                  by a plate's shoulder breaks the horizon without breaking the
                  grid, so the eye travels through the set instead of scanning
                  rows. It is a plain responsive class rather than an
                  `nth-child` variant because arbitrary variants have compiled
                  to nothing in this project before, silently.
                */
                className={`group ${i % 3 === 1 ? "lg:mt-14" : ""}`}
              >
                {/*
                  Portrait plate, 4:5, carrying the whole card.

                  Name, role and remit used to sit under the plate, where roles
                  run one or two lines and remits one to three — so six cards
                  finished at six different heights and the grid's bottom edge
                  was ragged. On the plate, every card ends exactly where the
                  4:5 ratio says it does.
                */}
                <div
                  className="relative aspect-[4/5] overflow-hidden rounded-panel bg-surface-sunken shadow-[0_28px_70px_-30px_rgba(var(--orange-ch),0.55)]"
                >
                  {/* `duotone` wraps whichever of the two fills the plate, so
                      the monogram is desaturated alongside the photographs and
                      stops being the loudest tile in the section. */}
                  {/*
                    The orange gradient lives on THIS span, not on the plate
                    behind it. On the plate it sat outside the filter, so the
                    monogram card stayed fully saturated while the five
                    photographs went duotone — the exact tile the treatment was
                    meant to calm down was the only one it did not touch.
                  */}
                  <span
                    aria-hidden
                    className="duotone absolute inset-0"
                    style={
                      person.photo
                        ? undefined
                        : {
                            background:
                              "linear-gradient(150deg, var(--color-ember), var(--color-orange) 55%, var(--color-amber))",
                          }
                    }
                  >
                    {person.photo ? (
                      <Image
                        src={withBasePath(person.photo)}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 30vw, 45vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    ) : (
                      <>
                        <span
                          className="absolute inset-0 opacity-[0.14]"
                          style={{
                            backgroundImage:
                              "linear-gradient(to right, rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.7) 1px, transparent 1px)",
                            backgroundSize: "34px 34px",
                          }}
                        />
                        <span
                          className="absolute inset-0"
                          style={{
                            background:
                              "radial-gradient(120% 90% at 30% 15%, transparent 40%, rgba(78,18,0,0.5) 100%)",
                          }}
                        />
                        <span className="absolute inset-x-0 top-0 h-px bg-white/45" />
                        <QMarkLight className="absolute -bottom-8 -right-6 h-auto w-36 opacity-[0.16]" />
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="font-heading text-[3.01rem] font-extrabold leading-none tracking-[-0.05em] text-white/95 transition-transform duration-700 ease-out group-hover:scale-105">
                            {initials(person.name)}
                          </span>
                        </span>
                      </>
                    )}
                  </span>

                  {/*
                    The scrim, strengthened and given a taller ramp.

                    At its previous 0.55 foot it was carrying a 9px index and
                    nothing else. It now has to hold a name, a role and a remit
                    over five photographs of very different exposure, so it runs
                    to 0.92 and starts higher up the plate. Measured against the
                    lightest of the five, not assumed.
                  */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.72) 26%, rgba(8,8,8,0.28) 52%, transparent 78%)",
                    }}
                  />

                  {/* The index as a numeral rather than a 9px label — at this
                      size it reads as a plate number on a contact sheet, which
                      is the register the whole grid is going for. */}
                  <span className="absolute right-3 top-2 font-heading text-[1.1rem] font-extrabold leading-none tracking-[-0.04em] text-white/35 transition-colors duration-500 group-hover:text-white/80 sm:right-5 sm:top-4 sm:text-[1.5rem]">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/*
                    Type steps down at the two-up breakpoint.

                    The plate carries its text, and that only works while the
                    text fits inside it. At two cards across a 390px screen the
                    card is ~170px wide, where a name wraps to two lines, a role
                    like "Director — Strategic Business & Corporate Affairs" to
                    three, and the remit to four more — so the block outgrew the
                    4:5 plate, climbed out of its scrim and sat across the
                    subject's face. Smaller type, tighter padding, and the remit
                    held back until there is room for it.
                  */}
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-6">
                    <h3 className="font-heading text-[12.5px] font-bold leading-tight tracking-[-0.02em] text-white sm:text-base">
                      {person.name}
                    </h3>
                    <p className="mt-1 text-[10.5px] font-medium leading-snug text-amber sm:text-sm">
                      {person.role}
                    </p>

                    {/*
                      The remit opens on hover at `lg`, where there is a pointer
                      to open it with. Between `sm` and `lg` it is simply always
                      there — a touch device would otherwise never reach it.
                      Below `sm` it is dropped: at two cards across a phone
                      there is no room for a fourth block of text on the plate,
                      and a remit that overflows onto the subject's face is
                      worse than one a reader has to open the page to see.
                    */}
                    <p className="mt-2 hidden text-[13px] leading-relaxed text-white/70 sm:block lg:mt-0 lg:max-h-0 lg:overflow-hidden lg:opacity-0 lg:transition-all lg:duration-500 lg:ease-out lg:group-hover:mt-2 lg:group-hover:max-h-24 lg:group-hover:opacity-100">
                      {person.remit}
                    </p>
                  </div>
                </div>
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
