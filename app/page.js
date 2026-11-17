import Hero from "@/components/Hero";
import ClientMarquee from "@/components/ClientMarquee";
import BanksySection from "@/components/BanksySection";
import SpatialPrograms from "@/components/SpatialPrograms";
import TissueBand from "@/components/TissueBand";
import WhatWeDo from "@/components/WhatWeDo";
import LoopSection from "@/components/LoopSection";
import AgentTeam from "@/components/AgentTeam";
import LivePortal from "@/components/LivePortal";
import GenomeSection from "@/components/GenomeSection";
import UmapExplorer from "@/components/UmapExplorer";
import FoundationSection from "@/components/FoundationSection";
import CopilotSection from "@/components/CopilotSection";
import ToolsGrid from "@/components/ToolsGrid";
import ToolGraph from "@/components/ToolGraph";
import Cta from "@/components/Cta";
import CredStrip from "@/components/CredStrip";
import AccessForms from "@/components/AccessForms";

// Opening stays the living UMAP hero, then the credibility strip and logos.
// The #pipeline scrollytelling section is removed. The live portal console
// is inserted after the agent team; the dodecahedron story stays in the close.
export default function Home() {
  return (
    <main className="grain">
      <div className="bg-sea" aria-hidden />
      <div className="min-h-[100svh] flex flex-col bg-ink">
        <Hero />
        <CredStrip />
        <ClientMarquee />
      </div>
      <BanksySection />
      <SpatialPrograms />
      <TissueBand />
      <WhatWeDo />
      <LoopSection />
      <AgentTeam />
      <LivePortal />
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
