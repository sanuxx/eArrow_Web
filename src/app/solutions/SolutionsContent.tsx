"use client";

import { motion } from "framer-motion";
import { PageHero, PageCta } from "@/components/page-kit";
import { ArrowUpRight } from "@/components/ArrowMark";
import JourneyScene from "./JourneyScene";
import RibbonDelta from "./RibbonDelta";
import { type Group } from "./capabilities";
import CapabilityStage from "./CapabilityStage";

/*
 * Content transcribed from the revamp brief's "Solutions" sheet.
 *
 * The nine capability groups are data only; CapabilityStage owns how they are
 * presented, and its own notes cover why that treatment won.
 */

const GROUPS: Group[] = [
  {
    name: "HR & Workforce",
    code: "D01",
    art: "workforce",
    lead: "One employee record from hiring through payroll, attendance and appraisals.",
    items: [
      "HRIS",
      "Payroll",
      "Attendance",
      "Leave Management",
      "Performance Management",
      "Employee Self-Service",
      "Recruitment",
      "HR Analytics",
    ],
  },
  {
    name: "Education",
    code: "D02",
    art: "education",
    lead: "Admissions through graduation on a single academic platform.",
    items: [
      "Student Management",
      "Admissions",
      "Academic Management",
      "Attendance",
      "Fees",
      "Examination",
      "Parent/Student Portal",
      "Analytics",
    ],
  },
  {
    name: "Business Management",
    code: "D03",
    art: "workflow",
    lead: "Workflows, documents and reporting joined into one operating layer.",
    items: [
      "Workflow Automation",
      "Document Management",
      "Business Applications",
      "Reporting & Analytics",
      "Process Automation",
    ],
  },
  {
    name: "CRM",
    code: "D04",
    art: "funnel",
    lead: "Every lead, opportunity and customer conversation in one pipeline.",
    items: [
      "Lead Management",
      "Sales Pipeline",
      "Customer Management",
      "Opportunity Management",
      "Sales Activities",
      "Customer Analytics",
      "Reports & Dashboards",
    ],
  },
  {
    name: "Ticketing & Service",
    code: "D05",
    art: "queue",
    lead: "Requests tracked to resolution, against an SLA you can prove.",
    items: [
      "Ticket Management",
      "Help Desk",
      "SLA Management",
      "Escalation Management",
      "Customer Portal",
      "Knowledge Base",
      "Service Analytics",
    ],
  },
  {
    name: "AI & Intelligent Automation",
    code: "D06",
    art: "intelligence",
    lead: "Assistants and predictive analytics that take the repetitive work away.",
    items: [
      "AI Assistants",
      "Intelligent Workflows",
      "Predictive Analytics",
      "Automated Reporting",
      "AI-enabled Employee Services",
    ],
  },
  {
    name: "Managed IT Services",
    code: "D07",
    art: "shells",
    lead: "Infrastructure, cloud and security run as a service, monitored around the clock.",
    items: [
      "IT Infrastructure Management",
      "Cloud Management",
      "Server Management",
      "Network Management",
      "Cybersecurity",
      "Backup & Disaster Recovery",
      "Help Desk / IT Support",
      "System Monitoring",
      "Microsoft 365 Management",
      "Managed Applications",
    ],
  },
  {
    name: "Digital & Web Solutions",
    code: "D08",
    art: "window",
    lead: "Websites, portals and commerce platforms built for growth.",
    items: [
      "Corporate Websites",
      "E-commerce Websites",
      "Web Applications",
      "UI/UX Design",
      "Website Maintenance",
      "Domain & Hosting",
      "CMS Development",
      "API & System Integration",
    ],
  },
  {
    name: "Digital Marketing & Growth",
    code: "D09",
    art: "growth",
    lead: "Demand generation measured to the lead, not to the impression.",
    items: [
      "Social Media Marketing",
      "Social Media Management",
      "Content Creation",
      "Digital Advertising",
      "SEO",
      "Search Engine Marketing",
      "Brand Development",
      "Campaign Management",
      "Lead Generation",
      "Analytics & Reporting",
    ],
  },
];

/*
 * Both figures come off the same array the capability explorer reads, so the
 * masthead cannot end up quoting a number the section below it contradicts.
 * They are the only hard facts this page has above the fold — nine words of
 * lead copy was all a viewport-tall hero offered before.
 */
const CAPABILITY_COUNT = GROUPS.reduce((n, g) => n + g.items.length, 0);
const DOMAIN_COUNT = GROUPS.length;

/*
 * Which capability domains sit behind each stage of the journey, given as
 * indices into GROUPS rather than as repeated strings.
 *
 * The journey band names these domains so a reader can place their own
 * situation against one of the three stages. Reading them out of GROUPS means
 * the two sections can never disagree about what a domain is called — renaming
 * one in the array above renames it in both places, and an index that does not
 * exist is a build error rather than a label nobody notices is stale.
 */
const JOURNEY_COVERS = [
  [0, 1, 2], // Run       — the systems of record
  [5, 4, 6], // Optimise  — automation, service, managed IT
  [7, 8, 3], // Grow      — web, demand generation, CRM
].map((row) => row.map((i) => GROUPS[i].name));

export default function SolutionsContent() {
  return (
    <>
      <PageHero
        index="02"
        eyebrow="Solutions"
        /*
          The headline is three beats and a progression, and set as one flat
          line it was three beats the layout ignored. Each word now takes its
          own line and its own size — `Run.` smallest, `Grow.` largest and in
          the brand amber — so the escalation the sentence describes is the
          thing the masthead does. Sizes are in `em` against the h1's own
          responsive scale, so the ramp survives every breakpoint without a
          second set of numbers to keep in step.
        */
        title={
          <span className="block">
            {[
              { word: "Run.", size: "0.6em", tint: "" },
              { word: "Optimise.", size: "0.8em", tint: "" },
              { word: "Grow.", size: "1em", tint: "text-amber" },
            ].map((line, i) => (
              <span
                key={line.word}
                className="-mb-[0.06em] block overflow-hidden pb-[0.06em]"
              >
                <motion.span
                  className={`block ${line.tint}`}
                  style={{ fontSize: line.size, lineHeight: 1.02 }}
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 0.72,
                    delay: 0.15 + i * 0.11,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {line.word}
                </motion.span>
              </span>
            ))}
          </span>
        }
        lead="One technology partner for your business journey."
        backdrop={
          <>
            <RibbonDelta />
            {/*
              The left of the frame, filled.

              The delta sweeps up from the lower right and leaves the left half
              of a viewport-tall masthead as flat white, which reads as an
              unfinished canvas rather than as negative space. This is the same
              warmth carried across to meet it — deliberately far weaker than
              the delta itself, because the headline, the lead and the stats
              all sit on this side and every one of them was measured on it.
              Strong colour here is what produced the 1.54:1 readings that put
              opaque pills under the buttons in the first place.
            */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
              <div
                className="absolute -bottom-[18%] -left-[16%] h-[820px] w-[900px] rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(var(--amber-ch), 0.3), rgba(var(--orange-ch), 0.1) 45%, transparent 70%)",
                  filter: "blur(120px)",
                }}
              />
              <div
                className="absolute left-[-10%] top-[8%] h-[560px] w-[620px] rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(var(--amber-ch), 0.16), transparent 68%)",
                  filter: "blur(130px)",
                }}
              />
            </div>
          </>
        }
        contentY="top"
        /*
          Everything actionable is pinned to the foot of the masthead rather
          than stacked under the lead.

          As `children` this block sat directly beneath the headline, which
          left the bottom two-fifths of a viewport-tall hero holding nothing —
          a void down the left of the frame that read as a layout accident. A
          full-width bar at the base is the shape a cinematic masthead actually
          takes: type at the top, atmosphere through the middle, and the facts
          and the actions along the bottom edge. It also gives the left column
          something at every height instead of only at the top.
        */
        footer={
          <div className="border-t border-border pt-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
              <dl className="flex flex-wrap items-baseline gap-x-12 gap-y-6">
                {[
                  { n: CAPABILITY_COUNT, label: "Capabilities" },
                  { n: DOMAIN_COUNT, label: "Domains" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <dd className="font-heading text-[2.15rem] font-extrabold leading-none tracking-[-0.04em] text-ink lg:text-[2.6rem]">
                      {stat.n}
                    </dd>
                    {/* `ink-muted`, not `ink-soft`. Measured on the painted
                        hero, `ink-soft` came out at 3.25:1 against the white
                        behind this row — under the 4.5 floor, and these are
                        10px caps so the large-text allowance does not apply.
                        `ink-muted` measures 7.28:1 in the same spot. */}
                    <dt className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-muted">
                      {stat.label}
                    </dt>
                  </div>
                ))}
              </dl>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                <a
                  href="/contact"
                  className="group inline-flex items-center gap-3 rounded-full bg-ink px-8 py-3.5 text-sm font-semibold text-canvas transition-transform duration-300 hover:scale-[1.03]"
                >
                  Request a Consultation
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
                {/*
                  Both of these keep the bordered-pill treatment they were
                  given when the backdrop was a light orange fan and bare type
                  measured as low as 1.54:1 over it. The ground is dark now and
                  the tokens have followed it, but the reasoning holds for the
                  same reason it did then: the streaks travel across this row,
                  so the background behind the label is never a known quantity
                  unless the label brings its own.
                */}
                <a
                  href="#capabilities"
                  className="group inline-flex items-center gap-2 rounded-full border border-border-strong bg-canvas/92 px-7 py-3.5 text-sm font-semibold text-ink-muted transition-colors duration-300 hover:border-orange/50 hover:text-orange"
                >
                  <span data-cta-label>See what we cover</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </div>

            {/*
              The scroll cue, and a label for what it leads to. The hero
              deliberately leaks nothing of the next section — that was the
              point of making it viewport-tall — which also removed the only
              signal that there is more. This puts the signal back and names
              the destination, so it earns its place twice.
            */}
            <a
              href="#journey"
              className="group mt-8 inline-flex items-center gap-3 rounded-full border border-border bg-canvas/95 py-2 pl-2 pr-5 font-mono text-[10px] uppercase tracking-[0.28em] text-ink-muted shadow-[var(--shadow-sm)] transition-colors hover:border-orange/40 hover:text-ink"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-sunken text-orange transition-colors group-hover:bg-orange group-hover:text-white">
                <span aria-hidden className="translate-y-px">&darr;</span>
              </span>
              <span data-cue-label>The journey</span>
            </a>
          </div>
        }
      />

      <JourneyScene covers={JOURNEY_COVERS} />

      <CapabilityStage groups={GROUPS} />

      <PageCta
        title="Not sure which layer you need first?"
        body="Tell us how you operate today and we'll map the shortest path from where you are to where you want to be."
        primary={{ label: "Request a Consultation", href: "/contact" }}
        secondary={{ label: "See the Products", href: "/products" }}
      />
    </>
  );
}
