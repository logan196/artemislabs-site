import EmbedStage from "@/components/EmbedStage";

export const metadata = {
  title: "Artemis BioLabs · The Fable",
  robots: { index: false },
};

// Minimal chrome-free page for embedding the fable stage in other surfaces
// (the main-site homepage iframes this at the end of the page).
export default function FableEmbed() {
  return <EmbedStage />;
}
