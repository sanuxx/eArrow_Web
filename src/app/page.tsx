import Nav from "@/components/Nav";
import HeroAct from "@/components/hero/HeroAct";
import ClientTicker from "@/components/ClientTicker";
import Solutions from "@/components/Solutions";
import ProductEcosystem from "@/components/ProductEcosystem";
import FeaturedProduct from "@/components/FeaturedProduct";
import TickerBand from "@/components/TickerBand";
import Industries from "@/components/Industries";
import WhyEarrow from "@/components/WhyEarrow";
import Testimonials from "@/components/Testimonials";
import Insights from "@/components/Insights";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex flex-1 flex-col">
        {/* Section order follows the revamp brief: white through §06, black
            for Industries, back to white, then the orange CTA. The two
            tickers sit at the seams — client logos under the stats, and the
            brand wordmark band as the transition into the black section.

            Hero and Stats are one unit now. HeroAct pins itself and opens an
            aperture onto the stats, so the metrics are revealed *through* the
            hero rather than scrolled to after it — which means Stats has to be
            composed inside it rather than listed here. */}
        <HeroAct />
        <ClientTicker />
        <Solutions />
        <ProductEcosystem />
        <FeaturedProduct />
        <TickerBand />
        <Industries />
        <WhyEarrow />
        <Testimonials />
        <Insights />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
