"use client";

import { useEffect, useRef } from "react";
import { PageCta } from "@/components/page-kit";
import { INDUSTRY_ICONS, type IndustryIconKey } from "@/components/industry-icons";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { withBasePath } from "@/lib/basePath";

/*
 * Industries — a flight down a tunnel of frames (see Tunnel below). Each
 * sector comes up out of the depth with the systems it runs on, while
 * screenshots of those systems pass on the walls around it.
 *
 * Product fit per sector is our suggested starting point, not a claim about
 * any specific client.
 */

type Industry = {
  icon: IndustryIconKey;
  name: string;
  line: string;
  needs: string[];
  products: string[];
  shots: string[];
};

const INDUSTRIES: Industry[] = [
  {
    icon: "corporate",
    name: "Corporate",
    line: "Connected HR, finance and service operations across every function.",
    needs: ["One employee record", "Approvals that move", "Service desk with SLAs"],
    products: ["HR & Payroll", "Workflow", "Ticketing", "CRM"],
    shots: ["workforce/1", "workflow/1"],
  },
  {
    icon: "education",
    name: "Education",
    line: "Admissions, academics, attendance and fees on a single platform.",
    needs: ["Enquiry to enrolment", "Fees and results", "Parents kept informed"],
    products: ["Higher Education", "School Management", "Uni Connect"],
    shots: ["education/1", "school/1"],
  },
  {
    icon: "healthcare",
    name: "Healthcare",
    line: "Rosters, payroll and service requests for teams that never close.",
    needs: ["Shift-based payroll", "Internal service requests", "Auditable approvals"],
    products: ["HR & Payroll", "Ticketing", "Workflow"],
    shots: ["workforce/2", "ticketing/1"],
  },
  {
    icon: "financial",
    name: "Financial Services",
    line: "Auditable workflows, controlled access and dependable reporting.",
    needs: ["Every decision on record", "Client pipeline", "Escalations by SLA"],
    products: ["Workflow", "CRM", "Ticketing"],
    shots: ["workflow/2", "crm/1"],
  },
  {
    icon: "manufacturing",
    name: "Manufacturing",
    line: "Workforce, attendance and approvals across sites and shifts.",
    needs: ["Attendance across sites", "Overtime that adds up", "Purchase approvals"],
    products: ["HR & Payroll", "Workflow"],
    shots: ["workforce/1", "workflow/1"],
  },
  {
    icon: "retail",
    name: "Retail",
    line: "Customer relationships, store teams and the requests between them.",
    needs: ["Customer pipeline", "Store staff payroll", "Head-office requests"],
    products: ["CRM", "HR & Payroll", "Ticketing"],
    shots: ["crm/2", "workforce/2"],
  },
  {
    icon: "government",
    name: "Government",
    line: "Secure, transparent systems built for public accountability.",
    needs: ["Transparent approvals", "Citizen service requests", "Controlled access"],
    products: ["Workflow", "Ticketing", "HR & Payroll"],
    shots: ["workflow/2", "ticketing/2"],
  },
  {
    icon: "enterprise",
    name: "Other Enterprises",
    line: "Tell us how you operate and we'll shape the stack around it.",
    needs: ["Your process, mapped", "Only what you need", "Room to grow"],
    products: ["Any of the seven", "Configured to fit"],
    shots: ["uniconnect/1", "crm/1"],
  },
];

const shot = (s: string) => withBasePath(`/products/${s}.webp`);

/* ───────────────────────────── Tunnel ─────────────────────────────
 *
 * A corridor of frames receding to one vanishing point, with the headline
 * floating in its mouth. Scrolling flies the camera forward: each sector
 * comes up out of the depth with the systems it runs on, while screenshots of
 * those systems pass on the walls, floor and ceiling around it.
 *
 * It is real CSS 3D — one perspective, one `preserve-3d` world — so every
 * plane foreshortens correctly without any per-frame maths for geometry. Per
 * frame GSAP writes exactly one transform (the world's translateZ, i.e. the
 * camera) plus an opacity per plane for fog and culling. The frames are NOT
 * 3D layers — thirty full-screen bordered planes were most of the cost — they
 * are stroked onto one canvas each frame from the same projection maths
 * (scale = P / (P − z)). The converging corner lines are a static SVG: with
 * the camera only moving along z they never change on screen.
 *
 * Wall orientations, so each screenshot faces the camera and reads upright:
 *   left   rotateY(90deg)   from its near edge, extending away
 *   right  rotateY(-90deg)  from its far edge, extending toward the camera
 *   floor  rotateX(90deg)   from its far edge, extending toward the camera
 *   ceil   rotateX(-90deg)  from its near edge, extending away
 */

const P = 1000; // perspective, px
const SPACING = 2200; // depth between sectors
const RING_GAP = 650; // depth between frames
const PRODUCT_SHOT: Record<string, string> = {
  "HR & Payroll": "workforce",
  Workflow: "workflow",
  Ticketing: "ticketing",
  CRM: "crm",
  "Higher Education": "education",
  "School Management": "school",
  "Uni Connect": "uniconnect",
};
const PRODUCT_FULL: Record<string, string> = {
  "HR & Payroll": "Arrow HR & Payroll",
  Workflow: "Arrow Workflow Management System",
  Ticketing: "Arrow Ticketing System",
  CRM: "Arrow CRM",
  "Higher Education": "Arrow Higher Education Management System",
  "School Management": "Arrow School Management System",
  "Uni Connect": "Arrow Uni Connect",
};
type Wall = "left" | "right";

/* The systems shown for a sector: its named products, or — for "any of the
   seven" — a spread across the catalogue. */
const systemsFor = (ind: Industry) => {
  const named = ind.products.filter((p) => PRODUCT_SHOT[p]);
  return named.length ? named : ["CRM", "Workflow", "Uni Connect"];
};

const STATIONS = INDUSTRIES.map((ind, i) => ({ ind, z: -(i + 1) * SPACING }));
const DEPTH = (INDUSTRIES.length + 1) * SPACING + 1600;

/* A device on the wall, built in 3D.

   Everything here sits inside a preserve-3d chain (figure → door → parts), so
   nothing in that chain may take opacity, overflow or a filter — any of those
   flattens it. Fog is applied per leaf through the --fog variable instead
   (`.fogp`). Local +z points out of the wall, toward the tunnel's centre.

     body    bezel and screen, on the door plane
     shell   the back, 16px behind, and its side at the free end
     deck    laptop keyboard deck / monitor foot, folded out of the wall
     phone   (HR) the mobile app, standing 70px proud of the screen */
const DW = 900; // device depth along the wall
const DH = 520;

function Device({ kind, src, phone, wall }: { kind: "laptop" | "monitor"; src: string; phone?: boolean; wall: Wall }) {
  const lap = kind === "laptop";
  const bodyH = lap ? DH - 14 : DH - 96;
  const bodyW = lap ? DW * 0.88 : DW * 0.9;
  const left = (DW - bodyW) / 2;
  const free = wall === "left" ? left + bodyW : left; // the end away from the hinge
  const alu = "linear-gradient(180deg,#eef0f3 0%,#d9dce1 45%,#c3c7ce 100%)";
  return (
    <>
      {/* ── shell: the aluminium back and its side edge ── */}
      <div className="fogp absolute rounded-[24px]" style={{ left, top: 0, width: bodyW, height: bodyH, transform: "translateZ(-14px)", background: alu }} />
      <div
        className="fogp absolute"
        style={{
          left: wall === "left" ? free : free - 14,
          top: 12,
          width: 14,
          height: bodyH - 24,
          transformOrigin: wall === "left" ? "0 50%" : "100% 50%",
          transform: wall === "left" ? "rotateY(90deg)" : "rotateY(-90deg)",
          background: "linear-gradient(90deg,#f5f6f8,#b9bdc4)",
        }}
      />

      {/* ── display: aluminium rim → black glass bezel → screen ── */}
      <div className="fogp absolute rounded-[24px] p-[3px]" style={{ left, top: 0, width: bodyW, height: bodyH, background: "linear-gradient(135deg,#f7f8fa,#b8bcc3 60%,#e4e6ea)" }}>
        <div className="relative h-full overflow-hidden rounded-[21px] bg-[#0a0a0b]" style={{ padding: lap ? "16px 16px 30px" : "14px" }}>
          {/* camera */}
          {lap ? (
            <span className="absolute left-1/2 top-0 flex h-[16px] w-[86px] -translate-x-1/2 items-center justify-center rounded-b-[9px] bg-black">
              <span className="h-[6px] w-[6px] rounded-full bg-[#1b2633] ring-1 ring-[#2c3a4c]" />
            </span>
          ) : (
            <span className="absolute left-1/2 top-[4px] h-[6px] w-[6px] -translate-x-1/2 rounded-full bg-[#1b2633]" />
          )}
          <div className="relative h-full overflow-hidden rounded-[6px] bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" loading="lazy" draggable={false} className="h-full w-full object-cover object-left-top" />
            {/* glass: a soft diagonal glare and a faint inner edge */}
            <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.06)_30%,rgba(255,255,255,0)_46%)]" />
            <span className="pointer-events-none absolute inset-0 rounded-[6px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]" />
          </div>
          {lap && <span className="absolute bottom-[8px] left-1/2 -translate-x-1/2 text-[11px] font-semibold tracking-[0.18em] text-[#4a4a50]">eArrow</span>}
        </div>
      </div>

      {lap ? (
        <>
          {/* hinge */}
          <div className="fogp absolute rounded-b-[6px]" style={{ left: left + 30, top: bodyH, width: bodyW - 60, height: 10, background: "linear-gradient(180deg,#3a3c41,#16171a)" }} />
          {/* keyboard deck, folded out of the wall */}
          <div
            className="fogp absolute overflow-hidden rounded-b-[26px] rounded-t-[6px]"
            style={{ left: left - 22, top: bodyH + 10, width: bodyW + 44, height: 330, transformOrigin: "50% 0", transform: "rotateX(82deg)", background: alu }}
          >
            {/* speaker grilles */}
            {[0, 1].map((k) => (
              <span
                key={k}
                className="absolute top-[7%] h-[48%] w-[7%]"
                style={{ [k ? "right" : "left"]: "3%", backgroundImage: "radial-gradient(#8e939b 1.1px, transparent 1.4px)", backgroundSize: "7px 7px" }}
              />
            ))}
            {/* keyboard well with key rows */}
            <div className="absolute left-[12%] right-[12%] top-[7%] h-[50%] rounded-[10px] bg-[#1c1d20] p-[6px] shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)]">
              <div className="flex h-full flex-col gap-[5px]">
                {[14, 14, 13, 12, 9].map((n, r) => (
                  <div key={r} className="flex flex-1 gap-[5px]">
                    {Array.from({ length: n }).map((_, c) => (
                      <span
                        key={c}
                        className="flex-1 rounded-[4px] bg-gradient-to-b from-[#2b2c30] to-[#18191c] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                        style={r === 4 && c === 4 ? { flexGrow: 6 } : undefined}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            {/* trackpad */}
            <div className="absolute bottom-[7%] left-1/2 h-[30%] w-[34%] -translate-x-1/2 rounded-[12px] bg-gradient-to-b from-[#e2e5e9] to-[#cfd3d9] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.7)]" />
            {/* front lip */}
            <span className="absolute inset-x-0 bottom-0 h-[5px] bg-gradient-to-b from-[#b4b8bf] to-[#8d9199]" />
          </div>
          {/* contact shadow on the wall beneath */}
          <div className="fogp absolute" style={{ left: left - 10, top: bodyH + 14, width: bodyW + 20, height: 60, background: "radial-gradient(ellipse at 50% 0%, rgba(40,30,20,0.22), transparent 70%)" }} />
        </>
      ) : (
        <>
          {/* stand: an aluminium arm, then a foot that sits out from the wall */}
          <div className="fogp absolute" style={{ left: DW / 2 - 70, top: bodyH, width: 140, height: 96, background: "linear-gradient(90deg,#b7bbc2,#eef0f3 45%,#c9ccd2 70%,#a9adb4)", clipPath: "polygon(8% 0,92% 0,100% 100%,0 100%)" }} />
          <div
            className="fogp absolute rounded-[14px]"
            style={{ left: DW / 2 - 170, top: bodyH + 96, width: 340, height: 210, transformOrigin: "50% 0", transform: "rotateX(84deg)", background: "linear-gradient(180deg,#f1f2f5,#c3c7ce)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)" }}
          />
          <div className="fogp absolute" style={{ left: DW / 2 - 200, top: bodyH + 88, width: 400, height: 50, background: "radial-gradient(ellipse at 50% 20%, rgba(40,30,20,0.25), transparent 70%)" }} />
        </>
      )}

      {phone && (
        /* the phone, standing proud of the screen: titanium frame, buttons, island */
        <div className="fogp absolute" style={{ height: DH * 0.8, top: DH * 0.1, left: wall === "left" ? DW * 0.05 : DW * 0.7, aspectRatio: "9 / 19.5", transform: "translateZ(80px)" }}>
          <span className="absolute -left-[3px] top-[18%] h-[7%] w-[3px] rounded-l bg-[#9a9ea6]" />
          <span className="absolute -left-[3px] top-[28%] h-[11%] w-[3px] rounded-l bg-[#9a9ea6]" />
          <span className="absolute -right-[3px] top-[24%] h-[14%] w-[3px] rounded-r bg-[#9a9ea6]" />
          <div className="h-full w-full rounded-[34px] p-[3px]" style={{ background: "linear-gradient(135deg,#e9eaed,#8f939b 50%,#d5d7db)" }}>
            <div className="relative h-full w-full overflow-hidden rounded-[31px] bg-black p-[6px]">
              <div className="relative h-full overflow-hidden rounded-[26px] bg-[#f3f6fd]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={withBasePath("/products/mobile/hr-app.webp")} alt="" loading="lazy" draggable={false} className="w-full" />
                <span className="absolute left-1/2 top-[8px] h-[16px] w-[52px] -translate-x-1/2 rounded-full bg-black" />
                <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.25),rgba(255,255,255,0)_40%)]" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ───────────────────────── Mobile: stacked cards ─────────────────────────
 *
 * The tunnel needs a wide frame — on a phone its walls are a few pixels
 * apart. So small screens get a different film: each sector is a full card
 * that pins near the top while the next one slides up over it, and the card
 * underneath shrinks back and dims, like a deck being dealt. Inside each card
 * the device rises and the copy staggers in as it arrives. One ScrollTrigger
 * per card, transforms and opacity only.
 */

function MobileDeck() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    mm.add("(max-width: 767px)", () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-mcard]", root);
      gsap.fromTo("[data-m-h]", { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, stagger: 0.08, ease: "expo.out" });
      gsap.fromTo("[data-m-copy]", { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, delay: 0.35, ease: "expo.out" });
      cards.forEach((card, i) => {
        const inner = card.querySelector<HTMLElement>("[data-mcard-inner]")!;
        /* arrive: the industry leads — its panel wipes open, the name rises,
           then what it needs, then the systems it runs on slide in */
        gsap
          .timeline({ scrollTrigger: { trigger: card, start: "top 80%", once: true } })
          .fromTo(card.querySelector("[data-m-hero]"), { clipPath: "inset(0% 0% 100% 0% round 22px)" }, { clipPath: "inset(0% 0% 0% 0% round 22px)", duration: 1, ease: "power4.inOut" })
          .fromTo(card.querySelectorAll("[data-m-name]"), { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: "expo.out" }, 0.4)
          .fromTo(card.querySelectorAll("[data-m-txt]"), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.07, ease: "power3.out" }, 0.55)
          .fromTo(card.querySelectorAll("[data-m-sys]"), { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: "expo.out" }, 0.8);
        /* leave: as the next card slides over, this one sinks back */
        const next = cards[i + 1];
        if (next) {
          /* the card stays opaque — a veil dims it — so nothing shows through
             the card sliding over it */
          const st = { trigger: next, start: "top 75%", end: "top 90px", scrub: 0.3 };
          gsap.to(inner, { scale: 0.92, ease: "none", scrollTrigger: st });
          gsap.to(inner.querySelector("[data-m-veil]"), { opacity: 0.6, ease: "none", scrollTrigger: { ...st } });
        }
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={ref} className="ind-tunnel bg-canvas px-4 pb-16 pt-28">
      <div className="text-center">
        <h1 className="font-spartan text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.035em] text-ink">
          <span className="block overflow-hidden pb-[0.06em]">
            <span data-m-h className="ind-fade block">Built for</span>
          </span>
          <span className="block overflow-hidden pb-[0.08em]">
            <span data-m-h className="ind-fade block">every industry.</span>
          </span>
        </h1>
        <p data-m-copy className="ind-fade mx-auto mt-4 max-w-xs text-[15px] leading-relaxed text-ink-muted">
          The same connected ecosystem, configured for the way each sector <span className="text-orange">actually works</span>.
        </p>
      </div>

      <div className="mt-10">
        {INDUSTRIES.map((ind, i) => {
          const Icon = INDUSTRY_ICONS[ind.icon];
          const sys = systemsFor(ind);
          return (
            <article key={ind.name} id={`ind-${i}`} data-mcard className="sticky top-[78px] mb-6 scroll-mt-24">
              <div
                data-mcard-inner
                className="relative origin-top overflow-hidden rounded-[28px] border border-border bg-surface p-2.5 pb-4 shadow-[0_20px_50px_-26px_rgba(120,40,0,0.45)]"
              >
                <span data-m-veil aria-hidden className="pointer-events-none absolute inset-0 z-10 bg-canvas-alt opacity-0" />
                {/* ── the industry ── */}
                <div
                  data-m-hero
                  className="relative overflow-hidden rounded-[22px] px-5 pb-6 pt-5 text-white"
                  style={{ background: "radial-gradient(ellipse 90% 80% at 100% 0%, #ff8a3d, #e83b00 45%, #8f2300 100%)" }}
                >
                  {/* the sector's icon, huge, as a watermark */}
                  <Icon className="pointer-events-none absolute -bottom-6 -right-6 h-40 w-40 text-white/15" />
                  <p className="relative mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">Industry</p>
                  <h2 className="font-spartan relative mt-1 overflow-hidden pb-[0.06em] text-[2.3rem] font-semibold leading-[1.02] tracking-[-0.025em]">
                    <span data-m-name className="block">{ind.name}</span>
                  </h2>
                  <p data-m-txt className="relative mt-3 text-[14.5px] leading-relaxed text-white/85">{ind.line}</p>
                </div>

                {/* what the sector needs */}
                <ul className="mt-5 space-y-2.5 px-1">
                  {ind.needs.map((n) => (
                    <li key={n} data-m-txt className="flex items-center gap-3 text-[14px] font-medium text-ink">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange/12 text-orange">
                        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M3.5 8.4l2.8 2.8 6.2-6.4" />
                        </svg>
                      </span>
                      {n}
                    </li>
                  ))}
                </ul>

                {/* ── then the systems it runs on ── */}
                <p data-m-txt className="mt-6 px-1 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-ink-soft">Runs on</p>
                <div className="mt-2.5 space-y-2">
                  {sys.map((p) => (
                    <div key={p} data-m-sys className="flex items-center gap-3 rounded-2xl border border-border bg-surface-sunken p-2 pr-3">
                      <span className="relative h-11 w-[68px] shrink-0 overflow-hidden rounded-lg bg-surface-sunken ring-1 ring-black/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={shot(`${PRODUCT_SHOT[p]}/1-sm`)} alt="" loading="lazy" className="h-full w-full object-cover object-left-top" />
                      </span>
                      <span className="min-w-0 flex-1 text-[13px] font-semibold leading-tight text-ink">{PRODUCT_FULL[p]}</span>
                      <span aria-hidden className="text-orange">→</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Tunnel() {
  const trackRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    /* phones get MobileDeck instead; the tunnel never starts there */
    if (!track || prefersReducedMotion() || window.matchMedia("(max-width: 767px)").matches) return;
    const q = gsap.utils.selector(track);
    const world = q("[data-world]")[0] as HTMLElement;
    const cam = q("[data-cam]")[0] as HTMLElement;

    /* every plane that fogs and culls, with its depth */
    const planes = (q("[data-z]") as HTMLElement[]).map((el) => ({
      el,
      z: Number(el.dataset.z),
      kind: el.dataset.kind as "shot" | "text" | "title",
      set:
        el.dataset.kind === "shot"
          ? (v: number) => el.style.setProperty("--fog", String(v))
          : gsap.quickSetter(el, "opacity"),
      shown: true,
    }));
    /* the doors: each device swings out of the wall as it approaches */
    const doors = (q("[data-door]") as HTMLElement[]).map((el) => ({
      z: Number(el.dataset.door),
      sign: el.dataset.wall === "left" ? -1 : 1,
      set: gsap.quickSetter(el, "rotationY", "deg"),
      last: -1,
    }));
    const canvas = q("[data-rings]")[0] as HTMLCanvasElement;
    const c2d = canvas.getContext("2d")!;
    let cw = 0;
    let ch = 0;
    let RX = 0;
    let RY = 0;
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw = canvas.clientWidth;
      ch = canvas.clientHeight;
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      RX = Math.min(cw * 0.42, 760);
      RY = ch * 0.42;
    };
    size();
    const drawRings = (s: number) => {
      c2d.clearRect(0, 0, cw, ch);
      const dark = document.documentElement.dataset.theme === "dark";
      c2d.lineWidth = 1;
      for (let z = 0; z > -DEPTH; z -= RING_GAP) {
        const eff = z + s;
        if (eff > P * 0.9 || eff < -5400) continue;
        const k = P / (P - eff);
        const a = Math.min(1, (eff + 5400) / 1800) * (eff > 200 ? Math.max(0, 1 - (eff - 200) / 500) : 1);
        c2d.strokeStyle = `rgba(${dark ? "90,86,84" : "214,206,199"},${a.toFixed(3)})`;
        c2d.strokeRect(cw / 2 - RX * k + 0.5, ch / 2 - RY * k + 0.5, 2 * RX * k, 2 * RY * k);
      }
    };
    const hud = q("[data-hud]")[0] as HTMLElement;
    const hudName = q("[data-hud-name]")[0] as HTMLElement;
    const hudBar = q("[data-hud-bar]")[0] as HTMLElement;
    let station = -1;

    const fog = (kind: string, eff: number) => {
      if (eff > P * 0.6) return 0; // at or behind the lens
      if (kind === "text") {
        if (eff < -1500) return 0;
        if (eff < -650) return (eff + 1500) / 850;
        if (eff < 60) return 1;
        return Math.max(0, 1 - (eff - 60) / 260);
      }
      if (kind === "title") return Math.max(0, 1 - Math.max(0, eff) / 320);
      const far = 2300;
      if (eff < -far) return 0;
      const fadeIn = Math.min(1, (eff + far) / 1000);
      const fadeOut = eff > -60 ? Math.max(0, 1 - (eff + 60) / 300) : 1;
      return fadeIn * fadeOut;
    };

    const render = (s: number) => {
      gsap.set(world, { z: s });
      drawRings(s);
      /* devices stay out of the title shot until the flight has begun */
      const gate = Math.min(1, Math.max(0, (s - 120) / 520));
      planes.forEach((p) => {
        const o = fog(p.kind, p.z + s) * (p.kind === "shot" ? gate : 1);
        p.set(o);
        const vis = o > 0.002;
        if (vis !== p.shown) {
          p.shown = vis;
          p.el.style.visibility = vis ? "visible" : "hidden";
        }
      });
      doors.forEach((d) => {
        const t = Math.min(1, Math.max(0, (d.z + s + 2000) / 1500));
        const e = t * t * (3 - 2 * t); // smoothstep
        const a = Math.round(e * 200) / 10;
        if (a !== d.last) {
          d.last = a;
          d.set(d.sign * a);
        }
      });
      /* which sector is in front */
      const idx = Math.min(STATIONS.length - 1, Math.max(-1, Math.floor((s + 1100) / SPACING) - 1));
      if (idx !== station) {
        station = idx;
        gsap.to(hud, { autoAlpha: idx >= 0 ? 1 : 0, duration: 0.4 });
        if (idx >= 0) {
          hudName.textContent = STATIONS[idx].ind.name;
        }
      }
    };

    const ctx = gsap.context(() => {
      const cameraZ = { s: 0 };
      const end = -STATIONS[STATIONS.length - 1].z - 300;

      /* entrance: the corridor drops in, the title rises */
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .fromTo([cam, canvas], { opacity: 0 }, { opacity: 1, duration: 1.4, ease: "power2.out" }, 0)
        .fromTo("[data-t]", { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.08 }, 0.25)
        .fromTo("[data-t-copy]", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1, stagger: 0.1 }, 0.6);

      render(0);
      gsap.to(cameraZ, {
        s: end,
        ease: "none",
        onUpdate: function (this: gsap.core.Tween) {
          render(cameraZ.s);
          gsap.set(hudBar, { scaleX: this.progress() });
        },
        scrollTrigger: { trigger: track, start: "top top", end: "bottom bottom", scrub: 0.6 },
      });

      const onResize = () => {
        size();
        render(cameraZ.s);
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }, track);

    return () => ctx.revert();
  }, []);

  /* tunnel cross-section, as CSS lengths */
  const X = "min(42vw, 760px)";

  /* one device per wall per sector, in its own depth slot — nothing overlaps */
  const shots = STATIONS.flatMap(({ ind, z }, i) => {
    const sys = systemsFor(ind);
    return (["left", "right"] as Wall[]).map((wall, j) => {
      const p = sys[j] ?? sys[0];
      const kind: "laptop" | "monitor" = (i + j) % 2 ? "monitor" : "laptop";
      return { p, wall, kind, zNear: z + 450, key: `${i}-${j}`, n: sys[j] ? (i % 2 ? 2 : 1) : 2 };
    });
  });

  const shotStyle = (s: (typeof shots)[number]): React.CSSProperties => {
    const y = `${-DH / 2 + 30}px`;
    return s.wall === "left"
      ? { width: DW, height: DH, transformOrigin: "0 0", transform: `translate3d(calc(-1 * ${X}), ${y}, ${s.zNear}px) rotateY(90deg)` }
      : { width: DW, height: DH, transformOrigin: "0 0", transform: `translate3d(${X}, ${y}, ${s.zNear - DW}px) rotateY(-90deg)` };
  };

  return (
    <section ref={trackRef} className="ind-tunnel relative bg-canvas" style={{ height: `${INDUSTRIES.length * 95 + 140}svh` }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* static converging lines — they never move on screen */}
        <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          {[
            [0, 0], [100, 0], [0, 100], [100, 100],
            [30, 0], [70, 0], [30, 100], [70, 100],
            [0, 28], [0, 72], [100, 28], [100, 72],
          ].map(([x, y], i) => (
            <line key={i} x1={x} y1={y} x2={50} y2={50} stroke="var(--color-border-strong)" strokeWidth={i < 4 ? 1.2 : 0.8} vectorEffect="non-scaling-stroke" />
          ))}
        </svg>

        {/* the frames, stroked per frame */}
        <canvas data-rings aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />

        {/* the camera */}
        <div data-cam className="absolute inset-0" style={{ perspective: `${P}px`, transformStyle: "preserve-3d" }}>
          <div data-world className="absolute left-1/2 top-1/2 h-0 w-0 will-change-transform" style={{ transformStyle: "preserve-3d" }}>
            {/* the systems, on 3D devices mounted on the walls */}
            {shots.map((s) => (
              <figure
                key={s.key}
                data-z={s.zNear - 450}
                data-kind="shot"
                className="absolute left-0 top-0"
                style={{ ...shotStyle(s), transformStyle: "preserve-3d", visibility: "hidden" }}
              >
                {/* the door: hinged at the near edge, swung by the scroll */}
                <div
                  data-door={s.zNear}
                  data-wall={s.wall}
                  className="absolute inset-0"
                  style={{ transformStyle: "preserve-3d", transformOrigin: s.wall === "left" ? "0 50%" : "100% 50%" }}
                >
                  <Device kind={s.kind} wall={s.wall} src={shot(`${PRODUCT_SHOT[s.p]}/${s.n}-sm`)} phone={s.p === "HR & Payroll"} />
                  <figcaption
                    className="fogp absolute top-[-46px] rounded-full bg-black/85 px-4 py-1.5 text-[17px] font-semibold text-white"
                    style={{ [s.wall === "left" ? "left" : "right"]: 40, transform: "translateZ(2px)" }}
                  >
                    {PRODUCT_FULL[s.p]}
                  </figcaption>
                </div>
              </figure>
            ))}

            {/* the title, in the mouth of the tunnel */}
            <div data-z={0} data-kind="title" className="absolute w-[min(900px,88vw)] text-center" style={{ transform: "translate3d(-50%, -50%, 0)" }}>
              <h1 className="font-spartan text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.035em] text-ink sm:text-[4rem] lg:text-[5.2rem]">
                <span className="block overflow-hidden pb-[0.06em]">
                  <span data-t className="ind-fade block">Built for</span>
                </span>
                <span className="block overflow-hidden pb-[0.08em]">
                  <span data-t className="ind-fade block">every industry.</span>
                </span>
              </h1>
              <p data-t-copy className="ind-fade mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-ink-muted sm:text-[17px]">
                The same connected ecosystem, configured for the way each sector{" "}
                <span className="text-orange">actually works</span>.
              </p>
              <div data-t-copy className="ind-fade mt-7 flex items-center justify-center gap-5">
                <a href="/contact" className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-canvas transition-transform duration-300 hover:-translate-y-0.5">
                  Talk to an expert
                </a>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                  Scroll to explore
                  <span aria-hidden className="ind-bob">↓</span>
                </span>
              </div>
            </div>

            {/* the sectors */}
            {STATIONS.map(({ ind, z }, i) => {
              return (
                <div
                  key={ind.name}
                  id={`ind-${i}`}
                  data-z={z}
                  data-kind="text"
                  className="absolute w-[min(760px,88vw)] rounded-[40px] px-6 py-10 text-center"
                  style={{
                    transform: `translate3d(-50%, -50%, ${z}px)`,
                    visibility: "hidden",
                    opacity: 0,
                    background: "radial-gradient(ellipse at center, var(--color-canvas) 55%, transparent 72%)",
                  }}
                >
                  <h2 className="font-spartan text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.03em] text-ink sm:text-[4rem] lg:text-[4.8rem]">
                    {ind.name}
                  </h2>
                  <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-ink-muted sm:text-[17px]">{ind.line}</p>
                  <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.2em] text-orange">Related systems</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {systemsFor(ind).map((p) => (
                      <span key={p} className="rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-canvas">
                        {PRODUCT_FULL[p]}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* HUD: where you are */}
        <div data-hud className="pointer-events-none absolute inset-x-0 bottom-6 z-10 mx-auto w-[min(520px,88vw)] opacity-0">
          <p data-hud-name className="text-center text-[12px] font-semibold text-ink-muted" />
          <div className="mt-2 h-[2px] overflow-hidden rounded-full bg-black/10">
            <span data-hud-bar className="block h-full origin-left scale-x-0 bg-gradient-to-r from-[#e83b00] to-[#ffb13b]" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* For reduced motion: the same content, still, one sector after another. */
function StaticList() {
  return (
    <section className="bg-canvas px-6 pb-20 pt-32">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="font-spartan text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.035em] text-ink sm:text-[4rem]">
          Built for every industry.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-ink-muted">
          The same connected ecosystem, configured for the way each sector actually works.
        </p>
      </div>
      <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2">
        {INDUSTRIES.map((ind) => (
          <div key={ind.name} className="rounded-2xl border border-border p-6">
            <h2 className="font-spartan text-2xl font-semibold text-ink">{ind.name}</h2>
            <p className="mt-2 text-sm text-ink-muted">{ind.line}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {systemsFor(ind).map((p) => (
                <span key={p} className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-canvas">
                  {PRODUCT_FULL[p]}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function IndustriesContent() {
  return (
    <>
      <div className="hidden md:block motion-reduce:hidden">
        <Tunnel />
      </div>
      <div className="md:hidden motion-reduce:hidden">
        <MobileDeck />
      </div>
      <div className="hidden motion-reduce:block">
        <StaticList />
      </div>
      <PageCta
        title="Discover how we help businesses grow."
        body="Every sector runs differently. Tell us about yours and we'll show you what changes first."
        primary={{ label: "Talk to an Expert", href: "/contact" }}
        secondary={{ label: "See Customer Stories", href: "/customer-success" }}
      />
    </>
  );
}
