"use client";

import { motion } from "framer-motion";
import { QMark } from "./ArrowMark";
import { SectionLabel, SectionHeading, PrimaryCta } from "./ui";

/*
 * Brief §06 — Arrow HR & Payroll, with the dashboard figures it specifies
 * (2,840 employees / 98.7% payroll / 94.2% attendance) and an orange gradient
 * on the active UI elements inside the mockup.
 *
 * The mockup is built as a real application shell — sidebar, breadcrumb, tab
 * bar, metric tiles, a chart — because three progress bars read as a diagram,
 * whereas an application shell reads as a product that exists.
 */

const METRICS = [
  { label: "Employees", value: "2,840", delta: "+124", up: true },
  { label: "Payroll", value: "98.7%", delta: "+2.1", up: true },
  { label: "Attendance", value: "94.2%", delta: "-0.4", up: false },
];

const NAV = ["Overview", "People", "Payroll", "Time", "Reports"];
const CHART = [42, 58, 49, 71, 63, 82, 75, 91, 86, 97];

export default function FeaturedProduct() {
  return (
    <section className="relative bg-canvas py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <SectionLabel index="03">Featured Product</SectionLabel>
        <SectionHeading>
          Software that works the way your business works.
        </SectionHeading>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-16 overflow-hidden rounded-panel border border-border bg-canvas-alt"
        >
          <QMark className="pointer-events-none absolute -right-20 -top-24 h-auto w-[440px] opacity-[0.045]" />

          <div className="relative grid grid-cols-1 gap-12 p-8 sm:p-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16 lg:p-16">
            {/* ── Copy ── */}
            <div>
              <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em]">
                <span className="font-bold text-ink">Arrow HR &amp; Payroll</span>
                <span className="rounded-full border border-orange/30 bg-orange/[0.08] px-3 py-1 text-orange">
                  Product Solution
                </span>
              </div>

              <h3 className="mt-6 font-heading text-3xl font-extrabold leading-[1.1] tracking-[-0.035em] text-ink sm:text-4xl">
                Simplify workforce management.
              </h3>
              <p className="mt-5 max-w-md text-[1.0625rem] leading-[1.75] text-ink-muted">
                Manage employees, payroll, attendance and reporting from one
                platform.
              </p>

              <PrimaryCta href="#contact" className="mt-10">
                Discover Product
              </PrimaryCta>
            </div>

            {/* ── Application mockup ── */}
            <div className="relative">
              <div className="surface-card overflow-hidden rounded-card !shadow-[var(--shadow-lift)]">
                {/* title bar */}
                <div className="flex items-center gap-3 border-b border-border bg-surface-sunken px-4 py-3">
                  <span className="flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-orange" />
                    <span className="h-2 w-2 rounded-full bg-amber/70" />
                    <span className="h-2 w-2 rounded-full bg-border-strong" />
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.16em] text-ink-soft">
                    arrow-hr / dashboard
                  </span>
                  <span className="ml-auto flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-soft">
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-orange"
                      style={{ animation: "pulse-dot 2.4s ease-in-out infinite" }}
                    />
                    Live
                  </span>
                </div>

                <div className="flex">
                  {/* sidebar */}
                  <div className="hidden w-[124px] shrink-0 border-r border-border bg-surface-sunken py-4 sm:block">
                    {NAV.map((n, i) => (
                      <div
                        key={n}
                        className={`relative mx-2 mb-1 rounded-lg px-3 py-2 text-[11px] font-medium transition-colors ${
                          i === 0
                            ? "bg-gradient-to-r from-orange to-amber text-white"
                            : "text-ink-soft"
                        }`}
                      >
                        {n}
                      </div>
                    ))}
                  </div>

                  {/* main pane */}
                  <div className="min-w-0 flex-1 p-5">
                    {/* metric tiles */}
                    <div className="grid grid-cols-3 gap-2.5">
                      {METRICS.map((m, i) => (
                        <motion.div
                          key={m.label}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-80px" }}
                          transition={{ duration: 0.5, delay: 0.25 + i * 0.1 }}
                          className="rounded-xl border border-border bg-canvas p-3"
                        >
                          <p className="truncate font-mono text-[8.5px] uppercase tracking-[0.14em] text-ink-soft">
                            {m.label}
                          </p>
                          <p className="tnum mt-1.5 font-heading text-base font-extrabold leading-none text-ink">
                            {m.value}
                          </p>
                          <p
                            className={`tnum mt-1.5 font-mono text-[9px] ${
                              m.up ? "text-orange" : "text-ink-soft"
                            }`}
                          >
                            {m.up ? "▲" : "▼"} {m.delta}
                          </p>
                        </motion.div>
                      ))}
                    </div>

                    {/* chart */}
                    <div className="mt-4 rounded-xl border border-border bg-canvas p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft">
                          Payroll cycles
                        </span>
                        <span className="font-mono text-[9px] tracking-[0.14em] text-ink-soft">
                          12M
                        </span>
                      </div>
                      {/* Baseline-anchored columns. Each bar is its own
                          full-height flex column with the fill pinned to the
                          bottom, so a mid-animation frame still reads as a
                          chart rather than as floating blocks. */}
                      <div className="mt-3 flex h-24 items-stretch gap-[3px]">
                        {CHART.map((h, i) => {
                          const last = i === CHART.length - 1;
                          return (
                            <div key={i} className="flex flex-1 flex-col justify-end">
                              <motion.span
                                initial={{ height: "0%" }}
                                whileInView={{ height: `${h}%` }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{
                                  duration: 0.7,
                                  delay: 0.35 + i * 0.05,
                                  ease: [0.16, 1, 0.3, 1],
                                }}
                                className={`w-full rounded-t-[3px] ${
                                  last
                                    ? "bg-gradient-to-t from-orange to-amber"
                                    : "bg-border-strong"
                                }`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* active action row — the brief's orange gradient on a live element */}
                    <div className="mt-4 flex items-center gap-3 rounded-xl bg-gradient-to-r from-orange to-amber px-4 py-3 text-white">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/20 font-mono text-[10px] font-bold">
                        ▶
                      </span>
                      <span className="truncate text-[13px] font-semibold">
                        Run payroll for March
                      </span>
                      <span className="ml-auto shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-white/85">
                        Ready
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
