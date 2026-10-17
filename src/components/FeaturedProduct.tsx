"use client";

import { motion } from "framer-motion";
import { QMark } from "./ArrowMark";
import { SectionLabel, SectionHeading, PrimaryCta } from "./ui";
import HrDashboard from "./HrDashboard";

/*
 * Brief §06 — Arrow HR & Payroll, with the dashboard figures it specifies
 * (2,840 employees / 98.7% payroll / 94.2% attendance) and an orange gradient
 * on the active UI elements inside the mockup.
 *
 * The dashboard is the real Arrow HR "Main Dashboard" screen, rebuilt in code
 * (see HrDashboard.tsx) so its numbers, charts and tabs can move.
 */

export default function FeaturedProduct() {
  return (
    <section className="relative bg-canvas py-10 lg:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <SectionLabel index="03">Featured Product</SectionLabel>
        <SectionHeading>
          Software that works the way your business works
        </SectionHeading>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-16 overflow-hidden rounded-panel border border-border bg-canvas-alt"
        >
          <QMark className="pointer-events-none absolute -right-20 -top-24 h-auto w-[440px] opacity-[0.045]" />

          <div className="relative grid grid-cols-1 gap-12 p-8 sm:p-12 lg:grid-cols-[0.62fr_1.38fr] lg:items-center lg:gap-12 lg:p-12">
            {/* ── Copy ── */}
            <div>
              <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em]">
                <span className="font-bold text-ink">Arrow HR &amp; Payroll</span>
                <span className="rounded-full border border-orange/30 bg-orange/[0.08] px-3 py-1 text-orange">
                  Product Solution
                </span>
              </div>

              <h3 className="mt-6 font-heading text-[1.613rem] font-extrabold leading-[1.1] tracking-[-0.035em] text-ink sm:text-[1.935rem]">
                Simplify workforce management
              </h3>
              <p className="mt-5 max-w-md text-base leading-[1.75] text-ink-muted">
                Manage employees, payroll, attendance and reporting from one
                platform.
              </p>

              <PrimaryCta href="/contact" className="mt-10">
                Discover Product
              </PrimaryCta>
            </div>

            {/* ── The product itself: the real Arrow HR dashboard, rebuilt live ── */}
            <HrDashboard />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
