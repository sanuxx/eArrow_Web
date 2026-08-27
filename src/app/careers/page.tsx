import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CareersContent from "./CareersContent";

export const metadata: Metadata = {
  title: "Careers | eArrow",
  description:
    "Build technology that organisations actually run on. Culture, benefits, open positions and graduate opportunities at eArrow.",
};

export default function CareersPage() {
  return (
    <>
      <Nav />
      <main id="main" className="flex flex-1 flex-col">
        <CareersContent />
      </main>
      <Footer />
    </>
  );
}
