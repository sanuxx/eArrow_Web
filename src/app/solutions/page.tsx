import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SolutionsContent from "./SolutionsContent";

export const metadata: Metadata = {
  title: "Solutions | eArrow",
  description:
    "Run. Optimise. Grow. One technology partner for your business journey — HR, education, business management, CRM, AI, managed IT, digital and growth.",
};

export default function SolutionsPage() {
  return (
    <>
      <Nav />
      <main id="main" className="flex flex-1 flex-col">
        <SolutionsContent />
      </main>
      <Footer />
    </>
  );
}
