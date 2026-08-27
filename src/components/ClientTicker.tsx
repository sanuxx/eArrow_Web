"use client";

import Image from "next/image";
import { Marquee, CountUp } from "./motion-kit";
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

type Client = { name: string; short?: string; mono?: string; logo?: string };

const CLIENTS: Client[] = [
  { name: "John Keells Infomate", logo: withBasePath("/logos/infomate.png") },
  { name: "Sri Lanka Cricket" },
  {
    name: "Centre for Banking Studies (Central Bank of Sri Lanka)",
    short: "Centre for Banking Studies",
    logo: withBasePath("/logos/cbs.png"),
  },
  { name: "H Connect" },
  { name: "Housing Finance Company (HFC)", short: "Housing Finance Company" },
  {
    name: "Institute of Bankers of Sri Lanka (IBSL)",
    short: "Institute of Bankers of Sri Lanka",
    logo: withBasePath("/logos/ibsl.jpg"),
  },
  { name: "Chola" },
  { name: "Riviera Resort" },
  {
    name: "Sri Lanka Institute of Tourism & Hotel Management (SLITHM)",
    short: "SLITHM",
    logo: withBasePath("/logos/slithm.png"),
  },
  { name: "Switz" },
  { name: "KTS Logistics", mono: "KTS" },
  { name: "Aquinas College of Higher Studies", logo: withBasePath("/logos/aquinas.png") },
  {
    name: "International Institute of Health Sciences (IIHS)",
    short: "IIHS",
    mono: "IIHS",
  },
  { name: "Voyzant (Pvt) Ltd", short: "Voyzant" },
  {
    name: "Ceylon Chamber of Commerce – Import Section",
    short: "Ceylon Chamber of Commerce",
  },
  { name: "Sri Lanka German Business Council" },
  { name: "Traffic Data Centre" },
  { name: "Eduko Pathways" },
  { name: "Emerald Isle" },
  { name: "Sri Lanka Chamber of the Pharmaceutical Industry", mono: "SLCP" },
  { name: "Motha Confectionery" },
  { name: "Shilpa Advisors" },
  { name: "Nevil Nutri Foods" },
  { name: "Happy Hen" },
  { name: "Quality Latex Products" },
  { name: "Omacx Healthcare & Medmart Pharma", mono: "OM" },
  {
    name: "Prasara Washing Plant Dankotuwa (Pvt) Ltd",
    short: "Prasara Washing Plant",
  },
];

const STOPWORDS = new Set([
  "of", "the", "for", "and", "&", "a", "pvt", "ltd", "co", "company",
]);

/** Initials from the significant words of a name, capped at three. */
function monogram(name: string) {
  return name
    .replace(/\([^)]*\)/g, "")
    .split(/[\s–-]+/)
    .map((w) => w.replace(/[^\w]/g, ""))
    .filter((w) => w && !STOPWORDS.has(w.toLowerCase()))
    .slice(0, 3)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function Badge({ client, small = false }: { client: Client; small?: boolean }) {
  const label = client.short ?? client.name;
  const h = small ? "h-14" : "h-20";

  if (!client.logo) {
    return (
      <div
        title={client.name}
        className={`group mx-2 flex ${h} shrink-0 items-center gap-3.5 whitespace-nowrap rounded-card border border-border bg-surface px-5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-orange/40`}
      >
        {/*
          The monogram tile is neutral at rest and only warms on hover.

          Twenty-two of the twenty-seven clients have no artwork on disk, so
          when every one of those carried a filled orange tile the wall read as
          a grid of orange squares — and the five real logos, the only ones that
          are actually anyone's brand, were the quietest things in it.
        */}
        <span
          className={`flex shrink-0 items-center justify-center rounded-tile border border-border bg-surface-sunken font-mono font-bold text-ink-soft transition-colors duration-300 group-hover:border-transparent group-hover:bg-gradient-to-br group-hover:from-orange group-hover:to-amber group-hover:text-white ${
            small ? "h-8 w-8 text-[9px]" : "h-11 w-11 text-[11px]"
          }`}
        >
          {client.mono ?? monogram(client.name)}
        </span>
        <span
          className={`font-semibold text-ink-muted transition-colors duration-300 group-hover:text-ink ${
            small ? "text-[13px]" : "text-[15px]"
          }`}
        >
          {label}
        </span>
      </div>
    );
  }

  return (
    <div
      title={client.name}
      className={`mx-2 flex ${h} ${small ? "w-40" : "w-52"} shrink-0 items-center justify-center rounded-card border border-border bg-white p-4 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card)]`}
    >
      <Image
        src={client.logo}
        alt={client.name}
        width={208}
        height={80}
        className="h-full w-full object-contain"
      />
    </div>
  );
}

/*
 * The focal row takes every client with real artwork; the two receding rows
 * split the rest. Partitioned from the one list so a new client with a logo
 * lands in the lit row automatically.
 */
const WITH_LOGO = CLIENTS.filter((c) => c.logo);
const REST = CLIENTS.filter((c) => !c.logo);
const FOCAL = [...WITH_LOGO, ...REST.slice(0, 4)];
const BACK = REST.slice(4);
const BACK_TOP = BACK.slice(0, Math.ceil(BACK.length / 2));
const BACK_BOTTOM = BACK.slice(Math.ceil(BACK.length / 2));

export default function ClientTicker() {
  return (
    <section className="relative overflow-hidden bg-canvas pb-20 lg:pb-24">
      {/* The light on the stage — brightest behind the focal row. */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[130%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(var(--amber-ch), 0.16), transparent 68%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 text-center lg:px-12">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-soft">
          Trusted by
        </p>
        {/*
          The number is the strongest fact this section has and it was not being
          said. Counted from the list above rather than written down.
        */}
        <p className="mt-4 font-heading text-[2.75rem] font-extrabold leading-none tracking-[-0.04em] lg:text-[3.4rem]">
          <span className="bg-gradient-to-br from-orange to-amber bg-clip-text text-transparent">
            <CountUp value={`${CLIENTS.length}`} />
          </span>
        </p>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-soft">
          Organizations across Sri Lanka
        </p>
      </div>

      {/* ── The stage: three rows on a focal plane ──────────────────────── */}
      <div className="relative mt-12 space-y-3.5">
        {/* Hairlines frame the band, so the rows read as running through a
            defined space rather than floating on the page. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border-strong to-transparent"
        />

        <div className="opacity-50">
          <Marquee duration={84}>
            {BACK_TOP.map((c) => (
              <Badge key={c.name} client={c} small />
            ))}
          </Marquee>
        </div>

        <Marquee duration={54} reverse>
          {FOCAL.map((c) => (
            <Badge key={c.name} client={c} />
          ))}
        </Marquee>

        <div className="opacity-50">
          <Marquee duration={96}>
            {BACK_BOTTOM.map((c) => (
              <Badge key={c.name} client={c} small />
            ))}
          </Marquee>
        </div>

        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border-strong to-transparent"
        />
      </div>
    </section>
  );
}
