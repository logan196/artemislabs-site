import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://artemislabs.bio"),
  title: "Artemis BioLabs · Bioinformatics, Reimagined",
  description:
    "What if your data were delivered alive? Spatial, single-cell, and multi-omic analysis delivered as a living, interactive scientific instrument — not a static PDF.",
  icons: { icon: "artemis_mark.svg" },
  openGraph: {
    title: "Artemis BioLabs",
    description: "What if your data were delivered alive? Bioinformatics, reimagined.",
    url: "https://artemislabs.bio",
    siteName: "Artemis BioLabs",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Artemis BioLabs lockup" }],
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="antialiased">
      <body className="bg-ink text-snow font-sans overflow-x-hidden">{children}</body>
    </html>
  );
}
