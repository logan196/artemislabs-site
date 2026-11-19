import Hero from "@/components/Hero";
import TelemetryStrip from "@/components/TelemetryStrip";
import ClientMarquee from "@/components/ClientMarquee";
import BanksySection from "@/components/BanksySection";
import UmapExplorer from "@/components/UmapExplorer";
import GbmGallery from "@/components/GbmGallery";
import WhatWeDo from "@/components/WhatWeDo";
import SpatialAgentsSection from "@/components/SpatialAgentsSection";
import CopilotSection from "@/components/CopilotSection";
import ToolsGrid from "@/components/ToolsGrid";
import ToolGraph from "@/components/ToolGraph";
import FoundersSection from "@/components/FoundersSection";
import FableSection from "@/components/FableSection";
import SpecimenSection from "@/components/SpecimenSection";
import Cta from "@/components/Cta";

export default function Home() {
  return (
    <main className="grain">
      <div className="bg-sea" aria-hidden />
      <Hero />
      <TelemetryStrip />
      <ClientMarquee />
      <BanksySection />
      <GbmGallery />
      <WhatWeDo />
      <SpatialAgentsSection />
      <UmapExplorer />
      <CopilotSection />
      <ToolsGrid />
      <ToolGraph />
      <FoundersSection />
      <FableSection />
      <SpecimenSection />
      <Cta />
    </main>
  );
}
