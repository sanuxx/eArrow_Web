"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

/*
 * Real product screenshots, shown on a drawn laptop.
 *
 * The screen is sized to the first screenshot's own ratio and the image is
 * contained, not covered, so nothing is trimmed from the edges or corners.
 *
 * Motion, all of it skipped for reduced-motion visitors:
 *   · the lid swings open the first time the laptop scrolls into view
 *   · the whole machine floats on a slow bob, its floor shadow breathing with it
 *   · it tilts a few degrees toward the pointer
 *
 * Products with several screenshots cycle through them. The rotation pauses
 * while the pointer or keyboard focus is on the laptop and while it is off
 * screen; the dots always work.
 */

export type Screen = { src: string; alt: string };

const INTERVAL_MS = 4500;
const DEFAULT_RATIO = 1.94;

export default function LaptopShowcase({ screens }: { screens: Screen[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-15% 0px" });
  const opened = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const multi = screens.length > 1;

  /* Pointer tilt: -0.5…0.5 across the box, sprung so it eases rather than snaps. */
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-7, 7]), { stiffness: 120, damping: 18 });
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [6, -2]), { stiffness: 120, damping: 18 });

  /* Fit the screen to the first screenshot's own shape so it is never cropped
     or letterboxed. Later screens share that shape so the lid doesn't jump. */
  const [ratio, setRatio] = useState(DEFAULT_RATIO);
  useEffect(() => {
    const img = new Image();
    img.onload = () => img.naturalHeight && setRatio(img.naturalWidth / img.naturalHeight);
    img.src = screens[0].src;
  }, [screens]);

  useEffect(() => {
    if (!multi || paused || !inView || reduce) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % screens.length), INTERVAL_MS);
    return () => clearTimeout(t);
  }, [index, multi, paused, inView, reduce, screens.length]);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };

  const onLeave = () => {
    setPaused(false);
    px.set(0);
    py.set(0);
  };

  const float = reduce
    ? {}
    : { y: [0, -9, 0], transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const } };

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full max-w-[660px] pb-2"
      style={{ perspective: "1800px" }}
      onPointerMove={onMove}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={onLeave}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <motion.div animate={float}>
        <motion.div
          style={reduce ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative"
        >
          {/* ── Lid ── */}
          <motion.div
            initial={reduce ? false : { rotateX: -78, opacity: 0.4 }}
            animate={opened || reduce ? { rotateX: 0, opacity: 1 } : undefined}
            transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            style={{ transformOrigin: "50% 100%" }}
            className="relative mx-auto w-[86%]"
          >
            {/* aluminium rim around the bezel */}
            <div className="rounded-t-[20px] bg-gradient-to-b from-[#d4d7dc] via-[#b9bdc4] to-[#9fa3aa] p-[3px] shadow-[0_40px_70px_-34px_rgba(0,0,0,0.6)]">
              {/* black glass bezel */}
              <div className="relative rounded-t-[17px] bg-[#0b0b0d] px-[2.2%] pb-[3.4%] pt-[3%]">
                {/* camera notch */}
                <span
                  aria-hidden
                  className="absolute left-1/2 top-0 flex h-[3.2%] min-h-[9px] w-[11%] -translate-x-1/2 items-center justify-center rounded-b-[7px] bg-[#0b0b0d]"
                >
                  <span className="h-[5px] w-[5px] rounded-full bg-[#1d2733] ring-1 ring-[#2a3442]" />
                </span>

                {/* screen */}
                <div
                  className="relative overflow-hidden bg-[#f4f4f5]"
                  style={{ aspectRatio: ratio }}
                >
                  <AnimatePresence initial={false}>
                    <motion.img
                      key={screens[index].src}
                      src={screens[index].src}
                      alt={screens[index].alt}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0 h-full w-full select-none object-contain"
                    />
                  </AnimatePresence>
                  {/* glass reflection */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(118deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 32%, rgba(255,255,255,0) 46%)",
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Hinge ── */}
          <div className="mx-auto h-[7px] w-[84%] rounded-b-[4px] bg-gradient-to-b from-[#2a2c30] via-[#4a4d53] to-[#6d7077]" />

          {/* ── Base ── */}
          <div className="relative -mt-[2px]">
            {/* top deck */}
            <div className="relative h-[11px] rounded-t-[3px] bg-gradient-to-b from-[#e6e8eb] via-[#cfd2d7] to-[#b4b8be] [[data-theme=dark]_&]:from-[#7a7d84] [[data-theme=dark]_&]:via-[#5f6268] [[data-theme=dark]_&]:to-[#45484e]">
              {/* finger notch */}
              <span
                aria-hidden
                className="absolute left-1/2 top-0 h-[5px] w-[15%] -translate-x-1/2 rounded-b-[8px] bg-gradient-to-b from-[#9a9ea5] to-[#c4c7cc] [[data-theme=dark]_&]:from-[#35373c] [[data-theme=dark]_&]:to-[#55585e]"
              />
              {/* specular edge */}
              <span aria-hidden className="absolute inset-x-[2%] top-0 h-px bg-white/70" />
            </div>
            {/* tapered front lip */}
            <div className="mx-auto h-[6px] w-[97%] rounded-b-[14px] bg-gradient-to-b from-[#9a9ea5] to-[#7c8088] [[data-theme=dark]_&]:from-[#3b3d42] [[data-theme=dark]_&]:to-[#26282c]" />
            {/* feet */}
            <span aria-hidden className="absolute -bottom-[2px] left-[8%] h-[3px] w-[7%] rounded-full bg-black/35" />
            <span aria-hidden className="absolute -bottom-[2px] right-[8%] h-[3px] w-[7%] rounded-full bg-black/35" />
          </div>
        </motion.div>
      </motion.div>

      {/* ── Floor shadow, tightening as the laptop rises ── */}
      <motion.div
        aria-hidden
        animate={
          reduce
            ? undefined
            : {
                scaleX: [1, 0.9, 1],
                opacity: [0.55, 0.35, 0.55],
                transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
              }
        }
        className="mx-auto mt-3 h-[20px] w-[88%] rounded-[50%] opacity-55 blur-[14px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(120,30,0,0.55), rgba(var(--orange-ch),0.35) 60%, transparent)",
        }}
      />

      {multi && (
        <div className="mt-4 flex justify-center gap-2">
          {screens.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show screen ${i + 1} of ${screens.length}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-orange" : "w-1.5 bg-ink-soft/40 hover:bg-ink-soft"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
