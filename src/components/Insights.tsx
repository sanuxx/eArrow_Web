"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, QMarkLight, StackedRects } from "./ArrowMark";
import { SectionLabel, SectionHeading } from "./ui";
import { SPRING_SOFT } from "./motion-kit";

/*
 * Brief §10 — "Instead of making News & Events feel like a traditional
 * corporate website", three editorial cards.
 *
 * No artwork was supplied, so each card's image slot is an orange-gradient
 * panel built from the identity's shapes. Drop real imagery in later by
 * replacing the `<Cover />` block.
 */

const ARTICLES = [
  {
    category: "Client Success",
    date: "Jul 2026",
    read: "6 min",
    title: "How a leading hospitality institute modernised student billing",
  },
  {
    category: "Product Updates",
    date: "Jun 2026",
    read: "4 min",
    title: "Arrow HR & Payroll adds self-service performance reviews",
  },
  {
    category: "Company News",
    date: "May 2026",
    read: "3 min",
    title: "eArrow marks two decades of business technology delivery",
  },
];

function Cover({ index }: { index: number }) {
  return (
    <div
      className="relative aspect-[16/10] overflow-hidden"
      style={{
        background:
          index % 2 === 0
            ? "linear-gradient(135deg, var(--color-orange), var(--color-amber))"
            : "linear-gradient(135deg, var(--color-amber), var(--color-orange))",
      }}
    >
      {/* fine grid, so the gradient reads as a designed surface */}
      <span
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/15 to-transparent" />

      {index === 1 ? (
        <StackedRects className="absolute left-[12%] top-[14%] h-[70%] w-[70%] text-white opacity-80 transition-transform duration-700 group-hover:scale-105" />
      ) : (
        <QMarkLight className="absolute -bottom-8 -right-6 h-auto w-[78%] opacity-30 transition-transform duration-700 group-hover:scale-105" />
      )}
    </div>
  );
}

export default function Insights() {
  return (
    <section id="insights" className="relative bg-canvas py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <SectionLabel index="07">Insights</SectionLabel>
        <SectionHeading>Ideas shaping tomorrow&rsquo;s business.</SectionHeading>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {ARTICLES.map((a, i) => (
            <motion.a
              href="#"
              key={a.title}
              initial={{ opacity: 0, y: 32, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ y: -10, scale: 1.015 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ ...SPRING_SOFT, delay: i * 0.1 }}
              className="surface-card group block overflow-hidden rounded-panel transition-[box-shadow,border-color] duration-500 hover:border-orange/30 hover:shadow-[var(--shadow-lift)]"
            >
              <Cover index={i} />

              <div className="p-7">
                <div className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.16em]">
                  <span className="text-orange">{a.category}</span>
                  <span className="text-ink-soft">·</span>
                  <span className="text-ink-soft">{a.date}</span>
                  <span className="ml-auto text-ink-soft">{a.read}</span>
                </div>
                <h3 className="mt-4 font-heading text-[1.0625rem] font-bold leading-snug tracking-[-0.015em] text-ink">
                  {a.title}
                </h3>
                <span className="mt-6 inline-flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-orange">
                  Read More
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
