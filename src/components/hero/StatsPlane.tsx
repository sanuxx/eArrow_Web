"use client";

/**
 * The proof, revealed *through* the hero.
 *
 * This is the real Stats content, composed inside the pinned hero act rather
 * than sitting below it — so "the next section is revealed through the hero" is
 * literally true: it is behind the hero the whole time, and the aperture in
 * `.hero-iris` opens onto it.
 *
 * The counters are rendered at their final values in JSX. That makes the server
 * render correct, makes reduced motion correct with no extra branch, and lets
 * the timeline count them by writing `textContent` directly — no React state, so
 * no re-render on a scrubbed frame. Because they run off scroll progress rather
 * than a one-shot rAF, scrolling back up un-counts them: the reveal is
 * something the visitor operates rather than something they watch.
 */

const METRICS = [
  { value: 20, suffix: "+", unit: "Years", caption: "Technology Experience" },
  { value: 150, suffix: "+", unit: "Customers", caption: "Organizations Served" },
  { value: 10, suffix: "+", unit: "Products", caption: "Enterprise Solutions" },
];

export default function StatsPlane({ ref }: { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className="hero-iris z-30 flex items-center bg-canvas"
      /*
        The closed aperture, for the frames before the hero timeline exists.
        Opposing edges sum to 100%, so the box has zero area and clips to
        nothing — the plane is present and laid out, but invisible.

        From hydration onward `renderDerived` in hero-timeline.ts writes
        `style.clipPath` directly and these stop being read. They are kept in
        sync with its p=0 output so the aperture cannot jump on handover.
      */
      style={
        {
          "--iris-t": "50%",
          "--iris-r": "29%",
          "--iris-b": "50%",
          "--iris-l": "71%",
          "--iris-round": "24px",
        } as React.CSSProperties
      }
    >
      {/* The clipped edge carries a brand ring and a lift shadow, so the
          aperture reads as a panel opening onto the next room rather than as a
          crossfade. Fades out once it is bigger than the frame. */}
      <span
        aria-hidden
        data-l="iris-edge"
        className="pointer-events-none absolute inset-0 rounded-[24px]"
        style={{
          opacity: 0,
          boxShadow: "var(--shadow-lift)",
          border: "1.5px solid transparent",
          borderImage: "linear-gradient(135deg, var(--color-orange), var(--color-amber)) 1",
        }}
      />

      <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-12">
        <div
          data-l="stats-row"
          className="grid grid-cols-1 gap-14 border-y border-border py-16 sm:grid-cols-3 sm:gap-8"
        >
          {METRICS.map((m, i) => (
            <div
              key={m.unit}
              data-l="metric"
              className={`relative text-center sm:text-left ${i > 0 ? "sm:pl-10" : ""}`}
            >
              {i > 0 && (
                <span
                  data-l="metric-rule"
                  className="absolute inset-y-0 left-0 hidden w-px origin-top bg-border sm:block"
                />
              )}

              <span className="mb-5 hidden font-mono text-[10px] uppercase tracking-[0.28em] text-ink-soft sm:block">
                0{i + 1}
              </span>

              <span className="tnum font-heading text-[4rem] font-extrabold leading-[0.85] tracking-[-0.05em] sm:text-[5rem]">
                {/* Brief §02/§11's logo gradient, #E83B00 -> #FFB13B. See the note
                  in globals.css: as text this sits below 3:1 against
                      the canvas, and the amber end managed only 1.81:1. */}
                  <span className="bg-gradient-to-br from-orange to-amber bg-clip-text text-transparent">
                  <span data-count-to={m.value}>{m.value}</span>
                  {m.suffix}
                </span>
              </span>

              <p className="mt-6 font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-ink">
                {m.unit}
              </p>
              <p className="mt-2 text-sm text-ink-muted">{m.caption}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
