import Hero from "@/components/Hero";
import ClientMarquee from "@/components/ClientMarquee";
import LoopSection from "@/components/LoopSection";
import BanksySection from "@/components/BanksySection";
import PrismaStory from "@/components/PrismaStory";
import SpatialPrograms from "@/components/SpatialPrograms";
import TissueBand from "@/components/TissueBand";
import UmapExplorer from "@/components/UmapExplorer";
import FoundationSection from "@/components/FoundationSection";
import WhatWeDo from "@/components/WhatWeDo";
import AgentTeam from "@/components/AgentTeam";
import CopilotSection from "@/components/CopilotSection";
import GenomeSection from "@/components/GenomeSection";
import ToolsGrid from "@/components/ToolsGrid";
import ToolGraph from "@/components/ToolGraph";
import Cta from "@/components/Cta";
import CredStrip from "@/components/CredStrip";
import AccessForms from "@/components/AccessForms";

// GbmGallery (embedded Explore viewer) and PortalFeature (portal screenshot)
// were retired from the landing page on 2026-11-17; the /live/ portals they
// linked to are still deployed and linked from the Spatial programs section.
export default function Home() {
  return (
    <main className="grain">
      <div className="bg-sea" aria-hidden />
      <Hero />
      <CredStrip />
      <ClientMarquee />
      <LoopSection />
      <BanksySection />
      <PrismaStory />
      <SpatialPrograms />
      <TissueBand />
      <WhatWeDo />
      <AgentTeam />
      <GenomeSection />
      <UmapExplorer />
      <FoundationSection />
      <CopilotSection />
      <ToolsGrid />
      <ToolGraph />
      <Cta />
      <AccessForms />
    </main>
  );
}
