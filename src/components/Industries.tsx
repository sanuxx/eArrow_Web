"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, QMarkLight } from "./ArrowMark";
import { SectionLabel } from "./ui";
import { SPRING_SOFT } from "./motion-kit";

/*
 * Brief §07 — the one black section on the page. Pinning it to #080808 in both
 * site themes is deliberate: it's what makes the orange read as premium
 * instead of decorative. A dot matrix gives the black field depth without
 * lifting its value.
 */

const INDUSTRIES = [
  "Manufacturing",
  "Healthcare",
  "Education",
  "Finance",
  "Retail",
  "Logistics",
  "Enterprise",
  "Government",
];

export default function Industries() {
  return (
    <section
      id="industries"
      className="on-black grain dot-matrix relative overflow-hidden py-24 lg:py-32"
      style={{ background: "#080808" }}
    >
      <QMarkLight className="pointer-events-none absolute -left-28 bottom-0 h-auto w-[600px] opacity-[0.035]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <SectionLabel index="04" className="!text-amber">
          Industries
        </SectionLabel>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-2xl font-heading text-[2.1rem] font-bold leading-[1.08] tracking-[-0.035em] text-white sm:text-[2.75rem] lg:text-5xl"
        >
          Built for the way your industry works.
        </motion.h2>

        <div className="mt-16 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {INDUSTRIES.map((name, i) => (
            <motion.a
              key={name}
              href="#contact"
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                ...SPRING_SOFT,
                delay: (i % 2) * 0.07 + Math.floor(i / 2) * 0.06,
              }}
              className="group relative flex items-center justify-between overflow-hidden rounded-card border border-white/10 px-7 py-8 transition-colors duration-500 hover:border-transparent sm:px-8"
            >
              {/* the orange panel that reveals on hover */}
              <span
                className="absolute inset-0 origin-left scale-x-0 transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                style={{ background: "linear-gradient(115deg, var(--color-orange), var(--color-amber))" }}
              />
              {/* lit top edge on the revealed panel */}
              <span className="absolute inset-x-0 top-0 h-px scale-x-0 bg-white/40 transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
              <QMarkLight className="pointer-events-none absolute -right-4 -top-8 h-auto w-40 opacity-0 transition-opacity duration-500 group-hover:opacity-25" />

              <span className="relative flex items-baseline gap-5">
                <span className="font-mono text-[10px] tracking-[0.2em] text-white/30 transition-colors duration-300 group-hover:text-white/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-heading text-xl font-bold tracking-[-0.02em] text-white sm:text-[1.375rem]">
                  {name}
                </span>
              </span>

              <ArrowUpRight className="relative h-5 w-5 shrink-0 text-white/30 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
            </motion.a>
          ))}
        </div>

        <p className="mt-14 font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
          Discover how we help businesses grow{" "}
          <a
            href="#contact"
            className="group ml-1 inline-flex items-center gap-1.5 font-medium text-amber"
          >
            across every sector
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </p>
      </div>
    </section>
  );
}
