"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import HrDashboard from "@/components/HrDashboard";

/*
 * The case study, as a before/after you can drag.
 *
 * Two layers in one frame. Underneath, the after: the real Arrow HR dashboard.
 * On top, clipped to the left of a divider, the before: the scattered work it
 * replaced — spreadsheets, sticky notes, an email chain, a paper form waiting
 * for a signature. Scrolling sweeps the divider across; the visitor can grab
 * it and drag either way at any time (after which scroll stops steering it).
 * The three changes below light up as the divider passes them.
 *
 * No invented numbers: the collage uses generic placeholders, and the outcome
 * figures stay unpublished until verified with the customer.
 */

const PAIRS = [
  { before: "Multiple spreadsheets", after: "Integrated HRIS" },
  { before: "Manual approvals", after: "Automated workflows" },
  { before: "Delayed reporting", after: "Real-time dashboards" },
];

function Collage() {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "repeating-linear-gradient(0deg, #ece6df 0 1px, transparent 1px 28px), #f4efe9" }}>
      {/* spreadsheet, version seven */}
      <div className="absolute left-[4%] top-[6%] w-[44%] -rotate-3 rounded-md bg-white shadow-[0_18px_30px_-14px_rgba(0,0,0,0.45)]">
        <div className="flex items-center gap-2 rounded-t-md bg-[#1f7a45] px-3 py-1.5 text-[11px] font-semibold text-white">
          <span className="rounded bg-white/25 px-1">X</span> payroll_v7_FINAL(2).xlsx
        </div>
        <div className="grid grid-cols-5 text-[10px] text-[#444]">
          {Array.from({ length: 30 }).map((_, i) => (
            <span key={i} className={`border-b border-r border-[#e3e3e3] px-1.5 py-1 ${i < 5 ? "bg-[#f1f5f2] font-semibold" : ""} ${i === 13 ? "bg-[#ffd7d7] text-[#c00]" : ""}`}>
              {i < 5 ? ["Name", "Dept", "Days", "OT", "Net"][i] : i === 13 ? "#REF!" : i % 5 === 0 ? "—" : "··"}
            </span>
          ))}
        </div>
      </div>
      {/* a second sheet underneath */}
      <div className="absolute left-[18%] top-[44%] w-[36%] rotate-2 rounded-md bg-white shadow-[0_18px_30px_-14px_rgba(0,0,0,0.45)]">
        <div className="rounded-t-md bg-[#1f7a45] px-3 py-1.5 text-[11px] font-semibold text-white">attendance_march_copy.xlsx</div>
        <div className="h-20 bg-[linear-gradient(#e3e3e3_1px,transparent_1px),linear-gradient(90deg,#e3e3e3_1px,transparent_1px)] bg-[length:100%_16px,20%_100%]" />
      </div>
      {/* sticky notes */}
      <div className="absolute left-[52%] top-[10%] w-[20%] rotate-6 bg-[#ffe680] p-3 text-[12px] font-medium leading-snug text-[#5a4a00] shadow-[0_12px_20px_-10px_rgba(0,0,0,0.5)]" style={{ fontFamily: "'Comic Sans MS', 'Segoe Print', cursive" }}>
        Approve Nimal&apos;s leave?? still waiting…
      </div>
      <div className="absolute left-[70%] top-[34%] w-[18%] -rotate-6 bg-[#ffb8c9] p-3 text-[12px] font-medium leading-snug text-[#6a1030] shadow-[0_12px_20px_-10px_rgba(0,0,0,0.5)]" style={{ fontFamily: "'Comic Sans MS', 'Segoe Print', cursive" }}>
        OT figures don&apos;t match!
      </div>
      {/* email chain */}
      <div className="absolute left-[46%] top-[56%] w-[40%] -rotate-1 rounded-lg bg-white p-3 shadow-[0_18px_30px_-14px_rgba(0,0,0,0.45)]">
        <p className="text-[11px] font-semibold text-[#222]">RE: RE: RE: FW: Payroll for this month</p>
        <p className="mt-1 text-[10px] text-[#666]">Can someone send the latest version? I have three different ones…</p>
        <div className="mt-2 flex gap-1">
          {[1, 2, 3].map((k) => (
            <span key={k} className="rounded bg-[#eef2f7] px-1.5 py-0.5 text-[9px] text-[#456]">payroll_v{k + 4}.xlsx</span>
          ))}
        </div>
      </div>
      {/* the paper form */}
      <div className="absolute bottom-[4%] left-[6%] w-[30%] rotate-[-5deg] rounded-sm bg-[#fffdf7] p-3 shadow-[0_18px_30px_-14px_rgba(0,0,0,0.45)]">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#333]">Leave Request Form</p>
        <div className="mt-2 space-y-1.5">
          {[0, 1, 2].map((k) => (
            <span key={k} className="block h-[2px] bg-[#ccc]" />
          ))}
        </div>
        <span className="absolute -right-2 -top-3 rotate-12 rounded border-2 border-[#c0392b] px-1.5 text-[10px] font-bold text-[#c0392b]">PENDING</span>
      </div>
    </div>
  );
}

export default function CaseStudy() {
  const ref = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  /* % of the frame still showing "before"; reduced motion starts half and half */
  const [pos, setPos] = useState(() => (typeof window !== "undefined" && prefersReducedMotion() ? 50 : 88));
  const dragged = useRef(false);

  /* scroll sweeps the divider across, until the visitor takes over */
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (prefersReducedMotion()) return;
    const o = { p: 88 };
    const ctx = gsap.context(() => {
      gsap.to(o, {
        p: 8,
        ease: "none",
        scrollTrigger: { trigger: frameRef.current, start: "top 65%", end: "bottom 35%", scrub: 0.6 },
        onUpdate: () => {
          if (!dragged.current) setPos(o.p);
        },
      });
      gsap.fromTo("[data-cs-in]", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.08, ease: "expo.out", scrollTrigger: { trigger: root, start: "top 75%", once: true } });
    }, root);
    return () => ctx.revert();
  }, []);

  const drag = (e: React.PointerEvent) => {
    const frame = frameRef.current;
    if (!frame) return;
    dragged.current = true;
    const r = frame.getBoundingClientRect();
    setPos(Math.max(2, Math.min(98, ((e.clientX - r.left) / r.width) * 100)));
  };

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#080808] py-16 text-white lg:py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 50% at 70% 60%, rgba(232,59,0,0.2), transparent 70%)" }} />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p data-cs-in className="text-[13px] font-medium text-[#ff9a52]">Case study</p>
            <h2 data-cs-in className="font-spartan mt-3 max-w-2xl text-[2rem] font-semibold leading-[1.05] tracking-[-0.025em] sm:text-[2.6rem]">
              From manual HR to digital workforce management
            </h2>
          </div>
          <p data-cs-in className="max-w-xs text-[14px] text-white/55 lg:text-right">Drag the divider — or keep scrolling — to see what changed.</p>
        </div>

        {/* ── the comparison ── */}
        <div
          ref={frameRef}
          data-cs-in
          className="relative mt-10 aspect-[4/3] select-none overflow-hidden rounded-[26px] bg-[#fff6ee] ring-1 ring-white/10 sm:aspect-[16/10] lg:aspect-[1500/820]"
          onPointerDown={(e) => {
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
            drag(e);
          }}
          onPointerMove={(e) => e.buttons && drag(e)}
          style={{ touchAction: "pan-y" }}
        >
          {/* after */}
          <div className="absolute inset-0 flex items-start">
            <HrDashboard />
          </div>
          <span className="absolute bottom-4 right-4 rounded-full bg-[#141012] px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-lg">With Arrow HR</span>

          {/* before, clipped to the left of the divider */}
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
            <Collage />
            <span className="absolute bottom-4 left-4 rounded-full bg-white px-3.5 py-1.5 text-[12px] font-semibold text-[#333] shadow-lg">Before</span>
          </div>

          {/* the divider and its handle */}
          <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
            <span className="absolute inset-y-0 -left-px w-[3px] bg-white shadow-[0_0_20px_rgba(255,154,82,0.9)]" />
            <span className="pointer-events-auto absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#e83b00] text-white shadow-[0_10px_30px_-6px_rgba(232,59,0,0.9)] ring-4 ring-white/80">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
              </svg>
            </span>
          </div>
          <input
            type="range"
            min={2}
            max={98}
            value={Math.round(pos)}
            onChange={(e) => {
              dragged.current = true;
              setPos(Number(e.target.value));
            }}
            aria-label="Compare before and after"
            className="sr-only"
          />
        </div>

        {/* ── what changed, lighting as the divider passes ── */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PAIRS.map((p, i) => {
            const on = pos < 70 - i * 22;
            return (
              <div
                key={p.before}
                className={`rounded-[20px] p-5 ring-1 transition-all duration-500 ${on ? "bg-gradient-to-br from-[#2a140a] to-[#140a06] ring-[#ff8a3d]/50" : "bg-white/[0.03] ring-white/10"}`}
              >
                <p className={`text-[13px] line-through decoration-1 transition-colors duration-500 ${on ? "text-white/40" : "text-white/70"}`}>{p.before}</p>
                <p className={`font-spartan mt-2 flex items-center gap-2 text-[1.25rem] font-semibold transition-colors duration-500 ${on ? "text-white" : "text-white/40"}`}>
                  <span className={`h-2 w-2 rounded-full transition-colors duration-500 ${on ? "bg-[#ff8a3d] shadow-[0_0_12px_2px_rgba(255,138,61,0.8)]" : "bg-white/20"}`} />
                  {p.after}
                </p>
              </div>
            );
          })}
        </div>

        <p className="mt-10 max-w-xl text-sm leading-relaxed text-white/50">
          The figures behind this change belong to the customer, so they are not published here until they are verified with them.
        </p>
      </div>
    </section>
  );
}
