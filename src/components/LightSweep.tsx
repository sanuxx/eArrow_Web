"use client";

/**
 * A specular highlight swept across an element, masked to a logo's own alpha
 * channel so the light reveals the *glyph's* shape rather than sliding across a
 * rectangle. Lifted out of the retired CinematicScene, which is where the idea
 * came from; it is now the moment the brand resolves.
 *
 * The mask lives in CSS and the bar is moved by GSAP from the hero timeline, so
 * this component renders markup only — no animation logic, no state. The target
 * is `[data-sweep]`.
 *
 * `tone` inverts polarity per theme, which matters more than it sounds: in
 * light mode the artwork is inverted to near-black by `--logo-filter`, so a
 * bright bar reads as a highlight. In dark mode the artwork is already white
 * and a bright bar is invisible — there, the sweep has to be a warm *shadow*
 * multiplied over the glyph.
 */
export default function LightSweep({
  mask,
  tone = "bright",
  className,
  animation,
}: {
  /** URL of the artwork whose alpha channel clips the sweep. */
  mask: string;
  tone?: "bright" | "warm";
  className?: string;
  /**
   * Optional CSS `animation` shorthand for the bar, for sweeps that run
   * themselves on a loop rather than being driven by the hero timeline. The
   * hero timeline scopes its own target to `[data-l='intro-wordmark']
   * [data-sweep]`, so a self-animating instance elsewhere does not collide with
   * it. Keyframes win over the inline `opacity`/`transform` below while they
   * run, so the authored rest state still applies when no animation is passed.
   */
  animation?: string;
}) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
      style={{
        maskImage: `url(${mask})`,
        WebkitMaskImage: `url(${mask})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    >
      <span
        data-sweep
        className="absolute inset-y-[-20%] w-[55%]"
        style={{
          opacity: 0,
          transform: "translateX(-140%)",
          filter: "blur(2px)",
          animation,
          background:
            tone === "bright"
              ? "linear-gradient(100deg, transparent 0%, rgba(255,214,150,0.85) 45%, rgba(255,255,255,0.96) 52%, transparent 100%)"
              : "linear-gradient(100deg, transparent 0%, rgba(var(--orange-ch), 0.55) 52%, transparent 100%)",
          mixBlendMode: tone === "warm" ? "multiply" : "normal",
        }}
      />
    </span>
  );
}
