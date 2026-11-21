import Hero from "@/components/Hero";
import ClientMarquee from "@/components/ClientMarquee";
import WhatWeDo from "@/components/WhatWeDo";
import GlowingGbm from "@/components/GlowingGbm";
import FounderTree from "@/components/FounderTree";
import PricingSection from "@/components/PricingSection";
import Cta from "@/components/Cta";

export default function Home() {
  return (
    <main className="grain">
      <Hero />
      <ClientMarquee />
      <WhatWeDo />
      <GlowingGbm />
      <FounderTree />
      <PricingSection />
      <Cta />
    </main>
  );
}
