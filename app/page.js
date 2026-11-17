import Hero from "@/components/Hero";
import ClientMarquee from "@/components/ClientMarquee";
import BanksySection from "@/components/BanksySection";
import PrismaStory from "@/components/PrismaStory";
import SpatialPrograms from "@/components/SpatialPrograms";
import TissueBand from "@/components/TissueBand";
import WhatWeDo from "@/components/WhatWeDo";
import LoopSection from "@/components/LoopSection";
import AgentTeam from "@/components/AgentTeam";
import GenomeSection from "@/components/GenomeSection";
import UmapExplorer from "@/components/UmapExplorer";
import FoundationSection from "@/components/FoundationSection";
import CopilotSection from "@/components/CopilotSection";
import ToolsGrid from "@/components/ToolsGrid";
import ToolGraph from "@/components/ToolGraph";
import Cta from "@/components/Cta";
import CredStrip from "@/components/CredStrip";
import AccessForms from "@/components/AccessForms";

// Section order follows the Nov 13 site (hero, logos, BANKSY, pipeline, GBM,
// tissue, cores, genomics, UMAP, foundation, copilot, tools, close).
// Kept from the redesign: credibility strip, compact process row (after the
// cores, not in front of the work), PhD-led team, spatial programs in place
// of the purple portal screenshots, no DTI section, one booking close.
export default function Home() {
  return (
    <main className="grain">
      <div className="bg-sea" aria-hidden />
      <Hero />
      <CredStrip />
      <ClientMarquee />
      <BanksySection />
      <PrismaStory />
      <SpatialPrograms />
      <TissueBand />
      <WhatWeDo />
      <LoopSection />
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
