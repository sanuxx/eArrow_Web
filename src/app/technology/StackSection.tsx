"use client";

import { useEffect, useMemo, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/*
 * The stack, as an exploded isometric diagram.
 *
 * Four glass slabs, one per tier, stacked in real CSS 3D (one perspective,
 * one preserve-3d plane tilted to an isometric view). Each slab carries its
 * pillars as tiles printed on its face.
 *
 * Scroll-driven (sticky stage, scrubbed GSAP timeline):
 *   1. the stack sits closed, then explodes — the slabs spread apart
 *   2. tiers light up one at a time from the foundation upward: the slab
 *      lifts, glows orange and its pillar tiles rise, while the copy beside
 *      it swaps to that tier
 *   3. finally a security perimeter rises around every level at once —
 *      Cybersecurity is not a tier, it wraps all of them
 * Everything animated is transform/opacity. Phones get the same film, scaled
 * to fit; reduced motion gets the content as a plain list of cards.
 */

export type Layer = { tier: string; pillars: string[]; note: string };
type Sec = { name: string; note: string };

const SLAB = 320; // px, side of each slab
const CLOSED = 22; // gap between slabs when closed
const OPEN = 150; // gap when exploded

const RIM_MASK: React.CSSProperties = {
  WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  WebkitMaskComposite: "xor",
  mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
};

/* the tier emblems, engraved large into the far corner of each slab */
function Emblem({ tier }: { tier: string }) {
  const p = { fill: "none", stroke: "url(#emb)", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <svg viewBox="0 0 120 120" className="absolute -right-4 -top-4 h-[58%] w-[58%] opacity-[0.35]" aria-hidden>
      <defs>
        <linearGradient id="emb" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe0c7" />
          <stop offset="1" stopColor="#ff7a1a" />
        </linearGradient>
      </defs>
      {tier === "Experience" && (
        <g {...p}>
          <rect x="38" y="16" width="44" height="86" rx="10" />
          <path d="M52 26h16M54 92h12" />
          <path d="M48 46h24M48 58h16M48 70h20" opacity="0.7" />
        </g>
      )}
      {tier === "Intelligence" && (
        <g {...p}>
          <path d="M60 18l8 26 26 8-26 8-8 26-8-26-26-8 26-8z" />
          <path d="M92 18l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" opacity="0.7" />
        </g>
      )}
      {tier === "Integration" && (
        <g {...p}>
          <circle cx="30" cy="40" r="10" />
          <circle cx="90" cy="40" r="10" />
          <circle cx="60" cy="88" r="10" />
          <path d="M40 40h40M36 48l18 32M84 48 66 80" />
        </g>
      )}
      {tier === "Platform" && (
        <g {...p}>
          <path d="M34 76h54a18 18 0 0 0-4-35 26 26 0 0 0-49 6 15 15 0 0 0-1 29z" />
          <path d="M44 92h34M50 102h22" opacity="0.7" />
        </g>
      )}
    </svg>
  );
}

export default function StackSection({ layers, security }: { layers: Layer[]; security: Sec }) {
  const trackRef = useRef<HTMLElement>(null);
  /* bottom-up: foundation first */
  const order = useMemo(() => [...layers].reverse(), [layers]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const q = gsap.utils.selector(track);
      const slabs = q("[data-slab]") as HTMLElement[];
      const faces = q("[data-face]") as HTMLElement[];
      const glows = q("[data-glow]") as HTMLElement[];
      const edges = q("[data-edge]") as HTMLElement[];
      /* the glass catches light now and then */
      gsap.fromTo("[data-sheen]", { xPercent: -150 }, { xPercent: 420, duration: 3.2, ease: "power2.inOut", stagger: 0.35, repeat: -1, repeatDelay: 3 });
      const steps = q("[data-step]") as HTMLElement[];
      const dots = q("[data-dot]") as HTMLElement[];

      gsap.set(slabs, { z: (i) => i * CLOSED });
      gsap.set(steps, { autoAlpha: 0, y: 30 });
      gsap.set(steps[0], { autoAlpha: 1, y: 0 });
      gsap.set("[data-perimeter]", { autoAlpha: 0, z: (i) => i * OPEN - 6, scale: 0.9 });

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: { trigger: track, start: "top top", end: "bottom bottom", scrub: 1 },
      });

      /* the stack turns a little as it opens */
      tl.to("[data-spin]", { rotationZ: -38, duration: 1 }, 0).to(slabs, { z: (i) => i * OPEN, duration: 1 }, 0);

      const show = (n: number, at: number) => {
        steps.forEach((s, k) => {
          if (k === n) tl.to(s, { autoAlpha: 1, y: 0, duration: 0.35 }, at);
          else tl.to(s, { autoAlpha: 0, y: -24, duration: 0.25 }, at);
        });
        dots.forEach((d, k) => tl.to(d, { scaleX: k === n ? 1 : 0.25, opacity: k === n ? 1 : 0.35, duration: 0.3 }, at));
      };

      /* each tier in turn, foundation upward */
      order.forEach((_, i) => {
        const at = 1 + i * 1.2;
        show(i + 1, at);
        tl.to(slabs[i], { z: i * OPEN + 40, duration: 0.5 }, at)
          .to(glows[i], { opacity: 1, duration: 0.5 }, at)
          .to(edges[i], { opacity: 1, duration: 0.5 }, at)
          .to(faces[i].querySelectorAll("[data-tile]"), { z: 18, duration: 0.5, stagger: 0.06 }, at + 0.1);
        if (i > 0) {
          tl.to(slabs[i - 1], { z: (i - 1) * OPEN, duration: 0.5 }, at)
            .to(glows[i - 1], { opacity: 0.25, duration: 0.5 }, at)
            .to(edges[i - 1], { opacity: 0.35, duration: 0.5 }, at)
            .to(faces[i - 1].querySelectorAll("[data-tile]"), { z: 0, duration: 0.4 }, at);
        }
      });

      /* security wraps everything */
      const end = 1 + order.length * 1.2;
      show(order.length + 1, end);
      tl.to(slabs[order.length - 1], { z: (order.length - 1) * OPEN, duration: 0.5 }, end)
        .to(glows, { opacity: 0.55, duration: 0.5 }, end)
        .to(edges, { opacity: 0.8, duration: 0.5 }, end)
        .to("[data-perimeter]", { autoAlpha: 1, scale: 1, duration: 0.6, stagger: 0.08 }, end)
        .to({}, { duration: 0.6 });

      /* the perimeter shimmers once visible */
      gsap.to("[data-perimeter]", { "--dash": "-40", duration: 2.4, ease: "none", repeat: -1 });
    });
    return () => mm.revert();
  }, [order]);

  const total = order.length + 2; // intro + tiers + security

  return (
    <section id="stack" ref={trackRef} className="relative scroll-mt-20 bg-[#070707] text-white h-[520vh] motion-reduce:h-auto lg:h-[560vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden motion-reduce:hidden">
        {/* warm ground and a faint grid */}
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 50% 60% at 32% 55%, rgba(232,59,0,0.18), transparent 70%)" }} />
        <div aria-hidden className="tech-grid pointer-events-none absolute inset-0 opacity-40" />

        <div className="relative mx-auto grid h-full max-w-7xl grid-cols-1 grid-rows-[58%_42%] items-center px-6 pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:grid-rows-1 lg:gap-10 lg:px-12 lg:pt-0">
          {/* ── the diagram (desktop) — scaled by height too, so the lifted top slab clears the nav ── */}
          <div className="relative h-full lg:h-[100svh]" style={{ perspective: "1600px" }}>
            <div
              className="absolute left-1/2 top-[78%] h-0 w-0 [--s:0.44] sm:top-[78%] sm:[--s:0.66] lg:top-[76%] lg:[--s:1] lg:[@media(max-height:860px)]:top-[78%] lg:[@media(max-height:860px)]:[--s:0.86] lg:[@media(max-height:740px)]:top-[79%] lg:[@media(max-height:740px)]:[--s:0.74] lg:[@media(max-height:660px)]:[--s:0.64]"
              style={{ transformStyle: "preserve-3d", transform: "scale(var(--s)) rotateX(58deg)" }}
            >
              <div data-spin style={{ transformStyle: "preserve-3d", transform: "rotateZ(-45deg)" }}>
                {/* security perimeters, one per level */}
                {order.map((l) => (
                  <div
                    key={`p-${l.tier}`}
                    data-perimeter
                    className="absolute"
                    style={{ left: -SLAB / 2 - 26, top: -SLAB / 2 - 26, width: SLAB + 52, height: SLAB + 52 }}
                  >
                    <svg viewBox={`0 0 ${SLAB + 52} ${SLAB + 52}`} className="h-full w-full overflow-visible" aria-hidden>
                      <rect
                        x="1"
                        y="1"
                        width={SLAB + 50}
                        height={SLAB + 50}
                        rx="40"
                        fill="rgba(255,122,26,0.04)"
                        stroke="#ff8a3d"
                        strokeWidth="2"
                        strokeDasharray="10 10"
                        style={{ strokeDashoffset: "var(--dash, 0)" } as React.CSSProperties}
                      />
                    </svg>
                  </div>
                ))}

                {/* the slabs, foundation first */}
                {order.map((l) => (
                  <div
                    key={l.tier}
                    data-slab
                    className="absolute"
                    style={{ left: -SLAB / 2, top: -SLAB / 2, width: SLAB, height: SLAB, transformStyle: "preserve-3d" }}
                  >
                    {/* thickness: a run of plates darkening downward, with an
                        orange edge-light line through the middle that wakes up
                        when the tier is live */}
                    {[18, 15, 12, 9, 6, 3].map((d, k) => (
                      <div
                        key={d}
                        className="absolute inset-0 rounded-[38px]"
                        style={{ transform: `translateZ(-${d}px)`, background: k === 0 ? "#050403" : `linear-gradient(135deg, #3a2a20, #120c09)` }}
                      />
                    ))}
                    <div data-edge className="absolute inset-0 rounded-[38px] opacity-20" style={{ transform: "translateZ(-10px)", background: "linear-gradient(135deg, #ffb13b, #e83b00 60%, #ff7a1a)" }} />

                    {/* the face: smoked glass */}
                    <div
                      data-face
                      /* label and pillars on the front edge, nearest the viewer, so the slab above never covers them */
                      className="absolute inset-0 flex flex-col justify-end rounded-[38px] p-6"
                      style={{
                        transformStyle: "preserve-3d",
                        background:
                          "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(255,200,160,0.10), transparent 60%), linear-gradient(145deg, #2c201a 0%, #17110e 55%, #0e0a08 100%)",
                      }}
                    >
                      {/* etched circuitry and the tier's emblem, engraved into the glass */}
                      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[38px]">
                        <div
                          className="absolute inset-0 opacity-[0.22]"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
                              "<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><g fill='none' stroke='#ffb98a' stroke-width='1'><path d='M0 20h22l8 8h20M50 28v24l10 10h20M10 80V60l10-10h10M80 40H64l-6-6'/></g><g fill='#ffb98a'><circle cx='50' cy='28' r='2'/><circle cx='30' cy='50' r='2'/><circle cx='64' cy='40' r='2'/></g></svg>",
                            )}")`,
                            maskImage: "radial-gradient(ellipse 90% 80% at 70% 30%, #000 20%, transparent 75%)",
                            WebkitMaskImage: "radial-gradient(ellipse 90% 80% at 70% 30%, #000 20%, transparent 75%)",
                          }}
                        />
                        <Emblem tier={l.tier} />
                        {/* a slow specular sweep across the glass */}
                        <span data-sheen className="absolute -inset-y-1/4 left-0 w-1/3 -skew-x-12 will-change-transform" style={{ background: "linear-gradient(90deg, transparent, rgba(255,235,215,0.12), transparent)" }} />
                      </div>

                      {/* its glow, faded up when the tier is live */}
                      <div
                        data-glow
                        className="absolute inset-0 rounded-[38px] opacity-0"
                        style={{ background: "radial-gradient(ellipse 90% 80% at 30% 90%, rgba(255,122,26,0.55), transparent 70%), linear-gradient(135deg, rgba(255,177,59,0.25), rgba(232,59,0,0.3))" }}
                      />
                      {/* the rim: a thin gradient bevel */}
                      <div
                        className="pointer-events-none absolute inset-0 rounded-[38px] p-[1.5px]"
                        style={{ background: "linear-gradient(135deg, rgba(255,236,220,0.75), rgba(255,154,82,0.35) 35%, rgba(255,255,255,0.06) 60%, rgba(255,177,59,0.5))", ...RIM_MASK }}
                      />

                      <p className="relative flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ffb98a]/80">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#ff8a3d] shadow-[0_0_10px_2px_rgba(255,138,61,0.8)]" />
                        Tier
                      </p>
                      <p className="relative mt-1 text-[26px] font-semibold tracking-[-0.015em] text-white">{l.tier}</p>
                      <div className="relative mt-3 flex flex-wrap gap-2" style={{ transformStyle: "preserve-3d" }}>
                        {l.pillars.map((p) => (
                          /* keycaps: lit top, darker skirt below */
                          <span
                            key={p}
                            data-tile
                            className="rounded-[14px] px-3.5 py-3 text-[14px] font-semibold text-white"
                            style={{
                              background: "linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.05))",
                              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -3px 0 rgba(0,0,0,0.35), 0 6px 14px -6px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,200,160,0.18)",
                            }}
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* floor shadow */}
            <div aria-hidden className="absolute bottom-[4%] left-1/2 h-24 w-[70%] -translate-x-1/2 rounded-[50%] bg-black/60 blur-2xl" />
          </div>

          {/* ── the copy, one step at a time (desktop) ── */}
          <div className="relative z-10 h-full self-stretch lg:h-[420px] lg:self-center">
            <div className="absolute left-0 top-0 flex gap-1.5">
              {Array.from({ length: total }).map((_, k) => (
                <span key={k} data-dot className={`block h-[3px] w-7 lg:w-10 origin-left rounded-full bg-[#ff8a3d] ${k ? "opacity-35" : ""}`} style={{ transform: k ? "scaleX(0.25)" : undefined }} />
              ))}
            </div>

            {/* intro */}
            <div data-step className="absolute inset-x-0 top-6 lg:top-12">
              <p className="text-[13px] font-medium text-[#ff9a52]">The stack</p>
              <h2 className="font-spartan mt-2 text-[1.8rem] font-semibold lg:mt-3 lg:text-[2.6rem] leading-[1.05] tracking-[-0.025em]">Four tiers, one architecture</h2>
              <p className="mt-3 max-w-md text-[14px] leading-relaxed text-white/65 lg:mt-5 lg:text-[16px]">
                Read it from the bottom up. Each tier depends on the one beneath it — and security runs through all four. Scroll to
                take it apart.
              </p>
            </div>

            {order.map((l) => (
              <div key={l.tier} data-step className="invisible absolute inset-x-0 top-6 lg:top-12">
                <p className="text-[13px] font-medium text-[#ff9a52]">Tier</p>
                <h3 className="font-spartan mt-2 text-[2rem] font-semibold lg:mt-3 lg:text-[3rem] leading-[1.02] tracking-[-0.025em]">{l.tier}</h3>
                <p className="mt-3 max-w-md text-[14px] leading-relaxed text-white/70 lg:mt-5 lg:text-[16px]">{l.note}</p>
                <div className="mt-4 flex flex-wrap gap-2 lg:mt-6">
                  {l.pillars.map((p) => (
                    <span key={p} className="rounded-full bg-[#ff8a3d]/15 px-4 py-1.5 text-[13px] font-medium text-[#ffb98a] ring-1 ring-[#ff8a3d]/30">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            <div data-step className="invisible absolute inset-x-0 top-6 lg:top-12">
              <p className="text-[13px] font-medium text-[#ff9a52]">Across every tier</p>
              <h3 className="font-spartan mt-2 text-[2rem] font-semibold lg:mt-3 lg:text-[3rem] leading-[1.02] tracking-[-0.025em]">{security.name}</h3>
              <p className="mt-3 max-w-md text-[14px] leading-relaxed text-white/70 lg:mt-5 lg:text-[16px]">{security.note}</p>
              <a href="/contact" className="mt-7 inline-flex items-center gap-2 text-[14px] font-semibold text-[#ff9a52] transition-colors hover:text-white">
                Talk to our architects →
              </a>
            </div>
          </div>


        </div>
      </div>
          {/* ── reduced motion: the same content as cards ── */}
          <div className="hidden px-6 py-20 motion-reduce:block">
            <p className="text-[13px] font-medium text-[#ff9a52]">The stack</p>
            <h2 className="font-spartan mt-3 text-[2rem] font-semibold leading-[1.05] tracking-[-0.025em]">Four tiers, one architecture</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-white/65">Each tier depends on the one beneath it — and security runs through all four.</p>
            <div className="mt-8 space-y-3">
              {layers.map((l, i) => (
                <div key={l.tier} className="relative overflow-hidden rounded-[22px] bg-white/[0.04] p-5 ring-1 ring-white/10">
                  {/* a little slab stack, the live level lit */}
                  <svg viewBox="0 0 60 60" className="absolute right-4 top-4 h-12 w-12" aria-hidden>
                    {[0, 1, 2, 3].map((k) => (
                      <path
                        key={k}
                        d={`M30 ${40 - k * 9} l18 -8 l-18 -8 l-18 8 z`}
                        fill={3 - k === i ? "#ff8a3d" : "rgba(255,255,255,0.12)"}
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="0.6"
                      />
                    ))}
                  </svg>
                  <p className="font-spartan text-[1.4rem] font-semibold">{l.tier}</p>
                  <p className="mt-2 pr-14 text-[14px] leading-relaxed text-white/65">{l.note}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {l.pillars.map((p) => (
                      <span key={p} className="rounded-full bg-[#ff8a3d]/15 px-3 py-1 text-[12px] font-medium text-[#ffb98a]">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              <div className="rounded-[22px] border border-dashed border-[#ff8a3d]/60 bg-[#ff8a3d]/[0.06] p-5">
                <p className="text-[12px] font-medium text-[#ff9a52]">Across every tier</p>
                <p className="font-spartan mt-1 text-[1.4rem] font-semibold">{security.name}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-white/65">{security.note}</p>
              </div>
            </div>
          </div>
    </section>
  );
}
