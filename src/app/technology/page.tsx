import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import TechnologyContent from "./TechnologyContent";

export const metadata: Metadata = {
  title: "Technology & Innovation | eArrow",
  description:
    "Built for today. Ready for what's next — AI, cloud, automation, analytics, APIs, cybersecurity, mobile and scalability.",
};

export default function TechnologyPage() {
  return (
    <>
      <Nav />
      <main id="main" className="flex flex-1 flex-col">
        <TechnologyContent />
      </main>
      <Footer />
    </>
  );
}
