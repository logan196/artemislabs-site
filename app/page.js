import Hero from "@/components/Hero";
import ClientMarquee from "@/components/ClientMarquee";
import UmapExplorer from "@/components/UmapExplorer";
import PrismaStory from "@/components/PrismaStory";
import WhatWeDo from "@/components/WhatWeDo";
import FoundersSection from "@/components/FoundersSection";
import UseCasesSection from "@/components/UseCasesSection";
import PortalFeature from "@/components/PortalFeature";
import SpatialAgentsSection from "@/components/SpatialAgentsSection";
import CopilotSection from "@/components/CopilotSection";
import ToolsGrid from "@/components/ToolsGrid";
import StackMetro from "@/components/StackMetro";
import FableSection from "@/components/FableSection";
import Cta from "@/components/Cta";

export default function Home() {
  return (
    <main className="grain">
      <div className="bg-sea" aria-hidden />
      <Hero />
      <ClientMarquee />
      <UmapExplorer />
      <PrismaStory />
      <WhatWeDo />
      <FoundersSection />
      <UseCasesSection />
      <PortalFeature />
      <SpatialAgentsSection />
      <CopilotSection />
      <ToolsGrid />
      <StackMetro />
      <FableSection />
      <Cta />
    </main>
  );
}
