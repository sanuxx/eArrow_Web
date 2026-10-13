import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { notFound } from "next/navigation";
import InsightsContent from "./InsightsContent";
import { FEATURES } from "@/lib/features";

export const metadata: Metadata = {
  title: "Insights | eArrow",
  description:
    "Perspectives on HR technology, AI, digital transformation, payroll, education technology, industry trends and company news.",
};

export default function InsightsPage() {
  /* Disabled for now — set FEATURES.insights to true in src/lib/features.ts */
  if (!FEATURES.insights) notFound();
  return (
    <>
      <Nav />
      <main id="main" className="flex flex-1 flex-col">
        <InsightsContent />
      </main>
      <Footer />
    </>
  );
}
