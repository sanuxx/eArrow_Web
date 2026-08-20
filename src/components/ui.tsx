"use client";

import { motion } from "framer-motion";
import { ArrowGlyph } from "./ArrowMark";
import { SPRING, EASE_BACK } from "./motion-kit";

/**
 * Shared primitives. These exist so the "technical" voice is defined once —
 * an eyebrow label, a metric, a CTA — rather than re-typed with slightly
 * different tracking in eleven files, which is what makes a page look
 * assembled instead of designed.
 */

/** Mono eyebrow with an index and a rule, e.g. `[03] ── INDUSTRIES`. */
export function SectionLabel({
  index,
  children,
  className,
}: {
  index?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-orange ${className ?? ""}`}
    >
      {index && <span className="text-ink-soft">[{index}]</span>}
      <span className="h-px w-6 bg-orange/50" />
      <span>{children}</span>
    </div>
  );
}

/** Small live-status pill — a pulsing dot plus a mono label. */
export function StatusChip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted ${className ?? ""}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span
          className="absolute inline-flex h-full w-full rounded-full bg-orange"
          style={{ animation: "pulse-dot 2.4s ease-in-out infinite" }}
        />
      </span>
      {children}
    </span>
  );
}

/** Primary action — logo-gradient fill, ember shadow, arrow that travels on hover. */
export function PrimaryCta({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.045, y: -2 }}
      whileTap={{ scale: 0.965 }}
      transition={SPRING}
      className={`group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-orange to-amber px-7 py-4 text-sm font-semibold text-white shadow-[var(--shadow-ember)] ${className ?? ""}`}
    >
      {/* specular sweep across the button face on hover */}
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative">{children}</span>
      <ArrowGlyph className="relative h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
    </motion.a>
  );
}

/** Secondary action — hairline border on a real surface. */
export function GhostCta({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={SPRING}
      className={`group inline-flex items-center justify-center gap-2.5 rounded-full border border-border-strong bg-surface px-7 py-4 text-sm font-semibold text-ink shadow-[var(--shadow-sm)] transition-colors duration-300 hover:border-orange hover:text-orange ${className ?? ""}`}
    >
      {children}
      <ArrowGlyph className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
    </motion.a>
  );
}

/**
 * Corner registration ticks — the small L-brackets used on technical drawings.
 * Purely decorative, but they do a lot of work signalling precision.
 */
export function CornerTicks({ className }: { className?: string }) {
  const corner = "absolute h-3 w-3 border-orange/40";
  return (
    <span className={`pointer-events-none absolute inset-0 ${className ?? ""}`} aria-hidden>
      <span className={`${corner} left-0 top-0 border-l border-t`} />
      <span className={`${corner} right-0 top-0 border-r border-t`} />
      <span className={`${corner} bottom-0 left-0 border-b border-l`} />
      <span className={`${corner} bottom-0 right-0 border-b border-r`} />
    </span>
  );
}

/** Section heading with the standard display treatment. */
export function SectionHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: EASE_BACK }}
      className={`mt-6 max-w-2xl font-heading text-[2.1rem] font-bold leading-[1.08] tracking-[-0.035em] text-ink sm:text-[2.75rem] lg:text-5xl ${className ?? ""}`}
    >
      {children}
    </motion.h2>
  );
}
