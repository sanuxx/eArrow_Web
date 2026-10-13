import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProductsContent from "./ProductsContent";

export const metadata: Metadata = {
  title: "Products & Platforms | eArrow",
  description:
    "One ecosystem, multiple possibilities — HR & Payroll, Higher Education, School Management, Ticketing, CRM, Uni Connect and Workflow Management platforms.",
};

export default function ProductsPage() {
  return (
    <>
      <Nav />
      <main id="main" className="flex flex-1 flex-col">
        <ProductsContent />
      </main>
      <Footer />
    </>
  );
}
