"use client";

import { motion } from "framer-motion";
import { PageCta } from "@/components/page-kit";
import CustomerSuccessHero from "./CustomerSuccessHero";
import RewireScene from "./RewireScene";

/*
 * From the brief's "Customer Success" sheet.
 *
 * The sheet is explicit that measurable results are only to be shown "where you
 * have verified figures" — so this page deliberately ships no metrics. The one
 * case study is the worked example the sheet itself gives, told as a before and
 * after rather than with invented percentages. Real numbers belong here once
 * the client supplies verified ones.
 *
 * ── The shape of the page ──
 * Dark masthead, light middle, dark case study. The alternation is the point:
 * three dark bands in a row is a mood rather than a sequence, and the bright
 * middle is what makes the case study land as the thing it was building to.
 *
 * The masthead is `tone="dark"`, which is the first one on the site — see the
 * note in page-kit's `PageHero` about how it tells the fixed header to turn its
 * links white while it is on screen.
 */

/* The four questions every story here answers. The question is set as the
   headline and the label demoted above it, because the questions are the
   interesting half — "Customer Challenge" is a filing category, "What problem
   did they have?" is the thing being asked. */
const STAGES = [
  {
    label: "Customer Challenge",
    question: "What problem did they have?",
    body: "The processes, systems and constraints exactly as they stood before we were involved.",
  },
  {
    label: "Our Solution",
    question: "What did eArrow implement?",
    body: "The platforms, modules and integrations put in place — and the reasoning for those over the alternatives.",
  },
  {
    label: "Transformation",
    question: "What changed?",
    body: "How the day-to-day work of the team is different now that the system is live and in their hands.",
  },
  {
    label: "Impact",
    question: "What did it measurably do?",
    body: "The outcome, reported against figures verified with the customer. Never estimated, never rounded up.",
  },
];

export default function CustomerSuccessContent() {
  return (
    <>
      <CustomerSuccessHero />

      {/* ── The four questions ─────────────────────────────────────────────
          Set on a rail: a hairline runs the width with a node above each
          column, so four separate cards read as one method with four beats.
          On the stacked column the rail turns vertical and does the same job
          down the left edge. */}
      <section className="relative overflow-hidden bg-canvas-alt py-14 lg:py-20">
        <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-orange">
            How we tell it
          </p>
          <h2 className="mt-5 max-w-2xl font-heading text-[1.8rem] font-extrabold leading-[1.06] tracking-[-0.038em] text-ink sm:text-[2.3rem] lg:text-[2.6rem]">
            Every story answers the same four questions.
          </h2>

          <div className="relative mt-14">
            {/* The rail. Horizontal above the columns on desktop, down the
                left edge when they stack — one element, two orientations,
                because it is decoration and can be redrawn by breakpoint. */}
            <span
              aria-hidden
              className="absolute left-0 top-0 h-full w-px bg-border lg:h-px lg:w-full"
            />

            <div className="grid grid-cols-1 gap-y-10 lg:grid-cols-4 lg:gap-x-10">
              {STAGES.map((stage, i) => (
                <motion.div
                  key={stage.label}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-70px" }}
                  transition={{
                    duration: 0.55,
                    ease: [0.16, 1, 0.3, 1],
                    delay: i * 0.09,
                  }}
                  className="relative pl-7 lg:pl-0 lg:pt-8"
                >
                  {/* The node where this beat meets the rail. */}
                  <span
                    aria-hidden
                    className="absolute left-0 top-1.5 h-2 w-2 -translate-x-1/2 rounded-full bg-orange lg:left-0 lg:top-0 lg:-translate-x-0 lg:-translate-y-1/2"
                  />

                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft">
                    {stage.label}
                  </p>
                  <h3 className="mt-3 font-heading text-[1.15rem] font-extrabold leading-[1.15] tracking-[-0.03em] text-ink lg:text-[1.28rem]">
                    {stage.question}
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">
                    {stage.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <RewireScene />

      <PageCta
        title="Your operation could be the next story."
        body="Tell us what's slowing you down today, and we'll show you what the after looks like."
        primary={{ label: "Request a Consultation", href: "/contact" }}
        secondary={{ label: "Explore Industries", href: "/industries" }}
      />
    </>
  );
}
