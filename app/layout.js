import { Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const serif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Artemis BioLabs · Spatial Transcriptomics, Delivered",
  description:
    "Drop in a spatial dataset, get an interactive Vitessce portal — BANKSY clustering, cell-state annotation, and a local LLM copilot. Computational biology, delivered.",
  icons: { icon: "artemis_mark.svg" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${serif.variable} ${jetbrains.variable} antialiased`}>
      <body className="bg-ink text-snow font-sans overflow-x-hidden">{children}</body>
    </html>
  );
}
