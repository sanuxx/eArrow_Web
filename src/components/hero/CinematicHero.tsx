"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { withBasePath } from "@/lib/basePath";
import { curtainActive, onCurtainLift } from "../brand-curtain";

/*
 * The home page hero — an open sky at sunrise, in eArrow's colours.
 *
 * Layout follows the agreed reference: a light, airy two-line headline, a
 * pair of pill actions, and beneath them a curved arc of cards — here the
 * real product screens — floating in cloud, with a line of proof below.
 *
 * ACT ONE — the open (time-based, plays as the brand curtain lifts)
 *   warm haze clears · the camera settles onto the shot · cloud banks drift
 *   in at two depths · the sun brightens behind the arc · the headline rises
 *   out of a blur letter by letter · actions, arc and proof follow.
 *
 * ACT TWO — the push (scroll-scrubbed, sticky stage)
 *   the headline lifts away into the sky · the clouds sink · the arc rises
 *   and swings forward while a subtitle names each product as it faces
 *   camera · the sky turns to dusk and the proof counts up (and un-counts if
 *   you scroll back).
 *
 * Mechanics worth knowing before editing:
 *   · The stage is CSS `position: sticky` inside a tall track, not a GSAP pin,
 *     so no pin-spacer is inserted and Lenis' native scroll is untouched.
 *   · Pointer parallax lives on outer wrappers (`data-px`); scroll and intro
 *     tweens on inner elements, so the two never fight over a transform.
 *   · GSAP owns the transforms of anything it centres (sun, ring cards):
 *     Tailwind translate utilities and GSAP both write `transform`.
 *   · Hidden-before-play states are in CSS (`.cine` in globals.css) under
 *     `prefers-reduced-motion: no-preference`; reduced motion gets a still.
 *   · Act two is built after act one completes — a scroll timeline records
 *     start values on creation, and built earlier it would record the hidden
 *     pre-intro frame.
 *   · `data-hero-cine` on <html> keeps the nav transparent over the stage;
 *     `data-hero-scrub` drops its backdrop blur while frames are scrubbing.
 */

const PRODUCTS = [
  "Arrow HR & Payroll",
  "Arrow Higher Education Management System",
  "Arrow Ticketing System",
  "Arrow CRM",
  "Arrow Uni Connect",
  "Arrow Workflow Management System",
  "Arrow School Management System",
];

/* Every real screenshot, interleaved so one product never sits beside itself. */
const CARDS: { src: string; product: number }[] = [
  ["workforce", 1, 0], ["education", 1, 1], ["ticketing", 1, 2], ["crm", 1, 3],
  ["uniconnect", 1, 4], ["workflow", 1, 5], ["school", 1, 6], ["workforce", 2, 0],
  ["education", 2, 1], ["ticketing", 2, 2], ["crm", 2, 3], ["uniconnect", 2, 4],
  ["workflow", 2, 5], ["school", 2, 6], ["crm", 3, 3], ["uniconnect", 3, 4],
].map(([key, n, product]) => ({ src: `/products/${key}/${n}.webp`, product: product as number }));

const METRICS = [
  { value: 20, suffix: "+", label: "Years of technology experience" },
  { value: 150, suffix: "+", label: "Organisations served" },
  { value: 10, suffix: "+", label: "Enterprise products" },
];

const TRUST_LOGOS = ["infomate", "central-bank", "ibsl", "dialog"];

const LINES = [
  { text: "Empowering People", soft: false },
  { text: "Enabling Growth", soft: true },
];

/** A headline line split into per-character spans, words kept unbreakable. */
function SplitLine({ text, soft }: { text: string; soft: boolean }) {
  const words = text.split(" ");
  return (
    <span className="block overflow-hidden pb-[0.1em]" style={{ perspective: "600px" }}>
      <span className={`block ${soft ? "text-[#ffe9d6]" : "text-white"}`}>
        {words.map((w, wi) => (
          <span key={wi} className="inline-block whitespace-nowrap">
            {[...w].map((ch, ci) => (
              <span key={ci} data-char className="cine-char inline-block will-change-transform">
                {ch}
              </span>
            ))}
            {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * A cloud bank: fractal noise turned into soft white cumulus by thresholding
 * its alpha, faded out toward the top. Generated, so there is no photo to
 * load and it stays crisp at any size.
 */
function CloudBank({ id, seed, density, className }: { id: string; seed: number; density: number; className: string }) {
  return (
    <svg aria-hidden className={className} preserveAspectRatio="none" viewBox="0 0 1600 500">
      <defs>
        <filter id={`${id}-f`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.0032 0.0085" numOctaves="5" seed={seed} />
          <feColorMatrix
            values={`0 0 0 0 1
                     0 0 0 0 0.97
                     0 0 0 0 0.93
                     ${density} 0 0 0 ${-density * 0.42}`}
          />
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id={`${id}-m`}>
          <rect width="1600" height="500" fill={`url(#${id}-g)`} />
        </mask>
      </defs>
      <rect width="1600" height="500" filter={`url(#${id}-f)`} mask={`url(#${id}-m)`} />
    </svg>
  );
}

export default function CinematicHero() {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    const root = document.documentElement;

    if (prefersReducedMotion()) {
      root.dataset.heroCine = "0";
      return;
    }

    const q = gsap.utils.selector(stage);
    const chars = q("[data-char]");
    const ring = q("[data-ring]")[0] as HTMLElement;
    const cards = q("[data-card]") as HTMLElement[];
    const counters = q("[data-count]") as HTMLElement[];
    const camera = q("[data-camera]")[0] as HTMLElement;
    const reel = q("[data-reel]")[0] as HTMLElement;
    const reelName = q("[data-reel-name]")[0] as HTMLElement;
    let reelTick: (() => void) | null = null;

    // `ctx` is read inside the intro's onComplete, which only fires after this assignment.
    const ctx: gsap.Context = gsap.context(() => {
      /* ── The arc: a ring seen from outside, so only its near half shows ── */
      const layoutRing = () => {
        const vw = window.innerWidth;
        const cardW = vw < 768 ? vw * 0.44 : Math.min(300, vw * 0.19);
        const radius = (cardW * 1.06 * cards.length) / (2 * Math.PI);
        /* Written as a string, not gsap.set: GSAP always translates before it
           rotates, which would stack every card at the same point. */
        cards.forEach((c, i) => {
          c.style.width = `${cardW}px`;
          c.style.transform = `translate(-50%, -50%) rotateY(${(360 / cards.length) * i}deg) translateZ(${radius}px)`;
        });
        gsap.set(ring, { z: -radius });
      };
      layoutRing();

      /* ── Ambient: the carousel turns, the clouds drift, the sun breathes ── */
      gsap.to(ring, { rotationY: "-=360", duration: 110, ease: "none", repeat: -1 });
      gsap.to("[data-cloud-wrap=back] svg", { xPercent: -6, duration: 38, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to("[data-cloud-wrap=front] svg", { xPercent: 7, duration: 26, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to("[data-sun-core]", { scale: 1.06, opacity: 0.9, duration: 5, ease: "sine.inOut", yoyo: true, repeat: -1 });

      /* ── ACT ONE ──────────────────────────────────────────────────────── */
      const intro = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
      intro
        /* morning haze burns off */
        .fromTo("[data-haze]", { opacity: 1 }, { opacity: 0, duration: 1.8, ease: "power2.inOut" }, 0)
        /* crane: the camera starts high and close, and settles onto the shot */
        .fromTo(
          camera,
          { scale: 1.18, rotationX: 8, yPercent: 4, transformPerspective: 1200 },
          { scale: 1, rotationX: 0, yPercent: 0, duration: 3.4, ease: "power3.out" },
          0
        )
        .fromTo("[data-sun]", { xPercent: -50, yPercent: -30, scale: 0.8, opacity: 0 }, { xPercent: -50, yPercent: -50, scale: 1, opacity: 1, duration: 2.8 }, 0.1)
        .fromTo("[data-cloud-wrap=back]", { yPercent: 25, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 2.6, ease: "power3.out" }, 0.2)
        .fromTo("[data-cloud-wrap=front]", { yPercent: 45, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 2.8, ease: "power3.out" }, 0.35)
        .fromTo(
          chars,
          { yPercent: 110, rotationX: -70, opacity: 0, filter: "blur(10px)" },
          { yPercent: 0, rotationX: 0, opacity: 1, filter: "blur(0px)", duration: 1.2, stagger: 0.03 },
          0.7
        )
        .fromTo("[data-reveal]", { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.12 }, 1.5)
        .fromTo("[data-wall-lift]", { y: 140, opacity: 0 }, { y: 0, opacity: 1, duration: 2.2, ease: "power3.out" }, 1.2)
        .fromTo("[data-trust]", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1 }, 2.3)
        .to("[data-cue]", { opacity: 1, duration: 1 }, 2.8);

      intro.eventCallback("onComplete", () => {
        ctx.add(buildPush);
        /* a slow push-in that never quite stops — the camera is never locked off */
        ctx.add(() => gsap.to(camera, { scale: 1.03, duration: 16, ease: "sine.inOut", yoyo: true, repeat: -1 }));
      });

      const release = curtainActive() ? onCurtainLift(() => intro.play()) : (intro.play(), () => {});

      /* ── Pointer: depth parallax, magnetic actions ────────────────────── */
      const movers = (q("[data-px]") as HTMLElement[]).map((el) => {
        const d = parseFloat(el.dataset.px || "0");
        return {
          d,
          x: gsap.quickTo(el, "x", { duration: 1.2, ease: "power3.out" }),
          y: gsap.quickTo(el, "y", { duration: 1.2, ease: "power3.out" }),
        };
      });
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        movers.forEach((m) => {
          m.x(nx * m.d);
          m.y(ny * m.d);
        });
      };
      stage.addEventListener("pointermove", onMove);

      const magnets = (q("[data-magnetic]") as HTMLElement[]).map((el) => {
        const mx = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
        const my = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          mx((e.clientX - (r.left + r.width / 2)) * 0.3);
          my((e.clientY - (r.top + r.height / 2)) * 0.4);
        };
        const leave = () => {
          mx(0);
          my(0);
        };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        return () => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        };
      });

      /* ── ACT TWO ──────────────────────────────────────────────────────── */
      counters.forEach((c) => (c.textContent = "0"));
      /* Whether the nav sits over the hero, read straight from the scroll
         position. It can't wait for act two's ScrollTrigger: that is only
         built once the opening finishes, and a visitor who scrolls away
         before then would leave the nav stuck transparent over the page. */
      const navOverHero = () => {
        root.dataset.heroCine = window.scrollY < track.offsetHeight - window.innerHeight ? "1" : "0";
      };
      navOverHero();
      window.addEventListener("scroll", navOverHero, { passive: true });

      function buildPush() {
        const count = { v: 0 };
        const vh = window.innerHeight;

        const push = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: track,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            invalidateOnRefresh: true,
            onToggle: (self) => {
              root.dataset.heroCine = self.isActive ? "1" : "0";
            },
            onScrubComplete: () => {
              root.dataset.heroScrub = "0";
            },
            onUpdate: (self) => {
              root.dataset.heroScrub = self.isActive && self.getVelocity() !== 0 ? "1" : "0";
            },
          },
        });

        push
          /* the headline lifts away into the sky */
          .to("[data-cue]", { opacity: 0, duration: 0.05 }, 0)
          .to(
            chars,
            {
              yPercent: () => -gsap.utils.random(120, 320),
              xPercent: () => gsap.utils.random(-60, 60),
              rotation: () => gsap.utils.random(-25, 25),
              filter: "blur(6px)",
              opacity: 0,
              duration: 0.3,
              stagger: { each: 0.004, from: "center" },
              ease: "power2.in",
            },
            0
          )
          .to("[data-reveal]", { opacity: 0, y: -40, duration: 0.16, stagger: 0.03 }, 0)
          .to("[data-trust]", { opacity: 0, y: 20, duration: 0.12 }, 0)
          /* the clouds sink, the sun flares */
          .to("[data-cloud-wrap=front]", { yPercent: 60, opacity: 0.2, duration: 0.35, ease: "power2.in" }, 0.02)
          .to("[data-cloud-wrap=back]", { yPercent: 30, duration: 0.4 }, 0.04)
          .to("[data-sun]", { scale: 1.35, duration: 0.4 }, 0.04)
          /* the arc rises to centre and swings forward */
          .to("[data-wall-lift]", { y: () => -vh * 0.2, scale: 1.4, duration: 0.35, ease: "power2.inOut" }, 0.05)
          .to("[data-ring-spin]", { rotationY: -140, duration: 0.6, ease: "power1.inOut" }, 0.05)
          /* the reel: a subtitle names each product as it turns to camera */
          .to(reel, { opacity: 1, duration: 0.05 }, 0.12)
          .to(reel, { opacity: 0, duration: 0.05 }, 0.42)
          /* dusk: the sky darkens and the arc falls back */
          .to("[data-dusk]", { opacity: 0.94, duration: 0.14, ease: "power1.inOut" }, 0.42)
          .to("[data-wall-lift]", { scale: 0.85, y: () => -vh * 0.05, duration: 0.25, ease: "power2.inOut" }, 0.45)
          .to("[data-wall]", { opacity: 0.25, duration: 0.2 }, 0.47)
          /* the proof */
          .to("[data-stats]", { opacity: 1, duration: 0.1 }, 0.52)
          .fromTo("[data-metric]", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.2, stagger: 0.06, ease: "power3.out" }, 0.54)
          .fromTo("[data-metric-rule]", { scaleY: 0 }, { scaleY: 1, duration: 0.2, stagger: 0.06 }, 0.6)
          .fromTo(
            count,
            { v: 0 },
            {
              v: 1,
              duration: 0.3,
              onUpdate: () => {
                counters.forEach((c) => {
                  c.textContent = String(Math.round(Number(c.dataset.count) * count.v));
                });
              },
            },
            0.57
          )
          .to({}, { duration: 0.12 }); // hold the proof before the page moves on

        /* Which card is the one in front: measured, not derived. Perspective
           and the ring's tilt shift where a card appears, so the answer is the
           largest card nearest the middle of the frame. Sampled every few
           frames, and only while the subtitle is up. */
        let shown = -1;
        let frame = 0;
        reelTick = () => {
          if (++frame % 4 || Number(gsap.getProperty(reel, "opacity")) === 0) return;
          const cx = window.innerWidth / 2;
          let idx = -1;
          let best = -Infinity;
          cards.forEach((c, i) => {
            const r = c.getBoundingClientRect();
            if (r.width < 40) return;
            const score = r.width - Math.abs(r.left + r.width / 2 - cx) * 0.9;
            if (score > best) {
              best = score;
              idx = i;
            }
          });
          if (idx < 0) return;
          const product = CARDS[idx].product;
          if (product === shown) return;
          shown = product;
          reelName.textContent = PRODUCTS[product];
          gsap.fromTo(reelName, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.55, ease: "expo.out", overwrite: true });
        };
        gsap.ticker.add(reelTick);
      }

      const onResize = () => {
        layoutRing();
        ScrollTrigger.refresh();
      };
      window.addEventListener("resize", onResize);

      return () => {
        release();
        stage.removeEventListener("pointermove", onMove);
        magnets.forEach((off) => off());
        window.removeEventListener("resize", onResize);
        window.removeEventListener("scroll", navOverHero);
      };
    }, stage);

    return () => {
      if (reelTick) gsap.ticker.remove(reelTick);
      ctx.revert();
      root.dataset.heroCine = "0";
      root.dataset.heroScrub = "0";
    };
  }, []);

  return (
    <section ref={trackRef} id="home" className="cine relative h-[340vh] bg-[#ffdcb5] motion-reduce:h-auto">
      <div
        ref={stageRef}
        className="sticky top-0 h-[100svh] min-h-[640px] overflow-hidden text-white motion-reduce:relative motion-reduce:h-auto"
      >
        {/* The camera: every layer of the scene, so one transform moves the
            whole shot. Screen-space layers (subtitle, haze, grain) sit outside. */}
        <div data-camera className="absolute inset-0 motion-reduce:relative" style={{ transformOrigin: "50% 60%" }}>
          {/* ── Sky ── */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, #d63a06 0%, #ec5410 22%, #ff8236 46%, #ffb070 66%, #ffd4a6 82%, #ffe9d2 100%)",
            }}
          />

          {/* ── Sun, low behind the arc ── */}
          <div data-px="-10" aria-hidden className="pointer-events-none absolute inset-0">
            <div data-sun className="cine-sun absolute left-1/2 top-[70%] aspect-square w-[95vmax]">
              <div
                data-sun-core
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,252,240,0.95) 0%, rgba(255,226,170,0.75) 12%, rgba(255,190,120,0.35) 28%, transparent 55%)",
                }}
              />
            </div>
          </div>

          {/* ── Back cloud bank ── */}
          <div data-px="10" aria-hidden className="pointer-events-none absolute inset-0">
            <div data-cloud-wrap="back" className="cine-cloud absolute inset-x-[-15%] bottom-0 h-[62%]">
              <CloudBank id="cb" seed={7} density={2.4} className="absolute inset-0 h-full w-full opacity-80" />
            </div>
          </div>

          {/* ── Headline, copy, actions ── */}
          <div data-px="6" className="absolute inset-x-0 top-0 motion-reduce:relative">
            <div className="mx-auto flex max-w-5xl flex-col items-center px-6 pt-[clamp(108px,15vh,160px)] text-center motion-reduce:pb-32">
              <h1
                data-title
                className="font-spartan text-[2.5rem] font-medium leading-[1.02] tracking-[-0.035em] drop-shadow-[0_6px_30px_rgba(120,30,0,0.35)] sm:text-[3.3rem] md:text-[3.9rem] lg:text-[4.3rem] xl:text-[4.6rem]"
              >
                {LINES.map((l) => (
                  <SplitLine key={l.text} text={l.text} soft={l.soft} />
                ))}
              </h1>

              <p
                data-reveal
                className="cine-reveal mt-6 max-w-xl text-[0.95rem] leading-[1.7] text-white/90 drop-shadow-[0_2px_12px_rgba(120,30,0,0.35)] sm:text-[1.02rem]"
              >
                Intelligent business solutions and technology services designed to help organizations
                work smarter, grow faster, and create lasting impact.
              </p>

              <div data-reveal className="cine-reveal mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  prefetch={false}
                  data-magnetic
                  href="/contact"
                  className="inline-flex items-center rounded-full bg-[#2a0d03]/35 px-7 py-3.5 font-mono text-[12px] font-medium uppercase tracking-[0.16em] text-white ring-1 ring-white/30 backdrop-blur-md transition-colors hover:bg-[#2a0d03]/55"
                >
                  See Features
                </Link>
                <Link
                  prefetch={false}
                  data-magnetic
                  href="/solutions"
                  className="group inline-flex items-center gap-3 rounded-full bg-white py-1.5 pl-6 pr-1.5 font-mono text-[12px] font-semibold uppercase tracking-[0.16em] text-[#1a0a03] shadow-[0_10px_30px_-10px_rgba(120,30,0,0.6)] transition-colors hover:bg-[#fff4ea]"
                >
                  Get Started
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#140802] text-[#ff7a1a] transition-transform duration-300 group-hover:rotate-45">
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M5 11L11 5M6 5h5v5" />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* ── The arc of product screens ── */}
          <div data-px="16" className="pointer-events-none absolute inset-0 motion-reduce:hidden">
            <div data-wall className="cine-wall absolute inset-0" style={{ perspective: "1500px" }}>
              <div data-wall-lift className="cine-wall-lift absolute left-1/2 top-[71%] h-0 w-0" style={{ transformStyle: "preserve-3d" }}>
                <div style={{ transform: "rotateX(-7deg)", transformStyle: "preserve-3d" }}>
                  <div data-ring-spin style={{ transformStyle: "preserve-3d" }}>
                    <div data-ring className="relative" style={{ transformStyle: "preserve-3d" }}>
                      {CARDS.map((c, i) => (
                        <figure
                          key={i}
                          data-card
                          className="absolute left-0 top-0 aspect-[1.6] overflow-hidden rounded-[14px] bg-white ring-1 ring-white/70"
                          style={{
                            backfaceVisibility: "hidden",
                            boxShadow: "0 30px 60px -24px rgba(120,35,0,0.55), 0 0 0 4px rgba(255,255,255,0.18)",
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={withBasePath(c.src)}
                            alt=""
                            draggable={false}
                            className="h-full w-full select-none object-cover object-left-top"
                          />
                          {/* glass glare */}
                          <span
                            aria-hidden
                            className="absolute inset-0"
                            style={{ background: "linear-gradient(125deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 35%)" }}
                          />
                        </figure>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Front cloud bank, drifting across the foot of the arc ── */}
          <div data-px="26" aria-hidden className="pointer-events-none absolute inset-0 motion-reduce:hidden">
            <div data-cloud-wrap="front" className="cine-cloud absolute inset-x-[-20%] bottom-[-4%] h-[34%]">
              <CloudBank id="cf" seed={23} density={3} className="absolute inset-0 h-full w-full" />
            </div>
          </div>

          {/* ── Proof line ── */}
          <div data-trust className="cine-trust absolute inset-x-0 bottom-[5%] flex flex-col items-center gap-2.5 px-6 sm:flex-row sm:justify-center sm:gap-4">
            <div className="flex -space-x-2.5">
              {TRUST_LOGOS.map((l) => (
                <span key={l} className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white p-1 shadow-[0_4px_14px_-4px_rgba(120,35,0,0.5)] ring-2 ring-[#ffe9d2]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={withBasePath(`/clients/${l}.webp`)} alt="" className="h-full w-full object-contain" />
                </span>
              ))}
            </div>
            <p className="text-sm font-medium text-[#6b2306]">
              Trusted by <span className="font-bold">150+ organisations</span> across Sri Lanka
            </p>
          </div>

          {/* ── Dusk, for the proof ── */}
          <div
            data-dusk
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0"
            style={{ background: "linear-gradient(180deg, #0f0502 0%, #1c0904 55%, #3a1405 100%)" }}
          />

          {/* ── The proof ── */}
          <div data-stats className="cine-stats pointer-events-none absolute inset-0 flex items-center motion-reduce:relative motion-reduce:bg-[#140702] motion-reduce:py-24">
            <div className="mx-auto w-full max-w-6xl px-6 lg:px-12">
              <p className="mb-10 text-center text-sm font-medium text-white/55">Two decades of building for Sri Lankan enterprise</p>
              <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-0">
                {METRICS.map((m, i) => (
                  <div key={m.label} data-metric className="relative text-center sm:px-8">
                    {i > 0 && (
                      <span data-metric-rule className="absolute inset-y-2 left-0 hidden w-px origin-top bg-white/20 sm:block" />
                    )}
                    <p className="tnum font-heading text-[3.44rem] font-extrabold leading-[0.85] tracking-[-0.05em] sm:text-[4.3rem]">
                      <span data-count={m.value}>{m.value}</span>
                      <span className="text-orange">{m.suffix}</span>
                    </p>
                    <p className="mt-4 text-sm text-white/65 sm:text-base">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Screen space ── */}
        {/* the reel: a film subtitle naming the product facing camera */}
        <div data-reel className="pointer-events-none absolute inset-x-0 bottom-[12%] z-20 flex justify-center px-6 opacity-0">
          <div className="rounded-2xl bg-[#1a0802]/45 px-7 py-3 text-center backdrop-blur-md">
            <p className="text-[11px] font-semibold tracking-[0.32em] text-[#ffb070]">NOW SHOWING</p>
            <div className="mt-1 overflow-hidden pb-1">
              <p data-reel-name className="font-spartan text-[clamp(1.4rem,2.8vw,2.4rem)] font-semibold leading-tight tracking-[-0.01em] text-white">
                {PRODUCTS[0]}
              </p>
            </div>
          </div>
        </div>

        {/* morning haze the opening burns off */}
        <div data-haze aria-hidden className="cine-haze pointer-events-none absolute inset-0 z-30 bg-[#fff1e3] opacity-0 motion-reduce:hidden" />
        <div aria-hidden className="cine-grain pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay" />

        {/* scroll cue */}
        <div data-cue className="cine-cue pointer-events-none absolute bottom-6 right-8 z-30 hidden flex-col items-center gap-3 text-[10px] font-semibold tracking-[0.24em] text-[#6b2306] lg:flex">
          SCROLL
          <span className="relative h-10 w-px overflow-hidden bg-[#6b2306]/25">
            <span className="cine-cue-dot absolute inset-x-0 top-0 h-3 bg-[#6b2306]" />
          </span>
        </div>
      </div>
    </section>
  );
}
