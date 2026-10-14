"use client";

import { motion } from "framer-motion";
import { PageHero, PageCta } from "@/components/page-kit";
import { PRODUCT_MARKS } from "@/components/ProductMarks";
import { QMark, QMarkLight } from "@/components/ArrowMark";
import ProductShell, { type ShellConfig } from "@/components/ProductShell";
import ProductRing from "@/components/ProductRing";
import LaptopShowcase, { type Screen } from "@/components/LaptopShowcase";
import ProductStory from "@/components/ProductStory";
import { SPRING_SOFT } from "@/components/motion-kit";
import { withBasePath } from "@/lib/basePath";

/* Screenshots live in public/products/<key>/1.webp, 2.webp, … */
const screens = (key: string, alts: string[]): Screen[] =>
  alts.map((alt, i) => ({ src: withBasePath(`/products/${key}/${i + 1}.webp`), alt }));

/*
 * The products page.
 *
 * It was seven identical white cards of body copy in a three-column grid — a
 * software company describing seven pieces of software without ever showing
 * one. So the page is now a sequence of showcase rows, alternating side to
 * side, each showing that product's real screenshots on a laptop (see
 * LaptopShowcase.tsx), or a drawn application shell (ProductShell.tsx) where
 * no screenshots exist yet. The copy sits beside the thing it describes.
 *
 * The catalogue mirrors the home page's ProductEcosystem deliberately — same
 * keys, same ids, same order — so a visitor arriving from that section meets
 * the products in the arrangement they just saw.
 */

type Product = {
  key: string;
  id: string;
  label: string;
  /** Used on the ring and mosaic tiles, where the full name will not fit. */
  short: string;
  /** One line under the name: the outcome, in the customer's words. */
  tagline: string;
  domain: string;
  blurb: string;
  problem: string;
  modules: string[];
  /** Full module catalogue, grouped (shown in place of `modules` when present). */
  moduleGroups?: { title: string; items: string[] }[];
  /** Drawn fallback, shown when a product has no real screenshots yet. */
  shell: ShellConfig;
  screens?: Screen[];
};

const PRODUCTS: Product[] = [
  {
    key: "workforce",
    id: "WF-01",
    label: "Arrow HR & Payroll",
    short: "HR & Payroll",
    tagline: "One record, every payday, on time",
    domain: "Workforce",
    blurb:
      "One employee record from hiring through payroll, attendance and appraisals. The same person is never re-entered into four systems.",
    problem:
      "Employee data spread across spreadsheets, with manual approvals and delayed reporting.",
    modules: ["Payroll", "Attendance", "Self-Service", "Performance", "Reporting"],
    moduleGroups: [
      {
        title: "Core modules",
        items: [
          "Company Set Up / Master Data",
          "User Access Control Management",
          "Employee Database & Information Management",
          "Onboarding & Offboarding",
          "Time & Attendance Management",
          "Leave & Absence Management",
          "Employee Self Service (ESS) & Manager Self Service (MSS)",
        ],
      },
      {
        title: "Premium modules",
        items: [
          "Recruitment & Applicant Tracking",
          "Benefit Management",
          "Performance Management",
          "Training & Development",
          "Asset Management",
          "Employee Correspondence / HR Letter Generation",
          "Mobile App",
          "Bulk Data Uploads",
          "Analytics & Reporting",
        ],
      },
    ],
    shell: {
      path: "arrow-hr / dashboard",
      nav: ["Overview", "People", "Payroll", "Time", "Reports"],
      metrics: [
        { label: "Employees", value: "2,840", delta: "+124", up: true },
        { label: "Payroll", value: "98.7%", delta: "+2.1", up: true },
        { label: "Attendance", value: "94.2%", delta: "-0.4", up: false },
      ],
      module: {
        type: "bars",
        caption: "Payroll cycles",
        unit: "12M",
        data: [42, 58, 49, 71, 63, 82, 75, 91, 86, 97],
      },
      action: { label: "Run payroll for March", state: "Ready" },
    },
    screens: screens("workforce", [
      "Arrow HR main dashboard with headcount, attendance, leave and contract summaries",
      "Arrow HR dashboard with headcount, attendance, performance and leave charts",
    ]),
  },
  {
    key: "education",
    id: "HE-02",
    label: "Arrow Higher Education Management System",
    short: "Higher Education",
    tagline: "From first enquiry to graduation day",
    domain: "Higher Education",
    blurb:
      "Admissions, student records, billing and academic workflows on one platform, from enquiry through to graduation.",
    problem: "Admissions, academics and fees tracked in disconnected systems.",
    modules: ["Student Information", "Admissions", "Billing", "Exams", "Academic Ops"],
    shell: {
      path: "arrow-hems / admissions",
      nav: ["Overview", "Students", "Admissions", "Fees", "Exams"],
      metrics: [
        { label: "Students", value: "4,210", delta: "+318", up: true },
        { label: "Applications", value: "962", delta: "+87", up: true },
        { label: "Fees cleared", value: "91.4%", delta: "+3.2", up: true },
      ],
      module: {
        type: "rows",
        caption: "Applications in review",
        data: [
          { label: "BSc Computing — intake 2026", meta: "142 new", tone: "ok" },
          { label: "Diploma in Business", meta: "88 new", tone: "ok" },
          { label: "Foundation programme", meta: "awaiting docs", tone: "warn" },
          { label: "MSc Data Science", meta: "closing", tone: "live" },
        ],
      },
      action: { label: "Publish intake offers", state: "42 queued" },
    },
    screens: screens("education", [
      "Higher education dashboard with membership, program application and registration charts",
      "Program application management screen",
    ]),
  },
  {
    key: "ticketing",
    id: "TK-03",
    label: "Arrow Ticketing System",
    short: "Ticketing",
    tagline: "Every request owned until it's resolved",
    domain: "Service Desk",
    blurb:
      "Every request logged, routed to the right team and tracked to resolution, with SLAs that are measured rather than hoped for.",
    problem: "Requests lost across e-mail threads and phone calls, with no view of what is still open.",
    modules: ["Ticket Queues", "SLA Tracking", "Assignment", "Knowledge Base", "Reporting"],
    shell: {
      path: "arrow-ticketing / queue",
      nav: ["Overview", "Queue", "My tickets", "SLAs", "Reports"],
      metrics: [
        { label: "Open", value: "184", delta: "-26", up: false },
        { label: "Within SLA", value: "96.3%", delta: "+2.4", up: true },
        { label: "First reply", value: "14m", delta: "-6m", up: false },
      ],
      module: {
        type: "rows",
        caption: "Priority queue",
        data: [
          { label: "#8812 — Payroll access request", meta: "assigned", tone: "ok" },
          { label: "#8809 — Printer offline, Level 3", meta: "in progress", tone: "live" },
          { label: "#8803 — VPN login failure", meta: "SLA at risk", tone: "warn" },
          { label: "#8798 — New starter laptop", meta: "resolved", tone: "ok" },
        ],
      },
      action: { label: "Escalate at-risk tickets", state: "4 flagged" },
    },
    screens: screens("ticketing", [
      "Support ticketing dashboard with tickets by status and daily and weekly raised versus resolved volume",
      "Support ticketing analytics with tickets by organisation and category, escalations and SLA compliance by severity",
    ]),
  },
  {
    key: "crm",
    id: "CR-04",
    label: "Arrow CRM",
    short: "CRM",
    tagline: "See the whole pipeline, not just the last call",
    domain: "Customer Relationships",
    blurb:
      "Leads, accounts and every conversation with them in one place, so the pipeline is something you can see rather than reconstruct.",
    problem: "Customer history scattered across inboxes and spreadsheets, and a pipeline nobody trusts.",
    modules: ["Leads", "Accounts", "Pipeline", "Activities", "Reporting"],
    shell: {
      path: "arrow-crm / pipeline",
      nav: ["Overview", "Leads", "Accounts", "Pipeline", "Reports"],
      metrics: [
        { label: "Open deals", value: "312", delta: "+28", up: true },
        { label: "Win rate", value: "34.8%", delta: "+3.1", up: true },
        { label: "Cycle", value: "21d", delta: "-4d", up: false },
      ],
      module: {
        type: "bars",
        caption: "Pipeline value",
        unit: "12M",
        data: [38, 44, 52, 49, 61, 66, 72, 70, 84, 93],
      },
      action: { label: "Follow up stalled deals", state: "17 due" },
    },
    screens: screens("crm", [
      "Arrow CRM analytics dashboard with leads, pipeline value, lead sources and sales funnel",
      "Arrow CRM dashboard summary cards",
      "Arrow CRM tasks and follow-ups list",
    ]),
  },
  {
    key: "uniconnect",
    id: "UC-05",
    label: "Arrow Uni Connect",
    short: "Uni Connect",
    tagline: "Turn every enquiry into an enrolment",
    domain: "Student Recruitment",
    blurb:
      "Every enquiry, from exhibitions, agents, referrals and the website, tracked from first contact to enrolment, with follow-ups that escalate themselves when they slip.",
    problem: "Student leads scattered across agents, spreadsheets and social inboxes, with follow-ups that quietly go cold.",
    modules: ["Leads & Inquiries", "Pipeline", "Follow-Ups & Escalations", "Agent Portal", "Commission", "Intake Cycles"],
    shell: {
      path: "arrow-uniconnect / pipeline",
      nav: ["Overview", "Leads", "Pipeline", "Follow-ups", "Reports"],
      metrics: [
        { label: "Active leads", value: "61", delta: "+9", up: true },
        { label: "Enrolments", value: "13", delta: "+4", up: true },
        { label: "Lead → enrol", value: "18.8%", delta: "+2.3", up: true },
      ],
      module: {
        type: "ring",
        caption: "Inquiry to lead",
        value: 0.425,
        centre: "42%",
        note: "Share of inquiries qualified into leads this intake cycle.",
      },
      action: { label: "Escalate overdue follow-ups", state: "55 overdue" },
    },
    screens: screens("uniconnect", [
      "Uni Connect dashboard with lead pipeline by stage, follow-up status and recent activity",
      "Uni Connect leads list filtered by university, program and source",
      "Uni Connect follow-up tracker with task reminders and escalations",
    ]),
  },
  {
    key: "workflow",
    id: "WM-06",
    label: "Arrow Workflow Management System",
    short: "Workflow",
    tagline: "Approvals that move on their own",
    domain: "Process Automation",
    blurb:
      "Approvals and internal processes mapped once and run automatically, with every step visible and every decision on record.",
    problem: "Approvals waiting in inboxes, with no way to see where a request is stuck.",
    modules: ["Process Designer", "Approvals", "Forms", "Escalations", "Audit Trail"],
    shell: {
      path: "arrow-workflow / approvals",
      nav: ["Overview", "Processes", "Approvals", "Forms", "Audit"],
      metrics: [
        { label: "In flight", value: "527", delta: "+44", up: true },
        { label: "On time", value: "93.5%", delta: "+4.7", up: true },
        { label: "Avg. approval", value: "6.2h", delta: "-2.1h", up: false },
      ],
      module: {
        type: "rows",
        caption: "Awaiting approval",
        data: [
          { label: "Purchase request — IT equipment", meta: "step 2 of 3", tone: "live" },
          { label: "Leave request — Finance", meta: "approved", tone: "ok" },
          { label: "Vendor onboarding — Logistics", meta: "overdue", tone: "warn" },
          { label: "Expense claim — Sales", meta: "approved", tone: "ok" },
        ],
      },
      action: { label: "Nudge overdue approvers", state: "6 pending" },
    },
    screens: screens("workflow", [
      "Workflow management dashboard with tasks, completion rate, SLA compliance, approvals and escalations",
      "Resource and capacity view with per-person workload status and findings",
    ]),
  },
  {
    key: "school",
    id: "SS-07",
    label: "Arrow School Management System",
    short: "School",
    tagline: "The whole school, run from one place",
    domain: "School Administration",
    blurb:
      "Enrolment, attendance, fees, exams and parent communication for schools, run from one system instead of registers and ledgers.",
    problem: "Attendance, marks and fee records kept by hand, and parents kept in the dark.",
    modules: ["Enrolment", "Attendance", "Fees", "Exams & Reports", "Parent Portal"],
    shell: {
      path: "arrow-school / classes",
      nav: ["Overview", "Students", "Classes", "Fees", "Parents"],
      metrics: [
        { label: "Students", value: "1,860", delta: "+94", up: true },
        { label: "Attendance", value: "95.8%", delta: "+1.2", up: true },
        { label: "Fees paid", value: "89.3%", delta: "+4.0", up: true },
      ],
      module: {
        type: "bars",
        caption: "Term attendance",
        unit: "10W",
        data: [88, 91, 90, 93, 92, 94, 95, 93, 96, 96],
      },
      action: { label: "Send term reports to parents", state: "Ready" },
    },
    screens: screens("school", [
      "School management dashboard with students, collections, outstanding fees and admissions trend",
      "Student profiles list with admission numbers, classes and application status",
    ]),
  },
];

/* The anatomy the brief specifies for every product page. */
const ANATOMY = [
  "Problem",
  "Solution",
  "Features",
  "Benefits",
  "Screenshots",
  "Integrations",
  "Demo CTA",
];

/**
 * The catalogue as a single object: the eArrow Q holding the corner and the
 * seven product marks tiled around it. This is also the page's only jump list.
 *
 * It used to be one of two. A sticky bar beneath the masthead carried the same
 * seven marks, linking to the same seven anchors, about 100px further down —
 * so the reader met the whole catalogue twice before reaching any of it, and
 * the unlabelled version came first. The bar is gone and its job moved here,
 * which is why every tile now carries its name: without one you could not tell
 * the mortarboard from the shield, and the labelled bar was the only thing
 * making that survivable.
 */
function EcosystemMosaic() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto w-full max-w-lg lg:ml-auto lg:mr-0"
    >
      {/* Ambient bloom, warmest behind the identity tile in the top-left. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-10 rounded-panel"
        style={{
          background:
            "radial-gradient(circle at 22% 26%, rgba(var(--orange-ch), 0.20), transparent 62%)",
        }}
      />
      {/* A drafting grid under the tiles, so they sit on a surface rather than
          on nothing — the same device the hero section uses at page scale. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-8 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-line) 1px, transparent 1px), linear-gradient(to bottom, var(--color-line) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
          maskImage: "radial-gradient(closest-side, #000 55%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(closest-side, #000 55%, transparent 100%)",
        }}
      />

      {/* `.mosaic` carries the hover-recede behaviour — see globals.css for why
          it is a real rule rather than an arbitrary variant. */}
      <div className="mosaic relative grid grid-cols-4 gap-2.5">
        {/* The identity tile, carrying the brand gradient. */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative flex aspect-square items-center justify-center overflow-hidden rounded-card shadow-[0_18px_44px_-16px_rgba(var(--orange-ch),0.8)]"
          style={{
            background:
              "linear-gradient(135deg, var(--color-ember), var(--color-orange) 55%, var(--color-amber))",
          }}
        >
          <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent" />
          {/* a broad specular streak, so the identity tile catches light */}
          <span
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(104deg, transparent 34%, rgba(255,255,255,0.20) 48%, transparent 62%)",
            }}
          />
          <span aria-hidden className="absolute inset-[7%] rounded-[18%] border border-white/25" />
          <QMarkLight className="relative h-auto w-[44%]" />
        </motion.div>

        {PRODUCTS.map((p, i) => {
          const Mark = PRODUCT_MARKS[p.key];
          return (
            <motion.a
              key={p.key}
              href={`#${p.key}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 + i * 0.05 }}
              className="surface-card group relative flex aspect-square flex-col items-center justify-center gap-2 overflow-hidden rounded-card px-1.5 hover:-translate-y-1 hover:border-orange/40 hover:shadow-[var(--shadow-lift)]"
            >
              {/* warm wash that rises from the foot of the tile on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-400 group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(to top, rgba(var(--orange-ch), 0.12), transparent 62%)",
                }}
              />

              {/*
                The mark sits in its own well rather than floating in the middle
                of a white square — it gives each tile an interior, which is what
                the grid was missing when every cell was one small grey glyph on
                an otherwise empty field.
              */}
              {Mark && (
                <span className="relative flex h-11 w-11 items-center justify-center rounded-tile border border-border bg-surface-sunken transition-colors duration-400 group-hover:border-orange/30 group-hover:bg-white">
                  <Mark className="h-6 w-6 text-ink-muted transition-colors duration-400 group-hover:text-orange" />
                </span>
              )}

              {/*
                `ink-muted`, not `ink-soft`. These labels are 8.5px, and at that
                size the softer grey sat around 3.2:1 — over the line for a
                graphic but nowhere near the 4.5:1 that text this small needs.
              */}
              <span className="relative text-center font-mono text-[8.5px] uppercase leading-tight tracking-[0.1em] text-ink-muted transition-colors duration-400 group-hover:text-ink">
                {p.short}
              </span>
            </motion.a>
          );
        })}
      </div>
    </motion.div>
  );
}

/* Full names like "Arrow Higher Education Management System" will not fit a
   96px card, so the ring uses each product's short label. */
const RING_ITEMS = PRODUCTS.map((p) => ({
  key: p.key,
  label: p.short,
  href: `#${p.key}`,
}));

export default function ProductsContent() {
  return (
    <>
      <PageHero
        index="03"
        eyebrow="Products & Platforms"
        title={
          <>
            One ecosystem,{" "}
            <span className="bg-gradient-to-r from-[#d13400] via-[#ff5417] to-[#ff9820] bg-clip-text text-transparent">
              multiple possibilities
            </span>
          </>
        }
        lead={
          <>
            Seven platforms built on shared foundations. Adopt one, or connect them into a single digital operating layer.
            {/* spans and links only: this sits inside the hero's <p> */}
            <span className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#workforce"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#d13400] via-[#ff5417] to-[#ff9820] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_-8px_rgba(232,59,0,0.7),inset_0_1px_0_rgba(255,255,255,0.4)] transition-transform duration-300 hover:-translate-y-0.5"
              >
                Explore the platforms
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
              </a>
              <a
                href="/contact"
                className="inline-flex items-center rounded-full border border-border-strong bg-surface px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-orange hover:text-orange"
              >
                Book a demo
              </a>
            </span>
            <span className="mt-9 flex flex-wrap gap-x-10 gap-y-4">
              {[
                ["7", "Platforms"],
                ["1", "Shared core"],
                ["Web + mobile", "On every device"],
              ].map(([n, l]) => (
                <span key={l} className="block">
                  <span className="font-spartan block text-[1.7rem] font-semibold leading-none tracking-[-0.02em] text-ink">{n}</span>
                  <span className="mt-1.5 block text-[12.5px] text-ink-soft">{l}</span>
                </span>
              ))}
            </span>
          </>
        }
        /*
          The ecosystem as a ring rather than a grid. Seven platforms plus the
          identity mark orbiting one centre says "these are one system" in a
          way a static 4×2 block of tiles never did — and it puts the page's
          own claim, "one ecosystem", on screen instead of only in the
          headline. The flat grid is still built, and is what a visitor who
          asks for reduced motion gets.
        */
        aside={<ProductRing items={RING_ITEMS} fallback={<EcosystemMosaic />} />}
      >
        {/*
          The brief's product-page anatomy, surfaced as a promise about what
          each detail page will tell you rather than kept as internal spec.
          Set on a rule with numbered nodes rather than loose chips and arrows,
          so it reads as one sequence instead of seven separate pills.
        */}
        <div className="mt-10 flex flex-col gap-x-6 gap-y-3 border-t border-border pt-7 lg:flex-row lg:items-baseline">
          <p className="shrink-0 font-mono text-[10px] uppercase tracking-[0.24em] text-ink-soft">
            Every product page covers
          </p>

          <ol className="flex flex-wrap items-baseline gap-x-2.5 gap-y-2">
            {ANATOMY.map((step, i) => (
              <li key={step} className="flex items-baseline gap-2.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink">
                  {step}
                </span>
                {i < ANATOMY.length - 1 && (
                  <span aria-hidden className="font-mono text-[10px] text-orange">
                    →
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </PageHero>

      {/* ── The showcases ─────────────────────────────────────────────────── */}
      {PRODUCTS.map((product, i) => {
        const Mark = PRODUCT_MARKS[product.key];
        const flipped = i % 2 === 1;
        /*
         * Ground, kept separate from `flipped`.
         *
         * These used to be the same flag, which meant the first showcase — not
         * flipped — took `tech-grid bg-canvas`, the identical treatment to the
         * masthead directly above it. With the sticky index bar between them
         * that was fine; the bar's border was the seam. Once the bar was
         * removed the two merged, and "WF-01 · Workforce" read as part of the
         * hero rather than as the first product.
         *
         * Offsetting the tint by one starts the alternation on the sunken
         * ground, so the first showcase is separated from the hero and the
         * copy still leads on the left.
         */
        const tinted = i % 2 === 0;

        return (
          <section
            key={product.key}
            id={product.key}
            /* `scroll-mt` clears the fixed header so a jump from the mosaic
               lands on the heading rather than behind it. Reduced from 32/40
               when the sticky index bar was removed — that offset was sized to
               clear two stacked bars, and left a gap once there was only one. */
            className={`relative overflow-hidden py-10 scroll-mt-24 lg:py-16 lg:scroll-mt-28 ${
              tinted ? "bg-canvas-alt" : "tech-grid bg-canvas"
            }`}
          >
            <QMark
              className={`pointer-events-none absolute -top-16 h-auto w-[420px] opacity-[0.035] ${
                flipped ? "-left-24" : "-right-24"
              }`}
            />

            {/*
              Ambient warmth. A white ground with two screenshots on it read as
              empty; these give each showcase a light source. The big halo sits
              behind the laptop, a smaller amber one behind the copy, each on
              its own slow drift so neighbouring sections never move in step.
            */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <span
                className={`product-glow absolute top-1/2 h-[620px] w-[620px] -translate-y-1/2 rounded-full lg:h-[760px] lg:w-[760px] ${
                  flipped ? "-left-40 lg:left-[2%]" : "-right-40 lg:right-[2%]"
                }`}
                style={{
                  background:
                    "radial-gradient(circle, rgba(var(--orange-ch),0.34) 0%, rgba(var(--orange-ch),0.16) 42%, transparent 70%)",
                  animationDelay: `${i * -3}s`,
                }}
              />
              <span
                className={`product-glow product-glow--free absolute top-[8%] h-[380px] w-[380px] rounded-full ${
                  flipped ? "right-[6%]" : "left-[2%]"
                }`}
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,177,59,0.32) 0%, rgba(255,177,59,0.10) 45%, transparent 70%)",
                  animationDelay: `${i * -3 - 7}s`,
                  animationDuration: "22s",
                }}
              />
              {/* a warm pool under the laptop */}
              <span
                className={`absolute bottom-[12%] hidden h-[120px] lg:block w-[46%] rounded-[50%] ${
                  flipped ? "left-[6%]" : "right-[6%]"
                }`}
                style={{ background: "radial-gradient(closest-side, rgba(var(--orange-ch),0.22), transparent)" }}
              />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
              <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
                {/* ── Copy ── */}
                <div className={flipped ? "lg:order-2" : ""}>
                  <ProductStory
                    index={i}
                    total={PRODUCTS.length}
                    id={product.id}
                    domain={product.domain}
                    label={product.label}
                    short={product.short}
                    tagline={product.tagline}
                    blurb={product.blurb}
                    problem={product.problem}
                    modules={product.modules}
                    moduleGroups={product.moduleGroups}
                    Mark={Mark}
                  />
                </div>

                {/* ── The product itself ── */}
                <motion.div
                  initial={{ opacity: 0, y: 34, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ ...SPRING_SOFT, delay: 0.08 }}
                  className={flipped ? "lg:order-1" : ""}
                >
                  {product.screens ? (
                    <LaptopShowcase screens={product.screens} />
                  ) : (
                    <ProductShell config={product.shell} />
                  )}
                </motion.div>
              </div>
            </div>
          </section>
        );
      })}

      <PageCta
        title="See it running on your data"
        body="Book a walkthrough and we'll demo the platform against a workflow you actually run today."
        primary={{ label: "Book a Demo", href: "/contact" }}
        secondary={{ label: "Explore Solutions", href: "/solutions" }}
      />
    </>
  );
}
