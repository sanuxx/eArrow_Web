"use client";

import { motion } from "framer-motion";
import { PageHero, PageSection, NumberedBlocks, PageCta } from "@/components/page-kit";
import { StackedRects } from "@/components/ArrowMark";
import { SPRING_SOFT } from "@/components/motion-kit";

/*
 * From the brief's "Careers" sheet: "Show that eArrow is a place where talented
 * people want to work" — Why eArrow, Culture, Benefits, Open positions,
 * Employee stories, Graduate opportunities.
 *
 * Open positions and employee stories are left as honest placeholders: neither
 * can be written without the client's actual vacancies and consent from named
 * employees. The values echo the About page rather than inventing a second,
 * competing culture statement.
 */

const WHY = [
  {
    title: "Why eArrow",
    body: "You work on platforms real organisations depend on daily: payroll that has to be right, records that have to be complete. That's what makes the engineering interesting.",
  },
  {
    title: "Culture",
    body: "Small teams with real ownership. We challenge the ordinary, put customers first, and take responsibility for what we ship.",
  },
  {
    title: "Benefits",
    body: "Competitive compensation, flexibility, and genuine investment in certification and skills development.",
  },
  {
    title: "Graduate Opportunities",
    body: "Structured entry paths for engineers, analysts and implementation consultants starting their careers.",
  },
];

const VALUES = ["Innovate", "Care", "Own", "Excel", "Trust", "Grow"];

export default function CareersContent() {
  return (
    <>
      <PageHero
        index="08"
        eyebrow="Careers"
        title="Build technology organisations actually run on"
        lead="We're looking for people who want their work in production, in front of real users, solving problems that genuinely cost businesses time and money."
      />

      <PageSection
        tone="sunken"
        index="09"
        label="Working here"
        title="What you can expect"
      >
        <NumberedBlocks items={WHY} />
      </PageSection>

      <PageSection tone="black" index="10" label="What drives us">
        <StackedRects className="pointer-events-none absolute -left-20 bottom-0 h-auto w-[420px] opacity-[0.04]" />

        <div className="mt-12 flex flex-wrap gap-3">
          {VALUES.map((value, i) => (
            <motion.span
              key={value}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ ...SPRING_SOFT, delay: i * 0.05 }}
              className="rounded-full border border-white/15 px-6 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-amber"
            >
              {value}
            </motion.span>
          ))}
        </div>
      </PageSection>

      <PageSection index="11" label="Open positions" title="Roles we're hiring for">
        {/* No vacancies are invented — the sheet asks for a positions list, and
            the honest version of that until the client supplies one is an open
            application route. */}
        <div className="mt-12 rounded-card border border-dashed border-border-strong bg-surface px-8 py-12 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-orange">
            Positions updating
          </p>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-ink-muted">
            Current vacancies are being published. If you think you belong here,
            send us your CV and tell us what you&rsquo;d want to work on — we
            read every one, and we hire ahead of postings when someone is right.
          </p>
          <a
            href="mailto:careers@earrow.lk"
            className="mt-8 inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-orange to-amber px-7 py-4 text-sm font-semibold text-white shadow-[var(--shadow-ember)] transition-transform duration-300 hover:scale-[1.04]"
          >
            Send an open application
          </a>
        </div>
      </PageSection>

      <PageCta
        title="Talented people build better systems"
        body="Tell us what you're good at and where you want to take it next."
        primary={{ label: "Get in touch", href: "/contact" }}
        secondary={{ label: "About eArrow", href: "/about" }}
      />
    </>
  );
}
