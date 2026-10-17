"use client";

import { motion } from "framer-motion";
import { PageHero, PageSection, PageCta } from "@/components/page-kit";
import { ArrowUpRight } from "@/components/ArrowMark";
import { SPRING_SOFT } from "@/components/motion-kit";

/*
 * The seven categories the brief's "Insights" sheet lists.
 *
 * No articles are invented here. The page ships as the category index and an
 * honest empty state — the sheet frames Insights as an ongoing publishing
 * effort ("excellent for SEO and LinkedIn marketing"), so the structure is what
 * is buildable now; the posts arrive as the client writes them.
 */

const CATEGORIES = [
  { name: "HR Technology", line: "Workforce systems, payroll and the operating model around them." },
  { name: "AI", line: "Where intelligent automation earns its place, and the honest cases where it hasn't yet." },
  { name: "Digital Transformation", line: "Replacing fragmented manual process with connected systems." },
  { name: "Payroll", line: "Compliance, accuracy and the cost of getting it wrong." },
  { name: "Education Technology", line: "Admissions, academics and administration at institutional scale." },
  { name: "Industry Insights", line: "What's shifting across the sectors we build for." },
  { name: "Company News", line: "Announcements, milestones and what the team is shipping." },
];

export default function InsightsContent() {
  return (
    <>
      <PageHero
        index="07"
        eyebrow="Insights"
        title="Perspectives from the people building the systems"
        lead="Practical writing on technology, operations and transformation, written by the team doing the implementations."
      />

      <PageSection
        tone="sunken"
        index="08"
        label="Categories"
        title="What we write about"
      >
        <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category, i) => (
            <motion.a
              key={category.name}
              href="/contact"
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ ...SPRING_SOFT, delay: (i % 3) * 0.06 }}
              className="surface-card edge-sweep group relative flex flex-col overflow-hidden rounded-card px-7 py-5 transition-colors duration-400 hover:border-orange/30"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="font-mono text-[11px] tracking-[0.22em] text-ink-soft">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <ArrowUpRight className="h-4 w-4 text-ink-soft transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-orange" />
              </div>

              <h3 className="mt-6 font-heading text-base font-bold tracking-[-0.02em] text-ink">
                {category.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {category.line}
              </p>
            </motion.a>
          ))}
        </div>

        {/* An honest empty state rather than fabricated article cards. */}
        <div className="mt-8 rounded-card border border-dashed border-border-strong bg-surface px-8 py-6 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-orange">
            Publishing soon
          </p>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-ink-muted">
            The first articles are being written now. Tell us which of the
            categories above matters most to you and we&rsquo;ll send them to
            you as they go live.
          </p>
        </div>
      </PageSection>

      <PageCta
        title="Get the thinking before everyone else"
        body="We publish what we learn from real implementations. No newsletter filler."
        primary={{ label: "Talk to an Expert", href: "/contact" }}
      />
    </>
  );
}
