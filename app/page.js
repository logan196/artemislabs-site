import Hero from "@/components/Hero";
import ClientMarquee from "@/components/ClientMarquee";
import BanksySection from "@/components/BanksySection";
import PrismaStory from "@/components/PrismaStory";
import SpatialPrograms from "@/components/SpatialPrograms";
import TissueBand from "@/components/TissueBand";
import FigureBooklet from "@/components/FigureBooklet";
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

// Opening: living UMAP hero, credibility strip, logos, then BANKSY and the
// tissue↔UMAP explorer plus the PRISMA story. Live portal stays after the
// agent team. The nav does not link a separate Pipeline item.
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
      <UmapExplorer />
      <PrismaStory />
      <SpatialPrograms />
      <TissueBand />
      <FigureBooklet />
      <WhatWeDo />
      <LoopSection />
      <AgentTeam />
      <LivePortal />
      <GenomeSection />
      <FoundationSection />
      <CopilotSection />
      <ToolsGrid />
      <ToolGraph />
      <Cta />
      <AccessForms />
    </main>
  );
}
