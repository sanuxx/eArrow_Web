"use client";

import { motion } from "framer-motion";
import { PageHero, PageCta } from "@/components/page-kit";
import { PRODUCT_MARKS } from "@/components/ProductMarks";
import { ArrowUpRight, QMark, QMarkLight } from "@/components/ArrowMark";
import ProductShell, { type ShellConfig } from "@/components/ProductShell";
import { SPRING_SOFT } from "@/components/motion-kit";

/*
 * The products page.
 *
 * It was seven identical white cards of body copy in a three-column grid — a
 * software company describing seven pieces of software without ever showing
 * one. So the page is now a sequence of showcase rows, alternating side to
 * side, each carrying a drawn application shell for that product (see
 * ProductShell.tsx). The copy sits beside the thing it describes.
 *
 * The catalogue mirrors the home page's ProductEcosystem deliberately — same
 * keys, same ids, same order — so a visitor arriving from that section meets
 * the products in the arrangement they just saw.
 */

type Product = {
  key: string;
  id: string;
  label: string;
  domain: string;
  blurb: string;
  problem: string;
  modules: string[];
  shell: ShellConfig;
};

const PRODUCTS: Product[] = [
  {
    key: "workforce",
    id: "WF-01",
    label: "Arrow HR & Payroll",
    domain: "Workforce",
    blurb:
      "One employee record from hiring through payroll, attendance and appraisals — so the same person is not re-entered into four systems.",
    problem:
      "Employee data spread across spreadsheets, with manual approvals and delayed reporting.",
    modules: ["Payroll", "Attendance", "Self-Service", "Performance", "Reporting"],
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
  },
  {
    key: "education",
    id: "ED-02",
    label: "Arrow Education",
    domain: "Academic Operations",
    blurb:
      "Admissions, student records, billing and academic workflows on one platform, from enquiry through to graduation.",
    problem: "Admissions, academics and fees tracked in disconnected systems.",
    modules: ["Student Information", "Admissions", "Billing", "Academic Ops"],
    shell: {
      path: "arrow-edu / admissions",
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
  },
  {
    key: "healthcare",
    id: "HC-03",
    label: "Arrow Hospital",
    domain: "Patient Care",
    blurb:
      "Unified patient records and billing across every department, so a patient's history follows them rather than staying behind.",
    problem: "Patient records and billing fragmented across departments.",
    modules: ["Patient Records", "Billing", "Insurance", "Departments"],
    shell: {
      path: "arrow-hospital / wards",
      nav: ["Overview", "Patients", "Wards", "Billing", "Insurance"],
      metrics: [
        { label: "Admitted", value: "318", delta: "+12", up: true },
        { label: "Occupancy", value: "87%", delta: "+4", up: true },
        { label: "Claims", value: "96.1%", delta: "+1.4", up: true },
      ],
      module: {
        type: "ring",
        caption: "Bed occupancy",
        value: 0.87,
        centre: "87%",
        note: "Live across six wards, with insurance claims reconciled on discharge.",
      },
      action: { label: "Reconcile today's claims", state: "18 open" },
    },
  },
  {
    key: "manufacturing",
    id: "MF-04",
    label: "Arrow Production",
    domain: "Operations",
    blurb:
      "Live visibility into production runs, inventory levels and quality checks — the floor as it is now, not as it was this morning.",
    problem: "No live view of production runs, stock levels or quality exceptions.",
    modules: ["Production", "Inventory", "Quality Control", "Reporting"],
    shell: {
      path: "arrow-production / lines",
      nav: ["Overview", "Lines", "Inventory", "Quality", "Reports"],
      metrics: [
        { label: "Output", value: "12,480", delta: "+640", up: true },
        { label: "Yield", value: "97.3%", delta: "+0.8", up: true },
        { label: "Downtime", value: "1.2h", delta: "-0.5", up: false },
      ],
      module: {
        type: "rows",
        caption: "Line status",
        data: [
          { label: "Line A — moulding", meta: "running", tone: "ok" },
          { label: "Line B — assembly", meta: "running", tone: "ok" },
          { label: "Line C — finishing", meta: "QC hold", tone: "warn" },
          { label: "Line D — packing", meta: "changeover", tone: "live" },
        ],
      },
      action: { label: "Release QC hold on Line C", state: "Awaiting" },
    },
  },
  {
    key: "billing",
    id: "FN-05",
    label: "Arrow E-Billing",
    domain: "Finance",
    blurb:
      "Automated billing cycles and bulk distribution at enterprise scale, with reconciliation that closes itself.",
    problem: "Billing cycles run by hand and distributed one document at a time.",
    modules: ["E-Billing", "Bulk E-mail", "Reconciliation"],
    shell: {
      path: "arrow-billing / cycles",
      nav: ["Overview", "Cycles", "Invoices", "Delivery", "Ledger"],
      metrics: [
        { label: "Invoices", value: "48,900", delta: "+2,140", up: true },
        { label: "Delivered", value: "99.2%", delta: "+0.6", up: true },
        { label: "Reconciled", value: "94.8%", delta: "+5.1", up: true },
      ],
      module: {
        type: "bars",
        caption: "Monthly billing run",
        unit: "12M",
        data: [55, 61, 58, 70, 66, 78, 74, 85, 88, 96],
      },
      action: { label: "Dispatch March cycle", state: "48.9k ready" },
    },
  },
  {
    key: "visitor",
    id: "SC-06",
    label: "Arrow Visitors",
    domain: "Security",
    blurb:
      "Controlled, auditable access across sites and facilities — every entry logged, every log searchable.",
    problem: "Site access logged on paper, with no auditable trail.",
    modules: ["Visitor Management", "Access Control", "Audit Trail"],
    shell: {
      path: "arrow-visitors / gate",
      nav: ["Overview", "On site", "Passes", "Sites", "Audit"],
      metrics: [
        { label: "On site", value: "146", delta: "+22", up: true },
        { label: "Passes today", value: "389", delta: "+41", up: true },
        { label: "Overstays", value: "3", delta: "-2", up: false },
      ],
      module: {
        type: "rows",
        caption: "Recent movements",
        data: [
          { label: "Contractor — East gate", meta: "checked in", tone: "ok" },
          { label: "Supplier delivery — Dock 2", meta: "checked in", tone: "ok" },
          { label: "Visitor pass #4471", meta: "overstay", tone: "warn" },
          { label: "Staff — main lobby", meta: "checked out", tone: "live" },
        ],
      },
      action: { label: "Review overstay alerts", state: "3 flagged" },
    },
  },
  {
    key: "digital",
    id: "DX-07",
    label: "Arrow Digital",
    domain: "Experience",
    blurb:
      "Websites, portals and commerce platforms built for growth — and measured against it once they are live.",
    problem: "A web presence that can't keep pace with how the business sells.",
    modules: ["Web Platforms", "E-Commerce", "Portals"],
    shell: {
      path: "arrow-digital / performance",
      nav: ["Overview", "Pages", "Commerce", "Leads", "Insights"],
      metrics: [
        { label: "Sessions", value: "128k", delta: "+18%", up: true },
        { label: "Conversion", value: "4.6%", delta: "+0.9", up: true },
        { label: "Load", value: "0.9s", delta: "-0.3", up: false },
      ],
      module: {
        type: "ring",
        caption: "Core web vitals",
        value: 0.94,
        centre: "94",
        note: "Measured on real visits, not a lab score — the number the business is judged on.",
      },
      action: { label: "Ship checkout experiment", state: "Staged" },
    },
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
        className="pointer-events-none absolute -inset-10 rounded-panel blur-2xl"
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
                {p.label.replace("Arrow ", "")}
              </span>
            </motion.a>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function ProductsContent() {
  return (
    <>
      <PageHero
        index="03"
        eyebrow="Products & Platforms"
        title="One ecosystem. Multiple possibilities."
        lead="Seven platforms built on shared foundations — adopt one, or connect them into a single digital operating layer."
        aside={<EcosystemMosaic />}
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

            <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
              <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
                {/* ── Copy ── */}
                <motion.div
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={SPRING_SOFT}
                  className={flipped ? "lg:order-2" : ""}
                >
                  <div className="flex items-center gap-4">
                    {Mark && (
                      <span
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-tile text-white shadow-[0_14px_34px_-12px_rgba(var(--orange-ch),0.75)]"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--color-orange), var(--color-amber))",
                        }}
                      >
                        <Mark className="h-[54%] w-[54%]" />
                      </span>
                    )}
                    <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-orange">
                      {product.id} · {product.domain}
                    </span>
                  </div>

                  <h2 className="mt-7 font-heading text-[1.72rem] font-bold leading-[1.08] tracking-[-0.035em] text-ink sm:text-[2.064rem]">
                    {product.label}
                  </h2>

                  <p className="mt-5 max-w-md text-base leading-[1.75] text-ink-muted">
                    {product.blurb}
                  </p>

                  <div className="mt-7 max-w-md rounded-tile border-l-2 border-orange bg-surface-sunken px-5 py-4">
                    <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink-soft">
                      The problem it solves
                    </p>
                    <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                      {product.problem}
                    </p>
                  </div>

                  <ul className="mt-6 flex flex-wrap gap-2">
                    {product.modules.map((m) => (
                      <li
                        key={m}
                        className="rounded-full border border-border bg-surface px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
                      >
                        {m}
                      </li>
                    ))}
                  </ul>

                  <a
                    href="/contact"
                    className="group mt-8 inline-flex items-center gap-2.5 text-sm font-semibold text-ink transition-colors hover:text-orange"
                  >
                    Book a walkthrough
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </motion.div>

                {/* ── The product itself ── */}
                <motion.div
                  initial={{ opacity: 0, y: 34, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ ...SPRING_SOFT, delay: 0.08 }}
                  className={flipped ? "lg:order-1" : ""}
                >
                  <ProductShell config={product.shell} />
                </motion.div>
              </div>
            </div>
          </section>
        );
      })}

      <PageCta
        title="See it running on your data."
        body="Book a walkthrough and we'll demo the platform against a workflow you actually run today."
        primary={{ label: "Book a Demo", href: "/contact" }}
        secondary={{ label: "Explore Solutions", href: "/solutions" }}
      />
    </>
  );
}
