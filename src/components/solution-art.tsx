/**
 * Illustration set for the Solutions page.
 *
 * The brief is explicit that solution cards must not be "ordinary rectangular
 * cards", and prescribes the material: white card + black typography + orange
 * gradient illustration. Nine capability groups shown as nine identical boxes
 * of grey pills was exactly the thing it rules out.
 *
 * Every drawing here is built from the same vocabulary as the logo — stacked
 * rounded rectangles, pills and discs on the orange→amber gradient — so nine
 * different pictures still read as one family. Each has a resting state and a
 * hover state; the parts move independently, which is what stops them looking
 * like clip art.
 *
 * Each moving part is its own `<g>`: a transform on the `<rect>` itself is
 * measured in user units, not CSS pixels, and would scale with the viewBox.
 */

type Props = { className?: string };

/** Shared gradient. Ids are per-variant so two drawings never collide. */
function Grad({ id, vertical = false }: { id: string; vertical?: boolean }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1={vertical ? 1 : 0} x2="1" y2={vertical ? 0 : 1}>
        <stop offset="0%" style={{ stopColor: "var(--color-orange)" }} />
        <stop offset="100%" style={{ stopColor: "var(--color-amber)" }} />
      </linearGradient>
    </defs>
  );
}

const BOX = "0 0 200 140";

/** Workforce — stacked employee rows that fan apart. */
function Workforce({ className }: Props) {
  return (
    <svg viewBox={BOX} fill="none" className={className} aria-hidden>
      <Grad id="art-wf" />
      <g className="transition-transform duration-700 ease-out group-hover:-translate-x-2">
        <rect x="20" y="18" width="120" height="26" rx="13" fill="url(#art-wf)" opacity="0.22" />
        <circle cx="156" cy="31" r="9" fill="url(#art-wf)" opacity="0.22" />
      </g>
      <g className="transition-transform duration-700 ease-out group-hover:translate-x-3">
        <rect x="20" y="57" width="120" height="26" rx="13" fill="url(#art-wf)" opacity="0.55" />
        <circle cx="156" cy="70" r="9" fill="url(#art-wf)" opacity="0.55" />
      </g>
      <g className="transition-transform duration-700 ease-out group-hover:-translate-x-1">
        <rect x="20" y="96" width="120" height="26" rx="13" fill="url(#art-wf)" />
        <circle cx="156" cy="109" r="9" fill="url(#art-wf)" />
      </g>
    </svg>
  );
}

/** Education — layered plates lifting into a mortarboard. */
function Education({ className }: Props) {
  return (
    <svg viewBox={BOX} fill="none" className={className} aria-hidden>
      <Grad id="art-ed" />
      <g className="transition-transform duration-700 ease-out group-hover:translate-y-1">
        <rect x="34" y="88" width="132" height="24" rx="12" fill="url(#art-ed)" opacity="0.2" />
      </g>
      <g className="transition-transform duration-700 ease-out">
        <rect x="46" y="60" width="108" height="24" rx="12" fill="url(#art-ed)" opacity="0.45" />
      </g>
      <g className="transition-transform duration-700 ease-out group-hover:-translate-y-2">
        <rect x="58" y="32" width="84" height="24" rx="12" fill="url(#art-ed)" />
        <circle cx="100" cy="20" r="7" fill="url(#art-ed)" opacity="0.7" />
      </g>
    </svg>
  );
}

/** Business management — a four-node workflow that links up on hover. */
function Workflow({ className }: Props) {
  return (
    <svg viewBox={BOX} fill="none" className={className} aria-hidden>
      <Grad id="art-bm" />
      <path
        d="M56 40h88M56 100h88M44 52v36M156 52v36"
        stroke="url(#art-bm)"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.3"
        className="transition-opacity duration-700 group-hover:opacity-70"
      />
      <g className="transition-transform duration-700 ease-out group-hover:-translate-x-1 group-hover:-translate-y-1">
        <rect x="20" y="22" width="48" height="36" rx="16" fill="url(#art-bm)" opacity="0.85" />
      </g>
      <g className="transition-transform duration-700 ease-out group-hover:translate-x-1 group-hover:-translate-y-1">
        <rect x="132" y="22" width="48" height="36" rx="16" fill="url(#art-bm)" opacity="0.35" />
      </g>
      <g className="transition-transform duration-700 ease-out group-hover:-translate-x-1 group-hover:translate-y-1">
        <rect x="20" y="82" width="48" height="36" rx="16" fill="url(#art-bm)" opacity="0.35" />
      </g>
      <g className="transition-transform duration-700 ease-out group-hover:translate-x-1 group-hover:translate-y-1">
        <rect x="132" y="82" width="48" height="36" rx="16" fill="url(#art-bm)" opacity="0.85" />
      </g>
    </svg>
  );
}

/** CRM — a pipeline narrowing to a won deal. */
function Funnel({ className }: Props) {
  const rows = [
    { w: 148, o: 0.22, d: 0 },
    { w: 116, o: 0.42, d: 70 },
    { w: 84, o: 0.68, d: 140 },
    { w: 52, o: 1, d: 210 },
  ];
  return (
    <svg viewBox={BOX} fill="none" className={className} aria-hidden>
      <Grad id="art-crm" />
      {rows.map((r, i) => (
        <g
          key={r.w}
          className="transition-transform duration-700 ease-out group-hover:translate-y-1"
          style={{ transitionDelay: `${r.d}ms` }}
        >
          <rect
            x={100 - r.w / 2}
            y={18 + i * 30}
            width={r.w}
            height="22"
            rx="11"
            fill="url(#art-crm)"
            opacity={r.o}
          />
        </g>
      ))}
    </svg>
  );
}

/** Ticketing — a queue of tickets that fans out. */
function Queue({ className }: Props) {
  const cards = [
    { x: 18, y: 34, o: 0.25, t: "group-hover:-translate-y-3" },
    { x: 52, y: 44, o: 0.5, t: "group-hover:-translate-y-1" },
    { x: 86, y: 54, o: 1, t: "group-hover:translate-y-1" },
  ];
  return (
    <svg viewBox={BOX} fill="none" className={className} aria-hidden>
      <Grad id="art-tk" />
      {cards.map((c, i) => (
        <g
          key={c.x}
          className={`transition-transform duration-700 ease-out ${c.t}`}
          style={{ transitionDelay: `${i * 60}ms` }}
        >
          <rect x={c.x} y={c.y} width="96" height="52" rx="20" fill="url(#art-tk)" opacity={c.o} />
        </g>
      ))}
    </svg>
  );
}

/** AI — satellites orbiting a core. */
const AI_NODES = [
  { cx: 100, cy: 26, r: 9 },
  { cx: 158, cy: 70, r: 7 },
  { cx: 100, cy: 114, r: 8 },
  { cx: 42, cy: 70, r: 7 },
];

function Intelligence({ className }: Props) {
  return (
    <svg viewBox={BOX} fill="none" className={className} aria-hidden>
      <Grad id="art-ai" />
      {AI_NODES.map((n) => (
        <line
          key={`l-${n.cx}-${n.cy}`}
          x1="100"
          y1="70"
          x2={n.cx}
          y2={n.cy}
          stroke="url(#art-ai)"
          strokeWidth="3"
          opacity="0.28"
          className="transition-opacity duration-700 group-hover:opacity-65"
        />
      ))}
      <g
        className="origin-center transition-transform duration-700 ease-out group-hover:scale-110"
        style={{ transformBox: "fill-box" }}
      >
        <rect x="76" y="50" width="48" height="40" rx="17" fill="url(#art-ai)" />
      </g>
      {AI_NODES.map((n, i) => (
        <g
          key={`n-${n.cx}-${n.cy}`}
          className="transition-transform duration-700 ease-out group-hover:scale-125"
          style={{ transformBox: "fill-box", transformOrigin: "center", transitionDelay: `${i * 60}ms` }}
        >
          <circle cx={n.cx} cy={n.cy} r={n.r} fill="url(#art-ai)" opacity="0.6" />
        </g>
      ))}
    </svg>
  );
}

/** Managed IT — concentric shells around a protected core. */
function Shells({ className }: Props) {
  return (
    <svg viewBox={BOX} fill="none" className={className} aria-hidden>
      <Grad id="art-it" />
      <g
        className="origin-center transition-transform duration-700 ease-out group-hover:scale-105"
        style={{ transformBox: "fill-box" }}
      >
        <rect x="18" y="14" width="164" height="112" rx="42" stroke="url(#art-it)" strokeWidth="7" opacity="0.18" />
      </g>
      <g
        className="origin-center transition-transform duration-700 ease-out group-hover:scale-[1.08]"
        style={{ transformBox: "fill-box" }}
      >
        <rect x="46" y="34" width="108" height="72" rx="30" stroke="url(#art-it)" strokeWidth="7" opacity="0.45" />
      </g>
      <g
        className="origin-center transition-transform duration-700 ease-out group-hover:scale-90"
        style={{ transformBox: "fill-box" }}
      >
        <rect x="76" y="52" width="48" height="36" rx="18" fill="url(#art-it)" />
      </g>
    </svg>
  );
}

/** Digital & web — a browser window assembling. */
function Window({ className }: Props) {
  return (
    <svg viewBox={BOX} fill="none" className={className} aria-hidden>
      <Grad id="art-dx" />
      <g className="transition-transform duration-700 ease-out group-hover:-translate-y-1">
        <rect x="22" y="18" width="156" height="104" rx="26" stroke="url(#art-dx)" strokeWidth="6" opacity="0.35" />
        <circle cx="44" cy="40" r="4.5" fill="url(#art-dx)" opacity="0.8" />
        <circle cx="58" cy="40" r="4.5" fill="url(#art-dx)" opacity="0.5" />
        <circle cx="72" cy="40" r="4.5" fill="url(#art-dx)" opacity="0.3" />
      </g>
      <g className="transition-transform duration-700 ease-out group-hover:translate-x-2">
        <rect x="42" y="60" width="60" height="18" rx="9" fill="url(#art-dx)" opacity="0.85" />
      </g>
      <g className="transition-transform duration-700 ease-out group-hover:-translate-x-1">
        <rect x="42" y="88" width="116" height="16" rx="8" fill="url(#art-dx)" opacity="0.3" />
      </g>
    </svg>
  );
}

/** Marketing — a growth curve told in the logo's pill shape. */
const BARS = [
  { x: 22, y: 88, h: 36, o: 0.28, lift: "group-hover:-translate-y-1" },
  { x: 66, y: 62, h: 62, o: 0.5, lift: "group-hover:-translate-y-2" },
  { x: 110, y: 36, h: 88, o: 0.75, lift: "group-hover:-translate-y-3" },
  { x: 154, y: 16, h: 108, o: 1, lift: "group-hover:-translate-y-4" },
];

function Growth({ className }: Props) {
  return (
    <svg viewBox={BOX} fill="none" className={className} aria-hidden>
      <Grad id="art-mk" vertical />
      {BARS.map((b, i) => (
        <g
          key={b.x}
          className={`transition-transform duration-700 ease-out ${b.lift}`}
          style={{ transitionDelay: `${i * 70}ms` }}
        >
          <rect x={b.x} y={b.y} width="26" height={b.h} rx="13" fill="url(#art-mk)" opacity={b.o} />
        </g>
      ))}
    </svg>
  );
}

export const SOLUTION_ART: Record<string, (props: Props) => React.ReactElement> = {
  workforce: Workforce,
  education: Education,
  workflow: Workflow,
  funnel: Funnel,
  queue: Queue,
  intelligence: Intelligence,
  shells: Shells,
  window: Window,
  growth: Growth,
};
