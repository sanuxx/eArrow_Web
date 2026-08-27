import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CustomerSuccessContent from "./CustomerSuccessContent";

export const metadata: Metadata = {
  title: "Customer Success | eArrow",
  description:
    "Customer challenge, our solution, transformation, impact — how organisations moved from manual processes to connected digital operations.",
};

export default function CustomerSuccessPage() {
  return (
    <>
      <Nav />
      <main id="main" className="flex flex-1 flex-col">
        <CustomerSuccessContent />
      </main>
      <Footer />
    </>
  );
}
