import { Instrument_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument",
  display: "swap",
});

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
  title: "Artemis BioLabs",
  description:
    "Scientist-led computational biology for spatial, single-cell, imaging, and sequencing studies. Funded by Bill Gross.",
  icons: { icon: "artemis_mark.svg" },
  openGraph: {
    title: "Artemis BioLabs",
    description: "Your lab's computational team. Portals, figures, and code you can rerun.",
    url: "https://artemislabs.bio",
    siteName: "Artemis BioLabs",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Artemis BioLabs" }],
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`antialiased ${sans.variable} ${jetbrains.variable} ${serif.variable}`}>
      <body className="overflow-x-hidden bg-ink font-sans text-snow">{children}</body>
    </html>
  );
}
