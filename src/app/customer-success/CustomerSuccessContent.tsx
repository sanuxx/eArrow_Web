"use client";

import { motion } from "framer-motion";
import { PageHero, PageSection, NumberedBlocks, PageCta } from "@/components/page-kit";
import { ArrowGlyph, QMarkLight } from "@/components/ArrowMark";
import { SPRING_SOFT } from "@/components/motion-kit";

/*
 * From the brief's "Customer Success" sheet.
 *
 * The sheet is explicit that measurable results are only to be shown "where you
 * have verified figures" — so this page deliberately ships no metrics. The one
 * case study below is the worked example the sheet itself gives, told as a
 * before/after rather than with invented percentages. Real numbers belong here
 * once the client supplies verified ones.
 */

const STAGES = [
  {
    title: "Customer Challenge",
    body: "What problem did they have? The processes, systems and constraints as they stood before we were involved.",
  },
  {
    title: "Our Solution",
    body: "What did eArrow implement? The platforms, modules and integrations put in place, and why those.",
  },
  {
    title: "Transformation",
    body: "What changed? How the day-to-day work of the team is different now that the system is live.",
  },
  {
    title: "Impact",
    body: "The measurable outcome — reported against verified figures from the customer, never estimated.",
  },
];

const BEFORE = ["Multiple spreadsheets", "Manual approvals", "Delayed reporting"];
const AFTER = ["Integrated HRIS", "Automated workflows", "Real-time dashboards"];

export default function CustomerSuccessContent() {
  return (
    <>
      <PageHero
        index="06"
        eyebrow="Customer Success"
        title="Real operations, measurably changed."
        lead="How organisations moved from fragmented manual processes to connected digital operations — told through the work, not the adjectives."
      />

      <PageSection
        tone="sunken"
        index="07"
        label="How we tell it"
        title="Every story, the same four questions."
      >
        <NumberedBlocks items={STAGES} />
      </PageSection>

      <PageSection tone="black" index="08" label="Case Study">
        <QMarkLight className="pointer-events-none absolute -right-24 -top-10 h-auto w-[520px] opacity-[0.04]" />

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-3xl font-heading text-[1.806rem] font-bold leading-[1.08] tracking-[-0.035em] text-white sm:text-[2.365rem] lg:text-[2.58rem]"
        >
          From manual HR to digital workforce management.
        </motion.h2>

        {/* Before / after, joined by the brand arrow. The arrow turns to follow
            the flow on desktop and stays vertical in the stacked column. */}
        <div className="mt-14 flex flex-col items-stretch gap-6 lg:flex-row lg:items-center lg:gap-8">
          {[
            { key: "Before", items: BEFORE, dim: true },
            { key: "After", items: AFTER, dim: false },
          ].map((panel, p) => (
            <motion.div
              key={panel.key}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ ...SPRING_SOFT, delay: p * 0.14 }}
              className={`relative flex-1 overflow-hidden rounded-card border px-8 py-9 ${
                panel.dim
                  ? "border-white/10 bg-white/[0.02]"
                  : "border-transparent"
              }`}
              style={
                panel.dim
                  ? undefined
                  : { background: "linear-gradient(125deg, var(--color-orange), var(--color-amber))" }
              }
            >
              <p
                className={`font-mono text-[10px] font-medium uppercase tracking-[0.28em] ${
                  panel.dim ? "text-white/35" : "text-white/80"
                }`}
              >
                {panel.key}
              </p>

              <ul className="mt-6 space-y-4">
                {panel.items.map((item, i) => (
                  <li key={item} className="flex items-baseline gap-4">
                    <span
                      className={`font-mono text-[10px] tracking-[0.2em] ${
                        panel.dim ? "text-white/25" : "text-white/60"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`font-heading text-base font-bold tracking-[-0.02em] ${
                        panel.dim ? "text-white/55" : "text-white"
                      }`}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="pointer-events-none mt-6 flex justify-center lg:hidden">
          <ArrowGlyph className="h-5 w-5 rotate-90 text-amber" />
        </div>
      </PageSection>

      <PageCta
        title="Your operation could be the next story."
        body="Tell us what's slowing you down today, and we'll show you what the after looks like."
        primary={{ label: "Request a Consultation", href: "/contact" }}
        secondary={{ label: "Explore Industries", href: "/industries" }}
      />
    </>
  );
}
