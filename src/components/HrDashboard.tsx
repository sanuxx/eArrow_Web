"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { QMarkLight } from "./ArrowMark";

/*
 * The Arrow HR "Main Dashboard", rebuilt in code from the product screenshot
 * (Products/HR and Payroll/Screenshot 2026-10-12 082440.png) so it can move.
 *
 * It is laid out once at the screenshot's own proportions (DESIGN_W wide) and
 * scaled to whatever width it is given, so it looks the same at every size
 * rather than reflowing into something the product never shows.
 *
 * GSAP, when it scrolls into view: the four stat cards rise in turn and count
 * up, their sparklines draw, both donuts sweep round segment by segment and the
 * department bars fill. The tab row is interactive — the dark pill slides to
 * whichever tab you point at.
 */

const DESIGN_W = 1500;
const DESIGN_H = 820;

const MENU = [
  "Employee Management",
  "Attendance",
  "Payroll",
  "Administration",
  "Master Data",
  "Data Uploads & Integration",
  "Reports & Analytics",
  "Training & Development",
  "Recruitment Management",
  "Asset Management",
  "Letter Management",
  "Approvals",
];

const TABS = ["Overview", "Attendance Management", "Leave Management", "Payroll Management"];

const CARDS = [
  { title: "Total employees", badge: "Active", value: 278, sub: "Active staff", from: "#c94a10", to: "#f0823a", spark: "area" },
  { title: "Present today", badge: "Today", value: 0, sub: "of 1 marked\ntoday", from: "#a3304a", to: "#e2566a", spark: "peak" },
  { title: "Pending leave", badge: "Action", value: 10, sub: "Awaiting\napproval", from: "#0c7a72", to: "#1aa597", spark: "peak" },
  { title: "Contracts ending", badge: "Soon", value: 1, sub: "Expiring soon", from: "#e9a527", to: "#f6c04a", spark: "drop", dark: true },
] as const;

const DEPTS = [
  { name: "Warehouse, Operations and Logistics Department", n: 91, c: "#f47a20" },
  { name: "Sales Department", n: 64, c: "#ef4f5f" },
  { name: "Administration Department", n: 34, c: "#22b8b0" },
  { name: "Credit Control and Customer Accounts depart", n: 31, c: "#8b5cf6" },
  { name: "Security Department", n: 11, c: "#f5a524" },
  { name: "Finance Department", n: 9, c: "#14b8c6" },
];
/* the long tail of small departments the donut shows as slivers */
const TAIL = [
  { n: 8, c: "#f97393" },
  { n: 7, c: "#fb923c" },
  { n: 6, c: "#10b981" },
  { n: 6, c: "#6366f1" },
  { n: 5, c: "#3b82f6" },
  { n: 4, c: "#94a3b8" },
  { n: 4, c: "#64748b" },
];
const SEGMENTS = [...DEPTS, ...TAIL];
const TOTAL = 278;
const GENDER = [
  { n: 46, c: "#f47a20" },
  { n: 232, c: "#7d6b63" },
];

const SPARK = {
  area: "M0 58 C 20 58, 22 30, 40 30 S 70 24, 90 24 S 120 12, 140 8",
  peak: "M0 60 L 90 60 C 104 60, 108 6, 116 6 S 126 60, 136 60 L 150 60",
  drop: "M0 4 C 12 4, 14 56, 34 58 L 150 58",
} as const;

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}
const ICONS = [
  "M7 8a2.5 2.5 0 1 0 0-.1M3 16c.6-2.4 2-3.6 4-3.6s3.4 1.2 4 3.6M13.5 9a2 2 0 1 0 0-.1M12.5 12.6c2 0 3.3 1 3.9 3.4",
  "M4 5h12v11H4zM4 8.5h12M7.5 3v3.5M12.5 3v3.5",
  "M4 4h12v12H4zM4 8h12M8 8v8",
  "M10 6.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2",
  "M4 6c0-1.4 2.7-2.5 6-2.5s6 1.1 6 2.5-2.7 2.5-6 2.5S4 7.4 4 6zM4 6v8c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V6M4 10c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5",
  "M6 13a3.5 3.5 0 1 1 .7-6.9A4.5 4.5 0 0 1 15 8a3 3 0 0 1-.5 5.9M10 10v6M7.8 12.2 10 10l2.2 2.2",
  "M4 16V10M8 16V5M12 16V8M16 16v-4M3 16h14",
  "M3 5h6a2 2 0 0 1 2 2v9a2 2 0 0 0-2-2H3zM17 5h-6",
  "M8.5 8a3 3 0 1 0 0-.1M3.5 16.5c.7-2.8 2.5-4.2 5-4.2M13 13.5a2 2 0 1 0 0-.1M16.5 17l-2-2",
  "M3 4h14v9H3zM7 16h6M10 13v3",
  "M3 5h14v10H3zM3 5l7 6 7-6",
  "M7 4h8v8M4 7h8v9H4z",
];

function Donut({ segments, total, size, width, data }: { segments: { n: number; c: string }[]; total: number; size: number; width: number; data: string }) {
  const r = (size - width) / 2;
  const C = 2 * Math.PI * r;
  const gap = segments.length > 2 ? 4 : 10;
  /* where each segment starts: the running total of those before it */
  const starts = segments.map((_, i) => segments.slice(0, i).reduce((a, s) => a + (s.n / total) * C, 0));
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="-rotate-90" aria-hidden>
      {segments.map((s, i) => {
        const len = Math.max(1, (s.n / total) * C - gap);
        const off = starts[i];
        return (
          <circle
            key={i}
            data-seg={data}
            data-len={len}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={s.c}
            strokeWidth={width}
            strokeDasharray={`${len} ${C}`}
            strokeDashoffset={-off}
          />
        );
      })}
    </svg>
  );
}

export default function HrDashboard() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  /* scale the fixed-size layout to the box it is given */
  useEffect(() => {
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    if (!wrap || !stage) return;
    const fit = () => {
      const k = wrap.clientWidth / DESIGN_W;
      stage.style.transform = `scale(${k})`;
      wrap.style.height = `${DESIGN_H * k}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || prefersReducedMotion()) return;
    const q = gsap.utils.selector(stage);

    const ctx = gsap.context(() => {
      const counters = q("[data-num]") as HTMLElement[];
      counters.forEach((c) => (c.textContent = "0"));

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "expo.out" },
      });
      tl.fromTo("[data-side-item]", { x: -24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, stagger: 0.03 }, 0)
        .fromTo("[data-head]", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.06 }, 0.1)
        .fromTo("[data-card]", { y: 40, opacity: 0, scale: 0.94 }, { y: 0, opacity: 1, scale: 1, duration: 1, stagger: 0.1 }, 0.25)
        .fromTo("[data-spark]", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, stagger: 0.1, ease: "power2.inOut" }, 0.6)
        .fromTo("[data-spark-fill]", { opacity: 0 }, { opacity: 1, duration: 1, stagger: 0.1 }, 1)
        .fromTo("[data-panel]", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.12 }, 0.55)
        .fromTo("[data-bar]", { scaleX: 0 }, { scaleX: 1, duration: 1.1, stagger: 0.07, ease: "power3.out" }, 0.9);

      /* counters */
      counters.forEach((c, i) => {
        const o = { v: 0 };
        tl.to(o, { v: Number(c.dataset.num), duration: 1.4, ease: "power3.out", onUpdate: () => (c.textContent = String(Math.round(o.v))) }, 0.45 + i * 0.08);
      });

      /* donuts sweep round, segment after segment */
      ["dept", "gender"].forEach((key, k) => {
        const segs = Array.from(stage.querySelectorAll<SVGCircleElement>(`[data-seg="${key}"]`));
        let t = 0.75 + k * 0.2;
        segs.forEach((s) => {
          const len = Number(s.dataset.len);
          const C = s.getAttribute("stroke-dasharray")!.split(" ")[1];
          const d = Math.max(0.06, (len / 900) * 1.2);
          tl.fromTo(s, { attr: { "stroke-dasharray": `0 ${C}` } }, { attr: { "stroke-dasharray": `${len} ${C}` }, duration: d, ease: "none" }, t);
          t += d;
        });
      });

      gsap.to({}, {
        scrollTrigger: { trigger: stage, start: "top 78%", once: true, onEnter: () => tl.play() },
      });

      /* tabs: the dark pill follows the pointer */
      const pill = q("[data-pill]")[0] as HTMLElement;
      const tabs = q("[data-tab]") as HTMLElement[];
      const place = (t: HTMLElement, instant?: boolean) => {
        const vars = { x: t.offsetLeft, width: t.offsetWidth, duration: instant ? 0 : 0.55, ease: "power3.out" };
        gsap.to(pill, vars);
        tabs.forEach((x) => x.classList.toggle("is-on", x === t));
      };
      place(tabs[0], true);
      const offs = tabs.map((t) => {
        const fn = () => place(t);
        t.addEventListener("mouseenter", fn);
        return () => t.removeEventListener("mouseenter", fn);
      });
      const row = q("[data-tabs]")[0] as HTMLElement;
      const back = () => place(tabs[0]);
      row.addEventListener("mouseleave", back);

      /* cards lift toward the pointer */
      const cards = (q("[data-card]") as HTMLElement[]).map((c) => {
        const enter = () => gsap.to(c, { y: -8, duration: 0.4, ease: "power3.out" });
        const leave = () => gsap.to(c, { y: 0, duration: 0.5, ease: "power3.out" });
        c.addEventListener("mouseenter", enter);
        c.addEventListener("mouseleave", leave);
        return () => {
          c.removeEventListener("mouseenter", enter);
          c.removeEventListener("mouseleave", leave);
        };
      });

      return () => {
        offs.forEach((f) => f());
        cards.forEach((f) => f());
        row.removeEventListener("mouseleave", back);
      };
    }, stage);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full overflow-hidden rounded-[22px] shadow-[0_40px_90px_-40px_rgba(194,46,0,0.55)] ring-1 ring-black/5">
      <div
        ref={stageRef}
        className="absolute left-0 top-0 flex origin-top-left font-[family-name:var(--font-body)]"
        style={{ width: DESIGN_W, height: DESIGN_H, background: "linear-gradient(180deg,#fff1e3 0%,#fff6ee 40%,#fff8f2 100%)" }}
      >
        {/* ── Sidebar ── */}
        <aside
          className="relative flex h-full w-[300px] shrink-0 flex-col rounded-r-[34px] text-white"
          style={{ background: "linear-gradient(180deg,#ef5a12 0%,#d24a10 40%,#a33a10 75%,#5a1f0a 100%)" }}
        >
          <div className="flex h-[72px] items-center gap-4 border-b border-white/15 px-6">
            <span className="flex h-10 w-10 items-center justify-center">
              <QMarkLight className="h-auto w-9 opacity-90" />
            </span>
            <span className="text-[19px] font-extrabold tracking-wide">
              ARROW <span className="text-[#ffcfa8]">HR</span>
            </span>
            <span className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm">‹</span>
          </div>
          <p className="px-6 pb-3 pt-7 text-[11px] font-bold tracking-[0.2em] text-white/80">MENU</p>
          <div className="px-4">
            <div data-side-item className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold">
              <Icon d="M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14M10 10l3-3" />
              Dashboards
              <span className="ml-auto text-white/60">‹</span>
            </div>
            <div data-side-item className="ml-6 mt-1 rounded-xl bg-white/15 px-3 py-2 text-[12.5px] font-semibold">Admin Dashboard</div>
            {MENU.map((m, i) => (
              <div key={m} data-side-item className="mt-1 flex items-center gap-3 rounded-xl px-3 py-[9px] text-[13px] font-semibold text-white/95">
                <Icon d={ICONS[i % ICONS.length]} />
                <span className="truncate">{m}</span>
                <span className="ml-auto text-white/55">›</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="relative min-w-0 flex-1 px-8">
          {/* top bar */}
          <div className="flex h-[72px] items-center justify-end gap-6 text-[#2b2b33]">
            {["M15 11.5A6 6 0 0 1 8.5 5a6 6 0 1 0 6.5 6.5", "M10 3a7 7 0 1 0 0 14c1 0 1.5-.8 1-1.7-.5-.9 0-1.8 1-1.8h1.5A3.5 3.5 0 0 0 17 10a7 7 0 0 0-7-7M6.5 9.5h.01M9 6.5h.01M13 7.5h.01", "M3 7V3h4M13 3h4v4M17 13v4h-4M7 17H3v-4", "M5 13V9a5 5 0 0 1 10 0v4l1.5 2h-13zM8.5 17.5h3"].map((d, i) => (
              <Icon key={i} d={d} />
            ))}
            <span className="h-6 w-px bg-black/10" />
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef1f7]">
              <Icon d="M10 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6M4 17c.8-3 3-4.5 6-4.5s5.2 1.5 6 4.5" />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-[#f47a20]" />
            </span>
          </div>

          <h4 data-head className="mt-3 text-[30px] font-extrabold tracking-[-0.02em] text-[#1d1d26]">Main Dashboard</h4>
          <p data-head className="mt-1 text-[15px] text-[#6a6a75]">
            Dashboards <span className="mx-2">›</span> Main Dashboard
          </p>

          {/* tabs */}
          <div data-head data-tabs className="relative mt-7 flex gap-3">
            <span data-pill className="absolute left-0 top-0 h-full rounded-full bg-[#3a1206] shadow-[0_10px_24px_-8px_rgba(58,18,6,0.6)]" style={{ width: 172 }} />
            {TABS.map((t, i) => (
              <span
                key={t}
                data-tab
                className={`hr-tab relative z-10 flex cursor-default items-center gap-2 rounded-full px-5 py-3 text-[15px] font-semibold ${i ? "bg-white" : ""}`}
              >
                <span className="h-4 w-4 rounded-[4px] border-2 border-current opacity-90" />
                {t}
              </span>
            ))}
          </div>

          {/* stat cards */}
          <div className="mt-7 grid grid-cols-4 gap-5">
            {CARDS.map((c) => (
              <div
                key={c.title}
                data-card
                className={`relative h-[200px] overflow-hidden rounded-[24px] p-5 ${"dark" in c ? "text-[#2a1a05]" : "text-white"}`}
                style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
              >
                <span className="absolute -bottom-16 -right-14 h-52 w-52 rounded-full bg-white/15" />
                <div className="relative flex items-center gap-2.5">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${"dark" in c ? "" : "bg-white/20"}`}>
                    <Icon d="M7 8a2.5 2.5 0 1 0 0-.1M3 16c.6-2.4 2-3.6 4-3.6s3.4 1.2 4 3.6" />
                  </span>
                  <span className="text-[15px] font-bold">{c.title}</span>
                  <span className={`ml-auto rounded-full px-2.5 py-1 text-[12px] font-bold ${"dark" in c ? "bg-black/10" : "bg-white/20"}`}>{c.badge}</span>
                </div>
                <p className="relative mt-4 text-[44px] font-extrabold leading-none">
                  <span data-num={c.value}>{c.value}</span>
                </p>
                <p className="relative mt-3 whitespace-pre-line text-[14px] font-medium opacity-90">{c.sub}</p>
                <svg viewBox="0 0 150 64" className="absolute bottom-5 right-4 h-[56px] w-[130px] overflow-visible" aria-hidden>
                  {c.spark === "area" && (
                    <path data-spark-fill d={`${SPARK.area} L 140 64 L 0 64 Z`} fill="rgba(255,255,255,0.25)" />
                  )}
                  <path
                    data-spark
                    d={SPARK[c.spark]}
                    pathLength={1}
                    strokeDasharray="1"
                    fill="none"
                    stroke={"dark" in c ? "#2a1a05" : "#fff"}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            ))}
          </div>

          {/* panels */}
          <div className="mt-5 grid grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] gap-4">
            <div data-panel className="h-[420px] rounded-[24px] bg-white p-6 shadow-[0_10px_30px_-20px_rgba(150,60,0,0.4)]">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff1e6] text-[#d24a10]">
                  <Icon d="M5 17V4h10v13M8 7h1M11 7h1M8 10h1M11 10h1M8 13h4v4" />
                </span>
                <span className="text-[19px] font-bold text-[#1d1d26]">Headcount by Department</span>
              </div>
              <div className="mt-5 flex items-start gap-8">
                <div className="relative shrink-0">
                  <Donut segments={SEGMENTS} total={TOTAL} size={260} width={34} data="dept" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[44px] font-extrabold leading-none text-[#c2410c]" data-num={TOTAL}>
                      {TOTAL}
                    </span>
                    <span className="mt-1 text-[16px] text-[#8a8a94]">Total</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1 space-y-3.5 pt-1">
                  {DEPTS.map((d) => (
                    <div key={d.name}>
                      <div className="flex items-center gap-2.5 text-[14.5px] text-[#2b2b33]">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.c }} />
                        <span className="truncate">{d.name}</span>
                        <span className="ml-auto font-semibold">{d.n}</span>
                      </div>
                      <div className="mt-1.5 h-[4px] rounded-full bg-[#e9e9ee]">
                        <div data-bar className="h-full origin-left rounded-full" style={{ width: `${(d.n / 91) * 100}%`, background: d.c }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div data-panel className="h-[420px] rounded-[24px] bg-white p-6 shadow-[0_10px_30px_-20px_rgba(150,60,0,0.4)]">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff1e6] text-[#d24a10]">
                  <Icon d="M7 8a2.5 2.5 0 1 0 0-.1M3 16c.6-2.4 2-3.6 4-3.6s3.4 1.2 4 3.6M13.5 9a2 2 0 1 0 0-.1M12.5 12.6c2 0 3.3 1 3.9 3.4" />
                </span>
                <span className="text-[19px] font-bold leading-tight text-[#1d1d26]">Total Employees / Gender Distribution</span>
              </div>
              <div className="relative mx-auto mt-6 w-fit">
                <Donut segments={GENDER} total={TOTAL} size={250} width={30} data="gender" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[44px] font-extrabold leading-none text-[#c2410c]" data-num={TOTAL}>
                    {TOTAL}
                  </span>
                  <span className="mt-1 text-[16px] text-[#8a8a94]">Total</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
