import Hero from "@/components/Hero";
import ClientMarquee from "@/components/ClientMarquee";
import PipelineFlow from "@/components/PipelineFlow";
import BanksySection from "@/components/BanksySection";
import GbmGallery from "@/components/GbmGallery";
import PortalFeature from "@/components/PortalFeature";
import DeJongSection from "@/components/DeJongSection";
import WhatWeDo from "@/components/WhatWeDo";
import CatalogSection from "@/components/CatalogSection";
import CopilotSection from "@/components/CopilotSection";
import ToolsGrid from "@/components/ToolsGrid";
import Cta from "@/components/Cta";

export default function Home() {
  return (
    <main className="grain">
      <div className="bg-sea" aria-hidden />
      <Hero />
      <ClientMarquee />
      <PipelineFlow />
      <BanksySection />
      <GbmGallery />
      <PortalFeature />
      <DeJongSection />
      <WhatWeDo />
      <CatalogSection />
      <CopilotSection />
      <ToolsGrid />
      <Cta />
    </main>
  );
}
