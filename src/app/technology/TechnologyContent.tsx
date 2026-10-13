"use client";

import { PageCta } from "@/components/page-kit";
import TechnologyHero from "./TechnologyHero";
import StackSection from "./StackSection";

/*
 * Technology & Innovation — the brief's eight pillars, drawn as the stack they
 * actually are.
 *
 * The sheet lists AI, Cloud, Automation, Analytics, APIs, Cybersecurity, Mobile
 * and Scalability as a flat set, and the page rendered them as eight equal
 * tiles. But they are not peers, and showing them as peers is the reason the
 * page said nothing: mobile is what a user touches, cloud is what it stands on,
 * and no competent architecture treats those as the same kind of thing.
 *
 * So this is a layer diagram. Four tiers stacked foundation-upward, each
 * carrying the pillars that belong to it — and Cybersecurity pulled out as a
 * rail spanning every tier, because that is where security actually lives. A
 * visitor who reads architecture for a living will recognise the claim; one who
 * does not still gets a picture instead of a word list.
 *
 * The blueprint treatment — dark ground, drafting grid, mono annotations, tier
 * codes in the gutter — is deliberately unlike the other pages: the bento on
 * Solutions, the showcase rows on Products, the hover-wipe tiles on Industries.
 * This one should read as a schematic.
 */

type Layer = {
  code: string;
  tier: string;
  pillars: string[];
  note: string;
};

/* Ordered top-down as drawn: what the user touches first, the foundation last. */
const LAYERS: Layer[] = [
  {
    code: "L04",
    tier: "Experience",
    pillars: ["Mobile Technology"],
    note: "Self-service, approvals and dashboards that work wherever your people actually are, not just at a desk.",
  },
  {
    code: "L03",
    tier: "Intelligence",
    pillars: ["AI", "Automation", "Analytics"],
    note: "Assistants, intelligent workflows and live reporting, built on a single source of operational truth rather than five exports.",
  },
  {
    code: "L02",
    tier: "Integration",
    pillars: ["APIs & Integrations"],
    note: "Open interfaces so our platforms connect to the systems you already run, instead of asking you to replace them.",
  },
  {
    code: "L01",
    tier: "Platform",
    pillars: ["Cloud", "Scalability"],
    note: "Managed cloud that scales with demand, on architecture that holds its shape from one site to an enterprise estate.",
  },
];

const SECURITY = {
  name: "Cybersecurity",
  note: "Controlled access, auditable trails, backup and disaster recovery, applied at every tier rather than bolted onto one.",
};

export default function TechnologyContent() {
  return (
    <>
      <TechnologyHero />

      <StackSection layers={LAYERS} security={SECURITY} />

      <PageCta
        title="Bring the next decade forward."
        body="Talk to our architects about where AI, automation and cloud actually fit your operation, and where they don't yet."
        primary={{ label: "Request a Consultation", href: "/contact" }}
        secondary={{ label: "Explore Solutions", href: "/solutions" }}
      />
    </>
  );
}

