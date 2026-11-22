import { Instrument_Serif, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// globals.css already points --font-mono at --font-jetbrains, but nothing ever
// loaded it, so every "mono" label on the site was falling back to the system
// face. Instrument Serif is the editorial display voice for the Option B hero.
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-editorial",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://artemislabs.bio"),
  title: "Artemis BioLabs · Computational Biology, Accelerated",
  description:
    "Computational biology support for spatial, single-cell, sequencing, imaging, and clinical studies.",
  icons: { icon: "artemis_mark.svg" },
  openGraph: {
    title: "Artemis BioLabs",
    description: "Every core service your lab needs. One AI-powered team. Computational biology, accelerated.",
    url: "https://artemislabs.bio",
    siteName: "Artemis BioLabs",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Artemis BioLabs lockup" }],
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`antialiased ${jetbrains.variable} ${serif.variable}`}>
      <body className="bg-ink text-snow font-sans overflow-x-hidden">
        {children}
        <Script src="/home-workbench-tour.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
