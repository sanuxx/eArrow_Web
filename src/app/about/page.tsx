import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "About eArrow | Empowering Organisations Through Intelligent Technology",
  description:
    "eArrow is a technology solutions company focused on helping organisations simplify operations, improve efficiency, and accelerate digital transformation.",
};

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main id="main" className="flex flex-1 flex-col">
        <AboutContent />
      </main>
      <Footer />
    </>
  );
}
