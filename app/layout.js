import { Source_Serif_4, Inter, JetBrains_Mono, Schibsted_Grotesk } from "next/font/google";
import "./globals.css";

const serif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const grotesk = Schibsted_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://artemislabs.bio"),
  title: "Artemis BioLabs · Spatial, single-cell and genomics analysis",
  description:
    "Expert-grade spatial, single-cell and genomics analysis for every lab, not only the ones with a bioinformatics core. A PhD-led AI agent team, live portals, and a co-scientist in every portal.",
  icons: { icon: "artemis_mark.svg" },
  openGraph: {
    title: "Artemis BioLabs",
    description: "Expert-grade bioinformatics for every lab. A PhD-led AI agent team that turns your data into live, reviewable results.",
    url: "https://artemislabs.bio",
    siteName: "Artemis BioLabs",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Artemis BioLabs lockup" }],
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${serif.variable} ${inter.variable} ${jetbrains.variable} ${grotesk.variable} antialiased`}>
      <body className="bg-ink text-snow font-sans overflow-x-hidden">{children}</body>
    </html>
  );
}
