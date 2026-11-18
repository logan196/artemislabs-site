import Hero from "@/components/Hero";
import ClientMarquee from "@/components/ClientMarquee";
import CredStrip from "@/components/CredStrip";
import GbmUseCase from "@/components/GbmUseCase";
import UmapExplorer from "@/components/UmapExplorer";
import GenomeSection from "@/components/GenomeSection";
import TissueBand from "@/components/TissueBand";
import LiveHeViewer from "@/components/LiveHeViewer";
import CoreCapabilities from "@/components/CoreCapabilities";
import Cta from "@/components/Cta";
import AccessForms from "@/components/AccessForms";

// Homepage: living UMAP hero and logo strip, GBM use-case, tissue↔UMAP,
// live H&E viewer, genome browser and multiplexed tissue, eight cores, then the story, booking, and footer.
export default function Home() {
  return (
    <main className="grain">
      <div className="bg-sea" aria-hidden />
      <div className="min-h-[100svh] flex flex-col bg-ink">
        <Hero />
        <CredStrip />
        <ClientMarquee />
      </div>
      <GbmUseCase />
      <UmapExplorer />
      <LiveHeViewer />
      <GenomeSection />
      <TissueBand />
      <CoreCapabilities />
      <Cta />
      <AccessForms />
    </main>
  );
}
