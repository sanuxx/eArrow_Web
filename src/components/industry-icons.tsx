/**
 * Industry icons.
 *
 * These replace the emoji the brief's sheet used as shorthand (🏢 🎓 🏥 …).
 * Emoji are the one graphic on a page you do not control: they render as a
 * different artwork on every platform, carry their own colour straight through
 * the site's palette, and read as a placeholder next to type set this
 * deliberately.
 *
 * Drawn in the same stroke language as ArrowMark and the journey icons — a
 * 100×100 box, one weight, round caps and joins, `currentColor` throughout, so
 * a parent decides the colour and the hover state comes free.
 */

type Props = { className?: string };

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function Icon({ className, children }: Props & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden {...S}>
      {children}
    </svg>
  );
}

/** Corporate — an office block with lit floors. */
function Corporate({ className }: Props) {
  return (
    <Icon className={className}>
      <path d="M24 82V26a4 4 0 0 1 4-4h30a4 4 0 0 1 4 4v56" />
      <path d="M62 46h12a4 4 0 0 1 4 4v32" />
      <path d="M16 82h68M36 38h14M36 54h14M36 70h14" />
    </Icon>
  );
}

/** Education — a mortarboard. */
function Education({ className }: Props) {
  return (
    <Icon className={className}>
      <path d="M50 26 84 42 50 58 16 42z" />
      <path d="M30 50v18c0 6 9 10 20 10s20-4 20-10V50" />
      <path d="M84 42v20" />
    </Icon>
  );
}

/** Healthcare — a pulse trace. */
function Healthcare({ className }: Props) {
  return (
    <Icon className={className}>
      <path d="M16 52h14l8-18 12 36 9-24 6 14h19" />
    </Icon>
  );
}

/** Financial services — a payment card. */
function Financial({ className }: Props) {
  return (
    <Icon className={className}>
      <rect x="14" y="28" width="72" height="46" rx="10" />
      <path d="M14 44h72M28 60h14" />
    </Icon>
  );
}

/** Manufacturing — a plant with a stepped roofline. */
function Manufacturing({ className }: Props) {
  return (
    <Icon className={className}>
      <path d="M18 80V50l18 12V50l18 12V34h26v46" />
      <path d="M12 80h76" />
    </Icon>
  );
}

/** Retail — a shopping bag. */
function Retail({ className }: Props) {
  return (
    <Icon className={className}>
      <path d="M22 38h56l-5 40a6 6 0 0 1-6 5H33a6 6 0 0 1-6-5z" />
      <path d="M36 38v-6a14 14 0 0 1 28 0v6" />
    </Icon>
  );
}

/** Government — a columned hall. */
function Government({ className }: Props) {
  return (
    <Icon className={className}>
      <path d="M16 44 50 24l34 20" />
      <path d="M30 54v22M50 54v22M70 54v22" />
      <path d="M18 84h64" />
    </Icon>
  );
}

/** Other enterprises — a connected globe. */
function Enterprise({ className }: Props) {
  return (
    <Icon className={className}>
      <circle cx="50" cy="50" r="30" />
      <path d="M20 50h60" />
      <path d="M50 20c9 9 14 19 14 30s-5 21-14 30c-9-9-14-19-14-30s5-21 14-30z" />
    </Icon>
  );
}

export const INDUSTRY_ICONS = {
  corporate: Corporate,
  education: Education,
  healthcare: Healthcare,
  financial: Financial,
  manufacturing: Manufacturing,
  retail: Retail,
  government: Government,
  enterprise: Enterprise,
} as const;

export type IndustryIconKey = keyof typeof INDUSTRY_ICONS;
