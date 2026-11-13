import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Artemis Labs · Spatial Transcriptomics, Delivered",
  description:
    "Drop in a spatial dataset, get an interactive Vitessce portal — BANKSY clustering, GBM cell states, and a local LLM copilot. Computational biology, delivered.",
  icons: { icon: "artemis_icon.svg" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable} antialiased`}>
      <body className="bg-ink text-snow font-sans overflow-x-hidden">{children}</body>
    </html>
  );
}
