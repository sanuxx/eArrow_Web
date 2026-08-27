"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageHero, PageSection } from "@/components/page-kit";
import { ArrowUpRight, QMark } from "@/components/ArrowMark";
import { SPRING_SOFT } from "@/components/motion-kit";

/*
 * The four enquiry routes the brief's "Contact" sheet defines. Keeping them
 * distinct matters commercially: a general question and an RFP are handled by
 * different people, and a single "Contact us" box loses that signal entirely.
 */

const ROUTES = [
  {
    key: "Talk to an Expert",
    line: "For general enquiries.",
  },
  {
    key: "Book a Demo",
    line: "For prospects interested in a solution.",
  },
  {
    key: "Request a Consultation",
    line: "For organisations exploring digital transformation.",
  },
  {
    key: "Request a Proposal",
    line: "For serious opportunities and RFPs.",
  },
];

const SALES_EMAIL = "sales@earrow.lk";

export default function ContactContent() {
  const [intent, setIntent] = useState(ROUTES[0].key);

  /*
   * The site is a static export, so there is no server to POST to. Rather than
   * ship a form that silently discards what someone types, submitting composes
   * a pre-filled mail to the sales address — the enquiry actually arrives, and
   * the chosen route travels with it in the subject line.
   */
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body = [
      `Name: ${data.get("name") ?? ""}`,
      `Organisation: ${data.get("organisation") ?? ""}`,
      `Email: ${data.get("email") ?? ""}`,
      `Phone: ${data.get("phone") ?? ""}`,
      "",
      String(data.get("message") ?? ""),
    ].join("\n");

    window.location.href = `mailto:${SALES_EMAIL}?subject=${encodeURIComponent(
      `${intent} — eArrow enquiry`
    )}&body=${encodeURIComponent(body)}`;
  }

  const field =
    "mt-2 w-full rounded-tile border border-border bg-surface px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft focus:border-orange";
  const labelCls =
    "font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-ink-soft";

  return (
    <>
      <PageHero
        index="09"
        eyebrow="Contact"
        title="Let's talk about what you're trying to fix."
        lead="Tell us how you operate today. We'll tell you honestly whether we're the right partner for it."
      />

      <PageSection tone="sunken" index="10" label="How can we help?">
        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
          {/* Route selector — doubles as the form's intent field. */}
          <div className="flex flex-col gap-3">
            {ROUTES.map((route, i) => {
              const active = intent === route.key;
              return (
                <motion.button
                  key={route.key}
                  type="button"
                  onClick={() => setIntent(route.key)}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ ...SPRING_SOFT, delay: i * 0.06 }}
                  aria-pressed={active}
                  className={`group relative overflow-hidden rounded-card border px-7 py-6 text-left transition-colors duration-400 ${
                    active
                      ? "border-transparent"
                      : "border-border bg-surface hover:border-orange/30"
                  }`}
                  style={
                    active
                      ? { background: "linear-gradient(115deg, var(--color-orange), var(--color-amber))" }
                      : undefined
                  }
                >
                  <span className="flex items-center justify-between gap-4">
                    <span>
                      <span
                        className={`block font-heading text-base font-bold tracking-[-0.02em] ${
                          active ? "text-white" : "text-ink"
                        }`}
                      >
                        {route.key}
                      </span>
                      <span
                        className={`mt-1.5 block text-sm ${
                          active ? "text-white/75" : "text-ink-muted"
                        }`}
                      >
                        {route.line}
                      </span>
                    </span>
                    <ArrowUpRight
                      className={`h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                        active ? "text-white" : "text-ink-soft"
                      }`}
                    />
                  </span>
                </motion.button>
              );
            })}
          </div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ ...SPRING_SOFT, delay: 0.1 }}
            className="surface-card relative overflow-hidden rounded-card px-7 py-8 lg:px-9"
          >
            <QMark className="pointer-events-none absolute -right-12 -top-10 h-auto w-56 opacity-[0.05]" />

            <p className="relative font-mono text-[10px] uppercase tracking-[0.24em] text-orange">
              {intent}
            </p>

            <div className="relative mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className="block">
                <span className={labelCls}>Name</span>
                <input name="name" required className={field} placeholder="Your name" />
              </label>
              <label className="block">
                <span className={labelCls}>Organisation</span>
                <input name="organisation" className={field} placeholder="Company" />
              </label>
              <label className="block">
                <span className={labelCls}>Email</span>
                <input
                  name="email"
                  type="email"
                  required
                  className={field}
                  placeholder="you@company.com"
                />
              </label>
              <label className="block">
                <span className={labelCls}>Phone</span>
                <input name="phone" className={field} placeholder="+94 ..." />
              </label>
            </div>

            <label className="relative mt-5 block">
              <span className={labelCls}>What are you trying to solve?</span>
              <textarea
                name="message"
                rows={5}
                required
                className={`${field} resize-y`}
                placeholder="Tell us about the processes or systems causing the most friction today."
              />
            </label>

            <button
              type="submit"
              className="group relative mt-7 inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-orange to-amber px-7 py-4 text-sm font-semibold text-white shadow-[var(--shadow-ember)] transition-transform duration-300 hover:scale-[1.02] sm:w-auto"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative">Send enquiry</span>
              <ArrowUpRight className="relative h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>

            <p className="relative mt-4 text-xs leading-relaxed text-ink-soft">
              Opens your mail client with the enquiry pre-filled, addressed to{" "}
              {SALES_EMAIL}.
            </p>
          </motion.form>
        </div>
      </PageSection>

      <PageSection index="11" label="Direct" title="Reach us directly.">
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            { k: "Email", v: SALES_EMAIL, href: `mailto:${SALES_EMAIL}` },
            { k: "Phone", v: "+94 11 234 5678", href: "tel:+94112345678" },
            { k: "Office", v: "Nugegoda, Sri Lanka" },
          ].map((item, i) => (
            <motion.div
              key={item.k}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ ...SPRING_SOFT, delay: i * 0.06 }}
              className="surface-card rounded-card px-7 py-8"
            >
              <p className={labelCls}>{item.k}</p>
              {item.href ? (
                <a
                  href={item.href}
                  className="mt-3 inline-flex items-center gap-1.5 font-heading text-base font-bold tracking-[-0.02em] text-ink transition-colors hover:text-orange"
                >
                  {item.v}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              ) : (
                <p className="mt-3 font-heading text-base font-bold tracking-[-0.02em] text-ink">
                  {item.v}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </PageSection>
    </>
  );
}
