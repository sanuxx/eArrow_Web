"use client";

import { motion, type Transition } from "framer-motion";
import Link from "next/link";
import { ArrowGlyph } from "../ArrowMark";

/**
 * Hero section matching the reference design:
 * - Pitch black obsidian canvas (#000000)
 * - Sweeping top fluid orange/amber glowing light dome with radiant lit rim
 * - Bottom-right counter-wave with soft ambient light
 * - Centered dual-tone eyebrow capsule: [Strategy] Business Growth
 * - Monumental centered headline: Empowering People / Enabling Growth
 * - Centered supporting subtext
 * - High-contrast CTA pill pair: Glowing Orange [Get Started] + Solid White [See Features]
 *
 * Preserves GSAP data-l attributes for seamless scroll and intro transitions.
 * The placeholder client-logo strip (LOGO IPSUM / BRAND AI / NEXUS / ORBIT /
 * PULSE) that used to close the composition is gone — it carried
 * `data-l="panel-outer"`, and hero-timeline.ts's tweens on that selector are
 * harmless no-ops with no element to match, same as the other retired layers
 * (`panel-row`, `panel-tile`, `panel-bar`) it already tolerates.
 */

const SPRING: Transition = { type: "spring", stiffness: 380, damping: 28 };

export default function HeroPlate({ ref }: { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className="hero-plate relative z-0 flex min-h-[100svh] flex-col justify-center overflow-hidden bg-[#000000] text-white"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. TOP FLUID GLOWING LIGHT DOME (Signature Visual Feature)
         ───────────────────────────────────────────────────────────── */}
      {/* Ambient Diffuse Light Bleed behind the top arch */}
      <div
        aria-hidden
        data-l="orb"
        className="pointer-events-none absolute left-1/2 -top-[18%] h-[560px] w-[min(1280px,120vw)] -translate-x-1/2 rounded-full opacity-65 blur-[90px]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, #ff8a00 0%, #ff4500 45%, #941700 70%, transparent 85%)",
        }}
      />

      {/* High-definition Top Curved Fluid Light Arch SVG */}
      <div
        aria-hidden
        data-l="slab-a"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[320px] w-full"
      >
        <svg
          viewBox="0 0 1440 360"
          fill="none"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="topArchGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#400a00" />
              <stop offset="25%" stopColor="#871b00" />
              <stop offset="60%" stopColor="#e83e00" />
              <stop offset="85%" stopColor="#ff7a00" />
              <stop offset="100%" stopColor="#ffaa2b" />
            </linearGradient>
            <linearGradient id="topRimGrad" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#ff4500" stopOpacity="0.4" />
              <stop offset="20%" stopColor="#ff7a00" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#ffca42" stopOpacity="1" />
              <stop offset="80%" stopColor="#ff7a00" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#ff4500" stopOpacity="0.4" />
            </linearGradient>
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur1" />
              <feGaussianBlur stdDeviation="14" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Solid Curved Light Horizon Body */}
          <path
            d="M 0,0 L 1440,0 L 1440,60 Q 1120,240 720,268 Q 320,295 0,170 Z"
            fill="url(#topArchGrad)"
          />
          {/* Luminous Glowing Lower Edge Highlight */}
          <path
            d="M 0,170 Q 320,295 720,268 Q 1120,240 1440,60"
            fill="none"
            stroke="url(#topRimGrad)"
            strokeWidth="3"
            filter="url(#neonGlow)"
          />
        </svg>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. BOTTOM-RIGHT COUNTER WAVE (Fluid Framing)
         ───────────────────────────────────────────────────────────── */}
      <div
        aria-hidden
        data-l="bloom"
        className="pointer-events-none absolute -bottom-[12%] -right-[8%] h-[460px] w-[580px] rounded-full opacity-50 blur-[95px]"
        style={{
          background:
            "radial-gradient(circle at 60% 70%, #ff8a00 0%, #d13400 50%, transparent 75%)",
        }}
      />

      <div
        aria-hidden
        data-l="slab-b"
        className="pointer-events-none absolute -bottom-2 right-0 z-0 h-[280px] w-[min(760px,70vw)]"
      >
        <svg
          viewBox="0 0 760 280"
          fill="none"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="bottomWaveGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1a0400" />
              <stop offset="35%" stopColor="#7a1700" />
              <stop offset="70%" stopColor="#e84000" />
              <stop offset="100%" stopColor="#ffa026" />
            </linearGradient>
            <linearGradient id="bottomRimGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff4500" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#ff8500" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ffca42" stopOpacity="1" />
            </linearGradient>
          </defs>
          <path
            d="M 0,280 Q 280,240 480,150 Q 640,75 760,45 L 760,280 Z"
            fill="url(#bottomWaveGrad)"
          />
          <path
            d="M 0,280 Q 280,240 480,150 Q 640,75 760,45"
            fill="none"
            stroke="url(#bottomRimGrad)"
            strokeWidth="3"
            filter="url(#neonGlow)"
          />
        </svg>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. CENTERED HERO CONTENT COMPOSITION
         ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-6 pb-16 pt-[110px] text-center sm:pb-20 lg:pb-24">

        {/* Dual-Tone Eyebrow Badge */}
        <div
          data-l="chip"
          className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-[#141419]/90 p-1.5 pr-4 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl"
        >
          <span className="rounded-full bg-gradient-to-r from-[#d13400] via-[#e83b00] to-[#ff7a1a] px-3.5 py-1 text-[11px] font-semibold tracking-wide text-white shadow-[0_0_14px_rgba(232,59,0,0.7)]">
            Strategy
          </span>
          <span className="text-[12px] font-medium tracking-wide text-neutral-300">
            Business Growth
          </span>
        </div>

        {/* Monumental Headline */}
        <h1 className="mt-8 max-w-4xl font-heading text-[2.1rem] font-extrabold leading-[1.1] tracking-[-0.03em] text-white sm:text-5xl md:text-[3.5rem] lg:text-[3.75rem] xl:text-[4rem]">
          <span
            data-l="line-mask"
            className="-mb-[0.08em] block overflow-hidden pb-[0.08em]"
          >
            <span data-l="h1a" className="block text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
              Empowering People
            </span>
          </span>
          {" "}
          <span
            data-l="line-mask"
            className="-mb-[0.08em] block overflow-hidden pb-[0.08em]"
          >
            <span data-l="h1b" className="block text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
              Enabling Growth
            </span>
          </span>
        </h1>

        {/* Supporting Subtext */}
        <p
          data-l="sub"
          className="mt-7 max-w-2xl text-center text-[0.9375rem] leading-[1.8] text-neutral-400 sm:text-[1rem]"
        >
          Intelligent business solutions and technology services designed to help
          organizations work smarter, grow faster, and create lasting impact.
        </p>

        {/* Action Buttons */}
        <div
          data-l="cta"
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }} transition={SPRING}>
            <Link
              href="/solutions"
              className="group relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#d13400] via-[#ff5417] to-[#ff9820] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_28px_rgba(232,59,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.4)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(232,59,0,0.85)]"
            >
              <span>Get Started</span>
              <ArrowGlyph className="ml-2 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }} transition={SPRING}>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-300 hover:bg-neutral-100"
            >
              <span>See Features</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
