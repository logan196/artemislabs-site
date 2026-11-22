import Hero from "@/components/Hero";
import ClientMarquee from "@/components/ClientMarquee";
import BanksySection from "@/components/BanksySection";
import UmapExplorer from "@/components/UmapExplorer";
import FoundationSection from "@/components/FoundationSection";
import WhatWeDo from "@/components/WhatWeDo";
import SpatialAgentsSection from "@/components/SpatialAgentsSection";
import CopilotSection from "@/components/CopilotSection";
import ToolsGrid from "@/components/ToolsGrid";
import StackMetro from "@/components/StackMetro";
import Cta from "@/components/Cta";

export default function Home() {
  return (
    <main className="grain">
      <div className="bg-sea" aria-hidden />
      <Hero />
      <ClientMarquee />
      <BanksySection />
      <WhatWeDo />
      <SpatialAgentsSection />
      <UmapExplorer />
      <FoundationSection />
      <CopilotSection />
      <ToolsGrid />
      <StackMetro />
      <Cta />
    </main>
  );
}
