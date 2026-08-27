import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import InsightsContent from "./InsightsContent";

export const metadata: Metadata = {
  title: "Insights | eArrow",
  description:
    "Perspectives on HR technology, AI, digital transformation, payroll, education technology, industry trends and company news.",
};

export default function InsightsPage() {
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
