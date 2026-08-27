"use client";

import { motion } from "framer-motion";
import { PageHero, PageSection, PageCta } from "@/components/page-kit";
import { ArrowUpRight, QMarkLight } from "@/components/ArrowMark";
import { INDUSTRY_ICONS, type IndustryIconKey } from "@/components/industry-icons";
import { SPRING_SOFT } from "@/components/motion-kit";

/*
 * Content from the brief's "Industries" sheet.
 *
 * The sheet labels each industry with an emoji (🏢 🎓 🏥 …). Those are
 * shorthand for the brief, not artwork for the site: emoji render as different
 * pictures on every platform and drag their own palette through a page whose
 * colour budget is deliberate. Each is replaced by a drawn icon in the site's
 * own stroke language — see industry-icons.tsx.
 */

const INDUSTRIES: { icon: IndustryIconKey; name: string; line: string }[] = [
  {
    icon: "corporate",
    name: "Corporate",
    line: "Connected HR, finance and service operations across every function.",
  },
  {
    icon: "education",
    name: "Education",
    line: "Admissions, academics, attendance and fees on a single platform.",
  },
  {
    icon: "healthcare",
    name: "Healthcare",
    line: "Unified patient records and billing across every department.",
  },
  {
    icon: "financial",
    name: "Financial Services",
    line: "Auditable workflows, controlled access and dependable reporting.",
  },
  {
    icon: "manufacturing",
    name: "Manufacturing",
    line: "Live visibility into production, inventory and quality control.",
  },
  {
    icon: "retail",
    name: "Retail",
    line: "Commerce platforms, workforce scheduling and customer analytics.",
  },
  {
    icon: "government",
    name: "Government",
    line: "Secure, transparent systems built for public accountability.",
  },
  {
    icon: "enterprise",
    name: "Other Enterprises",
    line: "Tell us how you operate and we'll shape the stack around it.",
  },
];

export default function IndustriesContent() {
  return (
    <>
      <PageHero
        index="04"
        eyebrow="Industries"
        title="Solutions designed for your industry."
        lead="The same connected ecosystem, configured for the way each sector actually works."
      />

      {/* The brief pins Industries to the black band — it is what makes the
          orange read as premium rather than decorative. */}
      <PageSection tone="black" index="05" label="Industries we serve">
        <QMarkLight className="pointer-events-none absolute -left-28 bottom-0 h-auto w-[600px] opacity-[0.035]" />

        <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {INDUSTRIES.map((industry, i) => {
            const Icon = INDUSTRY_ICONS[industry.icon];
            return (
            <motion.a
              key={industry.name}
              href="/contact"
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                ...SPRING_SOFT,
                delay: (i % 2) * 0.07 + Math.floor(i / 2) * 0.06,
              }}
              className="group relative flex items-center justify-between gap-6 overflow-hidden rounded-card border border-white/10 px-7 py-8 transition-colors duration-500 hover:border-transparent sm:px-8"
            >
              <span
                className="absolute inset-0 origin-left scale-x-0 transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                style={{ background: "linear-gradient(115deg, var(--color-orange), var(--color-amber))" }}
              />
              <span className="absolute inset-x-0 top-0 h-px scale-x-0 bg-white/40 transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />

              <span className="relative flex items-start gap-5">
                {/* Drawn in currentColor, so it simply follows the tile from
                    amber at rest to white once the orange panel wipes in. */}
                <Icon className="mt-0.5 h-9 w-9 shrink-0 text-amber transition-colors duration-500 group-hover:text-white" />
                <span>
                  <span className="flex items-baseline gap-4">
                    <span className="font-mono text-[10px] tracking-[0.2em] text-white/30 transition-colors duration-300 group-hover:text-white/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-heading text-[1.075rem] font-bold tracking-[-0.02em] text-white sm:text-[1.182rem]">
                      {industry.name}
                    </span>
                  </span>
                  <span className="mt-2 block max-w-sm text-sm leading-relaxed text-white/50 transition-colors duration-400 group-hover:text-white/80">
                    {industry.line}
                  </span>
                </span>
              </span>

              <ArrowUpRight className="relative h-5 w-5 shrink-0 text-white/30 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
            </motion.a>
            );
          })}
        </div>
      </PageSection>

      <PageCta
        title="Discover how we help businesses grow."
        body="Every sector runs differently. Tell us about yours and we'll show you what changes first."
        primary={{ label: "Talk to an Expert", href: "/contact" }}
        secondary={{ label: "See Customer Stories", href: "/customer-success" }}
      />
    </>
  );
}
