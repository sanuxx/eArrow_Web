"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SectionLabel } from "@/components/ui";
import { SOLUTION_ART } from "@/components/solution-art";
import { ArrowUpRight, QMarkLight } from "@/components/ArrowMark";

/*
 * Capabilities.
 *
 * This section was nine cards in a bento, each ending in a wall of grey chips.
 * The illustrations were fine; the shape was wrong. Sixty-eight capabilities
 * across nine domains were all on screen at once with no hierarchy, so the one
 * thing the section exists to prove — how much ground eArrow actually covers —
 * arrived as noise rather than as scale.
 *
 * So it is a directory now: the nine domains listed down the left with their
 * counts, one open at a time in a panel on the right. Breadth is stated up
 * front as a figure ("68 capabilities across 9 domains") and then explored
 * rather than dumped, which is both easier to read and a stronger claim.
 *
 * It is a tablist, not a set of links: the panel is content on this page, not
 * a destination, so arrow keys move between domains and the panel is wired to
 * the selected tab for assistive tech.
 */

export type Group = {
  name: string;
  code: string;
  art: keyof typeof SOLUTION_ART;
  lead: string;
  items: string[];
};

export default function CapabilityExplorer({ groups }: { groups: Group[] }) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const group = groups[active];
  const Art = SOLUTION_ART[group.art];
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  /* Roving tabindex — the expected behaviour for a tablist. */
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const delta =
        event.key === "ArrowRight" || event.key === "ArrowDown"
          ? 1
          : event.key === "ArrowLeft" || event.key === "ArrowUp"
            ? -1
            : 0;
      if (!delta) return;
      event.preventDefault();
      setActive((current) => {
        const next = (current + delta + groups.length) % groups.length;
        tabRefs.current[next]?.focus();
        return next;
      });
    },
    [groups.length],
  );

  return (
    <section className="tech-grid relative overflow-hidden bg-canvas py-10 lg:py-16">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div>
            <SectionLabel index="04">Capabilities</SectionLabel>
            <h2 className="mt-5 max-w-xl font-heading text-[1.72rem] font-bold leading-[1.08] tracking-[-0.035em] text-ink sm:text-[2.064rem] lg:text-[2.365rem]">
              Technology designed around your business.
            </h2>
          </div>

          {/* The breadth, stated as a figure rather than implied by a wall. */}
          <div className="flex items-end gap-8 lg:pb-2">
            <div>
              <p className="font-heading text-[2.15rem] font-extrabold leading-none tracking-[-0.04em] text-ink">
                <span className="bg-gradient-to-br from-orange to-amber bg-clip-text text-transparent">
                  {total}
                </span>
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft">
                Capabilities
              </p>
            </div>
            <div>
              <p className="font-heading text-[2.15rem] font-extrabold leading-none tracking-[-0.04em] text-ink">
                {groups.length}
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft">
                Domains
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:mt-14 lg:grid-cols-[20rem_1fr] lg:gap-8">
          {/* ── The directory ─────────────────────────────────────────── */}
          <div
            role="tablist"
            aria-label="Capability domains"
            aria-orientation="vertical"
            onKeyDown={onKeyDown}
            /* A horizontal rail on small screens — a 20rem column of nine rows
               would push the panel off the bottom of a phone. */
            className="rail-scroll flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0"
          >
            {groups.map((g, i) => {
              const live = i === active;
              return (
                <button
                  key={g.name}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`cap-tab-${i}`}
                  aria-selected={live}
                  aria-controls="cap-panel"
                  tabIndex={live ? 0 : -1}
                  onClick={() => setActive(i)}
                  className={`group relative flex shrink-0 items-center gap-3 rounded-tile px-4 py-3 text-left transition-colors duration-300 lg:w-full lg:gap-4 lg:px-5 ${
                    live
                      ? "bg-surface shadow-[var(--shadow-sm)]"
                      : "hover:bg-line"
                  }`}
                >
                  {/* the selected row lights along its leading edge */}
                  <span
                    aria-hidden
                    className={`absolute inset-y-2 left-0 w-[3px] rounded-full transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      live ? "scale-y-100" : "scale-y-0"
                    }`}
                    style={{
                      background:
                        "linear-gradient(to bottom, var(--color-orange), var(--color-amber))",
                    }}
                  />
                  <span
                    className={`font-mono text-[10px] tracking-[0.2em] transition-colors ${
                      live ? "text-orange" : "text-ink-soft"
                    }`}
                  >
                    {g.code}
                  </span>
                  <span
                    className={`whitespace-nowrap text-sm font-semibold transition-colors lg:whitespace-normal ${
                      live ? "text-ink" : "text-ink-muted group-hover:text-ink"
                    }`}
                  >
                    {g.name}
                  </span>
                  <span
                    className={`ml-auto hidden shrink-0 font-mono text-[10px] tabular-nums transition-colors lg:block ${
                      live ? "text-orange" : "text-ink-soft"
                    }`}
                  >
                    {String(g.items.length).padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── The open domain ───────────────────────────────────────── */}
          <div
            id="cap-panel"
            role="tabpanel"
            aria-labelledby={`cap-tab-${active}`}
            className="surface-card relative overflow-hidden rounded-panel"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={group.name}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* header: the drawing, and what the domain is for */}
                <div className="grid grid-cols-1 gap-7 border-b border-border p-7 sm:grid-cols-[13rem_1fr] sm:items-center lg:p-9">
                  <div className="relative flex h-36 items-center justify-center overflow-hidden rounded-card border border-border bg-surface-sunken sm:h-40">
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          "radial-gradient(circle at 50% 50%, rgba(var(--orange-ch), 0.12), transparent 68%)",
                      }}
                    />
                    <Art className="relative h-[76%] w-[76%]" />
                  </div>

                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-orange">
                      {group.code} · {String(group.items.length).padStart(2, "0")} capabilities
                    </p>
                    <h3 className="mt-3 font-heading text-[1.376rem] font-bold tracking-[-0.03em] text-ink sm:text-[1.591rem]">
                      {group.name}
                    </h3>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
                      {group.lead}
                    </p>
                  </div>
                </div>

                {/*
                  The capabilities themselves — a hairline-ruled index rather
                  than chips. Sixty-eight pills across the section was the
                  texture that made it read as filler; ruled rows read as a
                  specification.
                */}
                <ul className="grid grid-cols-1 gap-x-10 p-7 sm:grid-cols-2 lg:p-9">
                  {group.items.map((item, i) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 + i * 0.025 }}
                      className="flex items-center gap-3 border-b border-border py-3 last:border-b-0 sm:[&:nth-last-child(2):nth-child(odd)]:border-b-0"
                    >
                      <span className="h-1 w-1 shrink-0 rounded-full bg-gradient-to-br from-orange to-amber" />
                      <span className="text-sm text-ink">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>

            <QMarkLight
              className="pointer-events-none absolute -bottom-10 -right-8 h-auto w-44 opacity-[0.04]"
              style={{ filter: "var(--logo-filter)" }}
            />
          </div>
        </div>

        <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
          Not sure where you sit?{" "}
          <a
            href="/contact"
            className="group ml-1 inline-flex items-center gap-1.5 font-medium text-orange"
          >
            Talk it through with us
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </p>
      </div>
    </section>
  );
}
