"use client";

import { PageCta } from "@/components/page-kit";
import CustomerSuccessHero from "./CustomerSuccessHero";
import StoryPath from "./StoryPath";
import CaseStudy from "./CaseStudy";

/*
 * From the brief's "Customer Success" sheet.
 *
 * The sheet is explicit that measurable results are only to be shown "where you
 * have verified figures" — so this page deliberately ships no metrics. The one
 * case study is the worked example the sheet itself gives, told as a before and
 * after rather than with invented percentages. Real numbers belong here once
 * the client supplies verified ones.
 *
 * ── The shape of the page ──
 * Dark masthead, light middle, dark case study. The alternation is the point:
 * three dark bands in a row is a mood rather than a sequence, and the bright
 * middle is what makes the case study land as the thing it was building to.
 *
 * The masthead is `tone="dark"`, which is the first one on the site — see the
 * note in page-kit's `PageHero` about how it tells the fixed header to turn its
 * links white while it is on screen.
 */

/* The four questions every story here answers. The question is set as the
   headline and the label demoted above it, because the questions are the
   interesting half — "Customer Challenge" is a filing category, "What problem
   did they have?" is the thing being asked. */
const STAGES = [
  {
    label: "Customer Challenge",
    question: "What problem did they have?",
    body: "The processes, systems and constraints exactly as they stood before we were involved.",
  },
  {
    label: "Our Solution",
    question: "What did eArrow implement?",
    body: "The platforms, modules and integrations put in place — and the reasoning for those over the alternatives.",
  },
  {
    label: "Transformation",
    question: "What changed?",
    body: "How the day-to-day work of the team is different now that the system is live and in their hands.",
  },
  {
    label: "Impact",
    question: "What did it measurably do?",
    body: "The outcome, reported against figures verified with the customer. Never estimated, never rounded up.",
  },
];

export default function CustomerSuccessContent() {
  return (
    <>
      <CustomerSuccessHero />

      <StoryPath stages={STAGES} />

      <CaseStudy />

      <PageCta
        title="Your operation could be the next story"
        body="Tell us what's slowing you down today, and we'll show you what the after looks like."
        primary={{ label: "Request a Consultation", href: "/contact" }}
        secondary={{ label: "Explore Industries", href: "/industries" }}
      />
    </>
  );
}
