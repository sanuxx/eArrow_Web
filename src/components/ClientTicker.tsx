"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Marquee } from "./motion-kit";
import { withBasePath } from "@/lib/basePath";

/**
 * The client wall.
 *
 * This is the factual half of the social proof on this page — these are real
 * organisations and the logos are theirs — so it is worth staging properly.
 *
 * Three rows rather than two, on a focal plane: the middle row runs at full
 * size and full strength and carries every client whose actual logo is on
 * disk, while the rows above and below are smaller, dimmer and slower, and
 * carry the rest. That is the cinematic bit — depth of field, built from scale
 * and opacity rather than `filter: blur`, which would have to re-rasterise two
 * continuously translating rows every frame.
 *
 * The count is derived from the list, never typed, so it cannot drift as
 * clients are added.
 */

/*
 * Every client on this wall has a logo, and that is now enforced by the type.
 *
 * The list used to carry names with no artwork, rendered as a monogram tile
 * beside the text. Those are gone — the wall shows the marks that were
 * supplied and nothing else, so nothing on it is standing in for something
 * missing.
 *
 * Artwork lives in `/public/clients` as webp rather than in
 * `/public/client_logo` as the supplied PNGs. Those were 9.19MB across 36
 * files for a strip that draws each mark about 176px wide; re-encoded to the
 * box they are actually drawn in, and trimmed of the blank margin the
 * originals carry, the set ships at well under half a megabyte.
 *
 * One supplied file is deliberately absent: `client_logo/7.png`, a school
 * crest whose lettering is not legible at any size in the file. Every entry
 * here becomes an `alt` attribute on a real organisation's mark, so guessing
 * at the name is worse than leaving it out until someone can name it.
 *
 * If a client without artwork ever has to appear here again, this is the
 * commit to look at: `logo` becomes optional and `Badge` needs its text
 * branch back.
 */
type Client = { name: string; logo: string };

const CLIENTS: Client[] = [
  { name: "John Keells Infomate", logo: withBasePath("/clients/infomate.webp") },
  { name: "Sri Lanka Cricket", logo: withBasePath("/clients/sri-lanka-cricket.webp") },
  { name: "Centre for Banking Studies (Central Bank of Sri Lanka)", logo: withBasePath("/clients/central-bank.webp") },
  { name: "Institute of Bankers of Sri Lanka (IBSL)", logo: withBasePath("/clients/ibsl.webp") },
  { name: "Dialog", logo: withBasePath("/clients/dialog.webp") },
  { name: "DIMO", logo: withBasePath("/clients/dimo.webp") },
  { name: "Sri Lanka Air Force", logo: withBasePath("/clients/sri-lanka-air-force.webp") },
  { name: "Bar Association of Sri Lanka", logo: withBasePath("/clients/bar-association.webp") },
  { name: "Sri Lanka Red Cross Society", logo: withBasePath("/clients/red-cross.webp") },
  { name: "Ceylon Chamber of Commerce – Import Section", logo: withBasePath("/clients/ceylon-chamber.webp") },
  { name: "Sri Lanka Japan Business Council", logo: withBasePath("/clients/slj-business-council.webp") },
  { name: "Panasian Power PLC", logo: withBasePath("/clients/panasian-power.webp") },
  { name: "HRMI", logo: withBasePath("/clients/hrmi.webp") },
  { name: "Kreston Sri Lanka", logo: withBasePath("/clients/kreston.webp") },
  { name: "FICAC – World Federation of Consuls", logo: withBasePath("/clients/ficac.webp") },
  { name: "Anura Group of Companies", logo: withBasePath("/clients/anura-group.webp") },
  { name: "Damen", logo: withBasePath("/clients/damen.webp") },
  { name: "Polymath", logo: withBasePath("/clients/polymath.webp") },
  { name: "RWB International", logo: withBasePath("/clients/rwb-international.webp") },
  { name: "Green Goddess", logo: withBasePath("/clients/green-goddess.webp") },
  { name: "Ayubowan Gifts Collection", logo: withBasePath("/clients/ayubowan.webp") },
  { name: "CapSnap", logo: withBasePath("/clients/capsnap.webp") },
  { name: "Sri Lanka Institute of Tourism & Hotel Management (SLITHM)", logo: withBasePath("/clients/slithm.webp") },
  { name: "Gateway College", logo: withBasePath("/clients/gateway-college.webp") },
  { name: "Universal College Lanka", logo: withBasePath("/clients/ucl.webp") },
  { name: "Aquinas College of Higher Studies", logo: withBasePath("/clients/aquinas.webp") },
  { name: "International Institute of Health Sciences (IIHS)", logo: withBasePath("/clients/iihs.webp") },
  { name: "Eduko Pathways", logo: withBasePath("/clients/eduko.webp") },
  { name: "J.M. Wickramarachchi & Company (Pvt) Ltd", logo: withBasePath("/clients/wickramarachchi.webp") },
  { name: "KTS Logistics", logo: withBasePath("/clients/kts-logistics.webp") },
  { name: "Medmart Pharma", logo: withBasePath("/clients/medmart.webp") },
  { name: "Motha Confectionery", logo: withBasePath("/clients/motha.webp") },
  { name: "Happy Hen", logo: withBasePath("/clients/happy-hen.webp") },
  { name: "Emerald Hospitality", logo: withBasePath("/clients/emerald-hospitality.webp") },
  { name: "Prasara Washing Plant Dankotuwa (Pvt) Ltd", logo: withBasePath("/clients/prasara.webp") },
];

function Badge({ client, size = "md" }: { client: Client; size?: "lg" | "md" | "sm" }) {
  /*
   * Taller than the original 80px, because the wall is now entirely artwork.
   * `object-contain` fits a mark to whichever edge binds first, so at 80px
   * with 16px of padding a square crest rendered 48px wide while a wordmark
   * spanned the full 176px. The extra height is what evens those two out
   * without stretching either.
   */
  const box = { lg: "h-28 w-60 p-4", md: "h-24 w-52 p-3.5", sm: "h-16 w-40 p-3" }[size];

  return (
    <div
      title={client.name}
      className={`client-panel mx-2 flex ${box} shrink-0 items-center justify-center rounded-card bg-white transition-all duration-300 hover:-translate-y-1`}
    >
      <Image
        src={client.logo}
        alt={client.name}
        width={208}
        height={96}
        className="h-full w-full object-contain"
      />
    </div>
  );
}

/*
 * Three rows on a focal plane: the lit row in front, two smaller and dimmer
 * ones behind it.
 *
 * Dealt from the single list rather than filtered by some property of the
 * clients, which is what it used to do — the old rule put every client with
 * artwork in the front row, and once they all had artwork that meant one row
 * of thirty-five and two empty ones. Splitting by position keeps all three
 * populated at any list length, and a marquee only loops seamlessly when it
 * holds enough to cover the width twice.
 */
/* The headline clients, by request: they take the lit front row on desktop
   and lead the grid on phones. Listed by name so the order is deliberate. */
const FEATURED_NAMES = [
  "Ceylon Chamber of Commerce – Import Section",
  "Centre for Banking Studies (Central Bank of Sri Lanka)",
  "John Keells Infomate",
  "Institute of Bankers of Sri Lanka (IBSL)",
  "Sri Lanka Cricket",
  "Dialog",
  "DIMO",
  "Motha Confectionery",
  "Sri Lanka Air Force",
];
const FEATURED = FEATURED_NAMES.map((n) => CLIENTS.find((c) => c.name === n)).filter((c): c is Client => !!c);
const REST = CLIENTS.filter((c) => !FEATURED_NAMES.includes(c.name));
const BACK_TOP = REST.slice(0, Math.ceil(REST.length / 2));
const BACK_BOTTOM = REST.slice(Math.ceil(REST.length / 2));

/*
 * Phones: a turning wall.
 *
 * Thirty-five marks in a grid were a mess at phone width, and a moving row
 * only ever shows two or three. Instead: nine equal tiles, opening on the
 * featured clients, and every so often one tile flips over to the next client
 * — so every organisation comes round, while the screen only ever holds nine
 * calm tiles. It turns only while on screen; under reduced motion it stays on
 * the featured nine.
 */
const WALL = [...FEATURED, ...REST];
const TILES = 9;

function FlipWall() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState<number[]>(() => Array.from({ length: TILES }, (_, i) => i));
  const [turns, setTurns] = useState<number[]>(() => Array(TILES).fill(0));

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let visible = false;
    let next = TILES;
    let last = -1;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    const timer = setInterval(() => {
      if (!visible) return;
      let tile = Math.floor(Math.random() * TILES);
      if (tile === last) tile = (tile + 4) % TILES;
      last = tile;
      setShown((s) => {
        let pick = next % WALL.length;
        while (s.includes(pick)) pick = (pick + 1) % WALL.length;
        next = pick + 1;
        const copy = [...s];
        copy[tile] = pick;
        return copy;
      });
      setTurns((t) => t.map((n, i) => (i === tile ? n + 1 : n)));
    }, 1300);
    return () => {
      clearInterval(timer);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className="relative mx-auto mt-10 max-w-sm px-6 md:hidden">
      <ul className="grid grid-cols-3 gap-3">
        {shown.map((idx, t) => {
          const c = WALL[idx];
          return (
            <li key={t} className="client-panel relative aspect-square overflow-hidden rounded-2xl bg-white [perspective:600px]">
              <div key={turns[t]} className="logo-flip absolute inset-0 flex items-center justify-center p-3">
                <Image src={c.logo} alt={c.name} width={140} height={140} className="h-full w-full object-contain" />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-6 text-center font-mono text-[11px] uppercase tracking-[0.28em] text-white/45">
        All {WALL.length} clients turn through the wall
      </p>
    </div>
  );
}

export default function ClientTicker() {
  return (
    /*
     * The wall is staged on a dark ground, and that is the whole idea.
     *
     * Thirty-five marks on white were thirty-five white cards on white — the
     * panels had nothing to be panels against, so the section read as a list
     * that happened to scroll. On near-black the same cards become lit
     * objects: the logos are the only bright thing in the frame, which is
     * exactly the claim the section is making.
     *
     * `#0a0a0c` rather than the hero's flat black, so the two dark moments on
     * this page are not the same dark.
     */
    <section
      className="on-black grain relative overflow-hidden py-16 lg:py-24"
      style={{ background: "#0a0a0c" }}
    >
      {/* The house light — warm, low, and behind everything. */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[150%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(var(--orange-ch), 0.22), rgba(var(--amber-ch), 0.08) 45%, transparent 70%)",
        }}
      />

      {/*
        A second light that travels the wall, so the stage is never evenly lit.
        It sits behind the rows rather than over them: a blend mode across
        thirty-five white panels either does nothing (screen, overlay) or
        stains every logo (multiply), whereas moving the light itself changes
        what the panels sit in without touching the artwork at all.
      */}
      <span aria-hidden className="client-sweep" />

      <div className="relative mx-auto max-w-7xl px-6 text-center lg:px-12">
        <p className="mx-auto max-w-xl font-heading text-[1.15rem] font-semibold leading-snug tracking-[-0.01em] text-white/85 sm:text-[1.35rem]">
          Proud to power progress for businesses that trust us.
        </p>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.3em] text-white/55">
          Organizations across Sri Lanka
        </p>
      </div>

      {/* ── The stage: three rows on a focal plane ──────────────────────── */}
      <div className="client-wall relative mt-14 hidden space-y-3.5 md:block">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
        />

        {/*
          Depth on the receding rows is scale and a *slight* dim, not the half
          opacity this used on the white ground. Fading a white card to 45% over
          white merely softens it; over near-black the same value composites to
          a mid grey, so the back rows stopped reading as panels further from
          the light and started reading as dirty ones. Most of the recession is
          carried by size and by the light falling off toward the frame edges.

          Each row also fades out into the ground at both edges instead of being
          cut by `overflow: hidden`. A hard edge tells the reader the row stops
          there; a soft one lets the marks arrive out of the dark and leave
          into it, which is most of what makes the wall feel like it continues
          past the frame.
        */}
        <div className="client-row client-row--back">
          <Marquee duration={84}>
            {BACK_TOP.map((c) => (
              <Badge key={c.name} client={c} size="sm" />
            ))}
          </Marquee>
        </div>

        <div className="client-row">
          <Marquee duration={54} reverse>
            {FEATURED.map((c) => (
              <Badge key={c.name} client={c} size="lg" />
            ))}
          </Marquee>
        </div>

        <div className="client-row client-row--back">
          <Marquee duration={96}>
            {BACK_BOTTOM.map((c) => (
              <Badge key={c.name} client={c} size="sm" />
            ))}
          </Marquee>
        </div>

        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
        />
      </div>

      {/* Phones: the turning wall (below) */}
      <FlipWall />
    </section>
  );
}
