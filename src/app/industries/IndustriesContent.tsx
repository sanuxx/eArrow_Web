"use client";

import { useEffect, useRef } from "react";
import { PageCta } from "@/components/page-kit";
import { INDUSTRY_ICONS, type IndustryIconKey } from "@/components/industry-icons";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { withBasePath } from "@/lib/basePath";
import "devices.css/dist/devices.min.css";
import IndustriesLanding from "./IndustriesLanding";

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
 * camera) plus an opacity per plane for fog and culling. The corridor itself
 * is aurora: wide, soft ribbons of the landing's orange light hanging on the
 * walls and ceiling, drawn on one canvas from the same projection maths
 * (scale = P / (P − z)). They drift toward you on their own and slowly ripple
 * while the section is on screen. Being soft, the canvas renders at a quarter
 * resolution and is scaled up, which costs little and blurs for free.
 *
 * Shot like a film: a warm light leak sweeps the frame on every cut to a
 * new sector, and a vignette and plain grain finish it.
 *
 * Budget: the aurora draws at 30fps on a quarter-size canvas and only while
 * the section is on screen; per-plane opacity is written only when it
 * changes; grain is a plain layer (no blend mode re-compositing each frame).
 *
 * Wall orientations, so each screenshot faces the camera and reads upright:
 *   left   rotateY(90deg)   from its near edge, extending away
 *   right  rotateY(-90deg)  from its far edge, extending toward the camera
 *   floor  rotateX(90deg)   from its far edge, extending toward the camera
 *   ceil   rotateX(-90deg)  from its near edge, extending away
 */

const P = 1000; // perspective, px
const SPACING = 2200; // depth between sectors
const BAND_GAP = 820; // depth between aurora ribbons
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

/* Real device faces from devices.css (MIT, pure CSS) — the bezel, notch and
   screen — on true 3D bodies built here: an aluminium back shell with
   thickness and a side edge, and for the laptop a keyboard deck folded out
   of the wall, for the monitor a stand arm with depth and a foot lying flat.

   Everything is a separate leaf inside one preserve-3d wrapper, and each
   leaf fogs through --fog (`.fogp`) — opacity on any ancestor would flatten
   the whole device back into a picture. */
const DW = 900; // device panel width along the wall
const DH = 520;

const DEVICE = {
  laptop: { cls: "device-macbook-pro device-silver", w: 740, h: 434, faceW: 618, faceH: 418 },
  monitor: { cls: "device-pro-display-xdr", w: 640, h: 475, faceW: 640, faceH: 368 },
} as const;

const P3D: React.CSSProperties = { transformStyle: "preserve-3d" };
const ALU = "linear-gradient(180deg,#f2f3f5 0%,#d9dce0 45%,#b9bdc3 100%)";

function Device({ kind, src, phone, wall }: { kind: "laptop" | "monitor"; src: string; phone?: boolean; wall: Wall }) {
  const d = DEVICE[kind];
  const lap = kind === "laptop";
  const k = Math.min((DW * 0.94) / d.w, (DH * 0.98) / d.h);
  const fx = (d.w - d.faceW) / 2; // face's left offset inside the device box
  const T = lap ? 12 : 22; // shell thickness, px (pre-scale)
  const free = wall === "left" ? "right" : "left"; // the edge away from the hinge

  return (
    <>
      {/* contact shadow on the wall */}
      <div
        className="fogp absolute"
        style={{ left: DW * 0.06, right: DW * 0.06, bottom: -14, height: 80, background: "radial-gradient(ellipse at 50% 50%, rgba(30,20,10,0.32), transparent 70%)", transform: "translateZ(-2px)" }}
      />
      <div className="absolute bottom-0 left-1/2" style={{ ...P3D, width: d.w, height: d.h, transform: `translateX(-50%) scale(${k})`, transformOrigin: "50% 100%" }}>
        {/* ── the shell: back plate + its edges, so the screen has depth ── */}
        <div className="fogp absolute" style={{ left: fx, top: 0, width: d.faceW, height: d.faceH, borderRadius: lap ? 20 : 6, background: ALU, transform: `translateZ(-${T}px)` }}>
          {/* the logo on the back, catching light */}
          <span className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60" />
        </div>
        {/* top edge */}
        <div className="fogp absolute" style={{ left: fx + 10, top: 0, width: d.faceW - 20, height: T, background: "linear-gradient(180deg,#ffffff,#c9ccd1)", transformOrigin: "50% 0", transform: "rotateX(90deg)" }} />
        {/* free side edge */}
        <div
          className="fogp absolute"
          style={{
            [free]: fx,
            top: 10,
            width: T,
            height: d.faceH - 20,
            background: "linear-gradient(90deg,#e9ebee,#a6aab1)",
            transformOrigin: free === "right" ? "100% 50%" : "0 50%",
            transform: free === "right" ? "rotateY(90deg)" : "rotateY(-90deg)",
          }}
        />

        {/* ── the real face ── */}
        <div className={`fogp device ${d.cls} device-3d absolute left-0 top-0`}>
          <div className="device-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="device-screen object-cover object-left-top" src={src} alt="" loading="lazy" draggable={false} />
            {/* glass: a glare that reads as a curved, lit surface */}
            <span className="pointer-events-none absolute inset-[9px] rounded-[10px] bg-[linear-gradient(115deg,rgba(255,255,255,0.32)_0%,rgba(255,255,255,0.06)_28%,transparent_45%,rgba(0,0,0,0.08)_100%)]" />
          </div>
          <div className="device-stripe" />
          <div className="device-header" />
          <div className="device-sensors" />
          <div className="device-btns" />
        </div>

        {lap ? (
          <>
            {/* hinge */}
            <div className="fogp absolute" style={{ left: fx + 30, top: d.faceH - 4, width: d.faceW - 60, height: 14, borderRadius: 7, background: "linear-gradient(180deg,#4a4c51,#1b1c1f)", transform: "translateZ(-6px)" }} />
            {/* keyboard deck, folded out of the wall toward the viewer */}
            <div
              className="fogp absolute overflow-hidden"
              style={{ left: fx - 40, top: d.faceH + 4, width: d.faceW + 80, height: 420, borderRadius: "8px 8px 28px 28px", background: ALU, transformOrigin: "50% 0", transform: "rotateX(80deg)", boxShadow: "inset 0 2px 0 rgba(255,255,255,0.8)" }}
            >
              {[0, 1].map((s) => (
                <span key={s} className="absolute top-[6%] h-[50%] w-[7%]" style={{ [s ? "right" : "left"]: "3%", backgroundImage: "radial-gradient(#8e939b 1.3px, transparent 1.6px)", backgroundSize: "8px 8px" }} />
              ))}
              {/* the keys: one painted grid rather than sixty-odd elements per laptop */}
              <div className="absolute left-[13%] right-[13%] top-[6%] h-[50%] rounded-[12px] bg-[#1c1d20] p-[7px] shadow-[inset_0_3px_8px_rgba(0,0,0,0.6)]">
                <div
                  className="h-full w-full"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #1c1d20 0 6px, transparent 6px), linear-gradient(180deg, #1c1d20 0 6px, transparent 6px), linear-gradient(180deg, #2d2e33, #17181b)",
                    backgroundSize: "calc(100% / 14) 20%",
                    backgroundPosition: "-6px -6px",
                  }}
                />
              </div>
              <div className="absolute bottom-[7%] left-1/2 h-[30%] w-[34%] -translate-x-1/2 rounded-[14px] bg-gradient-to-b from-[#e6e8eb] to-[#cdd1d6] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)]" />
            </div>
            {/* the deck's front lip (its thickness), standing up at the far end */}
            <div
              className="fogp absolute"
              style={{ left: fx - 30, top: d.faceH + 4, width: d.faceW + 60, height: 14, borderRadius: "0 0 10px 10px", background: "linear-gradient(180deg,#b9bdc3,#868a92)", transformOrigin: "50% 0", transform: "rotateX(80deg) translateY(420px) rotateX(-90deg)" }}
            />
          </>
        ) : (
          <>
            {/* stand arm: a front face and two side faces, so it is a solid */}
            <div className="fogp absolute" style={{ left: d.w / 2 - 60, top: d.faceH - 6, width: 120, height: 118, background: "linear-gradient(90deg,#aeb2b9,#f1f2f4 45%,#c9ccd2 70%,#9b9fa6)", transform: "translateZ(-40px)" }} />
            {[0, 1].map((s) => (
              <div
                key={s}
                className="fogp absolute"
                style={{ left: s ? d.w / 2 + 60 : d.w / 2 - 60, top: d.faceH - 6, width: 34, height: 118, background: "linear-gradient(90deg,#d5d8dc,#9a9ea5)", transformOrigin: "0 50%", transform: `translateZ(-40px) rotateY(${s ? -90 : -90}deg)` }}
              />
            ))}
            {/* the foot, lying flat out from the wall */}
            <div
              className="fogp absolute"
              style={{ left: d.w / 2 - 150, top: d.faceH + 112, width: 300, height: 220, borderRadius: 18, background: "linear-gradient(180deg,#f3f4f6,#c3c7cd)", transformOrigin: "50% 0", transform: "translateZ(-40px) rotateX(84deg)", boxShadow: "inset 0 2px 0 rgba(255,255,255,0.9)" }}
            />
          </>
        )}
      </div>

      {phone && (
        <div className="absolute" style={{ ...P3D, width: 428, height: 868, top: DH * 0.08, left: wall === "left" ? DW * 0.02 : DW * 0.74, transform: `translateZ(90px) scale(${(DH * 0.84) / 868})`, transformOrigin: "0 0" }}>
          {/* the phone's thickness */}
          <div className="fogp absolute inset-0 rounded-[68px] bg-gradient-to-b from-[#3a3540] to-[#16131a]" style={{ transform: "translateZ(-18px)" }} />
          <div className="fogp device device-iphone-14-pro device-black absolute left-0 top-0">
            <div className="device-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="device-screen object-cover object-top" src={withBasePath("/products/mobile/hr-app.webp")} alt="" loading="lazy" draggable={false} />
            </div>
            <div className="device-stripe" />
            <div className="device-header" />
            <div className="device-sensors" />
            <div className="device-btns" />
            <div className="device-power" />
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
    mm.add("(max-width: 1023px), (pointer: coarse)", () => {
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
    <section ref={ref} className="ind-tunnel bg-[var(--t-bg)] px-4 pb-16 pt-16">
      <div className="text-center">
        <h2 className="font-spartan text-[2.2rem] font-semibold leading-[1.02] tracking-[-0.035em] text-[var(--t-ink)]">
          <span className="block overflow-hidden pb-[0.06em]">
            <span data-m-h className="ind-fade block">Built for</span>
          </span>
          <span className="block overflow-hidden pb-[0.08em]">
            <span data-m-h className="ind-fade block">every industry</span>
          </span>
        </h2>
        <p data-m-copy className="ind-fade mx-auto mt-4 max-w-xs text-[15px] leading-relaxed text-[var(--t-muted)]">
          The same connected ecosystem, configured for the way each sector <span className="text-orange">actually works</span>.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-xl">
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
    if (!track || prefersReducedMotion() || window.matchMedia("(max-width: 1023px), (pointer: coarse)").matches) return;
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
      last: -1,
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
    const RES = 0.25; // soft light: draw small, let the browser scale it up
    let cw = 0;
    let ch = 0;
    let R = 0; // the corridor radius at the lens plane, in canvas px
    const size = () => {
      cw = Math.max(1, Math.round(canvas.clientWidth * RES));
      ch = Math.max(1, Math.round(canvas.clientHeight * RES));
      canvas.width = cw;
      canvas.height = ch;
      R = Math.min(Math.hypot(cw, ch) * 0.34, 210);
    };
    size();

    /* the ribbons: one per depth slot, each hung at its own place round the
       corridor (kept off the middle, where the sector copy sits) */
    const NEAR = P * 0.8;
    const FAR = -6200;
    const SPAN = Math.ceil((NEAR - FAR) / BAND_GAP) * BAND_GAP;
    const TONES = ["255,106,26", "255,140,50", "232,59,0", "255,170,60", "255,84,23"];
    const bands = Array.from({ length: SPAN / BAND_GAP }, (_, i) => ({
      z: FAR + i * BAND_GAP,
      th: i * 2.39996 + Math.random() * 0.5, // golden-angle spread round the walls
      off: 1.1 + Math.random() * 0.35,
      len: 1.3 + Math.random() * 0.6,
      thick: 0.42 + Math.random() * 0.22,
      tone: TONES[i % TONES.length],
      ph: Math.random() * Math.PI * 2,
      sp: 0.25 + Math.random() * 0.3,
    }));

    let cur = 0; // camera depth from the scroll
    let drift = 0; // the aurora's own slow travel
    let time = 0;
    const fade = (e: number) => Math.pow(Math.min(1, (e - FAR) / 3600), 2) * (e > 150 ? Math.max(0, 1 - (e - 150) / 550) : 1);

    const drawAurora = () => {
      c2d.globalCompositeOperation = "source-over";
      c2d.clearRect(0, 0, cw, ch);
      /* the aurora belongs to the dark theme; light has its corner glows */
      if (document.documentElement.dataset.theme !== "dark") return;
      c2d.globalCompositeOperation = "lighter";
      const boost = 1;
      const cx = cw / 2;
      const cy = ch / 2;
      for (const b of bands) {
        let e = b.z + cur + drift;
        e = ((((e - FAR) % SPAN) + SPAN) % SPAN) + FAR;
        const a = fade(e);
        if (a < 0.01) continue;
        const k = P / (P - e);
        /* a slow ripple: the ribbon sways round the wall, swells and twists */
        const w = Math.sin(time * b.sp + b.ph);
        const th = b.th + w * 0.18;
        const r = R * k;
        const x = cx + Math.cos(th) * r * b.off;
        const y = cy + Math.sin(th) * r * b.off * 0.82;
        /* keep the middle clear for the copy */
        const d = Math.hypot(x - cx, (y - cy) / 0.82) / (Math.min(cw, ch) * 0.5);
        const clear = Math.min(1, Math.max(0, (d - 0.35) / 0.45));
        if (clear < 0.01) continue;
        const L = r * b.len * (1 + 0.12 * Math.sin(time * b.sp * 1.7 + b.ph));
        const T = r * b.thick * (1 + 0.25 * w);
        c2d.save();
        c2d.translate(x, y);
        c2d.rotate(th + Math.PI / 2 + w * 0.22); // lie along the wall
        c2d.scale(1, T / L);
        const g = c2d.createRadialGradient(0, 0, 0, 0, 0, L);
        g.addColorStop(0, `rgba(${b.tone},${(0.78 * boost * a * clear).toFixed(3)})`);
        g.addColorStop(0.4, `rgba(${b.tone},${(0.36 * boost * a * clear).toFixed(3)})`);
        g.addColorStop(1, `rgba(${b.tone},0)`);
        c2d.fillStyle = g;
        c2d.beginPath();
        c2d.arc(0, 0, L, 0, Math.PI * 2);
        c2d.fill();
        c2d.restore();
      }
    };

    /* the aurora keeps moving while the section is on screen */
    let raf = 0;
    let prev = 0;
    let since = 1;
    const tick = (now: number) => {
      const dt = prev ? Math.min(0.05, (now - prev) / 1000) : 0.016;
      prev = now;
      time += dt;
      drift += dt * 120;
      since += dt;
      /* soft light needs no more than 30fps */
      if (since >= 1 / 31) {
        since = 0;
        drawAurora();
      }
      raf = requestAnimationFrame(tick);
    };
    const wash = gsap.timeline({ repeat: -1, paused: true })
      .to(q("[data-tgrad]"), { rotation: 360, duration: 48, ease: "none" }, 0)
      .to(q("[data-tgrad]"), { scale: 1.18, xPercent: 6, yPercent: -4, duration: 12, ease: "sine.inOut", yoyo: true, repeat: 3 }, 0)
      /* light: the corner glows drift, swell and lean, each on its own path */
      .to(q("[data-glow='a']"), { xPercent: 14, yPercent: 10, scale: 1.15, rotation: 12, duration: 12, ease: "sine.inOut", yoyo: true, repeat: 3 }, 0)
      .to(q("[data-glow='b']"), { xPercent: -12, yPercent: -9, scale: 1.12, rotation: -10, duration: 16, ease: "sine.inOut", yoyo: true, repeat: 2 }, 0)
      .to(q("[data-glow='c']"), { xPercent: -18, yPercent: 14, scale: 1.25, duration: 8, ease: "sine.inOut", yoyo: true, repeat: 5 }, 0);
    const run = (on: boolean) => {
      cancelAnimationFrame(raf);
      prev = 0;
      if (on) {
        raf = requestAnimationFrame(tick);
        wash.resume();
      } else wash.pause();
    };
    const hud = q("[data-hud]")[0] as HTMLElement;
    const hudName = q("[data-hud-name]")[0] as HTMLElement;
    const hudBar = q("[data-hud-bar]")[0] as HTMLElement;
    let station = -1;
    const leak = q("[data-leak]")[0] as HTMLElement;
    /* a cut to a new sector: a light leak sweeps the frame */
    const cut = () => {
      gsap.fromTo(
        leak,
        { xPercent: 0 },
        { xPercent: 330, duration: 1.6, ease: "power1.inOut", overwrite: true, keyframes: { opacity: [0, 1, 1, 0] } },
      );
    };

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
      cur = s;
      /* devices stay out of the title shot until the flight has begun */
      const gate = Math.min(1, Math.max(0, (s - 120) / 520));
      planes.forEach((p) => {
        const o = Math.round(fog(p.kind, p.z + s) * (p.kind === "shot" ? gate : 1) * 200) / 200;
        if (o === p.last) return;
        p.last = o;
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
          cut();
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
      ScrollTrigger.create({ trigger: track, start: "top bottom", end: "bottom top", onToggle: (self) => run(self.isActive) });
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
      return () => {
        window.removeEventListener("resize", onResize);
        run(false);
      };
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
    <section ref={trackRef} className="ind-tunnel relative bg-[var(--t-bg)] text-[var(--t-ink)]" style={{ height: `${INDUSTRIES.length * 95 + 140}svh` }}>
      {/* the hand-off from the dark landing, so there is never a hard edge.
          Light: a short dark-to-light ramp at the top of the track — once the
          stage pins it sits behind the nav.
          Dark: a long dark lead-in that scrolls away as the stage pins */}
      <div aria-hidden className="ind-lead-light pointer-events-none absolute inset-x-0 -top-px z-20 h-[96px]" style={{ background: "linear-gradient(180deg, #060507 0%, rgba(6,5,7,0.6) 40%, rgba(6,5,7,0.15) 75%, rgba(6,5,7,0) 100%)" }} />
      <div aria-hidden className="ind-lead-dark pointer-events-none absolute inset-x-0 -top-2 z-20 h-[60svh] bg-gradient-to-b from-[#060507] via-[#060507]/70 to-transparent" />
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* light: a cream ground with two big, soft orange glows in opposite
            corners and a clear middle; they drift slowly */}
        <div aria-hidden className="ind-light-only pointer-events-none absolute inset-0 overflow-hidden">
          <div
            data-glow="a"
            className="absolute -left-[22vw] -top-[30vw] aspect-square w-[68vw] rounded-full will-change-transform"
            style={{ background: "radial-gradient(closest-side, rgba(255,106,42,0.95) 0%, rgba(255,140,80,0.7) 30%, rgba(255,178,128,0.38) 58%, rgba(255,210,170,0) 100%)" }}
          />
          <div
            data-glow="b"
            className="absolute -bottom-[42vw] -right-[12vw] aspect-square w-[78vw] rounded-full will-change-transform"
            style={{ background: "radial-gradient(closest-side, rgba(255,106,42,1) 0%, rgba(255,128,64,0.78) 28%, rgba(255,170,115,0.4) 58%, rgba(255,210,170,0) 100%)" }}
          />
          <div
            data-glow="c"
            className="absolute -right-[16vw] top-[42%] aspect-square w-[34vw] rounded-full will-change-transform"
            style={{ background: "radial-gradient(closest-side, rgba(255,120,60,0.75) 0%, rgba(255,160,105,0.35) 50%, rgba(255,210,170,0) 100%)" }}
          />
        </div>
        {/* dark: soft washes of brand orange that drift and turn */}
        <div aria-hidden className="ind-dark-only pointer-events-none absolute inset-0 overflow-hidden" style={{ opacity: "var(--t-grad-o)" }}>
          <div
            data-tgrad
            className="absolute -inset-[30%] will-change-transform"
            style={{
              background:
                "radial-gradient(ellipse 26% 22% at 36% 42%, rgba(255,138,61,0.55), transparent 100%), radial-gradient(ellipse 24% 22% at 66% 58%, rgba(255,177,59,0.5), transparent 100%), radial-gradient(ellipse 28% 18% at 50% 70%, rgba(232,59,0,0.38), transparent 100%), radial-gradient(ellipse 20% 18% at 58% 30%, rgba(255,106,26,0.35), transparent 100%)",
            }}
          />
        </div>
        {/* the landing's orange light, glowing from the end of the tunnel (dark) */}
        <div aria-hidden className="ind-dark-only pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 34% 30% at 50% 50%, rgba(255,106,26,0.32), rgba(232,59,0,0.12) 45%, transparent 75%), radial-gradient(ellipse 80% 70% at 50% 120%, rgba(232,59,0,0.22), transparent 70%)" }} />
        {/* the aurora, drawn per frame */}
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
              <p data-t-copy className="ind-fade text-[12px] font-semibold uppercase tracking-[0.2em] text-orange">Eight sectors · one ecosystem</p>
              <h2 className="font-spartan mt-4 text-[2.2rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[var(--t-ink)] sm:text-[3rem]">
                <span className="block overflow-hidden pb-[0.06em]">
                  <span data-t className="ind-fade block">Fly through every sector</span>
                </span>
              </h2>
              <p data-t-copy className="ind-fade mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--t-ink)]">
                Keep scrolling
                <span aria-hidden className="ind-bob text-orange">↓</span>
              </p>
            </div>

            {/* the sectors */}
            {STATIONS.map(({ ind, z }, i) => {
              return (
                <div
                  key={ind.name}
                  id={`ind-${i}`}
                  data-z={z}
                  data-kind="text"
                  className="absolute w-[min(720px,80vw)] px-6 py-10 text-center"
                  style={{
                    transform: `translate3d(-50%, -50%, ${z}px)`,
                    visibility: "hidden",
                    opacity: 0,
                  }}
                >
                  <h2 className="font-spartan text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.03em] text-[var(--t-ink)] sm:text-[4rem] lg:text-[4.8rem]">
                    {ind.name}
                  </h2>
                  <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--t-muted)] sm:text-[17px]">{ind.line}</p>
                  <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.2em] text-orange">Related systems</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {systemsFor(ind).map((p) => (
                      <span key={p} className="rounded-full bg-[var(--t-chip)] px-4 py-2 text-[13px] font-semibold text-[var(--t-ink)] ring-1 ring-[var(--t-chip-ring)]">
                        {PRODUCT_FULL[p]}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* film finish: a vignette, and a warm light leak that sweeps the frame on each cut */}
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 55%, var(--t-vig) 100%)" }} />
        <div
          aria-hidden
          data-leak
          className="pointer-events-none absolute -left-[50vw] top-0 h-full w-[45vw] opacity-0 will-change-transform"
          style={{ background: "radial-gradient(ellipse 50% 60% at 50% 50%, rgba(255,150,60,0.22), rgba(232,59,0,0.08) 50%, transparent 75%)" }}
        />

        {/* where you are: the sector and a progress line */}
        <div data-hud className="pointer-events-none absolute inset-x-0 bottom-6 z-10 mx-auto w-[min(520px,88vw)] opacity-0">
          <p data-hud-name className="text-center text-[12px] font-medium uppercase tracking-[0.32em] text-[var(--t-muted)]" />
          <div className="mt-2.5 h-px overflow-hidden bg-[var(--t-chip-ring)]">
            <span data-hud-bar className="block h-full origin-left scale-x-0 bg-gradient-to-r from-[#e83b00] to-[#ffb13b]" />
          </div>
        </div>
        <div aria-hidden className="cine-grain pointer-events-none absolute inset-0 z-30 opacity-[0.035]" />
      </div>
    </section>
  );
}

/* For reduced motion: the same content, still, one sector after another. */
function StaticList() {
  return (
    <section className="bg-canvas px-6 pb-20 pt-32">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="font-spartan text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.035em] text-ink sm:text-[4rem]">
          Built for every industry
        </h2>
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
      <IndustriesLanding />
      <div className="hidden lg:block motion-reduce:hidden [@media(pointer:coarse)]:!hidden">
        <Tunnel />
      </div>
      <div className="lg:hidden motion-reduce:hidden [@media(pointer:coarse)_and_(prefers-reduced-motion:no-preference)]:!block">
        <MobileDeck />
      </div>
      <div className="hidden motion-reduce:block">
        <StaticList />
      </div>
      <PageCta
        title="Discover how we help businesses grow"
        body="Every sector runs differently. Tell us about yours and we'll show you what changes first."
        primary={{ label: "Talk to an Expert", href: "/contact" }}
        secondary={{ label: "See Customer Stories", href: "/customer-success" }}
      />
    </>
  );
}
