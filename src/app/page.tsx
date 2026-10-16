import dynamic from "next/dynamic";
import Nav from "@/components/Nav";
import CinematicHero from "@/components/hero/CinematicHero";
import ClientTicker from "@/components/ClientTicker";
import Solutions from "@/components/Solutions";
import TickerBand from "@/components/TickerBand";
import { FEATURES } from "@/lib/features";

/* Below-the-fold sections are split out of the initial bundle. They still
   server-render into the static HTML, but their JS (GSAP dashboard, framer
   scroll effects) loads after the hero instead of competing with it. */
const ProductEcosystem = dynamic(() => import("@/components/ProductEcosystem"));
const FeaturedProduct = dynamic(() => import("@/components/FeaturedProduct"));
const WhyEarrow = dynamic(() => import("@/components/WhyEarrow"));
const Insights = dynamic(() => import("@/components/Insights"));
const FinalCta = dynamic(() => import("@/components/FinalCta"));
const Footer = dynamic(() => import("@/components/Footer"));

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main" className="flex flex-1 flex-col">
        {/* Section order follows the revamp brief: white through §06, black
            for Industries, back to white, then the orange CTA. The two
            tickers sit at the seams — client logos under the stats, and the
            brand wordmark band as the transition into the black section.

            Hero and Stats are one unit now. HeroAct pins itself and opens an
            aperture onto the stats, so the metrics are revealed *through* the
            hero rather than scrolled to after it — which means Stats has to be
            composed inside it rather than listed here. */}
        <CinematicHero />
        <ClientTicker />
        <Solutions />
        <ProductEcosystem />
        <FeaturedProduct />
        <TickerBand />
        <WhyEarrow />
        {/* Hidden while FEATURES.insights is off — see src/lib/features.ts */}
        {FEATURES.insights && <Insights />}
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
