"use client";

import Image from "next/image";
import { Marquee } from "./motion-kit";
import { withBasePath } from "@/lib/basePath";

/**
 * Infinite client ticker.
 *
 * Two rows running in opposite directions at different speeds — a single row
 * reads as a widget, counter-scrolling rows read as a system in motion. Only
 * five clients have artwork on disk; the rest render as monogram wordmarks
 * until logos are supplied.
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

function Badge({ client }: { client: Client }) {
  const label = client.short ?? client.name;

  if (!client.logo) {
    return (
      <div
        title={client.name}
        className="group mx-2.5 flex h-20 shrink-0 items-center gap-4 whitespace-nowrap rounded-card border border-border bg-surface px-6 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-orange/40"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-tile bg-gradient-to-br from-orange to-amber font-mono text-[11px] font-bold text-white">
          {client.mono ?? monogram(client.name)}
        </span>
        <span className="text-[15px] font-semibold text-ink-muted transition-colors duration-300 group-hover:text-ink">
          {label}
        </span>
      </div>
    );
  }

  return (
    <div
      title={client.name}
      className="mx-2.5 flex h-20 w-52 shrink-0 items-center justify-center rounded-card border border-border bg-white p-4 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
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

const HALF = Math.ceil(CLIENTS.length / 2);

export default function ClientTicker() {
  return (
    <section className="relative bg-canvas pb-24 lg:pb-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-ink-soft">
          Trusted by organizations across Sri Lanka
        </p>
      </div>

      <div className="mt-12 space-y-5">
        <Marquee duration={60}>
          {CLIENTS.slice(0, HALF).map((c) => (
            <Badge key={c.name} client={c} />
          ))}
        </Marquee>
        <Marquee duration={72} reverse>
          {CLIENTS.slice(HALF).map((c) => (
            <Badge key={c.name} client={c} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
