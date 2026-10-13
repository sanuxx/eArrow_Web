"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/*
 * "Every story answers the same four questions" — a process timeline.
 *
 * Four columns on one straight rail. As the section scrolls through, an
 * orange fill runs along the rail; each step's marker lights and its column
 * resolves (label, question, body) as the fill reaches it. Light theme,
 * one accent colour, no icons — the content carries it.
 *
 * Scrubbed to scroll (reversible). Phones: the same rail, vertical, down the
 * left edge. Reduced motion: the finished state.
 */

export type Stage = { label: string; question: string; body: string };

export default function StoryPath({ stages }: { stages: Stage[] }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    const build = (axis: "x" | "y") => {
      const fill = root.querySelector<HTMLElement>(`[data-fill="${axis}"]`)!;
      const steps = gsap.utils.toArray<HTMLElement>(`[data-step="${axis}"]`, root);
      gsap.set(fill, axis === "x" ? { scaleX: 0 } : { scaleY: 0 });
      gsap.set(steps, { opacity: 0.25 });
      gsap.set(steps.map((s) => s.querySelector("[data-copy]")), { y: 18 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.querySelector(`[data-rail="${axis}"]`),
          start: axis === "x" ? "top 75%" : "top 70%",
          end: axis === "x" ? "bottom 35%" : "bottom 55%",
          scrub: 0.6,
        },
      });
      tl.to(fill, axis === "x" ? { scaleX: 1, duration: 1 } : { scaleY: 1, duration: 1 }, 0);
      steps.forEach((s, i) => {
        const at = (i / steps.length) * 0.92;
        tl.to(s, { opacity: 1, duration: 0.12, ease: "power2.out" }, at)
          .to(s.querySelector("[data-copy]"), { y: 0, duration: 0.18, ease: "power3.out" }, at)
          .to(s.querySelector("[data-dot]"), { scale: 1, backgroundColor: "#e83b00", duration: 0.1 }, at);
        const mark = s.querySelector("[data-mark]");
        if (mark) tl.to(mark, { opacity: 1, duration: 0.15 }, at);
        const prev = i > 0 ? steps[i - 1].querySelector("[data-mark]") : null;
        if (prev) tl.to(prev, { opacity: 0, duration: 0.15 }, at);
      });
    };
    mm.add("(min-width: 1024px)", () => build("x"));
    mm.add("(max-width: 1023px)", () => build("y"));
    return () => mm.revert();
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden bg-canvas py-16 lg:py-24">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[13px] font-medium text-orange">How we tell it</p>
            <h2 className="font-spartan mt-3 max-w-2xl text-[2rem] font-semibold leading-[1.05] tracking-[-0.025em] text-ink sm:text-[2.6rem]">
              Every story answers the same four questions
            </h2>
          </div>
          <p className="max-w-sm text-[15px] leading-relaxed text-ink-muted lg:text-right">
            One structure for every case study, so you can compare them honestly.
          </p>
        </div>

        {/* ── desktop: a straight rail with four columns ── */}
        <div data-rail="x" className="relative mt-16 hidden lg:block">
          <div className="relative h-px bg-border-strong">
            <span data-fill="x" className="absolute -inset-y-px left-0 right-0 origin-left bg-[#e83b00]" />
          </div>
          <div className="grid grid-cols-4 gap-8">
            {stages.map((s) => (
              <div key={s.label} data-step="x" className="relative pt-10">
                <span data-dot className="absolute -top-[6px] left-0 h-3 w-3 scale-75 rounded-full border-2 border-canvas bg-border-strong" />
                <div data-copy className="relative">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-orange">{s.label}</p>
                  <h3 className="font-spartan mt-4 text-[1.55rem] font-semibold leading-[1.15] tracking-[-0.015em] text-ink">{s.question}</h3>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-ink-muted">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── phones and tablets: the rail runs down the left ── */}
        <div data-rail="y" className="relative mt-10 pl-8 lg:hidden">
          <span aria-hidden className="absolute bottom-0 left-[5px] top-0 w-px bg-border-strong" />
          <span data-fill="y" aria-hidden className="absolute bottom-0 left-[4.5px] top-0 w-[2px] origin-top bg-[#e83b00]" />
          <div className="space-y-9">
            {stages.map((s) => (
              <div key={s.label} data-step="y" className="relative">
                <span data-dot className="absolute -left-[31px] top-1 h-3 w-3 scale-75 rounded-full border-2 border-canvas bg-border-strong" />
                <div data-copy>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-orange">{s.label}</p>
                  <h3 className="font-spartan mt-2 text-[1.35rem] font-semibold leading-tight text-ink">{s.question}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
