"use client";

import { motion } from "framer-motion";
import { PageHero, PageCta } from "@/components/page-kit";
import { SectionLabel } from "@/components/ui";
import { ArrowUpRight, QMarkLight } from "@/components/ArrowMark";
import { SPRING_SOFT } from "@/components/motion-kit";

/*
 * Technology & Innovation — the brief's eight pillars, drawn as the stack they
 * actually are.
 *
 * The sheet lists AI, Cloud, Automation, Analytics, APIs, Cybersecurity, Mobile
 * and Scalability as a flat set, and the page rendered them as eight equal
 * tiles. But they are not peers, and showing them as peers is the reason the
 * page said nothing: mobile is what a user touches, cloud is what it stands on,
 * and no competent architecture treats those as the same kind of thing.
 *
 * So this is a layer diagram. Four tiers stacked foundation-upward, each
 * carrying the pillars that belong to it — and Cybersecurity pulled out as a
 * rail spanning every tier, because that is where security actually lives. A
 * visitor who reads architecture for a living will recognise the claim; one who
 * does not still gets a picture instead of a word list.
 *
 * The blueprint treatment — dark ground, drafting grid, mono annotations, tier
 * codes in the gutter — is deliberately unlike the other pages: the bento on
 * Solutions, the showcase rows on Products, the hover-wipe tiles on Industries.
 * This one should read as a schematic.
 */

type Layer = {
  code: string;
  tier: string;
  pillars: string[];
  note: string;
};

/* Ordered top-down as drawn: what the user touches first, the foundation last. */
const LAYERS: Layer[] = [
  {
    code: "L04",
    tier: "Experience",
    pillars: ["Mobile Technology"],
    note: "Self-service, approvals and dashboards that work wherever your people actually are, not just at a desk.",
  },
  {
    code: "L03",
    tier: "Intelligence",
    pillars: ["AI", "Automation", "Analytics"],
    note: "Assistants, intelligent workflows and live reporting, built on a single source of operational truth rather than five exports.",
  },
  {
    code: "L02",
    tier: "Integration",
    pillars: ["APIs & Integrations"],
    note: "Open interfaces so our platforms connect to the systems you already run, instead of asking you to replace them.",
  },
  {
    code: "L01",
    tier: "Platform",
    pillars: ["Cloud", "Scalability"],
    note: "Managed cloud that scales with demand, on architecture that holds its shape from one site to an enterprise estate.",
  },
];

const SECURITY = {
  name: "Cybersecurity",
  note: "Controlled access, auditable trails, backup and disaster recovery, applied at every tier rather than bolted onto one.",
};

export default function TechnologyContent() {
  return (
    <>
      <PageHero
        index="05"
        eyebrow="Technology & Innovation"
        title="Built for today. Ready for what's next."
        lead="The engineering foundations under every eArrow platform, chosen so the systems you adopt now still fit how you'll work in five years."
      />

      {/* ── The stack ──────────────────────────────────────────────────── */}
      <section
        className="on-black grain tech-grid relative overflow-hidden py-10 lg:py-16"
        style={{ background: "#080808" }}
      >
        <QMarkLight className="pointer-events-none absolute -right-24 -top-16 h-auto w-[460px] opacity-[0.03]" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <div>
              <SectionLabel index="06" className="!text-amber">
                The stack
              </SectionLabel>
              <h2 className="mt-5 max-w-xl font-heading text-[1.72rem] font-bold leading-[1.08] tracking-[-0.035em] text-white sm:text-[2.064rem] lg:text-[2.365rem]">
                Four tiers, one architecture.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-white/50 lg:pb-2 lg:text-right">
              Read it from the bottom up. Each tier depends on the one beneath
              it — and security runs through all four.
            </p>
          </div>

          {/*
            The diagram. Tiers in the first column, the security rail in the
            second spanning the full height — on desktop. Below `lg` the rail
            cannot span anything, so it becomes a banner underneath, which is
            the same claim in the only form a narrow column allows.
          */}
          <div className="mt-12 grid grid-cols-1 gap-4 lg:mt-14 lg:grid-cols-[1fr_5.5rem] lg:items-stretch">
            <div className="flex flex-col gap-3">
              {LAYERS.map((layer, i) => (
                <motion.div
                  key={layer.code}
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ ...SPRING_SOFT, delay: i * 0.08 }}
                  className="group relative overflow-hidden rounded-card border border-white/10 bg-white/[0.02] transition-colors duration-500 hover:border-orange/40"
                >
                  {/* the tier lights along its leading edge on hover */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-0 w-[3px] origin-top scale-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100"
                    style={{
                      background:
                        "linear-gradient(to bottom, var(--color-orange), var(--color-amber))",
                    }}
                  />
                  {/* a low wash so the hovered tier reads as selected without
                      flooding the diagram with colour */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background:
                        "linear-gradient(100deg, rgba(var(--orange-ch), 0.16), transparent 62%)",
                    }}
                  />

                  <div className="relative grid grid-cols-1 items-center gap-x-8 gap-y-5 px-6 py-7 sm:px-8 lg:grid-cols-[5rem_16rem_1fr]">
                    {/* gutter annotation */}
                    <div className="flex items-center gap-3 lg:block">
                      <span className="font-mono text-[10px] tracking-[0.24em] text-white/30 transition-colors duration-300 group-hover:text-amber">
                        {layer.code}
                      </span>
                      <span
                        aria-hidden
                        className="hidden h-px w-8 bg-white/15 transition-colors duration-300 group-hover:bg-amber/50 lg:mt-3 lg:block"
                      />
                    </div>

                    {/* tier + its pillars */}
                    <div>
                      <p className="font-heading text-[1.075rem] font-bold tracking-[-0.02em] text-white sm:text-[1.182rem]">
                        {layer.tier}
                      </p>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {layer.pillars.map((p) => (
                          <li
                            key={p}
                            className="rounded-full border border-white/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-amber transition-colors duration-500 group-hover:border-amber/50 group-hover:text-white"
                          >
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <p className="max-w-xl text-sm leading-relaxed text-white/50 transition-colors duration-500 group-hover:text-white/80">
                      {layer.note}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ── The security rail, spanning every tier ──────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ ...SPRING_SOFT, delay: 0.3 }}
              className="group relative overflow-hidden rounded-card border border-amber/25"
              style={{
                background:
                  "linear-gradient(160deg, rgba(var(--orange-ch), 0.16), rgba(var(--amber-ch), 0.06))",
              }}
            >
              {/* Desktop: the label runs the height of the rail, which is the
                  point — it is the one concern that crosses every tier. */}
              <div className="hidden h-full flex-col items-center justify-center gap-5 py-8 lg:flex">
                <ShieldMark className="h-7 w-7 shrink-0 text-amber" />
                <span
                  className="font-mono text-[11px] uppercase tracking-[0.32em] text-white"
                  style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                >
                  {SECURITY.name}
                </span>
                <span aria-hidden className="h-10 w-px bg-amber/40" />
              </div>

              {/* Mobile: the same claim as a banner. */}
              <div className="flex items-start gap-4 px-6 py-6 lg:hidden">
                <ShieldMark className="mt-0.5 h-7 w-7 shrink-0 text-amber" />
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-white">
                    {SECURITY.name}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">
                    {SECURITY.note}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* The rail's copy, which has nowhere to live inside a 5.5rem column. */}
          <p className="mt-6 hidden max-w-2xl text-sm leading-relaxed text-white/45 lg:block">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber">
              Cybersecurity —{" "}
            </span>
            {SECURITY.note}
          </p>

          <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
            Want the architecture for your estate?{" "}
            <a
              href="/contact"
              className="group ml-1 inline-flex items-center gap-1.5 font-medium text-amber"
            >
              Talk to our architects
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </p>
        </div>
      </section>

      <PageCta
        title="Bring the next decade forward."
        body="Talk to our architects about where AI, automation and cloud actually fit your operation, and where they don't yet."
        primary={{ label: "Request a Consultation", href: "/contact" }}
        secondary={{ label: "Explore Solutions", href: "/solutions" }}
      />
    </>
  );
}

/** A shield, in the same stroke language as the rest of the site's marks. */
function ShieldMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M50 16 20 28v22c0 20 13 30 30 36 17-6 30-16 30-36V28z" />
      <path d="M38 50l9 9 17-18" />
    </svg>
  );
}
