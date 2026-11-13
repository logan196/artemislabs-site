import Hero from "@/components/Hero";
import PipelineFlow from "@/components/PipelineFlow";
import BanksySection from "@/components/BanksySection";
import GbmGallery from "@/components/GbmGallery";
import CopilotSection from "@/components/CopilotSection";
import ToolsGrid from "@/components/ToolsGrid";
import Cta from "@/components/Cta";

export default function Home() {
  return (
    <main className="grain">
      <div className="bg-sea" aria-hidden />
      <Hero />
      <PipelineFlow />
      <BanksySection />
      <GbmGallery />
      <CopilotSection />
      <ToolsGrid />
      <Cta />
    </main>
  );
}
