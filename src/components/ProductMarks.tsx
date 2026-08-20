/**
 * Product marks.
 *
 * Every product in the ecosystem used to show the same artwork — the corporate
 * Q, reused seven times (`/logos/payroll.png`, whose trimmed content is
 * pixel-identical to the corporate mark). One logo standing in for seven
 * products says nothing about any of them, and a 500×403 raster scaled into a
 * 60px tile is soft on every display worth having.
 *
 * These replace it: seven distinct symbols, drawn as vectors so they stay crisp
 * at any size and take their colour from `currentColor` rather than needing a
 * filter to survive a theme change.
 *
 * What makes a set of marks read as professional is not the drawing, it is the
 * discipline underneath it — so every one of these obeys the same rules:
 *
 *   · one 48×48 grid, with the artwork optically inset to ~6 units
 *   · one stroke weight (2.8), one cap, one join — round, matching the rounded
 *     rectangle language of the identity
 *   · corner radii from the same family as the UI (6–11 units)
 *   · solid dots only where a stroke would blob at this weight
 *
 * The identity's arrow appears wherever it is the honest symbol — dispatch in
 * E-Billing, growth in Digital — rather than being bolted onto all seven, which
 * is how a mark set starts looking like clip art.
 */

type Props = { className?: string };

/** The one stroke spec every mark shares. Deviating from it is the whole risk. */
const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function Frame({ className, children }: Props & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      {children}
    </svg>
  );
}

/** WF-01 — the employee record: one card, one person, their data beside them. */
function WorkforceMark({ className }: Props) {
  return (
    <Frame className={className}>
      <rect x="6.5" y="10" width="35" height="28" rx="7" {...S} />
      <circle cx="18" cy="21.5" r="4" {...S} />
      <path d="M12 31.5c1.2-2.9 3.3-4.3 6-4.3s4.8 1.4 6 4.3" {...S} />
      <path d="M29.5 20h6.5M29.5 26h6.5M29.5 31.5h4" {...S} />
    </Frame>
  );
}

/** ED-02 — the mortarboard, tassel included, because without it it is a hat. */
function EducationMark({ className }: Props) {
  return (
    <Frame className={className}>
      <path d="M5.5 19.5 24 11l18.5 8.5L24 28z" {...S} />
      <path d="M13 23.5V32c0 2.7 4.9 4.9 11 4.9s11-2.2 11-4.9v-8.5" {...S} />
      <path d="M39.5 21.3v7.2" {...S} />
    </Frame>
  );
}

/** HC-03 — the cross, held inside the identity's rounded square. */
function HospitalMark({ className }: Props) {
  return (
    <Frame className={className}>
      <rect x="7" y="7" width="34" height="34" rx="11" {...S} />
      <path d="M24 16.5v15M16.5 24h15" {...S} />
    </Frame>
  );
}

/** MF-04 — the line: units on a belt, which is what production visibility is. */
function ProductionMark({ className }: Props) {
  return (
    <Frame className={className}>
      <rect x="6.5" y="28" width="35" height="10" rx="5" {...S} />
      <rect x="12.5" y="13" width="9.5" height="9.5" rx="3" {...S} />
      <rect x="26" y="13" width="9.5" height="9.5" rx="3" {...S} />
      <path d="M17.25 22.5v5.5M30.75 22.5v5.5" {...S} />
    </Frame>
  );
}

/** FN-05 — the statement, and the arrow that sends it. */
function BillingMark({ className }: Props) {
  return (
    <Frame className={className}>
      <rect x="10" y="7.5" width="28" height="33" rx="6" {...S} />
      <path d="M17 17h14M17 23h9" {...S} />
      <path d="M17 31.5h11M24.5 28l3.5 3.5-3.5 3.5" {...S} />
    </Frame>
  );
}

/** SC-06 — the shield: controlled, auditable access, in one glyph. */
function VisitorMark({ className }: Props) {
  return (
    <Frame className={className}>
      <path
        d="M24 7.5 39 12.6v10.6c0 8.5-5.9 14.8-15 17.3-9.1-2.5-15-8.8-15-17.3V12.6z"
        {...S}
      />
      <path d="M18 24.2l4.4 4.4L30.5 20" {...S} />
    </Frame>
  );
}

/** DX-07 — the window, and the identity's arrow doing what it means: growth. */
function DigitalMark({ className }: Props) {
  return (
    <Frame className={className}>
      <rect x="6.5" y="10" width="35" height="28" rx="7" {...S} />
      <path d="M6.5 18.5h35" {...S} />
      <circle cx="12.6" cy="14.3" r="1.35" fill="currentColor" />
      <circle cx="17.8" cy="14.3" r="1.35" fill="currentColor" />
      <path d="M13.5 32.5l6.5-6.5 4.5 4.5 9-9" {...S} />
      <path d="M28 21.5h5.5V27" {...S} />
    </Frame>
  );
}

/** Keyed by the product `key` in ProductEcosystem's PRODUCTS list. */
export const PRODUCT_MARKS: Record<string, (props: Props) => React.ReactElement> = {
  workforce: WorkforceMark,
  education: EducationMark,
  healthcare: HospitalMark,
  manufacturing: ProductionMark,
  billing: BillingMark,
  visitor: VisitorMark,
  digital: DigitalMark,
};
