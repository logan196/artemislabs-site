import Hero from "@/components/Hero";
import ClientMarquee from "@/components/ClientMarquee";
import BanksySection from "@/components/BanksySection";
import PrismaStory from "@/components/PrismaStory";
import GbmGallery from "@/components/GbmGallery";
import PortalFeature from "@/components/PortalFeature";
import TissueBand from "@/components/TissueBand";
import UmapExplorer from "@/components/UmapExplorer";
import FoundationSection from "@/components/FoundationSection";
import WhatWeDo from "@/components/WhatWeDo";
import CopilotSection from "@/components/CopilotSection";
import GenomeSection from "@/components/GenomeSection";
import ImagingSection from "@/components/ImagingSection";
import ToolsGrid from "@/components/ToolsGrid";
import ToolGraph from "@/components/ToolGraph";
import Cta from "@/components/Cta";

export default function Home() {
  return (
    <main className="grain">
      <div className="bg-sea" aria-hidden />
      <Hero />
      <ClientMarquee />
      <BanksySection />
      <PrismaStory />
      <GbmGallery />
      <PortalFeature />
      <TissueBand />
      <WhatWeDo />
      <GenomeSection />
      <ImagingSection />
      <UmapExplorer />
      <FoundationSection />
      <CopilotSection />
      <ToolsGrid />
      <ToolGraph />
      <Cta />
    </main>
  );
}
