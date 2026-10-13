"use client";

import { motion } from "framer-motion";
import { ArrowGlyph, QMarkLight } from "./ArrowMark";
import { FloatingOrbs } from "./motion-kit";

export default function FinalCta() {
  return (
    <section
      id="contact"
      className="on-orange grain relative overflow-hidden py-10 lg:py-16"
      /*
       * Gradient taken straight from the new logo artwork, and deliberately
       * NOT switched to the theme tokens.
       *
       * Dark mode lifts --color-orange/--color-amber so small accents survive
       * a black canvas. This is the opposite case: a full-bleed field that is
       * itself the light, carrying white text across its whole width. It has
       * no canvas behind it to lose contrast against, and lifting it would only
       * push the white type further down toward the AA floor. The field is the
       * same colour in both themes because it is the same object in both.
       */
      style={{ background: "linear-gradient(120deg, #e83b00 0%, #ff7a1a 52%, #ffb13b 100%)" }}
    >
      {/* Light orbs drifting over the orange, so the field is never static. */}
      <FloatingOrbs
        orbs={[
          {
            size: 520,
            at: { left: "8%", top: "-8%" },
            drift: 50,
            duration: 27,
            from: "#ffd9a0",
            to: "#ffb13b",
            opacity: 0.3,
            blur: 140,
          },
          {
            size: 400,
            at: { right: "10%", bottom: "-10%" },
            drift: 42,
            duration: 22,
            delay: 1.4,
            from: "#fff1dc",
            to: "#ff9a3d",
            opacity: 0.22,
            blur: 130,
          },
        ]}
      />

      {/* huge low-opacity Q marks */}
      <QMarkLight className="pointer-events-none absolute -right-36 -top-32 h-auto w-[760px] opacity-[0.13]" />
      <QMarkLight className="pointer-events-none absolute -bottom-44 -left-32 h-auto w-[600px] opacity-[0.09]" />

      {/* fine grid + vignette give the orange field depth */}
      <span
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, #000, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, #000, transparent 100%)",
        }}
      />
      <span
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, rgba(140,30,0,0.28) 100%)",
        }}
      />

      {/*
        One reveal for the whole block, not three staggered ones.

        Eyebrow, heading and CTA row used to each carry their own
        initial/whileInView with an increasing delay — a visitor watched the
        same closing statement arrive in three separate beats. It is one
        sentence with one call to action; it should land as one thing.
      */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto max-w-3xl px-6 text-center"
      >
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.42em] text-white/80">
          Ready to move forward?
        </p>

        <h2 className="mt-8 font-heading text-[1.935rem] font-extrabold leading-[1.08] tracking-[-0.04em] text-white sm:text-[2.58rem] lg:text-[3.225rem]">
          {/*
            The `{" "}` is load-bearing. JSX strips the newlines either side of
            the <br/>, so without it the heading's text content runs together as
            "…your peopleLet's enable…" for assistive tech and search engines.
            A space at the start of a wrapped line is not rendered, so the
            headline looks identical.
          */}
          Let&rsquo;s empower your people
          <br />{" "}
          Let&rsquo;s enable your growth
        </h2>

        <div className="mt-12 flex flex-col items-center gap-6">
          <a
            href="mailto:sales@earrow.lk"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-white px-9 py-4 text-sm font-bold text-[#080808] shadow-[0_20px_50px_-16px_rgba(80,18,0,0.65)] transition-transform duration-300 hover:scale-[1.04]"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/[0.06] to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative">Let&rsquo;s Talk</span>
            <ArrowGlyph className="relative h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
          </a>

          <a
            href="mailto:sales@earrow.lk"
            className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/75 underline-offset-8 transition-colors hover:text-white hover:underline"
          >
            sales@earrow.lk
          </a>
        </div>
      </motion.div>
    </section>
  );
}
