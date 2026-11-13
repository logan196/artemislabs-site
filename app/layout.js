import { Source_Serif_4, JetBrains_Mono, Schibsted_Grotesk } from "next/font/google";
import "./globals.css";

const serif = Source_Serif_4({
  variable: "--font-serif",
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
  title: "Artemis BioLabs · Computational Biology, Accelerated",
  description:
    "Every core your biotech would build or rent — one AI-powered team. Live spatial portals, a 3.9M-cell brain atlas, CUT&RUN in a live genome browser, and a co-scientist in every portal. Computational biology, accelerated.",
  icons: { icon: "artemis_mark.svg" },
  openGraph: {
    title: "Artemis BioLabs",
    description: "Every core your biotech would build or rent. One AI-powered team. Computational biology, accelerated.",
    url: "https://artemislabs.bio",
    siteName: "Artemis BioLabs",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Artemis BioLabs lockup" }],
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${serif.variable} ${jetbrains.variable} ${grotesk.variable} antialiased`}>
      <body className="bg-ink text-snow font-sans overflow-x-hidden">{children}</body>
    </html>
  );
}
