import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact & Book a Demo | eArrow",
  description:
    "Talk to an expert, book a demo, request a consultation or request a proposal from the eArrow team.",
};

export default function ContactPage() {
  return (
    <>
      <Nav />
      <main id="main" className="flex flex-1 flex-col">
        <ContactContent />
      </main>
      <Footer />
    </>
  );
}
