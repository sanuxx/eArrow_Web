import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import IndustriesContent from "./IndustriesContent";

export const metadata: Metadata = {
  title: "Industries | eArrow",
  description:
    "Solutions designed for your industry — corporate, education, healthcare, financial services, manufacturing, retail, government and enterprise.",
};

export default function IndustriesPage() {
  return (
    <>
      <Nav />
      <main id="main" className="flex flex-1 flex-col">
        <IndustriesContent />
      </main>
      <Footer />
    </>
  );
}
