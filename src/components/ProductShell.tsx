"use client";

import { motion } from "framer-motion";

/**
 * A product's application shell, drawn rather than screenshotted.
 *
 * The products page used to describe seven pieces of software without ever
 * showing one. For a software company that is the whole miss: three progress
 * bars read as a diagram, whereas a title bar, a sidebar, metric tiles and a
 * live chart read as a product that exists — the same reasoning FeaturedProduct
 * already applies on the home page, generalised here so every product gets one.
 *
 * No real screenshots were supplied, and inventing a pixel-accurate fake UI
 * would be worse than this: these are honest, obviously-illustrative shells
 * built from the design system's own tokens, so they stay correct in both
 * themes and cannot go stale against a product that ships a redesign.
 *
 * Each product picks one content module below its metric row — bars, rows or a
 * ring — so the seven shells vary without seven bespoke designs to maintain.
 */

export type Metric = { label: string; value: string; delta?: string; up?: boolean };

export type ShellModule =
  | { type: "bars"; caption: string; unit: string; data: number[] }
  | {
      type: "rows";
      caption: string;
      data: { label: string; meta: string; tone: "ok" | "warn" | "live" }[];
    }
  | { type: "ring"; caption: string; value: number; centre: string; note: string };

export type ShellConfig = {
  path: string;
  nav: string[];
  metrics: Metric[];
  module: ShellModule;
  /** The highlighted action strip at the foot of the pane. */
  action: { label: string; state: string };
};

const TONE = {
  ok: "bg-orange",
  warn: "bg-amber",
  live: "bg-ink-soft",
} as const;

function Bars({ module }: { module: Extract<ShellModule, { type: "bars" }> }) {
  return (
    <div className="mt-3 rounded-xl border border-border bg-canvas p-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
          {module.caption}
        </span>
        <span className="font-mono text-[11px] tracking-[0.14em] text-ink-soft">
          {module.unit}
        </span>
      </div>
      {/*
        Baseline-anchored columns: each bar is its own full-height flex column
        with the fill pinned to the bottom, so a mid-animation frame still reads
        as a chart rather than as floating blocks.
      */}
      <div className="mt-3 flex h-20 items-stretch gap-[3px]">
        {module.data.map((h, i) => {
          const last = i === module.data.length - 1;
          return (
            <div key={i} className="flex flex-1 flex-col justify-end">
              <motion.span
                initial={{ height: "0%" }}
                whileInView={{ height: `${h}%` }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: 0.3 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className={`w-full rounded-t-[3px] ${
                  last ? "bg-gradient-to-t from-orange to-amber" : "bg-border-strong"
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Rows({ module }: { module: Extract<ShellModule, { type: "rows" }> }) {
  return (
    <div className="mt-3 rounded-xl border border-border bg-canvas p-4">
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
        {module.caption}
      </span>
      <ul className="mt-3 space-y-2">
        {module.data.map((row, i) => (
          <motion.li
            key={row.label}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45, delay: 0.3 + i * 0.08 }}
            className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2"
          >
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${TONE[row.tone]}`} />
            <span className="truncate text-[11px] font-medium text-ink">{row.label}</span>
            <span className="ml-auto shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
              {row.meta}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function Ring({ module }: { module: Extract<ShellModule, { type: "ring" }> }) {
  const R = 42;
  const C = 2 * Math.PI * R;
  return (
    <div className="mt-3 flex items-center gap-5 rounded-xl border border-border bg-canvas p-4">
      <div className="relative h-24 w-24 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <defs>
            <linearGradient id={`ring-${module.caption.replace(/\W/g, "")}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" style={{ stopColor: "var(--color-orange)" }} />
              <stop offset="100%" style={{ stopColor: "var(--color-amber)" }} />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r={R} fill="none" stroke="var(--color-border)" strokeWidth="9" />
          <motion.circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke={`url(#ring-${module.caption.replace(/\W/g, "")})`}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            whileInView={{ strokeDashoffset: C * (1 - module.value) }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-heading text-base font-extrabold text-ink">
          {module.centre}
        </span>
      </div>
      <div className="min-w-0">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
          {module.caption}
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">{module.note}</p>
      </div>
    </div>
  );
}

export default function ProductShell({ config }: { config: ShellConfig }) {
  return (
    <div className="surface-card overflow-hidden rounded-card !shadow-[var(--shadow-lift)]">
      {/* title bar */}
      <div className="flex items-center gap-3 border-b border-border bg-surface-sunken px-4 py-3">
        <span className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-orange" />
          <span className="h-2 w-2 rounded-full bg-amber/70" />
          <span className="h-2 w-2 rounded-full bg-border-strong" />
        </span>
        <span className="truncate font-mono text-[11px] tracking-[0.16em] text-ink-soft">
          {config.path}
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
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
          {config.nav.map((n, i) => (
            <div
              key={n}
              className={`relative mx-2 mb-1 truncate rounded-lg px-3 py-2 text-[11px] font-medium transition-colors ${
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
          <div className="grid grid-cols-3 gap-2.5">
            {config.metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                className="rounded-xl border border-border bg-canvas p-3"
              >
                <p className="truncate font-mono text-[8.5px] uppercase tracking-[0.14em] text-ink-soft">
                  {m.label}
                </p>
                {/*
                  The tile is a third of the pane, and the pane is at its
                  narrowest exactly at `lg`, where the showcase first goes
                  two-column but the viewport has not yet grown. A five-figure
                  value at 16px overran it there, so the type steps up with the
                  space rather than assuming it.
                */}
                <p className="tnum mt-1.5 font-heading text-[13px] font-extrabold leading-none text-ink sm:text-sm xl:text-base">
                  {m.value}
                </p>
                {m.delta && (
                  <p
                    className={`tnum mt-1.5 font-mono text-[11px] ${
                      m.up ? "text-orange" : "text-ink-soft"
                    }`}
                  >
                    {m.up ? "▲" : "▼"} {m.delta}
                  </p>
                )}
              </motion.div>
            ))}
          </div>

          {config.module.type === "bars" && <Bars module={config.module} />}
          {config.module.type === "rows" && <Rows module={config.module} />}
          {config.module.type === "ring" && <Ring module={config.module} />}

          {/* the live action strip — the brief's orange gradient on an active element */}
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-gradient-to-r from-orange to-amber px-4 py-3 text-white">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/20 font-mono text-[11px] font-bold">
              ▶
            </span>
            <span className="truncate text-[13px] font-semibold">{config.action.label}</span>
            <span className="ml-auto shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-white/85">
              {config.action.state}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
